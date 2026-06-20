import * as React from "react";
import { cn } from "@/lib/utils";

// Cabecera estándar de página ERP como HERO-CARD (lenguaje visual Faro):
// tarjeta con borde + atmósfera (degradado primary sutil), eyebrow con color
// de marca, título grande, subtítulo y slot de acciones. El icono se alinea
// con el título. Mismo API que antes (eyebrow/title/subtitle/icon/actions).
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
    <header
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-6",
        className,
      )}
    >
      {/* Atmósfera: degradado de marca + glow difuso (decorativo, ~20%) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          {/* Icono centrado verticalmente con la línea del título */}
          <div className="mt-1.5 flex items-center gap-3">
            {icon ? (
              <span className="shrink-0 text-muted-foreground [&_svg]:h-6 [&_svg]:w-6 sm:[&_svg]:h-7 sm:[&_svg]:w-7">
                {icon}
              </span>
            ) : null}
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
          </div>
          {subtitle ? (
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full items-center gap-2 sm:w-auto sm:shrink-0 [&>*]:flex-1 [&>*]:justify-center sm:[&>*]:flex-none sm:[&>*]:justify-start">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
