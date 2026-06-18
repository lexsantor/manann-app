import { notFound } from "next/navigation";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listExchangeRates } from "@/lib/maestros-actions";
import { MASTER_CURRENCIES, REFERENCE_RATES } from "@/lib/master-currencies";
import { CurrenciesPanel } from "@/components/app/currencies-panel";
import { SimBadge } from "@/components/ui/sim-badge";
import { PageHeader } from "@/components/ui/page-header";

export default async function MonedasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const rates = await listExchangeRates();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Monedas</span>
      </div>

      <PageHeader
        icon={<DollarSign strokeWidth={1.5} />}
        title="Monedas y tipos de cambio"
        subtitle="ISO 4217 · Base EUR · Tipos editables por la organización"
        actions={<SimBadge>Simulación · ECB/Fixer en producción</SimBadge>}
      />

      <CurrenciesPanel currencies={MASTER_CURRENCIES} referenceRates={REFERENCE_RATES} savedRates={rates} />
    </div>
  );
}
