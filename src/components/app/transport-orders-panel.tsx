"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createTransportOrder, updateTransportOrderStatus, deleteTransportOrder } from "@/lib/tier-s-actions";
import { cn } from "@/lib/utils";

interface TransportOrder {
  id: string;
  reference: string;
  carrier: string;
  driverName: string | null;
  licensePlate: string | null;
  origin: string;
  destination: string;
  pickupDate: string | null;
  deliveryDate: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
}

const STATUS_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "recogida", label: "Recogida" },
  { value: "en_ruta", label: "En ruta" },
  { value: "entregado", label: "Entregado" },
  { value: "incidencia", label: "Incidencia" },
];

const STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-muted text-muted-foreground",
  recogida: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  en_ruta: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  entregado: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  incidencia: "bg-red-500/10 text-red-500",
};

export function TransportOrdersPanel({ orders: initial }: { orders: TransportOrder[] }) {
  const [orders, setOrders] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    reference: "",
    carrier: "",
    origin: "",
    destination: "",
    driverName: "",
    licensePlate: "",
    pickupDate: "",
    deliveryDate: "",
    notes: "",
  });

  function handleCreate() {
    if (!form.reference || !form.carrier || !form.origin || !form.destination) return;
    start(async () => {
      await createTransportOrder({
        reference: form.reference,
        carrier: form.carrier,
        origin: form.origin,
        destination: form.destination,
        driverName: form.driverName || undefined,
        licensePlate: form.licensePlate || undefined,
        pickupDate: form.pickupDate || undefined,
        deliveryDate: form.deliveryDate || undefined,
        notes: form.notes || undefined,
      });
      setOrders((prev) => [
        {
          id: crypto.randomUUID(),
          reference: form.reference,
          carrier: form.carrier,
          driverName: form.driverName || null,
          licensePlate: form.licensePlate || null,
          origin: form.origin,
          destination: form.destination,
          pickupDate: form.pickupDate || null,
          deliveryDate: form.deliveryDate || null,
          status: "pendiente",
          notes: form.notes || null,
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setForm({ reference: "", carrier: "", origin: "", destination: "", driverName: "", licensePlate: "", pickupDate: "", deliveryDate: "", notes: "" });
      setShowForm(false);
    });
  }

  function handleStatusChange(id: string, status: string) {
    start(async () => {
      await updateTransportOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      await deleteTransportOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Nueva orden
      </button>

      {showForm && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Nueva orden de transporte</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Referencia</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="OT-2024-001"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Transportista</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Nombre o empresa"
                value={form.carrier}
                onChange={(e) => setForm({ ...form, carrier: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Origen</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Madrid"
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Destino</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Barcelona"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Conductor</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Nombre"
                value={form.driverName}
                onChange={(e) => setForm({ ...form, driverName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Matrícula</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="1234 ABC"
                value={form.licensePlate}
                onChange={(e) => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Fecha recogida</label>
              <input
                type="date"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.pickupDate}
                onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Fecha entrega</label>
              <input
                type="date"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground">Notas</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Instrucciones especiales…"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
            <button
              onClick={handleCreate}
              disabled={pending || !form.reference || !form.carrier || !form.origin || !form.destination}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Referencia</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Transportista</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ruta</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Recogida</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Entrega</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</th>
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => {
              const statusColor = STATUS_COLORS[o.status] ?? "bg-muted text-muted-foreground";
              return (
                <tr key={o.id} className="group hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-xs font-bold text-foreground">{o.reference}</span>
                    {o.licensePlate && (
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5">{o.licensePlate}</div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {o.carrier}
                    {o.driverName && <div className="text-[10px] text-muted-foreground/60">{o.driverName}</div>}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {o.origin} → {o.destination}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {o.pickupDate ? new Date(o.pickupDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium border-0 focus:outline-none focus:ring-2 focus:ring-primary/30", statusColor)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => handleDelete(o.id)}
                      disabled={pending}
                      className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">Sin órdenes de transporte</div>
        )}
      </div>
    </div>
  );
}
