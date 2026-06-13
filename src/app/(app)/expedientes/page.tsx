import Link from "next/link";
import { Plus, LayoutGrid, Rows3, Download, Upload } from "lucide-react";
import { Icon } from "@/components/icon";

import { getOrgContext, listShipments, getActiveMemberId } from "@/lib/erp";
import { createDraftShipment } from "@/lib/erp-actions";
import { ShipmentBoardingPass } from "@/components/app/shipment-boarding-pass";
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
  const all = await listShipments(ctx.org.id, q || undefined, myMemberId ?? undefined);
  const counts = all.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = estado ? all.filter((s) => s.status === estado) : all;
  const isKanban = vista === "kanban";

  // Solo chips para estados presentes en los datos.
  const chips = Object.keys(STATUS).filter((k) => counts[k]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Expedientes
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            {all.length} expediente{all.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* filtro por estado (URL como estado) */}
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

      {/* Vista toggle */}
      <div className="flex items-center gap-1.5 self-end">
        <Link
          href={estado ? `/expedientes?estado=${estado}${q ? `&q=${q}` : ""}` : `/expedientes${q ? `?q=${q}` : ""}`}
          prefetch={false}
          aria-label="Vista lista"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
            !isKanban
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon icon={Rows3} size={14} />
        </Link>
        <Link
          href={`/expedientes?vista=kanban${estado ? `&estado=${estado}` : ""}${q ? `&q=${q}` : ""}`}
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
      ) : visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((s, i) => (
            <div
              key={s.id}
              className="card-stagger"
              style={{ "--i": Math.min(i, 5) } as React.CSSProperties}
            >
              <ShipmentBoardingPass s={s} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-10 text-center">
          <p className="text-base text-muted-foreground">
            No hay expedientes con ese estado.
          </p>
        </div>
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
