"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/db";
import { document, shipment, party, container, cargoLine } from "@/db/schema";
import {
  getOrgContext,
  shipmentBelongsToOrg,
  getOwnedDocument,
} from "@/lib/erp";
import {
  blExtractionSchema,
  EXTRACTION_PROMPT,
  overallConfidence,
  type BlExtraction,
} from "@/lib/bl-extraction";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function val(f: { value: string | null } | undefined): string | null {
  const v = f?.value?.trim();
  return v ? v : null;
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export interface RecordUploadedDocumentInput {
  shipmentId: string;
  url: string;
  filename: string;
  contentType?: string;
  size?: number;
}

// Registra en la DB un documento ya subido al Blob. SIEMPRE verifica sesión y
// ownership de la org (regla: cada Server Action revalida; no confiar en el
// cliente aunque la UI ya esté gateada).
export async function recordUploadedDocument(
  input: RecordUploadedDocumentInput,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(input.shipmentId)) throw new Error("Expediente inválido");

  const owned = await shipmentBelongsToOrg(ctx.org.id, input.shipmentId);
  if (!owned) throw new Error("No autorizado");

  await db.insert(document).values({
    shipmentId: input.shipmentId,
    type: "bl",
    status: "uploaded",
    filename: input.filename,
    blobUrl: input.url,
    mimeType: input.contentType ?? "application/pdf",
    sizeBytes: input.size ?? null,
    uploadedBy: ctx.user.id,
  });

  revalidatePath(`/expedientes/${input.shipmentId}`);
}

// ─── Extracción IA (el momento wow) ─────────────────────────────────────────

// Lee el PDF del BL con Gemini → propuesta estructurada con confianza por campo.
// Persiste status processing→extracted; no toca el expediente hasta confirmar.
export async function extractDocument(documentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(documentId)) throw new Error("Documento inválido");

  const doc = await getOwnedDocument(ctx.org.id, documentId);
  if (!doc) throw new Error("No autorizado");
  if (!doc.blobUrl) throw new Error("El documento no tiene archivo asociado.");

  await db
    .update(document)
    .set({ status: "processing" })
    .where(eq(document.id, documentId));
  revalidatePath(`/expedientes/${doc.shipmentId}`);

  try {
    const res = await fetch(doc.blobUrl);
    if (!res.ok) throw new Error("No se pudo descargar el PDF");
    const bytes = new Uint8Array(await res.arrayBuffer());

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: blExtractionSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: EXTRACTION_PROMPT },
            { type: "file", data: bytes, mediaType: "application/pdf" },
          ],
        },
      ],
    });

    const conf = overallConfidence(object);
    await db
      .update(document)
      .set({
        status: "extracted",
        extraction: object,
        aiConfidence: conf.toFixed(3),
      })
      .where(eq(document.id, documentId));
  } catch (error) {
    console.error("Extracción IA falló:", error);
    await db
      .update(document)
      .set({ status: "error" })
      .where(eq(document.id, documentId));
    throw new Error("La extracción falló. Inténtalo de nuevo.");
  }

  revalidatePath(`/expedientes/${doc.shipmentId}`);
}

// Confirma la propuesta: vuelca al expediente (campos de cabecera + partes/
// contenedor/mercancía que falten) y marca el documento como confirmado.
export async function applyExtraction(documentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(documentId)) throw new Error("Documento inválido");

  const doc = await getOwnedDocument(ctx.org.id, documentId);
  if (!doc || !doc.extraction) throw new Error("No hay propuesta que confirmar");
  const ex = doc.extraction as BlExtraction;
  const sid = doc.shipmentId;

  // 1) Campos de cabecera del expediente (solo los que la IA propuso).
  const upd: Record<string, unknown> = {};
  const map: [keyof BlExtraction, string][] = [
    ["carrier", "carrier"],
    ["vessel", "vessel"],
    ["voyage", "voyage"],
    ["blNumber", "blNumber"],
    ["pol", "pol"],
    ["pod", "pod"],
    ["incoterm", "incoterm"],
    ["freightTerms", "freightTerms"],
  ];
  for (const [k, col] of map) {
    const v = val(ex[k]);
    if (v) upd[col] = v;
  }
  const etd = parseDate(val(ex.etd));
  const eta = parseDate(val(ex.eta));
  if (etd) upd.etd = etd;
  if (eta) upd.eta = eta;
  if (Object.keys(upd).length) {
    await db.update(shipment).set(upd).where(eq(shipment.id, sid));
  }

  // 2) Partes que falten (no duplicar las existentes por rol).
  const existing = await db
    .select({ role: party.role })
    .from(party)
    .where(eq(party.shipmentId, sid));
  const roles = new Set(existing.map((p) => p.role));
  const partyRows: (typeof party.$inferInsert)[] = [];
  if (!roles.has("shipper") && val(ex.shipperName))
    partyRows.push({ shipmentId: sid, role: "shipper", name: val(ex.shipperName)!, country: val(ex.shipperCountry) });
  if (!roles.has("consignee") && val(ex.consigneeName))
    partyRows.push({ shipmentId: sid, role: "consignee", name: val(ex.consigneeName)!, country: val(ex.consigneeCountry) });
  if (!roles.has("notify") && val(ex.notifyName))
    partyRows.push({ shipmentId: sid, role: "notify", name: val(ex.notifyName)! });
  if (partyRows.length) await db.insert(party).values(partyRows);

  // 3) Contenedor, si la IA propuso uno y el expediente no tiene ninguno.
  if (val(ex.containerNumber)) {
    const conts = await db
      .select({ id: container.id })
      .from(container)
      .where(eq(container.shipmentId, sid));
    if (!conts.length) {
      await db.insert(container).values({
        shipmentId: sid,
        containerNumber: val(ex.containerNumber)!,
        sealNumber: val(ex.sealNumber),
        isoType: val(ex.containerType),
      });
    }
  }

  // 4) Línea de mercancía, si falta.
  if (val(ex.cargoDescription)) {
    const lines = await db
      .select({ id: cargoLine.id })
      .from(cargoLine)
      .where(eq(cargoLine.shipmentId, sid));
    if (!lines.length) {
      const pkg = Number(val(ex.packages));
      const wt = Number(val(ex.grossWeightKg));
      await db.insert(cargoLine).values({
        shipmentId: sid,
        description: val(ex.cargoDescription)!,
        hsCode: val(ex.hsCode),
        packages: Number.isFinite(pkg) && pkg > 0 ? pkg : null,
        grossWeightKg: Number.isFinite(wt) && wt > 0 ? Math.round(wt) : null,
      });
    }
  }

  await db
    .update(document)
    .set({ status: "confirmed" })
    .where(eq(document.id, documentId));
  revalidatePath(`/expedientes/${sid}`);
}

// Descartar la propuesta: vuelve a estado uploaded.
export async function discardExtraction(documentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  const doc = await getOwnedDocument(ctx.org.id, documentId);
  if (!doc) throw new Error("No autorizado");
  await db
    .update(document)
    .set({ status: "uploaded", extraction: null, aiConfidence: null })
    .where(eq(document.id, documentId));
  revalidatePath(`/expedientes/${doc.shipmentId}`);
}
