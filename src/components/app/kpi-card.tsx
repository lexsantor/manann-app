import type { LucideIcon } from "lucide-react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}

export function KpiCard({ label, value, icon, accent }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="font-sans text-sm text-muted-foreground">{label}</p>
        <Icon
          icon={icon}
          size={18}
          className={accent ? "text-accent" : "text-muted-foreground"}
        />
      </div>
      <p className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
