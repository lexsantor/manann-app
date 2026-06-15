"use client";

import { useState, useTransition } from "react";
import { Timer, Plus, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} SLA(s) definido(s)</p>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nuevo SLA
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center mt-4">
          <Timer className="mb-2 h-8 w-8 text-muted-foreground/40" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">Sin SLAs definidos</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Define objetivos de tiempo por métrica operativa
          </p>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-md border p-3 transition-colors ${
                item.active ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className="inline-flex items-center rounded-md bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                    {METRIC_LABELS[item.metric] ?? item.metric}
                  </span>
                  {item.mode && (
                    <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {MODE_LABELS[item.mode] ?? item.mode}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Objetivo: {item.targetHours}h{!item.mode && " · Todos los modos"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                  onClick={() => handleToggle(item.id, item.active)}
                  disabled={isPending}
                  title={item.active ? "Desactivar" : "Activar"}
                >
                  {item.active ? (
                    <ToggleRight className="h-5 w-5 text-primary" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
                <button
                  className="rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-40"
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <label className="text-sm font-medium text-foreground">Nombre</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ej. Respuesta cotización FCL"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Métrica</label>
                <Select value={form.metric} onValueChange={(v) => setForm({ ...form, metric: v })}>
                  <SelectTrigger>
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
                <label className="text-sm font-medium text-foreground">Objetivo (horas)</label>
                <Input
                  type="number"
                  min={1}
                  value={form.targetHours}
                  onChange={(e) => setForm({ ...form, targetHours: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Modo <span className="text-muted-foreground font-normal">(vacío = todos)</span>
                </label>
                <Select
                  value={form.mode || "_all"}
                  onValueChange={(v) => setForm({ ...form, mode: v === "_all" ? "" : v })}
                >
                  <SelectTrigger>
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
