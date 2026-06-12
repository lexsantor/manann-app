import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-[80dvh] max-w-[1080px] flex-col items-center justify-center gap-6 overflow-hidden px-6 text-center">
      {/* Decorative background number — pure display, no semantic role */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-display text-[30vw] font-medium leading-none tracking-tight text-foreground/[0.035]"
      >
        404
      </span>

      <div className="relative z-10 flex flex-col items-center gap-5">
        <p className="eyebrow">Error 404</p>
        <h1 className="max-w-lg font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Esta página se ha perdido en la ruta.
        </h1>
        <p className="max-w-sm font-sans text-base leading-relaxed text-muted-foreground">
          La dirección que buscas no existe en esta demo — o el contenedor cayó
          por la borda antes de llegar a destino.
        </p>
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
