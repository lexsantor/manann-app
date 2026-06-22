import { notFound } from "next/navigation";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext } from "@/lib/erp";
import { listExpenses } from "@/lib/expense-actions";
import { GastosPanel } from "@/components/app/gastos-panel";
import { GastosChart } from "@/components/app/gastos-chart";

export const metadata = { title: "Gastos — Manann" };

const CAT_LABEL: Record<string, string> = {
  combustible: "Combustible", peajes: "Peajes", alquiler: "Alquiler", suministros: "Suministros",
  dietas: "Dietas", seguros: "Seguros", servicios: "Servicios", otro: "Otro",
};

export default async function GastosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const expenses = await listExpenses();

  // Agregado por categoria para el donut (suma de importes).
  const byCat = new Map<string, number>();
  for (const e of expenses) {
    byCat.set(e.category, (byCat.get(e.category) ?? 0) + Number(e.amount));
  }
  const chartData = [...byCat.entries()]
    .map(([cat, value]) => ({ name: CAT_LABEL[cat] ?? cat, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finanzas"
        icon={<CreditCard strokeWidth={1.5} />}
        title="Gastos"
        subtitle="Gastos operativos de la organización"
      />

      <GastosChart data={chartData} />

      <GastosPanel initialExpenses={expenses} />
    </div>
  );
}
