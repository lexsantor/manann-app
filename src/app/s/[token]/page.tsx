import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Ship,
  Package,
  CheckCircle2,
  Clock,
  CircleDot,
} from "lucide-react";
import type { Metadata } from "next";

import { getShipmentByToken } from "@/lib/erp";
import { Icon } from "@/components/icon";
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
    title: `${s.reference} — Manann`,
    description: `Estado del envío ${s.reference}${s.pol && s.pod ? ` de ${s.pol} a ${s.pod}` : ""}.`,
  };
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  borrador:    { label: "Borrador",    cls: "text-muted-foreground bg-muted/60" },
  confirmado:  { label: "Confirmado",  cls: "text-sky-600 bg-sky-500/10" },
  en_transito: { label: "En tránsito", cls: "text-amber-600 bg-amber-500/10" },
  en_destino:  { label: "En destino",  cls: "text-primary bg-primary/10" },
  entregado:   { label: "Entregado",   cls: "text-emerald-600 bg-emerald-500/10" },
  cancelado:   { label: "Cancelado",   cls: "text-destructive bg-destructive/10" },
};

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const s = await getShipmentByToken(token);
  if (!s) notFound();

  const statusMeta = STATUS_LABEL[s.status] ?? STATUS_LABEL.borrador;
  const container = s.containers?.[0];
  const importador = s.parties?.find((p) => p.role === "consignee");
  const exportador = s.parties?.find((p) => p.role === "shipper");

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 sm:px-6">
          <Link
            href="/"
            className="font-mono text-sm font-medium tracking-tight text-foreground"
          >
            Manann
          </Link>
          <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
            Solo lectura
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        {/* Cabecera */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Expediente
            </p>
            <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-foreground">
              {s.reference}
            </h1>
          </div>
          <span
            className={cn(
              "mt-1 rounded-full px-3 py-1 font-mono text-xs",
              statusMeta.cls,
            )}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* Ruta */}
        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Origen
              </p>
              <p className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
                {s.pol ?? "—"}
              </p>
            </div>
            <Icon icon={Ship} size={20} className="text-muted-foreground" />
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Destino
              </p>
              <p className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground">
                {s.pod ?? "—"}
              </p>
            </div>
          </div>

          {/* Detalles de ruta */}
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
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={Package} size={14} />
              <span className="font-mono text-xs uppercase tracking-wider">
                Contenedor
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-6">
              <div>
                <p className="font-mono text-[10px] text-muted-foreground">Número</p>
                <p className="mt-0.5 font-mono text-sm text-foreground">
                  {container.containerNumber}
                </p>
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[importador, exportador]
              .filter(Boolean)
              .map((p) => (
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

        {/* Timeline de tracking */}
        {s.trackingEvents && s.trackingEvents.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
              Eventos de ruta
            </h2>
            <div className="mt-4 space-y-0">
              {s.trackingEvents.map((ev, i) => (
                <div key={ev.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full",
                        i === 0
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/60 text-muted-foreground",
                      )}
                    >
                      <Icon
                        icon={i === 0 ? CheckCircle2 : CircleDot}
                        size={14}
                      />
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
            {" "}· Solo lectura · Los datos son de la organización que compartió este enlace
          </p>
        </div>
      </footer>
    </div>
  );
}
