import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Package,
  CheckCircle2,
  Clock,
  CircleDot,
  FileText,
  Download,
} from "lucide-react";
import type { Metadata } from "next";

import { getShipmentByToken } from "@/lib/erp";
import { portLabel, MODE } from "@/lib/erp-format";
import { Icon } from "@/components/icon";
import { EtaCountdown } from "@/components/app/eta-countdown";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const s = await getShipmentByToken(token);
  if (!s) return { title: "Expediente no encontrado" };
  return {
    title: `${s.reference} — Seguimiento Manann`,
    description: `Estado del envío ${s.reference}${s.pol && s.pod ? ` · ${portLabel(s.pol)} → ${portLabel(s.pod)}` : ""}.`,
  };
}

// ─── Estado visual ────────────────────────────────────────────────────────────

const STEPS = [
  { key: "borrador",    label: "Registrado"   },
  { key: "confirmado",  label: "Confirmado"   },
  { key: "en_transito", label: "En tránsito"  },
  { key: "en_aduana",   label: "En aduana"    },
  { key: "entregado",   label: "Entregado"    },
];

const STATUS_ORDER: Record<string, number> = {
  borrador: 0, confirmado: 1, en_transito: 2, en_aduana: 3,
  entregado: 4, facturado: 4, cerrado: 4,
};

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("es-ES", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function docTypeLabel(type: string): string {
  const map: Record<string, string> = {
    bl: "Bill of Lading", awb: "Air Waybill", cmr: "CMR",
    invoice: "Factura", packing_list: "Packing List", other: "Documento",
  };
  return map[type] ?? type.toUpperCase();
}

// ─── Progreso visual ──────────────────────────────────────────────────────────

function JourneyProgress({ status }: { status: string }) {
  const currentStep = STATUS_ORDER[status] ?? 0;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card px-5 py-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Estado del envío
      </p>
      <div className="relative">
        {/* Línea de fondo */}
        <div className="absolute left-3.5 top-3.5 h-px w-[calc(100%-28px)] bg-border" />
        {/* Línea progreso */}
        <div
          className="absolute left-3.5 top-3.5 h-px bg-primary transition-all duration-500"
          style={{ width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 7px)` }}
        />
        <div className="relative flex justify-between">
          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={step.key} className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 transition-colors",
                    done
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M2 5.5L4.5 8L9 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span className={cn(
                  "hidden text-center font-mono text-[10px] sm:block",
                  active ? "font-semibold text-foreground" : done ? "text-muted-foreground" : "text-border",
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Página pública ────────────────────────────────────────────────────────────

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const s = await getShipmentByToken(token);
  if (!s) notFound();

  const modeIcon = (MODE[s.mode] ?? MODE.maritimo).icon;
  const container = s.containers?.[0];
  const importador = s.parties?.find((p) => p.role === "consignee");
  const exportador = s.parties?.find((p) => p.role === "shipper");
  const docs = s.documents ?? [];

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
          <Link href="/" className="font-mono text-sm font-medium tracking-tight text-foreground">
            Manann
          </Link>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
            Solo lectura
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-5 py-10 sm:px-6">
        {/* Cabecera */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Expediente
            </p>
            <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-foreground">
              {s.reference}
            </h1>
          </div>
        </div>

        {/* Estado visual con pasos */}
        <JourneyProgress status={s.status} />

        {/* Countdown ETA — solo si activo */}
        {s.eta && (
          <EtaCountdown eta={s.eta.toISOString()} status={s.status} />
        )}

        {/* Ruta */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Origen
              </p>
              <p className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
                {s.pol?.slice(-3) ?? "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{portLabel(s.pol)}</p>
            </div>
            <Icon icon={modeIcon} size={20} className="text-muted-foreground" />
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Destino
              </p>
              <p className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
                {s.pod?.slice(-3) ?? "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{portLabel(s.pod)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
            {[
              { label: "Naviera", value: s.carrier ?? "—" },
              { label: "Buque", value: s.vessel ?? "—" },
              { label: "ETD", value: formatDate(s.etd) },
              { label: "ETA", value: formatDate(s.eta) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contenedor */}
        {container && (
          <div className="overflow-hidden rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={Package} size={14} />
              <span className="font-mono text-xs uppercase tracking-wider">Contenedor</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-6">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground">Número</p>
                <p className="mt-0.5 font-mono text-sm text-foreground">{container.containerNumber}</p>
              </div>
              {container.isoType && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground">Tipo ISO</p>
                  <p className="mt-0.5 font-mono text-sm text-foreground">{container.isoType}</p>
                </div>
              )}
              {container.grossWeightKg && (
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground">Peso bruto</p>
                  <p className="mt-0.5 font-mono text-sm text-foreground">
                    {container.grossWeightKg.toLocaleString("es-ES")} kg
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Partes */}
        {(importador ?? exportador) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[importador, exportador].filter(Boolean).map((p) => (
              <div
                key={p!.id}
                className="overflow-hidden rounded-xl border border-border bg-card px-5 py-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {p!.role === "consignee" ? "Consignatario" : p!.role === "shipper" ? "Embarcador" : p!.role}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{p!.name}</p>
                {(p!.city ?? p!.country) && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Icon icon={MapPin} size={11} />
                    {[p!.city, p!.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Documentos descargables */}
        {docs.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <Icon icon={FileText} size={14} className="text-muted-foreground" />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Documentos
              </span>
            </div>
            <div className="divide-y divide-border">
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {doc.filename}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {docTypeLabel(doc.type)}
                    </p>
                  </div>
                  {doc.blobUrl && (
                    <a
                      href={doc.blobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.filename}
                      className="flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
                    >
                      <Icon icon={Download} size={12} />
                      Descargar
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline de tracking */}
        {s.trackingEvents && s.trackingEvents.length > 0 && (
          <div>
            <h2 className="mb-4 font-display text-lg font-medium tracking-tight text-foreground">
              Eventos de ruta
            </h2>
            <div className="space-y-0">
              {s.trackingEvents.map((ev, i) => (
                <div key={ev.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full",
                        i === 0 ? "bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground",
                      )}
                    >
                      <Icon icon={i === 0 ? CheckCircle2 : CircleDot} size={14} />
                    </span>
                    {i < s.trackingEvents.length - 1 && (
                      <div className="my-1 w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-foreground">
                      {ev.description ?? ev.type}
                    </p>
                    {ev.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon icon={MapPin} size={10} />
                        {ev.location}
                      </p>
                    )}
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      <Icon icon={Clock} size={10} />
                      {formatDateTime(ev.occurredAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-3xl px-5 py-5 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            Compartido por{" "}
            <Link href="/" className="text-foreground hover:underline">
              Manann ERP
            </Link>
            {" · "}Solo lectura · Los datos son de la organización que compartió este enlace
          </p>
        </div>
      </footer>
    </div>
  );
}
