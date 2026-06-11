import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrgContext, listContacts } from "@/lib/erp";
import { cn } from "@/lib/utils";

export const metadata = { title: "Contactos — Manann" };

const ROLE_LABEL: Record<string, string> = {
  shipper: "Exportador",
  consignee: "Importador",
  notify: "Notificado",
  carrier: "Naviera",
  agent: "Agente",
  forwarder: "Transitario",
};

const ROLE_COLOR: Record<string, string> = {
  shipper: "text-sky-600 bg-sky-500/10",
  consignee: "text-primary bg-primary/10",
  notify: "text-muted-foreground bg-muted/60",
  carrier: "text-violet-600 bg-violet-500/10",
  agent: "text-orange-600 bg-orange-500/10",
  forwarder: "text-emerald-600 bg-emerald-500/10",
};

const ROLE_FILTER_ORDER = ["shipper", "consignee", "carrier", "agent", "forwarder", "notify"];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const { rol } = await searchParams;
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const all = await listContacts(ctx.org.id);
  const visible = rol ? all.filter((c) => c.role === rol) : all;

  const roleCounts = all.reduce<Record<string, number>>((acc, c) => {
    acc[c.role] = (acc[c.role] ?? 0) + 1;
    return acc;
  }, {});

  const activeRoles = ROLE_FILTER_ORDER.filter((r) => roleCounts[r]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          Contactos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {all.length} contacto{all.length !== 1 ? "s" : ""} en {
            Object.keys(roleCounts).length
          } rol{Object.keys(roleCounts).length !== 1 ? "es" : ""}
        </p>
      </header>

      {/* Filtros por rol */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/contactos" active={!rol}>
          Todos <Count n={all.length} />
        </FilterChip>
        {activeRoles.map((r) => (
          <FilterChip key={r} href={`/contactos?rol=${r}`} active={rol === r}>
            {ROLE_LABEL[r]} <Count n={roleCounts[r]} />
          </FilterChip>
        ))}
      </div>

      {/* Lista */}
      {visible.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {visible.map((contact, i) => {
            const key = `${contact.name}::${contact.role}`;
            const roleMeta = ROLE_COLOR[contact.role] ?? "text-muted-foreground bg-muted/60";
            const location = [contact.city, contact.country].filter(Boolean).join(", ");
            return (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-4 px-4 py-3",
                  i !== 0 && "border-t border-border/60",
                )}
              >
                {/* Avatar inicial */}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs font-medium text-foreground">
                  {initials(contact.name)}
                </span>

                {/* Nombre + ubicación */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {contact.name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {location && (
                      <span className="text-xs text-muted-foreground">{location}</span>
                    )}
                    {contact.taxId && (
                      <>
                        {location && <span className="text-border">·</span>}
                        <span className="font-mono text-xs text-muted-foreground">
                          {contact.taxId}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Rol */}
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]",
                    roleMeta,
                  )}
                >
                  {ROLE_LABEL[contact.role] ?? contact.role}
                </span>

                {/* Expedientes */}
                <Link
                  href={`/expedientes?q=${encodeURIComponent(contact.name)}`}
                  prefetch={false}
                  className="shrink-0 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  title="Ver expedientes de este contacto"
                >
                  {contact.expedientes} exp.
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No hay contactos con ese rol.
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
  return <span className="font-mono text-xs text-ink-subtle">{n}</span>;
}
