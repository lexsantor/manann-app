"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Check, X, SlidersHorizontal } from "lucide-react";
import { upsertSystemParam, deleteSystemParam } from "@/lib/maestros-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SUGGESTED_KEYS = [
  { key: "empresa.nombre", label: "Nombre fiscal de la empresa" },
  { key: "empresa.cif", label: "CIF / NIF" },
  { key: "empresa.direccion", label: "Dirección fiscal" },
  { key: "empresa.email_contacto", label: "Email de contacto" },
  { key: "empresa.telefono", label: "Teléfono" },
  { key: "empresa.web", label: "Web" },
  { key: "factura.pie_texto", label: "Texto pie de factura" },
  { key: "factura.vencimiento_dias", label: "Vencimiento factura (días)" },
  { key: "divisa.base", label: "Divisa base" },
  { key: "incoterm.defecto", label: "Incoterm por defecto" },
];

interface Param {
  id: string;
  key: string;
  value: string;
  label: string | null;
}

export function SystemParamsPanel({ params: initial }: { params: Param[] }) {
  const [params, setParams] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ key: "", value: "", label: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function handleCreate() {
    if (!form.key || !form.value) return;
    start(async () => {
      await upsertSystemParam({ key: form.key, value: form.value, label: form.label || undefined });
      setParams((prev) => {
        const existing = prev.findIndex((p) => p.key === form.key);
        if (existing >= 0) {
          return prev.map((p, i) => i === existing ? { ...p, value: form.value, label: form.label || null } : p);
        }
        return [...prev, { id: crypto.randomUUID(), key: form.key, value: form.value, label: form.label || null }];
      });
      setForm({ key: "", value: "", label: "" });
      setShowForm(false);
    });
  }

  function startEdit(p: Param) {
    setEditingId(p.id);
    setEditValue(p.value);
  }

  function saveEdit(p: Param) {
    start(async () => {
      await upsertSystemParam({ key: p.key, value: editValue, label: p.label ?? undefined });
      setParams((prev) => prev.map((x) => x.id === p.id ? { ...x, value: editValue } : x));
      setEditingId(null);
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      await deleteSystemParam(id);
      setParams((prev) => prev.filter((p) => p.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm((v) => !v)} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Nuevo parámetro
      </Button>

      {showForm && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Nuevo parámetro</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <Label htmlFor="clave">Clave</Label>
              <Input
                id="clave"
                list="suggested-keys"
                className="font-mono"
                placeholder="empresa.nombre"
                value={form.key}
                onChange={(e) => {
                  const k = e.target.value;
                  const suggestion = SUGGESTED_KEYS.find((s) => s.key === k);
                  setForm({ ...form, key: k, label: suggestion?.label ?? form.label });
                }}
              />
              <datalist id="suggested-keys">
                {SUGGESTED_KEYS.map((s) => <option key={s.key} value={s.key} />)}
              </datalist>
            </div>
            <div className="space-y-1">
              <Label htmlFor="etiqueta-opcional">Etiqueta (opcional)</Label>
              <Input
                id="etiqueta-opcional"
                placeholder="Nombre descriptivo"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                placeholder="Valor del parámetro"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
            <Button
              onClick={handleCreate}
              disabled={pending || !form.key || !form.value}
            >
              Guardar
            </Button>
          </div>
        </div>
      )}

      {params.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal strokeWidth={1.5} />}
          title="Sin parámetros aún"
          hint="Añade parámetros del sistema para configurar el comportamiento del ERP."
        />
      ) : (
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {params.map((p) => (
          <div key={p.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs text-primary">{p.key}</div>
              {p.label && <div className="text-xs text-muted-foreground mt-0.5">{p.label}</div>}
            </div>
            <div className="flex items-center gap-2">
              {editingId === p.id ? (
                <>
                  <input
                    className="rounded border border-primary px-2 py-0.5 text-sm bg-background focus:outline-none w-48"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(p)}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(p)} className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-primary hover:text-primary/70"><Check className="h-3.5 w-3.5" strokeWidth={2} /></button>
                  <button onClick={() => setEditingId(null)} className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" strokeWidth={2} /></button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(p)}
                    className="rounded px-2 py-0.5 text-sm bg-muted/40 text-foreground hover:bg-muted/60 transition-colors max-w-xs truncate"
                  >
                    {p.value}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={pending}
                    className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
