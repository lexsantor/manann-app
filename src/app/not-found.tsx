import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[80dvh] max-w-[1080px] flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
        Esta ruta aún no existe.
      </h1>
      <p className="max-w-md font-sans text-lg text-muted-foreground">
        La página que buscas no está en la demo todavía — o se ha perdido en la
        niebla.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
      >
        Volver al inicio
      </Link>
    </main>
  );
}
