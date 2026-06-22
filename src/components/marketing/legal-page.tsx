import { Info } from "lucide-react";

import { Icon } from "@/components/icon";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  sections: LegalSection[];
}

// Estructura común de las páginas legales (placeholder de demo).
export function LegalPage({ eyebrow, title, sections }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-[760px] px-5 py-16 sm:px-6 sm:py-24">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>

      <div className="mt-6 flex items-start gap-2.5 rounded-md border border-accent bg-accent-soft px-4 py-3">
        <Icon icon={Info} size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-sm leading-relaxed text-foreground">
          Manann es una <strong className="font-medium">demo sin fines
          comerciales</strong>. Este texto es un marcador de posición de
          ejemplo y <strong className="font-medium">no constituye un documento
          legal real</strong>. En un producto en producción, lo redactaría un
          profesional.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-lg font-medium tracking-tight text-foreground">
              {s.heading}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
