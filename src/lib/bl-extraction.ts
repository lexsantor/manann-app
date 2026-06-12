// Esquema de extracción de un Bill of Lading.
// Cada campo lleva su confianza (0-1): es el corazón del momento "wow" —
// la IA propone con un nivel de certeza por campo; el humano confirma.
import { z } from "zod";

const field = (desc: string) =>
  z.object({
    value: z
      .string()
      .nullable()
      .describe(`${desc}. null si no aparece en el documento.`),
    confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Confianza 0-1 en el valor extraído (0 si es null)."),
  });

export const blExtractionSchema = z.object({
  carrier: field("Naviera / transportista (Maersk, MSC…)"),
  vessel: field("Nombre del buque"),
  voyage: field("Número de viaje / voyage"),
  blNumber: field("Número de Bill of Lading"),
  pol: field("Puerto de carga — código UN/LOCODE (p.ej. ESBCN) si es deducible, si no el nombre"),
  pod: field("Puerto de descarga — UN/LOCODE o nombre"),
  incoterm: field("Incoterm (FOB, CIF, DAP…)"),
  freightTerms: field("Condiciones de flete: prepaid o collect"),
  etd: field("Fecha estimada de salida en formato ISO YYYY-MM-DD"),
  eta: field("Fecha estimada de llegada en formato ISO YYYY-MM-DD"),
  shipperName: field("Nombre del shipper / expedidor"),
  shipperCountry: field("País del shipper (ISO 3166 alpha-2)"),
  consigneeName: field("Nombre del consignatario / consignee"),
  consigneeCountry: field("País del consignatario (ISO alpha-2)"),
  notifyName: field("Notify party"),
  containerNumber: field("Número de contenedor ISO 6346 (p.ej. MSKU1234567)"),
  sealNumber: field("Número de precinto / seal"),
  containerType: field("Tipo ISO de contenedor (22G1, 45G1, 40HC…)"),
  cargoDescription: field("Descripción de la mercancía"),
  hsCode: field("Código arancelario HS"),
  packages: field("Número de bultos (solo el número)"),
  grossWeightKg: field("Peso bruto en kg (solo el número)"),
});

export type BlExtraction = z.infer<typeof blExtractionSchema>;
export type BlField = { value: string | null; confidence: number };

export const EXTRACTION_PROMPT =
  "Eres un asistente experto de un transitario. Extrae los datos del siguiente " +
  "Bill of Lading (documento de transporte marítimo). Para cada campo, devuelve " +
  "el valor tal como aparece y una confianza 0-1 según lo claro que esté. Si un " +
  "campo no aparece, value=null y confidence=0. Puertos en UN/LOCODE si puedes " +
  "deducirlo; fechas en ISO YYYY-MM-DD. No inventes datos.";

// Orden y etiquetas para mostrar la propuesta en la UI (ES).
export const FIELD_LABELS: { key: keyof BlExtraction; label: string; mono?: boolean }[] = [
  { key: "blNumber", label: "BL nº", mono: true },
  { key: "carrier", label: "Naviera" },
  { key: "vessel", label: "Buque" },
  { key: "voyage", label: "Viaje", mono: true },
  { key: "pol", label: "Puerto de carga", mono: true },
  { key: "pod", label: "Puerto de descarga", mono: true },
  { key: "incoterm", label: "Incoterm" },
  { key: "freightTerms", label: "Condiciones" },
  { key: "etd", label: "ETD", mono: true },
  { key: "eta", label: "ETA", mono: true },
  { key: "shipperName", label: "Shipper" },
  { key: "consigneeName", label: "Consignatario" },
  { key: "notifyName", label: "Notify" },
  { key: "containerNumber", label: "Contenedor", mono: true },
  { key: "sealNumber", label: "Precinto", mono: true },
  { key: "containerType", label: "Tipo cont.", mono: true },
  { key: "cargoDescription", label: "Mercancía" },
  { key: "hsCode", label: "HS", mono: true },
  { key: "packages", label: "Bultos", mono: true },
  { key: "grossWeightKg", label: "Peso bruto", mono: true },
];

// Confianza global = media de los campos con valor.
export function overallConfidence(ex: Record<string, { value: string | null; confidence: number }>): number {
  const withVal = Object.values(ex).filter((f) => f.value != null);
  if (!withVal.length) return 0;
  return withVal.reduce((s, f) => s + f.confidence, 0) / withVal.length;
}

