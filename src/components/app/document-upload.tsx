"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";

import { Icon } from "@/components/icon";
import { recordUploadedDocument } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

type State = "idle" | "uploading" | "error";

export function DocumentUpload({ shipmentId }: { shipmentId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setState("error");
      setError("Solo se admiten archivos PDF.");
      return;
    }
    setState("uploading");
    setProgress(0);
    setError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
        clientPayload: JSON.stringify({ shipmentId }),
        onUploadProgress: (e) => setProgress(Math.round(e.percentage)),
      });
      await recordUploadedDocument({
        shipmentId,
        url: blob.url,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });
      setState("idle");
      setProgress(0);
      router.refresh();
    } catch (e) {
      setState("error");
      setError(
        e instanceof Error ? e.message : "No se pudo subir el documento.",
      );
    }
  }

  return (
    <div className="mt-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Subir documento PDF"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-4 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          drag
            ? "border-primary bg-primary/5"
            : "border-border hover:border-hairline-strong",
          state === "uploading" && "pointer-events-none opacity-80",
        )}
      >
        {state === "uploading" ? (
          <>
            <Icon icon={Loader2} size={20} className="animate-spin text-primary" />
            <p className="text-base text-muted-foreground">
              Subiendo… {progress}%
            </p>
            <div className="h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Icon icon={UploadCloud} size={20} className="text-muted-foreground" />
            <p className="text-base text-foreground">
              Arrastra un Bill of Lading (PDF)
            </p>
            <p className="text-base text-muted-foreground">
              o haz clic para elegir · máx 10 MB
            </p>
          </>
        )}
      </div>

      {state === "error" && (
        <p className="mt-2 flex items-center gap-1.5 text-base text-destructive" role="alert">
          <Icon icon={AlertCircle} size={13} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
