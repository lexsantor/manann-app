import type { Metadata } from "next";
import Link from "next/link";
import {
  Upload,
  ScanText,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  Satellite,
  ClipboardList,
  Users,
} from "lucide-react";

import { Hero } from "@/components/marketing/hero";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGrid, StaggerItem } from "@/components/marketing/motion";

export const metadata: Metadata = {
  title: "Manann — El sistema conoce la ruta. Tú mantienes el rumbo.",
  description:
    "ERP transitario con IA documental. Arrastra un Bill of Lading y el expediente se rellena solo. La IA propone, el humano confirma.",
};

const STEPS = [
  {
    icon: Upload,
    title: "Arrastra el documento",
    body: "Bill of Lading, Booking Confirmation o cualquier documento de embarque en PDF. Sin plantillas ni formularios previos.",
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

const FEATURES = [
  {
    icon: ScanText,
    title: "Extracción documental",
    body: "Un BL rellena el expediente entero. Naviera, buque, puertos, contenedor, partes y mercancía — con nivel de confianza por cada campo.",
  },
  {
    icon: Sparkles,
    title: "Resumen ejecutivo",
    body: "La IA lee el estado actual del envío y redacta un briefing en lenguaje transitario. Lo que necesitas saber antes de la llamada, sin abrir cada panel.",
  },
  {
    icon: Satellite,
    title: "Tracking en vivo",
    body: "Vincula el número de contenedor ISO 6346 y recibe la posición del buque, el puerto de escala y cada evento de ruta directamente de ShipsGo.",
  },
  {
    icon: CalendarDays,
    title: "Calendario de ETAs",
    body: "Vista mensual de todas las llegadas previstas. Detecta a golpe de ojo qué semana se acumula operativa y qué envíos aún no tienen fecha.",
  },
  {
    icon: ClipboardList,
    title: "Trazabilidad de cambios",
    body: "Cada modificación de campo queda registrada: quién actuó, cuándo y si fue el humano, la IA o el sistema. Sin huecos en el historial.",
  },
  {
    icon: Users,
    title: "Equipo y asignación",
    body: "Cada expediente tiene un responsable. Filtra los tuyos con un clic y recibe aviso en cuanto te asignan uno nuevo.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Los tres pasos */}
      <section id="como-funciona" className="scroll-mt-20 border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-20 sm:px-6 sm:py-28">
          <FadeUp>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Tres pasos. El data-entry manual desaparece.
            </h2>
          </FadeUp>
          <div className="mt-14 grid gap-10 sm:grid-cols-3 lg:gap-16">
            {STEPS.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.1}>
                <span className="block font-mono text-[3.5rem] font-light leading-none tracking-tighter text-muted-foreground/20">
                  0{i + 1}
                </span>
                <div className="mt-4 flex size-9 items-center justify-center rounded-md border border-border bg-card text-primary">
                  <Icon icon={s.icon} size={18} />
                </div>
                <h3 className="mt-5 font-display text-xl font-medium tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Sistema completo */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-20 sm:px-6 sm:py-28">
          <FadeUp>
            <p className="eyebrow">De la entrada a la entrega</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              La extracción es la entrada. El resto, también.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              Manann no termina cuando se crea el expediente. Acompaña el envío
              hasta la entrega: tracking, resúmenes, avisos de ETA y trazabilidad
              de cada acción.
            </p>
          </FadeUp>
          <StaggerGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Extracción documental — celda ancha */}
            <StaggerItem className="sm:col-span-2 lg:col-span-2">
              <div className="h-full rounded-xl border border-border bg-card p-8 transition-colors hover:bg-surface-2">
                <Icon icon={FEATURES[0].icon} size={24} className="text-primary" />
                <h3 className="mt-5 font-display text-xl font-medium tracking-tight text-foreground">
                  {FEATURES[0].title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {FEATURES[0].body}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { label: "Naviera", val: "0.98" },
                    { label: "BL nº", val: "0.97" },
                    { label: "Buque", val: "0.95" },
                    { label: "POL", val: "0.93" },
                    { label: "Contenedor", val: "0.96" },
                    { label: "ETA", val: "Manual" },
                  ].map((f) => (
                    <span
                      key={f.label}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2.5 py-1 font-mono text-xs"
                    >
                      <span className="text-muted-foreground">{f.label}</span>
                      <span className={f.val === "Manual" ? "text-muted-foreground/40" : "text-primary"}>
                        {f.val}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>

            {/* Resumen ejecutivo — celda normal */}
            <StaggerItem>
              <div className="h-full rounded-xl border border-border bg-card p-6 transition-colors hover:bg-surface-2">
                <Icon icon={FEATURES[1].icon} size={22} className="text-primary" />
                <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-foreground">
                  {FEATURES[1].title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {FEATURES[1].body}
                </p>
              </div>
            </StaggerItem>

            {/* Tracking, Calendario, Trazabilidad — celdas normales */}
            {FEATURES.slice(2, 5).map((f) => (
              <StaggerItem key={f.title}>
                <div className="h-full rounded-xl border border-border bg-card p-6 transition-colors hover:bg-surface-2">
                  <Icon icon={f.icon} size={22} className="text-primary" />
                  <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              </StaggerItem>
            ))}

            {/* Equipo y asignación — franja completa */}
            <StaggerItem className="sm:col-span-2 lg:col-span-3">
              <div className="flex items-start gap-5 rounded-xl border border-border bg-card p-6 transition-colors hover:bg-surface-2 sm:items-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
                  <Icon icon={FEATURES[5].icon} size={20} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-medium tracking-tight text-foreground">
                    {FEATURES[5].title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {FEATURES[5].body}
                  </p>
                </div>
              </div>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-20 text-center sm:px-6 sm:py-28">
          <FadeUp>
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
          </FadeUp>
        </div>
      </section>
    </>
  );
}
