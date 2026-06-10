"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";

import { Icon } from "@/components/icon";
import { resetDemo } from "@/lib/demo-actions";
import { cn } from "@/lib/utils";

export function DemoResetButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function run() {
    start(async () => {
      try {
        await resetDemo();
        setConfirming(false);
        router.refresh();
      } catch {
        setConfirming(false);
      }
    });
  }

  const linkCls =
    "rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-50";

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>¿Reiniciar? Se borran los cambios de la demo.</span>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className={cn(linkCls, "font-medium text-destructive hover:bg-destructive/10")}
        >
          {pending ? "Reiniciando…" : "Sí, reiniciar"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className={cn(linkCls, "text-muted-foreground hover:text-foreground")}
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-subtle transition-colors hover:text-foreground"
    >
      <Icon icon={pending ? Loader2 : RotateCcw} size={13} className={pending ? "animate-spin" : undefined} />
      Reiniciar demo
    </button>
  );
}
