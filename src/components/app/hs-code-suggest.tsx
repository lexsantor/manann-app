"use client";
import { useState, useTransition } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { Icon } from "@/components/icon";
import { suggestHsCode, applyHsCode } from "@/lib/erp-actions";

type State = "idle" | "loading" | "suggested" | "error";

interface HsCodeSuggestProps {
  cargoLineId: string;
}

export function HsCodeSuggest({ cargoLineId }: HsCodeSuggestProps) {
  const [state, setState] = useState<State>("idle");
  const [suggestion, setSuggestion] = useState<{ code: string; justification: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSuggest() {
    setState("loading");
    startTransition(async () => {
      try {
        const result = await suggestHsCode(cargoLineId);
        setSuggestion(result);
        setState("suggested");
      } catch {
        setState("error");
      }
    });
  }

  function handleApply() {
    if (!suggestion) return;
    startTransition(async () => {
      await applyHsCode(cargoLineId, suggestion.code);
      // revalidatePath en la acción refresca la página; el botón desaparece.
    });
  }

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={handleSuggest}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-base font-medium text-accent transition-colors hover:bg-accent/10"
      >
        <Icon icon={Sparkles} size={10} />
        Sugerir HS
      </button>
    );
  }

  if (state === "loading") {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-base text-muted-foreground">
        <Icon icon={Sparkles} size={10} className="animate-pulse text-accent" />
        Consultando IA…
      </span>
    );
  }

  if (state === "error") {
    return (
      <button
        type="button"
        onClick={handleSuggest}
        className="inline-flex items-center gap-1 font-mono text-base text-destructive hover:underline"
      >
        Error · reintentar
      </button>
    );
  }

  if (state === "suggested" && suggestion) {
    return (
      <div className="mt-1.5 flex items-start gap-2 rounded-md border border-accent/30 bg-accent/[0.07] px-2.5 py-2">
        <Icon icon={Sparkles} size={11} className="mt-0.5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-base font-semibold text-accent">{suggestion.code}</p>
          <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
            {suggestion.justification}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={handleApply}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded bg-accent px-2 py-1 text-base font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            <Icon icon={Check} size={10} />
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => { setState("idle"); setSuggestion(null); }}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon icon={X} size={12} />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
