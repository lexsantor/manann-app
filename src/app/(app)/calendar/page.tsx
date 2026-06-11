import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";

import { getOrgContext, getCalendarShipments, listShipments } from "@/lib/erp";
import { Icon } from "@/components/icon";
import { STATUS } from "@/lib/erp-format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Calendario ETAs — Manann" };

const STATUS_DOT: Record<string, string> = {
  borrador: "bg-muted-foreground",
  confirmado: "bg-blue-500",
  en_transito: "bg-sky-500",
  en_aduana: "bg-orange-500",
  entregado: "bg-green-500",
  cerrado: "bg-muted-foreground/40",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  const { month: monthParam, day: dayParam } = await searchParams;
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  // Parsear ?month=2026-06 o usar el mes actual
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m;
  }

  const prevMonth = month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, "0")}`;
  const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
  const currentMonthParam = `${year}-${String(month).padStart(2, "0")}`;

  const [shipments, allShipments] = await Promise.all([
    getCalendarShipments(ctx.org.id, year, month),
    listShipments(ctx.org.id),
  ]);

  const withoutEta = allShipments.filter(
    (s) => !s.eta && !["entregado", "cerrado"].includes(s.status),
  );

  // Agrupar por día del mes (1-based)
  const byDay = new Map<number, typeof shipments>();
  for (const s of shipments) {
    if (!s.eta) continue;
    const etaDate = new Date(s.eta);
    const day = etaDate.getDate();
    const arr = byDay.get(day) ?? [];
    arr.push(s);
    byDay.set(day, arr);
  }

  // Grid del mes: primer día de la semana (lunes=0)
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // lunes = 0
  const totalDays = lastDay.getDate();
  const cells = startOffset + totalDays;
  const weeks = Math.ceil(cells / 7);

  const selectedDay = dayParam ? parseInt(dayParam, 10) : null;
  const selectedShipments = selectedDay ? (byDay.get(selectedDay) ?? []) : [];

  const monthLabel = firstDay.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium capitalize tracking-tight text-foreground">
            {monthLabel}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {shipments.length} ETA{shipments.length !== 1 ? "s" : ""} este mes
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/calendar?month=${prevMonth}`}
            prefetch={false}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Mes anterior"
          >
            <Icon icon={ChevronLeft} size={15} />
          </Link>
          <Link
            href="/calendar"
            prefetch={false}
            className="rounded-md border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Hoy
          </Link>
          <Link
            href={`/calendar?month=${nextMonth}`}
            prefetch={false}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Mes siguiente"
          >
            <Icon icon={ChevronRight} size={15} />
          </Link>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Cabecera días de semana */}
            <div className="grid grid-cols-7 border-b border-border">
              {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
                <div
                  key={d}
                  className="py-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Celdas */}
            <div className="grid grid-cols-7">
              {Array.from({ length: weeks * 7 }).map((_, i) => {
                const dayNum = i - startOffset + 1;
                const isThisMonth = dayNum >= 1 && dayNum <= totalDays;
                const isToday =
                  isThisMonth &&
                  today.getDate() === dayNum &&
                  today.getMonth() + 1 === month &&
                  today.getFullYear() === year;
                const dayShipments = isThisMonth ? (byDay.get(dayNum) ?? []) : [];
                const isSelected = isThisMonth && dayNum === selectedDay;
                const hasMore = dayShipments.length > 3;

                return (
                  <Link
                    key={i}
                    href={
                      isThisMonth && dayShipments.length > 0
                        ? `/calendar?month=${currentMonthParam}&day=${dayNum}`
                        : `/calendar?month=${currentMonthParam}`
                    }
                    prefetch={false}
                    className={cn(
                      "relative min-h-[72px] border-b border-r border-border/50 p-2 transition-colors",
                      "last:border-r-0 [&:nth-child(7n)]:border-r-0",
                      !isThisMonth && "pointer-events-none bg-muted/20",
                      isThisMonth && dayShipments.length > 0 && "cursor-pointer hover:bg-surface-2/60",
                      isSelected && "bg-primary/5",
                    )}
                    aria-label={isThisMonth ? `${dayNum} de ${monthLabel}` : undefined}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs",
                        isToday
                          ? "bg-primary text-primary-foreground"
                          : isThisMonth
                          ? "text-foreground"
                          : "text-muted-foreground/30",
                      )}
                    >
                      {isThisMonth ? dayNum : ""}
                    </span>
                    {dayShipments.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-0.5">
                        {dayShipments.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className={cn(
                              "size-2 rounded-full",
                              STATUS_DOT[s.status] ?? "bg-muted-foreground",
                            )}
                            title={`${s.reference} · ${STATUS[s.status]?.label ?? s.status}`}
                          />
                        ))}
                        {hasMore && (
                          <span className="font-mono text-[9px] text-muted-foreground">
                            +{dayShipments.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-3 flex flex-wrap gap-3">
            {Object.entries(STATUS_DOT)
              .filter(([k]) => k !== "borrador" && k !== "cerrado")
              .map(([k, cls]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full", cls)} />
                  <span className="text-xs text-muted-foreground">
                    {STATUS[k]?.label ?? k}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {selectedDay && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Icon icon={CalendarDays} size={14} className="text-muted-foreground" />
                <h2 className="font-medium text-foreground">
                  {selectedDay} de {firstDay.toLocaleDateString("es-ES", { month: "long" })}
                </h2>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {selectedShipments.length} expediente{selectedShipments.length !== 1 ? "s" : ""}
                </span>
              </div>
              {selectedShipments.length > 0 ? (
                <div className="space-y-2">
                  {selectedShipments.map((s) => (
                    <Link
                      key={s.id}
                      href={`/expedientes/${s.id}`}
                      prefetch={false}
                      className="flex items-start gap-2 rounded-md border border-border/60 bg-surface-2/40 p-3 transition-colors hover:bg-surface-2"
                    >
                      <span
                        className={cn(
                          "mt-1 size-2 shrink-0 rounded-full",
                          STATUS_DOT[s.status] ?? "bg-muted-foreground",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs font-medium text-foreground">
                          {s.reference}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {[s.pol, s.pod].filter(Boolean).join(" → ")}
                          {s.carrier ? ` · ${s.carrier}` : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin expedientes este día.</p>
              )}
            </div>
          )}

          {withoutEta.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Icon icon={AlertCircle} size={14} className="text-accent" />
                <h2 className="text-sm font-medium text-foreground">Sin ETA</h2>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {withoutEta.length}
                </span>
              </div>
              <div className="space-y-1">
                {withoutEta.slice(0, 8).map((s) => (
                  <Link
                    key={s.id}
                    href={`/expedientes/${s.id}`}
                    prefetch={false}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-surface-2/60"
                  >
                    <span className="font-mono text-foreground">{s.reference}</span>
                    <span className="truncate text-muted-foreground">
                      {[s.pol, s.pod].filter(Boolean).join(" → ")}
                    </span>
                  </Link>
                ))}
                {withoutEta.length > 8 && (
                  <Link
                    href="/expedientes"
                    prefetch={false}
                    className="block pt-1 text-xs text-primary hover:underline"
                  >
                    Ver todos ({withoutEta.length})
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
