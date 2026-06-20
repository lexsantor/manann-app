"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createRouteTemplate, deleteRouteTemplate } from "@/lib/tier-s-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ModeBadge } from "@/components/ui/badges";
import { ConfirmButton } from "@/components/ui/confirm-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
      card: "title",
      cell: (t) => t.name,
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
        <ConfirmButton
          onConfirm={() => handleDelete(t.id)}
          disabled={pending}
          aria-label={`Eliminar plantilla ${t.name}`}
          title="Eliminar plantilla de ruta"
          description={`Se eliminará la plantilla «${t.name}». Esta acción no se puede deshacer.`}
          className="text-muted-foreground/60 transition-colors hover:text-destructive disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </ConfirmButton>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm((v) => !v)} className="w-full justify-center gap-1.5 sm:w-auto">
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Nueva plantilla
      </Button>

      {showForm && (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground">Nueva plantilla de ruta</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Barcelona → Shanghai FCL 30 días"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Modo</Label>
              <Select
                value={form.mode}
                onValueChange={(v) => setForm({ ...form, mode: v })}
              >
                <SelectTrigger aria-label="Modo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODE_OPTIONS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dias-de-transito">Días de tránsito</Label>
              <Input
                id="dias-de-transito"
                type="number"
                min={1}
                className="font-mono"
                placeholder="30"
                value={form.transitDays}
                onChange={(e) => setForm({ ...form, transitDays: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 sm:justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={pending || !form.name} className="w-full sm:w-auto">Guardar</Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} rows={templates} getRowKey={(t) => t.id} empty="Sin plantillas de ruta" />
    </div>
  );
}
