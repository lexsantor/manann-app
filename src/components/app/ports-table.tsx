"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { MasterPort } from "@/lib/master-ports";

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
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <input
          className="h-11 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 md:text-sm"
          placeholder="Buscar puerto..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">LOCODE</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Puerto</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">País</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">Coords</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.locode} className="hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2 font-mono text-xs font-medium text-primary">{p.locode}</td>
                <td className="px-3 py-2 text-foreground">{p.name}</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-mono text-xs">{p.countryCode}</span>
                    <span>{p.country}</span>
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">
                  {p.lat.toFixed(2)}, {p.lon.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">Sin resultados</div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} de {ports.length} puertos</p>
    </div>
  );
}
