import { notFound } from "next/navigation";
import { Plug } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { CONNECTORS } from "@/lib/connectors-catalog";
import { listConnectorStates } from "@/lib/connector-actions";
import { ConectoresPanel } from "@/components/app/conectores-panel";
import { PageHeader } from "@/components/ui/page-header";
import { KpiRow, KpiCard } from "@/components/ui/kpi-card";

export const metadata = { title: "Conectores — Manann" };

export default async function ConectoresPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const states = await listConnectorStates();
  const connectedKeys = new Set(states.filter((s) => s.status === "connected").map((s) => s.key));
  const items = CONNECTORS.map((c) => ({ ...c, connected: !!c.real || connectedKeys.has(c.key) }));

  const total = items.length;
  const connected = items.filter((c) => c.connected).length;
  const real = CONNECTORS.filter((c) => c.real).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Integraciones"
        icon={<Plug strokeWidth={1.5} />}
        title="Conectores"
        subtitle="Integraciones con navieras, aduanas, contabilidad y comunicación"
      />

      <KpiRow cols={3}>
        <KpiCard label="Conectadas" value={String(connected)} tone="primary" sub={`de ${total} disponibles`} />
        <KpiCard label="Catálogo" value={String(total)} sub="integraciones" />
        <KpiCard label="En producción" value={String(real)} tone="success" sub={`${total - real} simuladas`} />
      </KpiRow>

      <ConectoresPanel items={items} />
    </div>
  );
}