// Umbral por debajo del cual un campo se marca para revisión humana.
export const LOW_CONFIDENCE = 0.7;

// ─── AWB (Air Waybill) ───────────────────────────────────────────────────────

export const awbExtractionSchema = z.object({
  carrier: field("Aerolínea / transportista aéreo (código IATA o nombre)"),
  awbNumber: field("Número AWB, p.ej. 020-12345678"),
  flightNumber: field("Número de vuelo"),
  blNumber: field("Referencia interna o MAWB si aplica"),
  pol: field("Aeropuerto de origen — código IATA (MAD, BCN, CDG…)"),
  pod: field("Aeropuerto de destino — código IATA"),
  incoterm: field("Incoterm (FOB, CIF, DAP…)"),
  freightTerms: field("Condiciones de flete: prepaid o collect"),
  etd: field("Fecha de salida en formato ISO YYYY-MM-DD"),
  eta: field("Fecha estimada de llegada en formato ISO YYYY-MM-DD"),
  shipperName: field("Nombre del expedidor"),
  shipperCountry: field("País del expedidor (ISO alpha-2)"),
  consigneeName: field("Nombre del consignatario"),
  consigneeCountry: field("País del consignatario (ISO alpha-2)"),
  notifyName: field("Notify party si aplica"),
  containerNumber: field("Número de ULD o contenedor si aplica"),
  sealNumber: field("Precinto si aplica"),
  containerType: field("Tipo de ULD o null"),
  cargoDescription: field("Descripción de la mercancía"),
  hsCode: field("Código arancelario HS"),
  packages: field("Número de piezas (solo el número)"),
  grossWeightKg: field("Peso bruto en kg (solo el número)"),
});

export const AWB_EXTRACTION_PROMPT =
  "Eres un asistente experto de un agente de carga aérea. Extrae los datos del " +
  "siguiente Air Waybill (AWB). Para cada campo devuelve el valor y una confianza " +
  "0-1. Si un campo no aparece, value=null y confidence=0. Aeropuertos en IATA; " +
  "fechas en ISO YYYY-MM-DD. No inventes datos.";

// ─── CMR (Carta de porte terrestre) ──────────────────────────────────────────

export const cmrExtractionSchema = z.object({
  carrier: field("Empresa de transporte / transportista"),
  blNumber: field("Número de carta de porte CMR"),
  vessel: field("Matrícula del vehículo / camión"),
  voyage: field("Matrícula del remolque si aplica"),
  pol: field("Lugar de carga: ciudad, país de recogida"),
  pod: field("Lugar de entrega: ciudad, país de destino"),
  incoterm: field("Incoterm"),
  freightTerms: field("Condiciones de flete: prepaid o collect"),
  etd: field("Fecha de recogida en formato ISO YYYY-MM-DD"),
  eta: field("Fecha estimada de entrega en formato ISO YYYY-MM-DD"),
  shipperName: field("Nombre del expedidor / remitente"),
  shipperCountry: field("País del remitente (ISO alpha-2)"),
  consigneeName: field("Nombre del destinatario"),
  consigneeCountry: field("País del destinatario (ISO alpha-2)"),
  notifyName: field("Notificar a si aplica"),
  containerNumber: field("Referencia de carga o número de precinto"),
  sealNumber: field("Número de sello / precinto"),
  containerType: field("Tipo de vehículo: lona, frigorífico…"),
  cargoDescription: field("Descripción de la mercancía"),
  hsCode: field("Código arancelario HS"),
  packages: field("Número de bultos (solo el número)"),
  grossWeightKg: field("Peso bruto en kg (solo el número)"),
});

export const CMR_EXTRACTION_PROMPT =
  "Eres un asistente experto de un transitario terrestre. Extrae los datos de la " +
  "siguiente carta de porte CMR. Para cada campo devuelve el valor y una confianza " +
  "0-1. Si un campo no aparece, value=null y confidence=0. Fechas en ISO YYYY-MM-DD. " +
  "No inventes datos.";

// ─── Selector de schema por modo de transporte ───────────────────────────────

export function pickExtractionSchema(mode: string) {
  if (mode === "aereo") return { schema: awbExtractionSchema, prompt: AWB_EXTRACTION_PROMPT };
  if (mode === "terrestre") return { schema: cmrExtractionSchema, prompt: CMR_EXTRACTION_PROMPT };
  return { schema: blExtractionSchema, prompt: EXTRACTION_PROMPT };
}
