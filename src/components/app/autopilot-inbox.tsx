"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Scale,
  TrendingDown,
  Clock,
  CheckCircle2,
  X,
  Zap,
  ExternalLink,
} from "lucide-react";
import { type AutopilotAction } from "@/lib/autopilot";
import { resolveAtRiskCharge } from "@/lib/erp-actions";
import { formatMoney } from "@/lib/erp-format";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const KIND_META: Record<AutopilotAction["kind"], {
  icon: typeof AlertTriangle;
  bg: string;
  text: string;
  actionLabel: string;
}> = {
  invoice_at_risk: {
    icon: AlertTriangle,
    bg: "bg-destructive/10",
    text: "text-destructive",
    actionLabel: "Facturar",
  },
  accrual_gap: {
    icon: Scale,
    bg: "bg-accent/10",
    text: "text-accent",
    actionLabel: "Revisar asiento",
  },
  negative_gp: {
    icon: TrendingDown,
    bg: "bg-destructive/10",
    text: "text-destructive",
    actionLabel: "Ver expediente",
  },
  eta_overdue: {
    icon: Clock,
    bg: "bg-accent/10",
    text: "text-accent",
    actionLabel: "Actualizar",
  },
  confirm_ai: {
    icon: Zap,
    bg: "bg-primary/10",
    text: "text-primary",
    actionLabel: "Confirmar",
  },
};

const SEV_LABEL: Record<AutopilotAction["severity"], string> = {
  critical: "Crítico",
  attention: "Atención",
  info: "Info",
};

function ActionCard({
  action,
  onApprove,
  onDismiss,
}: {
  action: AutopilotAction;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const meta = KIND_META[action.kind];

  function handleApprove() {
    startTransition(async () => {
      if (action.kind === "invoice_at_risk" && action.metadata.chargeId) {
        await resolveAtRiskCharge(action.metadata.chargeId);
      }
      setDone(true);
      setTimeout(() => onApprove(action.id), 600);
    });
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 p-4 transition-all">
        <Icon icon={CheckCircle2} size={18} className="shrink-0 text-success" />
        <p className="text-base text-success">
          <span className="font-medium">{action.title}</span> — hecho.{" "}
          {action.impact > 0 && (
            <span className="font-semibold">+{formatMoney(String(action.impact), "EUR")} recuperados.</span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-opacity",
        pending && "opacity-50 pointer-events-none",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", meta.bg)}>
          <Icon icon={meta.icon} size={16} className={meta.text} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-base text-foreground">{action.title}</p>
                <span className={cn(
                  "rounded-full px-2 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide",
                  action.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent",
                )}>
                  {SEV_LABEL[action.severity]}
                </span>
                <span className="font-mono text-sm text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                  IA 97%
                </span>
              </div>
              <p className="mt-1 text-base text-muted-foreground leading-relaxed">{action.description}</p>
            </div>
          </div>

          {/* Impact + actions */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-base text-muted-foreground">{action.impactLabel}:</span>
                <span className={cn(
                  "font-mono text-base font-semibold",
                  action.kind === "negative_gp" || action.kind === "accrual_gap"
                    ? "text-destructive"
                    : "text-success",
                )}>
                  {formatMoney(String(action.impact), "EUR")}
                </span>
              </div>
              <Link
                href={`/expedientes/${action.shipmentId}`}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-base text-muted-foreground transition-colors hover:text-foreground hover:bg-surface-2"
              >
                {action.shipmentRef}
                <Icon icon={ExternalLink} size={10} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                onClick={() => onDismiss(action.id)}
                className="flex h-11 w-full items-center justify-center gap-1 rounded-md px-2.5 text-base text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground sm:h-auto sm:w-auto sm:py-1"
              >
                <Icon icon={X} size={12} />
                Descartar
              </button>
              <button
                onClick={handleApprove}
                className={cn(
                  "flex h-11 w-full items-center justify-center gap-1.5 rounded-md px-3 text-base font-medium transition-colors sm:h-auto sm:w-auto sm:py-1",
                  action.severity === "critical"
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : "bg-primary/10 text-primary hover:bg-primary/15",
                )}
              >
                <Icon icon={CheckCircle2} size={12} />
                {meta.actionLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AutopilotInbox({ actions: initial }: { actions: AutopilotAction[] }) {
  const [actions, setActions] = useState(initial);
  const [executed, setExecuted] = useState(0);
  const [recovered, setRecovered] = useState(0);

  function handleApprove(id: string) {
    const action = actions.find((a) => a.id === id);
    if (action) {
      setExecuted((n) => n + 1);
      if (action.kind === "invoice_at_risk") setRecovered((n) => n + action.impact);
    }
    setActions((prev) => prev.filter((a) => a.id !== id));
  }

  function handleDismiss(id: string) {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }

  function handleApproveAll() {
    const approveInOrder = async () => {
      for (const action of actions) {
        if (action.kind === "invoice_at_risk" && action.metadata.chargeId) {
          await resolveAtRiskCharge(action.metadata.chargeId);
        }
        const rec = action.kind === "invoice_at_risk" ? action.impact : 0;
        setExecuted((n) => n + 1);
        setRecovered((n) => n + rec);
      }
      setActions([]);
    };
    approveInOrder();
  }

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <Icon icon={CheckCircle2} size={26} className="text-success" />
        </div>
        <p className="font-display text-lg font-medium text-foreground">Bandeja vacía. Bien hecho.</p>
        <p className="mt-1 text-base text-muted-foreground">
          Has resuelto todo lo que Manann IA te propuso.
          {executed > 0 && (
            <> Ejecutaste <strong>{executed} acción{executed > 1 ? "es" : ""}</strong>
            {recovered > 0 && <> y recuperaste <strong>{formatMoney(String(recovered), "EUR")}</strong></>}.
            </>
          )}
        </p>
      </div>
    );
  }

  const criticals = actions.filter((a) => a.severity === "critical");
  const totalImpact = actions.reduce((s, a) => s + a.impact, 0);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-mono text-base text-muted-foreground">
            {actions.length} acción{actions.length > 1 ? "es" : ""} pendiente{actions.length > 1 ? "s" : ""}
          </span>
          {criticals.length > 0 && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-sm font-semibold text-destructive uppercase tracking-wide">
              {criticals.length} crítica{criticals.length > 1 ? "s" : ""}
            </span>
          )}
          {executed > 0 && (
            <span className="rounded-full bg-success/10 px-2 py-0.5 font-mono text-sm font-semibold text-success uppercase tracking-wide">
              {executed} ejecutada{executed > 1 ? "s" : ""} · +{formatMoney(String(recovered), "EUR")}
            </span>
          )}
          <span className="font-mono text-base text-muted-foreground">
            Impacto total: <span className="font-semibold text-foreground">{formatMoney(String(totalImpact), "EUR")}</span>
          </span>
        </div>
        <button
          onClick={handleApproveAll}
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-md bg-primary/10 px-3 text-base font-medium text-primary transition-colors hover:bg-primary/15 sm:h-auto sm:w-auto sm:py-1.5"
        >
          <Icon icon={CheckCircle2} size={12} />
          Aprobar todo ({actions.length})
        </button>
      </div>

      {/* Actions list */}
      <div className="space-y-3">
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            onApprove={handleApprove}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
}
