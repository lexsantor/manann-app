import { notFound } from "next/navigation";
import { ShieldCheck, AlertTriangle, ClipboardList, Timer } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { formatMoney } from "@/lib/erp-format";
import { listIncidents, listNonConformities, listSlaDefinitions } from "@/lib/calidad-actions";
import { PageHeader } from "@/components/ui/page-header";
import { KpiRow, KpiCard } from "@/components/ui/kpi-card";

export default async function CalidadPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const [incidents, ncs, slas] = await Promise.all([
    listIncidents(),
    listNonConformities(),
    listSlaDefinitions(),
  ]);

  const openIncidents = incidents.filter((i) => i.status !== "cerrado");
  const openNc = ncs.filter((n) => n.status !== "cerrado").length;
  const activeSla = slas.filter((s) => s.active).length;
  const impactOpen = openIncidents.reduce((s, i) => s + Number(i.impactCost ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calidad"
        icon={<ShieldCheck strokeWidth={1.5} />}
        title="Calidad"
        subtitle="Incidencias · No conformidades · SLA"
      />

      <KpiRow cols={4}>
        <KpiCard
          label="Incidencias abiertas"
          value={String(openIncidents.length)}
          tone={openIncidents.length > 0 ? "danger" : "default"}
          icon={<AlertTriangle />}
          sub={`${incidents.length} en total`}
        />
        <KpiCard
          label="No conformidades abiertas"
          value={String(openNc)}
          tone={openNc > 0 ? "danger" : "default"}
          icon={<ClipboardList />}
          sub={`${ncs.length} en total`}
        />
        <KpiCard label="SLAs activos" value={String(activeSla)} tone="primary" icon={<Timer />} />
        <KpiCard
          label="Coste de impacto"
          value={formatMoney(String(impactOpen))}
          tone={impactOpen > 0 ? "danger" : "default"}
          sub="incidencias abiertas"
        />
      </KpiRow>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            href: "/calidad/incidencias",
            icon: AlertTriangle,
            label: "Incidencias",
            desc: "Registro y seguimiento de incidencias operativas",
          },
          {
            href: "/calidad/no-conformidades",
            icon: ClipboardList,
            label: "No conformidades",
            desc: "Gestión de NC con causa raíz y acciones correctivas",
          },
          {
            href: "/calidad/sla",
            icon: Timer,
            label: "SLA",
            desc: "Objetivos de tiempo por métrica y modo de transporte",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-start gap-2.5 rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <item.icon
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
