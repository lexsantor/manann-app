"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, X } from "lucide-react";

import { importShipmentsFromCsv, type ImportRow, type ImportResult } from "@/lib/import-actions";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";

const EXPECTED_COLS = ["referencia", "modo", "estado", "naviera", "pol", "pod", "etd", "eta", "buque"];

const EXAMPLE_CSV = `referencia,modo,estado,naviera,pol,pod,etd,eta,buque
EXP-2026-0010,maritimo,en_transito,MSC,ESVLC,CNNBO,2026-05-01,2026-06-15,MSC LORENA
,aereo,confirmado,Iberia Cargo,LEMD,KORD,2026-06-10,2026-06-11,
,terrestre,borrador,,ESBCN,FRMRS,,,`;

type Stage = "idle" | "preview" | "done" | "error";

interface PreviewRow {
  referencia: string;
  modo: string;
  estado: string;
  naviera: string;
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  [key: string]: string;
}

function parseCSV(text: string): PreviewRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("El archivo no tiene filas de datos.");
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: PreviewRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = lines[i].split(",").map((v) => v.trim());
    const row: PreviewRow = { referencia: "", modo: "", estado: "", naviera: "", pol: "", pod: "", etd: "", eta: "" };
    headers.forEach((h, j) => { row[h] = vals[j] ?? ""; });
    rows.push(row);
  }
  return rows;
}

