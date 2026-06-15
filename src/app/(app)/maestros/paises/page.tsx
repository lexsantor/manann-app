import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { MASTER_COUNTRIES } from "@/lib/master-countries";
import { CountriesTable } from "@/components/app/countries-table";

export default async function PaisesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Países</span>
      </div>

      <div className="flex items-center gap-3">
        <Globe className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Países
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {MASTER_COUNTRIES.length} países · ISO 3166-1
          </p>
        </div>
      </div>

      <CountriesTable countries={MASTER_COUNTRIES} />
    </div>
  );
}
