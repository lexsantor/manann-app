import { notFound } from "next/navigation";
import { FileSearch } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listTenders } from "@/lib/tier-v-actions";
import { TenderPanel } from "@/components/app/tender-panel";
import { SimBadge } from "@/components/ui/sim-badge";

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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <FileSearch className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Tender a la red
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Envía RFQ a corresponsales y compara ofertas
            </p>
          </div>
        </div>
        <SimBadge>Simulación · envío real en producción</SimBadge>
      </div>

      <TenderPanel initialItems={items} />
    </div>
  );
}
