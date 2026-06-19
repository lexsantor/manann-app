"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

// DatePicker tokenizado (popover + rejilla de mes) — sustituye a `<input type="date">`
// nativo para mantener el lenguaje visual del sistema. Valor en formato ISO
// "yyyy-mm-dd" (compatible con lo que daba el input nativo). Sin dependencias.

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function parseValue(value?: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function formatDisplay(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Inicio de la rejilla: lunes de la semana que contiene el día 1 del mes.
function gridStart(view: Date): Date {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const dow = (first.getDay() + 6) % 7; // 0 = lunes
  const start = new Date(first);
  start.setDate(first.getDate() - dow);
  return start;
}

interface DatePickerProps {
  /** Modo controlado. Si se omite, el componente gestiona su estado interno. */
  value?: string;
  /** Valor inicial en modo no controlado (FormData). */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Si se pasa, emite un <input type="hidden"> para envíos por FormData. */
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  name,
  id,
  placeholder = "Seleccionar fecha",
  className,
  disabled,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value !== undefined ? value : internal;
  const selected = parseValue(current);
  const [view, setView] = useState<Date>(() => selected ?? new Date());

  function commit(v: string) {
    if (value === undefined) setInternal(v);
    onChange?.(v);
  }
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    if (disabled) return;
    if (!open) setView(selected ?? new Date());
    setOpen((v) => !v);
  }

  function pick(d: Date) {
    commit(toIso(d));
    setOpen(false);
    btnRef.current?.focus();
  }

  const start = gridStart(view);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  const today = new Date();

  return (
    <div ref={wrapRef} className="relative">
      {name ? <input type="hidden" name={name} value={current} /> : null}
      <button
        ref={btnRef}
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-base text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 md:text-sm",
          className,
        )}
      >
        <Icon icon={CalendarDays} size={16} className="shrink-0 text-muted-foreground" />
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? formatDisplay(selected) : placeholder}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Selector de fecha"
          className="absolute left-0 z-50 mt-1 w-[17rem] rounded-md border border-border bg-card p-3 shadow-lg"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon icon={ChevronLeft} size={16} />
            </button>
            <span className="font-mono text-sm font-medium capitalize text-foreground">
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon icon={ChevronRight} size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((w) => (
              <span
                key={w}
                className="flex h-8 items-center justify-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                {w}
              </span>
            ))}
            {days.map((d, i) => {
              const inMonth = d.getMonth() === view.getMonth();
              const sel = selected ? sameDay(d, selected) : false;
              const isToday = sameDay(d, today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => pick(d)}
                  aria-current={isToday ? "date" : undefined}
                  aria-pressed={sel || undefined}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                    !inMonth && "text-muted-foreground/40",
                    inMonth && !sel && "text-foreground hover:bg-muted",
                    sel && "bg-primary text-primary-foreground hover:brightness-110",
                    isToday && !sel && "ring-1 ring-primary/50",
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
            <button
              type="button"
              onClick={() => {
                commit("");
                setOpen(false);
              }}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => pick(new Date())}
              className="rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
