"use client";

import { Printer } from "lucide-react";
import { Icon } from "@/components/icon";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-base text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon icon={Printer} size={14} />
      Exportar PDF
    </button>
  );
}
