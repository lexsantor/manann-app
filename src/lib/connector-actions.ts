"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { connector } from "@/db/schema";
import { requireOrg } from "@/lib/auth-guards";
import { CONNECTOR_KEYS } from "@/lib/connectors-catalog";

// NUNCA devolvemos `config` al cliente: solo estado. (Evita filtrar credenciales.)
export async function listConnectorStates() {
  const orgId = await requireOrg();
  return db
    .select({
      id: connector.id,
      key: connector.key,
      status: connector.status,
      connectedAt: connector.connectedAt,
    })
    .from(connector)
    .where(eq(connector.organizationId, orgId));
}

const configSchema = z
  .record(z.string(), z.string().max(512))
  .refine((o) => Object.keys(o).length <= 10, "Demasiados campos de configuración");

export async function connectConnector(key: string, config: Record<string, string>) {
  // requireOrg (no requireOwner) a propósito: la cuenta demo es member y debe
  // poder probar la conexión. Son conexiones SIMULADAS sin credencial real.
  const orgId = await requireOrg();
  if (!CONNECTOR_KEYS.includes(key)) throw new Error("Conector desconocido");
  const parsed = configSchema.parse(config);

  // No persistimos credenciales en claro: guardamos solo una pista redactada.
  const redacted: Record<string, string> = {};
  for (const [k, v] of Object.entries(parsed)) {
    redacted[k] = v.length > 4 ? `${v.slice(0, 3)}••••` : v ? "••••" : "";
  }

  await db
    .insert(connector)
    .values({ organizationId: orgId, key, status: "connected", config: redacted, connectedAt: new Date() })
    .onConflictDoUpdate({
      target: [connector.organizationId, connector.key],
      set: { status: "connected", config: redacted, connectedAt: new Date() },
    });
  revalidatePath("/conectores");
}

export async function disconnectConnector(key: string) {
  const orgId = await requireOrg();
  await db
    .update(connector)
    .set({ status: "disconnected", connectedAt: null })
    .where(and(eq(connector.organizationId, orgId), eq(connector.key, key)));
  revalidatePath("/conectores");
}
