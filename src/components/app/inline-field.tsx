"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Icon } from "@/components/icon";
import { updateShipmentField } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

interface InlineFieldProps {
  shipmentId: string;
  field: string;
  value: string | null;
  mono?: boolean;
  className?: string;
}

export function InlineField({ shipmentId, field, value, mono, className }: InlineFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setDraft(value ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function cancel() {
    setEditing(false);
    setDraft(value ?? "");
  }

  function save() {
    const trimmed = draft.trim();
    if (trimmed === (value ?? "")) { setEditing(false); return; }
    startTransition(async () => {
      await updateShipmentField(shipmentId, field, trimmed);
      setEditing(false);
    });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") save();
    if (e.key === "Escape") cancel();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={save}
          disabled={pending}
          autoFocus
          className={cn(
            "h-6 min-w-0 rounded border border-ring bg-background px-1.5 text-base text-foreground focus:outline-none",
            mono ? "font-mono" : "font-sans",
            className,
          )}
        />
        {pending ? (
          <Icon icon={Loader2} size={12} className="shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <>
            <button type="button" aria-label="Guardar" onMouseDown={(e) => { e.preventDefault(); save(); }} className="shrink-0 text-success hover:opacity-80">
              <Icon icon={Check} size={12} />
            </button>
            <button type="button" aria-label="Cancelar" onMouseDown={(e) => { e.preventDefault(); cancel(); }} className="shrink-0 text-muted-foreground hover:text-foreground">
              <Icon icon={X} size={12} />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="Editar"
      className={cn(
        "group flex items-center gap-1.5 text-left",
        className,
      )}
    >
      <span className={cn("text-base text-foreground", mono && "font-mono")}>
        {value ?? "-"}
      </span>
      <Icon
        icon={Pencil}
        size={11}
        className="shrink-0 opacity-0 text-muted-foreground transition-opacity group-hover:opacity-100"
      />
    </button>
  );
}
