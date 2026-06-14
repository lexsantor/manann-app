import { NextRequest } from "next/server";
import { validateApiKey, apiError } from "@/lib/api-auth";
import { db } from "@/db";
import { shipment } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface Params { params: Promise<{ reference: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const orgId = await validateApiKey(req);
  if (!orgId) return apiError("API key inválida o ausente", 401);

  const { reference } = await params;

  const [row] = await db
    .select()
    .from(shipment)
    .where(and(eq(shipment.reference, reference), eq(shipment.organizationId, orgId)));

  if (!row) return apiError("Expediente no encontrado", 404);

  // Build DCSA T&T Phase 2 structured response from shipment data
  const events = [];
  if (row.etd) {
    events.push({
      eventID: `${row.id}-etd`,
      eventType: "TRANSPORT",
      eventClassifierCode: row.status === "en_transito" || row.status === "entregado" ? "ACT" : "EST",
      eventDateTime: row.etd.toISOString(),
      description: "Salida del puerto de origen",
      location: row.pol ? { locationName: row.pol } : undefined,
    });
  }
  if (row.eta) {
    events.push({
      eventID: `${row.id}-eta`,
      eventType: "TRANSPORT",
      eventClassifierCode: row.status === "entregado" ? "ACT" : "EST",
      eventDateTime: row.eta.toISOString(),
      description: "Llegada al puerto de destino",
      location: row.pod ? { locationName: row.pod } : undefined,
    });
  }

  return Response.json({
    transportDocumentReference: reference,
    carrierServiceName: row.carrier,
    portOfLoading: row.pol,
    portOfDischarge: row.pod,
    estimatedTimeOfDeparture: row.etd,
    estimatedTimeOfArrival: row.eta,
    status: row.status,
    events,
    _standard: "DCSA-T&T-Phase2",
    _note: "Simulación — integración DCSA real en producción",
  });
}
