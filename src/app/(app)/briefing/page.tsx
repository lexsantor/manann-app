import { redirect } from "next/navigation";
import { getOrgContext, listShipments } from "@/lib/erp";
import { computeAutopilotActions, computeTimeSaved } from "@/lib/autopilot";
import { computeLeakageKpi } from "@/lib/exceptions";
import { MorningBrief } from "@/components/app/morning-brief";

export const metadata = { title: "Briefing — Manann" };

export default async function BriefingPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) redirect("/login");

  const shipments = await listShipments(ctx.org.id);
  const actions = computeAutopilotActions(shipments);
  const leakage = computeLeakageKpi(shipments);
  const timeSaved = computeTimeSaved(shipments);

  const firstName = ctx.user.name?.split(" ")[0] ?? "operador";

  return (
    <div className="space-y-6">
      <MorningBrief
        userName={firstName}
        actions={actions}
        atRiskTotal={leakage.totalAtRisk}
        atRiskCount={leakage.atRiskCount}
        timeSaved={timeSaved}
        shipmentCount={shipments.filter((s) => s.status !== "borrador").length}
      />
    </div>
  );
}
