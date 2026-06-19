"use client";

import { X, ExternalLink, FileCheck2, FileSearch, FileClock, FileX2, FileText } from "lucide-react";
import Link from "next/link";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
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

interface DocPreviewPanelProps {
  doc: DocumentItem | null;
  onClose: () => void;
}

export function DocPreviewPanel({ doc, onClose }: DocPreviewPanelProps) {
  const open = doc !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={doc?.filename ?? "Vista previa"}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {doc && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-foreground">
                  {doc.filename}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-base text-muted-foreground">
                    {DOC_TYPE_LABEL[doc.type] ?? doc.type}
                  </span>
                  {doc.reference && (
                    <>
                      <span className="text-border">·</span>
                      <Link
                        href={`/expedientes/${doc.shipmentId}`}
                        className="font-mono text-base text-muted-foreground transition-colors hover:text-primary"
                      >
                        {doc.reference}
                      </Link>
                    </>
                  )}
                  <span className="text-border">·</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono text-base",
                      (DOC_STATUS_LABEL[doc.status] ?? DOC_STATUS_LABEL.uploaded).cls,
                    )}
                  >
                    {(DOC_STATUS_LABEL[doc.status] ?? DOC_STATUS_LABEL.uploaded).label}
                  </span>
                </div>
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-2">
                {doc.blobUrl && (
                  <a
                    href={doc.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir en ventana nueva"
                    aria-label="Abrir documento en ventana nueva"
                    className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon icon={ExternalLink} size={14} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar vista previa"
                  className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon icon={X} size={14} />
                </button>
              </div>
            </div>

            {/* AI confidence strip — only when extracted/confirmed */}
            {doc.aiConfidence !== null && ["extracted", "confirmed"].includes(doc.status) && (
              <div className="flex items-center gap-2 border-b border-border bg-accent/5 px-5 py-2.5">
                <span className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                  Confianza IA
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${Math.round(Number(doc.aiConfidence) * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-base text-accent">
                  {Math.round(Number(doc.aiConfidence) * 100)}%
                </span>
              </div>
            )}

            {/* PDF iframe */}
            <div className="relative flex-1 overflow-hidden bg-surface-2">
              {doc.blobUrl ? (
                <iframe
                  src={doc.blobUrl}
                  title={doc.filename}
                  className="h-full w-full border-0"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <Icon
                    icon={DOC_STATUS_ICON[doc.status] ?? FileText}
                    size={32}
                    className="text-muted-foreground/60"
                  />
                  <p className="text-base text-muted-foreground">
                    Sin archivo almacenado
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
