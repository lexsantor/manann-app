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
  GitCompare,
  FileCheck2,
  Receipt,
  MessageSquare,
  Sunrise,
  Share2,
  BarChart3,
  TrendingUp,
  ListChecks,
  Handshake,
  type LucideIcon,
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
  {
    icon: GitCompare,
    title: "Comparativa IA: BL vs. factura",
    body: "Manann cruza automáticamente los campos del BL con la factura comercial y resalta en ámbar las discrepancias: valor, peso, descripción, incoterm. Ningún error pasa inadvertido.",
  },
  {
    icon: FileCheck2,
    title: "Preparación de aduanas",
    body: "Pulsa «Preparar declaración» y el DUA se rellena desde el expediente: HS code, valor en aduana, régimen, partes. Listo para revisar antes de la presentación.",
  },
  {
    icon: Receipt,
    title: "Cotizaciones y facturación",
    body: "Genera una cotización desde los costes del expediente, apruébala y conviértela en factura en un clic. Sin copiar datos entre sistemas ni salir del expediente.",
  },
];

const MODULOS: { icon: LucideIcon; title: string; body: string; sim?: string }[] = [
  {
    icon: MessageSquare,
    title: "Copiloto IA (⌘J)",
    body: "Pregunta en lenguaje natural sobre tus expedientes —«¿qué llega esta semana a Valencia?»— y la IA responde con el contexto real de tu operativa. Propone; tú decides.",
  },
  {
    icon: Sunrise,
    title: "Briefing matutino y autopilot",
    body: "Cada mañana, un resumen de lo que importa: ETAs del día, expedientes en riesgo y una bandeja de excepciones que la IA prioriza para ti.",
  },
  {
    icon: Share2,
    title: "Portal del cliente",
    body: "Comparte un enlace sin login y el cliente sigue su envío en tiempo real: hitos, ETA y documentos. Menos correos de «¿dónde está mi carga?».",
  },
  {
    icon: BarChart3,
    title: "Analítica avanzada",
    body: "Margen por cliente, naviera y ruta; puntualidad y volumen por modo. Cuadros de mando en vivo para decidir con datos, no con intuición.",
    sim: "Simulación — Power BI Embedded en producción",
  },
  {
    icon: TrendingUp,
    title: "CRM y pipeline comercial",
    body: "Oportunidades por etapa, de prospecto a ganado. Cada cotización aceptada se convierte en expediente con un clic, sin recolocar un solo dato.",
  },
  {
    icon: ListChecks,
    title: "Calidad y procesos",
    body: "Incidencias, no conformidades y SLAs con semáforo de cumplimiento. Lo que no se mide no mejora; aquí se mide y se traza hasta el cierre.",
  },
  {
    icon: Handshake,
    title: "Red de corresponsales",
    body: "Directorio global de agentes, tenders/RFQ a varios partners y e-BL electrónico. El transitario moderno opera en red; Manann la integra.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      {/* Hero — transparent (A) */}
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

      {/* Los tres pasos — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6 sm:py-20">
          <StaggerGrid className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="h-full rounded-xl border border-border bg-card p-7">
                  <span className="block font-mono text-[3rem] font-light leading-none tracking-tighter text-muted-foreground/20">
                    0{i + 1}
                  </span>
                  <div className="mt-4 flex size-9 items-center justify-center rounded-md border border-border bg-background text-primary">
                    <Icon icon={s.icon} size={18} />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-medium tracking-tight text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-foreground/80">{s.lead}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {s.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* Garantías — transparent (C) */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <StaggerGrid className="grid gap-6 sm:grid-cols-3">
            {GUARANTEES.map((g) => (
              <StaggerItem key={g.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6">
                  <Icon icon={g.icon} size={20} className="text-primary" />
                  <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-foreground">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {g.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* La plataforma — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <p className="eyebrow">La plataforma</p>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Sin instalaciones, sin academias, sin esperas.
            </h2>
          </FadeUp>
          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-3">
            {PLATFORM.map((p) => (
              <StaggerItem key={p.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-background">
                  <Icon icon={p.icon} size={20} className="text-primary" />
                  <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {p.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* Después de la confirmación — transparent (C) */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
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
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-surface-2">
                  <Icon icon={o.icon} size={20} className="text-primary" />
                  <h3 className="mt-4 font-display font-medium tracking-tight text-foreground">
                    {o.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {o.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* El producto completo — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <p className="eyebrow">El producto completo</p>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Más que expedientes: todo el ciclo, un solo producto.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              La extracción es el corazón, no el límite. Del comercial a la
              contabilidad, de la calidad a la red de corresponsales: el mismo
              producto, sin saltar entre herramientas.
            </p>
          </FadeUp>
          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MODULOS.map((m) => (
              <StaggerItem key={m.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-background">
                  <Icon icon={m.icon} size={20} className="text-primary" />
                  <h3 className="mt-4 font-display font-medium tracking-tight text-foreground">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {m.body}
                  </p>
                  {m.sim && (
                    <span className="mt-3 inline-flex rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {m.sim}
                    </span>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>

      {/* CTA — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-20 text-center sm:px-6">
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
        </div>
      </div>
    </>
  );
}
