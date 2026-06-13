"use server";

import { z } from "zod";
import { db } from "@/db";
import { shipment } from "@/db/schema/domain";
import { getOrgContext } from "@/lib/erp";
import { revalidatePath } from "next/cache";

const rowSchema = z.object({
  referencia: z.string().max(80).optional(),
  modo: z.enum(["maritimo", "aereo", "terrestre", "ferroviario", "multimodal"]).default("maritimo"),
  estado: z.enum(["borrador", "confirmado", "en_transito", "en_aduana", "entregado", "cerrado"]).default("borrador"),
  naviera: z.string().max(100).optional(),
  pol: z.string().max(10).optional(),
  pod: z.string().max(10).optional(),
  etd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().transform(v => v ? new Date(v) : undefined),
  eta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().transform(v => v ? new Date(v) : undefined),
  buque: z.string().max(120).optional(),
});

export type ImportRow = z.input<typeof rowSchema>;

export interface ImportResult {
  created: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export async function importShipmentsFromCsv(
  rows: ImportRow[],
): Promise<ImportResult> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (rows.length === 0) return { created: 0, skipped: 0, errors: [] };
  if (rows.length > 500) throw new Error("Máximo 500 filas por importación");

  const year = new Date().getFullYear();
  const existing = await db
    .select({ ref: shipment.reference })
    .from(shipment)
    .where(
      (await import("drizzle-orm")).eq(shipment.organizationId, ctx.org.id),
    );

  const existingRefs = new Set(existing.map((r) => r.ref));

  let seqMax = existing.reduce((m, r) => {
    const n = Number(r.ref.match(/(\d+)$/)?.[1] ?? 0);
    return n > m ? n : m;
  }, 0);

  const toInsert: (typeof shipment.$inferInsert)[] = [];
  const errors: { row: number; message: string }[] = [];
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const parsed = rowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({ row: i + 1, message: parsed.error.issues[0]?.message ?? "Fila inválida" });
      continue;
    }

    const d = parsed.data;
    let ref = d.referencia?.trim();

    if (!ref) {
      seqMax++;
      ref = `EXP-${year}-${String(seqMax).padStart(4, "0")}`;
    } else if (existingRefs.has(ref)) {
      skipped++;
      continue;
    }

    existingRefs.add(ref);
    toInsert.push({
      organizationId: ctx.org.id,
      reference: ref,
      status: d.estado,
      mode: d.modo,
      priority: "med",
      carrier: d.naviera ?? null,
      pol: d.pol ?? null,
      pod: d.pod ?? null,
      etd: d.etd ?? null,
      eta: d.eta ?? null,
      vessel: d.buque ?? null,
      createdBy: ctx.user.id,
    });
  }

  if (toInsert.length > 0) {
    await db.insert(shipment).values(toInsert);
  }

  revalidatePath("/expedientes");

  return {
    created: toInsert.length,
    skipped,
    errors,
  };
}
