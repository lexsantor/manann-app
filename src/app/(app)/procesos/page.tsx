import { notFound } from "next/navigation";
import { Workflow, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";

export default async function ProcesosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Procesos"
        icon={<Workflow strokeWidth={1.5} />}
        title="Procesos"
        subtitle="Integraciones · Eventos · Webhooks"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-xl">
        <Link
          href="/procesos/eventos"
          className="flex items-start gap-2.5 rounded-md border border-border bg-card p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors"
        >
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-foreground">Eventos webhook</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Log de envíos, reintentos y estado de entrega
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
