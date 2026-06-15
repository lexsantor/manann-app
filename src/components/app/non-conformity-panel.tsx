"use client";

import { useState, useTransition } from "react";
import { ClipboardList, Plus, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createNonConformity, updateNonConformityStatus, deleteNonConformity } from "@/lib/calidad-actions";

type NC = {
  id: string;
  category: string;
  description: string;
  rootCause: string | null;
  correctiveAction: string | null;
  status: string;
  createdAt: Date;
};

const CAT_LABELS: Record<string, string> = {
  proceso: "Proceso",
  proveedor: "Proveedor",
  cliente: "Cliente",
  externo: "Externo",
};

const STATUS_COLORS: Record<string, string> = {
  abierto: "text-red-500 bg-red-500/10",
  "en-proceso": "text-amber-500 bg-amber-500/10",
  cerrado: "text-emerald-500 bg-emerald-500/10",
};

export function NonConformityPanel({ initialItems }: { initialItems: NC[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    category: "proceso",
    description: "",
    rootCause: "",
    correctiveAction: "",
  });

  function handleCreate() {
    if (!form.description) return;
    startTransition(async () => {
      await createNonConformity({
        category: form.category,
        description: form.description,
        rootCause: form.rootCause || undefined,
        correctiveAction: form.correctiveAction || undefined,
      });
      setOpen(false);
      setForm({ category: "proceso", description: "", rootCause: "", correctiveAction: "" });
    });
  }

  function handleClose(id: string) {
    startTransition(async () => {
      await updateNonConformityStatus(id, "cerrado");
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "cerrado" } : i)));
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNonConformity(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} no conformidad(es)</p>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nueva NC
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center mt-4">
          <ClipboardList className="mb-2 h-8 w-8 text-muted-foreground/40" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">Sin no conformidades registradas</p>
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
                    {CAT_LABELS[item.category] ?? item.category}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status] ?? ""}`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                {item.rootCause && (
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    Causa: {item.rootCause}
                  </p>
                )}
                {item.correctiveAction && (
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    Acción: {item.correctiveAction}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                {item.status !== "cerrado" && (
                  <button
                    className="rounded p-1 text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-40"
                    onClick={() => handleClose(item.id)}
                    disabled={isPending}
                    title="Cerrar NC"
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

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full flex-col overflow-hidden border-l border-border bg-card shadow-2xl sm:w-[440px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-medium tracking-tight">
                Registrar no conformidad
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
                <label className="text-sm font-medium text-foreground">Categoría</label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proceso">Proceso</SelectItem>
                    <SelectItem value="proveedor">Proveedor</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="externo">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Descripción</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción de la no conformidad"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Causa raíz <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
                  value={form.rootCause}
                  onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                  placeholder="¿Por qué ocurrió?"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Acción correctiva <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
                  value={form.correctiveAction}
                  onChange={(e) => setForm({ ...form, correctiveAction: e.target.value })}
                  placeholder="Medida adoptada"
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
