"use client";
import { useState } from "react";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { Icon } from "@/components/icon";

interface PdfViewerProps {
  url: string;
  filename: string;
}

export function PdfViewer({ url, filename }: PdfViewerProps) {
  const [open, setOpen] = useState(false);
  if (!filename.toLowerCase().endsWith(".pdf")) return null;

  return (
    <div className="mt-1.5 px-3 pb-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon icon={open ? EyeOff : Eye} size={13} />
          {open ? "Cerrar vista previa" : "Ver documento"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon icon={ExternalLink} size={12} />
          Abrir en pestaña
        </a>
      </div>
      {open && (
        <div className="mt-2 overflow-hidden rounded-md border border-border">
          <iframe
            src={url}
            title={filename}
            className="h-[640px] w-full"
          />
        </div>
      )}
    </div>
  );
}
