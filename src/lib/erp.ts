// Capa de datos del ERP. REGLA ANTI-IDOR: toda query se filtra por la org del
// usuario; nunca se confía en un id del cliente sin comprobar ownership.
import { cache } from "react";
import { and, count, desc, eq, asc, or, ilike, gte, lt, sql } from "drizzle-orm";

import { db } from "@/db";
import { member, organization, party, shipment, document, fieldChange, trackingSubscription, invoice, rate, quotation, comment, user, contact, charge, opportunity } from "@/db/schema";
import { getCurrentSession } from "@/lib/session";

export type ActiveOrg = { id: string; name: string; slug: string; memberId: string; onboarded: boolean };

// Contexto {sesión, org} cacheado por request: layout y páginas lo comparten
// sin repetir queries. Devuelve null si no hay sesión.
export const getOrgContext = cache(async () => {
  const session = await getCurrentSession();
  if (!session) return null;
  const org = await getActiveOrg(session.user.id);
  return { user: session.user, org };
});

// Todas las orgs del usuario (para multi-org switcher).
export async function getUserOrgs(userId: string) {
  const memberships = await db
    .select({
      memberId: member.id,
      role: member.role,
      onboarded: member.onboarded,
      orgId: organization.id,
      orgName: organization.name,
      orgSlug: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))
    .orderBy(organization.name);
  return memberships;
}

