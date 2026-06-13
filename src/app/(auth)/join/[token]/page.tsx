import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { eq, and, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import { invitation } from "@/db/schema";
import { getOrgContext } from "@/lib/erp";
import { AcceptInviteButton } from "@/components/app/accept-invite-button";

export const metadata: Metadata = { title: "Invitación — Manann" };

interface Props {
  params: Promise<{ token: string }>;
}

export default async function JoinPage({ params }: Props) {
  const { token } = await params;

  const invite = await db.query.invitation.findFirst({
    where: and(
      eq(invitation.token, token),
      gt(invitation.expiresAt, new Date()),
      isNull(invitation.usedAt),
    ),
    with: { organization: true },
  });

  if (!invite) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Invitación no válida</h1>
        <p className="text-sm text-muted-foreground">
          Este enlace ha expirado o ya fue utilizado.
        </p>
        <Link href="/" className="text-sm text-primary underline underline-offset-4">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const ctx = await getOrgContext();

  if (!ctx?.user) {
    // No hay sesión: redirigir a login con retorno al link de invitación
    redirect(`/login?redirect=/join/${token}`);
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Invitación a {invite.organization.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Has sido invitado a unirte a <strong>{invite.organization.name}</strong> en Manann.
        </p>
      </div>
      <div className="rounded-md border bg-card p-4 text-sm">
        <p className="text-muted-foreground">
          Al aceptar, tu cuenta{" "}
          <span className="font-medium text-foreground">{ctx.user.email}</span>{" "}
          quedará vinculada a esta organización.
        </p>
      </div>
      <AcceptInviteButton token={token} />
    </div>
  );
}
