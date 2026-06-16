import { notFound } from "next/navigation";
import { FileCheck2 } from "lucide-react";
import { getOrgContext, listCustomsDeclarations } from "@/lib/erp";
import { AduanasPanel } from "@/components/app/aduanas-panel";

export const metadata = { title: "Aduanas — Manann" };

export default async function AduanasPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const declarations = await listCustomsDeclarations(ctx.org.id);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <FileCheck2 className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Aduanas</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Declaraciones aduaneras de todos los expedientes
          </p>
        </div>
      </header>

      <AduanasPanel declarations={declarations} />
    </div>
  );
}
