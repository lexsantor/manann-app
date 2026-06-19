"use client";

import { Search } from "lucide-react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

// Buscador único del ERP. Usa `bg-card` (NO transparente) para que no parezca
// deshabilitado sobre el fondo de página, y la misma altura que el Input del kit.
// Soporta modo controlado (value+onChange) y no controlado (defaultValue).
export function SearchField({
  value,
  defaultValue,
  onChange,
  placeholder = "Buscar…",
  className,
  "aria-label": ariaLabel,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Icon
        icon={Search}
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-11 w-full rounded-md border border-input bg-card pl-9 pr-3 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 md:text-sm"
      />
    </div>
  );
}
