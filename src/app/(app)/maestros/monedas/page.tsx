import { notFound } from "next/navigation";
import { DollarSign } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listExchangeRates } from "@/lib/maestros-actions";
import { MASTER_CURRENCIES, REFERENCE_RATES } from "@/lib/master-currencies";
import { CurrenciesPanel } from "@/components/app/currencies-panel";
import { SimBadge } from "@/components/ui/sim-badge";

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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Monedas y tipos de cambio
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              ISO 4217 · Base EUR · Tipos editables por la organización
            </p>
          </div>
        </div>
        <SimBadge>Simulación · ECB/Fixer en producción</SimBadge>
      </div>

      <CurrenciesPanel currencies={MASTER_CURRENCIES} referenceRates={REFERENCE_RATES} savedRates={rates} />
    </div>
  );
}
