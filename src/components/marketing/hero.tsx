import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HeroDashboard } from "./hero-dashboard";
import { HeroAura } from "./hero-aura";

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      <HeroAura variant={0} />

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
            Arrastra un Bill of Lading. La IA lee cada campo, prepara el expediente
            y tú confirmas en minutos, no en horas.
          </p>
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-3 hero-enter"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            <Link
              href="/login"
              prefetch={false}
              className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
            >
              Ver la demo en vivo <Icon icon={ArrowRight} size={18} />
            </Link>
            <Link
              href="/como-funciona"
              className={cn(buttonVariants({ variant: "secondary", size: "hero" }))}
            >
              Cómo funciona
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
