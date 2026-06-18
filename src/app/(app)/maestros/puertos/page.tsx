import { notFound } from "next/navigation";
import { Anchor, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { MASTER_PORTS } from "@/lib/master-ports";
import { PortsTable } from "@/components/app/ports-table";
import { PageHeader } from "@/components/ui/page-header";

export default async function PuertosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Puertos</span>
      </div>

      <PageHeader
        icon={<Anchor strokeWidth={1.5} />}
        title="Puertos marítimos"
        subtitle={`${MASTER_PORTS.length} puertos · Catálogo UN/LOCODE`}
      />

      <PortsTable ports={MASTER_PORTS} />
    </div>
  );
}
