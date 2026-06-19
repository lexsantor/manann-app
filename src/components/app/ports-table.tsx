"use client";

import { useState } from "react";
import type { MasterPort } from "@/lib/master-ports";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchField } from "@/components/ui/search-field";

const COLUMNS: Column<MasterPort>[] = [
  {
    key: "locode",
    header: "LOCODE",
    cell: (p) => <span className="font-mono text-xs font-medium text-primary">{p.locode}</span>,
  },
  { key: "name", header: "Puerto", card: "title", cell: (p) => p.name },
  {
    key: "country",
    header: "País",
    card: "hidden",
    cell: (p) => (
      <span className="inline-flex items-center gap-1.5">
        <span className="font-mono text-xs">{p.countryCode}</span>
        <span>{p.country}</span>
      </span>
    ),
  },
  {
    key: "coords",
    header: "Coords",
    align: "right",
    card: "hidden",
    cell: (p) => (
      <span className="font-mono text-xs">
        {p.lat.toFixed(2)}, {p.lon.toFixed(2)}
      </span>
    ),
  },
];

export function PortsTable({ ports }: { ports: MasterPort[] }) {
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? ports.filter(
        (p) =>
          p.locode.toLowerCase().includes(q.toLowerCase()) ||
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          p.country.toLowerCase().includes(q.toLowerCase()) ||
          p.countryCode.toLowerCase().includes(q.toLowerCase()),
      )
    : ports;

  return (
    <div className="space-y-3">
      <SearchField
        value={q}
        onChange={setQ}
        placeholder="Buscar puerto…"
        className="max-w-xs"
        aria-label="Buscar puerto"
      />
      <DataTable
        columns={COLUMNS}
        rows={filtered}
        getRowKey={(p) => p.locode}
        caption="Puertos marítimos"
        empty="Sin resultados"
      />
      <p className="text-xs text-muted-foreground">
        {filtered.length} de {ports.length} puertos
      </p>
    </div>
  );
}