// Org activa del usuario: respeta cookie `activeOrgId`; cae en la primera membresía.
export async function getActiveOrg(userId: string): Promise<ActiveOrg | null> {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const activeOrgId = jar.get("activeOrgId")?.value;

  const memberships = await getUserOrgs(userId);
  if (memberships.length === 0) return null;

  const preferred = activeOrgId
    ? memberships.find((m) => m.orgId === activeOrgId)
    : undefined;
  const m = preferred ?? memberships[0];

  return {
    id: m.orgId,
    name: m.orgName,
    slug: m.orgSlug,
    memberId: m.memberId,
    onboarded: m.onboarded ?? false,
  };
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
    with: {
      parties: true,
      charges: {
        columns: { id: true, type: true, description: true, amount: true, buyAmount: true, accrualAmount: true, currency: true, direction: true, atRisk: true, passThrough: true },
      },
    },
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
      documents: {
        where: (d, { notInArray }) => notInArray(d.status, ["processing", "error"]),
        columns: { id: true, filename: true, type: true, blobUrl: true, mimeType: true, createdAt: true },
      },
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

export type OperationalStats = {
  avgTransitDays: number | null;
  onTimeRate: number | null;
  topCarriers: { carrier: string; count: number }[];
  byMode: { mode: string; count: number }[];
};

const MODE_LABELS: Record<string, string> = {
  maritimo: "Marítimo",
  aereo: "Aéreo",
  terrestre: "Terrestre",
  ferroviario: "Ferroviario",
  multimodal: "Multimodal",
};

export function computeOperationalStats(items: ShipmentListItem[]): OperationalStats {
  const now = Date.now();

  // Transit time: avg days between etd and eta for shipments that have both
  const withDates = items.filter((s) => s.etd && s.eta);
  const avgTransitDays =
    withDates.length > 0
      ? Math.round(
          withDates.reduce(
            (sum, s) =>
              sum +
              (new Date(s.eta!).getTime() - new Date(s.etd!).getTime()) /
                (1000 * 60 * 60 * 24),
            0,
          ) / withDates.length,
        )
      : null;

  // On-time rate: % of non-terminal shipments with ETA still in the future (or no ETA set ignored)
  const nonTerminal = items.filter(
    (s) => s.status !== "entregado" && s.status !== "cerrado" && s.status !== "borrador",
  );
  const withEta = nonTerminal.filter((s) => s.eta);
  const onTimeRate =
    withEta.length > 0
      ? Math.round((withEta.filter((s) => new Date(s.eta!).getTime() >= now).length / withEta.length) * 100)
      : null;

  // Top carriers
  const carrierCount: Record<string, number> = {};
  for (const s of items) {
    if (s.carrier) carrierCount[s.carrier] = (carrierCount[s.carrier] ?? 0) + 1;
  }
  const topCarriers = Object.entries(carrierCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([carrier, count]) => ({ carrier, count }));

  // By mode
  const modeCount: Record<string, number> = {};
  for (const s of items) {
    if (s.mode) modeCount[s.mode] = (modeCount[s.mode] ?? 0) + 1;
  }
  const byMode = Object.entries(modeCount)
    .sort(([, a], [, b]) => b - a)
    .map(([mode, count]) => ({ mode: MODE_LABELS[mode] ?? mode, count }));

  return { avgTransitDays, onTimeRate, topCarriers, byMode };
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

export async function listMasterContacts(orgId: string) {
  return db
    .select()
    .from(contact)
    .where(eq(contact.organizationId, orgId))
    .orderBy(asc(contact.name));
}

export async function getContactById(id: string, orgId: string) {
  const rows = await db
    .select()
    .from(contact)
    .where(and(eq(contact.id, id), eq(contact.organizationId, orgId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getContactHistory(contactName: string, orgId: string) {
  return db
    .select({
      id: shipment.id,
      reference: shipment.reference,
      status: shipment.status,
      pol: shipment.pol,
      pod: shipment.pod,
      eta: shipment.eta,
      createdAt: shipment.createdAt,
      gp: sql<number>`COALESCE(
        SUM(CASE WHEN ${charge.direction} = 'revenue' THEN ${charge.amount}::numeric ELSE 0 END) -
        SUM(CASE WHEN ${charge.direction} = 'cost'   THEN ${charge.amount}::numeric ELSE 0 END),
        0
      )`,
    })
    .from(shipment)
    .innerJoin(party, and(eq(party.shipmentId, shipment.id), eq(party.name, contactName)))
    .leftJoin(charge, eq(charge.shipmentId, shipment.id))
    .where(eq(shipment.organizationId, orgId))
    .groupBy(shipment.id, shipment.reference, shipment.status, shipment.pol, shipment.pod, shipment.eta, shipment.createdAt)
    .orderBy(desc(shipment.createdAt))
    .limit(10);
}

export async function getContactGPStats(contactName: string, orgId: string) {
  const rows = await db
    .select({
      totalExpedientes: count(sql`DISTINCT ${shipment.id}`),
      totalGP: sql<number>`COALESCE(
        SUM(CASE WHEN ${charge.direction} = 'revenue' THEN ${charge.amount}::numeric ELSE 0 END) -
        SUM(CASE WHEN ${charge.direction} = 'cost'   THEN ${charge.amount}::numeric ELSE 0 END),
        0
      )`,
      totalRevenue: sql<number>`COALESCE(
        SUM(CASE WHEN ${charge.direction} = 'revenue' THEN ${charge.amount}::numeric ELSE 0 END),
        0
      )`,
    })
    .from(shipment)
    .innerJoin(party, and(eq(party.shipmentId, shipment.id), eq(party.name, contactName)))
    .leftJoin(charge, eq(charge.shipmentId, shipment.id))
    .where(eq(shipment.organizationId, orgId));
  return rows[0] ?? { totalExpedientes: 0, totalGP: 0, totalRevenue: 0 };
}

export async function searchContacts(orgId: string, q: string) {
  return db
    .select({ id: contact.id, name: contact.name, role: contact.role, taxId: contact.taxId })
    .from(contact)
    .where(and(eq(contact.organizationId, orgId), eq(contact.active, true), ilike(contact.name, `%${q}%`)))
    .orderBy(asc(contact.name))
    .limit(10);
}

export async function importContactsFromParties(orgId: string) {
  const parties = await db
    .select({ name: party.name, role: party.role, taxId: party.taxId, city: party.city, country: party.country })
    .from(party)
    .innerJoin(shipment, eq(party.shipmentId, shipment.id))
    .where(eq(shipment.organizationId, orgId))
    .groupBy(party.name, party.role, party.taxId, party.city, party.country);

  const existing = await db
    .select({ name: contact.name, role: contact.role })
    .from(contact)
    .where(eq(contact.organizationId, orgId));

  const existingKeys = new Set(existing.map((e) => `${e.name}::${e.role}`));
  const toCreate = parties.filter((p) => !existingKeys.has(`${p.name}::${p.role}`));
  if (toCreate.length === 0) return { created: 0 };

  await db.insert(contact).values(
    toCreate.map((p) => ({
      organizationId: orgId,
      name: p.name,
      role: p.role,
      taxId: p.taxId ?? null,
      city: p.city ?? null,
      country: p.country ?? null,
    })),
  );
  return { created: toCreate.length };
}

export type MasterContact = Awaited<ReturnType<typeof listMasterContacts>>[number];

export async function listContactsWithGP(orgId: string) {
  const [contacts, gpRows] = await Promise.all([
    db.select().from(contact).where(eq(contact.organizationId, orgId)).orderBy(asc(contact.name)),
    db
      .select({
        name: party.name,
        totalGP: sql<number>`COALESCE(
          SUM(CASE WHEN ${charge.direction} = 'revenue' THEN ${charge.amount}::numeric ELSE 0 END) -
          SUM(CASE WHEN ${charge.direction} = 'cost'   THEN ${charge.amount}::numeric ELSE 0 END), 0)`,
        expedientes: count(sql`DISTINCT ${shipment.id}`),
      })
      .from(party)
      .innerJoin(shipment, eq(party.shipmentId, shipment.id))
      .leftJoin(charge, eq(charge.shipmentId, shipment.id))
      .where(eq(shipment.organizationId, orgId))
      .groupBy(party.name),
  ]);
  const gpMap = new Map(gpRows.map((r) => [r.name, r]));
  return contacts.map((c) => ({
    ...c,
    totalGP: gpMap.get(c.name)?.totalGP ?? 0,
    expedientes: gpMap.get(c.name)?.expedientes ?? 0,
  }));
}

export type ContactWithGP = Awaited<ReturnType<typeof listContactsWithGP>>[number];

// ─── Analítica / Reportes (Tier F) ────────────────────────────────────────────

export async function getMonthlyGP(orgId: string, months = 12) {
  return db
    .select({
      month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${shipment.createdAt}), 'YYYY-MM')`,
      gp: sql<number>`COALESCE(
        SUM(CASE WHEN ${charge.direction} = 'revenue' THEN ${charge.amount}::numeric ELSE 0 END) -
        SUM(CASE WHEN ${charge.direction} = 'cost'   THEN ${charge.amount}::numeric ELSE 0 END), 0)`,
      revenue: sql<number>`COALESCE(
        SUM(CASE WHEN ${charge.direction} = 'revenue' THEN ${charge.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(shipment)
    .leftJoin(charge, eq(charge.shipmentId, shipment.id))
    .where(
      and(
        eq(shipment.organizationId, orgId),
        gte(shipment.createdAt, sql`NOW() - INTERVAL '${sql.raw(String(months))} months'`),
      ),
    )
    .groupBy(sql`DATE_TRUNC('month', ${shipment.createdAt})`)
    .orderBy(sql`DATE_TRUNC('month', ${shipment.createdAt})`);
}

export async function getTopClientsByGP(orgId: string, dateFrom: Date, limit = 10) {
  return db
    .select({
      name: party.name,
      shipments: count(sql`DISTINCT ${shipment.id}`),
      revenue: sql<number>`COALESCE(SUM(CASE WHEN ${charge.direction} = 'revenue' THEN ${charge.amount}::numeric ELSE 0 END), 0)`,
      gp: sql<number>`COALESCE(
        SUM(CASE WHEN ${charge.direction} = 'revenue' THEN ${charge.amount}::numeric ELSE 0 END) -
        SUM(CASE WHEN ${charge.direction} = 'cost'   THEN ${charge.amount}::numeric ELSE 0 END), 0)`,
    })
    .from(party)
    .innerJoin(shipment, and(eq(shipment.id, party.shipmentId), eq(shipment.organizationId, orgId), gte(shipment.createdAt, dateFrom)))
    .leftJoin(charge, eq(charge.shipmentId, shipment.id))
    .where(eq(party.role, "consignee"))
    .groupBy(party.name)
    .orderBy(sql`gp DESC`)
    .limit(limit);
}

export async function getShipmentsByMode(orgId: string, dateFrom: Date) {
  return db
    .select({
      mode: shipment.mode,
      total: count(shipment.id),
    })
    .from(shipment)
    .where(and(eq(shipment.organizationId, orgId), gte(shipment.createdAt, dateFrom)))
    .groupBy(shipment.mode)
    .orderBy(desc(count(shipment.id)));
}

export async function getTopRoutes(orgId: string, dateFrom: Date, limit = 8) {
  return db
    .select({
      pol: shipment.pol,
      pod: shipment.pod,
      total: count(shipment.id),
    })
    .from(shipment)
    .where(and(eq(shipment.organizationId, orgId), gte(shipment.createdAt, dateFrom)))
    .groupBy(shipment.pol, shipment.pod)
    .orderBy(desc(count(shipment.id)))
    .limit(limit);
}

export async function getCarrierKPIs(orgId: string, dateFrom: Date, limit = 8) {
  return db
    .select({
      carrier: shipment.carrier,
      total: count(shipment.id),
      avgTransitDays: sql<number>`ROUND(AVG(EXTRACT(DAY FROM (${shipment.eta} - ${shipment.etd}))), 1)`,
      delayed: sql<number>`SUM(CASE WHEN ${shipment.eta} < NOW() AND ${shipment.status} NOT IN ('entregado','facturado','cerrado') THEN 1 ELSE 0 END)`,
    })
    .from(shipment)
    .where(
      and(
        eq(shipment.organizationId, orgId),
        gte(shipment.createdAt, dateFrom),
        sql`${shipment.carrier} IS NOT NULL`,
        sql`${shipment.etd} IS NOT NULL`,
        sql`${shipment.eta} IS NOT NULL`,
      ),
    )
    .groupBy(shipment.carrier)
    .orderBy(desc(count(shipment.id)))
    .limit(limit);
}

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

export async function getRateAverages(orgId: string): Promise<Record<string, { avg: number; count: number }>> {
  const rows = await db
    .select({
      serviceType: rate.serviceType,
      avgPrice: sql<string>`avg(${rate.basePrice})::text`,
      cnt: count(),
    })
    .from(rate)
    .where(and(eq(rate.organizationId, orgId), eq(rate.active, true)))
    .groupBy(rate.serviceType);

  const result: Record<string, { avg: number; count: number }> = {};
  for (const r of rows) {
    result[r.serviceType] = { avg: Number(r.avgPrice), count: r.cnt };
  }
  return result;
}

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

// ─── Comentarios ─────────────────────────────────────────────────────────────

export async function getShipmentComments(orgId: string, shipmentId: string) {
  const owned = await shipmentBelongsToOrg(orgId, shipmentId);
  if (!owned) return [];
  return db
    .select({
      id: comment.id,
      body: comment.body,
      mentions: comment.mentions,
      createdAt: comment.createdAt,
      authorId: comment.authorId,
      authorUserId: member.userId,
      authorName: user.name,
    })
    .from(comment)
    .innerJoin(member, eq(comment.authorId, member.id))
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(comment.shipmentId, shipmentId))
    .orderBy(asc(comment.createdAt));
}

export type ShipmentComment = Awaited<ReturnType<typeof getShipmentComments>>[number];

// ── Oportunidades (CRM Pipeline) ──────────────────────────────────────────────

export async function listOpportunities(orgId: string) {
  return db
    .select({
      id: opportunity.id,
      title: opportunity.title,
      stage: opportunity.stage,
      mode: opportunity.mode,
      pol: opportunity.pol,
      pod: opportunity.pod,
      cargoType: opportunity.cargoType,
      estimatedValue: opportunity.estimatedValue,
      currency: opportunity.currency,
      notes: opportunity.notes,
      closedAt: opportunity.closedAt,
      createdAt: opportunity.createdAt,
      contactId: opportunity.contactId,
      contactName: contact.name,
    })
    .from(opportunity)
    .leftJoin(contact, eq(opportunity.contactId, contact.id))
    .where(eq(opportunity.organizationId, orgId))
    .orderBy(asc(opportunity.createdAt));
}

export type OpportunityRow = Awaited<ReturnType<typeof listOpportunities>>[number];

export async function getOpportunityStats(orgId: string) {
  const rows = await db
    .select({
      stage: opportunity.stage,
      cnt: count(),
      total: sql<string>`coalesce(sum(${opportunity.estimatedValue}), 0)`,
    })
    .from(opportunity)
    .where(eq(opportunity.organizationId, orgId))
    .groupBy(opportunity.stage);

  const map: Record<string, { count: number; total: number }> = {};
  for (const r of rows) map[r.stage] = { count: r.cnt, total: Number(r.total) };
  return map;
}
