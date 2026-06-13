"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileCheck2, ChevronDown, ChevronUp, Loader2, AlertTriangle } from "lucide-react";
import { markShipmentEnAduana } from "@/lib/erp-actions";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const REGIMEN_OPTIONS = [
  { value: "4000", label: "4000 — Despacho a libre práctica" },
  { value: "4200", label: "4200 — L.P. + destino especial" },
  { value: "2100", label: "2100 — Tránsito exterior (T1)" },
  { value: "7100", label: "7100 — Reexportación" },
];

interface DuaPanelProps {
  shipmentId: string;
  status: string;
  blNumber?: string | null;
  incoterm?: string | null;
  pol?: string | null;
  pod?: string | null;
  shipper?: string | null;
  consignee?: string | null;
  hsCode?: string | null;
  cargoDescription?: string | null;
  grossWeightKg?: number;
  packages?: number;
}

export function DuaPanel({
  shipmentId, status, blNumber, incoterm, pol, pod,
  shipper, consignee, hsCode, cargoDescription, grossWeightKg, packages,
}: DuaPanelProps) {
  const [open, setOpen] = useState(false);
  const [regimen, setRegimen] = useState("4000");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleEnAduana() {
    startTransition(async () => {
      await markShipmentEnAduana(shipmentId);
      router.refresh();
    });
  }

  const isEnAduana = status === "en_aduana";

  type DuaField = { label: string; value: string; missing?: boolean };

  const fields: DuaField[] = [
    { label: "BL / Ref. transporte", value: blNumber ?? "—", missing: !blNumber },
    { label: "Puerto / aeropuerto origen", value: pol ?? "—", missing: !pol },
    { label: "Puerto / aeropuerto destino", value: pod ?? "—", missing: !pod },
    { label: "Incoterm", value: incoterm ?? "—", missing: !incoterm },
    { label: "Exportador", value: shipper ?? "—", missing: !shipper },
    { label: "Importador", value: consignee ?? "—", missing: !consignee },
    { label: "Descripción mercancía", value: cargoDescription ?? "—", missing: !cargoDescription },
    { label: "Código HS", value: hsCode ?? "—", missing: !hsCode },
    { label: "Peso bruto (kg)", value: grossWeightKg ? String(grossWeightKg) : "—", missing: !grossWeightKg },
    { label: "Bultos", value: packages ? String(packages) : "—" },
  ];

  const missingCount = fields.filter((f) => f.missing).length;

  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon icon={FileCheck2} size={16} className="text-muted-foreground" />
          <span className="font-display text-base font-medium tracking-tight text-foreground">
            Declaración DUA
          </span>
          <span className="rounded border border-amber-500/30 bg-amber-500/8 px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide text-amber-500">
            Simulación
          </span>
          {missingCount > 0 && (
            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 font-mono text-base text-amber-500">
              {missingCount} pendiente{missingCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <Icon icon={open ? ChevronUp : ChevronDown} size={16} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4">
          <p className="mb-4 text-base text-muted-foreground/70">
            Campos prellenados desde el expediente. Verifica y completa antes de presentar.
            La integración real con AEAT estará disponible en producción.
          </p>

          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-sm uppercase tracking-wider text-muted-foreground">
              Régimen aduanero
            </label>
            <div className="relative">
              <select
                value={regimen}
                onChange={(e) => setRegimen(e.target.value)}
                className="w-full appearance-none rounded-md border border-border bg-surface-2/30 px-3 py-2 pr-8 text-base text-foreground outline-none focus:ring-1 focus:ring-primary transition-colors"
              >
                {REGIMEN_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.label}
                className={cn(
                  "rounded-md border px-3 py-2",
                  f.missing
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border/60 bg-surface-2/30",
                )}
              >
                <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </p>
                <p className={cn("mt-0.5 text-base", f.missing ? "text-amber-500/70 italic" : "text-foreground")}>
                  {f.value}
                  {f.missing && (
                    <AlertTriangle className="ml-1.5 inline size-2.5 text-amber-500/70" />
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="font-mono text-base text-muted-foreground/40">
              Simulación — integración AEAT en producción
            </p>
            {isEnAduana ? (
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-base font-semibold text-emerald-400">
                En aduana ✓
              </span>
            ) : (
              <button
                onClick={handleEnAduana}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-base font-medium text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <FileCheck2 className="size-4" />}
                Marcar en aduana
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
