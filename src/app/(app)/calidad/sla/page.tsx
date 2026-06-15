import { notFound } from "next/navigation";
import { Timer } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listSlaDefinitions } from "@/lib/calidad-actions";
import { SlaPanel } from "@/components/app/sla-panel";

export default async function SlaPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const items = await listSlaDefinitions();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/calidad" className="hover:text-foreground transition-colors">
          Calidad
        </Link>
        <span>/</span>
        <span className="text-foreground">SLA</span>
      </div>

      <div className="flex items-center gap-3">
        <Timer className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Definición de SLA
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Objetivos de tiempo por métrica y modo de transporte
          </p>
        </div>
      </div>

      <SlaPanel initialItems={items} />
    </div>
  );
}
