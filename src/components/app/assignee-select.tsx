"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { UserCircle, Check, ChevronDown } from "lucide-react";
import { Icon } from "@/components/icon";
import { assignShipment } from "@/lib/erp-actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  initials: string;
}

interface AssigneeSelectProps {
  shipmentId: string;
  assignedTo: string | null;
  members: OrgMember[];
}

export function AssigneeSelect({ shipmentId, assignedTo, members }: AssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(assignedTo);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  const current = members.find((m) => m.id === currentId);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function pick(memberId: string | null) {
    const previousId = currentId;
    setCurrentId(memberId);
    setOpen(false);
    startTransition(async () => {
      try {
        await assignShipment(shipmentId, memberId);
      } catch {
        setCurrentId(previousId);
        toast.error("No se pudo asignar el expediente. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2 py-1 text-base transition-colors",
          "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
        )}
      >
        {current ? (
          <>
            <span className="flex size-5 items-center justify-center rounded-full bg-surface-2 font-mono text-base font-bold text-foreground">
              {current.initials}
            </span>
            <span>{current.name}</span>
          </>
        ) : (
          <>
            <Icon icon={UserCircle} size={14} />
            <span>Sin asignar</span>
          </>
        )}
        <Icon icon={ChevronDown} size={11} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card shadow-lg">
          <div className="p-1">
            <button
              type="button"
              onClick={() => pick(null)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-base transition-colors hover:bg-surface-2/60",
                !currentId ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon icon={UserCircle} size={14} className="shrink-0" />
              Sin asignar
              {!currentId && <Icon icon={Check} size={11} className="ml-auto text-primary" />}
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => pick(m.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-base transition-colors hover:bg-surface-2/60",
                  m.id === currentId ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-base font-bold text-foreground">
                  {m.initials}
                </span>
                <span className="flex-1 truncate text-left">{m.name}</span>
                {m.id === currentId && (
                  <Icon icon={Check} size={11} className="ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
