"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { MasterAirport } from "@/lib/master-airports";

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
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <input
          className="h-11 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 md:text-sm"
          placeholder="Buscar aeropuerto..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">IATA</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Aeropuerto</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Ciudad</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide hidden sm:table-cell">País</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((a) => (
              <tr key={a.iata} className="hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{a.iata}</td>
                <td className="px-3 py-2 text-foreground">{a.name}</td>
                <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{a.city}</td>
                <td className="px-3 py-2 hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-mono text-xs">{a.countryCode}</span>
                    <span>{a.country}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">Sin resultados</div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {airports.length} aeropuertos</p>
    </div>
  );
}
