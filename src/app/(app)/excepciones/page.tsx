import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext, listShipments } from "@/lib/erp";
import { computeExceptions } from "@/lib/exceptions";
import { ExceptionInbox } from "@/components/app/exception-inbox";

export const metadata = { title: "Excepciones — Manann" };

export default async function ExcepcionesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) redirect("/login");

  const shipments = await listShipments(ctx.org.id);
  const exceptions = computeExceptions(shipments);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ShieldAlert strokeWidth={1.5} />}
        title="Bandeja de excepciones"
        subtitle="Cargos sin facturar, desvíos de accrual y expedientes con GP negativo."
      />

      <ExceptionInbox exceptions={exceptions} />
    </div>
  );
}
