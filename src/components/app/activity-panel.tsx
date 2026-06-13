"use client";

import { useState } from "react";
import { Sparkles, Settings, User, ChevronDown, ChevronUp } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface FieldChangeEntry {
  id: string;
  entity: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  source: string;
  changedAt: Date;
  changedByInitials?: string | null;
}

interface GroupedDay {
  date: string;
  entries: FieldChangeEntry[];
}

function SourceIcon({ source }: { source: string }) {
  if (source === "ai")
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
        <Icon icon={Sparkles} size={10} />
      </span>
    );
  if (source === "system")
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
        <Icon icon={Settings} size={10} />
      </span>
    );
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
      <Icon icon={User} size={10} />
    </span>
  );
}

function ChangeRow({ entry }: { entry: FieldChangeEntry }) {
  const [expanded, setExpanded] = useState(false);
  const OLD = entry.oldValue ?? "—";
  const NEW = entry.newValue ?? "—";
  const needsTruncate = OLD.length > 120 || NEW.length > 120;

  return (
    <div className="flex items-start gap-2 py-2">
      <SourceIcon source={entry.source} />
      <div className="min-w-0 flex-1 text-base">
        <span className="font-medium text-foreground">{entry.field}</span>
        {" "}
        <span className="text-muted-foreground">
          {entry.source === "ai"
            ? "extraído por IA"
            : entry.source === "system"
            ? "sincronizado"
            : entry.changedByInitials
            ? `editado por ${entry.changedByInitials}`
            : "editado"}
        </span>
        <div className="mt-0.5 font-mono text-base text-muted-foreground">
          {needsTruncate && !expanded ? (
            <>
              <span className="line-clamp-1">{OLD}</span>
              {" → "}
              <span className="line-clamp-1">{NEW}</span>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                ver <Icon icon={ChevronDown} size={10} />
              </button>
            </>
          ) : needsTruncate && expanded ? (
            <>
              <span>{OLD}</span>
              {" → "}
              <span>{NEW}</span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="ml-1 inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                colapsar <Icon icon={ChevronUp} size={10} />
              </button>
            </>
          ) : (
            <>
              <span>{OLD}</span>
              {" → "}
              <span>{NEW}</span>
            </>
          )}
        </div>
      </div>
      <time className="shrink-0 font-mono text-base text-muted-foreground">
        {new Date(entry.changedAt).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>
    </div>
  );
}

interface ActivityPanelProps {
  changes: FieldChangeEntry[];
}

function groupByDay(entries: FieldChangeEntry[]): GroupedDay[] {
  const map = new Map<string, FieldChangeEntry[]>();
  for (const e of entries) {
    const key = new Date(e.changedAt).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }
  return Array.from(map.entries()).map(([date, es]) => ({ date, entries: es }));
}

export function ActivityPanel({ changes }: ActivityPanelProps) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const sorted = [...changes].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );
  const visible = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = sorted.length > visible.length;
  const grouped = groupByDay(visible);

  if (changes.length === 0) {
    return (
      <p className="py-6 text-center text-base text-muted-foreground">
        Sin actividad registrada
      </p>
    );
  }

  return (
    <div>
      {grouped.map((group) => (
        <div key={group.date} className="mb-4">
          <p className="mb-1 font-mono text-sm uppercase tracking-wider text-muted-foreground">
            {group.date}
          </p>
          <div className="divide-y divide-border/50 rounded-lg border border-border bg-card px-3">
            {group.entries.map((e) => (
              <ChangeRow key={e.id} entry={e} />
            ))}
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          className={cn(
            "mt-2 w-full rounded-md py-1.5 text-base text-muted-foreground",
            "transition-colors hover:bg-surface-2/60 hover:text-foreground",
          )}
        >
          Cargar más
        </button>
      )}
    </div>
  );
}
