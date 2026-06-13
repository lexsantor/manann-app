import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
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
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
          <ShieldAlert className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Bandeja de excepciones</h1>
          <p className="text-base text-muted-foreground">
            Cargos sin facturar, desvíos de accrual y expedientes con GP negativo.
          </p>
        </div>
      </div>

      <ExceptionInbox exceptions={exceptions} />
    </div>
  );
}
