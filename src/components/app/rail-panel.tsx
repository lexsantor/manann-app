"use client";

import { useState } from "react";
import { Train, ChevronDown, ChevronUp, FileText, MapPin } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const CORRIDORS = [
  { id: "yxe", name: "Yiwu – Madrid", via: "Kazajistán · Rusia · Bielorrusia · Polonia", days: "16-18", operators: ["COSCO", "Yuxinou"] },
  { id: "czm", name: "Chengdu – Łódź", via: "Kazajistán · Rusia · Bielorrusia · Polonia", days: "12-14", operators: ["DB Schenker", "PKP Cargo"] },
  { id: "wxg", name: "Wuhan – Lyon", via: "Kazajistán · Rusia · Bielorrusia · Alemania · Francia", days: "15-17", operators: ["SNCF", "DB"] },
  { id: "bse", name: "Suzhou – Varsovia", via: "Kazajistán · Rusia · Bielorrusia · Polonia", days: "12-13", operators: ["PKP Cargo"] },
  { id: "xam", name: "Xi'an – Hamburgo", via: "Kazajistán · Rusia · Polonia · Alemania", days: "14-16", operators: ["DB Schenker"] },
];

interface RailPanelProps {
  pol: string | null;
  pod: string | null;
  blNumber: string | null;
}

export function RailPanel({ pol, pod, blNumber }: RailPanelProps) {
  const [open, setOpen] = useState(false);

  const polLc = pol?.toLowerCase() ?? "";
  const suggestedCorridor =
    polLc.includes("china") || polLc.includes("yiwu") || polLc.includes("chengdu") || polLc.includes("xi") || polLc.includes("wuhan")
      ? CORRIDORS[0]
      : null;

  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon icon={Train} size={16} className="text-muted-foreground" />
          <span className="font-display text-base font-medium tracking-tight text-foreground">
            Ferroviario avanzado
          </span>
          <span className="rounded border border-warning/30 bg-warning/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-warning">
            Simulación
          </span>
        </div>
        <Icon icon={open ? ChevronUp : ChevronDown} size={16} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-5">
          {/* Documentos ferroviarios */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2">Documentos de transporte</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  name: "CIM Waybill",
                  desc: "Carta de porte CIM (Convenio Internacional Mercancías por Ferrocarril)",
                  ref: blNumber ? `CIM-${blNumber}` : "—",
                  color: "border-border bg-muted/30",
                },
                {
                  name: "CMR",
                  desc: "Carta de porte CMR para tramos por carretera en origen/destino",
                  ref: blNumber ? `CMR-${blNumber}` : "—",
                  color: "border-border bg-muted/30",
                },
              ].map((doc) => (
                <div key={doc.name} className={cn("rounded-md border px-3 py-3", doc.color)}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon icon={FileText} size={13} className="text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground/70">{doc.desc}</p>
                  <p className="mt-1.5 font-mono text-xs text-foreground">{doc.ref}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Corredores China-Europa */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2">Corredores China-Europa (Nueva Ruta de la Seda)</p>
            <div className="space-y-2">
              {CORRIDORS.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "rounded-md border px-3 py-2.5 flex items-start justify-between gap-3",
                    suggestedCorridor?.id === c.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/60 bg-surface-2/20",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon icon={MapPin} size={12} className="text-muted-foreground shrink-0" />
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      {suggestedCorridor?.id === c.id && (
                        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">Sugerido</span>
                      )}
                    </div>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">{c.via}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.operators.join(" · ")}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-semibold text-foreground">{c.days}d</p>
                    <p className="font-mono text-[10px] text-muted-foreground/50">tránsito</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NCTS ferroviario */}
          <div className="rounded-md border border-border/60 bg-surface-2/20 px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">NCTS Ferroviario (T1/T2)</p>
            <p className="text-sm text-muted-foreground/70">
              Expediente de tránsito aduanero NCTS aplicable para trayectos por territorio europeo.
              El MRN ferroviario se genera en aduana de entrada UE (p.ej. Małaszewicze/Brest).
              Integración NCTS Phase 5 disponible con módulo de sanciones activo.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "Aduana entrada UE", value: pol?.includes("Polonia") || pol?.includes("Brest") ? pol : "Małaszewicze (PL)" },
                { label: "Régimen NCTS", value: "T1 (mercancía no-UE)" },
                { label: "Garantía", value: "Garantía global operador" },
                { label: "MRN", value: "Pendiente generación" },
              ].map((f) => (
                <div key={f.label} className="rounded border border-border/40 px-2 py-1.5">
                  <p className="font-mono text-[10px] uppercase text-muted-foreground/50">{f.label}</p>
                  <p className="mt-0.5 font-mono text-foreground">{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-[10px] text-muted-foreground/30">
            Origen: {pol ?? "—"} · Destino: {pod ?? "—"} · Simulación — integración operadores ferroviarios en producción
          </p>
        </div>
      )}
    </section>
  );
}
