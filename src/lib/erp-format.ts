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
  NLRTM: "Rotterdam",
  CNSHA: "Shanghái",
  USNYC: "Nueva York",
  DEHAM: "Hamburgo",
  MXMEX: "Ciudad de México",
};

export function portLabel(code: string | null): string {
  if (!code) return "—";
  const city = PORTS[code];
  return city ? `${city} · ${code}` : code;
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

export function formatDate(d: Date | null): string {
  return d ? dateFmt.format(d) : "—";
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
