import { PRIORITY } from "@/lib/erp-format";
import { cn } from "@/lib/utils";

export function PriorityPill({ priority }: { priority: string }) {
  const p = PRIORITY[priority] ?? { label: priority, cls: "" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs whitespace-nowrap",
        p.cls,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {p.label}
    </span>
  );
}
