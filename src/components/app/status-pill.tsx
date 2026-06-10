import { STATUS, type StatusTone } from "@/lib/erp-format";
import { cn } from "@/lib/utils";

const TONE: Record<StatusTone, { pill: string; dot: string }> = {
  active: { pill: "bg-accent-soft text-accent", dot: "bg-accent" },
  done: { pill: "bg-success/12 text-success", dot: "bg-success" },
  neutral: {
    pill: "border border-border text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "neutral" as StatusTone };
  const t = TONE[s.tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs whitespace-nowrap",
        t.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", t.dot)} />
      {s.label}
    </span>
  );
}
