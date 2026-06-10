import type { Metadata } from "next";
import Link from "next/link";
import { Upload, ScanText, CheckCircle2 } from "lucide-react";

import { Hero } from "@/components/marketing/hero";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Manann — El sistema conoce la ruta. Tú mantienes el rumbo.",
  description:
    "ERP transitario con IA documental. Arrastra un Bill of Lading y el expediente se rellena solo. La IA propone, el humano confirma.",
};

const STEPS = [
  {
    icon: Upload,
    title: "Arrastra el BL",
    body: "Suelta el Bill of Lading en PDF. Sin plantillas ni formularios previos que rellenar.",
  },
  {
    icon: ScanText,
    title: "La IA extrae",
    body: "Manann lee naviera, puertos, contenedores y mercancía — con un nivel de confianza por cada campo.",
  },
  {
    icon: CheckCircle2,
    title: "Tú confirmas",
    body: "Revisas lo que la IA propone, corriges lo dudoso, y el expediente queda creado.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="como-funciona" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-20 sm:px-6 sm:py-24">
          <p className="eyebrow">Cómo funciona</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Tres pasos. El data-entry manual desaparece.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-surface-2"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-md border border-border text-primary">
                    <Icon icon={s.icon} size={20} />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-medium tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-20 text-center sm:px-6 sm:py-28">
          <h2 className="mx-auto max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Mira cómo un documento se convierte en expediente.
          </h2>
          <p className="mx-auto mt-5 max-w-md font-sans text-lg text-muted-foreground">
            La diferencia entre un ERP de 2008 y uno que entiende lo que lee.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              prefetch={false}
              className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
            >
              Ver la demo en vivo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
