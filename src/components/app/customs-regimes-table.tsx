"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface Regime {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

export function CustomsRegimesTable({ regimes }: { regimes: Regime[] }) {
  const [q, setQ] = useState("");

  const filtered = q.trim()
    ? regimes.filter(
        (r) =>
          r.code.toLowerCase().includes(q.toLowerCase()) ||
          r.name.toLowerCase().includes(q.toLowerCase()),
      )
    : regimes;

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <input
          className="h-11 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 md:text-sm"
          placeholder="Buscar régimen..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-20">Código</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{r.code}</td>
                <td className="px-3 py-2 text-foreground font-medium">{r.name}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">Sin resultados</div>
        )}
      </div>
      {regimes.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Los regímenes se cargan mediante seed de base de datos. Ejecuta la migración inicial.
        </p>
      )}
    </div>
  );
}
