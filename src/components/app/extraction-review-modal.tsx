"use client";

import { useRef, useState } from "react";
import { Columns2, X } from "lucide-react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { AiExtractionPanel } from "@/components/app/ai-extraction-panel";

interface Props {
  pdfUrl: string;
  filename: string;
  documentId: string;
  status: string;
  extraction: unknown;
  docType?: string;
}

/**
 * Revisión lado a lado del momento wow: el documento origen (PDF) a la izquierda
 * y la propuesta de la IA (campos extraídos, editables) a la derecha. Hace
 * literal el argumento "documento → expediente". Additivo: el panel inline sigue
 * funcionando; esto es la vista ampliada para presentar.
 */
export function ExtractionReviewModal({
  pdfUrl,
  filename,
  documentId,
  status,
  extraction,
  docType,
}: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open, () => setOpen(false));

  return (
    <div className="mt-1.5 px-3">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Icon icon={Columns2} size={14} />
        Ver documento y datos lado a lado
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Documento y datos extraídos"
            tabIndex={-1}
            className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Icon icon={Columns2} size={15} className="text-accent" />
                <p className="font-display text-base font-medium text-foreground">
                  Documento <span className="text-muted-foreground">→</span> expediente
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon icon={X} size={16} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
              {/* Documento origen */}
              <div className="min-h-0 border-b border-border bg-muted/30 lg:border-b-0 lg:border-r">
                <iframe src={pdfUrl} title={filename} className="h-full w-full" />
              </div>
              {/* Propuesta de la IA (reutiliza el panel; mismos campos editables + confirmar) */}
              <div className="min-h-0 overflow-y-auto px-4 pb-4">
                <AiExtractionPanel
                  documentId={documentId}
                  status={status}
                  extraction={extraction}
                  docType={docType}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
