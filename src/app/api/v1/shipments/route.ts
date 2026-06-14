import { NextRequest } from "next/server";
import { validateApiKey, apiError } from "@/lib/api-auth";
import { db } from "@/db";
import { shipment } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const orgId = await validateApiKey(req);
  if (!orgId) return apiError("API key inválida o ausente", 401);

  const status = req.nextUrl.searchParams.get("status");
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "50"), 100);

  const conditions = [eq(shipment.organizationId, orgId)];
  if (status) conditions.push(eq(shipment.status, status as never));

  const rows = await db
    .select({
      id: shipment.id,
      reference: shipment.reference,
      status: shipment.status,
      mode: shipment.mode,
      carrier: shipment.carrier,
      pol: shipment.pol,
      pod: shipment.pod,
      etd: shipment.etd,
      eta: shipment.eta,
      createdAt: shipment.createdAt,
    })
    .from(shipment)
    .where(and(...conditions))
    .orderBy(desc(shipment.createdAt))
    .limit(limit);

  return Response.json({ data: rows, count: rows.length });
}
