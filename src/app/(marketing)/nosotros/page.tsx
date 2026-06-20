import type { Metadata } from "next";
import Link from "next/link";
import { Anchor, Compass, Eye, ShieldCheck } from "lucide-react";

import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGrid, StaggerItem } from "@/components/marketing/motion";

export const metadata: Metadata = {
  title: "Nosotros — Manann",
  description:
    "Por qué existe Manann: que quien coordina cargas internacionales recupere el mando sobre un trabajo que hoy lo desborda. El sistema prepara; la persona confirma.",
};

const PILLARS = [
  {
    icon: Compass,
    title: "El mar",
    body: "La operativa del transitario: vasta, cambiante, peligrosa si no la conoces. No es la enemiga — es el terreno.",
  },
  {
    icon: Eye,
    title: "La niebla",
    body: "La complejidad y la falta de visibilidad. Manann la usa a tu favor: revela lo que importa, oculta el ruido.",
  },
  {
    icon: Anchor,
    title: "El mando",
    body: "La persona, siempre al timón. El sistema propone, extrae y prepara; nunca decide por ti en lo crítico.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      {/* Hero — transparent (A) */}
      <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
        <section className="pb-16 pt-16 sm:pt-24">
          <FadeUp>
            <p className="eyebrow">El porqué</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Donde otros ven caos, tú ves una ruta.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Manann nace de una idea sencilla: que la persona que coordina cargas
              internacionales recupere el mando sobre un trabajo que hoy la
              desborda. La travesía mecánica del expediente —el papeleo, los pasos
              repetibles, los avisos— la lleva el sistema. Las decisiones, tú.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Manann es un proyecto personal de{" "}
              <span className="text-foreground">Lex Sánchez</span>: el empeño de
              empujar a un sector que mueve el mundo a modernizarse, tras años
              atascado en interfaces obsoletas y experiencias de usuario que nadie
              debería sufrir.
            </p>
          </FadeUp>
        </section>
      </div>

      {/* El mito — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <p className="eyebrow">El nombre</p>
                <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                  Manannán conocía todas las rutas.
                </h2>
              </div>
              <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
                <p>
                  En la mitología celta,{" "}
                  <strong className="font-medium text-foreground">Manannán
                  mac Lir</strong>{" "}
                  es el dios del mar. No lucha contra el océano: lo gobierna.
                  Equipa al viajero y le abre la ruta, pero el viajero sigue
                  siendo quien decide el rumbo. Esa distinción es el corazón de
                  la marca.
                </p>
                <p>
                  Hay una imagen, la más antigua y mejor atestiguada, que lo
                  resume: donde un marinero ve olas, el experto ve{" "}
                  <em className="text-foreground">una llanura florida</em> sobre
                  la que cabalgar. Misma realidad, dos lecturas. Esa es la
                  promesa de Manann en una sola imagen: convertir lo opaco en
                  terreno legible.
                </p>
                <p>
                  El mito es estructura, no disfraz. Cada símbolo se traduce en
                  algo operativo o se cae. No hay magia en la interfaz; hay
                  claridad.
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* Pilares — transparent (C) */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <StaggerGrid className="grid gap-6 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <StaggerItem key={p.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-surface-2">
                  <Icon icon={p.icon} size={22} className="text-primary" />
                  <h3 className="mt-4 font-display text-lg font-medium tracking-tight text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* El enemigo — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
                <p className="eyebrow">El enemigo</p>
                <p>
                  No combatimos a un competidor concreto, sino a una{" "}
                  <strong className="font-medium text-foreground">
                    condición del sector
                  </strong>
                  : el data-entry manual que erosiona márgenes ya de un solo
                  dígito. Las pantallas saturadas. La curva de aprendizaje de
                  semanas. La IA usada como adorno.
                </p>
                <p>
                  Por eso el &ldquo;no&rdquo; más importante de Manann: la IA no decide por
                  ti. Lee el documento, propone, prepara el expediente. La
                  confirmación crítica es siempre humana. Como un buen
                  administrativo que ya ha hecho el 90 % del trabajo cuando
                  llegas.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-6">
                <Icon
                  icon={ShieldCheck}
                  size={20}
                  className="mt-0.5 shrink-0 text-accent"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    La IA propone; el humano confirma.
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Es el reparto que nos separa de la ola de &ldquo;IA autónoma&rdquo; del
                    sector. Y es innegociable.
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* CTA — transparent (C) */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-20 text-center sm:px-6">
          <FadeUp>
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-medium tracking-tight text-foreground">
              El sistema conoce la ruta. Tú mantienes el rumbo.
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/#demo"
                className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
              >
                Ver la demo
              </Link>
              <Link
                href="/contacto"
                prefetch={false}
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                Hablar con nosotros
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </>
  );
}
