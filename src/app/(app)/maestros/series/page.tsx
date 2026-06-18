import { notFound } from "next/navigation";
import { Hash } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listDocumentSeries } from "@/lib/maestros-actions";
import { DocumentSeriesPanel } from "@/components/app/document-series-panel";
import { PageHeader } from "@/components/ui/page-header";

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

      <PageHeader
        icon={<Hash strokeWidth={1.5} />}
        title="Series y numeración"
        subtitle="Prefijos y contadores automáticos por tipo de documento"
      />

      <DocumentSeriesPanel series={series} />
    </div>
  );
}
