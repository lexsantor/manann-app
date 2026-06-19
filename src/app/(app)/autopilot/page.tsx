import { redirect } from "next/navigation";
import { Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext, listShipments } from "@/lib/erp";
import { computeAutopilotActions } from "@/lib/autopilot";
import { AutopilotInbox } from "@/components/app/autopilot-inbox";

export const metadata = { title: "Autopilot — Manann" };

export default async function AutopilotPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) redirect("/login");

  const shipments = await listShipments(ctx.org.id);
  const actions = computeAutopilotActions(shipments);

  const critical = actions.filter((a) => a.severity === "critical").length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Zap strokeWidth={1.5} />}
        title="Autopilot"
        subtitle={`Manann IA ha preparado ${actions.length} acción${actions.length !== 1 ? "es" : ""} sobre tus datos.`}
        actions={
          critical > 0 ? (
            <span className="rounded-full bg-destructive/10 px-3 py-1 font-mono text-sm font-semibold uppercase tracking-wide text-destructive">
              {critical} crítica{critical > 1 ? "s" : ""}
            </span>
          ) : undefined
        }
      />

      <AutopilotInbox actions={actions} />
    </div>
  );
}
