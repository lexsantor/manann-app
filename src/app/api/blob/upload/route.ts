// Genera el token de subida cliente→Blob de Vercel.
// Seguridad: antes de emitir token, verifica sesión Y que el expediente
// pertenece a la org del usuario (anti-IDOR: nadie sube a un expediente ajeno).
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getOrgContext, shipmentBelongsToOrg } from "@/lib/erp";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const ctx = await getOrgContext();
        if (!ctx?.org) throw new Error("No autorizado");

        const { shipmentId } = JSON.parse(clientPayload ?? "{}") as {
          shipmentId?: string;
        };
        if (!shipmentId || !UUID_RE.test(shipmentId)) {
          throw new Error("Expediente inválido");
        }
        const owned = await shipmentBelongsToOrg(ctx.org.id, shipmentId);
        if (!owned) throw new Error("No autorizado");

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ shipmentId, orgId: ctx.org.id }),
        };
      },
      // En localhost el callback no llega; el registro del documento lo hace
      // una Server Action tras resolver upload() en el cliente.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de subida";
    return NextResponse.json(
      { error: message },
      { status: message === "No autorizado" ? 401 : 400 },
    );
  }
}
