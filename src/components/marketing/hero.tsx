import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroDashboard } from "./hero-dashboard";

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
            El expediente{" "}
            <span className="text-gradient-primary">se rellena solo.</span>
          </h1>
          <p
            className="mx-auto mt-7 max-w-xl font-sans text-lg leading-relaxed text-muted-foreground hero-enter"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            Manann lee el Bill of Lading, extrae cada campo con su confianza y
            prepara el expediente. Tú confirmas.{" "}
            <span className="text-foreground/70">El ERP que el sector merecía,</span>{" "}
            por fin existe.
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

        {/* Dashboard preview */}
        <div
          id="demo"
          className="mt-16 scroll-mt-24 hero-enter"
          style={{ "--i": 5 } as React.CSSProperties}
        >
          <HeroDashboard />
        </div>
      </section>
    </div>
  );
}
