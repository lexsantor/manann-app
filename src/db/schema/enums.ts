// Enums del dominio transitario.
// Valores en minúscula/slug; las etiquetas en español viven en la UI (PR-5).
// Excepción: roles de parte en inglés — es el término real del transitario
// (shipper, consignee, notify), no traducción forzada.
import { pgEnum } from "drizzle-orm/pg-core";

export const memberRole = pgEnum("member_role", ["owner", "member"]);

export const shipmentStatus = pgEnum("shipment_status", [
  "borrador",
  "confirmado",
  "en_transito",
  "en_aduana",
  "entregado",
  "facturado",
  "cerrado",
]);

export const transportMode = pgEnum("transport_mode", [
  "maritimo",
  "aereo",
  "terrestre",
  "ferroviario",
  "multimodal",
]);

// Paleta propia de prioridad (CLAUDE.md): low/med/high/urgent — nunca ámbar.
export const shipmentPriority = pgEnum("shipment_priority", [
  "low",
  "med",
  "high",
  "urgent",
]);

export const partyRole = pgEnum("party_role", [
  "shipper",
  "consignee",
  "notify",
  "carrier",
  "agent",
  "forwarder",
]);

export const documentType = pgEnum("document_type", [
  "bl",
  "awb",
  "cmr",
  "factura_comercial",
  "packing_list",
  "dua",
  "certificado_origen",
  "otro",
]);

export const documentStatus = pgEnum("document_status", [
  "uploaded",
  "processing",
  "extracted",
  "confirmed",
  "error",
]);

export const trackingEventType = pgEnum("tracking_event_type", [
  "booking",
  "gate_in",
  "cargado",
  "salida",
  "en_transito",
  "llegada",
  "descargado",
  "aduana",
  "entregado",
]);

export const trackingSource = pgEnum("tracking_source", [
  "mock",
  "shipsgo",
  "manual",
]);

export const chargeType = pgEnum("charge_type", [
  "flete",
  "aduana",
  "manipulacion",
  "seguro",
  "documentacion",
  "almacenaje",
  "otro",
]);

export const chargeDirection = pgEnum("charge_direction", ["cost", "revenue"]);

export const invoiceStatus = pgEnum("invoice_status", [
  "borrador",
  "emitida",
  "enviada",
  "pagada",
  "vencida",
  "anulada",
]);

export const rateUnit = pgEnum("rate_unit", [
  "contenedor",
  "bl",
  "kg",
  "cbm",
  "unidad",
  "plano",
]);

export const quotationStatus = pgEnum("quotation_status", [
  "borrador",
  "enviada",
  "aceptada",
  "rechazada",
  "expirada",
]);

export const opportunityStage = pgEnum("opportunity_stage", [
  "prospecto",
  "propuesta",
  "negociacion",
  "ganado",
  "perdido",
]);
