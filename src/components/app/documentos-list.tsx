"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, FileCheck2, FileX2, FileClock, FileSearch, ExternalLink } from "lucide-react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import { DocPreviewPanel } from "@/components/app/doc-preview-panel";
import type { DocumentItem } from "@/lib/erp";

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
  processing: { label: "Procesando", cls: "text-info bg-info/10" },
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

interface DocumentosListProps {
  docs: DocumentItem[];
}

export function DocumentosList({ docs }: DocumentosListProps) {
  const [selected, setSelected] = useState<DocumentItem | null>(null);

  if (docs.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-secondary/[0.04] px-5 py-10 text-center">
        <p className="text-base text-muted-foreground">
          No hay documentos con ese tipo.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {docs.map((doc, i) => {
          const StatusIcon = DOC_STATUS_ICON[doc.status] ?? FileText;
          const statusMeta = DOC_STATUS_LABEL[doc.status] ?? DOC_STATUS_LABEL.uploaded;
          const isSelected = selected?.id === doc.id;

          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => setSelected(isSelected ? null : doc)}
              className={cn(
                "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-surface-2/40",
                i !== 0 && "border-t border-border/60",
                isSelected && "bg-primary/5",
              )}
            >
              {/* Icono */}
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md border border-border",
                  isSelected ? "border-primary/40 text-primary" : "text-muted-foreground",
                )}
              >
                <Icon icon={StatusIcon} size={16} />
              </span>

              {/* Nombre + tipo */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-foreground">
                  {doc.filename}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-base text-muted-foreground">
                    {DOC_TYPE_LABEL[doc.type] ?? doc.type}
                  </span>
                  {doc.sizeBytes && (
                    <>
                      <span className="text-border">·</span>
                      <span className="font-mono text-base text-muted-foreground">
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
                onClick={(e) => e.stopPropagation()}
                className="hidden shrink-0 font-mono text-base text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {doc.reference}
              </Link>

              {/* Estado */}
              <span
                className={cn(
                  "hidden shrink-0 rounded-full px-2 py-0.5 font-mono text-base sm:inline-flex",
                  statusMeta.cls,
                )}
              >
                {statusMeta.label}
              </span>

              {/* Fecha */}
              <span className="hidden shrink-0 text-base text-muted-foreground lg:block">
                {formatDate(doc.createdAt)}
              </span>

              {/* Abrir en nueva pestaña — slot reservado para alinear todas las filas */}
              <span className="flex w-5 shrink-0 justify-end">
                {doc.blobUrl && (
                  <a
                    href={doc.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    title="Abrir documento"
                    aria-label="Abrir documento en ventana nueva"
                  >
                    <Icon icon={ExternalLink} size={14} />
                  </a>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <DocPreviewPanel doc={selected} onClose={() => setSelected(null)} />
    </>
  );
}
