import { notFound } from "next/navigation";
import { FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getOrgContext, listCustomsDeclarations } from "@/lib/erp";
import { AduanasPanel } from "@/components/app/aduanas-panel";

export const metadata = { title: "Aduanas — Manann" };

export default async function AduanasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const declarations = await listCustomsDeclarations(ctx.org.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operaciones"
        icon={<FileCheck2 strokeWidth={1.5} />}
        title="Aduanas"
        subtitle="Declaraciones aduaneras de todos los expedientes"
      />

      <AduanasPanel declarations={declarations} />
    </div>
  );
}
