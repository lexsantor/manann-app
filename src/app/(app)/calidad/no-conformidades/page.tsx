import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listNonConformities } from "@/lib/calidad-actions";
import { NonConformityPanel } from "@/components/app/non-conformity-panel";

export default async function NoConformidadesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const items = await listNonConformities();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/calidad" className="hover:text-foreground transition-colors">
          Calidad
        </Link>
        <span>/</span>
        <span className="text-foreground">No conformidades</span>
      </div>

      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            No conformidades
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Gestión de NC con causa raíz y acciones correctivas
          </p>
        </div>
      </div>

      <NonConformityPanel initialItems={items} />
    </div>
  );
}
