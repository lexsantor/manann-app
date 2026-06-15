"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, desc, and, isNull, inArray } from "drizzle-orm";
import { del } from "@vercel/blob";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/db";
import { document, shipment, party, container, cargoLine, notification, trackingSubscription, charge, invoice, invoiceLine, rate, quotation, quotationLine, comment, member, contact, opportunity, booking, accountingAccount, journalEntry, journalEntryLine, complianceDeclaration, partner, sanctionsScreening, apiKey, webhook } from "@/db/schema";
import { logChanges } from "@/lib/audit";
import { generateSummary } from "@/lib/ai/summarize";
import { subscribeContainer, fetchContainerEvents, mapEventCode, isShipsGoEnabled } from "@/lib/tracking/shipsgo";
import {
  PGC_ACCOUNTS,
  getOrgContext,
  shipmentBelongsToOrg,
  getOwnedDocument,
  listShipments,
  getActiveMemberId,
  getInvoiceDetail,
  countOrgQuotations,
  getQuotationDetail,
  importContactsFromParties as importContactsQuery,
} from "@/lib/erp";
import { sendInvoiceEmail, sendQuotationEmail } from "@/lib/email";
import {
  overallConfidence,
  pickExtractionSchema,
  type BlField,
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
// Límite de tamaño de PDF que enviamos a Gemini (el upload permite 10MB, pero
// PDFs muy grandes disparan coste/errores en el modelo).
const MAX_AI_PDF_BYTES = 8 * 1024 * 1024;

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
    if (bytes.length > MAX_AI_PDF_BYTES) {
      throw new Error("El PDF supera el límite de 8 MB para extracción.");
    }

    const [shipmentRow] = await db.select({ mode: shipment.mode }).from(shipment).where(eq(shipment.id, doc.shipmentId));
    const { schema: extractionSchema, prompt: extractionPrompt } = pickExtractionSchema(shipmentRow?.mode ?? "maritimo");

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: extractionSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: extractionPrompt },
            { type: "file", data: bytes, mediaType: "application/pdf" },
          ],
        },
      ],
    });

    const conf = overallConfidence(object);
    const mode = shipmentRow?.mode ?? "maritimo";
    const docType = mode === "aereo" ? "awb" : mode === "terrestre" ? "cmr" : "bl";
    const docLabel = mode === "aereo" ? "AWB" : mode === "terrestre" ? "CMR" : "BL";
    await db
      .update(document)
      .set({
        type: docType,
        status: "extracted",
        extraction: object,
        aiConfidence: conf.toFixed(3),
      })
      .where(eq(document.id, documentId));

    const [s] = await db.select({ id: shipment.id, reference: shipment.reference, organizationId: shipment.organizationId }).from(shipment).where(eq(shipment.id, doc.shipmentId));
    if (s) await createNotification(s.organizationId, `IA extrajo el ${docLabel} del expediente ${s.reference}`, s.id, s.reference);
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
  const ex = doc.extraction as Record<string, BlField | undefined>;
  const sid = doc.shipmentId;

  const [shipmentModeRow] = await db.select({ mode: shipment.mode }).from(shipment).where(eq(shipment.id, sid));
  const mode = shipmentModeRow?.mode ?? "maritimo";

  // 1) Campos de cabecera del expediente (solo los que la IA propuso).
  const upd: Record<string, unknown> = {};
  const map: [string, string][] = [
    ["carrier", "carrier"],
    ["vessel", "vessel"],
    ["voyage", "voyage"],
    ["blNumber", "blNumber"],
    ["pol", "pol"],
    ["pod", "pod"],
    ["incoterm", "incoterm"],
    ["freightTerms", "freightTerms"],
  ];
  // AWB: awbNumber → blNumber (referencia principal), flightNumber → voyage
  if (mode === "aereo") {
    if (ex.awbNumber?.value && !ex.blNumber?.value) upd.blNumber = ex.awbNumber.value;
    if (ex.flightNumber?.value && !ex.voyage?.value) upd.voyage = ex.flightNumber.value;
  }
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
  const appliedLabel = mode === "aereo" ? "AWB" : mode === "terrestre" ? "CMR" : "BL";
  if (sRow) await createNotification(sRow.organizationId, `Datos del ${appliedLabel} incorporados al expediente ${sRow.reference}`, sid, sRow.reference);

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

// Extrae múltiples documentos en paralelo (batch).
export async function extractDocumentsBatch(documentIds: string[]): Promise<void> {
  await Promise.all(documentIds.map((id) => extractDocument(id)));
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
  const current = await db.query.shipment.findFirst({
    where: eq(shipment.id, shipmentId),
    columns: { notes: true },
  });
  if (notes.length > 10000) throw new Error("Las notas no pueden superar 10.000 caracteres");
  const newNotes = notes.trim() || null;
  await db.transaction(async (tx) => {
    await tx.update(shipment).set({ notes: newNotes }).where(eq(shipment.id, shipmentId));
    const memberId = await getActiveMemberId(ctx.org!.id, ctx.user.id);
    await logChanges(tx, [{
      shipmentId,
      entity: "shipment",
      entityId: shipmentId,
      field: "notes",
      oldValue: current?.notes ?? null,
      newValue: newNotes,
      changedBy: memberId,
      source: "user",
    }]);
  });
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

  const currentLine = await db.query.cargoLine.findFirst({
    where: eq(cargoLine.id, cargoLineId),
    columns: { hsCode: true },
  });
  await db.transaction(async (tx) => {
    await tx.update(cargoLine).set({ hsCode }).where(eq(cargoLine.id, cargoLineId));
    const memberId = await getActiveMemberId(ctx.org!.id, ctx.user.id);
    await logChanges(tx, [{
      shipmentId: line.shipmentId,
      entity: "cargo_line",
      entityId: cargoLineId,
      field: "hsCode",
      oldValue: currentLine?.hsCode ?? null,
      newValue: hsCode,
      changedBy: memberId,
      source: "user",
    }]);
  });
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
  const current = await db.query.shipment.findFirst({
    where: eq(shipment.id, shipmentId),
    columns: { [field]: true } as Record<string, boolean>,
  });
  const oldValue = current ? String((current as Record<string, unknown>)[field] ?? "") : null;
  const newValue = value || null;
  await db.transaction(async (tx) => {
    await tx.update(shipment).set({ [field]: newValue }).where(eq(shipment.id, shipmentId));
    const memberId = await getActiveMemberId(ctx.org!.id, ctx.user.id);
    await logChanges(tx, [{
      shipmentId,
      entity: "shipment",
      entityId: shipmentId,
      field,
      oldValue: oldValue !== "" ? oldValue : null,
      newValue,
      changedBy: memberId,
      source: "user",
    }]);
  });
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

// ─── 3.2 Resumen ejecutivo IA ─────────────────────────────────────────────────

export async function generateAiSummary(
  shipmentId: string,
): Promise<{ summary?: string; error?: string }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) return { error: "No autorizado" };
  if (!UUID_RE.test(shipmentId)) return { error: "Expediente inválido" };

  const s = await db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, ctx.org.id)),
    with: {
      parties: { columns: { role: true, name: true } },
      containers: { columns: { containerNumber: true, isoType: true } },
      cargoLines: { columns: { description: true, packages: true, grossWeightKg: true } },
      trackingEvents: { orderBy: (t) => [desc(t.occurredAt)], limit: 10 },
      charges: { columns: { type: true, amount: true, currency: true } },
    },
  });
  if (!s) return { error: "Expediente no encontrado" };

  const ctx2 = {
    reference: s.reference,
    status: s.status,
    pol: s.pol,
    pod: s.pod,
    carrier: s.carrier,
    vessel: s.vessel,
    blNumber: s.blNumber,
    incoterm: s.incoterm,
    etd: s.etd?.toISOString().slice(0, 10) ?? null,
    eta: s.eta?.toISOString().slice(0, 10) ?? null,
    priority: s.priority,
    parties: s.parties,
    containers: s.containers,
    cargoLines: s.cargoLines,
    trackingEvents: s.trackingEvents.map((e) => ({
      type: e.type,
      location: e.location,
      description: e.description,
      occurredAt: e.occurredAt.toISOString().slice(0, 10),
    })),
    charges: s.charges.map((c) => ({ type: c.type, amount: String(c.amount), currency: c.currency })),
    notes: s.notes,
  };

  try {
    const summary = await generateSummary(ctx2);
    if (!summary) return {};

    await db
      .update(shipment)
      .set({ aiSummary: summary, aiSummaryAt: new Date() })
      .where(eq(shipment.id, shipmentId));

    revalidatePath(`/expedientes/${shipmentId}`);
    return { summary };
  } catch {
    return { error: "Error al conectar con la IA. Inténtalo de nuevo." };
  }
}

