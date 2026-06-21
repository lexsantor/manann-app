"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import { MoveRight, AlertTriangle, Trash2, Ship, Plane, Truck, ImageOff, Loader2, Copy, type LucideIcon } from "lucide-react";
import { deleteDraftShipment, duplicateShipment } from "@/lib/erp-actions";

import { type ShipmentListItem } from "@/lib/erp";
import { portLabel, formatDate, MODE, formatMoney } from "@/lib/erp-format";
import { portImageUrl } from "@/lib/port-images";
import { StatusPill } from "@/components/app/status-pill";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/use-focus-trap";

// ─── Marca de naviera ────────────────────────────────────────────────────────

const CARRIER_COLORS: Record<string, string> = {
  MSC:          "bg-muted text-muted-foreground",
  MAERSK:       "bg-muted text-muted-foreground",
  "CMA CGM":    "bg-muted text-muted-foreground",
  "HAPAG-LLOYD":"bg-muted text-muted-foreground",
  COSCO:        "bg-muted text-muted-foreground",
  EVERGREEN:    "bg-muted text-muted-foreground",
  YANG_MING:    "bg-muted text-muted-foreground",
};

function CarrierBadge({ carrier }: { carrier: string }) {
  const cls =
    CARRIER_COLORS[carrier.toUpperCase()] ??
    "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide",
        cls,
      )}
    >
      {carrier}
    </span>
  );
}

// ─── Placeholder por modo de transporte ─────────────────────────────────────

const MODE_PLACEHOLDER: Record<string, { icon: LucideIcon; from: string; to: string }> = {
  maritimo:  { icon: Ship,  from: "from-sky-950",     to: "to-sky-800" },
  aereo:     { icon: Plane, from: "from-indigo-950",  to: "to-indigo-800" },
  terrestre: { icon: Truck, from: "from-emerald-950", to: "to-emerald-800" },
};

// ─── Progreso del trayecto ───────────────────────────────────────────────────

function journeyProgress(s: ShipmentListItem): number {
  switch (s.status) {
    case "borrador":    return 0;
    case "confirmado":  return 8;
    case "en_aduana":   return 90;
    case "entregado":
    case "cerrado":     return 100;
    case "en_transito": {
      if (!s.etd || !s.eta) return 50;
      const now   = Date.now();
      const start = s.etd.getTime();
      const end   = s.eta.getTime();
      if (now <= start) return 12;
      if (now >= end)   return 88;
      return Math.round(((now - start) / (end - start)) * 76) + 12;
    }
    default: return 0;
  }
}

// ─── ETA vencida ─────────────────────────────────────────────────────────────

const ETA_ACTIVE = ["confirmado", "en_transito", "en_aduana"];

function isEtaOverdue(eta: Date | null, status: string): boolean {
  if (!eta || !ETA_ACTIVE.includes(status)) return false;
  return eta < new Date();
}

// ─── Ciudad sin código LOCODE ────────────────────────────────────────────────

function cityOnly(locode: string | null): string {
  const label = portLabel(locode);
  const idx = label.indexOf(" · ");
  return idx !== -1 ? label.slice(0, idx) : label;
}

// ─── GP calculado desde cargos ───────────────────────────────────────────────

function computeGP(charges: ShipmentListItem["charges"]): { gp: number | null; hasAtRisk: boolean } {
  const revenues = charges.filter((c) => c.direction === "revenue");
  const costs = charges.filter((c) => c.direction === "cost");

  if (revenues.length === 0) return { gp: null, hasAtRisk: false };

  const totalSell = revenues.reduce((s, c) => s + Number(c.amount), 0);
  const hasAnyBuy = revenues.some((c) => c.buyAmount != null);
  const totalBuy = hasAnyBuy
    ? revenues.reduce((s, c) => s + (c.buyAmount != null ? Number(c.buyAmount) : 0), 0)
    : costs.reduce((s, c) => s + Number(c.amount), 0);

  if (!hasAnyBuy && costs.length === 0) return { gp: null, hasAtRisk: false };

  const hasAtRisk = revenues.some((c) => c.atRisk);
  return { gp: totalSell - totalBuy, hasAtRisk };
}

