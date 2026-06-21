"use client";

import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldRenderProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid": boolean;
}

interface FieldProps {
  /** Texto de la etiqueta (siempre presente: cierra los inputs sin label). */
  label: string;
  /** Mensaje de error; si existe, se anuncia (role="alert") y se liga al control. */
  error?: string | null;
  /** Pista opcional bajo el control. */
  hint?: string;
  /** Marca visual + semántica de campo obligatorio. */
  required?: boolean;
  className?: string;
  /**
   * Render-prop: recibe el id y los atributos ARIA ya cableados.
   * Úsalo así: {(p) => <Input {...p} value={...} onChange={...} />}
   */
  children: (props: FieldRenderProps) => ReactNode;
}

/**
 * Field — envuelve Label + control + error con la accesibilidad ya cableada
 * (htmlFor/id, aria-describedby, aria-invalid, role="alert"). Cierra de raíz
 * los inputs sin label y los errores de formulario sin asociar.
 */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": !!error })}
      {hint && !error ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