// ─── 3.5 Asignar expediente a agente ─────────────────────────────────────────

export async function assignShipment(
  shipmentId: string,
  memberId: string | null,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Expediente inválido");
  if (memberId !== null && !UUID_RE.test(memberId)) throw new Error("Miembro inválido");

  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");

  const current = await db.query.shipment.findFirst({
    where: eq(shipment.id, shipmentId),
    columns: { assignedTo: true, reference: true },
  });

  const actorMemberId = await getActiveMemberId(ctx.org.id, ctx.user.id);

  await db.transaction(async (tx) => {
    await tx.update(shipment).set({ assignedTo: memberId }).where(eq(shipment.id, shipmentId));
    await logChanges(tx, [{
      shipmentId,
      entity: "shipment",
      entityId: shipmentId,
      field: "assignedTo",
      oldValue: current?.assignedTo ?? null,
      newValue: memberId,
      changedBy: actorMemberId,
      source: "user",
    }]);
  });

  // Notificar al asignado (no si se autoasigna)
  if (memberId && memberId !== actorMemberId) {
    const assignedMember = await db.query.member.findFirst({
      where: eq((await import("@/db/schema")).member.id, memberId),
      with: { user: { columns: { id: true } } },
    });
    if (assignedMember?.user) {
      await db.insert(notification).values({
        organizationId: ctx.org.id,
        userId: assignedMember.user.id,
        message: `Te han asignado el expediente ${current?.reference ?? shipmentId}`,
        shipmentId,
        shipmentReference: current?.reference ?? null,
      });
    }
  }

  revalidatePath(`/expedientes/${shipmentId}`);
  revalidatePath("/expedientes");
}

// ─── 3.1 ShipsGo — vincular contenedor real ──────────────────────────────────

export async function subscribeContainerTracking(
  shipmentId: string,
  containerNumber: string,
  shippingLine: string,
): Promise<{ error?: string }> {
  if (!isShipsGoEnabled()) {
    return { error: "ShipsGo no está activado. Configura SHIPSGO_ENABLED=true y SHIPSGO_API_KEY en las variables de entorno." };
  }

  const ctx = await getOrgContext();
  if (!ctx?.org) return { error: "No autorizado" };
  if (!UUID_RE.test(shipmentId)) return { error: "Expediente inválido" };

  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) return { error: "No autorizado" };

  const result = await subscribeContainer(containerNumber.trim().toUpperCase(), shippingLine.trim());
  if ("error" in result) return { error: result.error };

  await db.insert(trackingSubscription).values({
    shipmentId,
    containerNumber: containerNumber.trim().toUpperCase(),
    shippingLine: shippingLine.trim(),
    externalId: result.requestId,
    status: "active",
  });

  const memberId = await getActiveMemberId(ctx.org.id, ctx.user.id);
  await logChanges(db, [{
    shipmentId,
    entity: "shipment",
    entityId: shipmentId,
    field: "tracking",
    oldValue: null,
    newValue: `ShipsGo: ${containerNumber.trim().toUpperCase()}`,
    changedBy: memberId,
    source: "system",
  }]);

  revalidatePath(`/expedientes/${shipmentId}`);
  return {};
}

// Sync de eventos desde ShipsGo (llamado en el Server Component si stale >30 min)
export async function syncTrackingEvents(shipmentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) return;

  const subs = await db
    .select()
    .from(trackingSubscription)
    .where(and(eq(trackingSubscription.shipmentId, shipmentId), eq(trackingSubscription.status, "active")));

  for (const sub of subs) {
    if (!sub.externalId) continue;

    // Solo si stale > 30 min
    const lastSync = sub.lastSyncedAt ? new Date(sub.lastSyncedAt).getTime() : 0;
    if (Date.now() - lastSync < 30 * 60 * 1000) continue;

    const result = await fetchContainerEvents(sub.externalId);
    if ("error" in result) continue;

    // Insertar solo eventos nuevos (dedup por occurredAt + type)
    const existing = await db.query.trackingEvent.findMany({
      where: eq((await import("@/db/schema")).trackingEvent.shipmentId, shipmentId),
      columns: { occurredAt: true, type: true, source: true },
    });
    const existingKeys = new Set(existing.map((e) => `${e.occurredAt?.toISOString()}|${e.type}`));

    const toInsert = result.events.filter((e) => {
      const key = `${new Date(e.occurredAt).toISOString()}|${mapEventCode(e.eventCode)}`;
      return !existingKeys.has(key);
    });

    if (toInsert.length > 0) {
      const { trackingEvent } = await import("@/db/schema");
      await db.insert(trackingEvent).values(
        toInsert.map((e) => ({
          shipmentId,
          type: mapEventCode(e.eventCode) as "booking" | "gate_in" | "cargado" | "salida" | "en_transito" | "llegada" | "descargado" | "aduana" | "entregado",
          location: e.location || null,
          description: e.description || e.eventCode,
          vessel: e.vessel ?? null,
          source: "shipsgo" as const,
          occurredAt: new Date(e.occurredAt),
        })),
      );
    }

    const newStatus = result.status === "finished" ? "finished" : "active";
    await db
      .update(trackingSubscription)
      .set({ lastSyncedAt: new Date(), status: newStatus })
      .where(eq(trackingSubscription.id, sub.id));
  }

  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── Link público de expediente ───────────────────────────────────────────────

export async function getOrCreateShareToken(
  shipmentId: string,
): Promise<string> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Expediente inválido");

  const [row] = await db
    .select({ shareToken: shipment.shareToken })
    .from(shipment)
    .where(
      and(
        eq(shipment.id, shipmentId),
        eq(shipment.organizationId, ctx.org.id),
      ),
    )
    .limit(1);

  if (!row) throw new Error("Expediente no encontrado");
  if (row.shareToken) return row.shareToken;

  const token = crypto.randomUUID();
  await db
    .update(shipment)
    .set({ shareToken: token })
    .where(eq(shipment.id, shipmentId));

  return token;
}

// ─── Cargos financieros ──────────────────────────────────────────────────────

const addChargeSchema = z.object({
  type: z.enum(["flete", "aduana", "manipulacion", "seguro", "documentacion", "almacenaje", "otro"]),
  direction: z.enum(["cost", "revenue"]),
  description: z.string().max(255).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Importe inválido"),
  buyAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  passThrough: z.boolean().default(false),
  atRisk: z.boolean().default(false),
  currency: z.string().length(3).default("EUR"),
});

export type AddChargeInput = z.input<typeof addChargeSchema>;

export async function addCharge(
  shipmentId: string,
  input: AddChargeInput,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const owned = await db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, ctx.org.id)),
    columns: { id: true },
  });
  if (!owned) throw new Error("Expediente no encontrado");

  const data = addChargeSchema.parse(input);

  await db.insert(charge).values({
    shipmentId,
    type: data.type,
    direction: data.direction,
    description: data.description ?? null,
    amount: data.amount,
    buyAmount: data.passThrough ? data.amount : (data.buyAmount ?? null),
    passThrough: data.passThrough,
    atRisk: data.atRisk,
    currency: data.currency,
  });

  revalidatePath(`/expedientes/${shipmentId}`);
}

