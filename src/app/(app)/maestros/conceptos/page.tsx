import { notFound } from "next/navigation";
import { Tag } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listChargeConcepts } from "@/lib/maestros-actions";
import { ChargeConceptsPanel } from "@/components/app/charge-concepts-panel";

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

      <div className="flex items-center gap-3">
        <Tag className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Conceptos de cargo
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Catálogo de conceptos facturables de la organización
          </p>
        </div>
      </div>

      <ChargeConceptsPanel concepts={concepts} />
    </div>
  );
}
