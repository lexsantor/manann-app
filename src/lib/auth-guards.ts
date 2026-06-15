// Guards de autorización compartidos. Centraliza requireOrg/requireOwner que
// antes estaban duplicados (y con lógica divergente) en cada *-actions.ts.
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { member } from "@/db/schema";
import { getOrgContext } from "@/lib/erp";

// Exige sesión + org activa. Devuelve el orgId.
export async function requireOrg(): Promise<string> {
  const ctx = await getOrgContext();
  if (!ctx?.org?.id) throw new Error("No org");
  return ctx.org.id;
}

// Exige que el miembro activo tenga rol owner. Devuelve el orgId.
export async function requireOwner(): Promise<string> {
  const ctx = await getOrgContext();
  if (!ctx?.org?.id) throw new Error("No org");
  const m = await db.query.member.findFirst({
    where: eq(member.id, ctx.org.memberId),
    columns: { role: true },
  });
  if (m?.role !== "owner") throw new Error("Solo el propietario puede realizar esta acción");
  return ctx.org.id;
}
