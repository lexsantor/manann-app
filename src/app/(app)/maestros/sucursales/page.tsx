import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listBranches } from "@/lib/maestros-actions";
import { BranchesPanel } from "@/components/app/branches-panel";
import { PageHeader } from "@/components/ui/page-header";

export default async function SucursalesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const branches = await listBranches();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Empresas y sucursales</span>
      </div>

      <PageHeader
        icon={<Building2 strokeWidth={1.5} />}
        title="Empresas y sucursales"
        subtitle="Sedes y delegaciones de la organización"
      />

      <BranchesPanel branches={branches} />
    </div>
  );
}
