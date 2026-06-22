import Link from "next/link";
import type { Metadata } from "next";
import { LifeBuoy, LayoutDashboard, Package, BookOpen, ArrowRight } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { PRIMEROS_PASOS, GLOSARIO, type Guide } from "@/lib/guides";
import { TOURS } from "@/lib/tours";
import { ATAJOS } from "@/lib/help-content";

export const metadata: Metadata = {
  title: "Centro de ayuda — Manann",
};

const MODULOS = [
  { path: "/dashboard", label: "Panel general", icon: LayoutDashboard },
  { path: "/expedientes", label: "Expedientes", icon: Package },
  { path: "/contabilidad", label: "Contabilidad", icon: BookOpen },
];

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-base font-medium text-foreground">{guide.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{guide.intro}</p>
      <ol className="mt-4 space-y-2.5">
        {guide.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-foreground">{step}</span>
          </li>
        ))}
      </ol>
      {guide.href && guide.cta ? (
        <Link
          href={guide.href}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
        >
          {guide.cta}
          <Icon icon={ArrowRight} size={16} />
        </Link>
      ) : null}
    </Card>
  );
}

export default function AyudaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ayuda"
        icon={<LifeBuoy strokeWidth={1.5} />}
        title="Centro de ayuda"
        subtitle="Guias cortas para empezar y moverte por Manann. Pensadas para todos los publicos."
      />

      <section className="space-y-3">
        <h2 className="label-mono text-muted-foreground">Primeros pasos</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {PRIMEROS_PASOS.map((guide) => (
            <GuideCard key={guide.title} guide={guide} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="label-mono text-muted-foreground">Guias por modulo</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {MODULOS.map((modulo) => {
            const steps = TOURS[modulo.path] ?? [];
            return (
              <Card key={modulo.path} className="flex flex-col p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon icon={modulo.icon} size={18} />
                  </span>
                  <h3 className="font-display text-base font-medium text-foreground">{modulo.label}</h3>
                </div>
                <ol className="mt-4 flex-1 space-y-3">
                  {steps.map((step, i) => (
                    <li key={i}>
                      <p className="text-sm font-medium text-foreground">{i + 1}. {step.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                    </li>
                  ))}
                </ol>
                <Link
                  href={modulo.path}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:underline"
                >
                  Ir a {modulo.label}
                  <Icon icon={ArrowRight} size={16} />
                </Link>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3">
          <h2 className="label-mono text-muted-foreground">Atajos de teclado</h2>
          <Card className="p-5">
            <ul className="space-y-3">
              {ATAJOS.map((tip) => (
                <li key={tip.t} className="flex items-start gap-3">
                  <kbd className="mt-0.5 flex h-6 shrink-0 items-center justify-center rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground">
                    {tip.k}
                  </kbd>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tip.t}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{tip.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="label-mono text-muted-foreground">Glosario</h2>
          <Card className="divide-y divide-border">
            {GLOSARIO.map((entry) => (
              <div key={entry.term} className="px-5 py-3">
                <p className="text-sm font-medium text-foreground">{entry.term}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{entry.def}</p>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}
