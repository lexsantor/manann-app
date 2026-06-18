"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { ShipmentListItem } from "@/lib/erp";
import type { OrgMember } from "@/components/app/assignee-select";
import { ShipmentBoardingPass } from "@/components/app/shipment-boarding-pass";
import { BulkActionsBar } from "@/components/app/bulk-actions-bar";
import { DataTable, CellStacked, MiniBar, type Column } from "@/components/ui/data-table";
import { StatusBadge, ModeBadge } from "@/components/ui/badges";
import { Checkbox } from "@/components/ui/checkbox";
import { STATUS, MODE, formatMoney } from "@/lib/erp-format";

interface ShipmentListClientProps {
  shipments: ShipmentListItem[];
  members: OrgMember[];
  view: "cards" | "tabla";
}

function csvCell(v: unknown): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
}

// GP/Venta/Margen derivados de los cargos del expediente.
function economics(s: ShipmentListItem) {
  let revenue = 0;
  let cost = 0;
  for (const c of s.charges) {
    const amt = Number(c.amount) || 0;
    if (c.direction === "revenue") revenue += amt;
    else cost += amt;
  }
  const gp = revenue - cost;
  const margin = revenue > 0 ? (gp / revenue) * 100 : 0;
  return { revenue, gp, margin };
}

function modeKey(s: ShipmentListItem): string {
  if (s.mode === "maritimo") return s.loadType ?? "fcl";
  return s.mode;
}

function consigneeName(s: ShipmentListItem): string {
  return s.parties.find((p) => p.role === "consignee")?.name ?? "—";
}

export function ShipmentListClient({ shipments, members, view }: ShipmentListClientProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === shipments.length ? new Set() : new Set(shipments.map((s) => s.id)),
    );
  }, [shipments]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  function exportSelected() {
    const ids = Array.from(selected);
    const subset = ids.length > 0 ? shipments.filter((s) => ids.includes(s.id)) : shipments;

    const header = "Referencia,Estado,Modo,POL,POD,Naviera,ETD,ETA";
    const rows = subset.map((s) =>
      [
        s.reference,
        STATUS[s.status]?.label ?? s.status,
        MODE[s.mode]?.label ?? s.mode,
        s.pol ?? "",
        s.pod ?? "",
        s.carrier ?? "",
        s.etd ? new Date(s.etd).toLocaleDateString("es-ES") : "",
        s.eta ? new Date(s.eta).toLocaleDateString("es-ES") : "",
      ]
        .map(csvCell)
        .join(","),
    );

    const csv = [header, ...rows].join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expedientes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const allSelected = shipments.length > 0 && selected.size === shipments.length;
  const someSelected = selected.size > 0 && selected.size < shipments.length;

  if (shipments.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-10 text-center">
        <p className="text-base text-muted-foreground">No hay expedientes con ese estado.</p>
      </div>
    );
  }

  const columns: Column<ShipmentListItem>[] = [
    {
      key: "select",
      card: "hidden",
      header: (
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={toggleAll}
          aria-label="Seleccionar todos"
        />
      ),
      headerClassName: "w-[1%]",
      cell: (s) => (
        <Checkbox
          checked={selected.has(s.id)}
          onChange={(checked) => toggle(s.id, checked)}
          aria-label={`Seleccionar ${s.reference}`}
        />
      ),
    },
    {
      key: "reference",
      header: "Expediente",
      cell: (s) => (
        <CellStacked
          mono
          primary={
            <Link href={`/expedientes/${s.id}`} className="hover:text-primary transition-colors">
              {s.reference}
            </Link>
          }
          secondary={s.blNumber ?? undefined}
        />
      ),
    },
    {
      key: "mode",
      header: "Modo",
      cell: (s) => <ModeBadge mode={modeKey(s)} />,
    },
    {
      key: "route",
      header: "Ruta",
      cell: (s) => (
        <CellStacked
          mono
          primary={`${s.pol ?? "—"} → ${s.pod ?? "—"}`}
          secondary={s.carrier ?? undefined}
        />
      ),
    },
    {
      key: "client",
      header: "Cliente",
      cell: (s) => <span className="text-foreground">{consigneeName(s)}</span>,
    },
    {
      key: "status",
      header: "Estado",
      cell: (s) => <StatusBadge status={s.status} label={STATUS[s.status]?.label} />,
    },
    {
      key: "revenue",
      header: "Venta",
      align: "right",
      cell: (s) => (
        <span className="font-mono tabular-nums text-foreground">
          {formatMoney(String(economics(s).revenue))}
        </span>
      ),
    },
    {
      key: "gp",
      header: "GP",
      align: "right",
      cell: (s) => {
        const { gp } = economics(s);
        return (
          <span
            className={
              gp >= 0
                ? "font-mono tabular-nums text-success"
                : "font-mono tabular-nums text-destructive"
            }
          >
            {formatMoney(String(gp))}
          </span>
        );
      },
    },
    {
      key: "margin",
      header: "Margen",
      align: "right",
      cell: (s) => {
        const { margin } = economics(s);
        return (
          <div className="flex items-center justify-end gap-2">
            <span className="font-mono tabular-nums text-muted-foreground">{margin.toFixed(1)}%</span>
            <MiniBar value={margin} tone={margin >= 8 ? "success" : "primary"} />
          </div>
        );
      },
    },
  ];

  return (
    <>
      {view === "tabla" ? (
        <DataTable columns={columns} rows={shipments} getRowKey={(s) => s.id} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shipments.map((s, i) => (
            <div
              key={s.id}
              className="card-stagger relative group/card"
              style={{ "--i": Math.min(i, 5) } as React.CSSProperties}
            >
              {/* Checkbox overlay — encima del toggle de imagen (z-20 > z-10) */}
              <button
                type="button"
                onClick={() => toggle(s.id, !selected.has(s.id))}
                aria-label={selected.has(s.id) ? "Deseleccionar" : "Seleccionar"}
                className={[
                  "absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-md transition-opacity",
                  selected.has(s.id)
                    ? "bg-primary text-white opacity-100"
                    : "bg-black/40 text-white/70 opacity-0 group-hover/card:opacity-100",
                ].join(" ")}
              >
                {selected.has(s.id) ? (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5L5.5 9.5L10.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <rect x="2" y="2" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
              <div className={selected.has(s.id) ? "ring-2 ring-primary/40 rounded-xl" : ""}>
                <ShipmentBoardingPass s={s} />
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.size > 0 && (
        <BulkActionsBar
          selected={Array.from(selected)}
          members={members}
          onExport={exportSelected}
          onClear={clearSelection}
        />
      )}
    </>
  );
}
