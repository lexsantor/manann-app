"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badges";
import { DataTable, type Column } from "@/components/ui/data-table";

type Declaration = {
  id: string;
  type: string;
  referenceNumber: string | null;
  status: string;
  submittedAt: Date | null;
  createdAt: Date;
  shipmentId: string | null;
  shipmentRef: string | null;
};

const TYPE_LABEL: Record<string, string> = { dua: "DUA", ens: "ENS", ncts: "NCTS", aes: "AES" };

const COLUMNS: Column<Declaration>[] = [
  {
    key: "type",
    header: "Tipo",
    cell: (d) => (
      <span className="inline-flex w-fit rounded-md bg-secondary/20 px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
        {TYPE_LABEL[d.type] ?? d.type}
      </span>
    ),
  },
  {
    key: "ref",
    header: "Referencia",
    cell: (d) => <span className="font-mono text-xs text-foreground">{d.referenceNumber ?? "—"}</span>,
  },
  {
    key: "shipment",
    header: "Expediente",
    cell: (d) =>
      d.shipmentId && d.shipmentRef ? (
        <Link href={`/expedientes/${d.shipmentId}`} className="font-mono text-xs text-primary hover:underline">
          {d.shipmentRef}
        </Link>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "status",
    header: "Estado",
    cell: (d) => <StatusBadge status={d.status} />,
  },
  {
    key: "date",
    header: "Fecha",
    cell: (d) => (
      <span className="font-mono text-xs text-muted-foreground">
        {new Date(d.submittedAt ?? d.createdAt).toLocaleDateString("es-ES")}
      </span>
    ),
  },
];

export function AduanasPanel({ declarations }: { declarations: Declaration[] }) {
  const [type, setType] = useState<string>("all");
  const types = ["all", "dua", "ens", "ncts", "aes"];
  const filtered = type === "all" ? declarations : declarations.filter((d) => d.type === type);

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap items-center gap-1 rounded-md bg-muted/40 p-0.5">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            aria-current={type === t ? "true" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              type === t
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "all" ? "Todas" : TYPE_LABEL[t]}
            <span className="ml-1.5 font-mono text-xs text-muted-foreground">
              {t === "all" ? declarations.length : declarations.filter((d) => d.type === t).length}
            </span>
          </button>
        ))}
      </div>

      <DataTable
        columns={COLUMNS}
        rows={filtered}
        getRowKey={(d) => d.id}
        caption="Declaraciones aduaneras"
        empty="Sin declaraciones. Se generan desde cada expediente (panel de Aduanas / Declaraciones)."
      />

      <div className="rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
        <p className="text-xs text-warning">
          Simulación: integración AEAT (DUA · ENS · NCTS · AES) en producción
        </p>
      </div>
    </div>
  );
}
