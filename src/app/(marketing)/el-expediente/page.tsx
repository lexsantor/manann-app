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
  Building2,
  GitCompare,
  FileCheck2,
  ArrowLeftRight,
  TrendingUp,
  FileClock,
  AlertTriangle,
} from "lucide-react";

import { Icon } from "@/components/icon";
import { ExpedienteCardDemo } from "@/components/marketing/expediente-card-demo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGrid, StaggerItem } from "@/components/marketing/motion";

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
    body: "La IA lee el estado actual (puertos, ETA, partes, incidencias) y redacta un briefing en lenguaje de jefe de tráfico. Sin abrir cada panel.",
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
  {
    icon: Building2,
    title: "Directorio de contactos",
    body: "Exportadores, importadores, navieras y agentes se registran automáticamente. Sin alta manual: cada expediente construye el directorio del equipo.",
  },
  {
    icon: GitCompare,
    title: "Comparativa BL vs. factura",
    body: "La IA cruza los dos documentos y marca en ámbar cada campo que difiere. Detecta errores de valor, peso o descripción antes de que lleguen a aduanas.",
  },
  {
    icon: FileCheck2,
    title: "Aduanas y DUA",
    body: "Cuando el envío llega a aduanas, el DUA se prerellena desde el expediente. HS code, valor, régimen y partes, listos para revisar sin reintroducir un solo dato.",
  },
];

const FINANZAS = [
  {
    icon: ArrowLeftRight,
    title: "Compra y venta por línea",
    body: "Cada cargo lleva su lado: lo que cuesta y lo que se factura. El expediente conoce el coste y el ingreso de cada concepto, no solo el total.",
  },
  {
    icon: TrendingUp,
    title: "GP y margen en vivo",
    body: "El beneficio bruto y el margen se calculan solos a medida que entran costes e ingresos. Lo ves antes de facturar, no en una hoja aparte al cierre.",
  },
  {
    icon: FileClock,
    title: "Accrual vs. factura real",
    body: "Hasta que llega la factura del proveedor, el coste vive como provisión. Cuando llega la real, Manann cuadra la diferencia y avisa si se desvía.",
  },
  {
    icon: AlertTriangle,
    title: "At-risk y margen fugado",
    body: "Si el margen baja del umbral o un coste se dispara, el expediente lo marca. El dinero que se escapa se ve antes de que sea tarde.",
  },
];

export default function ElExpedientePage() {
  return (
    <>
      {/* Hero — transparent (A) */}
      <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
        <section className="grid items-center gap-12 pb-12 pt-16 lg:grid-cols-[1fr_1fr] lg:gap-16 sm:pt-24">
          <FadeUp>
            <p className="eyebrow">El expediente</p>
            <h1 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              El corazón de tu trabajo, sin el tecleo.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              El expediente es el objeto central del transitario: reúne el envío,
              sus partes, el contenedor, la mercancía, el tracking y los costes. En
              Manann no lo rellenas campo a campo. Lo lee la IA del documento y tú
              confirmas.
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ExpedienteCardDemo />
          </FadeUp>
        </section>
      </div>

      {/* Convenciones — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <p className="eyebrow">Cómo leerlo</p>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Verás siempre quién propuso cada dato.
            </h2>
          </FadeUp>
          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-3">
            {NOTES.map((n) => (
              <StaggerItem key={n.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-background">
                  <Icon icon={n.icon} size={22} className="text-accent" />
                  <h3 className="mt-4 font-display text-lg font-medium tracking-tight text-foreground">
                    {n.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {n.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* Ciclo de vida — transparent (C) */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
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
                  El BL marítimo, AWB aéreo o CMR terrestre llega al expediente como documento, listo para leerse.
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
          </FadeUp>
        </div>
      </div>

      {/* En ruta — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <p className="eyebrow">En ruta</p>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              El expediente sigue vivo después de la confirmación.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              Crear el expediente es el primer paso. Manann acompaña el envío
              hasta la entrega.
            </p>
          </FadeUp>
          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LIVE.map((l) => (
              <StaggerItem key={l.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-background">
                  <span className="flex size-9 items-center justify-center rounded-md border border-border text-primary">
                    <Icon icon={l.icon} size={18} />
                  </span>
                  <h3 className="mt-4 font-display font-medium tracking-tight text-foreground">
                    {l.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {l.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* La capa financiera — transparent (C) */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <p className="eyebrow">La capa financiera</p>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              El margen no es una hoja aparte. Vive en el expediente.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              Del coste al cobro, sin salir del expediente. Cada línea sabe lo
              que cuesta y lo que factura, y el margen está siempre a la vista.
            </p>
          </FadeUp>
          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FINANZAS.map((f) => (
              <StaggerItem key={f.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-surface-2">
                  <span className="flex size-9 items-center justify-center rounded-md border border-border text-primary">
                    <Icon icon={f.icon} size={18} />
                  </span>
                  <h3 className="mt-4 font-display font-medium tracking-tight text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {f.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* CTA — transparent (C) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-20 text-center sm:px-6">
          <FadeUp>
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
                className={cn(buttonVariants({ variant: "secondary", size: "hero" }))}
              >
                Cómo funciona
              </Link>
            </div>
          </FadeUp>
        </div>
      </div>
    </>
  );
}
