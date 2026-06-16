import * as React from "react";
import { cn } from "@/lib/utils";

// Skeleton tokenizado para estados de carga (Suspense / loading.tsx).
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

// Skeleton de tabla — imita la cabecera + N filas del DataTable.
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex gap-4 border-b border-border bg-muted/40 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={cn("flex items-center gap-4 border-b border-border/40 px-4 py-3", r % 2 && "bg-muted/40")}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn("h-3.5 flex-1", c === 0 && "max-w-[40%]")} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Skeleton de fila de KPIs.
export function KpiRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-7 w-20" />
        </div>
      ))}
    </div>
  );
}
