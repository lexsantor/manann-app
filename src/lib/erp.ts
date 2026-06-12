// Capa de datos del ERP. REGLA ANTI-IDOR: toda query se filtra por la org del
// usuario; nunca se confía en un id del cliente sin comprobar ownership.
import { cache } from "react";
import { and, count, desc, eq, asc, or, ilike, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { member, party, shipment, document, fieldChange, trackingSubscription, invoice, rate, quotation } from "@/db/schema";
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
export async function listShipments(
  orgId: string,
  q?: string,
  assignedToMemberId?: string,
) {
  const search = q
    ? or(
        ilike(shipment.reference, `%${q}%`),
        ilike(shipment.carrier, `%${q}%`),
        ilike(shipment.pol, `%${q}%`),
        ilike(shipment.pod, `%${q}%`),
        ilike(shipment.blNumber, `%${q}%`),
      )
    : undefined;

  const filters = [
    eq(shipment.organizationId, orgId),
    ...(search ? [search] : []),
    ...(assignedToMemberId ? [eq(shipment.assignedTo, assignedToMemberId)] : []),
  ];

  return db.query.shipment.findMany({
    where: and(...(filters as [typeof filters[0], ...typeof filters])),
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

// Vista pública de expediente por token (sin auth de org).
export async function getShipmentByToken(token: string) {
  return db.query.shipment.findFirst({
    where: eq(shipment.shareToken, token),
    with: {
      parties: true,
      containers: { with: { cargoLines: true } },
      trackingEvents: { orderBy: (t) => [desc(t.occurredAt)] },
    },
  });
}

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

// Historial de cambios del expediente (3.3)
export async function getShipmentActivity(orgId: string, shipmentId: string) {
  // Confirmar ownership antes de exponer historial.
  const owned = await shipmentBelongsToOrg(orgId, shipmentId);
  if (!owned) return [];

  return db
    .select({
      id: fieldChange.id,
      entity: fieldChange.entity,
      field: fieldChange.field,
      oldValue: fieldChange.oldValue,
      newValue: fieldChange.newValue,
      source: fieldChange.source,
      changedAt: fieldChange.changedAt,
      changedBy: fieldChange.changedBy,
    })
    .from(fieldChange)
    .where(eq(fieldChange.shipmentId, shipmentId))
    .orderBy(desc(fieldChange.changedAt))
    .limit(200);
}

// Miembros de la org para el selector de asignado (3.5)
export async function getOrgMembers(orgId: string) {
  const rows = await db.query.member.findMany({
    where: eq(member.organizationId, orgId),
    with: { user: { columns: { id: true, name: true, email: true } } },
  });
  return rows.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.user?.name ?? m.user?.email ?? "Usuario",
    email: m.user?.email ?? "",
    initials: ((m.user?.name ?? m.user?.email ?? "?")
      .split(/\s+/)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)),
  }));
}

// member.id del usuario activo en la org (para auditoría)
export async function getActiveMemberId(orgId: string, userId: string): Promise<string | null> {
  const m = await db.query.member.findFirst({
    where: and(eq(member.organizationId, orgId), eq(member.userId, userId)),
    columns: { id: true },
  });
  return m?.id ?? null;
}

// Suscripciones de tracking del expediente (3.1)
export async function getTrackingSubscriptions(orgId: string, shipmentId: string) {
  const owned = await shipmentBelongsToOrg(orgId, shipmentId);
  if (!owned) return [];
  return db
    .select()
    .from(trackingSubscription)
    .where(eq(trackingSubscription.shipmentId, shipmentId));
}

// Expedientes con ETA dentro de un mes (para calendario 3.4)
export async function getCalendarShipments(orgId: string, year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return db.query.shipment.findMany({
    where: and(
      eq(shipment.organizationId, orgId),
      gte(shipment.eta, start),
      lt(shipment.eta, end),
    ),
    columns: {
      id: true,
      reference: true,
      status: true,
      pol: true,
      pod: true,
      carrier: true,
      eta: true,
    },
    orderBy: [asc(shipment.eta)],
  });
}

// Reexport de utilidades de orden por si una vista las necesita.
export { asc };

// ─── Documentos ──────────────────────────────────────────────────────────────

