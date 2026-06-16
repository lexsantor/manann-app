import * as React from "react";
import { cn } from "@/lib/utils";

// Fila de KPIs: rejilla responsive de tarjetas. Por defecto 4 columnas en
// escritorio (se adapta a 2 en tablet, 1 en móvil).
export function KpiRow({
  children,
  cols = 4,
  className,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const colsClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
  return <div className={cn("grid grid-cols-1 gap-3", colsClass, className)}>{children}</div>;
}

// Tarjeta KPI: label uppercase mono + valor grande + delta/sub opcional.
// `tone` colorea el valor (p. ej. GP en verde). `delta` muestra variación.
export function KpiCard({
  label,
  value,
  sub,
  icon,
  tone = "default",
  delta,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "primary" | "success" | "danger";
  delta?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
}) {
  const valueTone =
    tone === "primary"
      ? "text-primary"
      : tone === "success"
        ? "text-emerald-600 dark:text-emerald-400"
        : tone === "danger"
          ? "text-destructive"
          : "text-foreground";

  const deltaTone =
    delta?.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : delta?.direction === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {icon ? <span className="shrink-0 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">{icon}</span> : null}
      </div>
      <p className={cn("mt-2 font-display text-2xl font-semibold tracking-tight tabular-nums", valueTone)}>
        {value}
      </p>
      {(sub || delta) && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          {delta ? (
            <span className={cn("font-medium tabular-nums", deltaTone)}>
              {delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→"} {delta.value}
            </span>
          ) : null}
          {sub ? <span className="text-muted-foreground">{sub}</span> : null}
        </div>
      )}
    </div>
  );
}
