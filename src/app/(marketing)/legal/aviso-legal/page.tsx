import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Aviso legal — Manann",
  description: "Aviso legal (texto de ejemplo de la demo).",
};

export default function AvisoLegalPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Aviso legal"
      sections={[
        {
          heading: "Titular",
          body: "Manann es un proyecto de demostración construido en solitario para ilustrar un ERP transitario de nueva concepción. No comercializa servicios ni gestiona operaciones logísticas reales.",
        },
        {
          heading: "Objeto",
          body: "El sitio y la aplicación se ofrecen únicamente con fines demostrativos. Los datos de expedientes, navieras, contenedores y tracking que se muestran son ficticios o simulados, salvo donde se indique lo contrario.",
        },
        {
          heading: "Propiedad intelectual",
          body: "La marca, los textos y el diseño forman parte de la demo. Las plantillas y librerías de terceros utilizadas conservan sus respectivas licencias.",
        },
        {
          heading: "Responsabilidad",
          body: "Al tratarse de una demostración, no se ofrece garantía de disponibilidad ni de exactitud de la información mostrada. No debe tomarse ninguna decisión operativa basada en este entorno.",
        },
      ]}
    />
  );
}
