"use client";

import { useState, useCallback } from "react";
import type { ShipmentListItem } from "@/lib/erp";
import type { OrgMember } from "@/components/app/assignee-select";
import { ShipmentBoardingPass } from "@/components/app/shipment-boarding-pass";
import { ShipmentRowSelectable } from "@/components/app/shipment-row";
import { KeyboardListNav } from "@/components/app/keyboard-list-nav";
import { BulkActionsBar } from "@/components/app/bulk-actions-bar";
import { STATUS, MODE } from "@/lib/erp-format";

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

  return (
    <>
      {view === "tabla" ? (
        <div>
          {/* Cabecera tabla */}
          <div className="mb-1 flex items-center gap-4 rounded-md border border-transparent px-4 py-1.5">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              onChange={toggleAll}
              className="size-3.5 shrink-0 cursor-pointer accent-primary"
              aria-label="Seleccionar todos"
            />
            <span className="w-[160px] shrink-0 text-sm text-ink-subtle">Referencia</span>
            <span className="min-w-0 flex-1 text-sm text-ink-subtle">Ruta · Naviera</span>
            <span className="hidden w-[76px] shrink-0 text-right text-sm text-ink-subtle sm:block">ETD</span>
            <span className="hidden w-[76px] shrink-0 text-right text-sm text-ink-subtle sm:block">ETA</span>
            <span className="hidden w-[90px] shrink-0 text-right text-sm text-ink-subtle md:block">GP</span>
            <span className="w-[110px] shrink-0 text-sm text-ink-subtle">Estado</span>
            <span className="w-[32px] shrink-0" />
          </div>
          <KeyboardListNav>
            {shipments.map((s) => (
              <ShipmentRowSelectable
                key={s.id}
                s={s}
                selected={selected.has(s.id)}
                onSelect={toggle}
              />
            ))}
          </KeyboardListNav>
        </div>
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