export async function deleteCharge(
  chargeId: string,
  shipmentId: string,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const row = await db.query.charge.findFirst({
    where: eq(charge.id, chargeId),
    with: { shipment: { columns: { organizationId: true } } },
  });
  if (!row || row.shipment.organizationId !== ctx.org.id) throw new Error("No autorizado");

  await db.delete(charge).where(eq(charge.id, chargeId));

  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── Facturas ────────────────────────────────────────────────────────────────

const createInvoiceSchema = z.object({
  clientName: z.string().min(1).max(255),
  clientNif: z.string().max(20).optional(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  taxRate: z.string().regex(/^\d+(\.\d{1,2})?$/).default("21"),
  currency: z.string().length(3).default("EUR"),
  notes: z.string().max(500).optional(),
  lines: z.array(z.object({
    concept: z.string().min(1).max(255),
    quantity: z.string().default("1"),
    unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
    taxRate: z.string().default("21"),
  })).min(1),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export async function createInvoice(
  shipmentId: string,
  input: CreateInvoiceInput,
): Promise<{ invoiceId: string; reference: string }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const owned = await db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, ctx.org.id)),
    columns: { id: true },
  });
  if (!owned) throw new Error("Expediente no encontrado");

  const data = createInvoiceSchema.parse(input);

  // Número de factura: MNN-F-{año}-{secuencial 3 dígitos}
  const { countOrgInvoices } = await import("@/lib/erp");
  const n = (await countOrgInvoices(ctx.org.id)) + 1;
  const year = new Date().getFullYear();
  const reference = `MNN-F-${year}-${String(n).padStart(3, "0")}`;

  const subtotal = data.lines.reduce(
    (s, l) => s + Number(l.quantity) * Number(l.unitPrice),
    0,
  );
  const taxAmount = subtotal * (Number(data.taxRate) / 100);
  const total = subtotal + taxAmount;

  const [inv] = await db.insert(invoice).values({
    shipmentId,
    reference,
    status: "borrador",
    issueDate: data.issueDate,
    dueDate: data.dueDate ?? null,
    subtotal: subtotal.toFixed(2),
    taxRate: data.taxRate,
    total: total.toFixed(2),
    currency: data.currency,
    clientName: data.clientName,
    clientNif: data.clientNif ?? null,
    notes: data.notes ?? null,
  }).returning({ id: invoice.id });

  await db.insert(invoiceLine).values(
    data.lines.map((l, i) => ({
      invoiceId: inv.id,
      concept: l.concept,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: l.taxRate,
      subtotal: (Number(l.quantity) * Number(l.unitPrice)).toFixed(2),
      sortOrder: i,
    })),
  );

  revalidatePath(`/expedientes/${shipmentId}`);
  revalidatePath("/facturas");

  return { invoiceId: inv.id, reference };
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "borrador" | "emitida" | "enviada" | "pagada" | "vencida" | "anulada",
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const row = await db.query.invoice.findFirst({
    where: eq(invoice.id, invoiceId),
    with: { shipment: { columns: { id: true, organizationId: true } } },
  });
  if (!row || row.shipment.organizationId !== ctx.org.id) throw new Error("No autorizado");

  await db.update(invoice).set({ status, updatedAt: new Date() }).where(eq(invoice.id, invoiceId));

  if (status === "emitida") {
    await autoPostInvoiceJournal(invoiceId, ctx.org.id);
  }

  revalidatePath("/facturas");
  revalidatePath(`/expedientes/${row.shipment.id}`);
}

// ─── Enviar factura por email ─────────────────────────────────────────────────

// ─── Tarifas ─────────────────────────────────────────────────────────────────

const rateSchema = z.object({
  concept: z.string().min(1).max(200),
  serviceType: z.enum(["flete", "aduana", "manipulacion", "seguro", "documentacion", "almacenaje", "otro"]),
  unit: z.enum(["contenedor", "bl", "kg", "cbm", "unidad", "plano"]),
  basePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Precio inválido"),
  currency: z.string().length(3).default("EUR"),
  validFrom: z.string().nullable().optional(),
  validTo: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

export type RateInput = z.infer<typeof rateSchema>;

export async function createRate(input: RateInput): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  const data = rateSchema.parse(input);
  await db.insert(rate).values({
    organizationId: ctx.org.id,
    concept: data.concept,
    serviceType: data.serviceType,
    unit: data.unit,
    basePrice: data.basePrice,
    currency: data.currency,
    validFrom: data.validFrom ?? null,
    validTo: data.validTo ?? null,
    notes: data.notes ?? null,
    active: true,
  });
  revalidatePath("/tarifas");
}

export async function updateRate(rateId: string, input: RateInput): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  const row = await db.query.rate.findFirst({ where: eq(rate.id, rateId), columns: { organizationId: true } });
  if (!row || row.organizationId !== ctx.org.id) throw new Error("No autorizado");
  const data = rateSchema.parse(input);
  await db.update(rate).set({
    concept: data.concept,
    serviceType: data.serviceType,
    unit: data.unit,
    basePrice: data.basePrice,
    currency: data.currency,
    validFrom: data.validFrom ?? null,
    validTo: data.validTo ?? null,
    notes: data.notes ?? null,
    updatedAt: new Date(),
  }).where(eq(rate.id, rateId));
  revalidatePath("/tarifas");
}

export async function toggleRateActive(rateId: string, active: boolean): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  const row = await db.query.rate.findFirst({ where: eq(rate.id, rateId), columns: { organizationId: true } });
  if (!row || row.organizationId !== ctx.org.id) throw new Error("No autorizado");
  await db.update(rate).set({ active, updatedAt: new Date() }).where(eq(rate.id, rateId));
  revalidatePath("/tarifas");
}

export async function deleteRate(rateId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  const row = await db.query.rate.findFirst({ where: eq(rate.id, rateId), columns: { organizationId: true } });
  if (!row || row.organizationId !== ctx.org.id) throw new Error("No autorizado");
  await db.delete(rate).where(eq(rate.id, rateId));
  revalidatePath("/tarifas");
}

// ─── Cotizaciones ────────────────────────────────────────────────────────────

const quotationLineSchema = z.object({
  concept: z.string().min(1).max(200),
  unit: z.enum(["contenedor", "bl", "kg", "cbm", "unidad", "plano"]),
  quantity: z.string(),
  unitPrice: z.string(),
});

const createQuotationSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email().nullable().optional(),
  validUntil: z.string().nullable().optional(),
  taxRate: z.enum(["21", "10", "4", "0"]).default("21"),
  currency: z.string().length(3).default("EUR"),
  notes: z.string().max(1000).nullable().optional(),
  lines: z.array(quotationLineSchema).min(1),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

export async function createQuotation(
  input: CreateQuotationInput,
): Promise<{ quotationId: string; reference: string }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  const data = createQuotationSchema.parse(input);

  const year = new Date().getFullYear();
  const seq = (await countOrgQuotations(ctx.org.id)) + 1;
  const reference = `COT-${year}-${String(seq).padStart(3, "0")}`;

  const subtotal = data.lines.reduce(
    (s, l) => s + Number(l.quantity) * Number(l.unitPrice),
    0,
  );
  const taxAmount = subtotal * (Number(data.taxRate) / 100);
  const total = subtotal + taxAmount;

  const [quot] = await db
    .insert(quotation)
    .values({
      organizationId: ctx.org.id,
      reference,
      clientName: data.clientName,
      clientEmail: data.clientEmail ?? null,
      validUntil: data.validUntil ?? null,
      taxRate: data.taxRate,
      currency: data.currency,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      notes: data.notes ?? null,
      status: "borrador",
    })
    .returning({ id: quotation.id });

  await db.insert(quotationLine).values(
    data.lines.map((l, i) => ({
      quotationId: quot.id,
      concept: l.concept,
      unit: l.unit,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      subtotal: (Number(l.quantity) * Number(l.unitPrice)).toFixed(2),
      sortOrder: i,
    })),
  );

  revalidatePath("/cotizaciones");
  return { quotationId: quot.id, reference };
}

