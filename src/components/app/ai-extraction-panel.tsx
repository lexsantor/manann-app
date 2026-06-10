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
}

export function AiExtractionPanel({ documentId, status, extraction }: Props) {
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

  if (status === "processing") {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-md border border-accent bg-accent-soft px-4 py-3.5">
        <Icon icon={Loader2} size={20} className="shrink-0 animate-spin text-accent" />
        <div>
          <p className="text-sm font-medium text-accent">Leyendo el documento…</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            La IA está analizando el Bill of Lading
          </p>
        </div>
      </div>
    );
  }

  if (status === "confirmed") {
    return (
      <div className="mt-3 flex items-center gap-2.5 rounded-md border border-border bg-secondary/[0.04] px-4 py-3">
        <Icon icon={Check} size={18} className="shrink-0 text-success" />
        <p className="text-sm font-medium text-success">Incorporado al expediente</p>
      </div>
    );
  }

  if (status === "uploaded" || status === "error") {
    return (
      <div className="mt-3 space-y-2">
        <button
          type="button"
          onClick={() => run(() => extractDocument(documentId))}
          disabled={pending}
          className="flex w-full items-center justify-center gap-2.5 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-105 disabled:opacity-60"
        >
          <Icon
            icon={pending ? Loader2 : Sparkles}
            size={16}
            className={cn(pending && "animate-spin")}
          />
          {pending ? "Leyendo el documento…" : "Extraer datos con IA"}
        </button>
        {(error || status === "error") && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <Icon icon={AlertCircle} size={14} />
            {error || "La última extracción falló. Reinténtalo."}
          </p>
        )}
      </div>
    );
  }

  // status === "extracted" → propuesta de la IA
  const ex = extraction as BlExtraction | null;
  if (!ex) return null;
  const fields = FIELD_LABELS.map((f) => ({ ...f, ...ex[f.key] })).filter(
    (f) => f.value,
  );

  return (
    <div className="mt-3 rounded-md border border-accent bg-accent-soft p-4">
      <div className="mb-4 flex items-center gap-2.5">
        <Icon icon={Sparkles} size={16} className="shrink-0 text-accent" />
        <div>
          <p className="text-sm font-semibold text-accent">Propuesta de la IA</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Revisa y confirma los datos extraídos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
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
