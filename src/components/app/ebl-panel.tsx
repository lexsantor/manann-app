"use client";

import { useState, useTransition } from "react";
import { FileKey2, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { issueEbl, transferEbl } from "@/lib/tier-v-actions";

type EBlTransfer = {
  id: string;
  fromParty: string;
  toParty: string;
  action: string;
  signedAt: Date;
};

type EBl = {
  id: string;
  blHash: string;
  status: string;
  currentHolder: string | null;
  createdAt: Date;
  transfers: EBlTransfer[];
};

const STATUS_COLORS: Record<string, string> = {
  Original: "text-primary bg-primary/10",
  Endorsed: "text-amber-500 bg-amber-500/10",
  Surrendered: "text-emerald-500 bg-emerald-500/10",
  Void: "text-muted-foreground bg-muted/50",
};

export function EblPanel({
  shipmentId,
  initialEbl,
}: {
  shipmentId: string;
  initialEbl: EBl | undefined;
}) {
  const [ebl] = useState<EBl | undefined>(initialEbl);
  const [issueOpen, setIssueOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [holderName, setHolderName] = useState("");
  const [toParty, setToParty] = useState("");
  const [action, setAction] = useState("Endorsed");
  const [isPending, startTransition] = useTransition();

  function handleIssue() {
    if (!holderName) return;
    startTransition(async () => {
      await issueEbl(shipmentId, holderName);
      setIssueOpen(false);
      setHolderName("");
    });
  }

  function handleTransfer() {
    if (!toParty || !ebl) return;
    startTransition(async () => {
      await transferEbl(ebl.id, toParty, action);
      setTransferOpen(false);
      setToParty("");
    });
  }

  if (!ebl) {
    return (
      <>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
          <FileKey2 className="mb-2 h-8 w-8 text-muted-foreground/40" strokeWidth={1} />
          <p className="text-sm font-medium text-foreground">Sin e-BL emitido</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Emite el título electrónico para este expediente marítimo
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 gap-1.5"
            onClick={() => setIssueOpen(true)}
          >
            Emitir e-BL
          </Button>
        </div>

        {issueOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start">
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => !isPending && setIssueOpen(false)}
            />
            <div className="relative z-10 flex h-auto w-full max-w-sm flex-col overflow-hidden rounded-tl-xl border-l border-t border-border bg-card shadow-2xl sm:rounded-none sm:h-auto">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-display text-base font-medium">Emitir e-BL</h2>
                <button
                  onClick={() => !isPending && setIssueOpen(false)}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tenedor inicial</label>
                  <Input
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder="Nombre del consignatario inicial"
                  />
                </div>
                <div className="rounded-md bg-amber-500/5 border border-amber-500/20 px-3 py-2">
                  <p className="text-[11px] text-amber-600 dark:text-amber-400">
                    Simulación — integración ESSDOCS / Bolero / WAVE en producción
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleIssue}
                  disabled={isPending || !holderName}
                >
                  Emitir e-BL
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  const canTransfer = ebl.status !== "Surrendered" && ebl.status !== "Void";

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileKey2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm font-medium text-foreground">e-BL</span>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[ebl.status] ?? ""}`}
            >
              {ebl.status}
            </span>
          </div>
          {canTransfer && (
            <Button size="sm" variant="secondary" onClick={() => setTransferOpen(true)} className="gap-1.5">
              <ArrowRight className="h-3.5 w-3.5" />
              Transferir
            </Button>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Tenedor actual:</span>{" "}
            {ebl.currentHolder ?? "—"}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/60 break-all">
            SHA-256: {ebl.blHash}
          </p>
        </div>

        <div className="rounded-md bg-amber-500/5 border border-amber-500/20 px-3 py-1.5">
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            Simulación — integración ESSDOCS / Bolero / WAVE en producción
          </p>
        </div>
      </div>

      {/* Transfer history */}
      {ebl.transfers.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Historial de transferencias
          </p>
          <div className="space-y-1">
            {ebl.transfers.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-md border border-border/50 bg-card px-3 py-2 text-xs"
              >
                <span className="text-muted-foreground shrink-0">
                  {new Date(t.signedAt).toLocaleDateString("es-ES")}
                </span>
                <span className="inline-flex rounded-md bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium text-foreground shrink-0">
                  {t.action}
                </span>
                <span className="text-foreground truncate">
                  {t.fromParty} → {t.toParty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer panel */}
      {transferOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-start">
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={() => !isPending && setTransferOpen(false)}
          />
          <div className="relative z-10 flex h-auto w-full max-w-sm flex-col overflow-hidden border-l border-t border-border bg-card shadow-2xl sm:rounded-none">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-base font-medium">Transferir e-BL</h2>
              <button
                onClick={() => !isPending && setTransferOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Acción</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Endorsed">Endorsed — endosar a nuevo tenedor</SelectItem>
                    <SelectItem value="Surrender">Surrender — entregar al naviero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {action === "Surrender" ? "Naviero receptor" : "Nuevo tenedor"}
                </label>
                <Input
                  value={toParty}
                  onChange={(e) => setToParty(e.target.value)}
                  placeholder="Nombre de la parte"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleTransfer}
                disabled={isPending || !toParty}
              >
                Confirmar transferencia
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