export async function updateQuotationStatus(
  quotationId: string,
  status: "borrador" | "enviada" | "aceptada" | "rechazada" | "expirada",
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  const row = await db.query.quotation.findFirst({
    where: eq(quotation.id, quotationId),
    columns: { organizationId: true },
  });
  if (!row || row.organizationId !== ctx.org.id) throw new Error("No autorizado");
  await db
    .update(quotation)
    .set({ status, updatedAt: new Date() })
    .where(eq(quotation.id, quotationId));
  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${quotationId}`);
}

export async function convertQuotationToShipment(quotationId: string): Promise<string> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const quot = await getQuotationDetail(ctx.org.id, quotationId);
  if (!quot) throw new Error("Cotización no encontrada");
  if (quot.shipmentId) throw new Error("Ya tiene un expediente asociado");

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

  const [newShipment] = await db
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

  // Añadir cliente como consignee si hay nombre
  if (quot.clientName) {
    await db.insert(party).values({
      shipmentId: newShipment.id,
      role: "consignee",
      name: quot.clientName,
    });
  }

  // Añadir líneas de cotización como cargos de ingreso
  if (quot.lines.length > 0) {
    await db.insert(charge).values(
      quot.lines.map((l) => ({
        shipmentId: newShipment.id,
        type: "otro" as const,
        direction: "revenue" as const,
        description: l.concept,
        amount: l.subtotal,
        currency: quot.currency,
      })),
    );
  }

  // Vincular expediente a la cotización y marcar como aceptada
  await db
    .update(quotation)
    .set({ shipmentId: newShipment.id, status: "aceptada", updatedAt: new Date() })
    .where(eq(quotation.id, quotationId));

  revalidatePath("/cotizaciones");
  revalidatePath("/expedientes");
  return newShipment.id;
}

export async function sendCotizacionEmail(
  quotationId: string,
  recipientEmail: string,
): Promise<void> {
  if (!EMAIL_RE.test(recipientEmail)) throw new Error("Email de destinatario inválido");

  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const quot = await getQuotationDetail(ctx.org.id, quotationId);
  if (!quot) throw new Error("Cotización no encontrada");

  await sendQuotationEmail({
    to: recipientEmail,
    orgName: ctx.org.name,
    reference: quot.reference,
    clientName: quot.clientName || recipientEmail,
    validUntil: quot.validUntil ?? null,
    lines: quot.lines.map((l) => ({
      concept: l.concept,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      subtotal: l.subtotal,
    })),
    subtotal: quot.subtotal,
    taxRate: quot.taxRate,
    total: quot.total,
    currency: quot.currency,
    notes: quot.notes ?? null,
  });

  await updateQuotationStatus(quotationId, "enviada");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendFacturaEmail(
  invoiceId: string,
  recipientEmail: string,
): Promise<void> {
  if (!EMAIL_RE.test(recipientEmail)) throw new Error("Email de destinatario inválido");

  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const inv = await getInvoiceDetail(ctx.org.id, invoiceId);
  if (!inv) throw new Error("Factura no encontrada");

  await sendInvoiceEmail({
    to: recipientEmail,
    orgName: ctx.org.name,
    reference: inv.reference,
    clientName: inv.clientName || recipientEmail,
    issueDate: inv.issueDate ?? new Date().toISOString().slice(0, 10),
    dueDate: inv.dueDate ?? null,
    lines: inv.lines.map((l) => ({
      concept: l.concept,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      subtotal: l.subtotal,
    })),
    subtotal: inv.subtotal,
    taxRate: inv.taxRate,
    total: inv.total,
    currency: inv.currency,
    notes: inv.notes ?? null,
  });

  await updateInvoiceStatus(invoiceId, "enviada");
}

// ─── Marcar expediente en aduana ─────────────────────────────────────────────

export async function markShipmentEnAduana(shipmentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Inválido");
  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");
  await db.update(shipment).set({ status: "en_aduana" }).where(eq(shipment.id, shipmentId));
  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── Comparativa IA: BL vs. factura comercial ─────────────────────────────────

const compareFieldSchema = z.object({
  blValue: z.string().nullable(),
  invoiceValue: z.string().nullable(),
  match: z.boolean(),
});

const compareResultSchema = z.object({
  shipper: compareFieldSchema,
  consignee: compareFieldSchema,
  description: compareFieldSchema,
  hsCode: compareFieldSchema,
  grossWeight: compareFieldSchema,
  quantity: compareFieldSchema,
  country: compareFieldSchema,
  incoterm: compareFieldSchema,
  discrepancySummary: z.string().describe("Resumen en español de las discrepancias encontradas. Vacío si no hay."),
});

export type CompareResult = z.infer<typeof compareResultSchema>;

export async function compareDocuments(shipmentId: string): Promise<CompareResult> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Inválido");
  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");

  const docs = await db
    .select({ id: document.id, type: document.type, blobUrl: document.blobUrl })
    .from(document)
    .where(eq(document.shipmentId, shipmentId));

  const bl = docs.find((d) => d.type === "bl" && d.blobUrl);
  const fac = docs.find((d) => d.type === "factura_comercial" && d.blobUrl);

  if (!bl?.blobUrl || !fac?.blobUrl) {
    throw new Error("Se necesitan un BL y una factura comercial subidos para comparar.");
  }

  const [blRes, facRes] = await Promise.all([fetch(bl.blobUrl), fetch(fac.blobUrl)]);
  if (!blRes.ok || !facRes.ok) throw new Error("No se pudieron descargar los documentos.");
  const [blBytes, facBytes] = await Promise.all([
    blRes.arrayBuffer().then((b) => new Uint8Array(b)),
    facRes.arrayBuffer().then((b) => new Uint8Array(b)),
  ]);
  if (blBytes.length > MAX_AI_PDF_BYTES || facBytes.length > MAX_AI_PDF_BYTES) {
    throw new Error("Algún documento supera el límite de 8 MB para comparación.");
  }

  const { object } = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: compareResultSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Eres un experto en comercio internacional. Compara los siguientes dos documentos: " +
              "el primero es un Bill of Lading (BL) y el segundo es una Factura Comercial. " +
              "Para cada campo extrae el valor de cada documento y determina si coinciden. " +
              "Sé estricto: diferencias de mayúsculas o abreviaturas son aceptables (match=true), " +
              "pero diferencias de valor, peso o cantidad son discrepancias (match=false). " +
              "PRIMER DOCUMENTO — Bill of Lading:",
          },
          { type: "file", data: blBytes, mediaType: "application/pdf" },
          { type: "text", text: "SEGUNDO DOCUMENTO — Factura Comercial:" },
          { type: "file", data: facBytes, mediaType: "application/pdf" },
        ],
      },
    ],
  });

  return object;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function completeOnboarding(): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  await db
    .update(member)
    .set({ onboarded: true })
    .where(eq(member.id, ctx.org.memberId));
}

// ─── Comentarios ─────────────────────────────────────────────────────────────

export async function addComment(shipmentId: string, body: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Inválido");
  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");

  const trimmed = body.trim();
  if (!trimmed) throw new Error("El comentario no puede estar vacío");
  if (trimmed.length > 5000) throw new Error("El comentario no puede superar 5.000 caracteres");

  const mentions = [...trimmed.matchAll(/@([\w]+)/g)].map((m) => m[1]);

  await db.insert(comment).values({
    shipmentId,
    authorId: ctx.org.memberId,
    body: trimmed,
    mentions,
  });

  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── Copiloto: contexto de datos para el panel IA ────────────────────────────

export async function getCopilotoContext(): Promise<{
  shipmentCount: number;
  activeCount: number;
  atRiskTotal: number;
  atRiskCount: number;
  topExceptions: { ref: string; kind: string; amount: number; shipmentId: string }[];
  gpByClient: { name: string; gp: number; margin: number; tier: string }[];
  activeShipments: { id: string; ref: string; status: string; carrier: string | null; eta: string | null; pol: string | null; pod: string | null }[];
} | null> {
  const ctx = await getOrgContext();
  if (!ctx?.org) return null;

  const shipments = await listShipments(ctx.org.id);

  const { computeExceptions, computeLeakageKpi, computeGpByClient } = await import("@/lib/exceptions");
  const exceptions = computeExceptions(shipments);
  const leakage = computeLeakageKpi(shipments);
  const gpClients = computeGpByClient(shipments);

  const ACTIVE = ["confirmado", "en_transito", "en_aduana"];

  return {
    shipmentCount: shipments.length,
    activeCount: shipments.filter((s) => ACTIVE.includes(s.status)).length,
    atRiskTotal: leakage.totalAtRisk,
    atRiskCount: leakage.atRiskCount,
    topExceptions: exceptions.slice(0, 3).map((e) => ({
      ref: e.shipmentReference,
      kind: e.kind,
      amount: e.riskAmount,
      shipmentId: e.shipmentId,
    })),
    gpByClient: gpClients.slice(0, 5).map((c) => ({
      name: c.name,
      gp: c.gp,
      margin: c.margin,
      tier: c.tier,
    })),
    activeShipments: shipments
      .filter((s) => ACTIVE.includes(s.status))
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        ref: s.reference,
        status: s.status,
        carrier: s.carrier,
        eta: s.eta ? new Date(s.eta).toLocaleDateString("es-ES") : null,
        pol: s.pol,
        pod: s.pod,
      })),
  };
}

// ─── Tier B: Excepciones financieras ─────────────────────────────────────────

export async function resolveAtRiskCharge(chargeId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const row = await db.query.charge.findFirst({
    where: eq(charge.id, chargeId),
    with: { shipment: { columns: { id: true, organizationId: true } } },
  });
  if (!row || row.shipment.organizationId !== ctx.org.id) throw new Error("No autorizado");

  await db.update(charge).set({ atRisk: false }).where(eq(charge.id, chargeId));

  revalidatePath(`/expedientes/${row.shipment.id}`);
  revalidatePath("/excepciones");
}

export async function deleteDraftShipment(shipmentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const row = await db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, ctx.org.id)),
    columns: { id: true, status: true },
  });
  if (!row) throw new Error("No autorizado");
  if (row.status !== "borrador") throw new Error("Solo se pueden eliminar expedientes en borrador");

  await db.delete(shipment).where(eq(shipment.id, shipmentId));

  revalidatePath("/expedientes");
  redirect("/expedientes");
}

export async function updateChargeAccrual(
  chargeId: string,
  accrualAmount: string,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!/^\d+(\.\d{1,2})?$/.test(accrualAmount)) throw new Error("Importe inválido");

  const row = await db.query.charge.findFirst({
    where: eq(charge.id, chargeId),
    with: { shipment: { columns: { id: true, organizationId: true } } },
  });
  if (!row || row.shipment.organizationId !== ctx.org.id) throw new Error("No autorizado");

  await db.update(charge).set({ accrualAmount }).where(eq(charge.id, chargeId));

  revalidatePath(`/expedientes/${row.shipment.id}`);
}

// ─── Tier D: Duplicar expediente ─────────────────────────────────────────────

export async function duplicateShipment(shipmentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Expediente inválido");

  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");

  const original = await db.query.shipment.findFirst({
    where: and(eq(shipment.id, shipmentId), eq(shipment.organizationId, ctx.org.id)),
    columns: {
      mode: true, pol: true, pod: true, carrier: true, vessel: true,
      voyage: true, incoterm: true, freightTerms: true, priority: true,
    },
    with: {
      parties: {
        columns: { role: true, name: true, taxId: true, address: true, city: true, country: true },
      },
    },
  });
  if (!original) throw new Error("Expediente no encontrado");

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

  await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(shipment)
      .values({
        organizationId: ctx.org!.id,
        reference,
        status: "borrador",
        mode: original.mode,
        priority: original.priority,
        pol: original.pol,
        pod: original.pod,
        carrier: original.carrier,
        vessel: original.vessel,
        voyage: original.voyage,
        incoterm: original.incoterm,
        freightTerms: original.freightTerms,
        createdBy: ctx.user.id,
      })
      .returning({ id: shipment.id });

    if (original.parties.length > 0) {
      await tx.insert(party).values(
        original.parties.map((p) => ({
          shipmentId: row.id,
          role: p.role,
          name: p.name,
          taxId: p.taxId ?? null,
          address: p.address ?? null,
          city: p.city ?? null,
          country: p.country ?? null,
        })),
      );
    }
  });

  revalidatePath("/expedientes");
}

// ─── Tier D: Bulk update status ───────────────────────────────────────────────

type ShipmentStatusValue = "borrador" | "confirmado" | "en_transito" | "en_aduana" | "entregado" | "facturado" | "cerrado";
const VALID_BULK_STATUSES = new Set<string>([
  "borrador", "confirmado", "en_transito", "en_aduana", "entregado", "facturado", "cerrado",
]);

export async function bulkUpdateShipmentStatus(
  shipmentIds: string[],
  newStatus: string,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!VALID_BULK_STATUSES.has(newStatus)) throw new Error("Estado inválido");

  const validIds = shipmentIds.filter((id) => UUID_RE.test(id));
  if (!validIds.length) return;

  const owned = await db.query.shipment.findMany({
    where: and(eq(shipment.organizationId, ctx.org.id), inArray(shipment.id, validIds)),
    columns: { id: true },
  });
  const ownedIds = owned.map((s) => s.id);
  if (!ownedIds.length) return;

  await db.update(shipment).set({ status: newStatus as ShipmentStatusValue }).where(inArray(shipment.id, ownedIds));
  revalidatePath("/expedientes");
}

// ─── Tier D: Bulk assign agent ────────────────────────────────────────────────

export async function bulkAssignShipments(
  shipmentIds: string[],
  memberId: string | null,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (memberId !== null && !UUID_RE.test(memberId)) throw new Error("Miembro inválido");

  const validIds = shipmentIds.filter((id) => UUID_RE.test(id));
  if (!validIds.length) return;

  const owned = await db.query.shipment.findMany({
    where: and(eq(shipment.organizationId, ctx.org.id), inArray(shipment.id, validIds)),
    columns: { id: true },
  });
  const ownedIds = owned.map((s) => s.id);
  if (!ownedIds.length) return;

  await db.update(shipment).set({ assignedTo: memberId }).where(inArray(shipment.id, ownedIds));
  revalidatePath("/expedientes");
}

// ─── Contactos CRUD ──────────────────────────────────────────────────────────

const ContactSchema = z.object({
  name: z.string().min(1),
  role: z.enum(["shipper", "consignee", "notify", "carrier", "agent", "forwarder"]),
  taxId: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  creditLimit: z.string().optional(),
  notes: z.string().optional(),
});

export async function createContact(formData: FormData): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");

  const data = ContactSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    taxId: formData.get("taxId") ?? undefined,
    email: formData.get("email") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    address: formData.get("address") ?? undefined,
    city: formData.get("city") ?? undefined,
    country: formData.get("country") ?? undefined,
    creditLimit: formData.get("creditLimit") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });

  await db.insert(contact).values({
    organizationId: ctx.org.id,
    name: data.name,
    role: data.role,
    taxId: data.taxId || null,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    city: data.city || null,
    country: data.country || null,
    creditLimit: data.creditLimit || null,
    notes: data.notes || null,
  });
  revalidatePath("/contactos");
}

export async function updateContact(id: string, formData: FormData): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");

  const data = ContactSchema.partial().parse({
    name: formData.get("name") ?? undefined,
    role: formData.get("role") ?? undefined,
    taxId: formData.get("taxId") ?? undefined,
    email: formData.get("email") ?? undefined,
    phone: formData.get("phone") ?? undefined,
    address: formData.get("address") ?? undefined,
    city: formData.get("city") ?? undefined,
    country: formData.get("country") ?? undefined,
    creditLimit: formData.get("creditLimit") ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });

  const active = formData.get("active");

  await db
    .update(contact)
    .set({
      ...data,
      ...(active !== null ? { active: active === "true" } : {}),
      taxId: data.taxId || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      country: data.country || null,
      creditLimit: data.creditLimit || null,
      notes: data.notes || null,
    })
    .where(and(eq(contact.id, id), eq(contact.organizationId, ctx.org.id)));

  revalidatePath("/contactos");
  revalidatePath(`/contactos/${id}`);
}

export async function deleteContact(id: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  await db.delete(contact).where(and(eq(contact.id, id), eq(contact.organizationId, ctx.org.id)));
  revalidatePath("/contactos");
}

export async function importContactsAction(): Promise<{ created: number }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  const result = await importContactsQuery(ctx.org.id);
  revalidatePath("/contactos");
  return result;
}

export async function addPartyToShipment(
  shipmentId: string,
  data: { name: string; role: string; taxId?: string; city?: string; country?: string },
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");

  const [s] = await db
    .select({ id: shipment.id })
    .from(shipment)
    .where(and(eq(shipment.id, shipmentId), eq(shipment.organizationId, ctx.org.id)));
  if (!s) throw new Error("Expediente no encontrado");

  const role = z
    .enum(["shipper", "consignee", "notify", "carrier", "agent", "forwarder"])
    .parse(data.role);
  const name = data.name?.trim();
  if (!name) throw new Error("La parte necesita un nombre");

  await db.insert(party).values({
    shipmentId,
    role,
    name,
    taxId: data.taxId?.trim() || null,
    city: data.city?.trim() || null,
    country: data.country?.trim() || null,
  });
  revalidatePath(`/expedientes/${shipmentId}`);
}

// ── Oportunidades (CRM Pipeline) ──────────────────────────────────────────────

const OPP_STAGES = ["prospecto", "propuesta", "negociacion", "ganado", "perdido"] as const;
type OppStage = (typeof OPP_STAGES)[number];
const OPP_MODES = ["maritimo", "aereo", "terrestre", "ferroviario", "multimodal"] as const;

// Validación en runtime del formulario de oportunidad. El tipo TS no protege
// contra datos malformados del cliente: sin esto un title null reventaba y
// stage/mode aceptaban valores fuera del enum de la DB.
const opportunityFormSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(200),
  stage: z.enum(OPP_STAGES).catch("prospecto"),
  contactId: z.string().trim().min(1).nullable(),
  mode: z.enum(OPP_MODES).nullable().catch(null),
  pol: z.string().trim().max(100).nullable(),
  pod: z.string().trim().max(100).nullable(),
  cargoType: z.string().trim().max(200).nullable(),
  estimatedValue: z.string().trim().max(30).nullable(),
  currency: z.string().trim().max(8).catch("EUR"),
  notes: z.string().trim().max(5000).nullable(),
});

function parseOpportunityForm(formData: FormData) {
  const field = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
  };
  return opportunityFormSchema.parse({
    title: field("title") ?? "",
    stage: field("stage") ?? "prospecto",
    contactId: field("contactId"),
    mode: field("mode"),
    pol: field("pol"),
    pod: field("pod"),
    cargoType: field("cargoType"),
    estimatedValue: field("estimatedValue"),
    currency: field("currency") ?? "EUR",
    notes: field("notes"),
  });
}

export async function createOpportunity(formData: FormData): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");

  const data = parseOpportunityForm(formData);

  if (data.contactId) {
    const [c] = await db
      .select({ id: contact.id })
      .from(contact)
      .where(and(eq(contact.id, data.contactId), eq(contact.organizationId, ctx.org.id)))
      .limit(1);
    if (!c) throw new Error("Contacto inválido");
  }

  await db.insert(opportunity).values({
    organizationId: ctx.org.id,
    title: data.title,
    stage: data.stage,
    contactId: data.contactId,
    mode: data.mode,
    pol: data.pol,
    pod: data.pod,
    cargoType: data.cargoType,
    estimatedValue: data.estimatedValue,
    currency: data.currency,
    notes: data.notes,
  });
  revalidatePath("/pipeline");
}

export async function updateOpportunity(id: string, formData: FormData): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  const [row] = await db
    .select({ id: opportunity.id })
    .from(opportunity)
    .where(and(eq(opportunity.id, id), eq(opportunity.organizationId, ctx.org.id)))
    .limit(1);
  if (!row) throw new Error("No encontrado");

  const data = parseOpportunityForm(formData);

  if (data.contactId) {
    const [c] = await db
      .select({ id: contact.id })
      .from(contact)
      .where(and(eq(contact.id, data.contactId), eq(contact.organizationId, ctx.org.id)))
      .limit(1);
    if (!c) throw new Error("Contacto inválido");
  }

  await db
    .update(opportunity)
    .set({
      title: data.title,
      stage: data.stage,
      contactId: data.contactId,
      mode: data.mode,
      pol: data.pol,
      pod: data.pod,
      cargoType: data.cargoType,
      estimatedValue: data.estimatedValue,
      currency: data.currency,
      notes: data.notes,
      updatedAt: new Date(),
    })
    .where(and(eq(opportunity.id, id), eq(opportunity.organizationId, ctx.org.id)));
  revalidatePath("/pipeline");
}

export async function deleteOpportunity(id: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  await db
    .delete(opportunity)
    .where(and(eq(opportunity.id, id), eq(opportunity.organizationId, ctx.org.id)));
  revalidatePath("/pipeline");
}

export async function moveOpportunityStage(id: string, stage: OppStage): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  const validStage = z.enum(OPP_STAGES).parse(stage);
  await db
    .update(opportunity)
    .set({
      stage: validStage,
      closedAt: validStage === "ganado" || validStage === "perdido" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(opportunity.id, id), eq(opportunity.organizationId, ctx.org.id)));
  revalidatePath("/pipeline");
}

// ─── Tier N: Bookings DCSA 2.0 ───────────────────────────────────────────────

type BookingStatus = "pendiente" | "recibido" | "confirmado" | "rechazado";

export interface CreateBookingInput {
  shipmentId: string;
  carrierCode: string;
  vesselName?: string;
  voyageNumber?: string;
  pol?: string;
  pod?: string;
  etd?: string; // ISO date string
  eta?: string;
  cutoffDate?: string;
  notes?: string;
}

export async function createBooking(input: CreateBookingInput): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  if (!UUID_RE.test(input.shipmentId)) throw new Error("Expediente inválido");
  const owned = await shipmentBelongsToOrg(ctx.org.id, input.shipmentId);
  if (!owned) throw new Error("No autorizado");

  await db.insert(booking).values({
    organizationId: ctx.org.id,
    shipmentId: input.shipmentId,
    carrierCode: input.carrierCode.trim().toUpperCase(),
    vesselName: input.vesselName?.trim() || null,
    voyageNumber: input.voyageNumber?.trim() || null,
    pol: input.pol?.trim() || null,
    pod: input.pod?.trim() || null,
    etd: input.etd ? new Date(input.etd) : null,
    eta: input.eta ? new Date(input.eta) : null,
    cutoffDate: input.cutoffDate ? new Date(input.cutoffDate) : null,
    notes: input.notes?.trim() || null,
    createdBy: ctx.user.id,
  });
  revalidatePath(`/expedientes/${input.shipmentId}`);
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  if (!UUID_RE.test(bookingId)) throw new Error("Booking inválido");
  await db
    .update(booking)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(booking.id, bookingId), eq(booking.organizationId, ctx.org.id)));
  revalidatePath("/expedientes");
}

export async function deleteBooking(bookingId: string, shipmentId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  await db
    .delete(booking)
    .where(and(eq(booking.id, bookingId), eq(booking.organizationId, ctx.org.id)));
  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── Tier N: VGM (Verified Gross Mass) ───────────────────────────────────────

export async function updateContainerVgm(
  containerId: string,
  shipmentId: string,
  vgmWeightKg: number | null,
  vgmMethod: "method_1" | "method_2" | null,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  if (!UUID_RE.test(containerId)) throw new Error("Contenedor inválido");
  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");

  await db
    .update(container)
    .set({
      vgmWeightKg: vgmWeightKg ?? null,
      vgmMethod: vgmMethod ?? null,
      vgmDeclaredAt: vgmWeightKg ? new Date() : null,
    })
    .where(and(eq(container.id, containerId), eq(container.shipmentId, shipmentId)));
  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── Tier N: LCL / load type ─────────────────────────────────────────────────

export async function updateShipmentLoadType(
  shipmentId: string,
  loadType: "fcl" | "lcl" | "bulk",
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  if (!UUID_RE.test(shipmentId)) throw new Error("Expediente inválido");
  await db
    .update(shipment)
    .set({ loadType, updatedAt: new Date() })
    .where(and(eq(shipment.id, shipmentId), eq(shipment.organizationId, ctx.org.id)));
  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── Tier N: Courier ──────────────────────────────────────────────────────────

export async function updateCourierInfo(
  shipmentId: string,
  provider: "ups" | "dhl" | "fedex" | null,
  trackingNumber: string | null,
  estimatedDelivery: string | null,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No session");
  if (!UUID_RE.test(shipmentId)) throw new Error("Expediente inválido");
  await db
    .update(shipment)
    .set({
      courierProvider: provider,
      courierTrackingNumber: trackingNumber?.trim() || null,
      courierEstimatedDelivery: estimatedDelivery || null,
      updatedAt: new Date(),
    })
    .where(and(eq(shipment.id, shipmentId), eq(shipment.organizationId, ctx.org.id)));
  revalidatePath(`/expedientes/${shipmentId}`);
}

// ─── Tier L: Contabilidad ─────────────────────────────────────────────────────

export async function initPGCAccounts(): Promise<{ created: number }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const existing = await db
    .select({ code: accountingAccount.code })
    .from(accountingAccount)
    .where(eq(accountingAccount.organizationId, ctx.org.id));

  const existingCodes = new Set(existing.map((r) => r.code));
  const toInsert = PGC_ACCOUNTS.filter((a) => !existingCodes.has(a.code)).map((a) => ({
    organizationId: ctx.org!.id,
    code: a.code,
    name: a.name,
    type: a.type,
    isSystem: true,
  }));

  if (toInsert.length > 0) {
    await db.insert(accountingAccount).values(toInsert);
  }

  revalidatePath("/contabilidad");
  return { created: toInsert.length };
}

export async function createJournalEntry(data: {
  reference: string;
  date: string;
  description: string;
  period: string;
  lines: { accountCode: string; accountName: string; debit: number; credit: number; description?: string }[];
}): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  if (!Array.isArray(data.lines) || data.lines.length < 2 || data.lines.length > 100) {
    throw new Error("El asiento debe tener entre 2 y 100 líneas");
  }
  for (const l of data.lines) {
    if (!Number.isFinite(l.debit) || !Number.isFinite(l.credit) || l.debit < 0 || l.credit < 0) {
      throw new Error("Importes de asiento inválidos");
    }
    if (l.debit > 999_999_999.99 || l.credit > 999_999_999.99) {
      throw new Error("Importe de asiento fuera de rango");
    }
    if (!l.accountCode?.trim() || !l.accountName?.trim()) {
      throw new Error("Cada línea necesita código y nombre de cuenta");
    }
  }

  const totalDebit = data.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = data.lines.reduce((s, l) => s + l.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error("El asiento no está cuadrado (debe ≠ haber)");
  }

  const [entry] = await db
    .insert(journalEntry)
    .values({
      organizationId: ctx.org.id,
      reference: data.reference.trim(),
      date: data.date,
      description: data.description.trim(),
      period: data.period,
      status: "contabilizado",
    })
    .returning({ id: journalEntry.id });

  await db.insert(journalEntryLine).values(
    data.lines.map((l, i) => ({
      journalEntryId: entry.id,
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: String(l.debit),
      credit: String(l.credit),
      description: l.description ?? null,
      sortOrder: i,
    })),
  );

  revalidatePath("/contabilidad");
}

export async function autoPostInvoiceJournal(invoiceId: string, orgId: string): Promise<void> {
  const inv = await db.query.invoice.findFirst({
    where: eq(invoice.id, invoiceId),
    with: { lines: true },
  });
  if (!inv) return;

  const subtotal = inv.lines.reduce((s, l) => s + Number(l.quantity) * Number(l.unitPrice), 0);
  const ivaAmount = subtotal * (Number(inv.taxRate) / 100);
  const total = subtotal + ivaAmount;
  const issueDate = inv.issueDate ? new Date(inv.issueDate) : new Date();
  const period = `${issueDate.getFullYear()}-${String(issueDate.getMonth() + 1).padStart(2, "0")}`;

  const [entry] = await db
    .insert(journalEntry)
    .values({
      organizationId: orgId,
      reference: `FAC-${inv.reference ?? invoiceId.slice(0, 8)}`,
      date: issueDate.toISOString().slice(0, 10),
      description: `Factura emitida ${inv.reference ?? invoiceId.slice(0, 8)}`,
      period,
      status: "contabilizado",
      invoiceId,
    })
    .returning({ id: journalEntry.id });

  const entryLines = [
    { accountCode: "430", accountName: "Clientes", debit: String(total), credit: "0", sortOrder: 0 },
    { accountCode: "705", accountName: "Prestaciones de servicios", debit: "0", credit: String(subtotal), sortOrder: 1 },
  ];
  if (ivaAmount > 0) {
    entryLines.push({ accountCode: "477", accountName: "Hacienda Pública, IVA repercutido", debit: "0", credit: String(ivaAmount), sortOrder: 2 });
  }

  await db.insert(journalEntryLine).values(
    entryLines.map((l) => ({ ...l, journalEntryId: entry.id, description: null })),
  );
}

// ─── Tier M: Compliance & e-Factura ──────────────────────────────────────────

function fakeHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return `SHA256:${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.slice(0, 71);
}

export async function submitVerifactu(invoiceId: string): Promise<{ referenceNumber: string; hash: string }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(invoiceId)) throw new Error("Factura inválida");

  const inv = await db.query.invoice.findFirst({
    where: eq(invoice.id, invoiceId),
    with: { shipment: { columns: { id: true, organizationId: true } } },
  });
  if (!inv || inv.shipment.organizationId !== ctx.org.id) throw new Error("No autorizado");

  const existing = await db
    .select({ id: complianceDeclaration.id })
    .from(complianceDeclaration)
    .where(and(eq(complianceDeclaration.invoiceId, invoiceId), eq(complianceDeclaration.type, "verifactu")));

  if (existing.length > 0) throw new Error("Ya registrada en Verifactu");

  const hash = fakeHash(`${invoiceId}-${inv.reference}-${inv.total}-${inv.issueDate}`);
  const refNumber = `VERI-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  await db.insert(complianceDeclaration).values({
    organizationId: ctx.org.id,
    invoiceId,
    type: "verifactu",
    referenceNumber: refNumber,
    status: "aceptada",
    xmlHash: hash,
    submittedAt: new Date(),
    data: { invoiceRef: inv.reference, total: inv.total, taxRate: inv.taxRate },
  });

  revalidatePath(`/facturas/${invoiceId}`);
  return { referenceNumber: refNumber, hash };
}

export async function submitDeclaration(
  shipmentId: string,
  type: "ens" | "ncts" | "aes",
  data: Record<string, string>,
): Promise<{ referenceNumber: string }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(shipmentId)) throw new Error("Expediente inválido");

  const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
  if (!owned) throw new Error("No autorizado");

  const existing = await db
    .select({ id: complianceDeclaration.id })
    .from(complianceDeclaration)
    .where(and(eq(complianceDeclaration.shipmentId, shipmentId), eq(complianceDeclaration.type, type)));

  if (existing.length > 0) throw new Error("Declaración ya enviada");

  const prefixes: Record<string, string> = { ens: "ENS", ncts: "NCTS", aes: "AES" };
  const refNumber = `${prefixes[type]}-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  await db.insert(complianceDeclaration).values({
    organizationId: ctx.org.id,
    shipmentId,
    type,
    referenceNumber: refNumber,
    status: "aceptada",
    submittedAt: new Date(),
    data,
  });

  revalidatePath(`/expedientes/${shipmentId}`);
  return { referenceNumber: refNumber };
}


