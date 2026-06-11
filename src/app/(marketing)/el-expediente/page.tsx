import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  UserCheck,
  Satellite,
  CalendarDays,
  ClipboardList,
  Users,
} from "lucide-react";

import { Icon } from "@/components/icon";
import { ExpedienteCardDemo } from "@/components/marketing/expediente-card-demo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "El expediente — Manann",
  description:
    "El expediente es el corazón del trabajo del transitario. En Manann se rellena solo desde el Bill of Lading: la IA propone cada campo con su confianza y tú confirmas.",
};

const NOTES = [
  {
    icon: Sparkles,
    title: "Ámbar = lo hizo la IA",
    body: "Cada campo extraído por el modelo lleva borde ámbar y su nivel de confianza (p. ej. «IA · 0,97»). Es una regla del sistema: el ámbar nunca decora, siempre significa «esto lo propuso la máquina».",
  },
  {
    icon: UserCheck,
    title: "Lo dudoso, a revisión",
    body: "Cuando la confianza baja de 0,70, el campo se marca como «revisar». La IA no esconde sus dudas: te las señala para que pongas el ojo donde importa.",
  },
  {
    icon: FileText,
    title: "Un documento, un expediente",
    body: "Del Bill of Lading salen la naviera, el buque, los puertos, el contenedor, las partes y la mercancía. Lo que era teclear se convierte en leer y confirmar.",
  },
];

const LIVE = [
  {
    icon: Satellite,
    title: "Tracking en tiempo real",
    body: "Vincula el número de contenedor y ShipsGo devuelve posición del buque, puerto de escala y eventos de ruta. El expediente sabe dónde está el envío.",
  },
  {
    icon: Sparkles,
    title: "Resumen ejecutivo",
    body: "La IA lee el estado actual — puertos, ETA, partes, incidencias — y redacta un briefing en lenguaje de jefe de tráfico. Sin abrir cada panel.",
  },
  {
    icon: CalendarDays,
    title: "ETA en el calendario",
    body: "La fecha de llegada va directamente a la vista mensual compartida. Un golpe de ojo y sabes qué semana se acumula trabajo en el equipo.",
  },
  {
    icon: ClipboardList,
    title: "Auditoría de cambios",
    body: "Cada modificación queda registrada: quién actuó, cuándo y desde dónde (humano, IA o sistema). La trazabilidad no es opcional, es el comportamiento por defecto.",
  },
  {
    icon: Users,
    title: "Responsable asignado",
    body: "Cada expediente tiene un agente a cargo. El responsable recibe aviso al ser asignado y puede filtrar sus expedientes con un clic.",
  },
];

export default function ElExpedientePage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-12 pb-12 pt-16 lg:grid-cols-[1fr_1fr] lg:gap-16 sm:pt-24">
        <div>
          <p className="eyebrow">El expediente</p>
          <h1 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            El corazón de tu trabajo, sin el tecleo.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            El expediente es el objeto central del transitario: reúne el envío,
            sus partes, el contenedor, la mercancía, el tracking y los costes. En
            Manann no lo rellenas campo a campo — lo lee la IA del documento y tú
            confirmas.
          </p>
        </div>
        <ExpedienteCardDemo />
      </section>

      {/* Convenciones */}
      <section className="border-t border-border py-16">
        <p className="eyebrow">Cómo leerlo</p>
        <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
          Verás siempre quién propuso cada dato.
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {NOTES.map((n) => (
            <div
              key={n.title}
              className="rounded-lg border border-border bg-card p-6"
            >
              <Icon icon={n.icon} size={22} className="text-accent" />
              <h3 className="mt-4 font-display text-lg font-medium tracking-tight text-foreground">
                {n.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {n.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ciclo de vida: creación */}
      <section className="border-t border-border py-16">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">El ciclo</p>
            <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              De documento a expediente confirmado.
            </h2>
          </div>
          <ol className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Subido.</strong>{" "}
              El BL llega al expediente como documento, listo para leerse.
            </li>
            <li>
              <strong className="font-medium text-foreground">Leído.</strong> La
              IA extrae los campos y los propone en ámbar, con su confianza.
            </li>
            <li>
              <strong className="font-medium text-foreground">
                Confirmado.
              </strong>{" "}
              Revisas, corriges lo dudoso y vuelcas los datos al expediente.
            </li>
          </ol>
        </div>
      </section>

      {/* En ruta: vida del expediente */}
      <section className="border-t border-border py-16">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">En ruta</p>
            <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              El expediente sigue vivo después de la confirmación.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Crear el expediente es el primer paso. Manann acompaña el envío
              hasta la entrega.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {LIVE.map((l) => (
              <div key={l.title}>
                <span className="flex size-9 items-center justify-center rounded-md border border-border text-primary">
                  <Icon icon={l.icon} size={18} />
                </span>
                <h3 className="mt-4 font-display font-medium tracking-tight text-foreground">
                  {l.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-medium tracking-tight text-foreground">
          El sistema conoce la ruta. Tú mantienes el rumbo.
        </h2>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/login"
            prefetch={false}
            className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
          >
            Ver la demo en vivo
          </Link>
          <Link
            href="/como-funciona"
            prefetch={false}
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
          >
            Cómo funciona
          </Link>
        </div>
      </section>
    </div>
  );
}
