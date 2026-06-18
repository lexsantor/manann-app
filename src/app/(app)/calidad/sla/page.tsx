import { notFound } from "next/navigation";
import { Timer } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listSlaDefinitions } from "@/lib/calidad-actions";
import { SlaPanel } from "@/components/app/sla-panel";

export default async function SlaPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const items = await listSlaDefinitions();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/calidad" className="hover:text-foreground transition-colors">
          Calidad
        </Link>
        <span>/</span>
        <span className="text-foreground">SLA</span>
      </div>

      <PageHeader
        icon={<Timer strokeWidth={1.5} />}
        title="Definición de SLA"
        subtitle="Objetivos de tiempo por métrica y modo de transporte"
      />

      <SlaPanel initialItems={items} />
    </div>
  );
}
