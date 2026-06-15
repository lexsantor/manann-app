"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, and, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import {
  flight,
  airManifest,
  airManifestEntry,
  transportOrder,
  routeTemplate,
  shipment,
} from "@/db/schema";
import { requireOrg } from "@/lib/auth-guards";

// ── Flights ───────────────────────────────────────────────────────────────────

export async function listFlights() {
  const orgId = await requireOrg();
  return db.query.flight.findMany({
    where: eq(flight.organizationId, orgId),
    orderBy: [desc(flight.departureDate)],
  });
}

export async function createFlight(data: {
  flightNumber: string;
  airline: string;
  originIata: string;
  destIata: string;
  departureDate: string;
  arrivalDate: string;
  aircraftType?: string;
  capacityKg?: number;
  availableKg?: number;
}) {
  const orgId = await requireOrg();
  await db.insert(flight).values({ ...data, organizationId: orgId });
  revalidatePath("/vuelos");
}

export async function deleteFlight(id: string) {
  const orgId = await requireOrg();
  await db.delete(flight).where(and(eq(flight.id, id), eq(flight.organizationId, orgId)));
  revalidatePath("/vuelos");
}

// ── Air Manifests ─────────────────────────────────────────────────────────────

export async function listAirManifests() {
  const orgId = await requireOrg();
  return db.query.airManifest.findMany({
    where: eq(airManifest.organizationId, orgId),
    orderBy: [desc(airManifest.createdAt)],
  });
}

export async function createAirManifest(data: {
  mawbNumber: string;
  originIata: string;
  destIata: string;
  carrier: string;
  flightId?: string;
}) {
  const orgId = await requireOrg();
  const [row] = await db
    .insert(airManifest)
    .values({ ...data, organizationId: orgId })
    .returning({ id: airManifest.id });
  revalidatePath("/manifiestos");
  return row.id;
}

export async function updateManifestStatus(id: string, status: string) {
  const orgId = await requireOrg();
  await db
    .update(airManifest)
    .set({ status })
    .where(and(eq(airManifest.id, id), eq(airManifest.organizationId, orgId)));
  revalidatePath("/manifiestos");
}

async function resolveManifest(manifestId: string, orgId: string) {
  const m = await db.query.airManifest.findFirst({
    where: and(eq(airManifest.id, manifestId), eq(airManifest.organizationId, orgId)),
  });
  if (!m) throw new Error("Manifiesto no encontrado");
  return m;
}

export async function listManifestEntries(manifestId: string) {
  const orgId = await requireOrg();
  await resolveManifest(manifestId, orgId);
  return db.query.airManifestEntry.findMany({
    where: eq(airManifestEntry.manifestId, manifestId),
  });
}

export async function addManifestEntry(data: {
  manifestId: string;
  hawbNumber: string;
  consignee?: string;
  pieces: number;
  weightKg: string;
  description?: string;
}) {
  const orgId = await requireOrg();
  await resolveManifest(data.manifestId, orgId);
  await db.insert(airManifestEntry).values(data);
  // update totals
  const entries = await db.query.airManifestEntry.findMany({
    where: eq(airManifestEntry.manifestId, data.manifestId),
  });
  const totalPieces = entries.reduce((s, e) => s + e.pieces, 0);
  const totalWeightKg = entries.reduce((s, e) => s + Number(e.weightKg), 0).toFixed(2);
  await db
    .update(airManifest)
    .set({ totalPieces, totalWeightKg })
    .where(and(eq(airManifest.id, data.manifestId), eq(airManifest.organizationId, orgId)));
  revalidatePath("/manifiestos");
}

export async function deleteManifestEntry(id: string, manifestId: string) {
  const orgId = await requireOrg();
  await resolveManifest(manifestId, orgId);
  await db
    .delete(airManifestEntry)
    .where(and(eq(airManifestEntry.id, id), eq(airManifestEntry.manifestId, manifestId)));
  const entries = await db.query.airManifestEntry.findMany({
    where: eq(airManifestEntry.manifestId, manifestId),
  });
  const totalPieces = entries.reduce((s, e) => s + e.pieces, 0);
  const totalWeightKg = entries.reduce((s, e) => s + Number(e.weightKg), 0).toFixed(2);
  await db
    .update(airManifest)
    .set({ totalPieces, totalWeightKg })
    .where(and(eq(airManifest.id, manifestId), eq(airManifest.organizationId, orgId)));
  revalidatePath("/manifiestos");
}

