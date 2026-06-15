import type { Metadata } from "next";
import Link from "next/link";
import {
  ScanText,
  Sparkles,
  CalendarDays,
  Satellite,
  ClipboardList,
  Users,
  ChevronRight,
  FileText,
  Shield,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  BarChart3,
  Receipt,
} from "lucide-react";

import { Hero } from "@/components/marketing/hero";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp, StaggerGrid, StaggerItem } from "@/components/marketing/motion";
import { CountUp } from "@/components/marketing/count-up";
import { ProductTabs } from "@/components/marketing/product-tabs";

export const metadata: Metadata = {
  title: "Manann — El expediente se rellena solo.",
  description:
    "ERP transitario con IA documental. Arrastra un Bill of Lading y el expediente se rellena solo. El ERP que el sector merecía, por fin existe.",
};

const LOGOS = [
  "Bill of Lading",
  "Air Waybill",
  "CMR",
  "Booking Confirmation",
  "Packing List",
  "DUA",
  "Manifiesto",
  "e-BL",
];

const METRICS = [
  { target: 3, decimals: 0, suffix: "", label: "documentos con lectura IA · BL · AWB · CMR" },
  { target: 4, decimals: 0, suffix: "", label: "modos: marítimo, aéreo, terrestre, ferroviario" },
  { target: 6, decimals: 0, suffix: "+", label: "módulos en un mismo expediente" },
  { target: 1, decimals: 0, suffix: "", label: "documento basta para crear el expediente" },
];

const PROBLEMS = [
  {
    title: "Sistemas fragmentados",
    body: "El envío en un portal, la aduana en otro, las finanzas en una hoja de cálculo. El contexto muere entre herramientas.",
  },
  {
    title: "Data-entry manual sin fin",
    body: "Los mismos datos, seis portales distintos. Documentos por email. Horas perdidas cada día en tareas que una máquina haría en segundos.",
  },
  {
    title: "Sin visibilidad real",
    body: "Los clientes llaman para saber dónde está su mercancía. También lo hacen tus propios operativos. Nadie tiene el cuadro completo.",
  },
  {
    title: "Legacy y cautividad",
    body: "ERPs on-prem sin features nuevas desde 2014. Integraciones que cuestan 200.000 €. Migrar parece imposible; quedarse, inevitable.",
  },
];

const FLOW_NODES = [
  { icon: Receipt, label: "Cotización", desc: "Propuesta generada desde plantilla o IA en segundos." },
  { icon: FileText, label: "Booking", desc: "Confirmación de naviera vinculada al expediente." },
  { icon: ScanText, label: "Documentación", desc: "BL, packing list y certificados extraídos por IA." },
  { icon: Globe, label: "Aduanas", desc: "DUA prefilled, canal de despacho en tiempo real." },
  { icon: Satellite, label: "Tracking", desc: "Posición del buque y ETAs desde ShipsGo." },
  { icon: BarChart3, label: "Facturación", desc: "Factura generada del expediente. Un clic." },
];

const FEATURES = [
  {
    icon: ScanText,
    title: "Extracción documental",
    body: "Un BL rellena el expediente entero. Naviera, buque, puertos, contenedor, partes y mercancía — con nivel de confianza por cada campo.",
    wide: true,
    extra: [
      { label: "Naviera", val: "0.98" },
      { label: "BL nº", val: "0.97" },
      { label: "Buque", val: "0.95" },
      { label: "POL", val: "0.93" },
      { label: "Contenedor", val: "0.96" },
      { label: "ETA", val: "Manual" },
    ],
  },
  { icon: Sparkles, title: "Resumen ejecutivo", body: "La IA lee el estado actual del envío y redacta un briefing en lenguaje transitario. Lo que necesitas saber antes de la llamada." },
  { icon: Satellite, title: "Tracking en vivo", body: "Vincula el contenedor ISO 6346 y recibe la posición del buque, puerto de escala y cada evento directamente de ShipsGo." },
  { icon: CalendarDays, title: "Calendario de ETAs", body: "Vista mensual de todas las llegadas previstas. Detecta a golpe de ojo qué semana se acumula operativa." },
  { icon: ClipboardList, title: "Trazabilidad de cambios", body: "Cada modificación queda registrada: quién actuó, cuándo y si fue el humano, la IA o el sistema. Sin huecos en el historial." },
  { icon: Users, title: "Equipo y asignación", body: "Cada expediente tiene un responsable. Filtra los tuyos con un clic y recibe aviso en cuanto te asignan uno nuevo.", wide: true },
];

