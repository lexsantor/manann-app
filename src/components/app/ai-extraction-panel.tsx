"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function run(fn: () => Promise<void>) {
    setError("");
    start(async () => {
      try {
        await fn();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Algo falló.");
      }
    });
  }

  if (status === "processing") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-accent">
        <Icon icon={Loader2} size={13} className="animate-spin" />
        Leyendo el documento con IA…
      </p>
    );
  }

  if (status === "confirmed") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
        <Icon icon={Check} size={13} /> Incorporado al expediente.
      </p>
    );
  }

  if (status === "uploaded" || status === "error") {
    return (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => run(() => extractDocument(documentId))}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2.5 py-1.5 text-xs font-medium text-accent transition hover:brightness-125 disabled:opacity-60"
        >
          <Icon
            icon={pending ? Loader2 : Sparkles}
            size={13}
            className={pending ? "animate-spin" : undefined}
          />
          {pending ? "Leyendo el documento…" : "Extraer con IA"}
        </button>
        {(error || status === "error") && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
            <Icon icon={AlertCircle} size={12} />
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
    <div className="mt-3 rounded-md border border-accent bg-accent-soft p-3">
      <div className="mb-2.5 flex items-center gap-1.5">
        <Icon icon={Sparkles} size={13} className="text-accent" />
        <p className="text-xs font-medium text-accent">
          Propuesta de la IA — revisa y confirma
        </p>
      </div>

      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {fields.map((f, i) => {
          const low = f.confidence < LOW_CONFIDENCE;
          return (
            <div
              key={f.key}
              style={{ "--i": i } as CSSProperties}
              className={cn(
                "ai-reveal rounded-sm border px-2.5 py-1.5",
                low
                  ? "border-[hsl(var(--accent))] bg-background"
                  : "border-accent bg-background",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {f.label}
                </p>
                <span className="font-mono text-[9px] text-accent">
                  {low ? "revisar" : f.confidence.toFixed(2)}
                </span>
              </div>
              <p className={cn("text-xs text-foreground", f.mono && "font-mono")}>
                {f.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => run(() => applyExtraction(documentId))}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
        >
          <Icon
            icon={pending ? Loader2 : Check}
            size={13}
            className={pending ? "animate-spin" : undefined}
          />
          Confirmar
        </button>
        <button
          type="button"
          onClick={() => run(() => discardExtraction(documentId))}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          <Icon icon={X} size={13} /> Descartar
        </button>
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
          <Icon icon={AlertCircle} size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
