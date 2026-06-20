"use client";

import { Printer } from "lucide-react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button variant="secondary" onClick={() => window.print()} className="print:hidden">
      <Icon icon={Printer} size={13} />
      PDF
    </Button>
  );
}
