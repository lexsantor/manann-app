"use client";

import { useState, useTransition } from "react";
import { FileSearch, Plus, X, ChevronDown, ChevronUp, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, ModeBadge } from "@/components/ui/badges";
import { createTender, closeTender, addSimulatedBids } from "@/lib/tier-v-actions";

type TenderBid = {
  id: string;
  agentName: string;
  price: string;
  currency: string;
  transitDays: number | null;
  notes: string | null;
  createdAt: Date;
};

type Tender = {
  id: string;
  title: string;
  origin: string;
  destination: string;
  mode: string;
  cargoDescription: string | null;
  status: string;
  responseDeadline: string | null;
  createdAt: Date;
  bids: TenderBid[];
};

export function TenderPanel({ initialItems }: { initialItems: Tender[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    title: "",
    origin: "",
    destination: "",
    mode: "FCL",
    cargoDescription: "",
    weight: "",
    volume: "",
    targetDate: "",
    responseDeadline: "",
  });

  function handleCreate() {
    if (!form.title || !form.origin || !form.destination) return;
    startTransition(async () => {
      await createTender({
        title: form.title,
        origin: form.origin,
        destination: form.destination,
        mode: form.mode,
        cargoDescription: form.cargoDescription || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        volume: form.volume ? Number(form.volume) : undefined,
        targetDate: form.targetDate || undefined,
        responseDeadline: form.responseDeadline || undefined,
      });
      setOpen(false);
      setForm({ title: "", origin: "", destination: "", mode: "FCL", cargoDescription: "", weight: "", volume: "", targetDate: "", responseDeadline: "" });
    });
  }

  function handleSimulateBids(id: string) {
    startTransition(async () => {
      await addSimulatedBids(id);
    });
  }

  function handleClose(id: string) {
    startTransition(async () => {
      await closeTender(id);
      setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status: "cerrado" } : t)));
    });
  }


  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} tender(s) activo(s)</p>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nuevo tender
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center mt-4">
          <FileSearch className="mb-2 h-8 w-8 text-muted-foreground/40" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">Sin tenders publicados</p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Envía un RFQ a la red de corresponsales
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
          {items.map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="flex items-start gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                    <StatusBadge status={t.status} />
                    <ModeBadge mode={t.mode} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.origin} → {t.destination}
                    {t.responseDeadline && ` · Límite: ${t.responseDeadline}`}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.bids.length} oferta(s) recibida(s)
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {t.status === "abierto" && t.bids.length === 0 && (
                    <button
                      className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40"
                      onClick={() => handleSimulateBids(t.id)}
                      disabled={isPending}
                      title="Simular respuestas de la red"
                    >
                      <Zap className="h-3 w-3" />
                      Simular
                    </button>
                  )}
                  {t.status === "abierto" && (
                    <button
                      className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                      onClick={() => handleClose(t.id)}
                      disabled={isPending}
                      title="Cerrar tender"
                    >
                      <Lock className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
                    onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                  >
                    {expanded === t.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bids comparator */}
              {expanded === t.id && t.bids.length > 0 && (
                <div className="border-t border-border">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Comparador de ofertas
                  </p>
                  <div className="divide-y divide-border/50">
                    {[...t.bids]
                      .sort((a, b) => Number(a.price) - Number(b.price))
                      .map((bid, i) => (
                        <div key={bid.id} className="flex items-center gap-3 px-3 py-2">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              i === 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{bid.agentName}</p>
                            {bid.notes && (
                              <p className="text-[10px] text-muted-foreground">{bid.notes}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-mono text-sm font-semibold text-foreground">
                              {Number(bid.price).toLocaleString("es-ES", {
                                style: "currency",
                                currency: bid.currency,
                              })}
                            </p>
                            {bid.transitDays && (
                              <p className="text-[10px] text-muted-foreground">{bid.transitDays}d tránsito</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  {t.status === "abierto" && (
                    <div className="px-3 py-2 bg-amber-500/5 border-t border-border/50">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">
                        Simulación — envío real de RFQ por email (Resend) y recepción de ofertas en producción
                      </p>
                    </div>
                  )}
                </div>
              )}

              {expanded === t.id && t.bids.length === 0 && (
                <div className="border-t border-border px-3 py-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Sin ofertas todavía. Usa &ldquo;Simular&rdquo; para generar respuestas de prueba.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New tender panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />
          <div className="relative z-10 flex h-full w-full flex-col overflow-hidden border-l border-border bg-card shadow-2xl sm:w-[500px]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-medium tracking-tight">Nuevo tender / RFQ</h2>
              <button
                onClick={() => !isPending && setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Título</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ej. FCL 40HC Shangai-Valencia agosto"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Origen</label>
                  <Input
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    placeholder="CNSHA"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Destino</label>
                  <Input
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    placeholder="ESVLC"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Modo</label>
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCL">FCL</SelectItem>
                    <SelectItem value="LCL">LCL</SelectItem>
                    <SelectItem value="AIR">Aéreo</SelectItem>
                    <SelectItem value="ROAD">Terrestre</SelectItem>
                    <SelectItem value="RAIL">Ferroviario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Descripción de carga <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <Input
                  value={form.cargoDescription}
                  onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })}
                  placeholder="Tipo de mercancía, HScode, condiciones especiales"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Peso kg</label>
                  <Input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Volumen m³</label>
                  <Input type="number" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Fecha de embarque</label>
                  <Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Límite respuesta</label>
                  <Input type="date" value={form.responseDeadline} onChange={(e) => setForm({ ...form, responseDeadline: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="border-t border-border p-4">
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={isPending || !form.title || !form.origin || !form.destination}
              >
                Publicar tender
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
