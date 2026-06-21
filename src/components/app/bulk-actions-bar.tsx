"use client";

import { useState, useTransition } from "react";
import { X, UserCircle, CheckCircle2, Download, ChevronDown, Check } from "lucide-react";
import { Icon } from "@/components/icon";
import { STATUS } from "@/lib/erp-format";
import { bulkUpdateShipmentStatus, bulkAssignShipments } from "@/lib/erp-actions";
import { toast } from "@/components/ui/toast";
import type { OrgMember } from "@/components/app/assignee-select";

interface BulkActionsBarProps {
  selected: string[];
  members: OrgMember[];
  onExport: () => void;
  onClear: () => void;
}

export function BulkActionsBar({ selected, members, onExport, onClear }: BulkActionsBarProps) {
  const [, startTransition] = useTransition();
  const [statusOpen, setStatusOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  function handleStatus(status: string) {
    setStatusOpen(false);
    startTransition(async () => {
      try {
        await bulkUpdateShipmentStatus(selected, status);
      } catch {
        toast.error("No se pudo aplicar la acción en lote. Inténtalo de nuevo.");
      }
    });
  }

  function handleAssign(memberId: string | null) {
    setAssignOpen(false);
    startTransition(async () => {
      try {
        await bulkAssignShipments(selected, memberId);
      } catch {
        toast.error("No se pudo aplicar la acción en lote. Inténtalo de nuevo.");
      }
    });
  }

  function closeAll() {
    setStatusOpen(false);
    setAssignOpen(false);
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-xl border border-border bg-card px-2 py-1.5 shadow-xl">
        <span className="px-2 text-base text-muted-foreground">
          <span className="font-medium text-foreground">{selected.length}</span>{" "}
          seleccionado{selected.length !== 1 ? "s" : ""}
        </span>

        <div className="mx-1 h-4 w-px bg-border" />

        {/* Estado */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setStatusOpen((v) => !v); setAssignOpen(false); }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-base text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
          >
            <Icon icon={CheckCircle2} size={14} />
            Estado
            <Icon icon={ChevronDown} size={11} />
          </button>
          {statusOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeAll} />
              <div className="absolute bottom-full left-0 z-50 mb-2 w-44 rounded-xl border border-border bg-card p-1 shadow-lg">
                {Object.entries(STATUS).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleStatus(k)}
                    className="flex w-full items-center rounded-md px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Agente */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setAssignOpen((v) => !v); setStatusOpen(false); }}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-base text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
          >
            <Icon icon={UserCircle} size={14} />
            Asignar
            <Icon icon={ChevronDown} size={11} />
          </button>
          {assignOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeAll} />
              <div className="absolute bottom-full left-0 z-50 mb-2 w-52 rounded-xl border border-border bg-card p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => handleAssign(null)}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
                >
                  <Icon icon={UserCircle} size={14} className="shrink-0" />
                  Sin asignar
                </button>
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleAssign(m.id)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-base font-bold text-foreground">
                      {m.initials}
                    </span>
                    <span className="truncate">{m.name}</span>
                    <Icon icon={Check} size={11} className="ml-auto shrink-0 text-primary opacity-0" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Exportar */}
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-base text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
        >
          <Icon icon={Download} size={14} />
          Exportar
        </button>

        <div className="mx-1 h-4 w-px bg-border" />

        <button
          type="button"
          onClick={onClear}
          aria-label="Deseleccionar todo"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
        >
          <Icon icon={X} size={14} />
        </button>
      </div>
    </div>
  );
}
