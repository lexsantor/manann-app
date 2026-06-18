"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { Sparkles, Loader2, Check, X, AlertCircle, Trash2 } from "lucide-react";

import { Icon } from "@/components/icon";
import {
  extractDocument,
  applyExtraction,
  discardExtraction,
  deleteDocument,
} from "@/lib/erp-actions";
import {
  FIELD_LABELS,
  AWB_FIELD_LABELS,
  CMR_FIELD_LABELS,
  LOW_CONFIDENCE,
  overallConfidence,
} from "@/lib/bl-extraction";
import { cn } from "@/lib/utils";

interface Props {
  documentId: string;
  status: string;
  extraction: unknown;
  docType?: string;
  /** Compact mode: renders an inline button/chip for the filename row. */
  compact?: boolean;
}

export function AiExtractionPanel({
  documentId,
  status,
  extraction,
  docType,
  compact = false,
}: Props) {
  const fieldLabels = docType === "awb" ? AWB_FIELD_LABELS : docType === "cmr" ? CMR_FIELD_LABELS : FIELD_LABELS;
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  // Correcciones del humano sobre la propuesta de la IA (clave de campo → valor).
  const [values, setValues] = useState<Record<string, string>>({});

  function run(fn: () => Promise<void>) {
    setError("");
    start(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Algo falló.");
      }
    });
  }

  // ── Compact mode: inline chip/button for the filename row ──────────────────

  if (compact) {
    if (status === "processing") {
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-base text-accent">
          <Icon icon={Loader2} size={13} className="animate-spin" />
          Leyendo…
        </span>
      );
    }
    if (status === "confirmed") {
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-base text-success">
          <Icon icon={Check} size={13} /> Incorporado
        </span>
      );
    }
    if (status === "uploaded" || status === "error") {
      return (
        <div className="shrink-0 space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => run(() => extractDocument(documentId))}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-base font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              <Icon
                icon={pending ? Loader2 : Sparkles}
                size={13}
                className={cn(pending && "animate-spin")}
              />
              {pending ? "Leyendo…" : "Extraer con IA"}
            </button>
            <button
              type="button"
              onClick={() => run(() => deleteDocument(documentId))}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive px-3 py-1.5 text-base font-medium text-destructive transition hover:bg-destructive/5 disabled:opacity-60"
            >
              <Icon icon={Trash2} size={13} />
              Eliminar
            </button>
          </div>
          {(error || status === "error") && (
            <p className="flex items-center gap-1 text-base text-destructive">
              <Icon icon={AlertCircle} size={11} />
              {error || "Falló. Reinténtalo."}
            </p>
          )}
        </div>
      );
    }
    // "extracted" — compact renders nothing; the full panel below handles it
    return null;
  }

  // ── Confirmed mode: success card with extraction metrics ─────────────────

  if (status === "confirmed" && extraction) {
    const ex = extraction as Record<string, { value: string | null; confidence: number }>;
    const filled = Object.values(ex).filter((f) => f?.value != null).length;
    const conf = Math.round(overallConfidence(ex) * 100);
    return (
      <div className="mt-2 rounded-md border border-success/30 bg-success/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/20">
            <Icon icon={Check} size={13} className="text-success" />
          </div>
          <div>
            <p className="text-base font-semibold text-success">
              Datos incorporados al expediente
            </p>
            <p className="mt-0.5 font-mono text-base text-muted-foreground">
              {filled} campos completados automáticamente · confianza {conf}%
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Full mode: expanded extraction result (only used when status=extracted) ─

  if (status !== "extracted") return null;

  const ex = extraction as Record<string, { value: string | null; confidence: number }> | null;
  if (!ex) return null;
  const fields = fieldLabels
    .map((f) => ({ ...f, ...(ex[f.key] ?? { value: null, confidence: 0 }) }))
    .filter((f) => f.value);
  // Primer campo de baja confianza → recibe el foco para corregirlo de inmediato.
  const firstLow = fields.findIndex((f) => f.confidence < LOW_CONFIDENCE);

  return (
    <div className="mt-2 rounded-md border border-accent bg-accent-soft p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <Icon icon={Sparkles} size={16} className="shrink-0 text-accent" />
        <div>
          <p className="text-base font-semibold text-accent">Propuesta de la IA</p>
          <p className="mt-0.5 text-base text-muted-foreground">
            Revisa y confirma los datos extraídos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f, i) => {
          const low = f.confidence < LOW_CONFIDENCE;
          return (
            <div
              key={f.key}
              style={{ "--i": i } as CSSProperties}
              className={cn(
                "ai-reveal rounded-md border bg-background px-3 py-2.5",
                low ? "border-destructive" : "border-accent",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </p>
                <span
                  className={cn(
                    "shrink-0 font-mono text-base",
                    low ? "text-destructive" : "text-accent",
                  )}
                >
                  {low ? "revisar" : f.confidence.toFixed(2)}
                </span>
              </div>
              <input
                value={values[f.key] ?? f.value ?? ""}
                onChange={(e) =>
                  setValues((s) => ({ ...s, [f.key]: e.target.value }))
                }
                autoFocus={i === firstLow}
                spellCheck={false}
                className={cn(
                  "mt-1 w-full rounded-sm bg-transparent text-base font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-accent",
                  f.mono && "font-mono",
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            run(() =>
              applyExtraction(
                documentId,
                Object.fromEntries(
                  fields
                    .filter(
                      (f) =>
                        values[f.key] !== undefined &&
                        values[f.key] !== (f.value ?? ""),
                    )
                    .map((f) => [f.key, values[f.key]]),
                ),
              ),
            )
          }
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          <Icon
            icon={pending ? Loader2 : Check}
            size={15}
            className={cn(pending && "animate-spin")}
          />
          {pending ? "Aplicando…" : "Confirmar e incorporar"}
        </button>
        <button
          type="button"
          onClick={() => run(() => discardExtraction(documentId))}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-base text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          <Icon icon={X} size={15} /> Descartar
        </button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-base text-destructive">
          <Icon icon={AlertCircle} size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