// ─── Tier P: Partners ─────────────────────────────────────────────────────────

type PartnerType = "agent" | "co-loader" | "subcontractor" | "carrier" | "customs" | "other";

export async function createPartner(input: {
  name: string;
  type: PartnerType;
  region: string;
  services: string[];
  contactEmail?: string;
  taxId?: string;
}): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  await db.insert(partner).values({
    organizationId: ctx.org.id,
    name: input.name.trim(),
    type: input.type,
    region: input.region.trim(),
    services: input.services,
    contactEmail: input.contactEmail?.trim() || null,
    taxId: input.taxId?.trim() || null,
    active: true,
  });

  revalidatePath("/partners");
}

export async function updatePartner(
  partnerId: string,
  input: Partial<{
    name: string;
    type: PartnerType;
    region: string;
    services: string[];
    contactEmail: string;
    taxId: string;
    active: boolean;
  }>,
): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(partnerId)) throw new Error("Partner inválido");

  const [existing] = await db
    .select({ id: partner.id })
    .from(partner)
    .where(and(eq(partner.id, partnerId), eq(partner.organizationId, ctx.org.id)));
  if (!existing) throw new Error("No autorizado");

  await db.update(partner).set(input).where(eq(partner.id, partnerId));
  revalidatePath("/partners");
}

