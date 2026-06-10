import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = {
  title: "Contacto — Manann",
  description:
    "¿Coordinas cargas internacionales y quieres ver Manann en tu operativa? Escríbenos.",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-[1080px] px-5 sm:px-6">
      <section className="py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="eyebrow">Contacto</p>
            <h1 className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              Hablemos de tu operativa.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Si coordinas tráfico internacional y el data-entry manual te está
              comiendo el margen, cuéntanos tu caso. Te enseñamos cómo se vería
              Manann sobre tus expedientes.
            </p>
            <p className="mt-8 text-sm text-ink-subtle">
              Demo sin fines comerciales · no aplicamos el flujo RGPD de
              producción.
            </p>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
