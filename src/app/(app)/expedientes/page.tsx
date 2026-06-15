import Link from "next/link";
import { Plus, LayoutGrid, Rows3, Table2, Download, Upload, Package } from "lucide-react";
import { Icon } from "@/components/icon";

import { getOrgContext, listShipments, getActiveMemberId, getOrgMembers } from "@/lib/erp";
import { createDraftShipment } from "@/lib/erp-actions";
import { ShipmentListClient } from "@/components/app/shipment-list-client";
import { SearchInput } from "@/components/app/search-input";
import { KanbanBoard } from "@/components/app/kanban-board";
import { Button } from "@/components/ui/button";
import { STATUS } from "@/lib/erp-format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Expedientes — Manann" };

export default async function ExpedientesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string; vista?: string; mis?: string }>;
}) {
  const { estado, q, vista, mis } = await searchParams;
  const ctx = await getOrgContext();

  if (!ctx?.org) {
    return (
      <p className="text-base text-muted-foreground">
        Tu usuario no está asignado a ninguna organización.
      </p>
    );
  }

  const myMemberId = mis === "1" ? await getActiveMemberId(ctx.org.id, ctx.user.id) : null;
  const [all, members] = await Promise.all([
    listShipments(ctx.org.id, q || undefined, myMemberId ?? undefined),
    getOrgMembers(ctx.org.id),
  ]);

  const counts = all.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = estado ? all.filter((s) => s.status === estado) : all;
  const isKanban = vista === "kanban";
  const isTabla = vista === "tabla";

  const chips = Object.keys(STATUS).filter((k) => counts[k]);

  // Construye href preservando q y mis
  function vistHref(v: string | null) {
    const params = new URLSearchParams();
    if (v) params.set("vista", v);
    if (estado) params.set("estado", estado);
    if (q) params.set("q", q);
    if (mis === "1") params.set("mis", "1");
    const qs = params.toString();
    return `/expedientes${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Expedientes
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {all.length} expediente{all.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/expedientes/importar"
            prefetch={false}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-base text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
          >
            <Icon icon={Upload} size={14} />
            Importar CSV
          </Link>
          <a
            href="/api/expedientes/export"
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-base text-muted-foreground transition-colors hover:bg-surface-2/60 hover:text-foreground"
          >
            <Icon icon={Download} size={14} />
            Exportar CSV
          </a>
          <form action={createDraftShipment}>
            <Button type="submit" size="sm">
              <Icon icon={Plus} size={16} /> Nuevo expediente
            </Button>
          </form>
        </div>
      </header>

      <SearchInput defaultValue={q} estado={estado} />

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/expedientes" active={!estado && !mis}>
          Todos <Count n={all.length} />
        </FilterChip>
        <FilterChip href="/expedientes?mis=1" active={mis === "1"}>
          Mis expedientes
        </FilterChip>
        {chips.map((k) => (
          <FilterChip
            key={k}
            href={`/expedientes?estado=${k}${mis === "1" ? "&mis=1" : ""}`}
            active={estado === k}
          >
            {STATUS[k].label} <Count n={counts[k]} />
          </FilterChip>
        ))}
      </div>

      {/* Vista toggle: tarjetas | tabla | kanban */}
      <div className="flex items-center gap-1.5 self-end">
        <Link
          href={vistHref(null)}
          prefetch={false}
          aria-label="Vista tarjetas"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
            !isKanban && !isTabla
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon icon={Rows3} size={14} />
        </Link>
        <Link
          href={vistHref("tabla")}
          prefetch={false}
          aria-label="Vista tabla"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
            isTabla
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon icon={Table2} size={14} />
        </Link>
        <Link
          href={vistHref("kanban")}
          prefetch={false}
          aria-label="Vista kanban"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
            isKanban
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon icon={LayoutGrid} size={14} />
        </Link>
      </div>

      {isKanban ? (
        <KanbanBoard shipments={visible} />
      ) : (
        <ShipmentListClient
          shipments={visible}
          members={members}
          view={isTabla ? "tabla" : "cards"}
        />
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function Count({ n }: { n: number }) {
  return <span className="font-mono text-base text-ink-subtle">{n}</span>;
}
