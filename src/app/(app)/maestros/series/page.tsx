import { notFound } from "next/navigation";
import { Hash } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listDocumentSeries } from "@/lib/maestros-actions";
import { DocumentSeriesPanel } from "@/components/app/document-series-panel";

export default async function SeriesPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const series = await listDocumentSeries();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Series y numeración</span>
      </div>

      <div className="flex items-center gap-3">
        <Hash className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Series y numeración
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Prefijos y contadores automáticos por tipo de documento
          </p>
        </div>
      </div>

      <DocumentSeriesPanel series={series} />
    </div>
  );
}
