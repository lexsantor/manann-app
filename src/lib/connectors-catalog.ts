// Catálogo estático de integraciones. El estado de conexión por organización
// vive en la tabla `connector`. Los marcados `real` están operativos de verdad
// (vía env/SDK); el resto se conectan de forma simulada (config mock).
export type ConnectorDef = {
  key: string;
  name: string;
  category: string;
  description: string;
  real?: boolean;
};

export const CONNECTORS: ConnectorDef[] = [
  { key: "shipsgo", name: "ShipsGo", category: "Tracking", description: "Seguimiento de contenedores en tiempo real.", real: true },
  { key: "gemini", name: "Google Gemini", category: "IA documental", description: "Extracción de BL/AWB/CMR con IA.", real: true },
  { key: "resend", name: "Email (Resend)", category: "Comunicación", description: "Envío de emails transaccionales.", real: true },
  { key: "aeat", name: "AEAT", category: "Aduanas", description: "Presentación de DUA, ENS, NCTS y AES." },
  { key: "sage", name: "Sage", category: "Contabilidad", description: "Sincronización de asientos y facturas." },
  { key: "holded", name: "Holded", category: "Contabilidad", description: "ERP y contabilidad en la nube." },
  { key: "quickbooks", name: "QuickBooks", category: "Contabilidad", description: "Contabilidad internacional." },
  { key: "msc", name: "MSC", category: "Navieras", description: "EDI y bookings con MSC." },
  { key: "maersk", name: "Maersk", category: "Navieras", description: "EDI y bookings con Maersk." },
  { key: "cmacgm", name: "CMA CGM", category: "Navieras", description: "EDI y bookings con CMA CGM." },
  { key: "whatsapp", name: "WhatsApp Business", category: "Comunicación", description: "Notificaciones por WhatsApp." },
];

export const CONNECTOR_KEYS = CONNECTORS.map((c) => c.key);
