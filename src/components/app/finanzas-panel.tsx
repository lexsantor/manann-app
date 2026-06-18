"use client";

import { useState, useTransition } from "react";
import { TrendingUp, TrendingDown, Plus, Trash2, Loader2, Receipt, AlertTriangle, ArrowRight, Scale } from "lucide-react";
import { Icon } from "@/components/icon";
import { formatMoney } from "@/lib/erp-format";
import { addCharge, deleteCharge, updateChargeAccrual, type AddChargeInput } from "@/lib/erp-actions";
import { GenerarFacturaButton } from "@/components/app/generar-factura-button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

// ─── Formulario de añadir cargo ──────────────────────────────────────────────

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
  const [buyAmount, setBuyAmount] = useState("");
  const [passThrough, setPassThrough] = useState(false);
  const [atRisk, setAtRisk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Introduce un importe de venta válido");
      return;
    }
    setError(null);
    const input: AddChargeInput = {
      type: type as AddChargeInput["type"],
      direction,
      description: description.trim() || undefined,
      amount: Number(amount).toFixed(2),
      buyAmount: buyAmount && !passThrough ? Number(buyAmount).toFixed(2) : undefined,
      passThrough,
      atRisk,
      currency: "EUR",
    };
    startTransition(async () => {
      try {
        await addCharge(shipmentId, input);
        onDone();
      } catch {
        setError("No se ha podido guardar. Inténtalo de nuevo.");
      }
    });
  }

  const sell = Number(amount) || 0;
  const buy = passThrough ? sell : (Number(buyAmount) || 0);
  const gp = sell - buy;

  return (
    <form onSubmit={handleSubmit} className="mt-2 rounded-md border border-border/60 bg-surface-2/40 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_2fr_1fr_1fr]">
        <div className="relative">
          <Select value={type} onValueChange={(v) => setType(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHARGE_TYPES.map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <input
          type="text"
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-base text-muted-foreground">Venta</span>
          <input
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-border bg-background pl-10 pr-2 py-1.5 text-right font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-base text-muted-foreground">Compra</span>
          <input
            type="number"
            placeholder="0,00"
            step="0.01"
            min="0"
            value={passThrough ? amount : buyAmount}
            disabled={passThrough}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="w-full rounded-md border border-border bg-background pl-12 pr-2 py-1.5 text-right font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-base">
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-muted-foreground">
          <Checkbox
            checked={passThrough}
            onChange={(checked) => {
              setPassThrough(checked);
              if (checked) setBuyAmount("");
            }}
          />
          Pass-through (sin margen)
        </label>
        {direction === "revenue" && (
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-muted-foreground">
            <Checkbox
              checked={atRisk}
              onChange={(checked) => setAtRisk(checked)}
            />
            Sin facturar al cliente
          </label>
        )}
        {sell > 0 && buy > 0 && !passThrough && (
          <span className="ml-auto font-mono text-base text-muted-foreground">
            GP: <span className={cn("font-semibold", gp >= 0 ? "text-success" : "text-destructive")}>
              {gp >= 0 ? "+" : ""}{gp.toFixed(0)} €
            </span>
          </span>
        )}
      </div>

      {error && <p className="text-base text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-md px-3 py-1.5 text-base text-muted-foreground hover:text-foreground">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-base font-medium text-primary hover:bg-primary/15 disabled:opacity-50"
        >
          {pending && <Loader2 className="size-3 animate-spin" />}
          Guardar
        </button>
      </div>
    </form>
  );
}

// ─── Fila de la tabla unificada ──────────────────────────────────────────────

interface ChargeRowProps {
  charge: Charge;
  shipmentId: string;
  showBuyCol: boolean;
  rateAvg?: { avg: number; count: number };
}

function ChargeRow({ charge: c, shipmentId, showBuyCol, rateAvg }: ChargeRowProps) {
  const [pending, startTransition] = useTransition();
  const typeLabel = CHARGE_TYPE_LABELS[c.type] ?? c.type;
  const sell = Number(c.amount);
  const buy = c.buyAmount != null ? Number(c.buyAmount) : null;
  const gp = buy != null ? sell - buy : null;
  const anomalyPct = rateAvg && rateAvg.avg > 0 && rateAvg.count >= 1
    ? Math.round(((sell / rateAvg.avg) - 1) * 100)
    : null;

  function handleDelete() {
    startTransition(async () => {
      await deleteCharge(c.id, shipmentId);
    });
  }

  return (
    <tr className={cn(
      "group border-b border-border/40 last:border-0 transition-opacity",
      pending && "opacity-40",
      c.atRisk && "bg-destructive/[0.03]",
    )}>
      <td className="py-2 pl-3 pr-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base text-foreground truncate">{c.description || typeLabel}</span>
          {c.description && (
            <span className="shrink-0 font-mono text-sm uppercase tracking-wider text-muted-foreground">{typeLabel}</span>
          )}
          {c.atRisk && (
            <span className="shrink-0 inline-flex items-center gap-0.5 rounded-sm bg-destructive/10 px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide text-destructive">
              <AlertTriangle className="size-2.5" /> sin facturar
            </span>
          )}
          {c.passThrough && !c.atRisk && (
            <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm uppercase tracking-wide text-muted-foreground">
              pass-through
            </span>
          )}
          {anomalyPct !== null && anomalyPct > 20 && (
            <span className="shrink-0 inline-flex items-center gap-0.5 rounded-sm bg-accent/10 px-1.5 py-0.5 font-mono text-sm font-semibold uppercase tracking-wide text-accent">
              <TrendingUp className="size-2.5" /> ↑{anomalyPct}% vs. tarifa ref.
            </span>
          )}
        </div>
      </td>
      <td className="py-2 px-2 text-right">
        <span className="font-mono text-base text-foreground">{formatMoney(c.amount, c.currency)}</span>
      </td>
      {showBuyCol && (
        <td className="py-2 px-2 text-right">
          <span className="font-mono text-base text-muted-foreground">
            {buy != null ? formatMoney(String(buy), c.currency) : <span className="text-border">—</span>}
          </span>
        </td>
      )}
      {showBuyCol && (
        <td className="py-2 px-2 text-right">
          {gp != null ? (
            <span className={cn(
              "font-mono text-base font-medium",
              gp > 0 ? "text-success" : gp === 0 ? "text-muted-foreground" : "text-destructive",
            )}>
              {gp > 0 ? "+" : ""}{gp.toFixed(0)} €
            </span>
          ) : (
            <span className="text-border font-mono text-base">—</span>
          )}
        </td>
      )}
      <td className="py-2 pl-2 pr-3 w-8">
        <button
          onClick={handleDelete}
          disabled={pending}
          className="invisible size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:text-destructive group-hover:visible"
          aria-label="Eliminar"
        >
          {pending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
        </button>
      </td>
    </tr>
  );
}

// ─── Panel principal ─────────────────────────────────────────────────────────

interface FinanzasPanelProps {
  shipmentId: string;
  charges: Charge[];
  clientName?: string;
  rateAverages?: Record<string, { avg: number; count: number }>;
}

export function FinanzasPanel({ shipmentId, charges, clientName = "", rateAverages }: FinanzasPanelProps) {
  const [addingRevenue, setAddingRevenue] = useState(false);
  const [addingCost, setAddingCost] = useState(false);

  const revenues = charges.filter((c) => c.direction === "revenue");
  const costs = charges.filter((c) => c.direction === "cost");

  const totalSell = revenues.reduce((s, c) => s + Number(c.amount), 0);
  const totalBuy = revenues.reduce((s, c) => s + (c.buyAmount != null ? Number(c.buyAmount) : 0), 0);
  const totalCostOnly = costs.reduce((s, c) => s + Number(c.amount), 0);

  // GP: per-line buy amounts take priority; fall back to separate cost rows
  const hasAnyBuyAmount = revenues.some((c) => c.buyAmount != null);
  const effectiveBuy = hasAnyBuyAmount ? totalBuy : totalCostOnly;
  const gp = totalSell - effectiveBuy;
  const gpPct = totalSell > 0 ? (gp / totalSell) * 100 : null;

  const showBuyCol = revenues.some((c) => c.buyAmount != null);
  const atRiskCharges = revenues.filter((c) => c.atRisk);
  const atRiskTotal = atRiskCharges.reduce((s, c) => s + Number(c.amount), 0);

  const currency = charges[0]?.currency ?? "EUR";
  const hasMixed = new Set(charges.map((c) => c.currency)).size > 1;

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
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

      {/* GP hero */}
      {(totalSell > 0 || effectiveBuy > 0) && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border/50 bg-surface-2/30 p-3">
            <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Venta total</p>
            <p className="mt-1 font-mono text-base font-semibold text-foreground">
              {hasMixed ? "—" : formatMoney(String(totalSell), currency)}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-surface-2/30 p-3">
            <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Compra total</p>
            <p className="mt-1 font-mono text-base font-semibold text-muted-foreground">
              {hasMixed ? "—" : formatMoney(String(effectiveBuy), currency)}
            </p>
          </div>
          <div className={cn(
            "rounded-lg border p-3",
            gp >= 0 ? "border-success/20 bg-success/5" : "border-destructive/20 bg-destructive/5",
          )}>
            <div className="flex items-center justify-between">
              <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Gross Profit</p>
              {gp >= 0
                ? <Icon icon={TrendingUp} size={13} className="text-success" />
                : <Icon icon={TrendingDown} size={13} className="text-destructive" />}
            </div>
            <p className={cn("mt-1 font-mono text-base font-semibold", gp >= 0 ? "text-success" : "text-destructive")}>
              {hasMixed ? "—" : formatMoney(String(gp), currency)}
            </p>
            {gpPct !== null && !hasMixed && (
              <p className="mt-0.5 font-mono text-base text-muted-foreground">{gpPct.toFixed(1)} %</p>
            )}
          </div>
        </div>
      )}

      {/* Aviso de fuga si hay cargos sin facturar */}
      {atRiskCharges.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
          <Icon icon={AlertTriangle} size={14} className="mt-0.5 shrink-0 text-destructive" />
          <div className="min-w-0 text-base text-destructive">
            <span className="font-semibold">Fuga de margen: </span>
            {atRiskCharges.length === 1
              ? `${atRiskCharges[0].description || CHARGE_TYPE_LABELS[atRiskCharges[0].type]} (${formatMoney(String(atRiskTotal), currency)}) no facturado al cliente.`
              : `${atRiskCharges.length} cargos (${formatMoney(String(atRiskTotal), currency)}) no facturados al cliente.`}
            {" "}Si no se factura, el GP caería a{" "}
            <span className="font-semibold">{formatMoney(String(gp - atRiskTotal), currency)}</span>.
          </div>
        </div>
      )}

      {/* Tabla de ingresos */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Líneas de ingreso</p>
          <button
            onClick={() => { setAddingRevenue(true); setAddingCost(false); }}
            className="flex items-center gap-1 rounded text-base text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3" /> Añadir
          </button>
        </div>

        {revenues.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40 bg-surface-2/30">
                  <th className="py-1.5 pl-3 pr-2 text-left font-mono text-sm uppercase tracking-wider text-muted-foreground">Concepto</th>
                  <th className="py-1.5 px-2 text-right font-mono text-sm uppercase tracking-wider text-muted-foreground">Venta</th>
                  {showBuyCol && (
                    <th className="py-1.5 px-2 text-right font-mono text-sm uppercase tracking-wider text-muted-foreground">Compra</th>
                  )}
                  {showBuyCol && (
                    <th className="py-1.5 px-2 text-right font-mono text-sm uppercase tracking-wider text-muted-foreground">GP</th>
                  )}
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {revenues.map((c) => (
                  <ChargeRow key={c.id} charge={c} shipmentId={shipmentId} showBuyCol={showBuyCol} rateAvg={rateAverages?.[c.type]} />
                ))}
              </tbody>
              {showBuyCol && revenues.length > 1 && (
                <tfoot>
                  <tr className="border-t-2 border-border bg-surface-2/20">
                    <td className="py-2 pl-3 pr-2 font-medium text-base text-foreground">Total</td>
                    <td className="py-2 px-2 text-right font-mono text-base font-semibold text-foreground">
                      {hasMixed ? "—" : formatMoney(String(totalSell), currency)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-base font-semibold text-muted-foreground">
                      {hasMixed ? "—" : formatMoney(String(totalBuy), currency)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-base font-semibold">
                      <span className={gp >= 0 ? "text-success" : "text-destructive"}>
                        {gp >= 0 ? "+" : ""}{hasMixed ? "—" : formatMoney(String(gp), currency)}
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        ) : !addingRevenue ? (
          <p className="text-base text-muted-foreground">Sin líneas de ingreso. Añade lo que facturas al cliente y el margen del expediente se calcula solo.</p>
        ) : null}

        {addingRevenue && (
          <AddLineForm shipmentId={shipmentId} direction="revenue" onDone={() => setAddingRevenue(false)} />
        )}
      </div>

      {/* Costes standalone (sin revenue counterpart) */}
      {(costs.length > 0 || addingCost) && (
        <div className="border-t border-dashed border-border/60 pt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Otros costes</p>
            <button
              onClick={() => { setAddingCost(true); setAddingRevenue(false); }}
              className="flex items-center gap-1 rounded text-base text-muted-foreground hover:text-foreground"
            >
              <Plus className="size-3" /> Añadir
            </button>
          </div>
          {costs.length > 0 && (
            <div className="divide-y divide-border/50">
              {costs.map((c) => (
                <CostRow key={c.id} charge={c} shipmentId={shipmentId} />
              ))}
            </div>
          )}
          {addingCost && (
            <AddLineForm shipmentId={shipmentId} direction="cost" onDone={() => setAddingCost(false)} />
          )}
        </div>
      )}

      {/* Botón añadir costes si la sección no está visible */}
      {costs.length === 0 && !addingCost && !addingRevenue && (
        <div className="mt-2 border-t border-dashed border-border/60 pt-3">
          <button
            onClick={() => setAddingCost(true)}
            className="flex items-center gap-1 text-base text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3" />
            <ArrowRight className="size-3" />
            Añadir coste standalone
          </button>
        </div>
      )}
    </section>
  );
}

function CostRow({ charge: c, shipmentId }: { charge: Charge; shipmentId: string }) {
  const [editingAccrual, setEditingAccrual] = useState(false);
  const [accrualInput, setAccrualInput] = useState(c.accrualAmount ? String(Number(c.accrualAmount).toFixed(2)) : "");
  const [pending, startTransition] = useTransition();

  const provisioned = Number(c.amount);
  const actual = c.accrualAmount != null ? Number(c.accrualAmount) : null;
  const variance = actual != null ? actual - provisioned : null;
  const label = c.description || (CHARGE_TYPE_LABELS[c.type] ?? c.type);

  function handleSaveAccrual() {
    if (!accrualInput || isNaN(Number(accrualInput))) return;
    startTransition(async () => {
      await updateChargeAccrual(c.id, Number(accrualInput).toFixed(2));
      setEditingAccrual(false);
    });
  }

  return (
    <div className="group py-2 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base text-foreground">{label}</p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-base text-muted-foreground">{formatMoney(c.amount, c.currency ?? "EUR")}</span>
          <button
            onClick={() => setEditingAccrual((v) => !v)}
            title="Registrar factura real (accrual)"
            className={cn(
              "invisible size-5 items-center justify-center rounded text-muted-foreground/60 transition-colors group-hover:visible",
              (c.accrualAmount != null || editingAccrual) && "visible",
              variance != null && Math.abs(variance) > 0.01 ? "text-accent" : "hover:text-foreground",
            )}
          >
            <Scale className="size-3" />
          </button>
          <DeleteCostButton chargeId={c.id} shipmentId={shipmentId} />
        </div>
      </div>

      {/* Accrual reconciliation inline */}
      {(editingAccrual || (actual != null && Math.abs(variance ?? 0) > 0.01)) && (
        <div className={cn(
          "mt-1.5 rounded-md border px-2.5 py-2 text-base",
          variance != null && Math.abs(variance) > 0.01
            ? "border-accent/20 bg-accent/5"
            : "border-border/60 bg-surface-2/40",
        )}>
          {editingAccrual ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-muted-foreground">Factura real:</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={accrualInput}
                onChange={(e) => setAccrualInput(e.target.value)}
                className="w-24 rounded border border-border/60 bg-background px-2 py-0.5 font-mono text-base text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveAccrual(); if (e.key === "Escape") setEditingAccrual(false); }}
              />
              <button
                onClick={handleSaveAccrual}
                disabled={pending}
                className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 font-mono text-base text-primary hover:bg-primary/15 disabled:opacity-50"
              >
                {pending && <Loader2 className="size-2.5 animate-spin" />}
                Guardar
              </button>
              <button onClick={() => setEditingAccrual(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Presupuestado <span className="font-mono">{formatMoney(c.amount, c.currency ?? "EUR")}</span></span>
                <span className="text-muted-foreground">Real <span className="font-mono">{formatMoney(String(actual!), c.currency ?? "EUR")}</span></span>
              </div>
              {variance != null && Math.abs(variance) > 0.01 && (
                <span className={cn(
                  "font-mono font-medium",
                  variance > 0 ? "text-destructive" : "text-success",
                )}>
                  {variance > 0 ? "+" : ""}{formatMoney(String(variance), c.currency ?? "EUR")} variación
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DeleteCostButton({ chargeId, shipmentId }: { chargeId: string; shipmentId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => deleteCharge(chargeId, shipmentId))}
      disabled={pending}
      className="invisible size-6 items-center justify-center rounded text-muted-foreground/65 transition-colors hover:text-destructive group-hover:visible"
      aria-label="Eliminar"
    >
      {pending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
    </button>
  );
}
