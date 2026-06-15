import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import { getOrgContext } from "@/lib/erp";
import { listTransportOrders } from "@/lib/tier-s-actions";
import { TransportOrdersPanel } from "@/components/app/transport-orders-panel";

export default async function OrdenesTransportePage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const orders = await listTransportOrders();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Órdenes de transporte
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Gestión de carteros, camiones y conductores
          </p>
        </div>
      </div>

      <TransportOrdersPanel orders={orders} />
    </div>
  );
}
