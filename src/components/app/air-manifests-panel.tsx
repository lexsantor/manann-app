"use client";

import { useState, useTransition } from "react";
import { Plus, ChevronDown, Trash2, Check, X } from "lucide-react";
import {
  createAirManifest,
  updateManifestStatus,
  addManifestEntry,
  deleteManifestEntry,
} from "@/lib/tier-s-actions";
import { MASTER_AIRPORTS } from "@/lib/master-airports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmButton } from "@/components/ui/confirm-button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ManifestEntry {
  id: string;
  hawbNumber: string;
  consignee: string | null;
  pieces: number;
  weightKg: string;
  description: string | null;
}

interface AirManifest {
  id: string;
  mawbNumber: string;
  originIata: string;
  destIata: string;
  carrier: string;
  totalPieces: number;
  totalWeightKg: string;
  status: string;
  createdAt: Date;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-info/10 text-info",
  closed: "bg-muted text-muted-foreground",
  departed: "bg-success/10 text-success",
  arrived: "bg-primary/10 text-primary",
};

const STATUS_OPTIONS = [
  { value: "open", label: "Abierto" },
  { value: "closed", label: "Cerrado" },
  { value: "departed", label: "Despachado" },
  { value: "arrived", label: "Recibido" },
];

export function AirManifestsPanel({
  manifests: initial,
  entriesByManifest: initialEntries,
}: {
  manifests: AirManifest[];
  entriesByManifest: Record<string, ManifestEntry[]>;
}) {
  const [manifests, setManifests] = useState(initial);
  const [entries, setEntries] = useState(initialEntries);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pending, start] = useTransition();
  const [form, setForm] = useState({
    mawbNumber: "",
    originIata: "MAD",
    destIata: "JFK",
    carrier: "",
  });
  const [hawbForm, setHawbForm] = useState({
    hawbNumber: "",
    consignee: "",
    pieces: "1",
    weightKg: "",
    description: "",
  });

  function handleCreate() {
    if (!form.mawbNumber || !form.carrier) return;
    start(async () => {
      const id = await createAirManifest(form);
      setManifests((prev) => [
        {
          id,
          mawbNumber: form.mawbNumber,
          originIata: form.originIata,
          destIata: form.destIata,
          carrier: form.carrier,
          totalPieces: 0,
          totalWeightKg: "0",
          status: "open",
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setEntries((prev) => ({ ...prev, [id]: [] }));
      setForm({ mawbNumber: "", originIata: "MAD", destIata: "JFK", carrier: "" });
      setShowForm(false);
    });
  }

  function handleStatusChange(id: string, status: string) {
    start(async () => {
      await updateManifestStatus(id, status);
      setManifests((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
    });
  }

  function handleAddEntry(manifestId: string) {
    if (!hawbForm.hawbNumber || !hawbForm.weightKg) return;
    start(async () => {
      await addManifestEntry({
        manifestId,
        hawbNumber: hawbForm.hawbNumber,
        consignee: hawbForm.consignee || undefined,
        pieces: Number(hawbForm.pieces),
        weightKg: hawbForm.weightKg,
        description: hawbForm.description || undefined,
      });
      const newEntry: ManifestEntry = {
        id: crypto.randomUUID(),
        hawbNumber: hawbForm.hawbNumber,
        consignee: hawbForm.consignee || null,
        pieces: Number(hawbForm.pieces),
        weightKg: hawbForm.weightKg,
        description: hawbForm.description || null,
      };
      setEntries((prev) => ({ ...prev, [manifestId]: [...(prev[manifestId] ?? []), newEntry] }));
      const m = manifests.find((x) => x.id === manifestId);
      if (m) {
        setManifests((prev) => prev.map((x) => x.id === manifestId ? {
          ...x,
          totalPieces: x.totalPieces + Number(hawbForm.pieces),
          totalWeightKg: (Number(x.totalWeightKg) + Number(hawbForm.weightKg)).toFixed(2),
        } : x));
      }
      setHawbForm({ hawbNumber: "", consignee: "", pieces: "1", weightKg: "", description: "" });
    });
  }

  function handleDeleteEntry(entryId: string, manifestId: string) {
    const entry = entries[manifestId]?.find((e) => e.id === entryId);
    if (!entry) return;
    start(async () => {
      await deleteManifestEntry(entryId, manifestId);
      setEntries((prev) => ({ ...prev, [manifestId]: prev[manifestId]?.filter((e) => e.id !== entryId) ?? [] }));
      setManifests((prev) => prev.map((m) => m.id === manifestId ? {
        ...m,
        totalPieces: m.totalPieces - entry.pieces,
        totalWeightKg: (Number(m.totalWeightKg) - Number(entry.weightKg)).toFixed(2),
      } : m));
    });
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm((v) => !v)} className="w-full justify-center gap-1.5 sm:w-auto">
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        Nuevo manifiesto
      </Button>

      {showForm && (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">Nuevo manifiesto aéreo</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="mawb-number" className="text-xs text-muted-foreground">MAWB</label>
              <Input
                id="mawb-number"
                className="font-mono uppercase"
                placeholder="176-12345678"
                value={form.mawbNumber}
                onChange={(e) => setForm({ ...form, mawbNumber: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="carrier" className="text-xs text-muted-foreground">Carrier</label>
              <Input
                id="carrier"
                placeholder="Iberia Cargo"
                value={form.carrier}
                onChange={(e) => setForm({ ...form, carrier: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Origen</label>
              <Select
                value={form.originIata}
                onValueChange={(v) => setForm({ ...form, originIata: v })}
              >
                <SelectTrigger aria-label="Origen" className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MASTER_AIRPORTS.map((a) => <SelectItem key={a.iata} value={a.iata}>{a.iata} — {a.city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Destino</label>
              <Select
                value={form.destIata}
                onValueChange={(v) => setForm({ ...form, destIata: v })}
              >
                <SelectTrigger aria-label="Destino" className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MASTER_AIRPORTS.map((a) => <SelectItem key={a.iata} value={a.iata}>{a.iata} — {a.city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 sm:justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={pending || !form.mawbNumber || !form.carrier} className="w-full sm:w-auto">Crear</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {manifests.length === 0 && (
          <div className="rounded-md border border-border py-10 text-center text-sm text-muted-foreground">
            Sin manifiestos aéreos
          </div>
        )}
        {manifests.map((m) => {
          const isExpanded = expandedId === m.id;
          const statusColor = STATUS_COLORS[m.status] ?? "bg-muted text-muted-foreground";
          return (
            <div key={m.id} className="rounded-md border border-border bg-card overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpandedId(isExpanded ? null : m.id);
                  }
                }}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/20"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground/65 shrink-0 transition-transform", isExpanded && "rotate-180")} />
                <span className="font-mono text-sm font-bold text-foreground">{m.mawbNumber}</span>
                <span className="text-xs text-muted-foreground">{m.originIata} → {m.destIata}</span>
                <span className="text-xs text-muted-foreground">{m.carrier}</span>
                <span className="ml-auto text-xs text-muted-foreground font-mono">
                  {m.totalPieces} bultos · {Number(m.totalWeightKg).toFixed(2)} kg
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <Select value={m.status} onValueChange={(v) => handleStatusChange(m.id, v)}>
                    <SelectTrigger
                      aria-label="Estado del manifiesto"
                      className={cn(
                        "h-7 w-fit gap-1.5 rounded-full border-0 px-2.5 text-[10px] font-medium focus:ring-1 focus:ring-primary/30 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-70",
                        statusColor,
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </span>
              </div>

              {isExpanded && (
                <div className="border-t border-border px-4 py-3 space-y-3">
                  {/* HAWB entries — tarjetas en móvil, tabla en escritorio */}
                  <div className="space-y-2 sm:hidden">
                    {(entries[m.id] ?? []).map((e) => (
                      <div key={e.id} className="rounded-md border border-border bg-surface-2/40 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-sm font-medium text-foreground">{e.hawbNumber}</span>
                          <ConfirmButton
                            onConfirm={() => handleDeleteEntry(e.id, m.id)}
                            disabled={pending}
                            aria-label={`Eliminar HAWB ${e.hawbNumber}`}
                            title="Eliminar HAWB"
                            description={`Se eliminará la partida ${e.hawbNumber} del manifiesto. Esta acción no se puede deshacer.`}
                            className="text-muted-foreground/60 transition-colors hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </ConfirmButton>
                        </div>
                        <p className="mt-1 text-sm text-foreground">{e.consignee || "—"}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                          <span>{e.pieces} bultos</span>
                          <span>{Number(e.weightKg).toFixed(2)} kg</span>
                        </div>
                        {e.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <table className="hidden w-full text-xs sm:table">
                    <thead>
                      <tr className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <th className="pb-1.5 text-left font-medium">HAWB</th>
                        <th className="pb-1.5 text-left font-medium">Consignatario</th>
                        <th className="pb-1.5 text-right font-medium">Bultos</th>
                        <th className="pb-1.5 text-right font-medium">Peso (kg)</th>
                        <th className="pb-1.5 pl-3 text-left font-medium">Descripción</th>
                        <th className="w-6" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {(entries[m.id] ?? []).map((e) => (
                        <tr key={e.id}>
                          <td className="py-1.5 font-mono font-medium text-foreground">{e.hawbNumber}</td>
                          <td className="py-1.5 text-muted-foreground">{e.consignee || "—"}</td>
                          <td className="py-1.5 text-right font-mono text-muted-foreground">{e.pieces}</td>
                          <td className="py-1.5 text-right font-mono text-muted-foreground">{Number(e.weightKg).toFixed(2)}</td>
                          <td className="py-1.5 pl-3 text-muted-foreground">{e.description || "—"}</td>
                          <td className="py-1.5 text-right">
                            <ConfirmButton
                              onConfirm={() => handleDeleteEntry(e.id, m.id)}
                              disabled={pending}
                              aria-label={`Eliminar HAWB ${e.hawbNumber}`}
                              title="Eliminar HAWB"
                              description={`Se eliminará la partida ${e.hawbNumber} del manifiesto. Esta acción no se puede deshacer.`}
                              className="text-muted-foreground/60 transition-colors hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </ConfirmButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Add HAWB form */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 sm:grid-cols-5">
                    <Input
                      className="font-mono"
                      placeholder="HAWB"
                      value={hawbForm.hawbNumber}
                      onChange={(e) => setHawbForm({ ...hawbForm, hawbNumber: e.target.value })}
                    />
                    <Input
                      placeholder="Consignatario"
                      value={hawbForm.consignee}
                      onChange={(e) => setHawbForm({ ...hawbForm, consignee: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={1}
                      className="font-mono"
                      placeholder="Bultos"
                      value={hawbForm.pieces}
                      onChange={(e) => setHawbForm({ ...hawbForm, pieces: e.target.value })}
                    />
                    <Input
                      type="number"
                      className="font-mono"
                      placeholder="Peso kg"
                      value={hawbForm.weightKg}
                      onChange={(e) => setHawbForm({ ...hawbForm, weightKg: e.target.value })}
                    />
                    <button
                      onClick={() => handleAddEntry(m.id)}
                      disabled={pending || !hawbForm.hawbNumber || !hawbForm.weightKg}
                      className="col-span-2 flex h-10 items-center justify-center gap-1 rounded bg-primary/10 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-40 sm:col-auto sm:h-auto sm:text-xs"
                    >
                      <Check className="h-3.5 w-3.5" /> Añadir
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
