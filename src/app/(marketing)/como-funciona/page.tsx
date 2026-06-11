import type { Metadata } from "next";
import Link from "next/link";
import {
  Upload,
  ScanText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cómo funciona — Manann",
  description:
    "Tres pasos: arrastras el Bill of Lading, la IA lo lee y propone, tú confirmas. Donde la competencia te hace teclear 40 campos, Manann los rellena.",
};

const STEPS = [
  {
    icon: Upload,
    title: "Arrastras el BL",
    lead: "Sueltas el Bill of Lading en PDF.",
    body: "Sin plantillas, sin formularios previos, sin elegir un tipo de documento. Arrastras el archivo —o creas un expediente vacío y lo sueltas dentro— y el sistema se pone a trabajar. Es el mismo gesto que harías para adjuntar un correo.",
  },
  {
    icon: ScanText,
    title: "La IA lee y propone",
    lead: "Manann extrae cada campo con su nivel de confianza.",
    body: "El modelo lee el documento como lo haría un administrativo experto: naviera, buque, puertos en código UN/LOCODE, número de BL, contenedor ISO 6346, partes, mercancía, código arancelario. Cada dato llega con una confianza de 0 a 1. Lo que la IA no ve claro (por debajo de 0,70) se marca para que lo revises tú.",
  },
  {
    icon: CheckCircle2,
    title: "Tú confirmas",
    lead: "Revisas lo propuesto, corriges lo dudoso, y el expediente queda creado.",
    body: "Nada se da por hecho sin tu visto bueno. La confirmación crítica es siempre humana: la IA prepara el 90 % del trabajo y tú decides. Al confirmar, los datos se vuelcan al expediente —cabecera, partes, contenedor, mercancía— y queda listo para seguir su travesía.",
  },
];

const GUARANTEES = [
  {
    icon: Clock,
    title: "Minutos, no horas",
    body: "Lo que antes era teclear 40 campos a mano pasa a ser leer y confirmar. El tiempo ahorrado por expediente se acumula sobre márgenes que ya son estrechos.",
  },
  {
    icon: Sparkles,
    title: "La IA propone, no decide",
    body: "El ámbar marca siempre lo que hizo la máquina. Verás exactamente qué leyó y con cuánta confianza. Sin cajas negras.",
  },
  {
    icon: ShieldCheck,
    title: "El mando es tuyo",
    body: "Manann no reserva, no reenruta ni firma nada por su cuenta. Prepara, ordena y avisa. La decisión, siempre del lado humano.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
      <section className="pb-12 pt-16 sm:pt-24">
        <p className="eyebrow">Cómo funciona</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Tres pasos. El data-entry manual desaparece.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Donde los ERP del sector te obligan a teclear, copiar y reintroducir
          cada dato del documento, Manann lo lee y lo propone. Tú solo confirmas.
        </p>
      </section>

      {/* Los tres pasos en detalle */}
      <section className="space-y-px">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="grid gap-6 border-t border-border py-12 lg:grid-cols-[auto_1fr] lg:gap-12"
          >
            <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
              <span className="flex size-11 items-center justify-center rounded-md border border-border text-primary">
                <Icon icon={s.icon} size={22} />
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                0{i + 1}
              </span>
            </div>
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
                {s.title}
              </h2>
              <p className="mt-2 text-lg text-foreground">{s.lead}</p>
              <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Garantías */}
      <section className="border-t border-border py-16">
        <div className="grid gap-px bg-border sm:grid-cols-3">
          {GUARANTEES.map((g) => (
            <div key={g.title} className="bg-background px-8 py-8 first:pl-0 last:pr-0 sm:py-10">
              <Icon icon={g.icon} size={20} className="text-primary" />
              <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-foreground">
                {g.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {g.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-medium tracking-tight text-foreground">
          Míralo con un documento de verdad.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Entra en la demo, arrastra un Bill of Lading y observa cómo se rellena
          el expediente.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            prefetch={false}
            className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
          >
            Ver la demo en vivo
          </Link>
          <Link
            href="/el-expediente"
            prefetch={false}
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
          >
            Qué es un expediente
          </Link>
        </div>
      </section>
    </div>
  );
}