// ── Transport Orders ──────────────────────────────────────────────────────────

export async function listTransportOrders(q?: string) {
  const orgId = await requireOrg();
  const search = q
    ? or(
        ilike(transportOrder.reference, `%${q}%`),
        ilike(transportOrder.carrier, `%${q}%`),
        ilike(transportOrder.origin, `%${q}%`),
        ilike(transportOrder.destination, `%${q}%`),
      )
    : undefined;
  const filters = [eq(transportOrder.organizationId, orgId), ...(search ? [search] : [])];
  return db.query.transportOrder.findMany({
    where: and(...(filters as [typeof filters[0], ...typeof filters])),
    orderBy: [desc(transportOrder.createdAt)],
  });
}

export async function createTransportOrder(data: {
  reference: string;
  carrier: string;
  origin: string;
  destination: string;
  driverName?: string;
  licensePlate?: string;
  pickupDate?: string;
  deliveryDate?: string;
  notes?: string;
}) {
  const orgId = await requireOrg();
  await db.insert(transportOrder).values({ ...data, organizationId: orgId });
  revalidatePath("/ordenes-transporte");
}

export async function updateTransportOrderStatus(id: string, status: string) {
  const orgId = await requireOrg();
  await db
    .update(transportOrder)
    .set({ status })
    .where(and(eq(transportOrder.id, id), eq(transportOrder.organizationId, orgId)));
  revalidatePath("/ordenes-transporte");
}

export async function deleteTransportOrder(id: string) {
  const orgId = await requireOrg();
  await db
    .delete(transportOrder)
    .where(and(eq(transportOrder.id, id), eq(transportOrder.organizationId, orgId)));
  revalidatePath("/ordenes-transporte");
}

// ── Route Templates ───────────────────────────────────────────────────────────

export async function listRouteTemplates() {
  const orgId = await requireOrg();
  return db.query.routeTemplate.findMany({
    where: eq(routeTemplate.organizationId, orgId),
    orderBy: [desc(routeTemplate.createdAt)],
  });
}

export async function createRouteTemplate(data: {
  name: string;
  mode: string;
  transitDays?: number;
  legs?: unknown[];
}) {
  const orgId = await requireOrg();
  await db.insert(routeTemplate).values({
    organizationId: orgId,
    name: data.name,
    mode: data.mode as "maritimo" | "aereo" | "ferroviario" | "terrestre" | "multimodal",
    transitDays: data.transitDays,
    legs: data.legs ?? [],
  });
  revalidatePath("/rutas");
}

export async function deleteRouteTemplate(id: string) {
  const orgId = await requireOrg();
  await db
    .delete(routeTemplate)
    .where(and(eq(routeTemplate.id, id), eq(routeTemplate.organizationId, orgId)));
  revalidatePath("/rutas");
}

// ── Filtered Shipment Lists ───────────────────────────────────────────────────

export async function listShipmentsByMode(mode: string) {
  const orgId = await requireOrg();
  return db.query.shipment.findMany({
    where: and(eq(shipment.organizationId, orgId), eq(shipment.mode, mode as "maritimo" | "aereo" | "ferroviario" | "terrestre" | "multimodal")),
    columns: {
      id: true, reference: true, mode: true, status: true,
      pol: true, pod: true, carrier: true, eta: true, etd: true,
      blNumber: true, createdAt: true,
    },
    orderBy: [desc(shipment.createdAt)],
  });
}

export async function listLclShipments() {
  const orgId = await requireOrg();
  return db.query.shipment.findMany({
    where: and(eq(shipment.organizationId, orgId), eq(shipment.loadType, "lcl")),
    columns: {
      id: true, reference: true, mode: true, status: true,
      pol: true, pod: true, carrier: true, eta: true, etd: true,
      blNumber: true, loadType: true, createdAt: true,
    },
    orderBy: [desc(shipment.createdAt)],
  });
}