export async function deletePartner(partnerId: string): Promise<void> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  if (!UUID_RE.test(partnerId)) throw new Error("Partner inválido");

  const [existing] = await db
    .select({ id: partner.id })
    .from(partner)
    .where(and(eq(partner.id, partnerId), eq(partner.organizationId, ctx.org.id)));
  if (!existing) throw new Error("No autorizado");

  await db.delete(partner).where(eq(partner.id, partnerId));
  revalidatePath("/partners");
}

export async function runSanctionsScreening(name: string): Promise<{
  result: "clear" | "match" | "review";
  matches: { list: string; score: number }[];
}> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const cleaned = name.trim();
  // Deterministic simulation: names with known risky patterns flag for review
  const riskyTokens = ["iran", "russia", "korea", "sanctioned", "ofac"];
  const lc = cleaned.toLowerCase();
  const hit = riskyTokens.find((t) => lc.includes(t));

  const result = hit ? "match" : "clear";
  const matches = hit
    ? [{ list: "OFAC-SDN", score: 0.91 }, { list: "EU-SIRA", score: 0.84 }]
    : [];

  await db.insert(sanctionsScreening).values({
    organizationId: ctx.org.id,
    name: cleaned,
    result,
    matches,
    screenedAt: new Date(),
  });

  return { result, matches };
}


