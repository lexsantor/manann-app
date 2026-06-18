import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Etiqueta de honestidad para funciones simuladas (CLAUDE.md regla 6).
// Pill ámbar (token `warning`) uniforme en toda la app, SIEMPRE en una línea.
// Copy corto y consistente: "Simulación · <sistema> en producción".
export function SimBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning",
        className,
      )}
    >
      {children}
    </span>
  );
}
