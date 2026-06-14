"use client";

import { useState, useTransition } from "react";
import { Package, Truck, ExternalLink } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { updateCourierInfo } from "@/lib/erp-actions";

type CourierProvider = "ups" | "dhl" | "fedex";

interface CourierPanelProps {
  shipmentId: string;
  courierProvider: string | null;
  courierTrackingNumber: string | null;
  courierEstimatedDelivery: string | null;
}

const PROVIDER_CONFIG: Record<CourierProvider, { label: string; cls: string }> = {
  ups: { label: "UPS", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  dhl: { label: "DHL Express", cls: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  fedex: { label: "FedEx", cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
};

const MOCK_EVENTS = [
  { status: "Entregado", location: "Barcelona, ES", time: "Hoy 09:14", done: true },
  { status: "En reparto", location: "Barcelona, ES", time: "Hoy 07:30", done: true },
  { status: "En depósito courier", location: "El Prat de Llobregat, ES", time: "Ayer 22:05", done: true },
  { status: "Salida aduana destino", location: "Barcelona, ES", time: "Ayer 18:40", done: true },
  { status: "Llegada hub internacional", location: "Madrid Barajas, ES", time: "Ayer 11:22", done: true },
  { status: "En tránsito", location: "Frankfurt, DE", time: "-2d 03:10", done: false },
];

function fmt(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function CourierEditForm({
  shipmentId,
  current,
  onDone,
}: {
  shipmentId: string;
  current: { provider: string | null; tracking: string | null; delivery: string | null };
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateCourierInfo(
        shipmentId,
        ((fd.get("provider") as string) || null) as "ups" | "dhl" | "fedex" | null,
        (fd.get("trackingNumber") as string) || null,
        (fd.get("estimatedDelivery") as string) || null,
      );
      onDone();
    });
  }

  const inputCls = "w-full appearance-none rounded-md border border-border bg-background px-3 py-1.5 font-mono text-base text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary transition-colors";

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-md border border-border/60 bg-surface-2/30 p-3">
      <p className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">Datos courier</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block font-mono text-sm text-muted-foreground">Proveedor</label>
          <select name="provider" defaultValue={current.provider ?? ""} className={inputCls}>
            <option value="">Sin courier</option>
            <option value="ups">UPS</option>
            <option value="dhl">DHL Express</option>
            <option value="fedex">FedEx</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block font-mono text-sm text-muted-foreground">Nº de seguimiento</label>
          <input name="trackingNumber" placeholder="1Z999AA10123456784" defaultValue={current.tracking ?? ""} className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="mb-1 block font-mono text-sm text-muted-foreground">Entrega estimada</label>
          <input name="estimatedDelivery" type="date" defaultValue={current.delivery ?? ""} className={inputCls} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-3 py-1.5 font-mono text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={onDone} className="rounded-md px-3 py-1.5 font-mono text-sm text-muted-foreground hover:text-foreground">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function CourierPanel({
  shipmentId,
  courierProvider,
  courierTrackingNumber,
  courierEstimatedDelivery,
}: CourierPanelProps) {
  const [editing, setEditing] = useState(false);
  const provider = courierProvider as CourierProvider | null;
  const cfg = provider ? PROVIDER_CONFIG[provider] : null;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={Package} size={16} className="text-muted-foreground" />
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Courier
          </h2>
          {cfg && (
            <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-sm font-semibold", cfg.cls)}>
              {cfg.label}
            </span>
          )}
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {editing ? "Cancelar" : provider ? "Editar" : "Configurar"}
        </button>
      </div>

      {!provider && !editing && (
        <p className="text-base text-muted-foreground">
          Sin courier configurado — asigna UPS, DHL o FedEx para activar el seguimiento de paquetería.
        </p>
      )}

      {provider && !editing && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm text-muted-foreground">
            {courierTrackingNumber && (
              <span className="flex items-center gap-1">
                <Icon icon={Truck} size={12} />
                {courierTrackingNumber}
              </span>
            )}
            {courierEstimatedDelivery && (
              <span>Entrega est.: {fmt(courierEstimatedDelivery)}</span>
            )}
          </div>

          <div className="space-y-0">
            {MOCK_EVENTS.map((ev, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "mt-1 size-2 rounded-full shrink-0",
                    ev.done ? "bg-emerald-500" : "bg-border"
                  )} />
                  {i < MOCK_EVENTS.length - 1 && (
                    <div className="w-px flex-1 bg-border/60 my-1 min-h-[16px]" />
                  )}
                </div>
                <div className="pb-3 min-w-0">
                  <p className={cn("text-sm font-medium", ev.done ? "text-foreground" : "text-muted-foreground/60")}>
                    {ev.status}
                  </p>
                  <p className="font-mono text-sm text-muted-foreground/60">
                    {ev.location} · {ev.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-1 rounded-sm bg-muted/60 px-2 py-1 font-mono text-sm text-muted-foreground/60">
            <Icon icon={ExternalLink} size={11} />
            Simulación — integración real en producción
          </p>
        </div>
      )}

      {editing && (
        <CourierEditForm
          shipmentId={shipmentId}
          current={{
            provider: courierProvider,
            tracking: courierTrackingNumber,
            delivery: courierEstimatedDelivery,
          }}
          onDone={() => setEditing(false)}
        />
      )}
    </section>
  );
}