export function CsvImport() {
  const [stage, setStage] = useState<Stage>("idle");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [parseError, setParseError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startImport] = useTransition();

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      setParseError("Solo se aceptan archivos .csv");
      return;
    }
    setParseError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseCSV(e.target?.result as string);
        if (parsed.length === 0) throw new Error("El archivo no contiene filas válidas.");
        if (parsed.length > 500) throw new Error("Máximo 500 filas por importación.");
        setRows(parsed);
        setStage("preview");
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Error al leer el archivo.");
      }
    };
    reader.readAsText(file);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function reset() {
    setStage("idle");
    setRows([]);
    setFileName("");
    setResult(null);
    setParseError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function confirm() {
    const importRows: ImportRow[] = rows.map((r) => ({
      referencia: r.referencia || undefined,
      modo: (["maritimo", "aereo", "terrestre", "ferroviario", "multimodal"].includes(r.modo) ? r.modo : "maritimo") as ImportRow["modo"],
      estado: (["borrador", "confirmado", "en_transito", "en_aduana", "entregado", "cerrado"].includes(r.estado) ? r.estado : "borrador") as ImportRow["estado"],
      naviera: r.naviera || undefined,
      pol: r.pol || undefined,
      pod: r.pod || undefined,
      etd: r.etd || undefined,
      eta: r.eta || undefined,
      buque: r.buque || undefined,
    }));

    startImport(async () => {
      try {
        const res = await importShipmentsFromCsv(importRows);
        setResult(res);
        setStage("done");
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Error al importar.");
        setStage("error");
      }
    });
  }

  if (stage === "done" && result) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon icon={CheckCircle2} size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">Importación completada</p>
              <p className="text-base text-muted-foreground">
                {result.created} expediente{result.created !== 1 ? "s" : ""} creado{result.created !== 1 ? "s" : ""}
                {result.skipped > 0 && `, ${result.skipped} omitido${result.skipped !== 1 ? "s" : ""} (referencia duplicada)`}
              </p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <p className="mb-2 text-base font-medium text-destructive">
                {result.errors.length} fila{result.errors.length !== 1 ? "s" : ""} con error:
              </p>
              <ul className="space-y-1">
                {result.errors.map((e) => (
                  <li key={e.row} className="font-mono text-base text-destructive">
                    Fila {e.row}: {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button size="sm" onClick={reset}>
            Importar más
          </Button>
          <Link
            href="/expedientes"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-base text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Ver expedientes
            <Icon icon={ArrowRight} size={14} />
          </Link>
        </div>
      </div>
    );
  }

  if (stage === "preview") {
    const preview = rows.slice(0, 5);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">{fileName}</p>
            <p className="text-base text-muted-foreground">
              {rows.length} fila{rows.length !== 1 ? "s" : ""} detectada{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button type="button" onClick={reset} className="text-muted-foreground hover:text-foreground">
            <Icon icon={X} size={16} />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-border bg-card">
                {["referencia", "modo", "pol", "pod", "naviera", "estado", "etd", "eta"].map((col) => (
                  <th key={col} className="px-4 py-2.5 text-left font-mono text-base uppercase tracking-wider text-muted-foreground">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-mono text-base text-foreground">{r.referencia || <span className="text-muted-foreground">auto</span>}</td>
                  <td className="px-4 py-2.5 text-base text-foreground">{r.modo || "maritimo"}</td>
                  <td className="px-4 py-2.5 font-mono text-base">{r.pol || "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-base">{r.pod || "—"}</td>
                  <td className="px-4 py-2.5 text-base">{r.naviera || "—"}</td>
                  <td className="px-4 py-2.5 text-base">{r.estado || "borrador"}</td>
                  <td className="px-4 py-2.5 font-mono text-base">{r.etd || "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-base">{r.eta || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 5 && (
            <p className="border-t border-border px-4 py-2.5 font-mono text-base text-muted-foreground">
              + {rows.length - 5} fila{rows.length - 5 !== 1 ? "s" : ""} más
            </p>
          )}
        </div>

        <p className="text-base text-muted-foreground">
          Las referencias vacías se generarán automáticamente (EXP-{new Date().getFullYear()}-XXXX).
          Las filas con una referencia ya existente se omitirán sin error.
        </p>

        <div className="flex gap-3">
          <Button size="sm" disabled={pending} onClick={confirm}>
            {pending ? "Importando…" : `Importar ${rows.length} expediente${rows.length !== 1 ? "s" : ""}`}
          </Button>
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            className="rounded-md border border-border px-3 py-1.5 text-base text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-border/80 hover:bg-surface-2/40"
        }`}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-card border border-border">
          <Icon icon={Upload} size={20} className="text-muted-foreground" />
        </div>
        <div>
          <p className="text-base font-medium text-foreground">
            Arrastra tu CSV aquí o haz clic para seleccionarlo
          </p>
          <p className="mt-1 text-base text-muted-foreground">
            Máximo 500 filas · Solo archivos .csv
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={onFileInput}
        />
      </div>

      {parseError && (
        <p className="flex items-center gap-1.5 text-base text-destructive" role="alert">
          <Icon icon={AlertCircle} size={14} /> {parseError}
        </p>
      )}

      {/* Formato esperado */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-3 font-mono text-base uppercase tracking-widest text-muted-foreground">
          Formato esperado
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {EXPECTED_COLS.map((col) => (
            <span
              key={col}
              className="rounded border border-border bg-background px-2 py-0.5 font-mono text-base text-muted-foreground"
            >
              {col}
            </span>
          ))}
        </div>
        <p className="mb-3 text-base text-muted-foreground">
          Solo <code className="font-mono">referencia</code> puede estar vacía (se genera automáticamente).
          Fechas en formato <code className="font-mono">YYYY-MM-DD</code>.
        </p>
        <p className="mb-2 font-mono text-base uppercase tracking-widest text-muted-foreground">
          Ejemplo
        </p>
        <pre className="overflow-x-auto rounded-md bg-background p-3 font-mono text-base text-muted-foreground">
          {EXAMPLE_CSV}
        </pre>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(EXAMPLE_CSV)}`}
          download="manann-plantilla.csv"
          className="mt-3 inline-flex items-center gap-1.5 text-base text-primary hover:underline"
        >
          <Icon icon={FileText} size={12} />
          Descargar plantilla
        </a>
      </div>
    </div>
  );
}
