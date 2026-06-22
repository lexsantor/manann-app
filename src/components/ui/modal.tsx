"use client";

import { useRef } from "react";

import { useFocusTrap } from "@/lib/use-focus-trap";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Nombre accesible del dialogo (aria-label). */
  label: string;
  /** "center" = modal central; "side" = panel deslizante desde la derecha. */
  variant?: "center" | "side";
  /** Clases del contenedor del panel (p.ej. ancho: "max-w-2xl"). */
  className?: string;
  children: React.ReactNode;
}

// Overlay unico del ERP. Encapsula el scrim + el foco atrapado (useFocusTrap:
// ESC, Tab ciclico, foco inicial y restauracion al cerrar) + role=dialog/
// aria-modal. Reemplaza los overlays hand-rolled repetidos en los paneles.
// z-50: mismo nivel que los dropdowns Radix portalados, asi siguen apareciendo
// por encima del contenido del modal (no subir a un token sin revisar el
// apilado de selects internos).
export function Modal({ open, onClose, label, variant = "center", className, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        variant === "center" ? "items-center justify-center p-4" : "items-stretch justify-end",
      )}
    >
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "relative z-10 outline-none",
          variant === "center"
            ? "w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl"
            : "flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
