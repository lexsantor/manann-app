import { redirect } from "next/navigation";
import { Zap } from "lucide-react";
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
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Autopilot</h1>
            <p className="text-sm text-muted-foreground">
              Manann IA ha preparado {actions.length} acción{actions.length !== 1 ? "es" : ""} sobre tus datos.
            </p>
          </div>
        </div>
        {critical > 0 && (
          <span className="mt-1 rounded-full bg-destructive/10 px-3 py-1 font-mono text-xs font-semibold text-destructive uppercase tracking-wide">
            {critical} crítica{critical > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <AutopilotInbox actions={actions} />
    </div>
  );
}
