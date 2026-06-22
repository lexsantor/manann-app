"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { bulkImportRates } from "@/lib/erp-actions";
import type { RateInput } from "@/lib/erp-actions";

const HEADERS = ["concept", "serviceType", "unit", "basePrice", "currency", "validFrom", "validTo", "notes"];
const EXAMPLE = `concept,serviceType,unit,basePrice,currency,validFrom,validTo,notes
Flete FCL 20',flete,contenedor,1500,EUR,2026-01-01,2026-12-31,
Flete FCL 40',flete,contenedor,2200,EUR,2026-01-01,2026-12-31,
Despacho aduana,aduana,bl,350,EUR,,,Incluye DUA`;

function parseCsv(text: string): RateInput[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row: Record<string, string> = {};
    header.forEach((h, i) => { row[h] = (cols[i] ?? "").trim(); });
    return {
      concept: row.concept ?? "",
      serviceType: (row.servicetype ?? row.serviceType ?? "") as RateInput["serviceType"],
      unit: (row.unit ?? "") as RateInput["unit"],
      basePrice: row.baseprice ?? row.basePrice ?? "",
      currency: row.currency || "EUR",
      validFrom: row.validfrom || row.validFrom || null,
      validTo: row.validto || row.validTo || null,
      notes: row.notes || null,
    };
  });
}

export function RateCsvImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<RateInput[] | null>(null);
  const [filename, setFilename] = useState("");
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [pending, start] = useTransition();

  function handleFile(file: File) {
    setResult(null);
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setPreview(parseCsv(text));
    };
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  }

  function handleImport() {
    if (!preview) return;
    start(async () => {
      const r = await bulkImportRates(preview);
      setResult(r);
      if (r.errors.length === 0) {
        setPreview(null);
        setFilename("");
      }
    });
  }

  function reset() {
    setPreview(null);
    setFilename("");
    setResult(null);
  }

  return (
    <div className="space-y-3">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-surface-2/20 py-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Icon icon={Upload} size={24} className="text-muted-foreground/60 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">Arrastra un CSV o haz clic para seleccionar</p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
            Columnas: {HEADERS.join(", ")}
          </p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Icon icon={FileText} size={15} className="text-muted-foreground" />
              <span className="text-sm text-foreground">{filename}</span>
              <span className="rounded-full bg-muted/60 px-2 py-0.5 font-mono text-xs text-muted-foreground">{preview.length} filas</span>
            </div>
            <button onClick={reset} className="inline-flex items-center justify-center min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 rounded p-1 text-muted-foreground/60 hover:text-foreground transition-colors">
              <X className="size-4" />
            </button>
          </div>
          <div className="overflow-x-auto max-h-52">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40">
                  {["Concepto", "Tipo", "Unidad", "Precio", "Moneda"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left label-mono text-muted-foreground/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {preview.slice(0, 10).map((r, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1.5 text-foreground">{r.concept || <span className="text-accent">vacío</span>}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{r.serviceType}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{r.unit}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{r.basePrice}</td>
                    <td className="px-3 py-1.5 font-mono text-muted-foreground">{r.currency}</td>
                  </tr>
                ))}
                {preview.length > 10 && (
                  <tr><td colSpan={5} className="px-3 py-1.5 text-center font-mono text-[10px] text-muted-foreground/60">+{preview.length - 10} más</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            {result ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm text-success">
                  <Icon icon={CheckCircle2} size={14} />
                  {result.imported} tarifas importadas
                </div>
                {result.errors.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-accent">
                    <Icon icon={AlertCircle} size={14} />
                    {result.errors.length} errores
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60">Revisa la previsualización antes de importar</p>
            )}
            <Button
              onClick={handleImport}
              disabled={pending || preview.length === 0}
              size="sm"
              className="gap-1.5"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Importar {preview.length} tarifas
            </Button>
          </div>
          {result?.errors && result.errors.length > 0 && (
            <div className="border-t border-border/40 px-4 py-3 space-y-1">
              {result.errors.map((e, i) => (
                <p key={i} className="font-mono text-xs text-accent">{e}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <details className="group">
        <summary className="cursor-pointer font-mono text-[10px] text-muted-foreground/60 hover:text-muted-foreground/60 list-none">
          Ver formato CSV de ejemplo
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-md border border-border/40 bg-surface-2/20 p-3 font-mono text-[10px] text-muted-foreground/60 whitespace-pre">{EXAMPLE}</pre>
      </details>
    </div>
  );
}
