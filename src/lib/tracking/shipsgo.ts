// Cliente ShipsGo — tracking real de contenedores.
// IMPORTANTE: cada subscribeContainer() consume 1 crédito (3 disponibles).
// Activar con SHIPSGO_ENABLED=true + SHIPSGO_API_KEY en .env.
// Docs: https://shipsgo.com/api-docs
const BASE_URL = "https://shipsgo.com/api/v2.1";
const API_KEY = process.env.SHIPSGO_API_KEY ?? "";

// Guard de créditos: requiere flag explícito + API key configurada.
export function isShipsGoEnabled(): boolean {
  return process.env.SHIPSGO_ENABLED === "true" && Boolean(API_KEY);
}

export interface ShipsGoEvent {
  eventCode: string; // e.g. "gate_in", "loaded", "departed"
  location: string;
  description: string;
  vessel?: string;
  occurredAt: string; // ISO 8601
}

export interface ShipsGoContainer {
  requestId: string;
  containerNumber: string;
  status: "active" | "finished" | "error";
  events: ShipsGoEvent[];
  lastPosition?: { lat: number; lng: number };
}

// Mapa de códigos ShipsGo → trackingEventType del schema
export const EVENT_CODE_MAP: Record<string, string> = {
  gate_in: "gate_in",
  loaded: "cargado",
  departed: "salida",
  transshipment: "en_transito",
  arrived: "llegada",
  discharged: "descargado",
  delivered: "entregado",
  customs: "aduana",
  booking: "booking",
};

export function mapEventCode(code: string): string {
  return EVENT_CODE_MAP[code.toLowerCase()] ?? "en_transito";
}

// Alta de contenedor — consume 1 crédito. Verificar respuesta antes de marcar como gastado.
export async function subscribeContainer(
  containerNumber: string,
  shippingLine: string,
): Promise<{ requestId: string } | { error: string }> {
  if (!API_KEY) return { error: "SHIPSGO_API_KEY no configurada" };

  const res = await fetch(`${BASE_URL}/track/container`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_KEY}` },
    body: JSON.stringify({ containerNumber, shippingLine }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { error: `ShipsGo error ${res.status}: ${body}` };
  }

  const data = await res.json();
  return { requestId: String(data.requestId ?? data.id ?? "") };
}

// Consulta de eventos de un contenedor ya suscrito
export async function fetchContainerEvents(
  requestId: string,
): Promise<ShipsGoContainer | { error: string }> {
  if (!API_KEY) return { error: "SHIPSGO_API_KEY no configurada" };

  const res = await fetch(`${BASE_URL}/track/container/${requestId}`, {
    headers: { "Authorization": `Bearer ${API_KEY}` },
    next: { revalidate: 0 }, // no cachear — el caller decide
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { error: `ShipsGo error ${res.status}: ${body}` };
  }

  const data = await res.json();

  const events: ShipsGoEvent[] = (data.events ?? []).map((e: Record<string, unknown>) => ({
    eventCode: String(e.eventCode ?? e.code ?? "en_transito"),
    location: String(e.location ?? e.unlocode ?? ""),
    description: String(e.description ?? e.eventDescription ?? ""),
    vessel: e.vessel ? String(e.vessel) : undefined,
    occurredAt: String(e.eventDate ?? e.date ?? new Date().toISOString()),
  }));

  return {
    requestId,
    containerNumber: String(data.containerNumber ?? ""),
    status: data.status === "finished" ? "finished" : data.status === "error" ? "error" : "active",
    events,
    lastPosition: data.latitude && data.longitude
      ? { lat: Number(data.latitude), lng: Number(data.longitude) }
      : undefined,
  };
}
