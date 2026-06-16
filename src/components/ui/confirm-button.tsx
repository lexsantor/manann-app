"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

// Botón con confirmación para acciones destructivas. Renderiza el trigger
// (icono/contenido) y, al pulsar, abre un AlertDialog (portal a body, Escape +
// click-fuera para cancelar). Reemplaza los onClick destructivos directos.
export function ConfirmButton({
  onConfirm,
  title = "¿Confirmar acción?",
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  tone = "danger",
  children,
  className,
  disabled,
  "aria-label": ariaLabel,
}: {
  onConfirm: () => void;
  title?: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={className}
      >
        {children}
      </button>

      {open && mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div
              role="alertdialog"
              aria-modal="true"
              className="relative z-10 w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl"
            >
              <h2 className="font-display text-base font-semibold tracking-tight text-foreground">{title}</h2>
              {description ? (
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              ) : null}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onConfirm();
                  }}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    tone === "danger"
                      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
