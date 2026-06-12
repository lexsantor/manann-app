// Etiquetas (ES), tonos de estado, iconos de modo y formateadores del ERP.
// Punto único de verdad para no duplicar literales por las vistas.
import {
  Ship,
  Plane,
  Truck,
  TrainFront,
  Shuffle,
  type LucideIcon,
} from "lucide-react";

// ─── Estado del expediente ──────────────────────────────────────────────────
// Tono según el sistema de color: amber = en curso (regla "ámbar = estado"),
// success = entregado, neutro = borrador/cerrado. Nunca color sin etiqueta.
export type StatusTone = "active" | "done" | "neutral";

export const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  borrador: { label: "Borrador", tone: "neutral" },
  confirmado: { label: "Confirmado", tone: "active" },
  en_transito: { label: "En tránsito", tone: "active" },
  en_aduana: { label: "En aduana", tone: "active" },
  entregado: { label: "Entregado", tone: "done" },
  cerrado: { label: "Cerrado", tone: "neutral" },
};

// ─── Prioridad (paleta propia, nunca ámbar) ─────────────────────────────────
export const PRIORITY: Record<string, { label: string; cls: string }> = {
  low: { label: "Baja", cls: "priority-low" },
  med: { label: "Media", cls: "priority-med" },
  high: { label: "Alta", cls: "priority-high" },
  urgent: { label: "Urgente", cls: "priority-urgent" },
};

// ─── Modo de transporte ─────────────────────────────────────────────────────
export const MODE: Record<string, { label: string; icon: LucideIcon }> = {
  maritimo: { label: "Marítimo", icon: Ship },
  aereo: { label: "Aéreo", icon: Plane },
  terrestre: { label: "Terrestre", icon: Truck },
  ferroviario: { label: "Ferroviario", icon: TrainFront },
  multimodal: { label: "Multimodal", icon: Shuffle },
};

// ─── Roles de parte (término real del transitario) ──────────────────────────
export const PARTY_ROLE: Record<string, string> = {
  shipper: "Shipper",
  consignee: "Consignatario",
  notify: "Notify",
  carrier: "Transportista",
  agent: "Agente",
  forwarder: "Transitario",
};

// ─── Tipos de cargo ─────────────────────────────────────────────────────────
export const CHARGE_TYPE: Record<string, string> = {
  flete: "Flete",
  aduana: "Aduana",
  manipulacion: "Manipulación",
  seguro: "Seguro",
  documentacion: "Documentación",
  almacenaje: "Almacenaje",
  otro: "Otro",
};

// ─── Eventos de tracking ────────────────────────────────────────────────────
export const TRACKING_TYPE: Record<string, string> = {
  booking: "Reserva",
  gate_in: "Entrada a puerto",
  cargado: "Cargado",
  salida: "Salida",
  en_transito: "En tránsito",
  llegada: "Llegada",
  descargado: "Descargado",
  aduana: "Aduana",
  entregado: "Entregado",
};

// ─── Documentos ─────────────────────────────────────────────────────────────
export const DOC_TYPE: Record<string, string> = {
  bl: "Bill of Lading",
  factura_comercial: "Factura comercial",
  packing_list: "Packing list",
  dua: "DUA",
  certificado_origen: "Certificado de origen",
  otro: "Documento",
};

// ─── Puertos UN/LOCODE → ciudad (los del demo) ──────────────────────────────
export const PORTS: Record<string, string> = {
  ESBCN: "Barcelona",
  ESVLC: "València",
  ESALG: "Algeciras",
  ESVNG: "Vilanova",
  ESVGO: "Vigo",
  NLRTM: "Rotterdam",
  CNSHA: "Shanghái",
  CNNGB: "Ningbo-Zhoushan",
  USNYC: "Nueva York",
  DEHAM: "Hamburgo",
  MXMEX: "Ciudad de México",
  HKHKG: "Hong Kong",
};

export function portLabel(code: string | null): string {
  if (!code) return "—";
  const city = PORTS[code];
  return city ? `${city} · ${code}` : code;
}

// Coordenadas [lat, lng] de los puertos del demo (para el mapa de tracking).
export const PORT_COORDS: Record<string, [number, number]> = {
  ESBCN: [41.35, 2.16],
  ESVLC: [39.44, -0.32],
  ESALG: [36.13, -5.44],
  ESVNG: [41.21, 1.73],
  ESVGO: [42.24, -8.72],
  NLRTM: [51.95, 4.14],
  CNSHA: [30.63, 122.07],
  CNNGB: [29.87, 121.55],
  USNYC: [40.69, -74.04],
  DEHAM: [53.54, 9.97],
  MXMEX: [19.44, -99.07],
  HKHKG: [22.28, 114.17],
};

export function portCoords(code: string | null): [number, number] | null {
  return code ? (PORT_COORDS[code] ?? null) : null;
}

// ─── Formateadores ──────────────────────────────────────────────────────────
const dateFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d + "T12:00:00") : d;
  return dateFmt.format(date);
}

export function formatDateTime(d: Date | null): string {
  return d ? dateTimeFmt.format(d) : "—";
}

export function formatMoney(amount: string, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export function formatWeight(kg: number | null): string {
  if (kg == null) return "—";
  return `${new Intl.NumberFormat("es-ES").format(kg)} kg`;
}

// ─── CO₂ footprint estimado ──────────────────────────────────────────────────
// Factores de emisión kg CO₂e / t·km — GLEC Framework v3 (valores medios)
const CO2_FACTOR: Record<string, number> = {
  maritimo:    0.010,
  aereo:       0.602,
  terrestre:   0.096,
  ferroviario: 0.028,
  multimodal:  0.020,
};

function haversineKm(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number],
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export type Co2Estimate = {
  kg: number;
  distanceKm: number;
  weightTonnes: number;
};

export function estimateCo2(
  pol: string | null,
  pod: string | null,
  mode: string,
  totalWeightKg: number,
): Co2Estimate | null {
  const c1 = portCoords(pol);
  const c2 = portCoords(pod);
  if (!c1 || !c2 || totalWeightKg <= 0) return null;
  const distanceKm = haversineKm(c1, c2);
  const factor = CO2_FACTOR[mode] ?? CO2_FACTOR.maritimo;
  const weightTonnes = totalWeightKg / 1000;
  return { kg: distanceKm * weightTonnes * factor, distanceKm, weightTonnes };
}

export function formatCo2(e: Co2Estimate): string {
  if (e.kg >= 1000) return `${(e.kg / 1000).toFixed(1)} t CO₂e`;
  return `${Math.round(e.kg)} kg CO₂e`;
}
