"use server";
import { randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { member, organization, invitation, user } from "@/db/schema";
import { getOrgContext } from "@/lib/erp";
import { sendInviteEmail } from "@/lib/email";

// ─── Lectura ──────────────────────────────────────────────────────────────────

export async function getOrgSettings() {
  const ctx = await getOrgContext();
  if (!ctx?.org) return null;

  const [org, members] = await Promise.all([
    db.query.organization.findFirst({
      where: eq(organization.id, ctx.org.id),
    }),
    db
      .select({
        memberId: member.id,
        role: member.role,
        createdAt: member.createdAt,
        userId: user.id,
        name: user.name,
        email: user.email,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, ctx.org.id))
      .orderBy(member.createdAt),
  ]);

  return { org, members, currentMemberId: ctx.org.memberId, currentRole: ctx.user };
}

// ─── Editar nombre de org ─────────────────────────────────────────────────────

export async function updateOrgName(name: string) {
  const ctx = await getOrgContext();
  if (!ctx?.org) return { error: "Sin sesión" };

  const m = await db.query.member.findFirst({
    where: and(eq(member.organizationId, ctx.org.id), eq(member.userId, ctx.user.id)),
  });
  if (m?.role !== "owner") return { error: "Solo el owner puede renombrar la organización" };

  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) return { error: "Nombre demasiado corto" };
  if (trimmed.length > 80) return { error: "Nombre demasiado largo (máx 80 caracteres)" };

  await db.update(organization).set({ name: trimmed }).where(eq(organization.id, ctx.org.id));
  revalidatePath("/settings");
  return { ok: true };
}

// ─── Invitar miembro ──────────────────────────────────────────────────────────

export async function inviteMember(email: string) {
  const ctx = await getOrgContext();
  if (!ctx?.org) return { error: "Sin sesión" };

  const m = await db.query.member.findFirst({
    where: and(eq(member.organizationId, ctx.org.id), eq(member.userId, ctx.user.id)),
  });
  if (m?.role !== "owner") return { error: "Solo el owner puede invitar miembros" };

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: "Email no válido" };
  }

  // Comprobar si ya es miembro
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, normalizedEmail),
  });
  if (existingUser) {
    const existingMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, ctx.org.id),
        eq(member.userId, existingUser.id),
      ),
    });
    if (existingMember) return { error: "Este usuario ya pertenece a la organización" };
  }

  // Token seguro de 32 bytes (hex)
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  await db.insert(invitation).values({
    organizationId: ctx.org.id,
    email: normalizedEmail,
    token,
    expiresAt,
    createdBy: ctx.user.id,
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "https://manann.vercel.app";
  const inviteUrl = `${baseUrl}/join/${token}`;

  await sendInviteEmail(normalizedEmail, ctx.org.name, inviteUrl);
  revalidatePath("/settings");
  return { ok: true };
}

// ─── Cambiar rol ──────────────────────────────────────────────────────────────

export async function updateMemberRole(targetMemberId: string, role: "owner" | "member") {
  const ctx = await getOrgContext();
  if (!ctx?.org) return { error: "Sin sesión" };

  const m = await db.query.member.findFirst({
    where: and(eq(member.organizationId, ctx.org.id), eq(member.userId, ctx.user.id)),
  });
  if (m?.role !== "owner") return { error: "Solo el owner puede cambiar roles" };
  if (m.id === targetMemberId) return { error: "No puedes cambiar tu propio rol" };

  await db
    .update(member)
    .set({ role })
    .where(and(eq(member.id, targetMemberId), eq(member.organizationId, ctx.org.id)));

  revalidatePath("/settings");
  return { ok: true };
}

// ─── Eliminar miembro ─────────────────────────────────────────────────────────

export async function removeMember(targetMemberId: string) {
  const ctx = await getOrgContext();
  if (!ctx?.org) return { error: "Sin sesión" };

  const m = await db.query.member.findFirst({
    where: and(eq(member.organizationId, ctx.org.id), eq(member.userId, ctx.user.id)),
  });
  if (m?.role !== "owner") return { error: "Solo el owner puede eliminar miembros" };
  if (m.id === targetMemberId) return { error: "No puedes eliminarte a ti mismo" };

  await db
    .delete(member)
    .where(and(eq(member.id, targetMemberId), eq(member.organizationId, ctx.org.id)));

  revalidatePath("/settings");
  return { ok: true };
}

// ─── Aceptar invitación ───────────────────────────────────────────────────────

export async function acceptInvitation(token: string) {
  const ctx = await getOrgContext();
  if (!ctx?.org) return { error: "Debes iniciar sesión antes de aceptar la invitación" };

  const invite = await db.query.invitation.findFirst({
    where: and(eq(invitation.token, token), gt(invitation.expiresAt, new Date())),
  });

  if (!invite) return { error: "Invitación no válida o expirada" };
  if (invite.usedAt) return { error: "Esta invitación ya fue utilizada" };

  // La invitación es nominal: el email del usuario logueado debe coincidir con
  // el destinatario. Sin esto, cualquiera con un token válido entraría en la org.
  if (invite.email.trim().toLowerCase() !== ctx.user.email.trim().toLowerCase()) {
    return { error: "Esta invitación no corresponde a tu cuenta" };
  }

  // Comprobar si ya es miembro
  const existing = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, invite.organizationId),
      eq(member.userId, ctx.user.id),
    ),
  });
  if (existing) return { error: "Ya eres miembro de esta organización" };

  await db.transaction(async (tx) => {
    await tx.insert(member).values({
      organizationId: invite.organizationId,
      userId: ctx.user.id,
      role: "member",
    });
    await tx
      .update(invitation)
      .set({ usedAt: new Date() })
      .where(eq(invitation.id, invite.id));
  });

  return { ok: true, orgId: invite.organizationId };
}
