"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { Icon } from "@/components/icon";
import { createJournalEntry } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";

interface AccountRow {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface CrearAsientoButtonProps {
  accounts: AccountRow[];
}

interface EntryLine {
  accountCode: string;
  accountName: string;
  debit: string;
  credit: string;
  description: string;
}

const EMPTY_LINE: EntryLine = { accountCode: "", accountName: "", debit: "", credit: "", description: "" };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function CrearAsientoButton({ accounts }: CrearAsientoButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [reference, setReference] = useState("");
  const [date, setDate] = useState(today());
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState(currentPeriod());
  const [lines, setLines] = useState<EntryLine[]>([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
  const dialogRef = useRef<HTMLDivElement>(null);

  useFocusTrap(dialogRef, open, handleClose);

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  function updateLine(i: number, field: keyof EntryLine, value: string) {
    setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }

  function pickAccount(i: number, code: string) {
    const acc = accounts.find((a) => a.code === code);
    if (acc) {
      setLines((ls) => ls.map((l, idx) => idx === i ? { ...l, accountCode: acc.code, accountName: acc.name } : l));
    }
  }

  function addLine() {
    setLines((ls) => [...ls, { ...EMPTY_LINE }]);
  }

  function removeLine(i: number) {
    if (lines.length <= 2) return;
    setLines((ls) => ls.filter((_, idx) => idx !== i));
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setReference("");
    setDate(today());
    setDescription("");
    setPeriod(currentPeriod());
    setLines([{ ...EMPTY_LINE }, { ...EMPTY_LINE }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!balanced) { setError("El asiento no está cuadrado (debe ≠ haber)."); return; }

    const validLines = lines.filter((l) => l.accountCode && (parseFloat(l.debit) || 0) + (parseFloat(l.credit) || 0) > 0);
    if (validLines.length < 2) { setError("Se necesitan al menos 2 líneas con importe."); return; }

    start(async () => {
      try {
        await createJournalEntry({
          reference,
          date,
          description,
          period,
          lines: validLines.map((l) => ({
            accountCode: l.accountCode,
            accountName: l.accountName,
            debit: parseFloat(l.debit) || 0,
            credit: parseFloat(l.credit) || 0,
            description: l.description || undefined,
          })),
        });
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear asiento");
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Icon icon={Plus} size={16} />
        Nuevo asiento
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-2xl outline-none">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <p className="font-display text-base font-medium text-foreground">Nuevo asiento contable</p>
              <button onClick={handleClose} aria-label="Cerrar" className="text-muted-foreground hover:text-foreground">
                <Icon icon={X} size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {/* Header fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="referencia" className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Referencia *</label>
                  <Input
                    id="referencia"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="AST-2026-001"
                  />
                </div>
                <div>
                  <label htmlFor="fecha" className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Fecha *</label>
                  <DatePicker id="fecha" value={date} onChange={(v) => setDate(v)} />
                </div>
                <div className="col-span-2">
                  <label htmlFor="descripcion" className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Descripción *</label>
                  <Input
                    id="descripcion"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del asiento"
                  />
                </div>
              </div>

              {/* Lines */}
              <div>
                <div className="mb-1.5 grid grid-cols-[1fr_80px_80px_auto] gap-2">
                  {["Cuenta", "Debe (€)", "Haber (€)", ""].map((h) => (
                    <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{h}</span>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_80px_auto] items-center gap-2">
                      {accounts.length > 0 ? (
                        <Select value={l.accountCode || "__none__"} onValueChange={(v) => pickAccount(i, v === "__none__" ? "" : v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Selecciona cuenta…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— Selecciona —</SelectItem>
                            {accounts.map((a) => (
                              <SelectItem key={a.code} value={a.code}>
                                {a.code} · {a.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <input
                          value={l.accountCode}
                          onChange={(e) => updateLine(i, "accountCode", e.target.value)}
                          placeholder="Cód. cuenta"
                          className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground"
                        />
                      )}
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={l.debit}
                        onChange={(e) => updateLine(i, "debit", e.target.value)}
                        placeholder="0.00"
                        className="h-8 w-full rounded-md border border-border bg-background px-2 text-right text-xs text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={l.credit}
                        onChange={(e) => updateLine(i, "credit", e.target.value)}
                        placeholder="0.00"
                        className="h-8 w-full rounded-md border border-border bg-background px-2 text-right text-xs text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        disabled={lines.length <= 2}
                        className="rounded p-1 text-muted-foreground hover:text-accent disabled:opacity-30"
                      >
                        <Icon icon={Trash2} size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                    <Icon icon={Plus} size={11} /> Añadir línea
                  </button>
                  <div className={cn("flex gap-4 font-mono text-xs", balanced ? "text-success" : "text-accent")}>
                    <span>Debe: {totalDebit.toFixed(2)}</span>
                    <span>Haber: {totalCredit.toFixed(2)}</span>
                    <span>{balanced ? "✓ Cuadrado" : "✗ No cuadrado"}</span>
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-accent">{error}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={handleClose} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending || !balanced}
                  className={cn("rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", (pending || !balanced) && "opacity-60")}
                >
                  {pending ? "Guardando…" : "Contabilizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
