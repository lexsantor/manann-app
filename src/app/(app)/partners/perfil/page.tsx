import { notFound } from "next/navigation";
import { UserCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { getOrgProfile } from "@/lib/tier-v-actions";
import { OrgProfilePanel } from "@/components/app/org-profile-panel";

export default async function PerfilPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const profile = await getOrgProfile();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/partners" className="hover:text-foreground transition-colors">Partners</Link>
        <span>/</span>
        <span className="text-foreground">Perfil de red</span>
      </div>

      <PageHeader
        icon={<UserCircle strokeWidth={1.5} />}
        title="Perfil en la red"
        subtitle="Visible para otros miembros de la red de corresponsales"
      />

      <OrgProfilePanel initialProfile={profile} />
    </div>
  );
}
