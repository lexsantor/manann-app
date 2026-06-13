import type { LucideIcon } from "lucide-react";

import { Icon } from "@/components/icon";
import { AnimatedNumber } from "@/components/app/animated-number";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: boolean;
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-[calc(0.75rem+6px)] bg-surface-2/20 p-1.5 ring-1 ring-border/30">
      <div className="rounded-xl bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-4 animate-pulse rounded bg-surface-2" />
        </div>
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

export function KpiCard({ label, value, icon, accent }: KpiCardProps) {
  return (
    <div className="rounded-[calc(0.75rem+6px)] bg-surface-2/20 p-1.5 ring-1 ring-border/30 transition-all duration-200 ease-out hover:bg-surface-2/40 hover:ring-border/60">
      <div className="rounded-xl bg-card p-4 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.05)]">
        <div className="flex items-center justify-between">
          <p className="font-sans text-base text-muted-foreground">{label}</p>
          <Icon
            icon={icon}
            size={18}
            className={accent ? "text-accent" : "text-muted-foreground"}
          />
        </div>
        <p className="mt-2 font-mono text-3xl font-medium tabular-nums tracking-tight text-foreground">
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </p>
      </div>
    </div>
  );
}
