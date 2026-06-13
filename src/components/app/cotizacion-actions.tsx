"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, Send, Loader2, Mail, X, ExternalLink, ArrowRight,
} from "lucide-react";
import {
  updateQuotationStatus,
  sendCotizacionEmail,
  convertQuotationToShipment,
} from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

interface CotizacionActionsProps {
  quotationId: string;
  status: string;
  clientEmail?: string | null;
  shipmentId?: string | null;
}

const EMAIL_STATUSES = ["borrador", "enviada"];

export function CotizacionActions({
  quotationId,
  status,
  clientEmail,
  shipmentId,
}: CotizacionActionsProps) {
  const [pending, startTransition] = useTransition();
  const [convertPending, startConvert] = useTransition();
  const [emailPending, startEmail] = useTransition();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState(clientEmail ?? "");
  const [emailError, setEmailError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  function handleStatus(next: string) {
    startTransition(async () => {
      await updateQuotationStatus(quotationId, next as never);
      router.refresh();
    });
  }

  function handleConvert() {
    startConvert(async () => {
      const shipmentId = await convertQuotationToShipment(quotationId);
      router.push(`/expedientes/${shipmentId}`);
    });
  }

  function handleEmailSend() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Introduce un email válido");
      return;
    }
    setEmailError("");
    startEmail(async () => {
      try {
        await sendCotizacionEmail(quotationId, email);
        setEmailSent(true);
        setShowEmailForm(false);
        router.refresh();
      } catch {
        setEmailError("No se pudo enviar. Inténtalo de nuevo.");
      }
    });
  }

  const canEmail = EMAIL_STATUSES.includes(status);
  const canAccept = status === "enviada";
  const canReject = status === "enviada";
  const canConvert = status === "aceptada" && !shipmentId;
  const isConverted = !!shipmentId;

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">

      {/* Email form / button */}
      {canEmail && !showEmailForm && (
        <button onClick={() => setShowEmailForm(true)} disabled={emailPending}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-base text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          <Mail className="size-4" />
          {emailSent ? "Email enviado" : "Enviar por email"}
        </button>
      )}

      {showEmailForm && (
        <div className="flex items-center gap-1.5">
          <input type="email" value={email} autoFocus
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleEmailSend()}
            placeholder="cliente@empresa.com"
            className={cn(
              "h-8 w-56 rounded-md border bg-background px-3 text-base outline-none focus:ring-1 focus:ring-primary transition-colors",
              emailError ? "border-destructive focus:ring-destructive" : "border-border",
            )} />
          <button onClick={handleEmailSend} disabled={emailPending}
            className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-base font-medium text-primary hover:bg-primary/15 transition-colors disabled:opacity-50">
            {emailPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Enviar
          </button>
          <button onClick={() => setShowEmailForm(false)}
            className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
          {emailError && <span className="text-base text-destructive">{emailError}</span>}
        </div>
      )}

      {/* Accept / Reject */}
      {canAccept && (
        <button onClick={() => handleStatus("aceptada")} disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-base font-medium text-emerald-400 hover:bg-emerald-500/15 transition-colors disabled:opacity-50">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
          Aceptada
        </button>
      )}
      {canReject && (
        <button onClick={() => handleStatus("rechazada")} disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-base font-medium text-destructive hover:bg-destructive/15 transition-colors disabled:opacity-50">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <XCircle className="size-4" />}
          Rechazada
        </button>
      )}

      {/* Convert to expediente */}
      {canConvert && (
        <button onClick={handleConvert} disabled={convertPending}
          className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-base font-medium text-primary hover:bg-primary/15 transition-colors disabled:opacity-50">
          {convertPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          Convertir en expediente
        </button>
      )}

      {/* Link to expediente if already converted */}
      {isConverted && (
        <a href={`/expedientes/${shipmentId}`}
          className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-base text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink className="size-4" />
          Ver expediente
        </a>
      )}
    </div>
  );
}
