"use client";

import { useState, useTransition } from "react";
import { Lock, LockOpen, Plus } from "lucide-react";
import { closePeriod, reopenPeriod, ensurePeriod } from "@/lib/contabilidad-actions";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badges";
import { DataTable, type Column } from "@/components/ui/data-table";

interface Period {
  id: string;
  year: number;
  month: number;
  status: string;
  closedAt: Date | null;
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function AccountingPeriodsPanel({ periods: initial }: { periods: Period[] }) {
  const [periods, setPeriods] = useState(initial);
  const [pending, start] = useTransition();
  const today = new Date();

  function handleClose(year: number, month: number) {
    start(async () => {
      await closePeriod(year, month);
      setPeriods((prev) =>
        prev.map((p) =>
          p.year === year && p.month === month
            ? { ...p, status: "closed", closedAt: new Date() }
            : p,
        ),
      );
    });
  }

  function handleReopen(year: number, month: number) {
    start(async () => {
      await reopenPeriod(year, month);
      setPeriods((prev) =>
        prev.map((p) =>
          p.year === year && p.month === month
            ? { ...p, status: "open", closedAt: null }
            : p,
        ),
      );
    });
  }

  function handleCreate() {
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const exists = periods.some((p) => p.year === year && p.month === month);
    if (exists) return;
    start(async () => {
      await ensurePeriod(year, month);
      setPeriods((prev) => [
        { id: crypto.randomUUID(), year, month, status: "open", closedAt: null },
        ...prev,
      ]);
    });
  }

  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1;
  const hasCurrentPeriod = periods.some((p) => p.year === thisYear && p.month === thisMonth);

  const columns: Column<Period>[] = [
    {
      key: "period",
      header: "Período",
      cell: (p) => (
        <span className="font-mono text-sm font-medium text-foreground">
          {MONTHS[p.month - 1]} {p.year}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (p) =>
        p.status === "closed" ? (
          <StatusBadge status="closed" label="Cerrado" tone="neutral" />
        ) : (
          <StatusBadge status="open" label="Abierto" tone="success" />
        ),
    },
    {
      key: "closedAt",
      header: "Cerrado el",
      cell: (p) => (
        <span className="text-xs text-muted-foreground">
          {p.closedAt
            ? new Date(p.closedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
            : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      card: "hidden",
      cell: (p) =>
        p.status === "open" ? (
          <button
            onClick={() => handleClose(p.year, p.month)}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors disabled:opacity-40"
          >
            <Lock className="h-3 w-3" /> Cerrar período
          </button>
        ) : (
          <button
            onClick={() => handleReopen(p.year, p.month)}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-warning/40 hover:text-foreground transition-colors disabled:opacity-40"
          >
            <LockOpen className="h-3 w-3" /> Reabrir
          </button>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      {!hasCurrentPeriod && (
        <Button onClick={handleCreate} disabled={pending} size="sm">
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Abrir período {MONTHS[thisMonth - 1]} {thisYear}
        </Button>
      )}

      <DataTable
        columns={columns}
        rows={periods}
        getRowKey={(p) => p.id}
        empty="Sin períodos registrados"
        caption="Períodos contables"
      />

      <p className="text-xs text-muted-foreground">
        Los asientos en períodos cerrados no pueden modificarse. Reabrir un período queda registrado en el diario de auditoría.
      </p>
    </div>
  );
}
