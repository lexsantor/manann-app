import * as React from "react";
import { cn } from "@/lib/utils";

// Label tokenizado para formularios. Úsalo en lugar de <label> suelto.
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