// ─── Tier Q: API Keys & Webhooks ──────────────────────────────────────────────

async function requireOwner() {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");
  const [me] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.userId, ctx.user.id), eq(member.organizationId, ctx.org.id)));
  if (me?.role !== "owner") throw new Error("Solo el owner puede gestionar API keys y webhooks");
  return ctx;
}

export async function listApiKeys(): Promise<{ id: string; name: string; prefix: string; lastUsedAt: Date | null; createdAt: Date }[]> {
  const ctx = await requireOwner();

  return db
    .select({ id: apiKey.id, name: apiKey.name, prefix: apiKey.prefix, lastUsedAt: apiKey.lastUsedAt, createdAt: apiKey.createdAt })
    .from(apiKey)
    .where(eq(apiKey.organizationId, ctx.org!.id))
    .orderBy(desc(apiKey.createdAt));
}

export async function createApiKey(name: string): Promise<{ raw: string }> {
  const ctx = await requireOwner();

  const { generateApiKey, sha256hex } = await import("@/lib/api-auth");
  const { raw, prefix } = generateApiKey();
  const hash = await sha256hex(raw);

  await db.insert(apiKey).values({
    organizationId: ctx.org!.id,
    name: name.trim(),
    keyHash: hash,
    prefix,
  });

  revalidatePath("/settings");
  return { raw };
}

