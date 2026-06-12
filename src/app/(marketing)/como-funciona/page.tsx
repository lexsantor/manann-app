import type { Metadata } from "next";
import Link from "next/link";
import {
  Upload,
  ScanText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Satellite,
  CalendarDays,
  ClipboardList,
  Users,
  Building2,
  Globe,
  Zap,
  BookOpen,
} from "lucide-react";

import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGrid, StaggerItem } from "@/components/marketing/motion";

export const metadata: Metadata = {
  title: "Cómo funciona — Manann",
  description:
    "Arrastras un documento de embarque, la IA propone los campos, tú confirmas. Donde la competencia te hace teclear 40 campos, Manann los rellena.",
};

const STEPS = [
  {
    icon: Upload,
    title: "Recibes el documento",
    lead: "BL del armador, Booking Confirmation, AWB. Lo arrastras al expediente.",
    body: "Sin plantillas, sin formularios previos, sin clasificar el tipo de archivo. Cuando el documento entra en Manann —al crear el expediente o arrastrarlo a uno abierto— el sistema empieza a trabajar. El mismo gesto que adjuntar un correo.",
  },
  {
    icon: ScanText,
    title: "La IA lee y propone",
    lead: "Manann extrae cada campo con su nivel de confianza.",
    body: "El modelo lee el documento como lo haría un administrativo experto: naviera, buque, puertos en UN/LOCODE, número de BL, contenedor ISO 6346, partes, mercancía, código arancelario. Cada dato llega con una confianza de 0 a 1. Lo que no ve claro (por debajo de 0,70) se marca en ámbar para que lo revises.",
  },
  {
    icon: CheckCircle2,
    title: "Tú confirmas",
    lead: "Revisas lo propuesto, corriges lo dudoso, y el expediente queda creado.",
    body: "Nada se da por hecho sin tu visto bueno. La IA prepara el 90 % del trabajo y tú decides. Al confirmar, los datos se vuelcan al expediente —cabecera, partes, contenedor, mercancía— y queda listo para seguir su travesía.",
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

const PLATFORM = [
  {
    icon: Globe,
    title: "Solo necesitas un navegador",
    body: "Chrome, Firefox, Edge o Safari. Sin instalar nada, sin llamar a IT, sin actualizaciones manuales. Opera en cualquier dispositivo desde el primer día.",
  },
  {
    icon: Zap,
    title: "Operativa en días, no en meses",
    body: "Sin consultores, sin parametrización interminable. Conectas tu equipo, cargas los primeros expedientes y empiezas. La configuración no bloquea el arranque.",
  },
  {
    icon: BookOpen,
    title: "El idioma de tu operativa, por defecto",
    body: "BL, contenedor, ETA, naviera, agente. La interfaz habla transitario desde la primera pantalla. Sin módulos que descubrir ni manuales que leer.",
  },
];

const ONGOING = [
  {
    icon: Satellite,
    title: "Tracking en ruta",
    body: "Vincula el contenedor ISO 6346 y ShipsGo devuelve la posición exacta, el buque activo y cada evento de ruta hasta el puerto de destino.",
  },
  {
    icon: Sparkles,
    title: "Resumen ejecutivo por IA",
    body: "La IA lee el estado del expediente y redacta un briefing en lenguaje transitario. Lo que necesitas saber antes de cada llamada, sin abrir cada panel.",
  },
  {
    icon: CalendarDays,
    title: "Calendario de ETAs",
    body: "Todos los expedientes con fecha de llegada en una vista mensual. Detecta picos de operativa y expedientes sin ETA asignada de un vistazo.",
  },
  {
    icon: ClipboardList,
    title: "Trazabilidad completa",
    body: "Cada cambio de campo queda registrado con quién lo hizo, cuándo y si fue el humano, la IA o el sistema. Sin lagunas.",
  },
  {
    icon: Users,
    title: "Equipo y asignación",
    body: "Asigna cada expediente a un agente. Filtra los tuyos, recibe notificación al ser asignado y mantén visible quién lleva cada envío.",
  },
  {
    icon: Building2,
    title: "Contactos y documentos",
    body: "Todos los BLs, facturas y certificados en un solo lugar. El directorio de navieras, agentes e importadores se construye solo, expediente a expediente.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      {/* Hero */}
      <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
        <section className="pb-12 pt-16 sm:pt-24">
          <FadeUp>
            <p className="eyebrow">Cómo funciona</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Tres pasos. El data-entry manual desaparece.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Donde los ERP del sector te obligan a teclear, copiar y reintroducir
              cada dato del documento, Manann lo lee y lo propone. Tú solo confirmas.
            </p>
          </FadeUp>
        </section>
      </div>

      {/* Los tres pasos — surface-2 */}
      <div className="bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
          <section className="py-4">
            {STEPS.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.08}>
                <div className="grid gap-6 border-t border-border py-12 lg:grid-cols-[auto_1fr] lg:gap-12">
                  <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                    <span className="flex size-11 items-center justify-center rounded-md border border-border bg-card text-primary">
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
              </FadeUp>
            ))}
          </section>
        </div>
      </div>

      {/* Garantías — bg-card */}
      <div className="bg-card">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <section>
            <StaggerGrid className="grid gap-6 sm:grid-cols-3">
              {GUARANTEES.map((g) => (
                <StaggerItem key={g.title}>
                  <div className="rounded-lg border border-border bg-background p-6">
                    <Icon icon={g.icon} size={20} className="text-primary" />
                    <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-foreground">
                      {g.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {g.body}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </section>
        </div>
      </div>

      {/* La plataforma — bg-background */}
      <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
        <section className="py-16">
          <FadeUp>
            <p className="eyebrow">La plataforma</p>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Sin instalaciones, sin academias, sin esperas.
            </h2>
          </FadeUp>
          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-3">
            {PLATFORM.map((p) => (
              <StaggerItem key={p.title}>
                <div className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-surface-2">
                  <Icon icon={p.icon} size={20} className="text-primary" />
                  <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      </div>

      {/* Después de la confirmación — surface-2 */}
      <div className="bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <section>
            <FadeUp>
              <p className="eyebrow">Después de la confirmación</p>
              <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                El sistema sigue trabajando contigo.
              </h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
                Los tres pasos crean el expediente. A partir de ahí, Manann mantiene
                el contexto sin que tengas que pedirlo.
              </p>
            </FadeUp>
            <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {ONGOING.map((o) => (
                <StaggerItem key={o.title}>
                  <div className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-background">
                    <Icon icon={o.icon} size={20} className="text-primary" />
                    <h3 className="mt-4 font-display font-medium tracking-tight text-foreground">
                      {o.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {o.body}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </section>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
        <section className="border-t border-border py-20 text-center">
          <FadeUp>
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-medium tracking-tight text-foreground">
              Míralo con un documento de verdad.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Entra en la demo, arrastra un documento de embarque y observa cómo
              se rellena el expediente.
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
          </FadeUp>
        </section>
      </div>
    </>
  );
}
