import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

import { getOrgSettings } from "@/lib/settings-actions";
import { listApiKeys } from "@/lib/erp-actions";
import { OrgNameForm } from "@/components/app/settings-org-name";
import { MembersTable } from "@/components/app/settings-members";
import { InviteForm } from "@/components/app/settings-invite";
import { DisplayPrefsSection } from "@/components/app/settings-display-prefs";
import { NotificationsSection } from "@/components/app/settings-notifications";
import { SecuritySection, DataPrivacySection } from "@/components/app/settings-account";
import { ApiKeysPanel } from "@/components/app/api-keys-panel";

export const metadata: Metadata = { title: "Ajustes — Manann" };

export default async function SettingsPage() {
  const data = await getOrgSettings();
  if (!data?.org) redirect("/login");

  const isOwner = data.members.find((m) => m.memberId === data.currentMemberId)?.role === "owner";
  const apiKeys = isOwner ? await listApiKeys() : [];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Settings strokeWidth={1.5} />}
        title="Ajustes"
        subtitle="Organización, equipo, notificaciones, seguridad y preferencias."
      />

      {/* Organización */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Organización
        </h2>
        <div className="rounded-xl border border-border bg-card p-5">
          <OrgNameForm currentName={data.org.name} isOwner={isOwner} />
        </div>
      </section>

      {/* Equipo */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Equipo
          </h2>
          <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-base text-muted-foreground">
            {data.members.length} miembro{data.members.length !== 1 ? "s" : ""}
          </span>
        </div>
        <MembersTable
          members={data.members}
          currentMemberId={data.currentMemberId}
          isOwner={isOwner}
        />
        {isOwner && (
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mb-3 text-base font-medium">Invitar miembro</p>
            <InviteForm />
          </div>
        )}
      </section>

      <NotificationsSection />

      <DisplayPrefsSection />

      <SecuritySection />

      {isOwner && <DataPrivacySection />}

      {/* API — solo owner */}
      {isOwner && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            API pública
          </h2>
          <ApiKeysPanel keys={apiKeys} />
        </section>
      )}
    </div>
  );
}
