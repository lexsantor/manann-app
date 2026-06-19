import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Icon } from "@/components/icon";
import { PageHeader } from "@/components/ui/page-header";
import { CsvImport } from "@/components/app/csv-import";

export const metadata: Metadata = { title: "Importar expedientes — Manann" };

export default function ImportarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Expedientes"
        title="Importar expedientes"
        subtitle="Sube un CSV para crear expedientes en bloque. Útil para migrar desde otro sistema o cargar histórico."
        actions={
          <Link
            href="/expedientes"
            className="inline-flex items-center gap-1.5 text-base text-muted-foreground transition-colors hover:text-foreground"
          >
            <Icon icon={ArrowLeft} size={14} />
            Volver a expedientes
          </Link>
        }
      />

      <CsvImport />
    </div>
  );
}
