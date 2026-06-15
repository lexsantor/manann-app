"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Plus, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const STATUS_COLORS: Record<string, string> = {
  abierto: "text-red-500 bg-red-500/10",
  "en-proceso": "text-amber-500 bg-amber-500/10",
  cerrado: "text-emerald-500 bg-emerald-500/10",
};

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

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} incidencia(s)</p>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nueva incidencia
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
          <AlertTriangle className="mb-2 h-8 w-8 text-muted-foreground/40" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">Sin incidencias registradas</p>
        </div>
      ) : (
        <div className="space-y-2 mt-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status] ?? ""}`}
                  >
                    {item.status}
                  </span>
                  {item.impactCost && (
                    <span className="text-xs text-muted-foreground">
                      {Number(item.impactCost).toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                {item.responsible && (
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    Responsable: {item.responsible}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                {item.status !== "cerrado" && (
                  <button
                    className="rounded p-1 text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-40"
                    onClick={() => handleResolve(item.id)}
                    disabled={isPending}
                    title="Marcar como cerrada"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
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
                  <SelectTrigger>
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
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción de la incidencia"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Responsable <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
                  value={form.responsible}
                  onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                  placeholder="Nombre o empresa"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Coste de impacto € <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
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
