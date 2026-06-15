import { notFound } from "next/navigation";
import { FileCheck2 } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listCustomsRegimes } from "@/lib/maestros-actions";
import { CustomsRegimesTable } from "@/components/app/customs-regimes-table";

export default async function RegimenesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const regimes = await listCustomsRegimes();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Regímenes aduaneros</span>
      </div>

      <div className="flex items-center gap-3">
        <FileCheck2 className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Regímenes aduaneros
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Códigos HS/TARIC — {regimes.length} regímenes activos
          </p>
        </div>
      </div>

      <CustomsRegimesTable regimes={regimes} />
    </div>
  );
}
