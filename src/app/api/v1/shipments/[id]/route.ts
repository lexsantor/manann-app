import { NextRequest } from "next/server";
import { validateApiKey, apiError } from "@/lib/api-auth";
import { db } from "@/db";
import { shipment, document, charge } from "@/db/schema";
import { and, eq } from "drizzle-orm";

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const orgId = await validateApiKey(req);
  if (!orgId) return apiError("API key inválida o ausente", 401);

  const { id } = await params;

  const [row] = await db
    .select()
    .from(shipment)
    .where(and(eq(shipment.id, id), eq(shipment.organizationId, orgId)));

  if (!row) return apiError("Expediente no encontrado", 404);

  const [docs, charges] = await Promise.all([
    db.select({ id: document.id, type: document.type, filename: document.filename, createdAt: document.createdAt })
      .from(document).where(eq(document.shipmentId, id)),
    db.select({ id: charge.id, description: charge.description, amount: charge.amount, currency: charge.currency, direction: charge.direction })
      .from(charge).where(eq(charge.shipmentId, id)),
  ]);

  return Response.json({ data: { ...row, documents: docs, charges } });
}
