"use server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { member } from "@/db/schema";
import { getCurrentSession } from "@/lib/session";

export async function switchOrg(orgId: string) {
  const session = await getCurrentSession();
  if (!session) return { error: "Sin sesión" };

  // Verificar que el usuario realmente pertenece a esa org
  const m = await db.query.member.findFirst({
    where: and(eq(member.organizationId, orgId), eq(member.userId, session.user.id)),
    columns: { id: true },
  });
  if (!m) return { error: "No perteneces a esta organización" };

  const jar = await cookies();
  jar.set("activeOrgId", orgId, {
    path: "/",
    httpOnly: true, // solo lo lee el servidor; no hace falta en JS de cliente
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 año
  });

  redirect("/dashboard");
}
