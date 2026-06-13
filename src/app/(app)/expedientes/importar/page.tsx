import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Icon } from "@/components/icon";
import { CsvImport } from "@/components/app/csv-import";

export const metadata: Metadata = { title: "Importar expedientes — Manann" };

export default function ImportarPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <Link
          href="/expedientes"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon icon={ArrowLeft} size={14} />
          Volver a expedientes
        </Link>
        <h1 className="font-display text-2xl font-medium tracking-tight text-foreground">
          Importar expedientes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sube un CSV para crear expedientes en bloque. Útil para migrar desde
          otro sistema o cargar histórico.
        </p>
      </header>

      <CsvImport />
    </div>
  );
}
