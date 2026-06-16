"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createRouteTemplate, deleteRouteTemplate } from "@/lib/tier-s-actions";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ModeBadge } from "@/components/ui/badges";

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

  const columns: Column<RouteTemplate>[] = [
    {
      key: "mode",
      header: "Modo",
      cell: (t) => <ModeBadge mode={t.mode} />,
    },
    {
      key: "name",
      header: "Nombre",
      cell: (t) => <span className="font-medium text-foreground">{t.name}</span>,
    },
    {
      key: "transit",
      header: "Tránsito",
      align: "right",
      cell: (t) => (
        <span className="font-mono tabular-nums text-muted-foreground">
          {t.transitDays !== null ? `${t.transitDays} días` : "—"}
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (t) => (
        <button
          onClick={() => handleDelete(t.id)}
          disabled={pending}
          className="text-muted-foreground/60 transition-colors hover:text-destructive disabled:opacity-50"
          aria-label={`Eliminar plantilla ${t.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Nueva plantilla
      </button>

      {showForm && (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
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
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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

      <DataTable columns={columns} rows={templates} getRowKey={(t) => t.id} empty="Sin plantillas de ruta" />
    </div>
  );
}
