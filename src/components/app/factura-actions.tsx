"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Send, Printer, XCircle, Loader2, Mail, X } from "lucide-react";
import { updateInvoiceStatus, sendFacturaEmail } from "@/lib/erp-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/ui/confirm-button";
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
    <div className="flex w-full flex-col gap-2 print:hidden sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
      <Button variant="secondary" size="sm" onClick={handlePrint} className="w-full sm:w-auto">
        <Printer className="size-4" />
        Imprimir / PDF
      </Button>

      {canSendEmail && !showEmailForm && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleEmailOpen}
          disabled={emailPending}
          className="w-full sm:w-auto"
        >
          <Mail className="size-4" />
          {emailSent ? "Email enviado" : "Enviar por email"}
        </Button>
      )}

      {showEmailForm && (
        <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center">
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleEmailSend()}
            placeholder="destinatario@empresa.com"
            autoFocus
            className={cn("sm:w-56", emailError && "border-destructive focus-visible:ring-destructive")}
          />
          <div className="flex gap-1.5">
            <Button
              variant="primary"
              size="sm"
              onClick={handleEmailSend}
              disabled={emailPending}
              className="flex-1 sm:flex-none"
            >
              {emailPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Enviar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEmailCancel}
              aria-label="Cancelar envío"
              className="shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>
          {emailError && (
            <span className="text-base text-destructive">{emailError}</span>
          )}
        </div>
      )}

      {transitions.map((t) =>
        t.next === "anulada" ? (
          <ConfirmButton
            key={t.next}
            onConfirm={() => handleStatus(t.next)}
            disabled={pending}
            aria-label="Anular factura"
            title="Anular factura"
            description="La factura quedará anulada. Esta acción no se puede deshacer y tiene efectos fiscales."
            confirmLabel="Anular"
            className={cn(buttonVariants({ variant: "destructive", size: "sm" }), "w-full sm:w-auto")}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <t.icon className="size-4" />}
            {t.label}
          </ConfirmButton>
        ) : (
          <Button
            key={t.next}
            variant={t.variant === "primary" ? "primary" : t.variant === "danger" ? "destructive" : "outline"}
            size="sm"
            onClick={() => handleStatus(t.next)}
            disabled={pending}
            className="w-full sm:w-auto"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <t.icon className="size-4" />}
            {t.label}
          </Button>
        )
      )}
    </div>
  );
}
