"use client";

import { Download } from "lucide-react";
import { Icon } from "@/components/icon";
import type { EsgData } from "@/lib/erp";

const MODE_LABEL: Record<string, string> = {
  maritimo: "Marítimo",
  aereo: "Aéreo",
  terrestre: "Terrestre",
  ferroviario: "Ferroviario",
  multimodal: "Multimodal",
};

export function EsgExportButton({ data, period }: { data: EsgData; period: string }) {
  function handleExport() {
    const header = ["Expediente", "POL", "POD", "Modo", "CO2 (kg)", "Distancia (km)"];
    const lines = data.rows.map((r) => [
      r.reference,
      r.pol,
      r.pod,
      MODE_LABEL[r.mode] ?? r.mode,
      r.co2Kg.toFixed(1),
      r.distanceKm.toFixed(0),
    ]);
    const csv = [header, ...lines].map((row) => row.join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `esg-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Icon icon={Download} size={13} />
      CSV ESG
    </button>
  );
}
