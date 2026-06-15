import { notFound } from "next/navigation";
import { Train } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listShipmentsByMode } from "@/lib/tier-s-actions";
import { ShipmentModeList } from "@/components/app/shipment-mode-list";

export default async function FerroviarioPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const shipments = await listShipmentsByMode("ferroviario");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Train className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Transporte ferroviario
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Expedientes en modo ferroviario
          </p>
        </div>
      </div>

      <ShipmentModeList shipments={shipments} emptyLabel="Sin expedientes ferroviarios" />
    </div>
  );
}
