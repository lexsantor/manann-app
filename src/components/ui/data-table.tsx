import * as React from "react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

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
  // Ancho fijo de columna (clase, p.ej. "w-24"). Si alguna columna lo define, la
  // tabla pasa a table-fixed para que el ancho no cambie al filtrar/cambiar datos.
  width?: string;
  // Rol en la vista de tarjetas (móvil). Por defecto: el título es la primera
  // columna con `header` string no vacío; el resto son pares etiqueta/valor.
  card?: "title" | "hidden";
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
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  empty?: React.ReactNode;
  className?: string;
  /** Nombre accesible de la tabla (WCAG 1.3.1): se aplica como aria-label. */
  caption?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState className={className} title={empty} />;
  }

  // Columna que actúa de título en las tarjetas: la marcada `card: "title"`,
  // o la primera con header string no vacío, o la primera disponible.
  const cardCols = columns.filter((c) => c.card !== "hidden");
  const titleCol =
    cardCols.find((c) => c.card === "title") ??
    cardCols.find((c) => typeof c.header === "string" && c.header.trim() !== "") ??
    cardCols[0];

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      {/* Escritorio: tabla (con scroll-x de seguridad) */}
      <div className="hidden overflow-x-auto md:block">
        <table
          className={cn("w-full min-w-[680px] text-sm", columns.some((c) => c.width) && "table-fixed")}
          aria-label={caption}
        >
          {columns.some((c) => c.width) && (
            <colgroup>
              {columns.map((c) => (
                <col key={c.key} className={c.width} />
              ))}
            </colgroup>
          )}
          <thead>
            <tr className="border-b border-border bg-muted/70">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 label-mono font-medium text-muted-foreground",
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
                    className={cn(
                      "px-4 py-3 align-middle",
                      // La columna-título destaca (foreground); el resto, muted.
                      c === titleCol ? "font-medium text-foreground" : "text-muted-foreground",
                      ALIGN[c.align ?? "left"],
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Móvil: tarjetas jerarquizadas (título + pares etiqueta/valor) */}
      <div className="divide-y divide-border/60 md:hidden">
        {rows.map((row, i) => (
          <div key={getRowKey(row, i)} className="space-y-2.5 p-4">
            {titleCol ? (
              <div className="text-sm font-medium text-foreground">{titleCol.cell(row)}</div>
            ) : null}
            {cardCols
              .filter((c) => c !== titleCol)
              .map((c) => {
                const label = typeof c.header === "string" ? c.header.trim() : "";
                const value = c.cell(row);
                if (!label) {
                  return (
                    <div key={c.key} className="pt-0.5">
                      {value}
                    </div>
                  );
                }
                return (
                  <div key={c.key} className="flex items-start justify-between gap-3">
                    <span className="shrink-0 pt-0.5 label-mono text-muted-foreground">
                      {label}
                    </span>
                    <span className="min-w-0 text-right text-sm text-foreground">{value}</span>
                  </div>
                );
              })}
          </div>
        ))}
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
