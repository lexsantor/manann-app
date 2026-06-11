"use client";

import { useRef, useState } from "react";
import { PenLine } from "lucide-react";

import { Icon } from "@/components/icon";
import { saveNotes } from "@/lib/erp-actions";

interface NotesPanelProps {
  shipmentId: string;
  initialNotes: string | null;
}

export function NotesPanel({ shipmentId, initialNotes }: NotesPanelProps) {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setSaved(false);
    clearTimeout(timerRef.current);
    const value = e.target.value;
    timerRef.current = setTimeout(async () => {
      await saveNotes(shipmentId, value);
      setSaved(true);
    }, 800);
  }

  return (
    <section className="print:hidden rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon icon={PenLine} size={16} className="text-muted-foreground" />
          <h2 className="font-display text-base font-medium tracking-tight text-foreground">
            Notas
          </h2>
        </div>
        {saved && (
          <span className="font-mono text-xs text-muted-foreground">
            Guardado
          </span>
        )}
      </div>
      <textarea
        defaultValue={initialNotes ?? ""}
        onChange={handleChange}
        rows={4}
        placeholder="Apuntes internos del expediente…"
        className="w-full resize-none rounded-md border border-border bg-surface-2/40 p-3 font-sans text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </section>
  );
}
