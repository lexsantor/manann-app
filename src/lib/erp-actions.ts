"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { document } from "@/db/schema";
import { getOrgContext, shipmentBelongsToOrg } from "@/lib/erp";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
