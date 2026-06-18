import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listChargeConcepts } from "@/lib/maestros-actions";
import { ChargeConceptsPanel } from "@/components/app/charge-concepts-panel";
import { PageHeader } from "@/components/ui/page-header";

export default async function ConceptosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const concepts = await listChargeConcepts();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Conceptos de cargo</span>
      </div>

      <PageHeader
        icon={<Tag strokeWidth={1.5} />}
        title="Conceptos de cargo"
        subtitle="Catálogo de conceptos facturables de la organización"
      />

      <ChargeConceptsPanel concepts={concepts} />
    </div>
  );
}
