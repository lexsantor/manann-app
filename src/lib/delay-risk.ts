// Simulación determinista de riesgo de retraso. Sin DB: solo lógica de industria.
// Carriers, rutas y temporada afectan el score.

export type RiskLevel = "bajo" | "medio" | "alto";

export interface DelayRisk {
  level: RiskLevel;
  pct: number; // 0–100
  reason: string;
}

const HIGH_RISK = new Set([
  "EVERGREEN", "YANG MING", "YANG_MING", "ONE", "HMM", "PIL",
]);
const LOW_RISK = new Set([
  "MAERSK", "HAPAG-LLOYD", "HAPAG LLOYD", "CMA CGM",
]);

function regionOf(locode: string | null): string {
  if (!locode || locode.length < 2) return "OTHER";
  const cc = locode.slice(0, 2).toUpperCase();
  if (["CN", "KR", "JP", "HK", "TW", "SG", "VN", "TH", "MY"].includes(cc)) return "ASIA";
  if (["US", "CA", "MX"].includes(cc)) return "NA";
  if (["ES", "FR", "DE", "NL", "BE", "IT", "PT", "GB", "PL", "SE", "DK"].includes(cc)) return "EU";
  return "OTHER";
}

function routeDelta(pol: string | null, pod: string | null): number {
  const from = regionOf(pol);
  const to = regionOf(pod);
  if (from === "ASIA" && to === "EU") return 15;
  if (from === "ASIA" && to === "NA") return 20;
  if (from === "EU" && to === "EU") return -15;
  if (from === "EU" && to === "NA") return 5;
  return 0;
}

function seasonDelta(etd: Date | null): { delta: number; label: string | null } {
  if (!etd) return { delta: 0, label: null };
  const m = etd.getMonth() + 1;
  if (m >= 10 && m <= 12) return { delta: 18, label: "temporada alta Q4 (navidad)" };
  if (m >= 7 && m <= 9) return { delta: 10, label: "temporada de verano" };
  return { delta: 0, label: null };
}

export function computeDelayRisk(
  carrier: string | null,
  pol: string | null,
  pod: string | null,
  etd: Date | null,
  mode: string | null,
): DelayRisk {
  if (mode === "aereo") {
    return { level: "bajo", pct: 14, reason: "Modo aéreo · frecuencias diarias · transit time predecible" };
  }

  let base = mode === "terrestre" ? 22 : mode === "ferroviario" ? 38 : 32;
  const carrierUp = (carrier ?? "").toUpperCase();
  const reasons: string[] = [];

  if (HIGH_RISK.has(carrierUp)) { base += 20; reasons.push(`historial de incidencias de ${carrier}`); }
  else if (LOW_RISK.has(carrierUp)) { base -= 15; reasons.push(`${carrier} con alta puntualidad (OTP > 70%)`); }

  const rd = routeDelta(pol, pod);
  if (rd > 0) reasons.push("ruta transoceánica de alta demanda");
  if (rd < 0) reasons.push("ruta intraeuropea de baja congestión");
  base += rd;

  const { delta: sd, label: sl } = seasonDelta(etd);
  if (sd > 0 && sl) reasons.push(sl);
  base += sd;

  const pct = Math.max(5, Math.min(85, base));
  const level: RiskLevel = pct >= 60 ? "alto" : pct >= 35 ? "medio" : "bajo";
  const reason = reasons.length ? reasons.join(" · ") : "riesgo estándar para esta ruta y modo";

  return { level, pct, reason };
}
