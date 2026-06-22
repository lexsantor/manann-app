"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bell, Check, Package } from "lucide-react";
import { Icon } from "@/components/icon";
import { getNotifications, markNotificationsRead } from "@/lib/erp-actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Notif {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  shipmentId: string | null;
  shipmentReference: string | null;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getNotifications();
        setNotifs(data);
      } catch {
        setNotifs([]);
        toast.error("No se pudieron cargar las notificaciones. Inténtalo de nuevo.");
      }
    });
  }, []);

  useEffect(() => {
    if (!open || unread === 0) return;
    startTransition(async () => {
      try {
        await markNotificationsRead();
        setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch {
        toast.error("No se pudieron marcar las notificaciones como leídas. Inténtalo de nuevo.");
      }
    });
  }, [open, unread]);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function relativeTime(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "ahora";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Notificaciones"
        className={cn(
          "relative flex size-11 items-center justify-center rounded-md border border-border bg-card transition-colors",
          open ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon icon={Bell} size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-2 top-16 z-50 w-auto rounded-xl border border-border bg-card shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-base font-medium text-foreground">Notificaciones</p>
            {notifs.length > 0 && (
              <span className="font-mono text-base text-muted-foreground">{notifs.length}</span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon icon={Check} size={20} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-base text-muted-foreground">Todo al día</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 border-b border-border/50 px-4 py-3 last:border-0",
                    !n.read && "bg-primary/5",
                  )}
                >
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2">
                    <Icon icon={Package} size={12} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base leading-relaxed text-foreground">{n.message}</p>
                    <p className="mt-0.5 font-mono text-base text-muted-foreground">
                      {relativeTime(n.createdAt)}
                      {n.shipmentReference && ` · ${n.shipmentReference}`}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
