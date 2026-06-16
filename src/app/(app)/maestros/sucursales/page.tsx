import { notFound } from "next/navigation";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listBranches } from "@/lib/maestros-actions";
import { BranchesPanel } from "@/components/app/branches-panel";

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

      <div className="flex items-center gap-3">
        <Building2 className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Empresas y sucursales
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Sedes y delegaciones de la organización
          </p>
        </div>
      </div>

      <BranchesPanel branches={branches} />
    </div>
  );
}
