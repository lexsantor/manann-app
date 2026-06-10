"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { Sparkles, Loader2, Check, X, AlertCircle } from "lucide-react";

import { Icon } from "@/components/icon";
import {
  extractDocument,
  applyExtraction,
  discardExtraction,
} from "@/lib/erp-actions";
import {
  FIELD_LABELS,
  LOW_CONFIDENCE,
  type BlExtraction,
} from "@/lib/bl-extraction";
import { cn } from "@/lib/utils";

interface Props {
  documentId: string;
  status: string;
  extraction: unknown;
  /** Compact mode: renders an inline button/chip for the filename row. */
  compact?: boolean;
}

export function AiExtractionPanel({
  documentId,
  status,
  extraction,
  compact = false,
}: Props) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

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
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-accent">
          <Icon icon={Loader2} size={13} className="animate-spin" />
          Leyendo…
        </span>
      );
    }
    if (status === "confirmed") {
      return (
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-success">
          <Icon icon={Check} size={13} /> Incorporado
        </span>
      );
    }
    if (status === "uploaded" || status === "error") {
      return (
        <div className="shrink-0 space-y-1">
          <button
            type="button"
            onClick={() => run(() => extractDocument(documentId))}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            <Icon
              icon={pending ? Loader2 : Sparkles}
              size={13}
              className={cn(pending && "animate-spin")}
            />
            {pending ? "Leyendo…" : "Extraer con IA"}
          </button>
          {(error || status === "error") && (
            <p className="flex items-center gap-1 text-xs text-destructive">
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

  // ── Full mode: expanded extraction result (only used when status=extracted) ─

  if (status !== "extracted") return null;

  const ex = extraction as BlExtraction | null;
  if (!ex) return null;
  const fields = FIELD_LABELS.map((f) => ({ ...f, ...ex[f.key] })).filter(
    (f) => f.value,
  );

  return (
    <div className="mt-2 rounded-md border border-accent bg-accent-soft p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <Icon icon={Sparkles} size={16} className="shrink-0 text-accent" />
        <div>
          <p className="text-sm font-semibold text-accent">Propuesta de la IA</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
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
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </p>
                <span
                  className={cn(
                    "shrink-0 font-mono text-xs",
                    low ? "text-destructive" : "text-accent",
                  )}
                >
                  {low ? "revisar" : f.confidence.toFixed(2)}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-sm font-medium text-foreground",
                  f.mono && "font-mono",
                )}
              >
                {f.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => run(() => applyExtraction(documentId))}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
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
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          <Icon icon={X} size={15} /> Descartar
        </button>
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
          <Icon icon={AlertCircle} size={14} />
          {error}
        </p>
      )}
    </div>
  );
}
