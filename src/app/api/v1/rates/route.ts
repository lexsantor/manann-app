import { NextRequest } from "next/server";
import { validateApiKey, apiError } from "@/lib/api-auth";
import { db } from "@/db";
import { rate } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const orgId = await validateApiKey(req);
  if (!orgId) return apiError("API key inválida o ausente", 401);

  const rows = await db
    .select()
    .from(rate)
    .where(and(eq(rate.organizationId, orgId), eq(rate.active, true)));

  return Response.json({ data: rows, count: rows.length });
}
