// Centro de ayuda (Pieza 4 de facilidad de uso): guias cortas y digeribles para
// todos los publicos, incluido el usuario 50+. Contenido puro; la pagina /ayuda
// lo renderiza inline (mejor para 50+ que lanzar overlays).

export type Guide = {
  title: string;
  intro: string;
  steps: string[];
  href?: string;
  cta?: string;
};

export const PRIMEROS_PASOS: Guide[] = [
  {
    title: "Sube un BL y deja que la IA rellene el expediente",
    intro: "El corazon de Manann. En lugar de teclear decenas de campos, arrastras el documento y solo confirmas.",
    steps: [
      "Entra en Expedientes y crea uno nuevo, o abre uno que ya exista.",
      "Arrastra el Bill of Lading en PDF a la zona de documentos.",
      "La IA lee el documento y propone los datos: naviera, puertos, contenedor y fechas.",
      "Revisa los campos resaltados en ambar (lo que propuso la IA) y pulsa confirmar.",
    ],
    href: "/expedientes",
    cta: "Ir a Expedientes",
  },
  {
    title: "Crea y envia una factura",
    intro: "La facturacion esta conectada con la contabilidad: cada factura genera su asiento sola.",
    steps: [
      "Abre un expediente con costes e ingresos cargados.",
      "Pulsa «Generar factura» y revisa las lineas que propone.",
      "Confirmala para emitirla; su asiento contable se crea automaticamente.",
      "Desde el detalle puedes imprimirla, enviarla por email o marcarla como pagada.",
    ],
    href: "/facturas",
    cta: "Ir a Facturacion",
  },
  {
    title: "Muevete rapido por toda la app",
    intro: "No hace falta memorizar menus. Dos atajos te llevan a cualquier sitio.",
    steps: [
      "Pulsa Cmd+K (o Ctrl+K) para buscar y saltar a cualquier expediente o pantalla.",
      "Pulsa Cmd+J (o Ctrl+J) para preguntarle a la IA sobre tus datos.",
      "Usa el boton «Crear» de la barra superior para abrir expedientes, cotizaciones, facturas o contactos.",
    ],
  },
  {
    title: "Comparte el seguimiento de un envio",
    intro: "Tu cliente puede ver el estado del envio sin entrar en el ERP.",
    steps: [
      "Abre el expediente que quieres compartir.",
      "Genera el enlace de seguimiento de solo lectura.",
      "Enviaselo a tu cliente: vera la ruta, el estado y la ETA, sin datos internos.",
    ],
  },
];

export const GLOSARIO: { term: string; def: string }[] = [
  { term: "Expediente", def: "El dossier de un envio: ruta, carga, partes, documentos y costes, todo en un sitio." },
  { term: "BL (Bill of Lading)", def: "El conocimiento de embarque maritimo: prueba el contrato de transporte y la mercancia." },
  { term: "AWB (Air Waybill)", def: "El equivalente del BL para la carga aerea." },
  { term: "FCL / LCL", def: "Contenedor completo (FCL) o carga agrupada con otros envios (LCL)." },
  { term: "ETD / ETA", def: "Fecha estimada de salida (ETD) y de llegada (ETA) del envio." },
  { term: "DUA", def: "Documento Unico Administrativo: la declaracion en aduana de la mercancia." },
  { term: "Margen (GP)", def: "La diferencia entre lo que facturas y lo que cuesta el envio. Manann lo calcula solo." },
];
