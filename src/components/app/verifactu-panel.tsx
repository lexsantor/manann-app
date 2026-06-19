"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, Loader2, CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/icon";
import { submitVerifactu } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VerifactuDeclaration {
  id: string;
  referenceNumber: string | null;
  status: string;
  xmlHash: string | null;
  submittedAt: Date | string | null;
}

interface VerifactuPanelProps {
  invoiceId: string;
  invoiceRef: string;
  invoiceTotal: string | number;
  issueDate: string | null;
  declaration: VerifactuDeclaration | null;
}

const STATUS_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
};
const STATUS_COLOR: Record<string, string> = {
  pendiente: "text-warning bg-warning/10",
  enviada: "text-info bg-info/10",
  aceptada: "text-success bg-success/10",
  rechazada: "text-destructive bg-destructive/10",
};

function FakeQr({ text }: { text: string }) {
  const cells = 10;
  const cell = 8;
  const size = cells * cell;
  const filled: [number, number][] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const v = (text.charCodeAt((r * cells + c) % text.length) + r + c) % 3;
      if (v === 0) filled.push([c * cell, r * cell]);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground">
      {filled.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={cell} height={cell} fill="currentColor" />
      ))}
    </svg>
  );
}

export function VerifactuPanel({ invoiceId, invoiceRef, invoiceTotal, issueDate, declaration }: VerifactuPanelProps) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ referenceNumber: string; hash: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decl = result
    ? { referenceNumber: result.referenceNumber, status: "aceptada", xmlHash: result.hash, submittedAt: new Date() }
    : declaration;

  function handleSubmit() {
    setError(null);
    start(async () => {
      try {
        const r = await submitVerifactu(invoiceId);
        setResult(r);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al registrar");
      }
    });
  }


  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <Icon icon={ShieldCheck} size={16} className="text-muted-foreground" />
          <span className="font-display text-base font-medium tracking-tight text-foreground">
            Verifactu / e-Factura
          </span>
          <span className="rounded border border-warning/30 bg-warning/8 px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide text-warning">
            Simulación
          </span>
          {decl && (
            <span className={cn("rounded-full px-2 py-0.5 font-mono text-xs", STATUS_COLOR[decl.status] ?? "text-muted-foreground bg-muted/60")}>
              {STATUS_LABEL[decl.status] ?? decl.status}
            </span>
          )}
        </div>
        <Icon icon={open ? ChevronUp : ChevronDown} size={16} className="text-muted-foreground" />
      </button>

      {open && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
          <p className="text-sm text-muted-foreground/70">
            Registro en el sistema Verifactu de la AEAT (RD 1007/2023). Cada factura genera
            un hash encadenado que garantiza la integridad. Integración real disponible en producción.
          </p>

          {/* Invoice summary */}
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { label: "Nº Factura", value: invoiceRef },
              { label: "Importe total", value: `${Number(invoiceTotal).toFixed(2)} €` },
              { label: "Fecha emisión", value: issueDate ?? "—" },
            ].map((f) => (
              <div key={f.label} className="rounded-md border border-border/60 bg-surface-2/30 px-3 py-2">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</p>
                <p className="mt-0.5 text-sm text-foreground">{f.value}</p>
              </div>
            ))}
          </div>

          {decl ? (
            <div className="flex items-start gap-6">
              <div className="flex-1 space-y-2">
                <div className="rounded-md border border-success/20 bg-success/5 px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Número de registro AEAT</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-foreground">{decl.referenceNumber}</p>
                </div>
                <div className="rounded-md border border-border/60 bg-surface-2/30 px-3 py-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Hash SHA-256 encadenado</p>
                  <p className="mt-0.5 break-all font-mono text-xs text-muted-foreground">{decl.xmlHash}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon={CheckCircle2} size={14} className="text-success" />
                  <span className="text-sm text-success font-medium">Registrada y aceptada por AEAT</span>
                </div>
              </div>
              {decl.xmlHash && (
                <div className="shrink-0 rounded-lg border border-border p-2">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center">QR verificación</p>
                  <FakeQr text={decl.xmlHash} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-md border border-border/60 bg-surface-2/20 px-3 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon={ShieldCheck} size={14} className="text-muted-foreground" />
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Estado Verifactu</p>
                </div>
                <p className="text-sm text-muted-foreground">Factura aún no registrada en el sistema Verifactu de la AEAT.</p>
              </div>
              {error && <p className="text-sm text-accent">{error}</p>}
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-muted-foreground/60">Simulación — AEAT en producción</p>
                <Button onClick={handleSubmit} disabled={pending} variant="secondary" size="sm">
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  Registrar en AEAT
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
