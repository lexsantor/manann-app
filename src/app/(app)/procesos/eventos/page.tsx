import { notFound } from "next/navigation";
import { Zap } from "lucide-react";
import Link from "next/link";
import { getOrgContext } from "@/lib/erp";
import { listWebhookEvents } from "@/lib/procesos-actions";
import { WebhookEventsPanel } from "@/components/app/webhook-events-panel";

export default async function EventosPage() {
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const items = await listWebhookEvents();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/procesos" className="hover:text-foreground transition-colors">
          Procesos
        </Link>
        <span>/</span>
        <span className="text-foreground">Eventos webhook</span>
      </div>

      <div className="flex items-center gap-3">
        <Zap className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
            Eventos webhook
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Log de envíos, reintentos y estado de entrega
          </p>
        </div>
      </div>

      <WebhookEventsPanel initialItems={items} />
    </div>
  );
}
