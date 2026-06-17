import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Botón Manann. Jerarquía (ver DESIGN.md):
 *  - `primary`   = sólido sea-green. UNA por vista, la acción principal.
 *  - `secondary` = sólido slate, acciones de apoyo.
 *  - `outline`   = borde + texto primary, acción terciaria.
 *  - `destructive` = soft (rojo sobre fondo rojo claro), acciones peligrosas.
 *  - `ghost`     = texto, sin fondo.
 * Radios: in-app (sm/md/lg) → rounded-md (10px); `hero` → rounded-full (pill).
 * Touch (Apple HIG): CTAs e inputs ≥44px en móvil (alturas responsive).
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-[color,background-color,border-color,filter] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110",
        secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
        outline: "border border-primary/40 bg-transparent text-primary hover:bg-primary/10",
        destructive:
          "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground",
      },
      size: {
        sm: "h-10 rounded-md px-3 text-sm sm:h-9",
        md: "h-11 rounded-md px-[18px] text-sm sm:h-10",
        lg: "h-11 rounded-md px-5 text-sm",
        hero: "h-12 rounded-full px-[26px] text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
