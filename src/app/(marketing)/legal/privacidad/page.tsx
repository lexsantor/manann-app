import type { Metadata } from "next";

import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacidad — Manann",
  description: "Política de privacidad (texto de ejemplo de la demo).",
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacidad"
      sections={[
        {
          heading: "Qué datos tratamos",
          body: "En esta demo, los únicos datos personales que pueden tratarse son el correo que introduces para acceder por enlace mágico y, si escribes desde la página de contacto, tu nombre, correo y mensaje. No usamos cookies de seguimiento ni publicidad.",
        },
        {
          heading: "Para qué",
          body: "El correo de acceso se usa exclusivamente para autenticarte en la demo. Los mensajes de contacto se usan solo para responderte. No cedemos datos a terceros con fines comerciales.",
        },
        {
          heading: "Dónde viven",
          body: "Los datos de la demo se almacenan en infraestructura de Neon (base de datos) y se procesan a través de proveedores como Resend (correo) y Vercel (alojamiento). El documento que subas para la extracción por IA se procesa con Google Gemini.",
        },
        {
          heading: "Tus opciones",
          body: "Como demo, no implementamos el flujo completo de derechos RGPD de un producto en producción. Si quieres que eliminemos un dato que hayas introducido, escríbenos desde la página de contacto.",
        },
      ]}
    />
  );
}
