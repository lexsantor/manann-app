import { notFound } from "next/navigation";
import { UserCircle } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { getOrgProfile } from "@/lib/tier-v-actions";
import { OrgProfilePanel } from "@/components/app/org-profile-panel";

export default async function PerfilPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const profile = await getOrgProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/partners" className="hover:text-foreground transition-colors">Partners</Link>
        <span>/</span>
        <span className="text-foreground">Perfil de red</span>
      </div>

      <div className="flex items-center gap-3">
        <UserCircle className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Perfil en la red
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Visible para otros miembros de la red de corresponsales
          </p>
        </div>
      </div>

      <OrgProfilePanel initialProfile={profile} />
    </div>
  );
}
