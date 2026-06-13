import { type ShipmentListItem } from "@/lib/erp";

export type ExceptionKind = "at_risk" | "accrual_gap" | "negative_gp";

export interface ChargeException {
  chargeId: string;
  shipmentId: string;
  shipmentReference: string;
  kind: ExceptionKind;
  chargeDescription: string;
  riskAmount: number;
  currency: string;
}

const CHARGE_TYPE_LABELS: Record<string, string> = {
  flete: "Flete",
  aduana: "Aduana",
  manipulacion: "Manipulación",
  seguro: "Seguro",
  documentacion: "Documentación",
  almacenaje: "Almacenaje",
  otro: "Otro",
};

export function computeExceptions(shipments: ShipmentListItem[]): ChargeException[] {
  const exceptions: ChargeException[] = [];

  for (const s of shipments) {
    const revenues = s.charges.filter((c) => c.direction === "revenue");
    const costs = s.charges.filter((c) => c.direction === "cost");

    // B1a — ingresos marcados at_risk
    for (const c of revenues.filter((c) => c.atRisk)) {
      exceptions.push({
        chargeId: c.id,
        shipmentId: s.id,
        shipmentReference: s.reference,
        kind: "at_risk",
        chargeDescription: c.description || (CHARGE_TYPE_LABELS[c.type] ?? c.type),
        riskAmount: Number(c.amount),
        currency: c.currency ?? "EUR",
      });
    }

    // B1b — cargos de coste con accrual divergente
    for (const c of costs) {
      if (c.accrualAmount == null) continue;
      const variance = Math.abs(Number(c.amount) - Number(c.accrualAmount));
      if (variance < 0.01) continue;
      exceptions.push({
        chargeId: c.id,
        shipmentId: s.id,
        shipmentReference: s.reference,
        kind: "accrual_gap",
        chargeDescription: c.description || (CHARGE_TYPE_LABELS[c.type] ?? c.type),
        riskAmount: variance,
        currency: c.currency ?? "EUR",
      });
    }

    // B1c — GP negativo (shipments where total sell < total buy)
    const totalSell = revenues.reduce((sum, c) => sum + Number(c.amount), 0);
    const hasAnyBuy = revenues.some((c) => c.buyAmount != null);
    const totalBuy = hasAnyBuy
      ? revenues.reduce((sum, c) => sum + (c.buyAmount != null ? Number(c.buyAmount) : 0), 0)
      : costs.reduce((sum, c) => sum + Number(c.amount), 0);

    if ((hasAnyBuy || costs.length > 0) && totalSell > 0 && totalBuy > totalSell) {
      const loss = totalBuy - totalSell;
      exceptions.push({
        chargeId: s.id,
        shipmentId: s.id,
        shipmentReference: s.reference,
        kind: "negative_gp",
        chargeDescription: "GP negativo — compra supera venta",
        riskAmount: loss,
        currency: "EUR",
      });
    }
  }

  return exceptions.sort((a, b) => b.riskAmount - a.riskAmount);
}

export function computeLeakageKpi(shipments: ShipmentListItem[]): {
  totalAtRisk: number;
  atRiskCount: number;
  currency: string;
} {
  let totalAtRisk = 0;
  let atRiskCount = 0;

  for (const s of shipments) {
    for (const c of s.charges) {
      if (c.atRisk && c.direction === "revenue") {
        totalAtRisk += Number(c.amount);
        atRiskCount += 1;
      }
    }
  }

  return { totalAtRisk, atRiskCount, currency: "EUR" };
}

export function computeGpByClient(shipments: ShipmentListItem[]): {
  name: string;
  gp: number;
  revenue: number;
  shipmentCount: number;
  margin: number;
  tier: "A" | "B" | "C";
}[] {
  const byClient = new Map<string, { gp: number; revenue: number; count: number }>();

  for (const s of shipments) {
    const consignee =
      s.parties.find((p) => p.role === "consignee")?.name ?? "(Sin cliente)";
    const revenues = s.charges.filter((c) => c.direction === "revenue");
    const costs = s.charges.filter((c) => c.direction === "cost");

    if (revenues.length === 0) continue;

    const totalSell = revenues.reduce((sum, c) => sum + Number(c.amount), 0);
    const hasAnyBuy = revenues.some((c) => c.buyAmount != null);
    const totalBuy = hasAnyBuy
      ? revenues.reduce((sum, c) => sum + (c.buyAmount != null ? Number(c.buyAmount) : 0), 0)
      : costs.reduce((sum, c) => sum + Number(c.amount), 0);

    if (!hasAnyBuy && costs.length === 0) continue;

    const gp = totalSell - totalBuy;
    const existing = byClient.get(consignee) ?? { gp: 0, revenue: 0, count: 0 };
    byClient.set(consignee, {
      gp: existing.gp + gp,
      revenue: existing.revenue + totalSell,
      count: existing.count + 1,
    });
  }

  const rows = [...byClient.entries()]
    .map(([name, d]) => ({
      name,
      gp: d.gp,
      revenue: d.revenue,
      shipmentCount: d.count,
      margin: d.revenue > 0 ? (d.gp / d.revenue) * 100 : 0,
    }))
    .sort((a, b) => b.gp - a.gp);

  const total = rows.length;
  return rows.map((r, i) => ({
    ...r,
    tier: (i < total * 0.2 ? "A" : i < total * 0.6 ? "B" : "C") as "A" | "B" | "C",
  }));
}
