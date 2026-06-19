"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { toggleRateActive, deleteRate } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

interface RateRowActionsProps {
  rateId: string;
  active: boolean;
}

export function RateRowActions({ rateId, active }: RateRowActionsProps) {
  const [togglePending, startToggle] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startToggle(async () => {
      await toggleRateActive(rateId, !active);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!confirm("¿Eliminar esta tarifa? Esta acción no se puede deshacer.")) return;
    startDelete(async () => {
      await deleteRate(rateId);
      router.refresh();
    });
  }

  const pending = togglePending || deletePending;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleToggle}
        disabled={pending}
        title={active ? "Desactivar" : "Activar"}
        aria-label={active ? "Desactivar" : "Activar"}
        className={cn(
          "flex size-7 items-center justify-center rounded text-muted-foreground/60 transition-colors disabled:opacity-50",
          active ? "hover:text-warning" : "hover:text-success",
        )}
      >
        {togglePending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : active ? (
          <ToggleRight className="size-3.5" />
        ) : (
          <ToggleLeft className="size-3.5" />
        )}
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        title="Eliminar"
        aria-label="Eliminar"
        className="flex size-7 items-center justify-center rounded text-muted-foreground/60 hover:text-destructive transition-colors disabled:opacity-50"
      >
        {deletePending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      </button>
    </div>
  );
}
