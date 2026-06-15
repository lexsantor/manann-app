"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, and } from "drizzle-orm";
import { createHash } from "crypto";
import { db } from "@/db";
import {
  orgProfile,
  networkAgent,
  tender,
  tenderBid,
  eBl,
  eBlTransfer,
  shipment,
} from "@/db/schema";
import { requireOrg, requireOwner } from "@/lib/auth-guards";

// ── Perfil de organización ────────────────────────────────────────────────────

export async function getOrgProfile() {
  const orgId = await requireOrg();
  return db.query.orgProfile.findFirst({
    where: eq(orgProfile.organizationId, orgId),
  });
}

export async function upsertOrgProfile(data: {
  specialties: string[];
  corridors: string[];
  certifications: string[];
  languages: string[];
  monthlyCapacity?: number;
  bio?: string;
  city?: string;
}) {
  const orgId = await requireOwner();
  await db
    .insert(orgProfile)
    .values({
      organizationId: orgId,
      specialties: data.specialties,
      corridors: data.corridors,
      certifications: data.certifications,
      languages: data.languages,
      monthlyCapacity: data.monthlyCapacity ?? null,
      bio: data.bio ?? null,
      city: data.city ?? null,
    })
    .onConflictDoUpdate({
      target: [orgProfile.organizationId],
      set: {
        specialties: data.specialties,
        corridors: data.corridors,
        certifications: data.certifications,
        languages: data.languages,
        monthlyCapacity: data.monthlyCapacity ?? null,
        bio: data.bio ?? null,
        city: data.city ?? null,
        updatedAt: new Date(),
      },
    });
  revalidatePath("/partners/perfil");
}

// ── Red de agentes ────────────────────────────────────────────────────────────

export async function listNetworkAgents(filters?: {
  country?: string;
  mode?: string;
  corridor?: string;
}) {
  await requireOrg();
  let rows = await db.query.networkAgent.findMany({
    orderBy: [desc(networkAgent.verifiedAt), desc(networkAgent.createdAt)],
  });

  if (filters?.country) {
    rows = rows.filter((a) => a.country === filters.country);
  }
  if (filters?.mode) {
    rows = rows.filter((a) => a.modes.includes(filters.mode!));
  }
  if (filters?.corridor) {
    rows = rows.filter((a) =>
      a.corridors.some((c) => c.toLowerCase().includes(filters.corridor!.toLowerCase())),
    );
  }
  return rows;
}

// ── Tender / RFQ ─────────────────────────────────────────────────────────────

export async function listTenders() {
  const orgId = await requireOrg();
  return db.query.tender.findMany({
    where: eq(tender.organizationId, orgId),
    with: { bids: true },
    orderBy: [desc(tender.createdAt)],
  });
}

export async function createTender(data: {
  title: string;
  origin: string;
  destination: string;
  mode: string;
  cargoDescription?: string;
  weight?: number;
  volume?: number;
  targetDate?: string;
  responseDeadline?: string;
}) {
  const orgId = await requireOrg();
  const [row] = await db
    .insert(tender)
    .values({
      organizationId: orgId,
      title: data.title,
      origin: data.origin,
      destination: data.destination,
      mode: data.mode,
      cargoDescription: data.cargoDescription ?? null,
      weight: data.weight != null ? String(data.weight) : null,
      volume: data.volume != null ? String(data.volume) : null,
      targetDate: data.targetDate ?? null,
      responseDeadline: data.responseDeadline ?? null,
    })
    .returning({ id: tender.id });
  revalidatePath("/partners/tender");
  return row.id;
}

export async function closeTender(id: string) {
  const orgId = await requireOrg();
  await db
    .update(tender)
    .set({ status: "cerrado" })
    .where(and(eq(tender.id, id), eq(tender.organizationId, orgId)));
  revalidatePath("/partners/tender");
}

export async function deleteTender(id: string) {
  const orgId = await requireOrg();
  await db
    .delete(tender)
    .where(and(eq(tender.id, id), eq(tender.organizationId, orgId)));
  revalidatePath("/partners/tender");
}

export async function addSimulatedBids(tenderId: string) {
  const orgId = await requireOrg();
  const t = await db.query.tender.findFirst({
    where: and(eq(tender.id, tenderId), eq(tender.organizationId, orgId)),
    columns: { id: true },
  });
  if (!t) throw new Error("Tender no encontrado");

  const agents = await db.query.networkAgent.findMany({ limit: 3 });
  const bids = agents.map((a) => ({
    tenderId,
    agentId: a.id,
    agentName: a.name,
    price: String(Math.floor(1200 + Math.random() * 800)),
    currency: "EUR",
    transitDays: Math.floor(18 + Math.random() * 14),
    notes: "Incluye seguro básico. Precio válido 7 días.",
  }));
  await db.insert(tenderBid).values(bids);
  revalidatePath("/partners/tender");
}

// ── e-BL ─────────────────────────────────────────────────────────────────────

export async function getEblForShipment(shipmentId: string) {
  const orgId = await requireOrg();
  const s = await db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, orgId)),
    columns: { id: true },
  });
  if (!s) throw new Error("Expediente no encontrado");

  return db.query.eBl.findFirst({
    where: and(eq(eBl.shipmentId, shipmentId), eq(eBl.organizationId, orgId)),
    with: { transfers: { orderBy: [desc(eBlTransfer.signedAt)] } },
  });
}

export async function issueEbl(shipmentId: string, holderName: string) {
  const orgId = await requireOrg();
  const s = await db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, orgId)),
    columns: { id: true },
  });
  if (!s) throw new Error("Expediente no encontrado");

  const existing = await db.query.eBl.findFirst({
    where: and(eq(eBl.shipmentId, shipmentId), eq(eBl.organizationId, orgId)),
    columns: { id: true },
  });
  if (existing) throw new Error("Ya existe un e-BL para este expediente");

  const blHash = createHash("sha256")
    .update(`${shipmentId}-${orgId}-${Date.now()}`)
    .digest("hex");

  const [eblRow] = await db
    .insert(eBl)
    .values({ shipmentId, organizationId: orgId, blHash, currentHolder: holderName })
    .returning({ id: eBl.id });

  await db.insert(eBlTransfer).values({
    eblId: eblRow.id,
    fromParty: "Emisor",
    toParty: holderName,
    action: "Emitido",
  });

  revalidatePath(`/expedientes/${shipmentId}`);
  return eblRow.id;
}

export async function transferEbl(eblId: string, toParty: string, action: string) {
  const orgId = await requireOrg();
  const eblRow = await db.query.eBl.findFirst({
    where: and(eq(eBl.id, eblId), eq(eBl.organizationId, orgId)),
    columns: { id: true, currentHolder: true, status: true },
  });
  if (!eblRow) throw new Error("e-BL no encontrado");
  if (eblRow.status === "Surrendered" || eblRow.status === "Void") {
    throw new Error("El e-BL ya no puede transferirse");
  }

  const fromParty = eblRow.currentHolder ?? "Desconocido";
  const newStatus = action === "Surrender" ? "Surrendered" : action === "Void" ? "Void" : "Endorsed";

  await db.update(eBl).set({ status: newStatus, currentHolder: toParty }).where(eq(eBl.id, eblId));
  await db.insert(eBlTransfer).values({ eblId, fromParty, toParty, action });

  revalidatePath(`/expedientes`);
}
