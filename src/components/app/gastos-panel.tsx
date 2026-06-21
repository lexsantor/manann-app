"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiCard } from "@/components/ui/kpi-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { createExpense, deleteExpense } from "@/lib/expense-actions";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

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

function money(amount: string, currency = "EUR") {
  return Number(amount).toLocaleString("es-ES", { style: "currency", currency });
}

export function GastosPanel({ initialExpenses }: { initialExpenses: Expense[] }) {
  const [items, setItems] = useState(initialExpenses);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, open, () => setOpen(false));
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

  const columns: Column<Expense>[] = [
    {
      key: "date",
      header: "Fecha",
      cell: (e) => <span className="font-mono text-muted-foreground">{new Date(e.date).toLocaleDateString("es-ES")}</span>,
    },
    {
      key: "category",
      header: "Categoría",
      cell: (e) => (
        <span className="inline-flex w-fit whitespace-nowrap rounded-md bg-secondary/20 px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
          {CAT_LABEL[e.category] ?? e.category}
        </span>
      ),
    },
    {
      key: "description",
      header: "Concepto",
      cell: (e) => <span className="text-foreground">{e.description ?? "—"}</span>,
    },
    {
      key: "supplier",
      header: "Proveedor",
      cell: (e) => <span className="text-muted-foreground">{e.supplier ?? "—"}</span>,
    },
    {
      key: "amount",
      header: "Importe",
      align: "right",
      cell: (e) => <span className="font-mono font-medium tabular-nums text-foreground">{money(e.amount, e.currency)}</span>,
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (e) => (
        <ConfirmButton
          onConfirm={() => handleDelete(e.id)}
          disabled={isPending}
          aria-label="Eliminar gasto"
          title="Eliminar gasto"
          description="Se eliminará este gasto. Esta acción no se puede deshacer."
          className="rounded p-1 text-muted-foreground/60 transition-colors hover:text-destructive disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ConfirmButton>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <KpiCard
          label="Total registrado"
          value={money(String(total))}
          sub={`${items.length} ${items.length === 1 ? "gasto" : "gastos"}`}
          className="min-w-[200px]"
        />
        <Button size="sm" onClick={() => setOpen(true)} className="w-full gap-1.5 sm:w-auto">
          <Plus className="h-4 w-4" /> Añadir gasto
        </Button>
      </div>

      <DataTable columns={columns} rows={items} getRowKey={(e) => e.id} empty="Sin gastos registrados." />

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Gastos del expediente"
            tabIndex={-1}
            className="relative z-10 flex h-full w-full flex-col overflow-hidden border-l border-border bg-card shadow-2xl outline-none sm:w-[420px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-medium tracking-tight">Nuevo gasto</h2>
              <button onClick={() => !isPending && setOpen(false)} aria-label="Cerrar" className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded-md p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gastos-fecha">Fecha</Label>
                  <DatePicker id="gastos-fecha" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gastos-importe">Importe (€)</Label>
                  <Input id="gastos-importe" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger aria-label="Categoría"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CAT_LABEL[c]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gastos-proveedor">Proveedor <span className="font-normal text-muted-foreground">(opcional)</span></Label>
                <Input id="gastos-proveedor" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="ej. Repsol" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gastos-concepto">Concepto <span className="font-normal text-muted-foreground">(opcional)</span></Label>
                <Input id="gastos-concepto" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción breve" />
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
