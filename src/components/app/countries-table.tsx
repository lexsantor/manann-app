"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { MasterCountry } from "@/lib/master-countries";

const REGIONS = ["Todas", "Europa", "Asia", "América", "África", "Oceanía"];

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
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            className="h-11 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 md:text-sm"
            placeholder="Buscar país..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
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

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Alpha-2</th>
              <th className="hidden px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide sm:table-cell">Alpha-3</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre (ES)</th>
              <th className="hidden px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide sm:table-cell">Nombre (EN)</th>
              <th className="hidden px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide sm:table-cell">Región</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.code} className="hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{c.code}</td>
                <td className="hidden px-3 py-2 font-mono text-xs text-muted-foreground sm:table-cell">{c.code3}</td>
                <td className="px-3 py-2 text-foreground">{c.name}</td>
                <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">{c.nameEn}</td>
                <td className="hidden px-3 py-2 sm:table-cell">
                  <span className="text-xs text-muted-foreground">{c.region}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">Sin resultados</div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {countries.length} países</p>
    </div>
  );
}
