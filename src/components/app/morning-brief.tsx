"use client";

import Link from "next/link";
import { AlertTriangle, Zap, ShieldAlert, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { type AutopilotAction } from "@/lib/autopilot";
import { formatMoney } from "@/lib/erp-format";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

// ─── Time Saved Donut ────────────────────────────────────────────────────────

function TimeSavedDonut({
  breakdown,
  total,
}: {
  breakdown: { label: string; hours: number }[];
  total: number;
}) {
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(172 51% 55%)",
    "hsl(var(--accent))",
    "hsl(var(--muted-foreground))",
  ];

  const max = total || 1;
  const R = 44, CX = 55, CY = 55, STROKE = 11;
  const circumference = 2 * Math.PI * R;
  let offset = 0;
  const slices = breakdown.map((b, i) => {
    const pct = b.hours / max;
    const dash = pct * circumference;
    const slice = { offset, dash, color: COLORS[i] };
    offset += dash;
    return slice;
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative shrink-0">
        <svg width="110" height="110" className="-rotate-90">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="hsl(var(--border))" strokeWidth={STROKE} />
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-semibold text-foreground leading-none">{total}h</span>
          <span className="font-mono text-sm text-muted-foreground">/ sem.</span>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {breakdown.map((b, i) => (
          <div key={b.label} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i] }} />
            <span className="text-base text-muted-foreground">{b.label}</span>
            <span className="ml-auto font-mono text-base font-medium text-foreground">{b.hours}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task row ─────────────────────────────────────────────────────────────────

function TaskRow({ action }: { action: AutopilotAction }) {
  const isCritical = action.severity === "critical";
  return (
    <Link
      href={action.kind === "invoice_at_risk" || action.kind === "negative_gp"
        ? "/autopilot"
        : `/expedientes/${action.shipmentId}`}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-surface-2",
        isCritical ? "border-destructive/20 bg-destructive/5" : "border-border bg-card",
      )}
    >
      <div className={cn(
        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
        isCritical ? "bg-destructive/10" : "bg-accent/10",
      )}>
        <Icon
          icon={isCritical ? AlertTriangle : Clock}
          size={14}
          className={isCritical ? "text-destructive" : "text-accent"}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-foreground">{action.title}</p>
        <p className="mt-0.5 text-base text-muted-foreground truncate">{action.description}</p>
      </div>
      {action.impact > 0 && (
        <span className={cn(
          "shrink-0 font-mono text-base font-semibold",
          isCritical ? "text-destructive" : "text-accent",
        )}>
          {formatMoney(String(action.impact), "EUR")}
        </span>
      )}
    </Link>
  );
}

// ─── Agenda item ──────────────────────────────────────────────────────────────

interface AgendaItem {
  time: string;
  label: string;
  tone: "red" | "amber" | "blue" | "neutral";
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MorningBriefProps {
  userName: string;
  actions: AutopilotAction[];
  atRiskTotal: number;
  atRiskCount: number;
  timeSaved: { total: number; breakdown: { label: string; hours: number }[] };
  shipmentCount: number;
}

const AGENDA: AgendaItem[] = [
  { time: "09:00", label: "Revisar expedientes en tránsito", tone: "blue" },
  { time: "12:00", label: "Actualizar tarifas Q3", tone: "amber" },
  { time: "16:00", label: "Confirmar campos IA pendientes", tone: "amber" },
  { time: "18:00", label: "Cierre operaciones del día", tone: "neutral" },
];

const TONE_CLASS: Record<AgendaItem["tone"], string> = {
  red: "bg-destructive/10 text-destructive",
  amber: "bg-accent/10 text-accent",
  blue: "bg-primary/10 text-primary",
  neutral: "bg-muted text-muted-foreground",
};

export function MorningBrief({
  userName,
  actions,
  atRiskTotal,
  atRiskCount,
  timeSaved,
  shipmentCount,
}: MorningBriefProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";

  const criticalCount = actions.filter((a) => a.severity === "critical").length;
  const topTasks = actions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/6 blur-2xl" />
        <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">{greeting}</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-foreground">
          {userName}.
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manann ha revisado tus <strong>{shipmentCount}</strong> expediente{shipmentCount !== 1 ? "s" : ""} mientras te preparabas.
        </p>

        {/* Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {atRiskTotal > 0 && (
            <Link href="/excepciones" className="flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-base font-medium text-destructive transition-colors hover:bg-destructive/10">
              <Icon icon={AlertTriangle} size={11} />
              {formatMoney(String(atRiskTotal), "EUR")} en riesgo
            </Link>
          )}
          {criticalCount > 0 && (
            <Link href="/autopilot" className="flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-base font-medium text-destructive transition-colors hover:bg-destructive/10">
              <Icon icon={Zap} size={11} />
              {criticalCount} tarea{criticalCount > 1 ? "s" : ""} crítica{criticalCount > 1 ? "s" : ""}
            </Link>
          )}
          {actions.length > 0 && (
            <Link href="/autopilot" className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-base font-medium text-primary transition-colors hover:bg-primary/10">
              <Icon icon={Zap} size={11} />
              {actions.length} acción{actions.length > 1 ? "es" : ""} IA
            </Link>
          )}
          <span className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-3 py-1 text-base font-medium text-success">
            <Icon icon={TrendingUp} size={11} />
            {timeSaved.total}h ahorradas esta semana
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan del día */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-medium tracking-tight text-foreground">Plan para hoy</h2>
            <Link href="/autopilot" className="flex items-center gap-1 text-base text-muted-foreground transition-colors hover:text-foreground">
              Ver todo
              <Icon icon={ArrowRight} size={12} />
            </Link>
          </div>
          {topTasks.length > 0 ? (
            <div className="space-y-2">
              {topTasks.map((a) => (
                <TaskRow key={a.id} action={a} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-4">
              <Icon icon={ShieldAlert} size={16} className="text-success" />
              <p className="text-base text-success">Sin tareas pendientes. Todo en orden.</p>
            </div>
          )}
        </div>

        {/* Sidebar: Time Saved + Agenda */}
        <div className="space-y-4">
          {/* Time Saved */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 font-mono text-sm uppercase tracking-wider text-muted-foreground">
              Tiempo ahorrado
            </p>
            <TimeSavedDonut breakdown={timeSaved.breakdown} total={timeSaved.total} />
            <p className="mt-3 text-base text-muted-foreground text-center">
              Casi <strong>{Math.round(timeSaved.total / 8)} jornada{timeSaved.total >= 16 ? "s" : ""}</strong> esta semana
            </p>
          </div>

          {/* Agenda */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="mb-3 font-mono text-sm uppercase tracking-wider text-muted-foreground">
              Agenda de hoy
            </p>
            <div className="space-y-2">
              {AGENDA.map((item) => (
                <div key={item.time} className="flex items-center gap-3">
                  <span className="shrink-0 font-mono text-base text-muted-foreground w-10">{item.time}</span>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    TONE_CLASS[item.tone].split(" ")[0],
                  )} />
                  <span className="text-base text-foreground leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
