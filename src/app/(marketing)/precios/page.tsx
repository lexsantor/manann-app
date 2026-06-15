import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FadeUp } from "@/components/marketing/motion";

export const metadata: Metadata = {
  title: "Precios — Manann",
  description: "Sin licencias de módulo, sin academias de certificación. Un precio por operador.",
};

interface Feature {
  label: string;
  demo: boolean | string;
  pro: boolean | string;
  empresa: boolean | string;
}

const FEATURES: Feature[] = [
  { label: "Expedientes ilimitados",          demo: "20",      pro: true,       empresa: true },
  { label: "Extracción IA (BL, AWB, CMR)",   demo: true,      pro: true,       empresa: true },
  { label: "Comparativa IA BL vs. factura",  demo: true,      pro: true,       empresa: true },
  { label: "Tracking de contenedores",        demo: "mock",    pro: true,       empresa: true },
  { label: "Cotizaciones y tarifas",          demo: true,      pro: true,       empresa: true },
  { label: "Facturación",                     demo: true,      pro: true,       empresa: true },
  { label: "Aduanas / DUA",                  demo: "simulado", pro: "simulado", empresa: true },
  { label: "Equipo y roles",                  demo: "1 org",   pro: true,       empresa: true },
  { label: "Multi-organización",             demo: false,     pro: false,      empresa: true },
  { label: "Importación masiva CSV",          demo: false,     pro: true,       empresa: true },
  { label: "Compartir expediente por enlace", demo: true,      pro: true,       empresa: true },
  { label: "Alertas ETA por email",           demo: true,      pro: true,       empresa: true },
  { label: "Integración AEAT real",           demo: false,     pro: false,      empresa: true },
  { label: "EDI navieras",                    demo: false,     pro: false,      empresa: true },
  { label: "API privada",                     demo: false,     pro: false,      empresa: true },
  { label: "SLA + soporte dedicado",          demo: false,     pro: false,      empresa: true },
];

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: "demo",
    name: "Demo",
    price: "Gratis",
    period: "",
    description: "El ERP completo en modo demostración. Sin tarjeta, sin registro de empresa.",
    cta: "Entrar ahora",
    ctaHref: "/login",
  },
  {
    id: "pro",
    name: "Profesional",
    price: "149 €",
    period: "/mes · por operador",
    description: "Para agencias de transición y transitarios con tráfico real. Tracking live, sin simulaciones.",
    cta: "Contactar",
    ctaHref: "/contacto",
    featured: true,
    badge: "Más popular",
  },
  {
    id: "empresa",
    name: "Empresa",
    price: "A medida",
    period: "",
    description: "Integración AEAT real, EDI con navieras, API privada, multi-org y SLA dedicado.",
    cta: "Hablar con el equipo",
    ctaHref: "/contacto",
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Icon icon={Check} size={16} className="mx-auto text-primary" />;
  }
  if (value === false) {
    return <Icon icon={Minus} size={16} className="mx-auto text-muted-foreground/30" />;
  }
  return (
    <span className="font-mono text-[11px] text-muted-foreground">{value}</span>
  );
}

export default function PreciosPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6 sm:py-24">

      <FadeUp>
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Precios</p>
          <h1 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Sin licencias de módulo.<br className="hidden sm:block" />
            Sin academias.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            La IA de Manann no es un add-on ni un copiloto periférico. Está en el núcleo —
            el expediente nace del documento, no al revés.
          </p>
        </div>
      </FadeUp>

      {/* Plan cards */}
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan, i) => (
          <FadeUp key={plan.id} delay={i * 0.08}>
            <div
              className={cn(
                "relative flex h-full flex-col rounded-xl border bg-card p-6",
                plan.featured
                  ? "border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)] ring-1 ring-primary/10"
                  : "border-border",
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 font-mono text-[10px] font-medium text-primary-foreground">
                  {plan.badge}
                </span>
              )}

              <div className="flex-1">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-medium tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <Link
                href={plan.ctaHref}
                prefetch={false}
                className={cn(
                  "mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
                  plan.featured
                    ? buttonVariants({ variant: "primary", size: "sm" })
                    : "border border-border bg-background text-foreground hover:bg-surface-2",
                )}
              >
                {plan.cta}
                <Icon icon={ArrowRight} size={14} />
              </Link>
            </div>
          </FadeUp>
        ))}
      </div>

      {/* Feature table */}
      <FadeUp delay={0.3}>
        <div className="mt-16 overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Funcionalidad
                </th>
                {PLANS.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      "px-4 py-4 text-center font-mono text-[10px] uppercase tracking-widest",
                      p.featured ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr
                  key={f.label}
                  className={cn(
                    "border-b border-border last:border-0",
                    i % 2 === 0 ? "bg-card" : "bg-card/50",
                  )}
                >
                  <td className="px-5 py-3 text-sm text-foreground">{f.label}</td>
                  <td className="px-4 py-3 text-center">
                    <FeatureValue value={f.demo} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeatureValue value={f.pro} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeatureValue value={f.empresa} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeUp>

      {/* Honesty note */}
      <FadeUp delay={0.4}>
        <div className="mt-12 rounded-xl border border-border bg-card p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Nota de transparencia
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Manann está en <strong className="text-foreground">acceso anticipado</strong>.
            El producto funciona — extracción IA, expedientes, finanzas, aduanas, calidad y red de agentes están operativos.
            Estamos seleccionando las primeras agencias con las que crecer antes del lanzamiento comercial.
            Si coordinas tráfico internacional y quieres ver el ERP sobre tus expedientes reales,{" "}
            <Link href="/contacto" className="text-primary hover:underline">
              escríbenos
            </Link>.
          </p>
        </div>
      </FadeUp>

    </div>
  );
}
