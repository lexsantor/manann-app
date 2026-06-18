import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext } from "@/lib/erp";
import { listTransportOrders } from "@/lib/tier-s-actions";
import { TransportOrdersPanel } from "@/components/app/transport-orders-panel";

export default async function OrdenesTransportePage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const orders = await listTransportOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        icon={<Truck strokeWidth={1.5} />}
        title="Órdenes de transporte"
        subtitle="Gestión de carteros, camiones y conductores"
      />

      <TransportOrdersPanel orders={orders} />
    </div>
  );
}
