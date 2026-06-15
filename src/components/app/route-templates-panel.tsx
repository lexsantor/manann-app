"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, RouteOff } from "lucide-react";
import { createRouteTemplate, deleteRouteTemplate } from "@/lib/tier-s-actions";
import { cn } from "@/lib/utils";

interface RouteTemplate {
  id: string;
  name: string;
  mode: string;
  transitDays: number | null;
  active: boolean;
  createdAt: Date;
}

const MODE_OPTIONS = [
  { value: "maritimo", label: "Marítimo" },
  { value: "aereo", label: "Aéreo" },
  { value: "ferroviario", label: "Ferroviario" },
  { value: "terrestre", label: "Terrestre" },
  { value: "multimodal", label: "Multimodal" },
];

const MODE_COLORS: Record<string, string> = {
  maritimo: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  aereo: "bg-primary/10 text-primary",
  ferroviario: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  terrestre: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  multimodal: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export function RouteTemplatesPanel({ templates: initial }: { templates: RouteTemplate[] }) {
  const [templates, setTemplates] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ name: "", mode: "maritimo", transitDays: "" });

  function handleCreate() {
    if (!form.name) return;
    start(async () => {
      await createRouteTemplate({
        name: form.name,
        mode: form.mode,
        transitDays: form.transitDays ? Number(form.transitDays) : undefined,
      });
      setTemplates((prev) => [
        {
          id: crypto.randomUUID(),
          name: form.name,
          mode: form.mode,
          transitDays: form.transitDays ? Number(form.transitDays) : null,
          active: true,
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setForm({ name: "", mode: "maritimo", transitDays: "" });
      setShowForm(false);
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      await deleteRouteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    });
  }

  const modeLabel = (mode: string) => MODE_OPTIONS.find((m) => m.value === mode)?.label ?? mode;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Nueva plantilla
      </button>

      {showForm && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Nueva plantilla de ruta</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground">Nombre</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Barcelona → Shanghai FCL 30 días"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Modo</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
              >
                {MODE_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Días de tránsito</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="30"
                value={form.transitDays}
                onChange={(e) => setForm({ ...form, transitDays: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
            <button
              onClick={handleCreate}
              disabled={pending || !form.name}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {templates.length === 0 && (
          <div className="rounded-md border border-border py-10 text-center text-sm text-muted-foreground">
            Sin plantillas de ruta
          </div>
        )}
        {templates.map((t) => (
          <div
            key={t.id}
            className="group flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 hover:border-border/80 transition-colors"
          >
            <div className={cn("rounded-md px-2 py-0.5 text-[11px] font-medium shrink-0", MODE_COLORS[t.mode] ?? "bg-muted text-muted-foreground")}>
              {modeLabel(t.mode)}
            </div>
            <span className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">{t.name}</span>
            {t.transitDays !== null && (
              <span className="text-xs text-muted-foreground shrink-0">
                {t.transitDays} días
              </span>
            )}
            <button
              onClick={() => handleDelete(t.id)}
              disabled={pending}
              className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
