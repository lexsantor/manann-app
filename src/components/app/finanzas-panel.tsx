"use client";

import { useState, useTransition } from "react";
import { TrendingUp, TrendingDown, Plus, Trash2, Loader2, Receipt } from "lucide-react";
import { Icon } from "@/components/icon";
import { formatMoney } from "@/lib/erp-format";
import { addCharge, deleteCharge } from "@/lib/erp-actions";
import { GenerarFacturaButton } from "@/components/app/generar-factura-button";
import { cn } from "@/lib/utils";
import type { ShipmentDetail } from "@/lib/erp";

type Charge = ShipmentDetail["charges"][number];

const CHARGE_TYPE_LABELS: Record<string, string> = {
  flete: "Flete",
  aduana: "Aduana",
  manipulacion: "Manipulación",
  seguro: "Seguro",
  documentacion: "Documentación",
  almacenaje: "Almacenaje",
  otro: "Otro",
};

const CHARGE_TYPES = Object.entries(CHARGE_TYPE_LABELS) as [string, string][];

interface AddLineFormProps {
  shipmentId: string;
  direction: "cost" | "revenue";
  onDone: () => void;
}

function AddLineForm({ shipmentId, direction, onDone }: AddLineFormProps) {
  const [pending, startTransition] = useTransition();
  const [type, setType] = useState("flete");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Introduce un importe válido");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await addCharge(shipmentId, {
          type: type as never,
          direction,
          description: description.trim() || undefined,
          amount: Number(amount).toFixed(2),
          currency: "EUR",
        });
        onDone();
      } catch {
        setError("No se ha podido guardar. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 rounded-md border border-border/60 bg-surface-2/40 p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="col-span-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:col-span-1"
        >
          {CHARGE_TYPES.map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary sm:col-span-2"
        />
        <input
          type="number"
          placeholder="0,00"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-right font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 disabled:opacity-50"
        >
          {pending && <Loader2 className="size-3 animate-spin" />}
          Guardar
        </button>
      </div>
    </form>
  );
}

interface LineRowProps {
  charge: Charge;
  shipmentId: string;
}

function LineRow({ charge: c, shipmentId }: LineRowProps) {
  const [pending, startTransition] = useTransition();
  const typeLabel = CHARGE_TYPE_LABELS[c.type] ?? c.type;

  function handleDelete() {
    startTransition(async () => {
      await deleteCharge(c.id, shipmentId);
    });
  }

  return (
    <div className={cn(
      "group flex items-center justify-between gap-3 py-2 first:pt-0 transition-opacity",
      pending && "opacity-40",
    )}>
      <div className="min-w-0">
        <p className="text-sm text-foreground">{c.description || typeLabel}</p>
        {c.description && (
          <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{typeLabel}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-sm text-foreground">{formatMoney(c.amount, c.currency)}</span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="invisible size-6 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:text-destructive group-hover:visible"
          aria-label="Eliminar línea"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
        </button>
      </div>
    </div>
  );
}

interface FinanzasPanelProps {
  shipmentId: string;
  charges: Charge[];
  clientName?: string;
}

export function FinanzasPanel({ shipmentId, charges, clientName = "" }: FinanzasPanelProps) {
  const [addingCost, setAddingCost] = useState(false);
  const [addingRevenue, setAddingRevenue] = useState(false);

  const costs = charges.filter((c) => c.direction === "cost");
  const revenues = charges.filter((c) => c.direction === "revenue");

  const totalCosts = costs.reduce((s, c) => s + Number(c.amount), 0);
  const totalRevenues = revenues.reduce((s, c) => s + Number(c.amount), 0);
  const margin = totalRevenues - totalCosts;
  const marginPct = totalRevenues > 0 ? (margin / totalRevenues) * 100 : null;

  const currency = charges[0]?.currency ?? "EUR";
  const hasMixed = new Set(charges.map((c) => c.currency)).size > 1;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon icon={Receipt} size={16} className="text-muted-foreground" />
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">Finanzas</h2>
        </div>
        {revenues.length > 0 && (
          <GenerarFacturaButton
            shipmentId={shipmentId}
            clientName={clientName}
            defaultLines={revenues.map((c) => ({
              concept: c.description || CHARGE_TYPE_LABELS[c.type] || c.type,
              unitPrice: c.amount,
            }))}
          />
        )}
      </div>

      {/* Margin KPIs */}
      {(totalCosts > 0 || totalRevenues > 0) && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border/50 bg-surface-2/30 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Costes</p>
            <p className="mt-1 font-mono text-base font-semibold text-foreground">
              {hasMixed ? "—" : formatMoney(String(totalCosts), currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-surface-2/30 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ingresos</p>
            <p className="mt-1 font-mono text-base font-semibold text-foreground">
              {hasMixed ? "—" : formatMoney(String(totalRevenues), currency)}
            </p>
          </div>
          <div className={cn(
            "rounded-lg border p-3",
            margin >= 0
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-destructive/20 bg-destructive/5",
          )}>
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Margen</p>
              {margin >= 0
                ? <TrendingUp className="size-3.5 text-emerald-500" />
                : <TrendingDown className="size-3.5 text-destructive" />}
            </div>
            <p className={cn(
              "mt-1 font-mono text-base font-semibold",
              margin >= 0 ? "text-emerald-500" : "text-destructive",
            )}>
              {hasMixed ? "—" : formatMoney(String(margin), currency)}
            </p>
            {marginPct !== null && !hasMixed && (
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {marginPct.toFixed(1)}%
              </p>
            )}
          </div>
        </div>
      )}

      {/* Cost lines */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Costes</p>
          <button
            onClick={() => { setAddingCost(true); setAddingRevenue(false); }}
            className="flex items-center gap-1 rounded text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3" /> Añadir
          </button>
        </div>
        {costs.length > 0 && (
          <div className="divide-y divide-border/50">
            {costs.map((c) => <LineRow key={c.id} charge={c} shipmentId={shipmentId} />)}
          </div>
        )}
        {costs.length === 0 && !addingCost && (
          <p className="text-xs text-muted-foreground">Sin líneas de coste.</p>
        )}
        {addingCost && (
          <AddLineForm shipmentId={shipmentId} direction="cost" onDone={() => setAddingCost(false)} />
        )}
      </div>

      {/* Revenue lines */}
      <div className="border-t border-dashed border-border/60 pt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ingresos</p>
          <button
            onClick={() => { setAddingRevenue(true); setAddingCost(false); }}
            className="flex items-center gap-1 rounded text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3" /> Añadir
          </button>
        </div>
        {revenues.length > 0 && (
          <div className="divide-y divide-border/50">
            {revenues.map((c) => <LineRow key={c.id} charge={c} shipmentId={shipmentId} />)}
          </div>
        )}
        {revenues.length === 0 && !addingRevenue && (
          <p className="text-xs text-muted-foreground">Sin líneas de ingreso.</p>
        )}
        {addingRevenue && (
          <AddLineForm shipmentId={shipmentId} direction="revenue" onDone={() => setAddingRevenue(false)} />
        )}
      </div>
    </section>
  );
}
