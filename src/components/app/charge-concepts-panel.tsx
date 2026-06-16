"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { createChargeConcept, deleteChargeConcept } from "@/lib/maestros-actions";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const CATEGORIES = ["flete", "origen", "destino", "aduana", "almacenaje", "seguro", "documentacion", "otro"];
const DIRECTIONS = [
  { value: "buy", label: "Coste" },
  { value: "sell", label: "Ingreso" },
  { value: "both", label: "Ambos" },
];

const CAT_LABEL: Record<string, string> = {
  flete: "Flete",
  origen: "Origen",
  destino: "Destino",
  aduana: "Aduana",
  almacenaje: "Almacenaje",
  seguro: "Seguro",
  documentacion: "Documentación",
  otro: "Otro",
};

interface Concept {
  id: string;
  code: string;
  name: string;
  category: string;
  defaultDirection: string;
  active: boolean;
}

export function ChargeConceptsPanel({ concepts: initial }: { concepts: Concept[] }) {
  const [concepts, setConcepts] = useState(initial);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ code: "", name: "", category: "flete", defaultDirection: "both" });

  const filtered = q.trim()
    ? concepts.filter(
        (c) =>
          c.code.toLowerCase().includes(q.toLowerCase()) ||
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.category.toLowerCase().includes(q.toLowerCase()),
      )
    : concepts;

  function handleCreate() {
    if (!form.code || !form.name) return;
    start(async () => {
      await createChargeConcept(form);
      setConcepts((prev) => [
        ...prev,
        { id: crypto.randomUUID(), ...form, active: true },
      ]);
      setForm({ code: "", name: "", category: "flete", defaultDirection: "both" });
      setShowForm(false);
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      await deleteChargeConcept(id);
      setConcepts((prev) => prev.filter((c) => c.id !== id));
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Buscar concepto..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Nuevo
        </button>
      </div>

      {showForm && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Nuevo concepto</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Código</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="BL"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Nombre</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Bill of Lading"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Categoría</label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{CAT_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Dirección por defecto</label>
              <Select
                value={form.defaultDirection}
                onValueChange={(v) => setForm({ ...form, defaultDirection: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={pending || !form.code || !form.name}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Código</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoría</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Dirección</th>
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c) => (
              <tr key={c.id} className="group hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2 font-mono text-xs font-bold text-primary">{c.code}</td>
                <td className="px-3 py-2 text-foreground">{c.name}</td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
                    {CAT_LABEL[c.category] ?? c.category}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {DIRECTIONS.find((d) => d.value === c.defaultDirection)?.label ?? c.defaultDirection}
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={pending}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {concepts.length === 0 ? "Sin conceptos aún. Crea el primero." : "Sin resultados"}
          </div>
        )}
      </div>
    </div>
  );
}
