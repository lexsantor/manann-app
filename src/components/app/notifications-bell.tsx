"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bell, Check, Package } from "lucide-react";
import { Icon } from "@/components/icon";
import { getNotifications, markNotificationsRead } from "@/lib/erp-actions";
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

  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    startTransition(async () => {
      const data = await getNotifications();
      setNotifs(data);
    });
  }, []);

  useEffect(() => {
    if (!open || unread === 0) return;
    startTransition(async () => {
      await markNotificationsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  }, [open, unread]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
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
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <Icon icon={Bell} size={16} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-sm font-medium text-foreground">Notificaciones</p>
            {notifs.length > 0 && (
              <span className="font-mono text-xs text-muted-foreground">{notifs.length}</span>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon icon={Check} size={20} className="mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Todo al día</p>
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
                    <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
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
