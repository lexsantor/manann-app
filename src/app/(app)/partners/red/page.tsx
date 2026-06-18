import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listNetworkAgents } from "@/lib/tier-v-actions";
import { NetworkAgentsPanel } from "@/components/app/network-agents-panel";
import { SimBadge } from "@/components/ui/sim-badge";

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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Red de agentes
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Directorio de corresponsales verificados por país, modo y corredor
            </p>
          </div>
        </div>
        <SimBadge>Simulación · red real en producción</SimBadge>
      </div>

      <NetworkAgentsPanel agents={agents} />
    </div>
  );
}
