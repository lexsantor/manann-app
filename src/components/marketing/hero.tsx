import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExpedienteCardDemo } from "./expediente-card-demo";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1080px] px-5 pb-16 pt-16 sm:px-6 sm:pt-24 lg:pt-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <p className="eyebrow">ERP transitario · IA documental</p>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.5rem]">
            El sistema conoce la ruta. Tú no remas.
          </h1>
          <p className="mt-6 max-w-lg font-sans text-lg leading-relaxed text-muted-foreground">
            Arrastra un Bill of Lading. El expediente se rellena solo. Donde los
            ERP del sector te hacen teclear 40 campos a mano, Manann lee el
            documento — y tú solo confirmas.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/#demo"
              className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
            >
              Ver la demo <Icon icon={ArrowRight} size={18} />
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
            >
              Entrar al ERP
            </Link>
          </div>
          <p className="mt-5 font-mono text-xs text-ink-subtle">
            La IA propone · el humano confirma · nunca azul corporativo
          </p>
        </div>

        <div id="demo" className="scroll-mt-24">
          <ExpedienteCardDemo />
        </div>
      </div>
    </section>
  );
}
