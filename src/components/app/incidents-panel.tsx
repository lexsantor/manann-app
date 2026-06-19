"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { createIncident, updateIncidentStatus, deleteIncident } from "@/lib/calidad-actions";

type Incident = {
  id: string;
  type: string;
  description: string;
  responsible: string | null;
  status: string;
  impactCost: string | null;
  createdAt: Date;
  resolutionDate: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  retraso: "Retraso",
  daño: "Daño",
  perdida: "Pérdida",
  documental: "Documental",
};

function fmtMoney(v: string) {
  return Number(v).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export function IncidentsPanel({ initialItems }: { initialItems: Incident[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    type: "retraso",
    description: "",
    responsible: "",
    impactCost: "",
  });

  function handleCreate() {
    if (!form.description) return;
    startTransition(async () => {
      await createIncident({
        type: form.type,
        description: form.description,
        responsible: form.responsible || undefined,
        impactCost: form.impactCost ? Number(form.impactCost) : undefined,
      });
      setOpen(false);
      setForm({ type: "retraso", description: "", responsible: "", impactCost: "" });
    });
  }

  function handleResolve(id: string) {
    startTransition(async () => {
      const today = new Date().toISOString().split("T")[0];
      await updateIncidentStatus(id, "cerrado", today);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "cerrado", resolutionDate: today } : i)),
      );
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteIncident(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  const columns: Column<Incident>[] = [
    {
      key: "type",
      header: "Tipo",
      cell: (i) => <span className="font-medium text-foreground">{TYPE_LABELS[i.type] ?? i.type}</span>,
    },
    {
      key: "description",
      header: "Descripción",
      cell: (i) => (
        <div className="max-w-md">
          <p className="truncate text-foreground">{i.description}</p>
          {i.responsible && (
            <p className="text-xs text-muted-foreground">Responsable: {i.responsible}</p>
          )}
        </div>
      ),
    },
    {
      key: "impact",
      header: "Impacto",
      align: "right",
      cell: (i) => (
        <span className="font-mono tabular-nums text-muted-foreground">
          {i.impactCost && Number(i.impactCost) > 0 ? fmtMoney(i.impactCost) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (i) => <StatusBadge status={i.status} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (i) => (
        <div className="flex shrink-0 items-center justify-end gap-1">
          {i.status !== "cerrado" && (
            <button
              className="rounded p-1 text-success transition-colors hover:bg-success/10 disabled:opacity-40"
              onClick={() => handleResolve(i.id)}
              disabled={isPending}
              title="Marcar como cerrada"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          <ConfirmButton
            className="rounded p-1 text-muted-foreground/60 transition-colors hover:text-destructive disabled:opacity-40"
            onConfirm={() => handleDelete(i.id)}
            disabled={isPending}
            aria-label="Eliminar incidencia"
            title="Eliminar incidencia"
            description="Se eliminará esta incidencia. Esta acción no se puede deshacer."
          >
            <Trash2 className="h-4 w-4" />
          </ConfirmButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "incidencia" : "incidencias"}
        </p>
        <Button onClick={() => setOpen(true)} className="w-full gap-1.5 sm:w-auto">
          <Plus className="h-3.5 w-3.5" />
          Nueva incidencia
        </Button>
      </div>

      <DataTable
        className="mt-4"
        columns={columns}
        rows={items}
        getRowKey={(i) => i.id}
        empty="Sin incidencias registradas"
      />

      {/* New incident slide-in panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full flex-col overflow-hidden border-l border-border bg-card shadow-2xl sm:w-[440px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-medium tracking-tight">
                Registrar incidencia
              </h2>
              <button
                onClick={() => !isPending && setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger aria-label="Tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retraso">Retraso</SelectItem>
                    <SelectItem value="daño">Daño</SelectItem>
                    <SelectItem value="perdida">Pérdida</SelectItem>
                    <SelectItem value="documental">Documental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="incidencias-descripcion" className="text-sm font-medium text-foreground">Descripción</label>
                <Input
                  id="incidencias-descripcion"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción de la incidencia"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="incidencias-responsable" className="text-sm font-medium text-foreground">
                  Responsable <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <Input
                  id="incidencias-responsable"
                  value={form.responsible}
                  onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                  placeholder="Nombre o empresa"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="incidencias-coste-impacto" className="text-sm font-medium text-foreground">
                  Coste de impacto € <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <Input
                  id="incidencias-coste-impacto"
                  type="number"
                  value={form.impactCost}
                  onChange={(e) => setForm({ ...form, impactCost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="border-t border-border p-4">
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={isPending || !form.description}
              >
                Registrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
