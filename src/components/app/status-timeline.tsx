import { cn } from "@/lib/utils";

const STAGES = [
  { key: "borrador",    label: "Abierto" },
  { key: "confirmado",  label: "Documentación" },
  { key: "en_transito", label: "En tránsito" },
  { key: "en_aduana",   label: "En aduana" },
  { key: "entregado",   label: "Entregado" },
  { key: "facturado",   label: "Facturado" },
];

const STATUS_INDEX: Record<string, number> = {
  borrador: 0, confirmado: 1, en_transito: 2, en_aduana: 3, entregado: 4, facturado: 5, cerrado: 5,
};

export function StatusTimeline({ status }: { status: string }) {
  const current = STATUS_INDEX[status] ?? 0;
  const pct = (current / (STAGES.length - 1)) * 100;

  return (
    <div className="px-4 py-4 sm:px-6">
      {/* En móvil el timeline hace scroll horizontal (6 etapas no caben);
          en desktop se reparte con justify-between. */}
      <div className="overflow-x-auto">
      <div className="relative flex min-w-[460px] items-start justify-between">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-[5px] h-px bg-border" />
        {/* Progress fill */}
        <div
          className="absolute left-0 top-[5px] h-px bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        {/* Stage dots + labels */}
        {STAGES.map((stage, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "size-2.5 rounded-full transition-all duration-300",
                  done ? "bg-primary" : active ? "size-3 bg-primary ring-[3px] ring-primary/20" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap font-mono text-xs uppercase tracking-wider leading-tight text-center",
                  done || active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
