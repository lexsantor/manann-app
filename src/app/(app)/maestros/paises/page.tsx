import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { MASTER_COUNTRIES } from "@/lib/master-countries";
import { CountriesTable } from "@/components/app/countries-table";
import { PageHeader } from "@/components/ui/page-header";

export default async function PaisesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Países</span>
      </div>

      <PageHeader
        icon={<Globe strokeWidth={1.5} />}
        title="Países"
        subtitle={`${MASTER_COUNTRIES.length} países · ISO 3166-1`}
      />

      <CountriesTable countries={MASTER_COUNTRIES} />
    </div>
  );
}
