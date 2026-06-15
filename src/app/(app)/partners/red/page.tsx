import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listNetworkAgents } from "@/lib/tier-v-actions";
import { NetworkAgentsPanel } from "@/components/app/network-agents-panel";

export default async function RedPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const agents = await listNetworkAgents();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/partners" className="hover:text-foreground transition-colors">Partners</Link>
        <span>/</span>
        <span className="text-foreground">Red de agentes</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Red de agentes
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Directorio de corresponsales verificados por país, modo y corredor
            </p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          Simulación — red real en producción
        </span>
      </div>

      <NetworkAgentsPanel agents={agents} />
    </div>
  );
}
