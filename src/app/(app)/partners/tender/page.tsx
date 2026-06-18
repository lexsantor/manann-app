import { notFound } from "next/navigation";
import { FileSearch } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listTenders } from "@/lib/tier-v-actions";
import { TenderPanel } from "@/components/app/tender-panel";
import { SimBadge } from "@/components/ui/sim-badge";
import { PageHeader } from "@/components/ui/page-header";

export default async function TenderPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const tenders = await listTenders();

  const items = tenders.map((t) => ({
    ...t,
    bids: t.bids ?? [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/partners" className="hover:text-foreground transition-colors">Partners</Link>
        <span>/</span>
        <span className="text-foreground">Tender / RFQ</span>
      </div>

      <PageHeader
        icon={<FileSearch strokeWidth={1.5} />}
        title="Tender a la red"
        subtitle="Envía RFQ a corresponsales y compara ofertas"
        actions={<SimBadge>Simulación · envío real en producción</SimBadge>}
      />

      <TenderPanel initialItems={items} />
    </div>
  );
}
