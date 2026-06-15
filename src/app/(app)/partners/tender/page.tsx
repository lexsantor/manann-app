import { notFound } from "next/navigation";
import { FileSearch } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listTenders } from "@/lib/tier-v-actions";
import { TenderPanel } from "@/components/app/tender-panel";

export default async function TenderPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const tenders = await listTenders();

  const items = tenders.map((t) => ({
    ...t,
    bids: t.bids ?? [],
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/partners" className="hover:text-foreground transition-colors">Partners</Link>
        <span>/</span>
        <span className="text-foreground">Tender / RFQ</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileSearch className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Tender a la red
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Envía RFQ a corresponsales y compara ofertas
            </p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          Simulación — envío real por email en producción
        </span>
      </div>

      <TenderPanel initialItems={items} />
    </div>
  );
}
