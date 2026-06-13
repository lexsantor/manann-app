"use client";

import { useState, useTransition } from "react";
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { generateAiSummary } from "@/lib/erp-actions";

interface AiSummaryPanelProps {
  shipmentId: string;
  initialSummary: string | null;
  initialSummaryAt: Date | null;
  canGenerate: boolean;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} días`;
}

export function AiSummaryPanel({
  shipmentId,
  initialSummary,
  initialSummaryAt,
  canGenerate,
}: AiSummaryPanelProps) {
  const [summary, setSummary] = useState(initialSummary);
  const [summaryAt, setSummaryAt] = useState(initialSummaryAt);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      const result = await generateAiSummary(shipmentId);
      if (result.error) {
        setError(result.error);
      } else if (result.summary) {
        setSummary(result.summary);
        setSummaryAt(new Date());
      } else {
        setError("No se pudo generar un resumen fiable con los datos actuales.");
      }
    });
  }

  return (
    <div className="rounded-lg border border-accent/40 bg-accent/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon icon={Sparkles} size={14} className="shrink-0 text-accent" />
          <span className="font-mono text-sm uppercase tracking-wider text-accent">
            IA · resumen
          </span>
          {summaryAt && (
            <span className="font-mono text-base text-muted-foreground">
              · {timeAgo(summaryAt)}
            </span>
          )}
        </div>
        {canGenerate && (
          <button
            type="button"
            onClick={generate}
            disabled={isPending}
            title={summary ? "Regenerar resumen" : "Generar resumen"}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 font-mono text-base transition-colors",
              "text-accent hover:bg-accent/10 disabled:opacity-50",
            )}
          >
            <Icon
              icon={RefreshCw}
              size={11}
              className={isPending ? "animate-spin" : ""}
            />
            {summary ? "Regenerar" : "Generar"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 text-base text-destructive">
          <Icon icon={AlertTriangle} size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isPending && !summary && (
        <div className="mt-3 space-y-1.5">
          {[70, 90, 55].map((w) => (
            <div
              key={w}
              className="h-3 animate-pulse rounded bg-accent/20"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      )}

      {summary ? (
        <p
          className={cn(
            "mt-3 text-base leading-relaxed text-foreground",
            isPending && "opacity-50",
          )}
        >
          {summary}
        </p>
      ) : !isPending && !error && (
        <p className="mt-3 text-base text-muted-foreground">
          {canGenerate
            ? "Pulsa «Generar» para obtener un resumen ejecutivo de este expediente."
            : "Añade datos o documentos al expediente para poder generar un resumen."}
        </p>
      )}
    </div>
  );
}
