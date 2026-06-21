"use client";

import Link from "next/link";
import { ArrowRight, MoveRight, Copy, Loader2 } from "lucide-react";
import { useTransition } from "react";

import { Icon } from "@/components/icon";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill } from "./status-pill";
import { MODE, portLabel, formatDate, formatMoney } from "@/lib/erp-format";
import { duplicateShipment } from "@/lib/erp-actions";
import type { ShipmentListItem } from "@/lib/erp";
import { cn } from "@/lib/utils";

// GP desde cargos (igual que en boarding-pass)
function computeGP(charges: ShipmentListItem["charges"]): number | null {
  const revenues = charges.filter((c) => c.direction === "revenue");
  if (!revenues.length) return null;
  const totalSell = revenues.reduce((s, c) => s + Number(c.amount), 0);
  const hasAnyBuy = revenues.some((c) => c.buyAmount != null);
  const costs = charges.filter((c) => c.direction === "cost");
  if (!hasAnyBuy && !costs.length) return null;
  const totalBuy = hasAnyBuy
    ? revenues.reduce((s, c) => s + (c.buyAmount != null ? Number(c.buyAmount) : 0), 0)
    : costs.reduce((s, c) => s + Number(c.amount), 0);
  return totalSell - totalBuy;
}

interface ShipmentRowSelectableProps {
  s: ShipmentListItem;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function ShipmentRowSelectable({ s, selected = false, onSelect }: ShipmentRowSelectableProps) {
  const mode = MODE[s.mode] ?? MODE.maritimo;
  const consignee = s.parties.find((p) => p.role === "consignee");
  const gp = computeGP(s.charges);
  const [pending, startTransition] = useTransition();

  function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await duplicateShipment(s.id);
    });
  }

  return (
    <div
      className={cn(
        "group flex items-center rounded-md border transition-colors",
        selected
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card hover:border-hairline-strong hover:bg-surface-2",
      )}
    >
      {/* Checkbox */}
      <div className="shrink-0 pl-3">
        <Checkbox
          checked={selected}
          onChange={(checked) => onSelect?.(s.id, checked)}
          className="size-3.5 cursor-pointer"
          aria-label={selected ? "Deseleccionar" : "Seleccionar"}
        />
      </div>

      {/* Link principal */}
      <Link
        href={`/expedientes/${s.id}`}
        prefetch={false}
        data-shipment-row
        className="flex min-w-0 flex-1 items-center gap-4 px-3 py-3 focus-visible:outline-none"
      >
        {/* Referencia + consignatario */}
        <div className="w-[160px] shrink-0 min-w-0">
          <p className="font-mono text-base text-foreground truncate">{s.reference}</p>
          <p className="truncate text-base text-muted-foreground">
            {consignee?.name ?? "Sin consignatario"}
          </p>
        </div>

        {/* Ruta + naviera */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-base text-foreground">
            <Icon icon={mode.icon} size={14} className="shrink-0 text-muted-foreground" />
            <span className="truncate">{portLabel(s.pol)}</span>
            <Icon icon={MoveRight} size={13} className="shrink-0 text-ink-subtle" />
            <span className="truncate">{portLabel(s.pod)}</span>
          </div>
          <p className="truncate text-base text-muted-foreground">
            {s.carrier ?? "—"}{s.vessel ? ` · ${s.vessel}` : ""}
          </p>
        </div>

        {/* ETD */}
        <div className="hidden w-[76px] shrink-0 text-right sm:block">
          <span className="font-mono text-base text-muted-foreground">{formatDate(s.etd)}</span>
        </div>

        {/* ETA */}
        <div className="hidden w-[76px] shrink-0 text-right sm:block">
          <span className="font-mono text-base text-muted-foreground">{formatDate(s.eta)}</span>
        </div>

        {/* GP */}
        <div className="hidden w-[90px] shrink-0 text-right md:block">
          {gp !== null ? (
            <span className={cn("font-mono text-base font-semibold", gp >= 0 ? "text-success" : "text-destructive")}>
              {formatMoney(String(gp), "EUR")}
            </span>
          ) : (
            <span className="text-base text-ink-subtle">—</span>
          )}
        </div>

        {/* Estado */}
        <div className="w-[110px] shrink-0">
          <StatusPill status={s.status} />
        </div>
      </Link>

      {/* Acciones */}
      <div className="flex shrink-0 items-center pr-2">
        <button
          type="button"
          onClick={handleDuplicate}
          disabled={pending}
          title="Duplicar expediente"
          className="flex h-7 w-7 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-surface-2/60 hover:text-foreground disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Icon icon={Copy} size={13} />
          )}
        </button>
        <Icon
          icon={ArrowRight}
          size={14}
          className="text-ink-subtle opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </div>
    </div>
  );
}

// Compatibilidad con usos existentes (dashboard, etc.)
export function ShipmentRow({ s }: { s: ShipmentListItem }) {
  return <ShipmentRowSelectable s={s} />;
}
