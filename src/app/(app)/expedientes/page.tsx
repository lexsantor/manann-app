import Link from "next/link";

import { getOrgContext, listShipments } from "@/lib/erp";
import { ShipmentRow } from "@/components/app/shipment-row";
import { KeyboardListNav } from "@/components/app/keyboard-list-nav";
import { STATUS } from "@/lib/erp-format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Expedientes — Manann" };

export default async function ExpedientesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const ctx = await getOrgContext();

  if (!ctx?.org) {
    return (
      <p className="text-sm text-muted-foreground">
        Tu usuario no está asignado a ninguna organización.
      </p>
    );
  }

  const all = await listShipments(ctx.org.id);
  const counts = all.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});
  const visible = estado ? all.filter((s) => s.status === estado) : all;

  // Solo chips para estados presentes en los datos.
  const chips = Object.keys(STATUS).filter((k) => counts[k]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Expedientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {all.length} en total · navega con ↑ ↓ y abre con Enter
          </p>
        </div>
      </header>

      {/* filtro por estado (URL como estado) */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/expedientes" active={!estado}>
          Todos <Count n={all.length} />
        </FilterChip>
        {chips.map((k) => (
          <FilterChip
            key={k}
            href={`/expedientes?estado=${k}`}
            active={estado === k}
          >
            {STATUS[k].label} <Count n={counts[k]} />
          </FilterChip>
        ))}
      </div>

      {visible.length > 0 ? (
        <KeyboardListNav>
          {visible.map((s) => (
            <ShipmentRow key={s.id} s={s} />
          ))}
        </KeyboardListNav>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
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
  return <span className="font-mono text-xs text-ink-subtle">{n}</span>;
}
