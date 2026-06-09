import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Botón Manann. Dos radios del sistema:
 *  - tamaños in-app (sm/md/lg) → rounded-md (10px).
 *  - tamaño `hero` → rounded-full (pill), reservado al CTA de hero/marketing.
 * Color: `primary` = sea-green (escaso); `secondary` = borde slate; `ghost` = texto.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-[color,background-color,border-color,filter] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110",
        secondary:
          "border border-secondary/60 bg-transparent text-foreground hover:bg-secondary/10",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground",
      },
      size: {
        sm: "h-9 rounded-md px-3 text-sm",
        md: "h-10 rounded-md px-[18px] py-[11px] text-sm",
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
