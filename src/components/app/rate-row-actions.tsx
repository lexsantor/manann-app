"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { toggleRateActive, deleteRate } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

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
      try {
        await toggleRateActive(rateId, !active);
        router.refresh();
        toast.success(active ? "Tarifa desactivada" : "Tarifa activada");
      } catch {
        toast.error("No se pudo cambiar la tarifa. Inténtalo de nuevo.");
      }
    });
  }

  function handleDelete() {
    if (!confirm("¿Eliminar esta tarifa? Esta acción no se puede deshacer.")) return;
    startDelete(async () => {
      try {
        await deleteRate(rateId);
        router.refresh();
        toast.success("Tarifa eliminada");
      } catch {
        toast.error("No se pudo eliminar la tarifa. Inténtalo de nuevo.");
      }
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
          "flex size-7 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded text-muted-foreground/60 transition-colors disabled:opacity-50",
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
        className="flex size-7 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded text-muted-foreground/60 hover:text-destructive transition-colors disabled:opacity-50"
      >
        {deletePending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      </button>
    </div>
  );
}