export async function listDocuments(orgId: string) {
  return db
    .select({
      id: document.id,
      filename: document.filename,
      type: document.type,
      status: document.status,
      sizeBytes: document.sizeBytes,
      blobUrl: document.blobUrl,
      aiConfidence: document.aiConfidence,
      createdAt: document.createdAt,
      shipmentId: document.shipmentId,
      reference: shipment.reference,
      shipmentStatus: shipment.status,
      pol: shipment.pol,
      pod: shipment.pod,
    })
    .from(document)
    .innerJoin(shipment, eq(document.shipmentId, shipment.id))
    .where(eq(shipment.organizationId, orgId))
    .orderBy(desc(document.createdAt));
}

// ─── Contactos ───────────────────────────────────────────────────────────────

export async function listContacts(orgId: string) {
  const rows = await db
    .select({
      name: party.name,
      role: party.role,
      taxId: party.taxId,
      city: party.city,
      country: party.country,
      expedientes: count(party.id),
    })
    .from(party)
    .innerJoin(shipment, eq(party.shipmentId, shipment.id))
    .where(eq(shipment.organizationId, orgId))
    .groupBy(party.name, party.role, party.taxId, party.city, party.country)
    .orderBy(desc(count(party.id)));
  return rows;
}

export type ContactItem = Awaited<ReturnType<typeof listContacts>>[number];
export type DocumentItem = Awaited<ReturnType<typeof listDocuments>>[number];

// ─── Facturas ────────────────────────────────────────────────────────────────

export async function listInvoices(orgId: string) {
  return db
    .select({
      id: invoice.id,
      reference: invoice.reference,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      total: invoice.total,
      currency: invoice.currency,
      shipmentId: invoice.shipmentId,
      shipmentRef: shipment.reference,
    })
    .from(invoice)
    .innerJoin(shipment, eq(invoice.shipmentId, shipment.id))
    .where(eq(shipment.organizationId, orgId))
    .orderBy(desc(invoice.createdAt));
}

export async function countOrgInvoices(orgId: string): Promise<number> {
  const [row] = await db
    .select({ n: count(invoice.id) })
    .from(invoice)
    .innerJoin(shipment, eq(invoice.shipmentId, shipment.id))
    .where(eq(shipment.organizationId, orgId));
  return row?.n ?? 0;
}

export async function getInvoiceDetail(orgId: string, invoiceId: string) {
  const row = await db.query.invoice.findFirst({
    where: eq(invoice.id, invoiceId),
    with: {
      lines: { orderBy: (l) => [asc(l.sortOrder)] },
      shipment: {
        columns: { id: true, reference: true, organizationId: true },
        with: { parties: true },
      },
    },
  });
  if (!row || row.shipment.organizationId !== orgId) return null;
  return row;
}

export type InvoiceItem = Awaited<ReturnType<typeof listInvoices>>[number];
export type InvoiceDetail = NonNullable<Awaited<ReturnType<typeof getInvoiceDetail>>>;

// ─── Tarifas ──────────────────────────────────────────────────────────────────

export async function listRates(orgId: string) {
  return db
    .select()
    .from(rate)
    .where(eq(rate.organizationId, orgId))
    .orderBy(desc(rate.createdAt));
}

export type RateItem = Awaited<ReturnType<typeof listRates>>[number];

// ─── Cotizaciones ─────────────────────────────────────────────────────────────

export async function listQuotations(orgId: string) {
  return db
    .select()
    .from(quotation)
    .where(eq(quotation.organizationId, orgId))
    .orderBy(desc(quotation.createdAt));
}

export async function countOrgQuotations(orgId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(quotation)
    .where(eq(quotation.organizationId, orgId));
  return row?.n ?? 0;
}

export async function getQuotationDetail(orgId: string, quotationId: string) {
  const row = await db.query.quotation.findFirst({
    where: eq(quotation.id, quotationId),
    with: { lines: { orderBy: (l, { asc }) => [asc(l.sortOrder)] } },
  });
  if (!row || row.organizationId !== orgId) return null;
  return row;
}

export type QuotationItem = Awaited<ReturnType<typeof listQuotations>>[number];
export type QuotationDetail = NonNullable<Awaited<ReturnType<typeof getQuotationDetail>>>;
