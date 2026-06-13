import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getOrgSettings } from "@/lib/settings-actions";
import { OrgNameForm } from "@/components/app/settings-org-name";
import { MembersTable } from "@/components/app/settings-members";
import { InviteForm } from "@/components/app/settings-invite";

export const metadata: Metadata = { title: "Ajustes — Manann" };

export default async function SettingsPage() {
  const data = await getOrgSettings();
  if (!data?.org) redirect("/login");

  const isOwner = data.members.find((m) => m.memberId === data.currentMemberId)?.role === "owner";

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-4 py-10">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gestiona tu organización y el equipo.
        </p>
      </div>

      {/* Organización */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Organización
        </h2>
        <div className="rounded-md border bg-card p-5">
          <OrgNameForm currentName={data.org.name} isOwner={isOwner} />
        </div>
      </section>

      {/* Equipo */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Equipo
          </h2>
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {data.members.length} miembro{data.members.length !== 1 ? "s" : ""}
          </span>
        </div>
        <MembersTable
          members={data.members}
          currentMemberId={data.currentMemberId}
          isOwner={isOwner}
        />
        {isOwner && (
          <div className="rounded-md border bg-card p-5">
            <p className="mb-3 text-sm font-medium">Invitar miembro</p>
            <InviteForm />
          </div>
        )}
      </section>
    </main>
  );
}
