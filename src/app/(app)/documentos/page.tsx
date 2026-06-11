import Link from "next/link";
import { FileText, FileCheck2, FileX2, FileClock, FileSearch, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

import { getOrgContext, listDocuments } from "@/lib/erp";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

export const metadata = { title: "Documentos — Manann" };

const DOC_TYPE_LABEL: Record<string, string> = {
  bl: "Bill of Lading",
  factura_comercial: "Factura comercial",
  packing_list: "Packing List",
  dua: "DUA",
  certificado_origen: "Cert. origen",
  otro: "Otro",
};

const DOC_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  uploaded: { label: "Subido", cls: "text-muted-foreground bg-muted/60" },
  processing: { label: "Procesando", cls: "text-sky-600 bg-sky-500/10" },
  extracted: { label: "Extraído", cls: "text-accent bg-accent/10" },
  confirmed: { label: "Confirmado", cls: "text-primary bg-primary/10" },
  error: { label: "Error", cls: "text-destructive bg-destructive/10" },
};

const DOC_STATUS_ICON: Record<string, typeof FileText> = {
  confirmed: FileCheck2,
  error: FileX2,
  processing: FileClock,
  extracted: FileSearch,
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

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
        <div>
          <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
            Documentos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {all.length} documento{all.length !== 1 ? "s" : ""} en total
          </p>
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

      {/* Lista */}
      {visible.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {visible.map((doc, i) => {
            const StatusIcon = DOC_STATUS_ICON[doc.status] ?? FileText;
            const statusMeta = DOC_STATUS_LABEL[doc.status] ?? DOC_STATUS_LABEL.uploaded;
            return (
              <div
                key={doc.id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2/40",
                  i !== 0 && "border-t border-border/60",
                )}
              >
                {/* Icono */}
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground">
                  <Icon icon={StatusIcon} size={16} />
                </span>

                {/* Nombre + tipo */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {doc.filename}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {DOC_TYPE_LABEL[doc.type] ?? doc.type}
                    </span>
                    {doc.sizeBytes && (
                      <>
                        <span className="text-border">·</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {formatSize(doc.sizeBytes)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Expediente */}
                <Link
                  href={`/expedientes/${doc.shipmentId}`}
                  prefetch={false}
                  className="hidden shrink-0 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  {doc.reference}
                </Link>

                {/* Estado */}
                <span
                  className={cn(
                    "hidden shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] sm:inline-flex",
                    statusMeta.cls,
                  )}
                >
                  {statusMeta.label}
                </span>

                {/* Fecha */}
                <span className="hidden shrink-0 text-xs text-muted-foreground lg:block">
                  {formatDate(doc.createdAt)}
                </span>

                {/* Descarga */}
                {doc.blobUrl && (
                  <a
                    href={doc.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    title="Abrir documento"
                  >
                    <Icon icon={ExternalLink} size={14} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            No hay documentos con ese tipo.
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
