"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Send, Printer, XCircle, Loader2, Mail, X } from "lucide-react";
import { updateInvoiceStatus, sendFacturaEmail } from "@/lib/erp-actions";
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

const EMAIL_STATUSES = ["emitida", "enviada", "pagada", "vencida"];

export function FacturaActions({ invoiceId, status }: FacturaActionsProps) {
  const [pending, startTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const transitions = TRANSITIONS[status] ?? [];
  const canSendEmail = EMAIL_STATUSES.includes(status);

  function handlePrint() {
    window.print();
  }

  function handleStatus(next: string) {
    startTransition(async () => {
      await updateInvoiceStatus(invoiceId, next as never);
      router.refresh();
    });
  }

  function handleEmailOpen() {
    setShowEmailForm(true);
    setEmailError("");
    setEmailSent(false);
  }

  function handleEmailCancel() {
    setShowEmailForm(false);
    setEmail("");
    setEmailError("");
  }

  function handleEmailSend() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Introduce un email válido");
      return;
    }
    setEmailError("");
    startEmailTransition(async () => {
      try {
        await sendFacturaEmail(invoiceId, email);
        setEmailSent(true);
        setShowEmailForm(false);
        setEmail("");
        router.refresh();
      } catch {
        setEmailError("No se pudo enviar. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
      >
        <Printer className="size-4" />
        Imprimir / PDF
      </button>

      {canSendEmail && !showEmailForm && (
        <button
          onClick={handleEmailOpen}
          disabled={emailPending}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-base text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <Mail className="size-4" />
          {emailSent ? "Email enviado" : "Enviar por email"}
        </button>
      )}

      {showEmailForm && (
        <div className="flex items-center gap-1.5">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleEmailSend()}
            placeholder="destinatario@empresa.com"
            autoFocus
            className={cn(
              "h-8 w-56 rounded-md border bg-background px-3 text-base outline-none focus:ring-1 focus:ring-primary transition-colors",
              emailError ? "border-destructive focus:ring-destructive" : "border-border",
            )}
          />
          <button
            onClick={handleEmailSend}
            disabled={emailPending}
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-base font-medium text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
          >
            {emailPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Enviar
          </button>
          <button
            onClick={handleEmailCancel}
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
          {emailError && (
            <span className="text-base text-destructive">{emailError}</span>
          )}
        </div>
      )}

      {transitions.map((t) => (
        <button
          key={t.next}
          onClick={() => handleStatus(t.next)}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-base font-medium transition-colors disabled:opacity-50",
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
