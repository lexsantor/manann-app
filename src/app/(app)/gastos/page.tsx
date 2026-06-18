import { notFound } from "next/navigation";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext } from "@/lib/erp";
import { listExpenses } from "@/lib/expense-actions";
import { GastosPanel } from "@/components/app/gastos-panel";

export const metadata = { title: "Gastos — Manann" };

export default async function GastosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const expenses = await listExpenses();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        icon={<CreditCard strokeWidth={1.5} />}
        title="Gastos"
        subtitle="Gastos operativos de la organización"
      />

      <GastosPanel initialExpenses={expenses} />
    </div>
  );
}
