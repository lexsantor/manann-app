import * as React from "react";
import { cn } from "@/lib/utils";

// Estado vacío unificado — un único patrón para todos los "Sin X".
export function EmptyState({
  icon,
  title,
  hint,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="mb-3 text-muted-foreground/40 [&_svg]:h-8 [&_svg]:w-8">{icon}</span>
      ) : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
