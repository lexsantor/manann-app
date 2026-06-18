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
      {/* Atmósfera: degradado de marca sutil + glow difuso (decorativo) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.10] via-transparent to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/[0.08] blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="font-mono text-xs font-medium uppercase tracking-wider text-primary/80">
              {eyebrow}
            </p>
          ) : null}
          <div className="mt-1.5 flex items-start gap-3">
            {icon ? (
              <span className="mt-0.5 shrink-0 text-muted-foreground [&_svg]:h-5 [&_svg]:w-5 sm:[&_svg]:h-6 sm:[&_svg]:w-6">
                {icon}
              </span>
            ) : null}
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div>
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