export async function revokeApiKey(keyId: string): Promise<void> {
  const ctx = await requireOwner();
  if (!UUID_RE.test(keyId)) throw new Error("Key inválida");

  await db.delete(apiKey).where(and(eq(apiKey.id, keyId), eq(apiKey.organizationId, ctx.org!.id)));
  revalidatePath("/settings");
}

export async function listWebhooks(): Promise<{ id: string; url: string; events: string[]; active: boolean; createdAt: Date }[]> {
  const ctx = await requireOwner();

  return db
    .select({ id: webhook.id, url: webhook.url, events: webhook.events, active: webhook.active, createdAt: webhook.createdAt })
    .from(webhook)
    .where(eq(webhook.organizationId, ctx.org!.id))
    .orderBy(desc(webhook.createdAt));
}

export async function deleteWebhook(webhookId: string): Promise<void> {
  const ctx = await requireOwner();
  if (!UUID_RE.test(webhookId)) throw new Error("Webhook inválido");

  await db.delete(webhook).where(and(eq(webhook.id, webhookId), eq(webhook.organizationId, ctx.org!.id)));
  revalidatePath("/settings");
}


export async function bulkImportRates(rows: RateInput[]): Promise<{ imported: number; errors: string[] }> {
  const ctx = await getOrgContext();
  if (!ctx?.org) throw new Error("No autorizado");

  const errors: string[] = [];
  const valid: RateInput[] = [];

  for (const [i, row] of rows.entries()) {
    const parsed = rateSchema.safeParse(row);
    if (parsed.success) {
      valid.push(parsed.data);
    } else {
      errors.push(`Fila ${i + 2}: ${parsed.error.issues[0]?.message ?? "inválida"}`);
    }
  }

  if (valid.length > 0) {
    await db.insert(rate).values(
      valid.map((d) => ({
        organizationId: ctx.org!.id,
        concept: d.concept,
        serviceType: d.serviceType,
        unit: d.unit,
        basePrice: d.basePrice,
        currency: d.currency,
        validFrom: d.validFrom ?? null,
        validTo: d.validTo ?? null,
        notes: d.notes ?? null,
        active: true,
      })),
    );
    revalidatePath("/tarifas");
  }

  return { imported: valid.length, errors };
}
