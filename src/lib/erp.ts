// Capa de datos del ERP. REGLA ANTI-IDOR: toda query se filtra por la org del
// usuario; nunca se confía en un id del cliente sin comprobar ownership.
import { cache } from "react";
import { and, desc, eq, asc } from "drizzle-orm";

import { db } from "@/db";
import { member, shipment, document } from "@/db/schema";
import { getCurrentSession } from "@/lib/session";

export type ActiveOrg = { id: string; name: string; slug: string };

// Contexto {sesión, org} cacheado por request: layout y páginas lo comparten
// sin repetir queries. Devuelve null si no hay sesión.
export const getOrgContext = cache(async () => {
  const session = await getCurrentSession();
  if (!session) return null;
  const org = await getActiveOrg(session.user.id);
  return { user: session.user, org };
});

// Org activa del usuario (en el demo, su primera/única membresía).
export async function getActiveOrg(userId: string): Promise<ActiveOrg | null> {
  const m = await db.query.member.findFirst({
    where: eq(member.userId, userId),
    with: { organization: true },
  });
  if (!m?.organization) return null;
  const o = m.organization;
  return { id: o.id, name: o.name, slug: o.slug };
}

// Lista de expedientes de una org, con sus partes (para derivar consignatario).
export async function listShipments(orgId: string) {
  return db.query.shipment.findMany({
    where: eq(shipment.organizationId, orgId),
    with: { parties: true },
    orderBy: [desc(shipment.createdAt)],
  });
}

export type ShipmentListItem = Awaited<ReturnType<typeof listShipments>>[number];

// Detalle completo de UN expediente, comprobando que pertenece a la org.
export async function getShipmentDetail(orgId: string, shipmentId: string) {
  return db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, orgId)),
    with: {
      parties: true,
      containers: { with: { cargoLines: true } },
      cargoLines: true,
      documents: true,
      charges: true,
      trackingEvents: { orderBy: (t) => [desc(t.occurredAt)] },
    },
  });
}

export type ShipmentDetail = NonNullable<
  Awaited<ReturnType<typeof getShipmentDetail>>
>;

// ¿Este expediente pertenece a esta org? (chequeo de ownership barato para
// autorizar subidas/acciones sin traer el detalle completo).
export async function shipmentBelongsToOrg(
  orgId: string,
  shipmentId: string,
): Promise<boolean> {
  const row = await db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, orgId)),
    columns: { id: true },
  });
  return Boolean(row);
}

// Documento + su expediente, solo si el expediente es de la org (ownership).
export async function getOwnedDocument(orgId: string, documentId: string) {
  const doc = await db.query.document.findFirst({
    where: eq(document.id, documentId),
    with: {
      shipment: { columns: { id: true, organizationId: true } },
    },
  });
  if (!doc || doc.shipment.organizationId !== orgId) return null;
  return doc;
}

// KPIs del dashboard, derivados de la lista (volumen pequeño en el demo).
export type DashboardStats = {
  total: number;
  enTransito: number;
  enAduana: number;
  entregados: number;
  porEstado: Record<string, number>;
};

export function computeStats(items: ShipmentListItem[]): DashboardStats {
  const porEstado: Record<string, number> = {};
  for (const s of items) porEstado[s.status] = (porEstado[s.status] ?? 0) + 1;
  return {
    total: items.length,
    enTransito: porEstado["en_transito"] ?? 0,
    enAduana: porEstado["en_aduana"] ?? 0,
    entregados: porEstado["entregado"] ?? 0,
    porEstado,
  };
}

// Reexport de utilidades de orden por si una vista las necesita.
export { asc };
