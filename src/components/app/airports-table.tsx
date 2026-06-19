"use client";

import { useState } from "react";
import type { MasterAirport } from "@/lib/master-airports";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchField } from "@/components/ui/search-field";

const COLUMNS: Column<MasterAirport>[] = [
  {
    key: "iata",
    header: "IATA",
    cell: (a) => <span className="font-mono text-xs font-bold text-primary">{a.iata}</span>,
  },
  { key: "name", header: "Aeropuerto", card: "title", cell: (a) => a.name },
  {
    key: "city",
    header: "Ciudad",
    card: "hidden",
    cell: (a) => <span className="text-muted-foreground">{a.city}</span>,
  },
  {
    key: "country",
    header: "País",
    card: "hidden",
    cell: (a) => (
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className="font-mono text-xs">{a.countryCode}</span>
        <span>{a.country}</span>
      </span>
    ),
  },
];

export function AirportsTable({ airports }: { airports: MasterAirport[] }) {
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? airports.filter(
        (a) =>
          a.iata.toLowerCase().includes(q.toLowerCase()) ||
          a.name.toLowerCase().includes(q.toLowerCase()) ||
          a.city.toLowerCase().includes(q.toLowerCase()) ||
          a.country.toLowerCase().includes(q.toLowerCase()),
      )
    : airports;

  return (
    <div className="space-y-3">
      <SearchField
        value={q}
        onChange={setQ}
        placeholder="Buscar aeropuerto…"
        className="max-w-xs"
        aria-label="Buscar aeropuerto"
      />
      <DataTable
        columns={COLUMNS}
        rows={filtered}
        getRowKey={(a) => a.iata}
        caption="Aeropuertos"
        empty="Sin resultados"
      />
      <p className="text-xs text-muted-foreground">{filtered.length} de {airports.length} aeropuertos</p>
    </div>
  );
}
