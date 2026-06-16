import * as React from "react";
import { cn } from "@/lib/utils";

// Tabla de datos del ERP (lenguaje visual Faro): cabeceras mono MAYÚSCULAS,
// filas con hover y separador, alineación por columna, estado vacío.
// Presentacional y compatible con Server Components: las celdas se renderizan
// con render-props (`cell`), sin estado interno. El buscador/filtros/paginación
// los aporta la página (cliente) cuando hace falta.

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  cell: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

const ALIGN: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty = "Sin resultados",
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  empty?: React.ReactNode;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/70">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                    ALIGN[c.align ?? "left"],
                    c.headerClassName,
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={getRowKey(row, i)}
                className={cn(
                  "border-b border-border/40 last:border-0 transition-colors hover:bg-primary/[0.06]",
                  i % 2 === 0 ? "bg-card" : "bg-muted/40",
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn("px-4 py-3 align-middle", ALIGN[c.align ?? "left"], c.className)}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Celda de dos líneas: valor principal + sub-línea muted (patrón Faro).
export function CellStacked({
  primary,
  secondary,
  mono,
}: {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className={cn("font-medium text-foreground", mono && "font-mono")}>{primary}</span>
      {secondary ? (
        <span className={cn("text-xs text-muted-foreground", mono && "font-mono")}>{secondary}</span>
      ) : null}
    </div>
  );
}

// Mini-barra de progreso (p. ej. margen). value en 0-100.
export function MiniBar({
  value,
  className,
  tone = "primary",
}: {
  value: number;
  className?: string;
  tone?: "primary" | "success" | "danger";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const barTone =
    tone === "success" ? "bg-success" : tone === "danger" ? "bg-destructive" : "bg-primary";
  return (
    <div className={cn("h-1.5 w-16 overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full", barTone)} style={{ width: `${pct}%` }} />
    </div>
  );
}
