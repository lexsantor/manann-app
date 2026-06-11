"use client";

import { useState, useTransition } from "react";
import { Satellite, AlertTriangle, CheckCircle, Plus, X } from "lucide-react";
import { Icon } from "@/components/icon";
import { subscribeContainerTracking } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

interface TrackingSub {
  id: string;
  containerNumber: string;
  shippingLine: string;
  status: string;
  lastSyncedAt: Date | null;
}

interface ShipsGoPanelProps {
  shipmentId: string;
  subscriptions: TrackingSub[];
  hasRealEvents: boolean;
}

export function ShipsGoPanel({ shipmentId, subscriptions, hasRealEvents }: ShipsGoPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [containerNumber, setContainerNumber] = useState("");
  const [shippingLine, setShippingLine] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const creditsUsed = subscriptions.length;

  function submit() {
    if (!containerNumber || !shippingLine) return;
    setError(null);
    startTransition(async () => {
      const result = await subscribeContainerTracking(shipmentId, containerNumber, shippingLine);
      if (result.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        setContainerNumber("");
        setShippingLine("");
        setConfirmed(false);
      }
    });
  }

  if (subscriptions.length > 0 || hasRealEvents) {
    return (
      <div className="mb-4 mt-2">
        {subscriptions.map((sub) => (
          <p key={sub.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon icon={CheckCircle} size={12} className="text-primary" />
            <span className="font-mono">{sub.containerNumber}</span>
            <span>· ShipsGo · datos reales</span>
            {sub.lastSyncedAt && (
              <span className="text-ink-subtle">
                · sync {new Date(sub.lastSyncedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </p>
        ))}
        {!hasRealEvents && subscriptions.every((s) => s.status === "active") && (
          <p className="mt-1 text-xs text-muted-foreground">Esperando primer evento de ShipsGo...</p>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 mt-2">
      {!showForm ? (
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-1.5 text-xs text-ink-subtle">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            Simulación · tracking en vivo ShipsGo disponible
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="ml-auto flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
          >
            <Icon icon={Satellite} size={11} />
            Vincular
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface-2/40 p-3 text-xs">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Icon icon={Satellite} size={12} />
              Vincular contenedor real
            </span>
            <button
              type="button"
              onClick={() => { setShowForm(false); setConfirmed(false); setError(null); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon icon={X} size={13} />
            </button>
          </div>

          <p className="mb-3 text-muted-foreground">
            Consume <strong>1 crédito ShipsGo</strong> ({3 - creditsUsed} restantes).
            Elige un contenedor en tránsito activo para mejores resultados.
          </p>

          <div className="space-y-2">
            <input
              type="text"
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
              placeholder="Nº contenedor ISO 6346 (p.ej. MSCU1234567)"
              className={cn(
                "w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary",
              )}
            />
            <input
              type="text"
              value={shippingLine}
              onChange={(e) => setShippingLine(e.target.value)}
              placeholder="Naviera (p.ej. MSC, MAERSK, CMA CGM)"
              className={cn(
                "w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary",
              )}
            />
          </div>

          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-destructive">
              <Icon icon={AlertTriangle} size={11} />
              {error}
            </p>
          )}

          {!confirmed ? (
            <button
              type="button"
              disabled={!containerNumber || !shippingLine}
              onClick={() => setConfirmed(true)}
              className={cn(
                "mt-3 w-full rounded-md py-1.5 text-center font-medium transition-colors",
                "bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40",
              )}
            >
              Revisar y confirmar
            </button>
          ) : (
            <div className="mt-3 rounded-md border border-accent/40 bg-accent/10 p-2">
              <p className="font-medium text-accent">
                Confirmar gasto de 1 crédito para {containerNumber}?
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={submit}
                  disabled={isPending}
                  className="flex-1 rounded-md bg-primary py-1.5 text-center font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isPending ? "Vinculando…" : "Sí, vincular"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmed(false)}
                  className="flex-1 rounded-md border border-border py-1.5 text-center text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
