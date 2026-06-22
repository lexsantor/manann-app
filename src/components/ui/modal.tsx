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
  /** Clases de SUPERFICIE del panel (radio, borde, fondo, sombra, ancho, padding). */
  className?: string;
  children: React.ReactNode;
}

// Overlay unico del ERP. Posee SOLO el comportamiento comun: el scrim (dim +
// click-fuera + blur), el foco atrapado (useFocusTrap: ESC, Tab ciclico, foco
// inicial y restauracion) y role=dialog/aria-modal/aria-label. La superficie
// del panel (radio/borde/fondo/sombra/ancho) la define cada consumidor via
// className, asi adoptarlo PRESERVA el aspecto de cada panel.
// z-50: mismo nivel que los dropdowns Radix portalados → siguen apareciendo
// sobre el contenido del modal (no subir a un token sin revisar selects internos).
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
        className={cn("relative z-10 outline-none", className)}
      >
        {children}
      </div>
    </div>
  );
}
