import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { StatusPill } from "./status-pill";
import { PriorityPill } from "./priority-pill";
import { MODE, portLabel, formatDate } from "@/lib/erp-format";
import type { ShipmentListItem } from "@/lib/erp";

export function ShipmentRow({ s }: { s: ShipmentListItem }) {
  const mode = MODE[s.mode] ?? MODE.maritimo;
  const consignee = s.parties.find((p) => p.role === "consignee");

  return (
    <Link
      href={`/expedientes/${s.id}`}
      prefetch={false}
      data-shipment-row
      className="group grid grid-cols-1 gap-3 rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-surface-2 hover:border-hairline-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:grid-cols-[180px_1fr_auto] sm:items-center sm:gap-4"
    >
      {/* referencia + consignatario */}
      <div className="min-w-0">
        <p className="font-mono text-sm text-foreground">{s.reference}</p>
        <p className="truncate text-xs text-muted-foreground">
          {consignee?.name ?? "Sin consignatario"}
        </p>
      </div>

      {/* ruta + naviera */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Icon icon={mode.icon} size={15} className="shrink-0 text-muted-foreground" />
          <span className="truncate">{portLabel(s.pol)}</span>
          <Icon icon={MoveRight} size={14} className="shrink-0 text-ink-subtle" />
          <span className="truncate">{portLabel(s.pod)}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {s.carrier}
          {s.vessel ? ` · ${s.vessel}` : ""}
        </p>
      </div>

      {/* estado, prioridad, ETA, flecha */}
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          <StatusPill status={s.status} />
          <PriorityPill priority={s.priority} />
        </div>
        <div className="flex items-center gap-2 sm:w-[120px] sm:justify-end">
          <span className="font-mono text-xs text-muted-foreground">
            ETA {formatDate(s.eta)}
          </span>
          <Icon
            icon={ArrowRight}
            size={16}
            className="text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        </div>
      </div>
    </Link>
  );
}
