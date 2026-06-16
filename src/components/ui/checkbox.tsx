import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Checkbox tokenizado (custom-dark/light) — sustituye a los <input type="checkbox">
// nativos. role="checkbox" para a11y; soporta estado indeterminado.
export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "inline-flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked || indeterminate
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:border-primary/50",
        className,
      )}
    >
      {indeterminate ? (
        <Minus className="h-3 w-3" strokeWidth={3} />
      ) : checked ? (
        <Check className="h-3 w-3" strokeWidth={3} />
      ) : null}
    </button>
  );
}
