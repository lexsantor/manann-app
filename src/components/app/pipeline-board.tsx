"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, ChevronRight, ChevronLeft, Trash2,
  Ship, Plane, Truck, TrainFront, Shuffle, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/erp-format";
import type { OpportunityRow, RateItem } from "@/lib/erp";
import {
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  moveOpportunityStage,
} from "@/lib/erp-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Contact = { id: string; name: string; role: string };
type OppStage = "prospecto" | "propuesta" | "negociacion" | "ganado" | "perdido";

interface Props {
  opportunities: OpportunityRow[];
  stats: Record<string, { count: number; total: number }>;
  contacts: Contact[];
  rates: RateItem[];
}

// ─── Stages ───────────────────────────────────────────────────────────────────

const STAGES: { key: OppStage; label: string; accent: string }[] = [
  { key: "prospecto",   label: "Prospecto",   accent: "border-border" },
  { key: "propuesta",   label: "Propuesta",   accent: "border-info/40" },
  { key: "negociacion", label: "Negociación", accent: "border-warning/40" },
  { key: "ganado",      label: "Ganado",      accent: "border-success/40" },
  { key: "perdido",     label: "Perdido",     accent: "border-destructive/40" },
];

const STAGE_KEYS = STAGES.map((s) => s.key);

const MODE_ICONS: Record<string, React.ElementType> = {
  maritimo:    Ship,
  aereo:       Plane,
  terrestre:   Truck,
  ferroviario: TrainFront,
  multimodal:  Shuffle,
};

const MODE_LABELS: Record<string, string> = {
  maritimo: "Marítimo", aereo: "Aéreo", terrestre: "Terrestre",
  ferroviario: "Ferroviario", multimodal: "Multimodal",
};

// ─── Empty form ───────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "", stage: "prospecto" as OppStage, contactId: "",
  mode: "", pol: "", pod: "", cargoType: "",
  estimatedValue: "", currency: "EUR", notes: "",
};

// ─── Main component ───────────────────────────────────────────────────────────

