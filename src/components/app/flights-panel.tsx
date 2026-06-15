"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, PlaneTakeoff } from "lucide-react";
import { createFlight, deleteFlight } from "@/lib/tier-s-actions";
import { MASTER_AIRPORTS } from "@/lib/master-airports";
import { cn } from "@/lib/utils";

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

  const airportLabel = (iata: string) => {
    const a = MASTER_AIRPORTS.find((x) => x.iata === iata);
    return a ? `${iata} — ${a.city}` : iata;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Nuevo vuelo
      </button>

      {showForm && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Nuevo vuelo</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Número de vuelo</label>
              <input
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="100000"
                value={form.capacityKg}
                onChange={(e) => setForm({ ...form, capacityKg: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Disponible (kg)</label>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
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

      <div className="rounded-md border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Vuelo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Aerolínea</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Ruta</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Salida</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Llegada</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Capacidad</th>
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {flights.map((f) => (
              <tr key={f.id} className="group hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <PlaneTakeoff className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={1.5} />
                    <span className="font-mono text-xs font-bold text-foreground">{f.flightNumber}</span>
                    {f.aircraftType && (
                      <span className="text-[10px] text-muted-foreground/50">{f.aircraftType}</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{f.airline}</td>
                <td className="px-3 py-2.5">
                  <span className="font-mono text-xs font-medium text-foreground">{f.originIata}</span>
                  <span className="text-xs text-muted-foreground mx-1">→</span>
                  <span className="font-mono text-xs font-medium text-foreground">{f.destIata}</span>
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                  {new Date(f.departureDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" })}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                  {new Date(f.arrivalDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" })}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                  {f.availableKg !== null && f.capacityKg !== null ? (
                    <span>
                      <span className="text-foreground font-mono">{(f.availableKg / 1000).toFixed(0)}t</span>
                      <span className="text-muted-foreground/50"> / {(f.capacityKg / 1000).toFixed(0)}t</span>
                    </span>
                  ) : f.capacityKg !== null ? (
                    <span className="font-mono">{(f.capacityKg / 1000).toFixed(0)}t</span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={pending}
                    className="text-muted-foreground hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {flights.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">Sin vuelos registrados</div>
        )}
      </div>
    </div>
  );
}
