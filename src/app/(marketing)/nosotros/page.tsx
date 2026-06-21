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
    body: "La operativa del transitario: vasta, cambiante, peligrosa si no la conoces. No es la enemiga. Es el terreno.",
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
              Donde otros ven caos,{" "}
              <span className="text-gradient-primary">tú ves una ruta.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Manann nace de una idea sencilla: que la persona que coordina cargas
              internacionales recupere el mando sobre un trabajo que hoy la
              desborda. La parte mecánica del expediente (el papeleo, los pasos
              repetibles, los avisos) la lleva el sistema. Las decisiones, tú.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              El software del sector se quedó anclado en otra época. Pantallas que
              parecen de hace veinte años, datos repartidos entre Excel, el correo y
              media docena de herramientas que no se hablan entre sí, y procesos que
              dependen de lo que recuerda quien lleva tiempo en la empresa. Mientras
              el comercio mundial se acelera, quien lo coordina sigue tecleando lo
              mismo a mano, expediente tras expediente.
            </p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Manann es un proyecto personal de{" "}
              <a href="https://www.linkedin.com/in/lexsantor" target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-primary/40 underline-offset-2 transition-colors hover:text-primary">Lex Sánchez</a>: el empeño de
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

      {/* El panorama (investigación) — surface */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-20 sm:px-6 sm:py-28">
          <FadeUp>
            <p className="eyebrow">El panorama</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Treinta años de internet.{" "}
              <span className="text-gradient-primary">El sector sigue tecleando.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              No es una opinión. Es lo que dicen los datos sobre el software con el que se mueve la carga del mundo.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
              {[
                { stat: "≈40%", claim: "del comercio en contenedor todavía depende del Bill of Lading en papel.", src: "McKinsey, 2022" },
                { stat: "50 hojas · 30 actores", claim: "es lo que puede exigir documentar un solo envío.", src: "McKinsey, 2022" },
                { stat: "1 de cada 3", claim: "transitarios no tiene sus sistemas (tráfico, aduanas, almacén) integrados.", src: "Accenture, 2023" },
                { stat: "1994", claim: "el año en que nació el software que aún domina el sector. El líder en español, en 1999.", src: "WiseTech · El Economista" },
              ].map((f) => (
                <div key={f.stat} className="bg-card px-6 py-7">
                  <p className="font-display text-3xl font-semibold text-gradient-primary sm:text-4xl">{f.stat}</p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground">{f.claim}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/55">{f.src}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="mt-10 max-w-2xl text-base leading-relaxed text-muted-foreground">
              No es falta de IA. Casi todos ya la han añadido al borde. El problema es el cimiento: plataformas de hace treinta años y documentos que se teclean a mano.{" "}
              <span className="text-foreground">Manann nace al revés. Arrastras el documento y el expediente se construye solo.</span>
            </p>
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
                className={cn(buttonVariants({ variant: "secondary", size: "hero" }))}
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