// ─── Boarding pass card ──────────────────────────────────────────────────────

export function ShipmentBoardingPass({ s }: { s: ShipmentListItem }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, showConfirm, () => setShowConfirm(false));
  const [hideImages, setHideImages] = useState(false);
  const [pending, startTransition] = useTransition();
  const [dupPending, startDupTransition] = useTransition();

  function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startDupTransition(async () => {
      await duplicateShipment(s.id);
    });
  }

  useEffect(() => {
    setHideImages(localStorage.getItem("hidePortImages") === "1");
    const handler = () => setHideImages(localStorage.getItem("hidePortImages") === "1");
    window.addEventListener("hidePortImagesChanged", handler);
    return () => window.removeEventListener("hidePortImagesChanged", handler);
  }, []);

  function toggleImages(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !hideImages;
    localStorage.setItem("hidePortImages", next ? "1" : "0");
    window.dispatchEvent(new Event("hidePortImagesChanged"));
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  }

  function confirmDelete() {
    startTransition(async () => {
      await deleteDraftShipment(s.id);
    });
  }

  const pol3      = s.pol?.slice(-3) ?? "???";
  const pod3      = s.pod?.slice(-3) ?? "???";
  const polCity   = cityOnly(s.pol);
  const podCity   = cityOnly(s.pod);
  const imgUrl    = portImageUrl(s.pod ?? "");
  const progress  = journeyProgress(s);
  const mode      = MODE[s.mode] ?? MODE.maritimo;
  const etaOverdue = isEtaOverdue(s.eta, s.status);
  const consignee = s.parties.find((p) => p.role === "consignee")?.name ?? null;
  const { gp, hasAtRisk } = computeGP(s.charges);

  const ph = MODE_PLACEHOLDER[s.mode] ?? MODE_PLACEHOLDER.maritimo;
  const PlaceholderIcon = ph.icon;
  const showImg = imgUrl !== null && !hideImages;

  return (
    <div className="group relative">
      {/* ── Duplicar (siempre visible en hover) ─────────────── */}
      <button
        onClick={handleDuplicate}
        disabled={dupPending}
        title="Duplicar expediente"
        aria-label="Duplicar expediente"
        className={cn(
          "absolute top-2 z-10 flex h-7 w-7 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-2/80 hover:text-foreground disabled:opacity-50",
          s.status === "borrador" ? "right-10" : "right-2",
        )}
      >
        {dupPending ? <Loader2 size={13} className="animate-spin" /> : <Icon icon={Copy} size={13} />}
      </button>

      {/* ── Botón borrar (solo borradores) ──────────────────── */}
      {s.status === "borrador" && (
        <button
          onClick={handleDeleteClick}
          title="Eliminar expediente en borrador"
          aria-label="Eliminar expediente en borrador"
          className="absolute right-2 top-2 z-10 flex h-7 w-7 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          <Icon icon={Trash2} size={13} />
        </button>
      )}

      {/* ── Modal de confirmación ────────────────────────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfirm(false)}
        >
          <div className="absolute inset-0 bg-background/70" />
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirmar eliminación"
            tabIndex={-1}
            className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-semibold text-foreground">
              ¿Estás seguro de realizar la siguiente acción?
            </h2>
            <p className="mt-1.5 text-base text-muted-foreground">
              El expediente <span className="font-mono text-foreground">{s.reference}</span> se eliminará de forma permanente. Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-md px-4 py-2 text-base text-muted-foreground hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-md bg-destructive px-4 py-2 text-base font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {pending && <Loader2 className="size-3.5 animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    <Link
      href={`/expedientes/${s.id}`}
      prefetch={false}
      className="block rounded-xl transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      <article className="relative w-full rounded-xl border border-border bg-card shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">

        {/* ── Foto de destino ──────────────────────────────────── */}
        <div className="relative h-[140px] overflow-hidden rounded-t-xl">
          {showImg ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={podCity}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            </>
          ) : (
            <>
              <div className={cn("h-full w-full bg-gradient-to-b", ph.from, ph.to)} />
              <div className="absolute inset-0 flex items-center justify-center">
                <PlaceholderIcon size={64} strokeWidth={0.75} className="text-white/22" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </>
          )}

          {/* Toggle imagen */}
          <button
            onClick={toggleImages}
            title={hideImages ? "Mostrar imágenes de puerto" : "Prescindir de la imagen"}
            aria-label={hideImages ? "Mostrar imágenes de puerto" : "Ocultar imagen de puerto"}
            className="absolute left-2 top-2 z-10 flex h-7 w-7 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md bg-black/40 text-white/60 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
          >
            <Icon icon={ImageOff} size={13} />
          </button>

          {/* Códigos de puerto */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-2.5 transition-transform duration-700 group-hover:-translate-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="font-mono text-sm uppercase tracking-[0.15em] text-white">
                  Origen
                </p>
                <p className="font-display text-[1.9rem] font-bold leading-none tracking-tighter text-white">
                  {pol3}
                </p>
                <p className="mt-0.5 font-mono text-base text-white/80">
                  {polCity}
                </p>
              </div>
              <Icon
                icon={MoveRight}
                size={14}
                className="shrink-0 text-white/40"
              />
              <div className="flex-1 text-right">
                <p className="font-mono text-sm uppercase tracking-[0.15em] text-white">
                  Destino
                </p>
                <p className="font-display text-[1.9rem] font-bold leading-none tracking-tighter text-white">
                  {pod3}
                </p>
                <p className="mt-0.5 font-mono text-base text-white/80">
                  {podCity}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divisor ──────────────────────────────────────────── */}
        <div className="mx-4 border-t border-dashed border-border/70" />

        {/* ── Info del expediente ───────────────────────────────── */}
        <div className="px-4 pb-3.5 pt-2.5">

          {/* Referencia + naviera */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-base tracking-wide text-muted-foreground">
              {s.reference}
            </p>
            {s.carrier && <CarrierBadge carrier={s.carrier} />}
          </div>

          {/* BL + consignatario */}
          {(s.blNumber || consignee) && (
            <div className="mt-2 space-y-2 border-t border-border pt-2">
              {s.blNumber && (
                <div className="min-w-0">
                  <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">BL</p>
                  <p className="mt-0.5 truncate font-sans text-base text-foreground">{s.blNumber}</p>
                </div>
              )}
              {consignee && (
                <div className="min-w-0">
                  <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">Consignatario</p>
                  <p className="mt-0.5 truncate font-sans text-base text-foreground">{consignee}</p>
                </div>
              )}
            </div>
          )}

          {/* Progreso + fechas integradas */}
          <div className="mt-2.5 border-t border-border pt-2.5">
            <div className="relative h-1.5 overflow-hidden rounded-full bg-border/60">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-start justify-between">
              <div>
                <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">ETD</p>
                <p className="mt-0.5 font-sans text-base text-foreground">{formatDate(s.etd)}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground">ETA</p>
                  {etaOverdue && (
                    <span className="rounded-sm bg-accent/15 px-1 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide text-accent">
                      Vencida
                    </span>
                  )}
                </div>
                <p className={cn("mt-0.5 font-sans text-base", etaOverdue ? "text-accent" : "text-foreground")}>
                  {formatDate(s.eta)}
                </p>
              </div>
            </div>
          </div>

          {/* GP — solo si está disponible */}
          {gp !== null && (
            <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5">
              <span className="font-mono text-sm uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1">
                Gross Profit
                {hasAtRisk && (
                  <Icon icon={AlertTriangle} size={10} className="text-destructive" />
                )}
              </span>
              <span className={cn(
                "font-mono text-base font-semibold",
                gp > 0 ? "text-success" : "text-destructive",
              )}>
                {formatMoney(String(gp), "EUR")}
              </span>
            </div>
          )}

          {/* Estado + modo */}
          <div className={cn(
            "flex items-center justify-between border-t border-border pt-2.5",
            gp !== null ? "mt-2.5" : "mt-2.5",
          )}>
            <StatusPill status={s.status} />
            <span className="flex items-center gap-1.5 text-base text-muted-foreground">
              <Icon icon={mode.icon} size={12} />
              {mode.label}
            </span>
          </div>
        </div>
      </article>
    </Link>
    </div>
  );
}
