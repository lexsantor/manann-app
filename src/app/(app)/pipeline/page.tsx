import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { getOrgContext, listOpportunities, getOpportunityStats, listMasterContacts, listRates } from "@/lib/erp";
import { formatMoney } from "@/lib/erp-format";
import { PageHeader } from "@/components/ui/page-header";
import { KpiRow, KpiCard } from "@/components/ui/kpi-card";
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

  const openStages = ["prospecto", "propuesta", "negociacion"];
  const openValue = openStages.reduce((s, k) => s + (stats[k]?.total ?? 0), 0);
  const openCount = openStages.reduce((s, k) => s + (stats[k]?.count ?? 0), 0);
  const won = stats["ganado"] ?? { count: 0, total: 0 };
  const lost = stats["perdido"] ?? { count: 0, total: 0 };
  const decided = won.count + lost.count;
  const winRate = decided > 0 ? Math.round((won.count / decided) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Comercial"
        icon={<TrendingUp strokeWidth={1.5} />}
        title="Pipeline"
        subtitle={`Oportunidades por etapa · ${opps.length} en total`}
      />

      <KpiRow cols={4}>
        <KpiCard
          label="Pipeline activo"
          value={formatMoney(String(openValue))}
          tone="primary"
          sub={`${openCount} ${openCount === 1 ? "oportunidad" : "oportunidades"}`}
        />
        <KpiCard
          label="Ganado"
          value={formatMoney(String(won.total))}
          tone="success"
          sub={`${won.count} ${won.count === 1 ? "cerrada" : "cerradas"}`}
        />
        <KpiCard
          label="Conversión"
          value={`${winRate}%`}
          sub={`${won.count}/${decided} decididas`}
        />
        <KpiCard label="Total" value={String(opps.length)} sub="oportunidades" />
      </KpiRow>

      <PipelineBoard opportunities={opps} stats={stats} contacts={contacts} rates={rates} />
    </div>
  );
}
