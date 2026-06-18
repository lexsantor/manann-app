"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";

import { resetWowShowcase } from "@/lib/erp-actions";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Icon } from "@/components/icon";

// Control de DEMO (solo en el expediente showcase): rearma el flujo wow para
// poder volver a presentarlo sin SQL manual.
export function ResetDemoButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <ConfirmButton
      onConfirm={() =>
        start(async () => {
          await resetWowShowcase();
          router.refresh();
        })
      }
      disabled={pending}
      tone="primary"
      confirmLabel="Reiniciar"
      title="¿Reiniciar la demo del flujo IA?"
      description="Vacía este expediente (partes, contenedor y mercancía volcados) y reabre la «Propuesta de la IA», listo para volver a presentar. Conserva la ruta, las fechas y el PDF."
      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-warning/50 bg-warning/10 px-3 text-sm font-medium text-warning transition-colors hover:bg-warning/20 disabled:opacity-50"
    >
      <Icon
        icon={pending ? Loader2 : RotateCcw}
        size={14}
        className={pending ? "animate-spin" : undefined}
      />
      Reiniciar demo IA
    </ConfirmButton>
  );
}