const AI_FIELDS = [
  { label: "Naviera", value: "Hapag-Lloyd", conf: "0.98" },
  { label: "Puerto origen", value: "Barcelona", conf: "0.97" },
  { label: "Puerto destino", value: "Shanghái", conf: "0.99" },
  { label: "Contenedor", value: "HLCU 3948291", conf: "0.95" },
  { label: "Mercancía", value: "Cerámica", conf: "0.91" },
  { label: "ETA", value: "—", conf: "manual" },
];

const INTEGRATIONS = [
  {
    group: "Navieras",
    items: ["MSC", "Maersk", "CMA CGM", "Evergreen"],
  },
  {
    group: "Aduanas",
    items: ["AEAT", "DUA electrónico", "T1 comunitario"],
  },
  {
    group: "Contabilidad",
    items: ["Sage", "Holded", "QuickBooks"],
  },
  {
    group: "Comunicación",
    items: ["Gmail", "Outlook", "WhatsApp API"],
  },
];

const RESULTS = [
  { value: "40+", label: "campos por expediente", sub: "que la competencia te hace teclear" },
  { value: "1", label: "documento de entrada", sub: "BL, AWB o CMR en PDF" },
  { value: "0", label: "reintroducción de datos", sub: "lo que la IA lee no se vuelve a teclear" },
  { value: "100%", label: "de los cambios, trazados", sub: "humano, IA o sistema — siempre registrado" },
];

