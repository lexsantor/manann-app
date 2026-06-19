"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface ShipmentRow {
  id: string;
  reference: string;
  mode?: string | null;
  status?: string | null;
  pol?: string | null;
  pod?: string | null;
  carrier?: string | null;
  eta?: Date | string | null;
  etd?: Date | string | null;
  blNumber?: string | null;
  loadType?: string | null;
  createdAt: Date;
}

const STATUS_STYLES: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  en_transito: "bg-info/10 text-info",
  entregado: "bg-success/10 text-success",
  cancelado: "bg-destructive/10 text-destructive",
};

const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  en_transito: "En tránsito",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export function ShipmentModeList({
  shipments,
  emptyLabel = "Sin expedientes",
}: {
  shipments: ShipmentRow[];
  emptyLabel?: string;
}) {
  if (shipments.length === 0) {
    return <EmptyState title={emptyLabel} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Referencia</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Origen → Destino</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Naviera / Carrier</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">ETD</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">ETA</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
            <th className="px-4 py-2.5 w-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {shipments.map((s) => {
            const statusClass = STATUS_STYLES[s.status ?? ""] ?? "bg-muted text-muted-foreground";
            const statusLabel = STATUS_LABELS[s.status ?? ""] ?? s.status ?? "—";
            return (
              <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-2.5">
                  <Link href={`/expedientes/${s.id}`} className="font-mono text-xs font-medium text-primary hover:underline">
                    {s.reference}
                  </Link>
                  {s.blNumber && (
                    <div className="text-xs text-muted-foreground/60 mt-0.5">{s.blNumber}</div>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {s.pol || "—"} → {s.pod || "—"}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{s.carrier || "—"}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {s.etd ? new Date(s.etd).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "—"}
                </td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground">
                  {s.eta ? new Date(s.eta).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium", statusClass)}>
                    {statusLabel}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link href={`/expedientes/${s.id}`} aria-label={`Ver expediente ${s.reference}`} className="text-muted-foreground hover:text-foreground">
                    <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
