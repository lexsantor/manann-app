"use client";

import { useState, useTransition } from "react";
import { FileCheck, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/icon";
import { submitDeclaration } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ComplianceDeclaration {
  id: string;
  type: string;
  referenceNumber: string | null;
  status: string;
  submittedAt: Date | string | null;
}

interface DeclaracionesPanelProps {
  shipmentId: string;
  mode: string;
  pol?: string | null;
  pod?: string | null;
  blNumber?: string | null;
  shipper?: string | null;
  consignee?: string | null;
  hsCode?: string | null;
  grossWeightKg?: number | null;
  declarations: ComplianceDeclaration[];
}

type DeclType = "ens" | "ncts" | "aes";

const DECL_META: Record<DeclType, { label: string; full: string; description: string; regulation: string }> = {
  ens: {
    label: "ICS2 / ENS",
    full: "Entry Summary Declaration",
    description: "Declaración sumaria de entrada de mercancías en la UE. Obligatoria 24h antes de la carga para envíos marítimos.",
    regulation: "Reglamento UE 952/2013 (CAU) · ICS2 Release 3",
  },
  ncts: {
    label: "NCTS",
    full: "New Computerised Transit System",
    description: "Declaración de tránsito aduanero en la UE. Reemplaza al documento T1/T2 en papel.",
    regulation: "Reglamento UE 952/2013 · NCTS Phase 5",
  },
  aes: {
    label: "AES",
    full: "Automated Export System",
    description: "Declaración de exportación automatizada. Genera el EAD (Export Accompanying Document) con MRN.",
    regulation: "Reglamento UE 952/2013 (CAU) · AES / ICS2",
  },
};

const STATUS_COLOR: Record<string, string> = {
  pendiente: "text-warning bg-warning/10",
  enviada: "text-info bg-info/10",
  aceptada: "text-success bg-success/10",
  rechazada: "text-accent bg-accent/10",
};

function DeclarationBlock({
  type,
  shipmentId,
  existing,
  prefilled,
}: {
  type: DeclType;
  shipmentId: string;
  existing: ComplianceDeclaration | null;
  prefilled: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [submitted, setSubmitted] = useState<{ referenceNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const meta = DECL_META[type];
  const decl = submitted ? { referenceNumber: submitted.referenceNumber, status: "aceptada" } : existing;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { data[k] = String(v); });
    start(async () => {
      try {
        const r = await submitDeclaration(shipmentId, type, data);
        setSubmitted(r);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al enviar");
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">{meta.label}</span>
          <span className="text-xs text-muted-foreground">{meta.full}</span>
          {decl ? (
            <span className={cn("rounded-full px-1.5 py-0.5 font-mono text-[10px]", STATUS_COLOR[decl.status] ?? "text-muted-foreground bg-muted/60")}>
              {decl.referenceNumber}
            </span>
          ) : (
            <span className="rounded-full bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">Pendiente</span>
          )}
        </div>
        <Icon icon={open ? ChevronUp : ChevronDown} size={14} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-3">
          <p className="text-xs text-muted-foreground/70">{meta.description}</p>
          <p className="font-mono text-xs text-muted-foreground">{meta.regulation}</p>

          {decl?.status === "aceptada" ? (
            <div className="flex items-center gap-2 rounded-md border border-success/20 bg-success/5 px-3 py-2">
              <Icon icon={CheckCircle2} size={14} className="text-success" />
              <div>
                <p className="text-sm font-medium text-success">Declaración aceptada</p>
                <p className="font-mono text-xs text-muted-foreground">Ref: {decl.referenceNumber}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(prefilled).map(([k, v]) => (
                  <div key={k}>
                    <label htmlFor={k} className="mb-0.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {k.replace(/_/g, " ")}
                    </label>
                    <input
                      id={k}
                      name={k}
                      defaultValue={v}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground"
                    />
                  </div>
                ))}
              </div>
              {error && <p className="text-xs text-accent">{error}</p>}
              <div className="flex items-center justify-between pt-1">
                <p className="font-mono text-xs text-muted-foreground">Simulación — integración real en producción</p>
                <Button type="submit" variant="secondary" disabled={pending} className="gap-1.5">
                  {pending ? <Loader2 className="size-3.5 animate-spin" /> : <FileCheck className="size-3.5" />}
                  Enviar declaración
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export function DeclaracionesPanel({
  shipmentId, mode, pol, pod, blNumber, shipper, consignee, hsCode, grossWeightKg, declarations,
}: DeclaracionesPanelProps) {
  const [open, setOpen] = useState(false);

  const isImport = mode === "maritimo" || mode === "aereo";
  const isTransit = declarations.some((d) => d.type === "ncts") || true;
  const isExport = true;

  const get = (type: DeclType) => declarations.find((d) => d.type === type) ?? null;

  const ensPrefilled: Record<string, string> = {
    bl_number: blNumber ?? "",
    puerto_origen: pol ?? "",
    puerto_destino: pod ?? "",
    exportador: shipper ?? "",
    importador: consignee ?? "",
    codigo_hs: hsCode ?? "",
    peso_bruto_kg: grossWeightKg ? String(grossWeightKg) : "",
  };

  const nctsPrefilled: Record<string, string> = {
    oficina_salida: pol ?? "",
    oficina_destino: pod ?? "",
    exportador: shipper ?? "",
    descripcion_mercancias: "",
    codigo_hs: hsCode ?? "",
    peso_bruto_kg: grossWeightKg ? String(grossWeightKg) : "",
    regimen: "T1",
  };

  const aesPrefilled: Record<string, string> = {
    exportador: shipper ?? "",
    consignatario: consignee ?? "",
    puerto_salida: pol ?? "",
    puerto_llegada: pod ?? "",
    codigo_hs: hsCode ?? "",
    peso_bruto_kg: grossWeightKg ? String(grossWeightKg) : "",
    valor_aduanero: "",
    incoterm: "",
  };

  const pendingCount = [
    isImport && !get("ens"),
    isTransit && !get("ncts"),
    isExport && !get("aes"),
  ].filter(Boolean).length;

  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon icon={FileCheck} size={16} className="text-muted-foreground" />
          <span className="font-display text-base font-medium tracking-tight text-foreground">
            Declaraciones aduaneras
          </span>
          <span className="rounded border border-warning/30 bg-warning/8 px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide text-warning">
            Simulación
          </span>
          {pendingCount > 0 && (
            <span className="rounded-full bg-warning/10 px-1.5 py-0.5 font-mono text-sm text-warning">
              {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <Icon icon={open ? ChevronUp : ChevronDown} size={16} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-3">
          <p className="text-sm text-muted-foreground/70">
            Declaraciones pre-rellenadas desde el expediente. Verifica y completa antes de presentar.
          </p>
          {isImport && (
            <DeclarationBlock type="ens" shipmentId={shipmentId} existing={get("ens")} prefilled={ensPrefilled} />
          )}
          {isTransit && (
            <DeclarationBlock type="ncts" shipmentId={shipmentId} existing={get("ncts")} prefilled={nctsPrefilled} />
          )}
          {isExport && (
            <DeclarationBlock type="aes" shipmentId={shipmentId} existing={get("aes")} prefilled={aesPrefilled} />
          )}
        </div>
      )}
    </section>
  );
}
