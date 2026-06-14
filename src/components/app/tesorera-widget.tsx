"use client";

import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

interface PendingInvoice {
  id: string;
  reference: string | null;
  total: string | number | null;
  dueDate: string | Date | null;
  status: string;
}

interface TesoreraWidgetProps {
  totalCobrar: number;
  totalPagar: number;
  pendingInvoices: PendingInvoice[];
}

export function TesoreraWidget({ totalCobrar, totalPagar, pendingInvoices }: TesoreraWidgetProps) {
  const balance = totalCobrar - totalPagar;
  const overdueCount = pendingInvoices.filter((i) => {
    if (!i.dueDate) return false;
    return new Date(i.dueDate) < new Date();
  }).length;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <div className="mb-1 flex items-center gap-1.5">
          <Icon icon={TrendingUp} size={13} className="text-emerald-400" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Por cobrar</span>
        </div>
        <p className="font-display text-2xl font-semibold tracking-tight text-foreground">{fmt(totalCobrar)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {pendingInvoices.length} factura{pendingInvoices.length !== 1 ? "s" : ""} pendiente{pendingInvoices.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <div className="mb-1 flex items-center gap-1.5">
          <Icon icon={TrendingDown} size={13} className="text-accent" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Por pagar</span>
        </div>
        <p className="font-display text-2xl font-semibold tracking-tight text-foreground">{fmt(totalPagar)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Gastos sin liquidar</p>
      </div>

      <div className={cn("rounded-xl border bg-card px-5 py-4", balance >= 0 ? "border-border" : "border-accent/30 bg-accent/5")}>
        <div className="mb-1 flex items-center gap-1.5">
          {overdueCount > 0 && <Icon icon={AlertCircle} size={13} className="text-accent" />}
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Saldo neto</span>
        </div>
        <p className={cn("font-display text-2xl font-semibold tracking-tight", balance >= 0 ? "text-emerald-400" : "text-accent")}>
          {fmt(balance)}
        </p>
        {overdueCount > 0 ? (
          <p className="mt-0.5 text-xs text-accent">
            {overdueCount} factura{overdueCount !== 1 ? "s" : ""} vencida{overdueCount !== 1 ? "s" : ""}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">Al corriente</p>
        )}
      </div>
    </div>
  );
}
