"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createTransportOrder, updateTransportOrderStatus, deleteTransportOrder } from "@/lib/tier-s-actions";
import { DataTable, CellStacked, type Column } from "@/components/ui/data-table";
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

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

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

  const columns: Column<TransportOrder>[] = [
    {
      key: "reference",
      header: "Referencia",
      cell: (o) => <CellStacked mono primary={o.reference} secondary={o.licensePlate ?? undefined} />,
    },
    {
      key: "carrier",
      header: "Transportista",
      cell: (o) => (
        <CellStacked primary={<span className="text-muted-foreground">{o.carrier}</span>} secondary={o.driverName ?? undefined} />
      ),
    },
    {
      key: "route",
      header: "Ruta",
      cell: (o) => <span className="text-muted-foreground">{o.origin} → {o.destination}</span>,
    },
    {
      key: "pickup",
      header: "Recogida",
      cell: (o) => <span className="text-muted-foreground">{o.pickupDate ? fmtDate(o.pickupDate) : "—"}</span>,
    },
    {
      key: "delivery",
      header: "Entrega",
      cell: (o) => <span className="text-muted-foreground">{o.deliveryDate ? fmtDate(o.deliveryDate) : "—"}</span>,
    },
    {
      key: "status",
      header: "Estado",
      cell: (o) => (
        <select
          value={o.status}
          onChange={(e) => handleStatusChange(o.id, e.target.value)}
          className={cn(
            "rounded-full border-0 px-2 py-0.5 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/30",
            STATUS_COLORS[o.status] ?? "bg-muted text-muted-foreground",
          )}
        >
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (o) => (
        <button
          onClick={() => handleDelete(o.id)}
          disabled={pending}
          className="text-muted-foreground/60 transition-colors hover:text-destructive disabled:opacity-50"
          aria-label={`Eliminar orden ${o.reference}`}
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
        Nueva orden
      </button>

      {showForm && (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground">Nueva orden de transporte</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Referencia</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
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

      <DataTable columns={columns} rows={orders} getRowKey={(o) => o.id} empty="Sin órdenes de transporte" />
    </div>
  );
}
