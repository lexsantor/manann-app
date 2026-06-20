import { notFound } from "next/navigation";
import { Train } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext } from "@/lib/erp";
import { listShipmentsByMode } from "@/lib/tier-s-actions";
import { ShipmentModeList } from "@/components/app/shipment-mode-list";

export default async function FerroviarioPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const shipments = await listShipmentsByMode("ferroviario");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        icon={<Train strokeWidth={1.5} />}
        title="Transporte ferroviario"
        subtitle="Expedientes en modo ferroviario"
      />

      <ShipmentModeList shipments={shipments} emptyLabel="Sin expedientes ferroviarios" />
    </div>
  );
}
