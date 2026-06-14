"use client";

import { useState, useTransition } from "react";
import { BookOpen, Download } from "lucide-react";
import { Icon } from "@/components/icon";
import { initPGCAccounts } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  activo: "Activo",
  pasivo: "Pasivo",
  patrimonio: "Patrimonio",
  ingreso: "Ingreso",
  gasto: "Gasto",
};

const TYPE_COLOR: Record<string, string> = {
  activo: "text-sky-400 bg-sky-500/10",
  pasivo: "text-violet-400 bg-violet-500/10",
  patrimonio: "text-emerald-400 bg-emerald-500/10",
  ingreso: "text-primary bg-primary/10",
  gasto: "text-accent bg-accent/10",
};

interface AccountRow {
  id: string;
  code: string;
  name: string;
  type: string;
  isSystem: boolean;
}

interface PlanCuentasProps {
  accounts: AccountRow[];
}

export function PlanCuentas({ accounts }: PlanCuentasProps) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ created: number } | null>(null);

  function handleInit() {
    start(async () => {
      const res = await initPGCAccounts();
      setResult(res);
    });
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Icon icon={BookOpen} size={14} className="text-muted-foreground" />
          <span className="font-display text-sm font-medium text-foreground">Plan de cuentas</span>
          <span className="font-mono text-xs text-muted-foreground">({accounts.length})</span>
        </div>
        {accounts.length === 0 && (
          <button
            onClick={handleInit}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <Icon icon={Download} size={11} />
            {pending ? "Cargando…" : "Iniciar PGC"}
          </button>
        )}
        {result && (
          <span className="text-xs text-muted-foreground">{result.created} cuentas añadidas</span>
        )}
      </div>

      {accounts.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Sin cuentas. Inicia el plan PGC estándar.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50 overflow-y-auto" style={{ maxHeight: "520px" }}>
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-10 shrink-0 font-mono text-sm font-medium text-foreground">{a.code}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{a.name}</span>
              <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px]", TYPE_COLOR[a.type] ?? "text-muted-foreground bg-muted/60")}>
                {TYPE_LABEL[a.type] ?? a.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
