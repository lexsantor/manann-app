"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badges";
import { ConfirmButton } from "@/components/ui/confirm-button";
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

  const columns: Column<NC>[] = [
    {
      key: "category",
      header: "Categoría",
      cell: (i) => <span className="font-medium text-foreground">{CAT_LABELS[i.category] ?? i.category}</span>,
    },
    {
      key: "description",
      header: "Descripción",
      cell: (i) => (
        <div className="max-w-lg">
          <p className="truncate text-foreground">{i.description}</p>
          {i.rootCause && <p className="truncate text-xs text-muted-foreground">Causa: {i.rootCause}</p>}
          {i.correctiveAction && (
            <p className="truncate text-xs text-muted-foreground">Acción: {i.correctiveAction}</p>
          )}
        </div>
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
              className="rounded p-1 text-emerald-600 transition-colors hover:bg-emerald-500/10 disabled:opacity-40 dark:text-emerald-400"
              onClick={() => handleClose(i.id)}
              disabled={isPending}
              title="Cerrar NC"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          <ConfirmButton
            className="rounded p-1 text-muted-foreground/60 transition-colors hover:text-destructive disabled:opacity-40"
            onConfirm={() => handleDelete(i.id)}
            disabled={isPending}
            aria-label="Eliminar no conformidad"
            title="Eliminar no conformidad"
            description="Se eliminará esta no conformidad. Esta acción no se puede deshacer."
          >
            <Trash2 className="h-4 w-4" />
          </ConfirmButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "no conformidad" : "no conformidades"}
        </p>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nueva NC
        </Button>
      </div>

      <DataTable
        className="mt-4"
        columns={columns}
        rows={items}
        getRowKey={(i) => i.id}
        empty="Sin no conformidades registradas"
      />

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
                  Causa raíz <span className="font-normal text-muted-foreground">(opcional)</span>
                </label>
                <Input
                  value={form.rootCause}
                  onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                  placeholder="¿Por qué ocurrió?"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Acción correctiva <span className="font-normal text-muted-foreground">(opcional)</span>
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
