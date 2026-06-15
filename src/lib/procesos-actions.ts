"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { webhookEvent } from "@/db/schema";
import { requireOrg } from "@/lib/auth-guards";

export async function listWebhookEvents(limit = 100) {
  const orgId = await requireOrg();
  return db.query.webhookEvent.findMany({
    where: eq(webhookEvent.organizationId, orgId),
    orderBy: [desc(webhookEvent.createdAt)],
    limit,
  });
}

export async function retryWebhookEvent(id: string) {
  const orgId = await requireOrg();
  const ev = await db.query.webhookEvent.findFirst({
    where: and(eq(webhookEvent.id, id), eq(webhookEvent.organizationId, orgId)),
    columns: { id: true },
  });
  if (!ev) throw new Error("Evento no encontrado");

  // Simulation: mark as retried
  await db
    .update(webhookEvent)
    .set({ status: "pendiente", attempts: 1, lastAttemptAt: new Date() })
    .where(and(eq(webhookEvent.id, id), eq(webhookEvent.organizationId, orgId)));
  revalidatePath("/procesos/eventos");
}

export async function deleteWebhookEvent(id: string) {
  const orgId = await requireOrg();
  await db
    .delete(webhookEvent)
    .where(and(eq(webhookEvent.id, id), eq(webhookEvent.organizationId, orgId)));
  revalidatePath("/procesos/eventos");
}
