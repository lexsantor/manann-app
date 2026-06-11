import Link from "next/link";
import { MoveRight } from "lucide-react";

import { type ShipmentListItem } from "@/lib/erp";
import { portLabel, formatDate, MODE } from "@/lib/erp-format";
import { portImageUrl } from "@/lib/port-images";
import { StatusPill } from "@/components/app/status-pill";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

// ─── Marca de naviera ────────────────────────────────────────────────────────

const CARRIER_COLORS: Record<string, string> = {
  MSC:          "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  MAERSK:       "bg-blue-600/10 text-blue-700 dark:text-blue-400",
  "CMA CGM":    "bg-red-500/10 text-red-600 dark:text-red-400",
  "HAPAG-LLOYD":"bg-orange-500/10 text-orange-600 dark:text-orange-400",
  COSCO:        "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  EVERGREEN:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  YANG_MING:    "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

function CarrierBadge({ carrier }: { carrier: string }) {
  const cls =
    CARRIER_COLORS[carrier.toUpperCase()] ??
    "bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide",
        cls,
      )}
    >
      {carrier}
    </span>
  );
}

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

// ─── Boarding pass card ──────────────────────────────────────────────────────

export function ShipmentBoardingPass({ s }: { s: ShipmentListItem }) {
  const pol3      = s.pol?.slice(-3) ?? "???";
  const pod3      = s.pod?.slice(-3) ?? "???";
  const polCity   = cityOnly(s.pol);
  const podCity   = cityOnly(s.pod);
  const imgUrl    = portImageUrl(s.pod ?? "");
  const progress  = journeyProgress(s);
  const mode      = MODE[s.mode] ?? MODE.maritimo;
  const etaOverdue = isEtaOverdue(s.eta, s.status);
  const consignee = s.parties.find((p) => p.role === "consignee")?.name ?? null;

  return (
    <Link
      href={`/expedientes/${s.id}`}
      prefetch={false}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article className="relative w-full rounded-xl border border-border bg-card shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">

        {/* ── Foto de destino ──────────────────────────────────── */}
        <div className="relative h-[140px] overflow-hidden rounded-t-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={podCity}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

          {/* Códigos de puerto */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white">
                  Origen
                </p>
                <p className="font-display text-[1.9rem] font-bold leading-none tracking-tighter text-white">
                  {pol3}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-white/80">
                  {polCity}
                </p>
              </div>
              <Icon
                icon={MoveRight}
                size={14}
                className="shrink-0 text-white/40"
              />
              <div className="flex-1 text-right">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-white">
                  Destino
                </p>
                <p className="font-display text-[1.9rem] font-bold leading-none tracking-tighter text-white">
                  {pod3}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-white/80">
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
            <p className="font-mono text-[12px] tracking-wide text-muted-foreground">
              {s.reference}
            </p>
            {s.carrier && <CarrierBadge carrier={s.carrier} />}
          </div>

          {/* BL + consignatario */}
          {(s.blNumber || consignee) && (
            <div className="mt-2 space-y-2 border-t border-border pt-2">
              {s.blNumber && (
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">BL</p>
                  <p className="mt-0.5 truncate font-mono text-[12px] text-foreground">{s.blNumber}</p>
                </div>
              )}
              {consignee && (
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Consignatario</p>
                  <p className="mt-0.5 truncate text-[12px] text-foreground">{consignee}</p>
                </div>
              )}
            </div>
          )}

          {/* Progreso + fechas integradas */}
          <div className="mt-2.5 border-t border-border pt-2.5">
            <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ETD</p>
                <p className="mt-0.5 font-sans text-sm text-foreground">{formatDate(s.etd)}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ETA</p>
                  {etaOverdue && (
                    <span className="rounded-sm bg-accent/15 px-1 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wide text-accent">
                      Vencida
                    </span>
                  )}
                </div>
                <p className={cn("mt-0.5 font-sans text-sm", etaOverdue ? "text-accent" : "text-foreground")}>
                  {formatDate(s.eta)}
                </p>
              </div>
            </div>
          </div>

          {/* Estado + modo */}
          <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5">
            <StatusPill status={s.status} />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon icon={mode.icon} size={12} />
              {mode.label}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
