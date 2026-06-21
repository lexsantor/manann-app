import type { Metadata } from "next";
import { MessageSquare, Clock, Shield } from "lucide-react";

import { Icon } from "@/components/icon";
import { ContactForm } from "@/components/marketing/contact-form";
import { FadeUp } from "@/components/marketing/motion";
import { HeroAura } from "@/components/marketing/hero-aura";

export const metadata: Metadata = {
  title: "Contacto — Manann",
  description:
    "¿Coordinas cargas internacionales y quieres ver Manann en tu operativa? Escríbenos.",
};

const SIGNALS = [
  {
    icon: MessageSquare,
    title: "Demo sobre tus expedientes",
    body: "No sobre datos inventados. Si tienes un documento de embarque a mano, lo procesamos juntos.",
  },
  {
    icon: Clock,
    title: "Respuesta en menos de 24 h",
    body: "En días laborables. Sin formularios comerciales que nadie lee.",
  },
  {
    icon: Shield,
    title: "Sin presión de venta",
    body: "Es una demo sin fines comerciales. No hay equipo de ventas, no hay seguimiento posterior.",
  },
];

export default function ContactoPage() {
  return (
    <div className="relative overflow-hidden">
      <HeroAura variant={2} />
      <div className="relative z-10 mx-auto max-w-[1080px] px-5 sm:px-6">
        <section className="py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">

          <FadeUp>
            <p className="eyebrow">Contacto</p>
            <h1 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              Hablemos de tu operativa.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Si coordinas tráfico internacional y el data-entry manual te está
              comiendo el margen, cuéntanos tu caso. Te enseñamos cómo se vería
              Manann sobre tus expedientes.
            </p>

            <ul className="mt-10 space-y-5" aria-label="Por qué escribirnos">
              {SIGNALS.map((s) => (
                <li key={s.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-primary">
                    <Icon icon={s.icon} size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-xs text-ink-subtle">
              Demo sin fines comerciales · no aplicamos el flujo RGPD de producción.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <ContactForm />
            </div>
          </FadeUp>

        </div>
        </section>
      </div>
    </div>
  );
}
