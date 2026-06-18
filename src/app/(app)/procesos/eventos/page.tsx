import { notFound } from "next/navigation";
import { Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listWebhookEvents } from "@/lib/procesos-actions";
import { WebhookEventsPanel } from "@/components/app/webhook-events-panel";

export default async function EventosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const items = await listWebhookEvents();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/procesos" className="hover:text-foreground transition-colors">
          Procesos
        </Link>
        <span>/</span>
        <span className="text-foreground">Eventos webhook</span>
      </div>

      <PageHeader
        icon={<Zap strokeWidth={1.5} />}
        title="Eventos webhook"
        subtitle="Log de envíos, reintentos y estado de entrega"
      />

      <WebhookEventsPanel initialItems={items} />
    </div>
  );
}
