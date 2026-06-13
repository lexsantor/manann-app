import Link from "next/link";
import { MoveRight } from "lucide-react";
import { Icon } from "@/components/icon";
import { StatusPill } from "@/components/app/status-pill";
import { PriorityPill } from "@/components/app/priority-pill";
import { formatDate } from "@/lib/erp-format";
import { STATUS } from "@/lib/erp-format";
import type { ShipmentListItem } from "@/lib/erp";

const COLUMN_ORDER = [
  "borrador",
  "confirmado",
  "en_transito",
  "en_aduana",
  "entregado",
  "cerrado",
];

interface KanbanBoardProps {
  shipments: ShipmentListItem[];
}

export function KanbanBoard({ shipments }: KanbanBoardProps) {
  const byStatus = COLUMN_ORDER.reduce<Record<string, ShipmentListItem[]>>(
    (acc, s) => { acc[s] = []; return acc; },
    {},
  );
  for (const s of shipments) {
    if (byStatus[s.status]) byStatus[s.status].push(s);
    else byStatus[s.status] = [s];
  }

  const cols = COLUMN_ORDER.filter((k) => byStatus[k]?.length > 0);

  if (cols.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-10 text-center">
        <p className="text-base text-muted-foreground">No hay expedientes.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {cols.map((status) => {
        const items = byStatus[status];
        const label = STATUS[status]?.label ?? status;
        return (
          <div key={status} className="flex w-64 shrink-0 flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
              <span className="font-mono text-base text-ink-subtle">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((s) => <KanbanCard key={s.id} s={s} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ s }: { s: ShipmentListItem }) {
  const pol3 = s.pol?.slice(-3) ?? "---";
  const pod3 = s.pod?.slice(-3) ?? "---";
  return (
    <Link
      href={`/expedientes/${s.id}`}
      prefetch={false}
      className="block rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-base font-semibold text-foreground">{s.reference}</p>
        <PriorityPill priority={s.priority} />
      </div>
      {(s.pol || s.pod) && (
        <div className="mt-1.5 flex items-center gap-1 font-mono text-base text-muted-foreground">
          <span>{pol3}</span>
          <Icon icon={MoveRight} size={10} />
          <span>{pod3}</span>
        </div>
      )}
      {s.carrier && (
        <p className="mt-1 text-base text-ink-subtle truncate">{s.carrier}</p>
      )}
      {s.eta && (
        <p className="mt-1 text-base text-ink-subtle">ETA {formatDate(s.eta)}</p>
      )}
    </Link>
  );
}
