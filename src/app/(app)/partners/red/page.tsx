import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listNetworkAgents } from "@/lib/tier-v-actions";
import { NetworkAgentsPanel } from "@/components/app/network-agents-panel";
import { SimBadge } from "@/components/ui/sim-badge";
import { PageHeader } from "@/components/ui/page-header";

export default async function RedPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const agents = await listNetworkAgents();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/partners" className="hover:text-foreground transition-colors">Partners</Link>
        <span>/</span>
        <span className="text-foreground">Red de agentes</span>
      </div>

      <PageHeader
        icon={<Globe strokeWidth={1.5} />}
        title="Red de agentes"
        subtitle="Directorio de corresponsales verificados por país, modo y corredor"
        actions={<SimBadge>Simulación · red real en producción</SimBadge>}
      />

      <NetworkAgentsPanel agents={agents} />
    </div>
  );
}
