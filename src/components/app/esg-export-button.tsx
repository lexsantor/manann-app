"use client";

import { Download } from "lucide-react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
type EsgExportData = {
  rows: { reference: string; pol: string; pod: string; mode: string; co2Kg: number; distanceKm: number }[];
};

const MODE_LABEL: Record<string, string> = {
  maritimo: "Marítimo",
  aereo: "Aéreo",
  terrestre: "Terrestre",
  ferroviario: "Ferroviario",
  multimodal: "Multimodal",
};

export function EsgExportButton({ data, period }: { data: EsgExportData; period: string }) {
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
    <Button variant="secondary" onClick={handleExport}>
      <Icon icon={Download} size={13} />
      CSV ESG
    </Button>
  );
}
