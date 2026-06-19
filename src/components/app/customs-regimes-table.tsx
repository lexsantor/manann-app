"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { SearchField } from "@/components/ui/search-field";

interface Regime {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

const COLUMNS: Column<Regime>[] = [
  {
    key: "code",
    header: "Código",
    cell: (r) => <span className="font-mono text-xs font-bold text-primary">{r.code}</span>,
  },
  { key: "name", header: "Nombre", card: "title", cell: (r) => <span className="font-medium">{r.name}</span> },
  {
    key: "description",
    header: "Descripción",
    card: "hidden",
    cell: (r) => <span className="text-xs text-muted-foreground">{r.description ?? "—"}</span>,
  },
];

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
      <SearchField
        value={q}
        onChange={setQ}
        placeholder="Buscar régimen…"
        className="max-w-xs"
        aria-label="Buscar régimen"
      />
      <DataTable
        columns={COLUMNS}
        rows={filtered}
        getRowKey={(r) => r.id}
        caption="Regímenes aduaneros"
        empty="Sin resultados"
      />
      {regimes.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Los regímenes se cargan mediante seed de base de datos. Ejecuta la migración inicial.
        </p>
      )}
    </div>
  );
}
