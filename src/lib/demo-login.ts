"use server";

import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { user, organization, member } from "@/db/schema";
import { auth } from "@/lib/auth";

// Acceso directo de demostración para stakeholders, sin magic link.
// La credencial vive SOLO en el servidor (este módulo "use server" nunca llega
// al cliente). Cuenta pública sobre datos simulados, aislada en la org demo.
const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@manann.app";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "manann-demo-acceso-2026";
const DEMO_ORG_SLUG = "atlantica";

export async function enterDemo() {
  // 1) Crear la cuenta demo si no existe (idempotente y autosembrante: el
  //    primer clic en prod la crea, sin paso de seed manual).
  let demoUser = await db.query.user.findFirst({
    where: eq(user.email, DEMO_EMAIL),
    columns: { id: true },
  });
  if (!demoUser) {
    try {
      await auth.api.signUpEmail({
        body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, name: "Invitado Demo" },
      });
    } catch {
      // Otra petición simultánea pudo crearla; continuamos.
    }
    demoUser = await db.query.user.findFirst({
      where: eq(user.email, DEMO_EMAIL),
      columns: { id: true },
    });
  }

  // 2) Asegurar membresía en una org con datos seeded (la demo "atlantica";
  //    si no existe, la primera org disponible).
  if (demoUser) {
    // Membresía SOLO en la org demo identificada por slug EXACTO. SIN fallback a
    // "la primera org que exista": adjuntaría la cuenta demo (pública) a una org
    // real → fuga de aislamiento multi-tenant. Si la demo no está sembrada,
    // fallar fuerte en vez de adivinar.
    const org = await db.query.organization.findFirst({
      where: eq(organization.slug, DEMO_ORG_SLUG),
      columns: { id: true },
    });
    if (!org) {
      throw new Error("La organización demo no está sembrada (slug 'atlantica').");
    }
    const existing = await db.query.member.findFirst({
      where: and(eq(member.organizationId, org.id), eq(member.userId, demoUser.id)),
      columns: { id: true },
    });
    if (!existing) {
      await db.insert(member).values({
        organizationId: org.id,
        userId: demoUser.id,
        role: "member",
        onboarded: true,
      });
    }
  }

  // 3) Iniciar sesión (nextCookies fija la cookie) y entrar al ERP.
  await auth.api.signInEmail({
    body: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  redirect("/dashboard");
}
