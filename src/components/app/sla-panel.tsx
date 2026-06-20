"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Label } from "@/components/ui/label";
import { createSlaDefinition, toggleSlaDefinition, deleteSlaDefinition } from "@/lib/calidad-actions";

type SLA = {
  id: string;
  name: string;
  metric: string;
  targetHours: number;
  mode: string | null;
  active: boolean;
  createdAt: Date;
};

const METRIC_LABELS: Record<string, string> = {
  cotizacion: "Cotización",
  booking: "Booking",
  dua: "DUA",
  entrega: "Entrega",
};

const MODE_LABELS: Record<string, string> = {
  FCL: "FCL",
  LCL: "LCL",
  AIR: "Aéreo",
  ROAD: "Terrestre",
  RAIL: "Ferroviario",
};

export function SlaPanel({ initialItems }: { initialItems: SLA[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    metric: "cotizacion",
    targetHours: "24",
    mode: "",
  });

  function handleCreate() {
    if (!form.name || !form.targetHours) return;
    startTransition(async () => {
      await createSlaDefinition({
        name: form.name,
        metric: form.metric,
        targetHours: Number(form.targetHours),
        mode: form.mode || undefined,
      });
      setOpen(false);
      setForm({ name: "", metric: "cotizacion", targetHours: "24", mode: "" });
    });
  }

  function handleToggle(id: string, currentActive: boolean) {
    startTransition(async () => {
      await toggleSlaDefinition(id, !currentActive);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active: !currentActive } : i)));
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSlaDefinition(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  const columns: Column<SLA>[] = [
    {
      key: "name",
      header: "Nombre",
      cell: (i) => i.name,
    },
    {
      key: "metric",
      header: "Métrica",
      cell: (i) => (
        <span className="inline-flex w-fit items-center rounded-md bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
          {METRIC_LABELS[i.metric] ?? i.metric}
        </span>
      ),
    },
    {
      key: "mode",
      header: "Modo",
      cell: (i) => (
        <span className="text-muted-foreground">
          {i.mode ? (MODE_LABELS[i.mode] ?? i.mode) : "Todos"}
        </span>
      ),
    },
    {
      key: "target",
      header: "Objetivo",
      align: "right",
      cell: (i) => <span className="font-mono tabular-nums text-foreground">{i.targetHours}h</span>,
    },
    {
      key: "status",
      header: "Estado",
      cell: (i) => (
        <StatusBadge
          status={i.active ? "activo" : "inactivo"}
          label={i.active ? "Activo" : "Inactivo"}
          tone={i.active ? "success" : "neutral"}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (i) => (
        <div className="flex shrink-0 items-center justify-end gap-1">
          <button
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            onClick={() => handleToggle(i.id, i.active)}
            disabled={isPending}
            title={i.active ? "Desactivar" : "Activar"}
          >
            {i.active ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5" />}
          </button>
          <ConfirmButton
            className="rounded p-1 text-muted-foreground/60 transition-colors hover:text-destructive disabled:opacity-40"
            onConfirm={() => handleDelete(i.id)}
            disabled={isPending}
            aria-label="Eliminar SLA"
            title="Eliminar SLA"
            description={`Se eliminará el SLA «${i.name}». Esta acción no se puede deshacer.`}
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
          {items.length} {items.length === 1 ? "SLA definido" : "SLAs definidos"}
        </p>
        <Button onClick={() => setOpen(true)} className="w-full gap-1.5 sm:w-auto">
          <Plus className="h-3.5 w-3.5" />
          Nuevo SLA
        </Button>
      </div>

      <DataTable
        className="mt-4"
        columns={columns}
        rows={items}
        getRowKey={(i) => i.id}
        empty="Sin SLAs definidos. Define objetivos de tiempo por métrica operativa."
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full flex-col overflow-hidden border-l border-border bg-card shadow-2xl sm:w-[440px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-medium tracking-tight">Definir SLA</h2>
              <button
                onClick={() => !isPending && setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="space-y-1.5">
                <Label htmlFor="sla-name">Nombre</Label>
                <Input
                  id="sla-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ej. Respuesta cotización FCL"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Métrica</Label>
                <Select value={form.metric} onValueChange={(v) => setForm({ ...form, metric: v })}>
                  <SelectTrigger aria-label="Métrica">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cotizacion">Cotización</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="dua">DUA</SelectItem>
                    <SelectItem value="entrega">Entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sla-target-hours">Objetivo (horas)</Label>
                <Input
                  id="sla-target-hours"
                  type="number"
                  min={1}
                  value={form.targetHours}
                  onChange={(e) => setForm({ ...form, targetHours: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Modo <span className="font-normal text-muted-foreground">(vacío = todos)</span>
                </Label>
                <Select
                  value={form.mode || "_all"}
                  onValueChange={(v) => setForm({ ...form, mode: v === "_all" ? "" : v })}
                >
                  <SelectTrigger aria-label="Modo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos los modos</SelectItem>
                    <SelectItem value="FCL">FCL</SelectItem>
                    <SelectItem value="LCL">LCL</SelectItem>
                    <SelectItem value="AIR">Aéreo</SelectItem>
                    <SelectItem value="ROAD">Terrestre</SelectItem>
                    <SelectItem value="RAIL">Ferroviario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="border-t border-border p-4">
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={isPending || !form.name || !form.targetHours}
              >
                Crear SLA
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
