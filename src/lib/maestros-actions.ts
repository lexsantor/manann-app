"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  chargeConcept,
  exchangeRate,
  customsRegime,
  systemParam,
  documentSeries,
  branch,
} from "@/db/schema";
import { getOrgContext } from "@/lib/erp";

// ─── Conceptos de cargo ───────────────────────────────────────────────────────

export async function listChargeConcepts() {
  const ctx = await getOrgContext();
  if (!ctx?.org) return [];
  return db
    .select()
    .from(chargeConcept)
    .where(eq(chargeConcept.organizationId, ctx.org.id))
    .orderBy(chargeConcept.category, chargeConcept.name);
}

export async function createChargeConcept(data: {
  code: string;
  name: string;
  category: string;
  defaultDirection: string;
}) {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No organización");
  await db.insert(chargeConcept).values({ ...data, organizationId: ctx.org.id });
  revalidatePath("/maestros/conceptos");
}

export async function deleteChargeConcept(id: string) {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No organización");
  await db
    .delete(chargeConcept)
    .where(and(eq(chargeConcept.id, id), eq(chargeConcept.organizationId, ctx.org.id)));
  revalidatePath("/maestros/conceptos");
}

// ─── Tipos de cambio (simulación ECB/Fixer) ───────────────────────────────────

export async function listExchangeRates() {
  const ctx = await getOrgContext();
  if (!ctx?.org) return [];
  return db
    .select()
    .from(exchangeRate)
    .where(eq(exchangeRate.organizationId, ctx.org.id))
    .orderBy(exchangeRate.targetCurrency);
}

export async function upsertExchangeRate(data: {
  targetCurrency: string;
  rate: string;
  validFrom: string;
}) {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No organización");
  await db
    .insert(exchangeRate)
    .values({ ...data, organizationId: ctx.org.id, baseCurrency: "EUR" })
    .onConflictDoUpdate({
      target: [exchangeRate.organizationId, exchangeRate.targetCurrency],
      set: { rate: data.rate, validFrom: data.validFrom, updatedAt: new Date() },
    });
  revalidatePath("/maestros/monedas");
}

// ─── Regímenes aduaneros ──────────────────────────────────────────────────────

export async function listCustomsRegimes() {
  return db.select().from(customsRegime).where(eq(customsRegime.active, true)).orderBy(customsRegime.code);
}

// ─── Parámetros del sistema ───────────────────────────────────────────────────

export async function listSystemParams() {
  const ctx = await getOrgContext();
  if (!ctx?.org) return [];
  return db
    .select()
    .from(systemParam)
    .where(eq(systemParam.organizationId, ctx.org.id))
    .orderBy(systemParam.key);
}

export async function upsertSystemParam(data: { key: string; value: string; label?: string }) {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No organización");
  await db
    .insert(systemParam)
    .values({ ...data, organizationId: ctx.org.id })
    .onConflictDoUpdate({
      target: [systemParam.organizationId, systemParam.key],
      set: { value: data.value, label: data.label, updatedAt: new Date() },
    });
  revalidatePath("/maestros/parametros");
}

export async function deleteSystemParam(id: string) {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No organización");
  await db
    .delete(systemParam)
    .where(and(eq(systemParam.id, id), eq(systemParam.organizationId, ctx.org.id)));
  revalidatePath("/maestros/parametros");
}

// ─── Series y numeración ──────────────────────────────────────────────────────

export async function listDocumentSeries() {
  const ctx = await getOrgContext();
  if (!ctx?.org) return [];
  return db
    .select()
    .from(documentSeries)
    .where(eq(documentSeries.organizationId, ctx.org.id))
    .orderBy(documentSeries.docType);
}

export async function upsertDocumentSeries(data: {
  docType: string;
  prefix: string;
  nextNumber: number;
  padding: number;
}) {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No organización");
  await db
    .insert(documentSeries)
    .values({ ...data, organizationId: ctx.org.id })
    .onConflictDoUpdate({
      target: [documentSeries.organizationId, documentSeries.docType],
      set: { prefix: data.prefix, nextNumber: data.nextNumber, padding: data.padding },
    });
  revalidatePath("/maestros/series");
}

// ─── Sucursales ───────────────────────────────────────────────────────────────

export async function listBranches() {
  const ctx = await getOrgContext();
  if (!ctx?.org) return [];
  return db
    .select()
    .from(branch)
    .where(eq(branch.organizationId, ctx.org.id))
    .orderBy(branch.isHQ, branch.name);
}

export async function createBranch(data: {
  code: string;
  name: string;
  address?: string;
  city?: string;
  countryCode?: string;
  isHQ?: boolean;
}) {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No organización");
  await db.insert(branch).values({ ...data, organizationId: ctx.org.id, isHQ: data.isHQ ?? false });
  revalidatePath("/maestros/sucursales");
}

export async function deleteBranch(id: string) {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No organización");
  await db
    .delete(branch)
    .where(and(eq(branch.id, id), eq(branch.organizationId, ctx.org.id)));
  revalidatePath("/maestros/sucursales");
}
