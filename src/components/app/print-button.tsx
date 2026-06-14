"use client";

import { Printer } from "lucide-react";
import { Icon } from "@/components/icon";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground print:hidden"
    >
      <Icon icon={Printer} size={13} />
      PDF
    </button>
  );
}