const ENTERPRISE = [
  { icon: Shield, title: "Seguridad por defecto", body: "HTTPS/HSTS, CSP estricta y X-Frame-Options DENY. Cifrado en reposo del proveedor (Neon). Acceso por enlace mágico, sin contraseñas que filtrar." },
  { icon: Zap, title: "Infraestructura serverless", body: "Desplegado en Vercel con escalado automático. Base de datos Neon con residencia configurable en la UE." },
  { icon: Lock, title: "Pensado para el RGPD", body: "Minimización de datos, trazabilidad de cambios y derecho al borrado. NIS2 y DAC7, en la hoja de ruta de cumplimiento." },
  { icon: TrendingUp, title: "Trazabilidad total", body: "Cada cambio queda registrado: quién, cuándo y si fue humano, IA o sistema. Sin lagunas en el historial." },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* ── Trust ─────────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-2 overflow-hidden">
        {/* Logo marquee */}
        <div className="relative py-8 border-b border-border/40">
          <div className="flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee gap-16 pr-16">
              {[...LOGOS, ...LOGOS].map((name, i) => (
                <span
                  key={i}
                  className="shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/35 whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {METRICS.map((m) => (
              <FadeUp key={m.label}>
                <div className="text-center">
                  <div className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                    <CountUp
                      target={m.target}
                      decimals={m.decimals}
                      suffix={m.suffix}
                      className="text-gradient-primary"
                    />
                  </div>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/55">
                    {m.label}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── El problema ───────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border">
        <div
          className="pointer-events-none absolute -right-[4%] top-1/2 -translate-y-1/2 select-none font-display font-medium leading-none tracking-tighter text-foreground opacity-[0.03]"
          style={{ fontSize: "22vw" }}
          aria-hidden
        >
          1998
        </div>

        <div className="relative mx-auto max-w-[1080px] px-5 py-24 sm:px-6 sm:py-32">
          <div className="grid gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:items-start">
            <FadeUp>
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Por qué existe Manann
              </span>
              <h2 className="mt-6 font-display text-5xl font-medium leading-[1.03] tracking-tight sm:text-[3.25rem] lg:text-6xl">
                La logística mueve el mundo.{" "}
                <span className="text-foreground/30">
                  Su software lleva 25 años parado.
                </span>
              </h2>
              <p className="mt-8 max-w-sm text-base leading-relaxed text-muted-foreground">
                Los transitarios mueven el comercio global. A cambio, operan con
                herramientas que sus abuelos reconocerían. El sector exige
                entregas al nivel de Amazon.
              </p>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
                Hemos visto este patrón romperse, cada día, durante años.
              </p>
            </FadeUp>

            <StaggerGrid className="flex flex-col gap-3">
              {PROBLEMS.map((p, i) => (
                <StaggerItem key={p.title}>
                  <div className="group p-px rounded-xl border border-white/8 bg-white/[0.02] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/[0.12] hover:-translate-y-px">
                    <div className="rounded-[calc(0.75rem-1px)] bg-surface-2 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                      <div className="flex items-start gap-4">
                        <span className="mt-0.5 shrink-0 font-mono text-[10px] tabular-nums text-primary/50">
                          0{i + 1}
                        </span>
                        <div>
                          <h3 className="font-display text-base font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                            {p.title}
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                            {p.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </div>
      </section>

      {/* ── La solución ───────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-24 sm:px-6 sm:py-32">
          <FadeUp>
            <span className="eyebrow">La solución</span>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Un expediente. Todo el ciclo.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Desde la cotización hasta la factura, cada paso vive en el mismo expediente. Sin copiar datos entre sistemas.
            </p>
          </FadeUp>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FLOW_NODES.map((node, i) => (
              <FadeUp key={node.label} delay={i * 0.07}>
                <div className="card-glow group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 hover:bg-card/80">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                      <Icon icon={node.icon} size={18} />
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-base font-medium tracking-tight transition-colors duration-300 group-hover:text-primary">
                      {node.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {node.desc}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── El producto ───────────────────────────────────────── */}
      <section id="producto" className="scroll-mt-20 border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-24 sm:px-6 sm:py-32">
          <FadeUp>
            <span className="eyebrow">El producto</span>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Cada módulo, conectado desde el día uno.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Expedientes, aduanas, clientes, finanzas y reportes. Un solo sistema — sin integraciones de terceros que mantener.
            </p>
          </FadeUp>
          <div className="mt-14">
            <ProductTabs />
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ───────────────────────────────────── */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-24 sm:px-6 sm:py-32">
          <FadeUp>
            <span className="eyebrow">De la entrada a la entrega</span>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight sm:text-4xl">
              La extracción es la entrada. El resto, también.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Manann no termina cuando se crea el expediente. Acompaña el envío hasta la entrega: tracking, resúmenes, avisos de ETA y trazabilidad completa.
            </p>
          </FadeUp>

          <StaggerGrid className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Wide card */}
            <StaggerItem className="sm:col-span-2 lg:col-span-2">
              <div className="card-glow h-full rounded-xl border border-border bg-card p-8 hover:bg-card/80">
                <Icon icon={FEATURES[0].icon} size={24} className="text-primary" />
                <h3 className="mt-5 font-display text-xl font-medium tracking-tight">
                  {FEATURES[0].title}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
                  {FEATURES[0].body}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {FEATURES[0].extra?.map((f) => (
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

            <StaggerItem>
              <div className="card-glow h-full rounded-xl border border-border bg-card p-6 hover:bg-card/80">
                <Icon icon={FEATURES[1].icon} size={22} className="text-primary" />
                <h3 className="mt-5 font-display text-lg font-medium tracking-tight">
                  {FEATURES[1].title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {FEATURES[1].body}
                </p>
              </div>
            </StaggerItem>

            {FEATURES.slice(2, 5).map((f) => (
              <StaggerItem key={f.title}>
                <div className="card-glow h-full rounded-xl border border-border bg-card p-6 hover:bg-card/80">
                  <Icon icon={f.icon} size={22} className="text-primary" />
                  <h3 className="mt-5 font-display text-lg font-medium tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {f.body}
                  </p>
                </div>
              </StaggerItem>
            ))}

            <StaggerItem className="sm:col-span-2 lg:col-span-3">
              <div className="card-glow flex items-start gap-5 rounded-xl border border-border bg-card p-6 hover:bg-card/80 sm:items-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
                  <Icon icon={FEATURES[5].icon} size={20} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-medium tracking-tight">
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

      {/* ── IA documental ─────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-24 sm:px-6 sm:py-32">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 lg:items-center">
            {/* Left */}
            <FadeUp>
              <span className="eyebrow">IA documental</span>
              <h2 className="mt-4 font-display text-4xl font-medium tracking-tight sm:text-5xl">
                Un documento entra.{" "}
                <span className="text-gradient-primary">Un expediente sale.</span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Manann no es un formulario con IA enchufada al borde. Está construido
                alrededor de la extracción desde el primer byte.
              </p>
              <ul className="mt-8 flex flex-col gap-4">
                {[
                  "Lee BL, AWB, booking confirmations y packing lists en PDF",
                  "Extrae cada campo con su nivel de confianza individual",
                  "Guarda cada corrección en el historial de trazabilidad del expediente",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ChevronRight size={10} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </FadeUp>

            {/* Right — AI panel mockup */}
            <FadeUp delay={0.15}>
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[0_32px_80px_-12px_hsl(0_0%_0%/0.5)]">
                {/* Panel header */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Sparkles size={12} />
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/70">Extracción en curso</span>
                  <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-primary">
                    HLCUBCN240042
                  </span>
                </div>

                {/* Fields */}
                <div className="divide-y divide-border/40">
                  {AI_FIELDS.map((field) => (
                    <div key={field.label} className="flex items-center justify-between px-4 py-2.5">
                      <span className="font-mono text-[11px] text-muted-foreground/50 w-28">{field.label}</span>
                      <span className={cn(
                        "flex-1 text-center font-mono text-[12px]",
                        field.conf === "manual" ? "text-muted-foreground/30" : "text-foreground"
                      )}>
                        {field.value}
                      </span>
                      <span className={cn(
                        "w-12 text-right font-mono text-[11px] font-semibold",
                        field.conf === "manual"
                          ? "text-muted-foreground/25"
                          : parseFloat(field.conf) >= 0.95
                          ? "text-primary"
                          : "text-yellow-400/70"
                      )}>
                        {field.conf === "manual" ? "manual" : field.conf}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Action */}
                <div className="border-t border-border px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted-foreground/40">
                      5 de 6 campos extraídos · 1 requiere revisión
                    </span>
                    <span
                      className="rounded-md px-3 py-1.5 font-mono text-[11px] font-semibold text-background"
                      style={{ background: "linear-gradient(120deg, hsl(172 51% 42%), hsl(185 55% 62%))" }}
                    >
                      Confirmar extracción
                    </span>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Integraciones ─────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-24 sm:px-6 sm:py-32">
          <FadeUp>
            <span className="eyebrow">Integraciones · hoja de ruta</span>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Pensada para tu ecosistema.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Hoy: tracking en vivo con ShipsGo e IA documental con Gemini. El resto de conectores
              están en la hoja de ruta — esto es hacia dónde va.
            </p>
          </FadeUp>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INTEGRATIONS.map((group, i) => (
              <FadeUp key={group.group} delay={i * 0.08}>
                <div className="card-glow h-full rounded-xl border border-border bg-card p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/60 mb-4">
                    {group.group}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="size-1 rounded-full bg-border" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* API card */}
          <FadeUp delay={0.35}>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-6 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/60">API REST</p>
                <p className="mt-1 font-display text-base font-medium text-foreground">
                  ¿Tienes un sistema propio? Habrá API.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Endpoints REST y webhooks ya en marcha. Documentación OpenAPI y SDKs para Node y Python, en la hoja de ruta.
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-primary/20 bg-background px-4 py-2 font-mono text-[11px] text-primary">
                En desarrollo
              </span>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Resultados ────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-24 sm:px-6 sm:py-32">
          <FadeUp>
            <span className="eyebrow">Qué cambia</span>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
              El trabajo que Manann te quita.
            </h2>
          </FadeUp>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RESULTS.map((r, i) => (
              <FadeUp key={r.label} delay={i * 0.08}>
                <div className="card-glow rounded-xl border border-border bg-card p-6">
                  <div className="font-display text-4xl font-semibold tracking-tight text-gradient-primary">
                    {r.value}
                  </div>
                  <p className="mt-3 font-display text-base font-medium tracking-tight text-foreground">
                    {r.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground/60">{r.sub}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Quote */}
          <FadeUp delay={0.35}>
            <blockquote className="mt-12 rounded-xl border border-border bg-surface-2 px-8 py-8">
              <p className="font-display text-xl font-medium leading-relaxed tracking-tight text-foreground sm:text-2xl">
                &ldquo;Crear un expediente desde un BL debería costar minutos, no horas — y sin un solo error de transcripción.&rdquo;
              </p>
              <footer className="mt-5 font-mono text-[11px] text-muted-foreground/50">
                La tesis de producto de Manann
              </footer>
            </blockquote>
          </FadeUp>
        </div>
      </section>

      {/* ── Enterprise ────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-24 sm:px-6 sm:py-32">
          <FadeUp>
            <span className="eyebrow">Producción seria</span>
            <h2 className="mt-4 max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Diseñado para el regulador y el auditor.
            </h2>
          </FadeUp>

          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {ENTERPRISE.map((e, i) => (
              <FadeUp key={e.title} delay={i * 0.08}>
                <div className="card-glow flex gap-5 rounded-xl border border-border bg-card p-6">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                    <Icon icon={e.icon} size={18} />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-medium tracking-tight">{e.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-24 text-center sm:px-6 sm:py-32">
          <FadeUp>
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-medium tracking-tight sm:text-5xl">
              La logística del futuro ya está operando.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              Arrastra un Bill of Lading. El expediente se rellena solo. Confirmas en cuatro minutos.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                prefetch={false}
                className={cn(buttonVariants({ variant: "primary", size: "hero" }))}
              >
                Ver la demo en vivo
              </Link>
              <Link
                href="/como-funciona"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                Cómo funciona
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs text-muted-foreground/40">
              Sin tarjeta · Sin instalación · Demo lista en segundos
            </p>
          </FadeUp>
        </div>
      </section>
    </>
  );
}
