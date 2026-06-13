"use client";

import { useState } from "react";
import { Link2, Check, Loader2 } from "lucide-react";

import { getOrCreateShareToken } from "@/lib/erp-actions";
import { Icon } from "@/components/icon";

interface ShareButtonProps {
  shipmentId: string;
}

type Status = "idle" | "loading" | "copied" | "error";

export function ShareButton({ shipmentId }: ShareButtonProps) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleShare() {
    if (status === "loading") return;
    setStatus("loading");

    try {
      const token = await getOrCreateShareToken(shipmentId);
      const url = `${window.location.origin}/s/${token}`;
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={status === "loading"}
      title={
        status === "copied"
          ? "Enlace copiado"
          : status === "error"
          ? "Error al generar enlace"
          : "Compartir expediente"
      }
      className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-base text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60 print:hidden"
    >
      {status === "loading" ? (
        <Icon icon={Loader2} size={13} className="animate-spin" />
      ) : status === "copied" ? (
        <Icon icon={Check} size={13} className="text-primary" />
      ) : (
        <Icon icon={Link2} size={13} />
      )}
      {status === "copied"
        ? "Enlace copiado"
        : status === "error"
        ? "Error"
        : "Compartir"}
    </button>
  );
}
