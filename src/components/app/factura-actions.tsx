"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Send, Printer, XCircle, Loader2 } from "lucide-react";
import { updateInvoiceStatus } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

interface FacturaActionsProps {
  invoiceId: string;
  status: string;
}

const TRANSITIONS: Record<string, { label: string; next: string; icon: React.ElementType; variant: "primary" | "ghost" | "danger" }[]> = {
  borrador: [
    { label: "Emitir factura", next: "emitida", icon: CheckCircle, variant: "primary" },
    { label: "Anular", next: "anulada", icon: XCircle, variant: "danger" },
  ],
  emitida: [
    { label: "Marcar como enviada", next: "enviada", icon: Send, variant: "primary" },
    { label: "Anular", next: "anulada", icon: XCircle, variant: "danger" },
  ],
  enviada: [
    { label: "Marcar como pagada", next: "pagada", icon: CheckCircle, variant: "primary" },
    { label: "Anular", next: "anulada", icon: XCircle, variant: "danger" },
  ],
  pagada: [],
  vencida: [
    { label: "Marcar como pagada", next: "pagada", icon: CheckCircle, variant: "primary" },
    { label: "Anular", next: "anulada", icon: XCircle, variant: "danger" },
  ],
  anulada: [],
};

export function FacturaActions({ invoiceId, status }: FacturaActionsProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const transitions = TRANSITIONS[status] ?? [];

  function handlePrint() {
    window.print();
  }

  function handleStatus(next: string) {
    startTransition(async () => {
      await updateInvoiceStatus(invoiceId, next as never);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Printer className="size-4" />
        Imprimir / PDF
      </button>

      {transitions.map((t) => (
        <button
          key={t.next}
          onClick={() => handleStatus(t.next)}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
            t.variant === "primary" && "bg-primary/10 text-primary hover:bg-primary/15",
            t.variant === "danger" && "bg-destructive/10 text-destructive hover:bg-destructive/15",
            t.variant === "ghost" && "border border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <t.icon className="size-4" />}
          {t.label}
        </button>
      ))}
    </div>
  );
}
