import { notFound } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
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

      <PageHeader
        icon={<ClipboardList strokeWidth={1.5} />}
        title="No conformidades"
        subtitle="Gestión de NC con causa raíz y acciones correctivas"
      />

      <NonConformityPanel initialItems={items} />
    </div>
  );
}
