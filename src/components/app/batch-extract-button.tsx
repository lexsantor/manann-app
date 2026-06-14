"use client";

import { useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Icon } from "@/components/icon";
import { extractDocumentsBatch } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

interface Props {
  documentIds: string[];
}

export function BatchExtractButton({ documentIds }: Props) {
  const [pending, start] = useTransition();

  if (documentIds.length < 2) return null;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await extractDocumentsBatch(documentIds);
        })
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-accent/10 border border-accent/30 px-3 py-1.5 text-base font-medium text-accent transition hover:bg-accent/15 disabled:opacity-60",
      )}
    >
      <Icon
        icon={pending ? Loader2 : Sparkles}
        size={13}
        className={cn(pending && "animate-spin")}
      />
      {pending ? "Extrayendo…" : `Extraer ${documentIds.length} documentos con IA`}
    </button>
  );
}
