"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AlertTriangle, TrendingDown, Scale, CheckCircle2, ExternalLink } from "lucide-react";
import { type ChargeException } from "@/lib/exceptions";
import { EmptyState } from "@/components/ui/empty-state";
import { resolveAtRiskCharge } from "@/lib/erp-actions";
import { formatMoney } from "@/lib/erp-format";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const KIND_META: Record<ChargeException["kind"], {
  label: string;
  icon: typeof AlertTriangle;
  pill: string;
}> = {
  at_risk: {
    label: "Sin facturar",
    icon: AlertTriangle,
    pill: "bg-destructive/10 text-destructive border-destructive/20",
  },
  accrual_gap: {
    label: "Desvío accrual",
    icon: Scale,
    pill: "bg-accent/10 text-accent border-accent/20",
  },
  negative_gp: {
    label: "GP negativo",
    icon: TrendingDown,
    pill: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function ExceptionRow({ ex, onResolve }: { ex: ChargeException; onResolve: (id: string) => void }) {
  const [pending, startTransition] = useTransition();
  const meta = KIND_META[ex.kind];

  function handleResolve() {
    if (ex.kind !== "at_risk") return;
    startTransition(async () => {
      await resolveAtRiskCharge(ex.chargeId);
      onResolve(ex.chargeId);
    });
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-opacity" style={{ opacity: pending ? 0.5 : 1 }}>
      <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border", meta.pill)}>
        <Icon icon={meta.icon} size={14} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-medium text-foreground">{ex.chargeDescription}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={cn("rounded border px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide", meta.pill)}>
                {meta.label}
              </span>
              <Link
                href={`/expedientes/${ex.shipmentId}`}
                className="flex items-center gap-0.5 font-mono text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                {ex.shipmentReference}
                <Icon icon={ExternalLink} size={8} />
              </Link>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-base font-semibold text-destructive">
              {formatMoney(String(ex.riskAmount), ex.currency)}
            </p>
            <p className="font-mono text-base text-muted-foreground">en riesgo</p>
          </div>
        </div>
      </div>

      {ex.kind === "at_risk" && (
        <button
          onClick={handleResolve}
          disabled={pending}
          title="Marcar como resuelto"
          aria-label="Marcar como resuelto"
          className="mt-0.5 inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <Icon icon={CheckCircle2} size={16} />
        </button>
      )}
    </div>
  );
}

export function ExceptionInbox({ exceptions }: { exceptions: ChargeException[] }) {
  const [items, setItems] = useState(exceptions);

  function handleResolve(chargeId: string) {
    setItems((prev) => prev.filter((e) => e.chargeId !== chargeId));
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Icon icon={CheckCircle2} className="text-success" />}
        title="Sin excepciones activas"
        hint="Todos los cargos están bajo control."
      />
    );
  }

  const totalRisk = items.reduce((s, e) => s + e.riskAmount, 0);

  return (
    <div className="space-y-4">
      {/* Banner de riesgo total */}
      <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
        <Icon icon={AlertTriangle} size={16} className="shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-base text-foreground">
            <span className="font-semibold text-destructive">
              {formatMoney(String(totalRisk), "EUR")}
            </span>{" "}
            de margen en riesgo en{" "}
            <span className="font-semibold">{items.length}</span>{" "}
            {items.length === 1 ? "excepción" : "excepciones"}.
          </p>
          <p className="mt-0.5 text-base text-muted-foreground">
            Resolver estas excepciones puede recuperar hasta un +33% de beneficio neto.
          </p>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {items.map((ex) => (
          <ExceptionRow key={`${ex.kind}-${ex.chargeId}`} ex={ex} onResolve={handleResolve} />
        ))}
      </div>
    </div>
  );
}
