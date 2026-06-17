"use client";

import { useState, useTransition } from "react";
import { Plus, Check, X } from "lucide-react";
import { upsertDocumentSeries } from "@/lib/maestros-actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DOC_TYPES = [
  { value: "expediente", label: "Expediente" },
  { value: "factura", label: "Factura" },
  { value: "cotizacion", label: "Cotización" },
  { value: "cmr", label: "CMR" },
  { value: "awb", label: "AWB" },
  { value: "bl", label: "Bill of Lading" },
];

interface Series {
  id: string;
  docType: string;
  prefix: string;
  nextNumber: number;
  padding: number;
  active: boolean;
}

function previewNumber(prefix: string, next: number, padding: number): string {
  return `${prefix}${String(next).padStart(padding, "0")}`;
}

export function DocumentSeriesPanel({ series: initial }: { series: Series[] }) {
  const [series, setSeries] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ docType: "expediente", prefix: "", nextNumber: 1, padding: 5 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ prefix: "", nextNumber: 1, padding: 5 });

  const existingTypes = new Set(series.map((s) => s.docType));
  const availableTypes = DOC_TYPES.filter((t) => !existingTypes.has(t.value));

  function handleCreate() {
    if (!form.prefix) return;
    start(async () => {
      await upsertDocumentSeries(form);
      setSeries((prev) => {
        const existing = prev.findIndex((s) => s.docType === form.docType);
        if (existing >= 0) {
          return prev.map((s, i) => i === existing ? { ...s, ...form } : s);
        }
        return [...prev, { id: crypto.randomUUID(), ...form, active: true }];
      });
      setForm({ docType: availableTypes[1]?.value ?? "expediente", prefix: "", nextNumber: 1, padding: 5 });
      setShowForm(false);
    });
  }

  function startEdit(s: Series) {
    setEditingId(s.id);
    setEditData({ prefix: s.prefix, nextNumber: s.nextNumber, padding: s.padding });
  }

  function saveEdit(s: Series) {
    start(async () => {
      await upsertDocumentSeries({ docType: s.docType, ...editData });
      setSeries((prev) => prev.map((x) => x.id === s.id ? { ...x, ...editData } : x));
      setEditingId(null);
    });
  }

  return (
    <div className="space-y-4">
      {availableTypes.length > 0 && (
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Nueva serie
        </button>
      )}

      {showForm && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Nueva serie</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tipo de documento</label>
              <Select
                value={form.docType}
                onValueChange={(v) => setForm({ ...form, docType: v })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Prefijo</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="EXP-"
                value={form.prefix}
                onChange={(e) => setForm({ ...form, prefix: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Siguiente número</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.nextNumber}
                onChange={(e) => setForm({ ...form, nextNumber: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Dígitos (relleno)</label>
              <input
                type="number"
                min={1}
                max={10}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.padding}
                onChange={(e) => setForm({ ...form, padding: Number(e.target.value) })}
              />
            </div>
          </div>
          {form.prefix && (
            <p className="text-xs text-muted-foreground">
              Ejemplo: <span className="font-mono text-foreground">{previewNumber(form.prefix, form.nextNumber, form.padding)}</span>
            </p>
          )}
          <div className="flex gap-2 sm:justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={pending || !form.prefix} className="w-full sm:w-auto">Guardar</Button>
          </div>
        </div>
      )}

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Tipo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Prefijo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Siguiente</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ejemplo</th>
              <th className="px-3 py-2 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {series.map((s) => {
              const typeLabel = DOC_TYPES.find((t) => t.value === s.docType)?.label ?? s.docType;
              const isEditing = editingId === s.id;
              return (
                <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 text-foreground font-medium">{typeLabel}</td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        className="w-28 rounded border border-primary px-2 py-0.5 text-xs font-mono uppercase bg-background focus:outline-none"
                        value={editData.prefix}
                        onChange={(e) => setEditData({ ...editData, prefix: e.target.value })}
                      />
                    ) : (
                      <span className="font-mono text-xs text-primary">{s.prefix}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-20 rounded border border-primary px-2 py-0.5 text-xs font-mono bg-background focus:outline-none"
                        value={editData.nextNumber}
                        onChange={(e) => setEditData({ ...editData, nextNumber: Number(e.target.value) })}
                      />
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">{s.nextNumber}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {previewNumber(isEditing ? editData.prefix : s.prefix, isEditing ? editData.nextNumber : s.nextNumber, s.padding)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => saveEdit(s)} className="text-primary hover:text-primary/70"><Check className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" strokeWidth={2} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(s)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {series.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">Sin series configuradas</div>
        )}
      </div>
    </div>
  );
}
