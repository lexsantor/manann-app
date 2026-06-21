"use client";

import { useState, useTransition } from "react";
import { Zap, Trash2, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { retryWebhookEvent, deleteWebhookEvent } from "@/lib/procesos-actions";
import { EmptyState } from "@/components/ui/empty-state";

type WebhookEvent = {
  id: string;
  eventType: string;
  url: string;
  status: string;
  statusCode: number | null;
  attempts: number;
  lastAttemptAt: Date;
  createdAt: Date;
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  entregado: <CheckCircle2 className="h-4 w-4 text-success" />,
  fallido: <XCircle className="h-4 w-4 text-destructive" />,
  pendiente: <Clock className="h-4 w-4 text-warning" />,
};

const STATUS_COLORS: Record<string, string> = {
  entregado: "text-success bg-success/10",
  fallido: "text-destructive bg-destructive/10",
  pendiente: "text-warning bg-warning/10",
};

export function WebhookEventsPanel({ initialItems }: { initialItems: WebhookEvent[] }) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();

  function handleRetry(id: string) {
    startTransition(async () => {
      await retryWebhookEvent(id);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "pendiente", attempts: 1, lastAttemptAt: new Date() } : i,
        ),
      );
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteWebhookEvent(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Zap strokeWidth={1.5} />}
        title="Sin eventos de webhook"
        hint="Los envíos de webhooks aparecerán aquí"
      />
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-md border border-border bg-card p-3"
        >
          <div className="mt-0.5 shrink-0">
            {STATUS_ICON[item.status] ?? STATUS_ICON.pendiente}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-medium text-foreground">
                {item.eventType}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[item.status] ?? ""}`}
              >
                {item.status}
              </span>
              {item.statusCode && (
                <span className="text-xs text-muted-foreground">HTTP {item.statusCode}</span>
              )}
              <span className="text-xs text-muted-foreground">{item.attempts} intento(s)</span>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground" title={item.url}>
              {item.url}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/60">
              {new Date(item.lastAttemptAt).toLocaleString("es-ES")}
            </p>
          </div>
          <div className="flex shrink-0 gap-1">
            {item.status === "fallido" && (
              <button
                className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded p-1 text-muted-foreground hover:text-primary disabled:opacity-40"
                onClick={() => handleRetry(item.id)}
                disabled={isPending}
                title="Reintentar"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-40"
              onClick={() => handleDelete(item.id)}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
