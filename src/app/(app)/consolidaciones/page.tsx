import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext } from "@/lib/erp";
import { listLclShipments } from "@/lib/tier-s-actions";
import { ShipmentModeList } from "@/components/app/shipment-mode-list";

export default async function ConsolidacionesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const shipments = await listLclShipments();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        icon={<Layers strokeWidth={1.5} />}
        title="Consolidaciones LCL"
        subtitle="Carga grupaje — Less than Container Load"
      />

      <ShipmentModeList shipments={shipments} emptyLabel="Sin expedientes LCL" />
    </div>
  );
}
