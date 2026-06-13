import { type ShipmentListItem } from "@/lib/erp";

export type ActionKind =
  | "invoice_at_risk"
  | "accrual_gap"
  | "negative_gp"
  | "eta_overdue"
  | "confirm_ai";

export type ActionSeverity = "critical" | "attention" | "info";

export interface AutopilotAction {
  id: string;
  kind: ActionKind;
  severity: ActionSeverity;
  title: string;
  description: string;
  shipmentId: string;
  shipmentRef: string;
  impact: number;
  impactLabel: string;
  metadata: Record<string, string>;
}

const CHARGE_TYPE_LABELS: Record<string, string> = {
  flete: "Flete",
  aduana: "Aduana",
  manipulacion: "Manipulación",
  seguro: "Seguro",
  documentacion: "Documentación",
  almacenaje: "Almacenaje",
  otro: "Cargo",
};

export function computeAutopilotActions(shipments: ShipmentListItem[]): AutopilotAction[] {
  const actions: AutopilotAction[] = [];

  for (const s of shipments) {
    const revenues = s.charges.filter((c) => c.direction === "revenue");
    const costs = s.charges.filter((c) => c.direction === "cost");

    // at_risk charges → facturar
    for (const c of revenues.filter((c) => c.atRisk)) {
      const desc = c.description || (CHARGE_TYPE_LABELS[c.type] ?? "Cargo");
      actions.push({
        id: `at_risk_${c.id}`,
        kind: "invoice_at_risk",
        severity: "critical",
        title: `Facturar ${desc}`,
        description: `${s.reference} · Cargo de ${formatMoney(Number(c.amount))} sin facturar al cliente. El GP caería sin esta acción.`,
        shipmentId: s.id,
        shipmentRef: s.reference,
        impact: Number(c.amount),
        impactLabel: "Margen recuperado",
        metadata: { chargeId: c.id, chargeDesc: desc },
      });
    }

    // accrual gaps → revisar desvío
    for (const c of costs) {
      if (c.accrualAmount == null) continue;
      const variance = Number(c.accrualAmount) - Number(c.amount);
      if (Math.abs(variance) < 0.01) continue;
      const desc = c.description || (CHARGE_TYPE_LABELS[c.type] ?? "Coste");
      actions.push({
        id: `accrual_${c.id}`,
        kind: "accrual_gap",
        severity: "attention",
        title: `Revisar desvío en ${desc}`,
        description: `${s.reference} · Provisión ${formatMoney(Number(c.amount))} vs factura ${formatMoney(Number(c.accrualAmount))}. Desvío de ${formatMoney(Math.abs(variance))}.`,
        shipmentId: s.id,
        shipmentRef: s.reference,
        impact: Math.abs(variance),
        impactLabel: variance > 0 ? "Coste adicional" : "Ahorro detectado",
        metadata: { chargeId: c.id },
      });
    }

    // negative GP
    const totalSell = revenues.reduce((s, c) => s + Number(c.amount), 0);
    const hasAnyBuy = revenues.some((c) => c.buyAmount != null);
    const totalBuy = hasAnyBuy
      ? revenues.reduce((s, c) => s + (c.buyAmount != null ? Number(c.buyAmount) : 0), 0)
      : costs.reduce((s, c) => s + Number(c.amount), 0);

    if ((hasAnyBuy || costs.length > 0) && totalSell > 0 && totalBuy > totalSell) {
      const loss = totalBuy - totalSell;
      actions.push({
        id: `neg_gp_${s.id}`,
        kind: "negative_gp",
        severity: "critical",
        title: `GP negativo — revisar márgenes`,
        description: `${s.reference} · Estás vendiendo por debajo de coste. Pérdida de ${formatMoney(loss)}.`,
        shipmentId: s.id,
        shipmentRef: s.reference,
        impact: loss,
        impactLabel: "Pérdida actual",
        metadata: {},
      });
    }

    // ETA vencida en expedientes activos
    const ACTIVE = ["confirmado", "en_transito", "en_aduana"];
    if (ACTIVE.includes(s.status) && s.eta && new Date(s.eta) < new Date()) {
      const days = Math.round((Date.now() - new Date(s.eta).getTime()) / (1000 * 60 * 60 * 24));
      actions.push({
        id: `eta_${s.id}`,
        kind: "eta_overdue",
        severity: "attention",
        title: `ETA vencida hace ${days} día${days === 1 ? "" : "s"}`,
        description: `${s.reference} · Actualiza el estado o avisa al cliente. Cada día extra puede generar demurrage.`,
        shipmentId: s.id,
        shipmentRef: s.reference,
        impact: days * 150,
        impactLabel: "Coste evitado/día",
        metadata: { days: String(days) },
      });
    }
  }

  return actions.sort((a, b) => {
    const sev = { critical: 0, attention: 1, info: 2 };
    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity];
    return b.impact - a.impact;
  });
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export function computeTimeSaved(shipments: ShipmentListItem[]): {
  total: number;
  breakdown: { label: string; hours: number }[];
} {
  const docsCount = shipments.reduce((s, sh) => s + (sh.charges.length > 0 ? 1 : 0), 0);
  const chargesCount = shipments.reduce((s, sh) => s + sh.charges.length, 0);

  const ingestion = Math.round(shipments.length * 0.5 * 10) / 10;
  const aiActions = Math.round(chargesCount * 0.15 * 10) / 10;
  const reconciliation = Math.round(docsCount * 0.3 * 10) / 10;
  const docs = Math.round(shipments.length * 0.2 * 10) / 10;
  const total = Math.round((ingestion + aiActions + reconciliation + docs) * 10) / 10;

  return {
    total,
    breakdown: [
      { label: "Ingesta IA", hours: ingestion },
      { label: "Acciones IA", hours: aiActions },
      { label: "Conciliación", hours: reconciliation },
      { label: "Documentación", hours: docs },
    ],
  };
}
