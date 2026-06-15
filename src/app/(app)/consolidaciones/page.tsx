import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { listLclShipments } from "@/lib/tier-s-actions";
import { ShipmentModeList } from "@/components/app/shipment-mode-list";

export default async function ConsolidacionesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const shipments = await listLclShipments();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Consolidaciones LCL
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Carga grupaje — Less than Container Load
          </p>
        </div>
      </div>

      <ShipmentModeList shipments={shipments} emptyLabel="Sin expedientes LCL" />
    </div>
  );
}
