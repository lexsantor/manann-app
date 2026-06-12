import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExpedienteCardDemo } from "./expediente-card-demo";

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Ambient mesh — local reinforcement over body gradient */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div
          className="ambient-orb absolute -left-[15%] -top-[30%] h-[70vh] w-[70vh] rounded-full blur-[130px]"
          style={{ background: "hsl(172 51% 42% / 0.13)" }}
        />
        <div
          className="absolute -right-[8%] top-[15%] h-[45vh] w-[45vh] rounded-full blur-[100px] opacity-70"
          style={{ background: "hsl(34 69% 61% / 0.07)" }}
        />
      </div>

      <section className="relative mx-auto max-w-[1080px] px-5 pb-12 pt-20 sm:px-6 sm:pt-28 lg:pt-32">
        {/* Headline — centered */}
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="eyebrow hero-enter"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            ERP transitario · IA documental
          </p>
          <h1
            className="mt-5 font-display text-5xl font-medium leading-[1.02] tracking-tight hero-enter sm:text-6xl lg:text-7xl"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            El sistema conoce la ruta.{" "}
            <span className="text-gradient-primary">Tú mantienes el rumbo.</span>
          </h1>
          <p
            className="mx-auto mt-7 max-w-xl font-sans text-lg leading-relaxed text-muted-foreground hero-enter"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Arrastra un Bill of Lading. El expediente se rellena solo. Donde los
            ERP del sector te hacen teclear 40 campos a mano, Manann lee el
            documento — y tú solo confirmas.
          </p>
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-3 hero-enter"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <Link
              href="/#demo"
              className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
            >
              Ver la demo <Icon icon={ArrowRight} size={18} />
            </Link>
            <Link
              href="/login"
              prefetch={false}
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
            >
              Entrar al ERP
            </Link>
          </div>
          <p
            className="mt-5 font-mono text-xs text-ink-subtle hero-enter"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            La IA propone · el humano confirma · el mando es tuyo
          </p>
        </div>

        {/* Browser chrome — product preview */}
        <div
          id="demo"
          className="mt-16 scroll-mt-24 hero-enter"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          {/* Titlebar */}
          <div className="flex items-center gap-3 rounded-t-xl border border-b-0 border-border bg-surface-3 px-4 py-3">
            <div className="flex shrink-0 gap-1.5">
              <span
                className="block size-2.5 rounded-full"
                style={{ background: "hsl(5 72% 58% / 0.7)" }}
              />
              <span
                className="block size-2.5 rounded-full"
                style={{ background: "hsl(38 70% 56% / 0.7)" }}
              />
              <span
                className="block size-2.5 rounded-full"
                style={{ background: "hsl(140 48% 48% / 0.7)" }}
              />
            </div>
            <div className="flex min-w-0 flex-1 justify-center">
              <span className="inline-block max-w-xs truncate rounded-md border border-border/30 bg-background/50 px-4 py-1 font-mono text-[11px] tracking-tight text-muted-foreground/60">
                app.manann.com/expedientes/EXP-2026-0042
              </span>
            </div>
          </div>
          {/* Product window */}
          <div className="overflow-hidden rounded-b-xl border border-t-0 border-border bg-card">
            <div className="mx-auto max-w-md px-6 pb-0 pt-6">
              <ExpedienteCardDemo />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
