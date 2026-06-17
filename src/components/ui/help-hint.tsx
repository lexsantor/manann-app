"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type HelpHintProps = {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

const POPOVER_WIDTH = 288; // ~18rem

export function HelpHint({ title, body, href, linkLabel = "Más en Ayuda", className }: HelpHintProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    function place() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let left = r.right - POPOVER_WIDTH;
      if (left < 8) left = 8;
      const maxLeft = window.innerWidth - 8 - POPOVER_WIDTH;
      if (left > maxLeft) left = Math.max(8, maxLeft);
      setPos({ top: r.bottom + 6, left });
    }
    place();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Ayuda: ${title}`}
        aria-expanded={open}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground",
          className,
        )}
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      {open && pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" aria-hidden="true" onClick={() => setOpen(false)} />
            <div
              role="dialog"
              aria-label={title}
              style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
              className="fixed z-[91] rounded-md border border-border bg-card p-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  aria-label="Cerrar"
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              {href && (
                <Link
                  href={href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="mt-2.5 inline-block text-sm font-medium text-primary hover:underline"
                >
                  {linkLabel}
                </Link>
              )}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
