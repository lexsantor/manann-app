// Cron job diario (08:00 UTC) — envía alertas de ETA a miembros de orgs
// cuando un expediente en tránsito llega en menos de 48 h.
// Vercel protege el endpoint con Authorization: Bearer <CRON_SECRET>.
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { and, eq, gte, lte, inArray, like } from "drizzle-orm";
import { db } from "@/db";
import { shipment, organization, member, user, notification } from "@/db/schema";
import { sendEtaAlertEmail } from "@/lib/email";

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

  const now = new Date();
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  // Expedientes en tránsito con ETA en las próximas 48 h
  const upcoming = await db
    .select({
      id: shipment.id,
      organizationId: shipment.organizationId,
      reference: shipment.reference,
      pol: shipment.pol,
      pod: shipment.pod,
      carrier: shipment.carrier,
      eta: shipment.eta,
    })
    .from(shipment)
    .where(
      and(
        inArray(shipment.status, ["en_transito", "confirmado"]),
        gte(shipment.eta, now),
        lte(shipment.eta, in48h),
      ),
    );

  if (upcoming.length === 0) {
    return NextResponse.json({ sent: 0, message: "Sin ETAs próximas" });
  }

  const appUrl = process.env.BETTER_AUTH_URL ?? "https://manann.app";
  let totalSent = 0;

  // Agrupar por org para enviar un único email por usuario con todos sus expedientes
  const byOrg = new Map<string, typeof upcoming>();
  for (const s of upcoming) {
    const list = byOrg.get(s.organizationId) ?? [];
    list.push(s);
    byOrg.set(s.organizationId, list);
  }

  for (const [orgId, shipments] of byOrg) {
    // Miembros de la org con email
    const members = await db
      .select({ userId: member.userId, name: user.name, email: user.email })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, orgId));

    for (const m of members) {
      if (!m.email) continue;

      // Filtrar expedientes que ya tienen alerta enviada hoy (dedup)
      const toSend: typeof shipments = [];
      for (const s of shipments) {
        const alreadySent = await db.query.notification.findFirst({
          where: and(
            eq(notification.organizationId, orgId),
            eq(notification.userId, m.userId),
            eq(notification.shipmentId, s.id),
            like(notification.message, "[ETA_ALERT]%"),
            gte(notification.createdAt, todayStart),
          ),
        });
        if (!alreadySent) toSend.push(s);
      }

      if (toSend.length === 0) continue;

      // Enviar email
      const etaShipments = toSend.map((s) => ({
        reference: s.reference,
        pol: s.pol,
        pod: s.pod,
        carrier: s.carrier,
        eta: new Date(s.eta!),
        url: `${appUrl}/expedientes/${s.id}`,
      }));

      await sendEtaAlertEmail(m.email, m.name ?? m.email, etaShipments).catch(
        (err) => console.error("[cron] sendEtaAlertEmail falló:", err),
      );

      // Crear notificaciones in-app (una por expediente)
      await db.insert(notification).values(
        toSend.map((s) => ({
          organizationId: orgId,
          userId: m.userId,
          shipmentId: s.id,
          shipmentReference: s.reference,
          message: `[ETA_ALERT] ${s.reference} llega el ${new Date(s.eta!).toLocaleDateString("es-ES")}`,
        })),
      );

      totalSent += toSend.length;
    }
  }

  return NextResponse.json({ sent: totalSent, checked: upcoming.length });
}
