import { FileText, Sparkles, Check } from "lucide-react";
import type { CSSProperties } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface Field {
  label: string;
  value: string;
  mono?: boolean;
  ai?: number; // confianza 0-1; undefined = campo manual
}

// Datos creíbles: naviera/buque reales, UN/LOCODE reales, contenedor ISO 6346.
const FIELDS: Field[] = [
  { label: "Naviera", value: "Maersk", ai: 0.98 },
  { label: "Buque", value: "Madrid Maersk", ai: 0.95 },
  { label: "BL nº", value: "MAEU 257841930", mono: true, ai: 0.97 },
  { label: "Puerto de carga", value: "Barcelona · ESBCN", ai: 0.93 },
  { label: "Puerto de descarga", value: "Rotterdam · NLRTM", ai: 0.92 },
  { label: "Contenedor", value: "MSKU 1245678-3", mono: true, ai: 0.96 },
  { label: "ETA", value: "18 jun 2026", mono: true },
  { label: "Mercancía", value: "Maquinaria textil", ai: 0.66 },
];

function FieldCell({ field, index }: { field: Field; index: number }) {
  const isAi = field.ai !== undefined;
  const low = isAi && field.ai! < 0.7;

  return (
    <div
      className={cn(
        "ai-reveal rounded-sm border px-3.5 py-2.5",
        !isAi && "border-border bg-background",
        // .border-accent (globals) = borde ámbar a 0.32 → campo extraído por IA
        isAi && !low && "border-accent bg-background",
        // confianza <0.70 → ámbar pleno + tinte, invita a revisión humana
        isAi && low && "border-[hsl(var(--accent))] bg-accent-soft",
      )}
      style={{ "--i": index } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-[10px] uppercase tracking-wide text-muted-foreground">
          {field.label}
        </p>
        {isAi && (
          <span className="shrink-0 inline-flex items-center rounded-sm bg-accent-soft px-1.5 py-0.5 font-mono text-[10px] text-accent leading-none">
            {low ? "revisar" : `IA · ${field.ai!.toFixed(2)}`}
          </span>
        )}
      </div>
      <p className={cn("mt-1 text-sm text-foreground", field.mono && "font-mono")}>
        {field.value}
      </p>
    </div>
  );
}

export function ExpedienteCardDemo() {
  return (
    <div className="relative">
      {/* documento → IA */}
      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
          <Icon icon={FileText} size={14} /> BL · MAERSK · 2026.pdf
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs text-accent">
          <Icon icon={Sparkles} size={13} /> leído por IA
        </span>
      </div>

      {/* expediente card — el protagonista (rounded-xl, surface-1, hairline) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Expediente</p>
            <p className="font-display text-xl font-medium tracking-tight text-foreground">
              EXP-2026-0042
            </p>
          </div>
          {/* status pill — el ámbar SÍ es válido para estado */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 font-mono text-xs text-accent">
            <span className="size-1.5 rounded-full bg-accent" /> En tránsito
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {FIELDS.map((f, i) => (
            <FieldCell key={f.label} field={f} index={i} />
          ))}
        </div>

        <div className="mt-5 flex flex-col items-stretch gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-sm text-muted-foreground">
            <span className="text-accent">7 campos</span> extraídos · revisa y
            confirma
          </p>
          <span className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 font-sans text-sm font-medium text-primary-foreground sm:w-auto">
            <Icon icon={Check} size={16} /> Confirmar
          </span>
        </div>
      </div>

      {/* Honestidad: la tarjeta es ilustrativa. */}
      <p className="mt-3 text-center font-mono text-xs text-ink-subtle">
        Ejemplo ilustrativo · la extracción real ocurre dentro del ERP
      </p>
    </div>
  );
}
