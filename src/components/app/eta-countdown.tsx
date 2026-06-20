"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface EtaCountdownProps {
  eta: string; // ISO string
  status: string;
}

const ETA_ACTIVE = ["confirmado", "en_transito", "en_aduana"];

function calcRemaining(eta: Date): { days: number; hours: number; overdue: boolean } {
  const diff = eta.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, overdue: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours, overdue: false };
}

export function EtaCountdown({ eta, status }: EtaCountdownProps) {
  const etaDate = useMemo(() => new Date(eta), [eta]);
  const [remaining, setRemaining] = useState(() => calcRemaining(etaDate));

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining(etaDate)), 60_000);
    return () => clearInterval(id);
  }, [etaDate]);

  const isActive = ETA_ACTIVE.includes(status);
  if (!isActive) return null;

  if (remaining.overdue) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-4">
        <Icon icon={Clock} size={16} className="shrink-0 text-accent" />
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-accent">ETA vencida</p>
          <p className="mt-0.5 text-sm text-accent/80">
            El envío debería haber llegado el{" "}
            {etaDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
      <Icon icon={Clock} size={16} className="shrink-0 text-muted-foreground" />
      <div className="flex-1">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Tiempo estimado de llegada
        </p>
        <p className="mt-0.5 text-sm text-foreground">
          {etaDate.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("font-display text-2xl font-semibold tabular-nums tracking-tight", remaining.days < 3 ? "text-accent" : "text-foreground")}>
          {remaining.days > 0 ? `${remaining.days}d ${remaining.hours}h` : `${remaining.hours}h`}
        </p>
        <p className="font-mono text-xs text-muted-foreground">restantes</p>
      </div>
    </div>
  );
}
