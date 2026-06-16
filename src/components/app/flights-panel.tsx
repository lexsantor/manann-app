"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, PlaneTakeoff } from "lucide-react";
import { createFlight, deleteFlight } from "@/lib/tier-s-actions";
import { MASTER_AIRPORTS } from "@/lib/master-airports";
import { DataTable, type Column } from "@/components/ui/data-table";

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  originIata: string;
  destIata: string;
  departureDate: string;
  arrivalDate: string;
  aircraftType: string | null;
  capacityKg: number | null;
  availableKg: number | null;
  active: boolean;
}

const AIRLINES = [
  "Iberia Cargo", "Air France Cargo", "Lufthansa Cargo", "Emirates SkyCargo",
  "Qatar Airways Cargo", "Turkish Cargo", "Cargolux", "Atlas Air", "FedEx",
  "DHL Aviation", "UPS Airlines", "Amazon Air",
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" });
}

export function FlightsPanel({ flights: initial }: { flights: Flight[] }) {
  const [flights, setFlights] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    flightNumber: "",
    airline: AIRLINES[0],
    originIata: "MAD",
    destIata: "JFK",
    departureDate: "",
    arrivalDate: "",
    aircraftType: "",
    capacityKg: "",
    availableKg: "",
  });

  function handleCreate() {
    if (!form.flightNumber || !form.departureDate || !form.arrivalDate) return;
    start(async () => {
      await createFlight({
        flightNumber: form.flightNumber,
        airline: form.airline,
        originIata: form.originIata,
        destIata: form.destIata,
        departureDate: form.departureDate,
        arrivalDate: form.arrivalDate,
        aircraftType: form.aircraftType || undefined,
        capacityKg: form.capacityKg ? Number(form.capacityKg) : undefined,
        availableKg: form.availableKg ? Number(form.availableKg) : undefined,
      });
      setFlights((prev) => [
        {
          id: crypto.randomUUID(),
          flightNumber: form.flightNumber,
          airline: form.airline,
          originIata: form.originIata,
          destIata: form.destIata,
          departureDate: form.departureDate,
          arrivalDate: form.arrivalDate,
          aircraftType: form.aircraftType || null,
          capacityKg: form.capacityKg ? Number(form.capacityKg) : null,
          availableKg: form.availableKg ? Number(form.availableKg) : null,
          active: true,
        },
        ...prev,
      ]);
      setForm({ ...form, flightNumber: "", departureDate: "", arrivalDate: "", aircraftType: "", capacityKg: "", availableKg: "" });
      setShowForm(false);
    });
  }

  function handleDelete(id: string) {
    start(async () => {
      await deleteFlight(id);
      setFlights((prev) => prev.filter((f) => f.id !== id));
    });
  }

  const columns: Column<Flight>[] = [
    {
      key: "flight",
      header: "Vuelo",
      cell: (f) => (
        <div className="flex items-center gap-2">
          <PlaneTakeoff className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
          <span className="font-mono text-xs font-bold text-foreground">{f.flightNumber}</span>
          {f.aircraftType && <span className="text-[10px] text-muted-foreground/60">{f.aircraftType}</span>}
        </div>
      ),
    },
    { key: "airline", header: "Aerolínea", cell: (f) => <span className="text-muted-foreground">{f.airline}</span> },
    {
      key: "route",
      header: "Ruta",
      cell: (f) => (
        <span className="font-mono text-xs">
          <span className="font-medium text-foreground">{f.originIata}</span>
          <span className="mx-1 text-muted-foreground">→</span>
          <span className="font-medium text-foreground">{f.destIata}</span>
        </span>
      ),
    },
    { key: "dep", header: "Salida", cell: (f) => <span className="text-muted-foreground">{fmtDate(f.departureDate)}</span> },
    { key: "arr", header: "Llegada", cell: (f) => <span className="text-muted-foreground">{fmtDate(f.arrivalDate)}</span> },
    {
      key: "cap",
      header: "Capacidad",
      align: "right",
      cell: (f) =>
        f.availableKg !== null && f.capacityKg !== null ? (
          <span className="font-mono tabular-nums">
            <span className="text-foreground">{(f.availableKg / 1000).toFixed(0)}t</span>
            <span className="text-muted-foreground/60"> / {(f.capacityKg / 1000).toFixed(0)}t</span>
          </span>
        ) : f.capacityKg !== null ? (
          <span className="font-mono tabular-nums">{(f.capacityKg / 1000).toFixed(0)}t</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      cell: (f) => (
        <button
          onClick={() => handleDelete(f.id)}
          disabled={pending}
          className="text-muted-foreground/60 transition-colors hover:text-destructive disabled:opacity-50"
          aria-label={`Eliminar vuelo ${f.flightNumber}`}
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
        Nuevo vuelo
      </button>

      {showForm && (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground">Nuevo vuelo</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Número de vuelo</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="IB6251"
                value={form.flightNumber}
                onChange={(e) => setForm({ ...form, flightNumber: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs text-muted-foreground">Aerolínea</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.airline}
                onChange={(e) => setForm({ ...form, airline: e.target.value })}
              >
                {AIRLINES.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Origen (IATA)</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.originIata}
                onChange={(e) => setForm({ ...form, originIata: e.target.value })}
              >
                {MASTER_AIRPORTS.map((a) => (
                  <option key={a.iata} value={a.iata}>{a.iata} — {a.city}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Destino (IATA)</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.destIata}
                onChange={(e) => setForm({ ...form, destIata: e.target.value })}
              >
                {MASTER_AIRPORTS.map((a) => (
                  <option key={a.iata} value={a.iata}>{a.iata} — {a.city}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tipo aeronave</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="B747F"
                value={form.aircraftType}
                onChange={(e) => setForm({ ...form, aircraftType: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Salida</label>
              <input
                type="date"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.departureDate}
                onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Llegada</label>
              <input
                type="date"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.arrivalDate}
                onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Capacidad (kg)</label>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="100000"
                value={form.capacityKg}
                onChange={(e) => setForm({ ...form, capacityKg: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Disponible (kg)</label>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="80000"
                value={form.availableKg}
                onChange={(e) => setForm({ ...form, availableKg: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Cancelar</button>
            <button
              onClick={handleCreate}
              disabled={pending || !form.flightNumber || !form.departureDate || !form.arrivalDate}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <DataTable columns={columns} rows={flights} getRowKey={(f) => f.id} empty="Sin vuelos registrados" />
    </div>
  );
}
