"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Icon } from "@/components/icon";
import { applyHsCode } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

interface HsCodeSearchProps {
  cargoLineId: string;
  currentCode?: string | null;
}

export function HsCodeSearch({ cargoLineId, currentCode }: HsCodeSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<[string, string][]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const controller = new AbortController();
    fetch(`/api/taric/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setResults)
      .catch(() => {});
    return () => controller.abort();
  }, [query]);

  function select(code: string) {
    startTransition(async () => {
      await applyHsCode(cargoLineId, code);
      setOpen(false);
      setQuery("");
      setResults([]);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-base transition-colors",
          currentCode
            ? "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground"
            : "font-medium text-primary/70 hover:bg-primary/10 hover:text-primary",
        )}
      >
        <Icon icon={Search} size={10} />
        {currentCode ? "Cambiar HS" : "Buscar TARIC"}
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative mt-1.5 w-full max-w-xs">
      <div className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-background px-2.5 py-1.5 shadow-sm">
        <Icon icon={Search} size={11} className="shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por descripción o código…"
          className="min-w-0 flex-1 bg-transparent font-mono text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          type="button"
          onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Icon icon={X} size={11} />
        </button>
      </div>

      {results.length > 0 && (
        <ul className="absolute left-0 top-full z-50 mt-1 w-full max-w-sm overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          {results.map(([code, desc]) => (
            <li key={code}>
              <button
                type="button"
                disabled={isPending}
                onClick={() => select(code)}
                className="flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface-2/60 disabled:opacity-50"
              >
                <span className="mt-px shrink-0 font-mono text-base font-semibold text-primary">
                  {code}
                </span>
                <span className="text-base leading-snug text-muted-foreground">
                  {desc}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover px-3 py-2.5 shadow-lg">
          <p className="text-base text-muted-foreground">Sin resultados para {JSON.stringify(query)}</p>
        </div>
      )}
    </div>
  );
}
