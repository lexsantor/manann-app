import * as React from "react";
import { cn } from "@/lib/utils";

// Cabecera estándar de página ERP (lenguaje visual Faro):
//   eyebrow (uppercase mono muted) · título · subtítulo · slot de acciones.
// El icono se alinea con el título (mismo patrón que las páginas existentes).
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div>
        {eyebrow ? (
          <p className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex items-start gap-3">
          {icon ? (
            <span className="mt-0.5 shrink-0 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
          ) : null}
          <div>
            <h1 className="bg-gradient-to-br from-foreground to-foreground/65 bg-clip-text font-display text-2xl font-semibold tracking-tight text-transparent">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
      {actions ? (
        <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0 [&>*]:flex-1 [&>*]:justify-center sm:[&>*]:flex-none sm:[&>*]:justify-start">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
