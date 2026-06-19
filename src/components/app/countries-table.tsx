"use client";

import { useState } from "react";
import type { MasterCountry } from "@/lib/master-countries";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchField } from "@/components/ui/search-field";

const REGIONS = ["Todas", "Europa", "Asia", "América", "África", "Oceanía"];

const COLUMNS: Column<MasterCountry>[] = [
  {
    key: "code",
    header: "Alpha-2",
    cell: (c) => <span className="font-mono text-xs font-bold text-primary">{c.code}</span>,
  },
  {
    key: "code3",
    header: "Alpha-3",
    card: "hidden",
    cell: (c) => <span className="font-mono text-xs text-muted-foreground">{c.code3}</span>,
  },
  { key: "name", header: "Nombre (ES)", card: "title", cell: (c) => c.name },
  {
    key: "nameEn",
    header: "Nombre (EN)",
    card: "hidden",
    cell: (c) => <span className="text-muted-foreground">{c.nameEn}</span>,
  },
  {
    key: "region",
    header: "Región",
    card: "hidden",
    cell: (c) => <span className="text-xs text-muted-foreground">{c.region}</span>,
  },
];

export function CountriesTable({ countries }: { countries: MasterCountry[] }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("Todas");

  const filtered = countries.filter((c) => {
    const matchRegion = region === "Todas" || c.region === region;
    const matchQ =
      !q.trim() ||
      c.code.toLowerCase().includes(q.toLowerCase()) ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(q.toLowerCase());
    return matchRegion && matchQ;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField
          value={q}
          onChange={setQ}
          placeholder="Buscar país…"
          className="w-full sm:w-64"
          aria-label="Buscar país"
        />
        <div className="flex flex-wrap gap-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                region === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={filtered}
        getRowKey={(c) => c.code}
        caption="Países"
        empty="Sin resultados"
      />
      <p className="text-xs text-muted-foreground">{filtered.length} de {countries.length} países</p>
    </div>
  );
}
