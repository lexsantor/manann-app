"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";

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

const STATUS_TONE: Record<string, "success" | "info" | "warning" | "danger" | "neutral"> = {
  borrador: "neutral",
  en_transito: "info",
  entregado: "success",
  cancelado: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  en_transito: "En tránsito",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

function fmtShort(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export function ShipmentModeList({
  shipments,
  emptyLabel = "Sin expedientes",
}: {
  shipments: ShipmentRow[];
  emptyLabel?: string;
}) {
  const columns: Column<ShipmentRow>[] = [
    {
      key: "reference",
      header: "Referencia",
      card: "title",
      cell: (s) => (
        <>
          <Link href={`/expedientes/${s.id}`} className="font-mono text-xs font-medium text-primary hover:underline">
            {s.reference}
          </Link>
          {s.blNumber && (
            <div className="mt-0.5 text-xs text-muted-foreground/60">{s.blNumber}</div>
          )}
        </>
      ),
    },
    {
      key: "route",
      header: "Ruta",
      cell: (s) => <>{s.pol || "—"} → {s.pod || "—"}</>,
    },
    {
      key: "carrier",
      header: "Carrier",
      cell: (s) => s.carrier || "—",
    },
    {
      key: "etd",
      header: "ETD",
      cell: (s) => fmtShort(s.etd),
    },
    {
      key: "eta",
      header: "ETA",
      cell: (s) => fmtShort(s.eta),
    },
    {
      key: "status",
      header: "Estado",
      cell: (s) => (
        <StatusBadge
          status={s.status ?? ""}
          label={STATUS_LABELS[s.status ?? ""] ?? s.status ?? "—"}
          tone={STATUS_TONE[s.status ?? ""] ?? "neutral"}
        />
      ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      card: "hidden",
      cell: (s) => (
        <Link href={`/expedientes/${s.id}`} aria-label={`Ver expediente ${s.reference}`} className="text-muted-foreground hover:text-foreground">
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={shipments}
      getRowKey={(s) => s.id}
      empty={emptyLabel}
    />
  );
}
