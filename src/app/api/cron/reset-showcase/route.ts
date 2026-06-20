// Cron de auto-reset del showcase de demo (rearma el flujo wow al inicio del día).
// Vercel protege el endpoint con Authorization: Bearer <CRON_SECRET>.
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { shipment } from "@/db/schema";
import { WOW_SHOWCASE_REF, resetShowcaseShipment } from "@/lib/showcase";

export const runtime = "nodejs";
export const maxDuration = 60;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const rows = await db
    .select({ id: shipment.id })
    .from(shipment)
    .where(eq(shipment.reference, WOW_SHOWCASE_REF));

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, reason: "showcase no encontrado" });
  }

  for (const r of rows) {
    await resetShowcaseShipment(r.id);
  }

  return NextResponse.json({ ok: true, reset: rows.length, reference: WOW_SHOWCASE_REF });
}
