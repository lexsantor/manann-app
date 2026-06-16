"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { connector } from "@/db/schema";
import { requireOrg } from "@/lib/auth-guards";
import { CONNECTOR_KEYS } from "@/lib/connectors-catalog";

export async function listConnectorStates() {
  const orgId = await requireOrg();
  return db.select().from(connector).where(eq(connector.organizationId, orgId));
}

export async function connectConnector(key: string, config: Record<string, string>) {
  const orgId = await requireOrg();
  if (!CONNECTOR_KEYS.includes(key)) throw new Error("Conector desconocido");
  await db
    .insert(connector)
    .values({ organizationId: orgId, key, status: "connected", config, connectedAt: new Date() })
    .onConflictDoUpdate({
      target: [connector.organizationId, connector.key],
      set: { status: "connected", config, connectedAt: new Date() },
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
