import { notFound } from "next/navigation";
import { FileCheck2 } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listCustomsRegimes } from "@/lib/maestros-actions";
import { CustomsRegimesTable } from "@/components/app/customs-regimes-table";
import { PageHeader } from "@/components/ui/page-header";

export default async function RegimenesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const regimes = await listCustomsRegimes();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Regímenes aduaneros</span>
      </div>

      <PageHeader
        icon={<FileCheck2 strokeWidth={1.5} />}
        title="Regímenes aduaneros"
        subtitle={`Códigos HS/TARIC — ${regimes.length} regímenes activos`}
      />

      <CustomsRegimesTable regimes={regimes} />
    </div>
  );
}
