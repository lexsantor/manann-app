"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc, and, isNull } from "drizzle-orm";
import { del } from "@vercel/blob";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/db";
import { document, shipment, party, container, cargoLine, notification } from "@/db/schema";
import {
  getOrgContext,
  shipmentBelongsToOrg,
  getOwnedDocument,
  listShipments,
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

// ─── Nuevo expediente desde cero (borrador a rellenar con un BL) ────────────

// Crea un expediente vacío en estado borrador y redirige a su detalle, donde
// el usuario arrastra el BL y la IA lo rellena (el wow desde cero).
export async function createDraftShipment(): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  // Referencia única por org: EXP-{año}-{secuencial}.
  const year = new Date().getFullYear();
  const existing = await db
    .select({ ref: shipment.reference })
    .from(shipment)
    .where(eq(shipment.organizationId, ctx.org.id));
  const max = existing.reduce((m, r) => {
    const n = Number(r.ref.match(/(\d+)$/)?.[1] ?? 0);
    return n > m ? n : m;
  }, 0);
  const reference = `EXP-${year}-${String(max + 1).padStart(4, "0")}`;

  const [row] = await db
    .insert(shipment)
    .values({
      organizationId: ctx.org.id,
      reference,
      status: "borrador",
      mode: "maritimo",
      priority: "med",
      createdBy: ctx.user.id,
    })
    .returning({ id: shipment.id });

  revalidatePath("/expedientes");
  redirect(`/expedientes/${row.id}`); // lanza NEXT_REDIRECT (no envolver en try)
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

    const [s] = await db.select({ id: shipment.id, reference: shipment.reference, organizationId: shipment.organizationId }).from(shipment).where(eq(shipment.id, doc.shipmentId));
    if (s) await createNotification(s.organizationId, `IA extrajo el BL del expediente ${s.reference}`, s.id, s.reference);
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
  // Un borrador recién creado pasa a confirmado al incorporar el BL.
  const [cur] = await db
    .select({ status: shipment.status })
    .from(shipment)
    .where(eq(shipment.id, sid));
  if (cur?.status === "borrador") upd.status = "confirmado";
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

  const [sRow] = await db.select({ reference: shipment.reference, organizationId: shipment.organizationId }).from(shipment).where(eq(shipment.id, sid));
  if (sRow) await createNotification(sRow.organizationId, `Datos del BL incorporados al expediente ${sRow.reference}`, sid, sRow.reference);

  revalidatePath(`/expedientes/${sid}`);
}

// Elimina el documento (registro DB + blob). Solo en estados pre-confirmación.
export async function deleteDocument(documentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(documentId)) throw new Error("Documento inválido");

  const doc = await getOwnedDocument(ctx.org.id, documentId);
  if (!doc) throw new Error("No autorizado");

  if (doc.blobUrl) {
    try {
      await del(doc.blobUrl);
    } catch {
      // No-fatal: el registro DB se borra igualmente
    }
  }

  await db.delete(document).where(eq(document.id, documentId));
  revalidatePath(`/expedientes/${doc.shipmentId}`);
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

// ─── HS code AI suggestion ───────────────────────────────────────────────────

const hsSchema = z.object({
  code: z.string().describe("Código HS de 6 dígitos (solo números, sin puntos)"),
  justification: z.string().describe("Justificación breve en español, máx. 80 caracteres"),
});

export async function suggestHsCode(
  cargoLineId: string,
): Promise<{ code: string; justification: string }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(cargoLineId)) throw new Error("Línea inválida");

  const [line] = await db
    .select({ id: cargoLine.id, description: cargoLine.description, shipmentId: cargoLine.shipmentId })
    .from(cargoLine)
    .where(eq(cargoLine.id, cargoLineId));
  if (!line) throw new Error("Línea no encontrada");

  const owned = await shipmentBelongsToOrg(ctx.org.id, line.shipmentId);
  if (!owned) throw new Error("No autorizado");

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: hsSchema,
    prompt: `Eres experto en clasificación arancelaria internacional (Sistema Armonizado). Propón el código HS de 6 dígitos más apropiado para la siguiente mercancía.\n\nMercancía: "${line.description}"\n\nDevuelve el código HS de 6 dígitos (sin puntos) y una justificación breve en español.`,
  });

  const clean = object.code.replace(/\D/g, "").slice(0, 6);
  return { code: clean, justification: object.justification };
}

export async function saveNotes(shipmentId: string, notes: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Expediente inválido");
  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");
  await db
    .update(shipment)
    .set({ notes: notes.trim() || null })
    .where(eq(shipment.id, shipmentId));
  revalidatePath(`/expedientes/${shipmentId}`);
}

export async function applyHsCode(
  cargoLineId: string,
  hsCode: string,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(cargoLineId)) throw new Error("Línea inválida");
  if (!/^\d{4,6}$/.test(hsCode)) throw new Error("Código HS inválido");

  const [line] = await db
    .select({ shipmentId: cargoLine.shipmentId })
    .from(cargoLine)
    .where(eq(cargoLine.id, cargoLineId));
  if (!line) throw new Error("Línea no encontrada");

  const owned = await shipmentBelongsToOrg(ctx.org.id, line.shipmentId);
  if (!owned) throw new Error("No autorizado");

  await db.update(cargoLine).set({ hsCode }).where(eq(cargoLine.id, cargoLineId));
  revalidatePath(`/expedientes/${line.shipmentId}`);
}

// ─── updateShipmentField ─────────────────────────────────────────────────────

const EDITABLE_FIELDS = new Set([
  "carrier", "vessel", "voyage", "blNumber", "pol", "pod",
  "incoterm", "freightTerms",
]);

export async function updateShipmentField(
  shipmentId: string,
  field: string,
  value: string,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Expediente inválido");
  if (!EDITABLE_FIELDS.has(field)) throw new Error("Campo no editable");
  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");
  await db.update(shipment).set({ [field]: value || null }).where(eq(shipment.id, shipmentId));
  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── searchShipmentsForPalette ────────────────────────────────────────────────

export async function searchShipmentsForPalette(
  q: string,
): Promise<{ id: string; reference: string; pol: string | null; pod: string | null; status: string }[]> {
  const ctx = await getOrgContext();
  if (!ctx?.org) return [];
  const all = await listShipments(ctx.org.id, q || undefined);
  return all.slice(0, 8).map((s) => ({
    id: s.id,
    reference: s.reference,
    pol: s.pol,
    pod: s.pod,
    status: s.status,
  }));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<
  { id: string; message: string; read: boolean; createdAt: Date; shipmentId: string | null; shipmentReference: string | null }[]
> {
  const ctx = await getOrgContext();
  if (!ctx?.org) return [];
  const rows = await db
    .select()
    .from(notification)
    .where(eq(notification.organizationId, ctx.org.id))
    .orderBy(desc(notification.createdAt))
    .limit(20);
  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    read: r.read !== null,
    createdAt: r.createdAt,
    shipmentId: r.shipmentId,
    shipmentReference: r.shipmentReference,
  }));
}

export async function markNotificationsRead(): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) return;
  await db
    .update(notification)
    .set({ read: new Date() })
    .where(and(eq(notification.organizationId, ctx.org.id), isNull(notification.read)));
}

async function createNotification(
  orgId: string,
  message: string,
  shipmentId?: string,
  shipmentReference?: string,
) {
  await db.insert(notification).values({
    organizationId: orgId,
    message,
    shipmentId: shipmentId ?? null,
    shipmentReference: shipmentReference ?? null,
  });
}
