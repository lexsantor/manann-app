import { notFound } from "next/navigation";
import { Plug } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { CONNECTORS } from "@/lib/connectors-catalog";
import { listConnectorStates } from "@/lib/connector-actions";
import { ConectoresPanel } from "@/components/app/conectores-panel";

export const metadata = { title: "Conectores — Manann" };

export default async function ConectoresPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const states = await listConnectorStates();
  const connectedKeys = new Set(states.filter((s) => s.status === "connected").map((s) => s.key));
  const items = CONNECTORS.map((c) => ({ ...c, connected: !!c.real || connectedKeys.has(c.key) }));

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Plug className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Conectores</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Integraciones con navieras, aduanas, contabilidad y comunicación
          </p>
        </div>
      </header>

      <ConectoresPanel items={items} />
    </div>
  );
}
