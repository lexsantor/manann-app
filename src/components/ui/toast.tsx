"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

// Store a nivel de módulo: usable desde cualquier client component sin context.
let items: ToastItem[] = [];
let listeners: Array<(t: ToastItem[]) => void> = [];
let counter = 0;

const AUTO_DISMISS_MS = 4500;

function emit() {
  for (const l of listeners) l(items);
}

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

function push(message: string, variant: ToastVariant) {
  const id = ++counter;
  items = [...items, { id, message, variant }];
  emit();
  setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
}

/** API global de notificaciones. `toast.error("…")`, `toast.success("…")`, `toast.info("…")`. */
export const toast = {
  success: (message: string) => push(message, "success"),
  error: (message: string) => push(message, "error"),
  info: (message: string) => push(message, "info"),
};

const VARIANT_META: Record<ToastVariant, { icon: typeof Info; cls: string }> = {
  success: { icon: CheckCircle2, cls: "text-success" },
  error: { icon: AlertTriangle, cls: "text-destructive" },
  info: { icon: Info, cls: "text-info" },
};

/** Monta una sola vez (en el layout raíz). Renderiza las notificaciones activas. */
export function Toaster() {
  const [list, setList] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const listener = (t: ToastItem[]) => setList([...t]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[1200] flex w-[min(92vw,360px)] flex-col gap-2"
      role="region"
      aria-label="Notificaciones"
    >
      {list.map((t) => {
        const meta = VARIANT_META[t.variant];
        const ToastIcon = meta.icon;
        return (
          <div
            key={t.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-2.5 rounded-md border border-border bg-card px-4 py-3 shadow-lg"
          >
            <ToastIcon className={cn("mt-0.5 size-4 shrink-0", meta.cls)} strokeWidth={1.5} />
            <p className="flex-1 text-sm leading-snug text-foreground">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar notificación"
              className="-mr-1 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
