import { notFound } from "next/navigation";
import { Anchor, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { MASTER_PORTS } from "@/lib/master-ports";
import { PortsTable } from "@/components/app/ports-table";

export default async function PuertosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/maestros" className="hover:text-foreground transition-colors">Maestros</Link>
        <span>/</span>
        <span className="text-foreground">Puertos</span>
      </div>

      <div className="flex items-center gap-3">
        <Anchor className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Puertos marítimos
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {MASTER_PORTS.length} puertos · Catálogo UN/LOCODE
          </p>
        </div>
      </div>

      <PortsTable ports={MASTER_PORTS} />
    </div>
  );
}
