import Link from "next/link";
import { notFound } from "next/navigation";
import { FolderOpen } from "lucide-react";

import { getOrgContext, listDocuments } from "@/lib/erp";
import { cn } from "@/lib/utils";
import { DocumentosList } from "@/components/app/documentos-list";

export const metadata = { title: "Documentos — Manann" };

const DOC_TYPE_LABEL: Record<string, string> = {
  bl: "Bill of Lading",
  awb: "Air Waybill",
  cmr: "CMR",
  factura_comercial: "Factura comercial",
  packing_list: "Packing List",
  dua: "DUA",
  certificado_origen: "Cert. origen",
  otro: "Otro",
};

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const ctx = await getOrgContext();
  if (!ctx?.org) notFound();

  const all = await listDocuments(ctx.org.id);
  const visible = tipo ? all.filter((d) => d.type === tipo) : all;

  const typeCounts = all.reduce<Record<string, number>>((acc, d) => {
    acc[d.type] = (acc[d.type] ?? 0) + 1;
    return acc;
  }, {});

  const activeTypes = Object.keys(DOC_TYPE_LABEL).filter((k) => typeCounts[k]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-5 w-5 shrink-0 self-start mt-1.5 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Documentos
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {all.length} documento{all.length !== 1 ? "s" : ""} en total
            </p>
          </div>
        </div>
      </header>

      {/* Filtros por tipo */}
      <div className="flex flex-wrap gap-2">
        <FilterChip href="/documentos" active={!tipo}>
          Todos <Count n={all.length} />
        </FilterChip>
        {activeTypes.map((k) => (
          <FilterChip key={k} href={`/documentos?tipo=${k}`} active={tipo === k}>
            {DOC_TYPE_LABEL[k]} <Count n={typeCounts[k]} />
          </FilterChip>
        ))}
      </div>

      {/* Lista con preview lateral */}
      <DocumentosList docs={visible} />
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-base transition-colors",
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
