"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExpense, deleteExpense } from "@/lib/expense-actions";

type Expense = {
  id: string;
  date: string;
  category: string;
  description: string | null;
  amount: string;
  currency: string;
  supplier: string | null;
  status: string;
};

const CATEGORIES = [
  "combustible", "peajes", "alquiler", "suministros", "dietas", "seguros", "servicios", "otro",
];
const CAT_LABEL: Record<string, string> = {
  combustible: "Combustible", peajes: "Peajes", alquiler: "Alquiler", suministros: "Suministros",
  dietas: "Dietas", seguros: "Seguros", servicios: "Servicios", otro: "Otro",
};

function money(amount: string, currency: string) {
  return Number(amount).toLocaleString("es-ES", { style: "currency", currency });
}

export function GastosPanel({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [items, setItems] = useState(initialExpenses);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, category: "combustible", amount: "", supplier: "", description: "" });

  const total = items.reduce((s, e) => s + Number(e.amount), 0);

  function handleCreate() {
    if (!form.amount || !/^\d+(\.\d{1,2})?$/.test(form.amount)) return;
    startTransition(async () => {
      await createExpense(form);
      // Optimista: recargamos vía router no disponible aquí; insertamos local provisional.
      setItems((prev) => [
        { id: `tmp-${Date.now()}`, date: form.date, category: form.category, description: form.description || null, amount: form.amount, currency: "EUR", supplier: form.supplier || null, status: "registrado" },
        ...prev,
      ]);
      setOpen(false);
      setForm({ date: today, category: "combustible", amount: "", supplier: "", description: "" });
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteExpense(id);
      setItems((prev) => prev.filter((e) => e.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total registrado</p>
          <p className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-foreground">
            {money(String(total), "EUR")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{items.length} gasto{items.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Añadir gasto
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Sin gastos registrados.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-left">
                  {["Fecha", "Categoría", "Concepto", "Proveedor", "Importe", ""].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {items.map((e) => (
                  <tr key={e.id} className="hover:bg-surface-2/30">
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("es-ES")}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex w-fit rounded-md bg-secondary/20 px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
                        {CAT_LABEL[e.category] ?? e.category}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-foreground">{e.description ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{e.supplier ?? "—"}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-medium text-foreground">{money(e.amount, e.currency)}</td>
                    <td className="px-2 py-2.5 text-right">
                      <button onClick={() => handleDelete(e.id)} disabled={isPending} className="rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-40" aria-label="Eliminar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />
          <div className="relative z-10 flex h-full w-full flex-col overflow-hidden border-l border-border bg-card shadow-2xl sm:w-[420px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-medium tracking-tight">Nuevo gasto</h2>
              <button onClick={() => !isPending && setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Fecha</label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Importe (€)</label>
                  <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Categoría</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CAT_LABEL[c]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Proveedor <span className="font-normal text-muted-foreground">(opcional)</span></label>
                <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="ej. Repsol" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Concepto <span className="font-normal text-muted-foreground">(opcional)</span></label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción breve" />
              </div>
            </div>
            <div className="border-t border-border p-4">
              <Button className="w-full" onClick={handleCreate} disabled={isPending || !form.amount}>Guardar gasto</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
