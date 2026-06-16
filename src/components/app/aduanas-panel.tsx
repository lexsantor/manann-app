"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Declaration = {
  id: string;
  type: string;
  referenceNumber: string | null;
  status: string;
  submittedAt: Date | null;
  createdAt: Date;
  shipmentId: string | null;
  shipmentRef: string | null;
};

const TYPE_LABEL: Record<string, string> = { dua: "DUA", ens: "ENS", ncts: "NCTS", aes: "AES" };
const STATUS_COLOR: Record<string, string> = {
  aceptada: "text-success bg-success/10",
  presentada: "text-primary bg-primary/10",
  pendiente: "text-warning bg-warning/10",
  rechazada: "text-destructive bg-destructive/10",
};

export function AduanasPanel({ declarations }: { declarations: Declaration[] }) {
  const [type, setType] = useState<string>("all");
  const types = ["all", "dua", "ens", "ncts", "aes"];
  const filtered = type === "all" ? declarations : declarations.filter((d) => d.type === type);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              type === t
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {t === "all" ? "Todas" : TYPE_LABEL[t]}
            <span className="ml-1.5 font-mono text-xs text-muted-foreground">
              {t === "all" ? declarations.length : declarations.filter((d) => d.type === t).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Sin declaraciones. Se generan desde cada expediente (panel de Aduanas / Declaraciones).
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card text-left">
                  {["Tipo", "Referencia", "Expediente", "Estado", "Fecha"].map((h) => (
                    <th key={h} className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-2/30">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex w-fit rounded-md bg-secondary/20 px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
                        {TYPE_LABEL[d.type] ?? d.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-foreground">{d.referenceNumber ?? "—"}</td>
                    <td className="px-4 py-2.5">
                      {d.shipmentId && d.shipmentRef ? (
                        <Link href={`/expedientes/${d.shipmentId}`} className="font-mono text-xs text-primary hover:underline">
                          {d.shipmentRef}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn("inline-flex w-fit rounded-full px-2 py-0.5 font-mono text-[10px] font-medium", STATUS_COLOR[d.status] ?? "text-muted-foreground bg-muted/60")}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {new Date(d.submittedAt ?? d.createdAt).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-md border border-warning/20 bg-warning/5 px-3 py-2">
        <p className="text-[11px] text-warning">
          Simulación — integración AEAT (DUA · ENS · NCTS · AES) en producción
        </p>
      </div>
    </div>
  );
}
