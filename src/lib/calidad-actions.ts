"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { incident, nonConformity, slaDefinition, shipment } from "@/db/schema";
import { requireOrg } from "@/lib/auth-guards";

// ── Incidencias ───────────────────────────────────────────────────────────────

export async function listIncidents() {
  const orgId = await requireOrg();
  return db.query.incident.findMany({
    where: eq(incident.organizationId, orgId),
    orderBy: [desc(incident.createdAt)],
  });
}

export async function createIncident(data: {
  shipmentId?: string;
  type: string;
  description: string;
  responsible?: string;
  impactCost?: number;
}) {
  const orgId = await requireOrg();

  if (data.shipmentId) {
    const s = await db.query.shipment.findFirst({
      where: and(eq(shipment.id, data.shipmentId), eq(shipment.organizationId, orgId)),
      columns: { id: true },
    });
    if (!s) throw new Error("Expediente no encontrado");
  }

  await db.insert(incident).values({
    organizationId: orgId,
    shipmentId: data.shipmentId ?? null,
    type: data.type,
    description: data.description,
    responsible: data.responsible ?? null,
    impactCost: data.impactCost != null ? String(data.impactCost) : null,
  });
  revalidatePath("/calidad/incidencias");
}

export async function updateIncidentStatus(
  id: string,
  status: string,
  resolutionDate?: string,
) {
  const orgId = await requireOrg();
  await db
    .update(incident)
    .set({ status, resolutionDate: resolutionDate ?? null })
    .where(and(eq(incident.id, id), eq(incident.organizationId, orgId)));
  revalidatePath("/calidad/incidencias");
}

export async function deleteIncident(id: string) {
  const orgId = await requireOrg();
  await db
    .delete(incident)
    .where(and(eq(incident.id, id), eq(incident.organizationId, orgId)));
  revalidatePath("/calidad/incidencias");
}

// ── No conformidades ──────────────────────────────────────────────────────────

export async function listNonConformities() {
  const orgId = await requireOrg();
  return db.query.nonConformity.findMany({
    where: eq(nonConformity.organizationId, orgId),
    orderBy: [desc(nonConformity.createdAt)],
  });
}

export async function createNonConformity(data: {
  shipmentId?: string;
  category: string;
  description: string;
  rootCause?: string;
  correctiveAction?: string;
}) {
  const orgId = await requireOrg();

  if (data.shipmentId) {
    const s = await db.query.shipment.findFirst({
      where: and(eq(shipment.id, data.shipmentId), eq(shipment.organizationId, orgId)),
      columns: { id: true },
    });
    if (!s) throw new Error("Expediente no encontrado");
  }

  await db.insert(nonConformity).values({
    organizationId: orgId,
    shipmentId: data.shipmentId ?? null,
    category: data.category,
    description: data.description,
    rootCause: data.rootCause ?? null,
    correctiveAction: data.correctiveAction ?? null,
  });
  revalidatePath("/calidad/no-conformidades");
}

export async function updateNonConformityStatus(id: string, status: string) {
  const orgId = await requireOrg();
  await db
    .update(nonConformity)
    .set({ status })
    .where(and(eq(nonConformity.id, id), eq(nonConformity.organizationId, orgId)));
  revalidatePath("/calidad/no-conformidades");
}

export async function deleteNonConformity(id: string) {
  const orgId = await requireOrg();
  await db
    .delete(nonConformity)
    .where(and(eq(nonConformity.id, id), eq(nonConformity.organizationId, orgId)));
  revalidatePath("/calidad/no-conformidades");
}

// ── SLA ───────────────────────────────────────────────────────────────────────

export async function listSlaDefinitions() {
  const orgId = await requireOrg();
  return db.query.slaDefinition.findMany({
    where: eq(slaDefinition.organizationId, orgId),
    orderBy: [desc(slaDefinition.createdAt)],
  });
}

export async function createSlaDefinition(data: {
  name: string;
  metric: string;
  targetHours: number;
  mode?: string;
}) {
  const orgId = await requireOrg();
  await db.insert(slaDefinition).values({
    organizationId: orgId,
    name: data.name,
    metric: data.metric,
    targetHours: data.targetHours,
    mode: data.mode ?? null,
  });
  revalidatePath("/calidad/sla");
}

export async function toggleSlaDefinition(id: string, active: boolean) {
  const orgId = await requireOrg();
  await db
    .update(slaDefinition)
    .set({ active })
    .where(and(eq(slaDefinition.id, id), eq(slaDefinition.organizationId, orgId)));
  revalidatePath("/calidad/sla");
}

export async function deleteSlaDefinition(id: string) {
  const orgId = await requireOrg();
  await db
    .delete(slaDefinition)
    .where(and(eq(slaDefinition.id, id), eq(slaDefinition.organizationId, orgId)));
  revalidatePath("/calidad/sla");
}
