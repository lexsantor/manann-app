import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { getOrgContext, listOpportunities, getOpportunityStats, listMasterContacts, listRates } from "@/lib/erp";
import { PipelineBoard } from "@/components/app/pipeline-board";

export const metadata = { title: "Pipeline — Manann" };

export default async function PipelinePage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) redirect("/login");
  const orgId = ctx.org.id;

  const [opps, stats, contacts, rates] = await Promise.all([
    listOpportunities(orgId),
    getOpportunityStats(orgId),
    listMasterContacts(orgId),
    listRates(orgId),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Pipeline Comercial</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Oportunidades por etapa · {opps.length} en total</p>
          </div>
        </div>
      </div>
      <PipelineBoard opportunities={opps} stats={stats} contacts={contacts} rates={rates} />
    </div>
  );
}