export function PipelineBoard({ opportunities, stats, contacts, rates }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [panel, setPanel] = useState<"closed" | "new" | OpportunityRow>("closed");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOpen = panel !== "closed";
  const isEdit = panel !== "closed" && panel !== "new";
  const editOpp = isEdit ? (panel as OpportunityRow) : null;

  // Rate benchmark — avg of active flete rates
  const fleteRates = rates.filter((r) => r.active && r.serviceType === "flete");
  const avgFlete = fleteRates.length > 0
    ? fleteRates.reduce((s, r) => s + Number(r.basePrice), 0) / fleteRates.length
    : null;
  const benchmarkDelta = avgFlete && form.estimatedValue
    ? ((Number(form.estimatedValue) - avgFlete) / avgFlete) * 100
    : null;

  function openCreate() {
    setForm({ ...EMPTY_FORM });
    setConfirmDelete(false);
    setPanel("new");
  }

  function openEdit(opp: OpportunityRow) {
    setForm({
      title: opp.title,
      stage: opp.stage as OppStage,
      contactId: opp.contactId ?? "",
      mode: opp.mode ?? "",
      pol: opp.pol ?? "",
      pod: opp.pod ?? "",
      cargoType: opp.cargoType ?? "",
      estimatedValue: opp.estimatedValue ?? "",
      currency: opp.currency,
      notes: opp.notes ?? "",
    });
    setConfirmDelete(false);
    setPanel(opp);
  }

  function closePanel() {
    setPanel("closed");
    setConfirmDelete(false);
  }

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSave() {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.set(k, v));
    startTransition(async () => {
      if (isEdit && editOpp) {
        await updateOpportunity(editOpp.id, fd);
      } else {
        await createOpportunity(fd);
      }
      closePanel();
      router.refresh();
    });
  }

  function handleDelete() {
    if (!editOpp) return;
    startTransition(async () => {
      await deleteOpportunity(editOpp.id);
      closePanel();
      router.refresh();
    });
  }

  function handleMove(opp: OpportunityRow, dir: -1 | 1) {
    const idx = STAGE_KEYS.indexOf(opp.stage as OppStage);
    const next = STAGE_KEYS[idx + dir];
    if (!next) return;
    startTransition(async () => {
      await moveOpportunityStage(opp.id, next);
      router.refresh();
    });
  }

  const byStage = (stage: OppStage) =>
    opportunities.filter((o) => o.stage === stage);

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <Button size="sm" onClick={openCreate} className="w-full gap-1.5 sm:w-auto">
          <Plus className="size-3.5" /> Nueva oportunidad
        </Button>
        {fleteRates.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Tarifa flete media: {formatMoney(String(avgFlete!.toFixed(2)), "EUR")}
          </span>
        )}
      </div>

      {/* Kanban */}
      <div className="grid grid-flow-col auto-cols-[280px] items-start gap-3 overflow-x-auto pb-2 xl:grid-flow-row xl:auto-cols-auto xl:grid-cols-5">
        {STAGES.map(({ key, label, accent }) => {
          const cards = byStage(key);
          const st = stats[key];
          return (
            <div key={key} className="flex flex-col gap-2">
              {/* Column header */}
              <div className={cn("rounded-md border-l-2 pl-2 py-1 mb-1", accent)}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-xs font-medium bg-muted rounded-full px-1.5 py-0.5">
                    {st?.count ?? 0}
                  </span>
                </div>
                {st && st.total > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatMoney(String(st.total.toFixed(2)), "EUR")}
                  </div>
                )}
              </div>

              {/* Cards */}
              {cards.map((opp) => {
                const ModeIcon = opp.mode ? MODE_ICONS[opp.mode] : null;
                const val = opp.estimatedValue ? Number(opp.estimatedValue) : null;
                const isHigh = avgFlete && val ? val > avgFlete * 1.2 : false;

                return (
                  <div
                    key={opp.id}
                    onClick={() => openEdit(opp)}
                    className="group rounded-md border bg-card p-3 space-y-1.5 cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="text-sm font-medium leading-snug truncate">{opp.title}</div>
                    {opp.contactName && (
                      <div className="text-xs text-muted-foreground truncate">{opp.contactName}</div>
                    )}
                    {opp.mode && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {ModeIcon && <ModeIcon className="size-3 shrink-0" />}
                        {opp.pol && opp.pod
                          ? <span className="truncate">{opp.pol} → {opp.pod}</span>
                          : <span>{MODE_LABELS[opp.mode]}</span>
                        }
                      </div>
                    )}
                    {val !== null && (
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold">{formatMoney(String(val.toFixed(2)), opp.currency)}</span>
                        {isHigh && (
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-warning">
                            <AlertTriangle className="size-2.5" /> alto
                          </span>
                        )}
                      </div>
                    )}
                    {/* Stage move */}
                    <div className="flex gap-1 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {STAGE_KEYS.indexOf(opp.stage as OppStage) > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMove(opp, -1); }}
                          className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          <ChevronLeft className="size-3" />
                          {STAGES[STAGE_KEYS.indexOf(opp.stage as OppStage) - 1]?.label}
                        </button>
                      )}
                      <span className="flex-1" />
                      {STAGE_KEYS.indexOf(opp.stage as OppStage) < STAGE_KEYS.length - 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMove(opp, 1); }}
                          className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          {STAGES[STAGE_KEYS.indexOf(opp.stage as OppStage) + 1]?.label}
                          <ChevronRight className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {cards.length === 0 && (
                <div className="rounded-md border border-dashed border-border/50 p-3 text-center">
                  <span className="text-xs text-muted-foreground">Sin oportunidades</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Side panel backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={closePanel}
        />
      )}

      {/* Side panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background border-l shadow-2xl flex flex-col transition-transform duration-200",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-sm">
            {isEdit ? "Editar oportunidad" : "Nueva oportunidad"}
          </h2>
          <button onClick={closePanel} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Título */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Título *</label>
            <Input value={form.title} onChange={field("title")} placeholder="Nombre de la oportunidad" />
          </div>

          {/* Etapa */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Etapa</label>
            <Select value={form.stage} onValueChange={(v) => setForm((f) => ({ ...f, stage: v as OppStage }))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (<SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Contacto */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Contacto</label>
            <Select value={form.contactId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, contactId: v === "__none__" ? "" : v }))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Sin contacto —</SelectItem>
                {contacts.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Modo */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Modo de transporte</label>
            <Select value={form.mode || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, mode: v === "__none__" ? "" : v }))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Sin especificar —</SelectItem>
                {Object.entries(MODE_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          {/* Ruta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">POL</label>
              <Input value={form.pol} onChange={field("pol")} placeholder="ESBCN" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">POD</label>
              <Input value={form.pod} onChange={field("pod")} placeholder="NLRTM" />
            </div>
          </div>

          {/* Tipo de carga */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Tipo de carga</label>
            <Input value={form.cargoType} onChange={field("cargoType")} placeholder="FCL 20', electrónica…" />
          </div>

          {/* Valor */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium">Valor estimado</label>
              <Input
                type="number"
                value={form.estimatedValue}
                onChange={field("estimatedValue")}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Moneda</label>
              <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Benchmark */}
          {fleteRates.length > 0 && form.estimatedValue && (
            <div className="rounded-md border p-3 space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tarifas de referencia (flete)
              </div>
              {fleteRates.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{r.concept} · {r.unit}</span>
                  <span className="font-medium">{formatMoney(r.basePrice, r.currency)}</span>
                </div>
              ))}
              {benchmarkDelta !== null && (
                <div
                  className={cn(
                    "text-xs font-medium pt-1 border-t",
                    benchmarkDelta > 20 ? "text-warning" : "text-success",
                  )}
                >
                  {benchmarkDelta > 0
                    ? `⚠ ${benchmarkDelta.toFixed(0)}% por encima del flete medio`
                    : `✓ ${Math.abs(benchmarkDelta).toFixed(0)}% por debajo del flete medio`}
                </div>
              )}
            </div>
          )}

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Notas</label>
            <Textarea
              value={form.notes}
              onChange={field("notes")}
              rows={3}
              placeholder="Contexto, próximos pasos…"
              className="resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t px-5 py-4 space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || isPending}
              className="flex-1"
              size="sm"
            >
              {isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear oportunidad"}
            </Button>
            <Button variant="secondary" size="sm" onClick={closePanel}>
              Cancelar
            </Button>
          </div>
          {isEdit && (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground flex-1">¿Confirmar eliminación?</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-destructive border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="size-3.5 mr-1" /> Eliminar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>No</Button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="size-3" /> Eliminar oportunidad
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
