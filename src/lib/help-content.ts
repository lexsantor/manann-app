export type ScreenHelp = {
  title: string;
  queHace: string;
  accionesClave: { label: string; desc: string }[];
};

export const ATAJOS: { k: string; t: string; d: string }[] = [
  { k: "⌘K", t: "Buscar y ejecutar acciones", d: "Abre el buscador para saltar a cualquier expediente o módulo." },
  { k: "⌘J", t: "Manann IA", d: "Pregunta a la IA sobre tus datos: estados, costes, riesgos." },
  { k: "BL", t: "El expediente se rellena solo", d: "Arrastra un Bill of Lading al expediente y la IA extrae los campos." },
  { k: "+", t: "Crear rápido", d: "Usa «Crear» para abrir expedientes, cotizaciones, facturas o contactos." },
];

const GENERIC: ScreenHelp = {
  title: "Estás en Manann",
  queHace: "Cada pantalla tiene su propia ayuda. Usa ⌘K para moverte rápido y el botón Ayuda cuando lo necesites.",
  accionesClave: [],
};

export const SCREEN_HELP: Record<string, ScreenHelp> = {
  "/dashboard": {
    title: "Panel general",
    queHace: "Tu resumen del día: expedientes en curso, estados y métricas operativas.",
    accionesClave: [
      { label: "Abre un expediente", desc: "Haz clic en una tarjeta o usa ⌘K para buscarlo." },
      { label: "Crea uno nuevo", desc: "Botón «Crear» arriba a la derecha." },
    ],
  },
  "/expedientes": {
    title: "Expedientes",
    queHace: "El listado de todos tus envíos. Filtra por estado y cambia entre vista tarjetas, tabla o kanban.",
    accionesClave: [
      { label: "Nuevo expediente", desc: "Créalo vacío y arrastra el BL, o impórtalo desde CSV." },
      { label: "Cambia de vista", desc: "Tarjetas para ojear, tabla para comparar venta y margen." },
    ],
  },
  "/expedientes/": {
    title: "Detalle del expediente",
    queHace: "Toda la vida del envío en un sitio: documentos, partes, contenedor, finanzas y tracking.",
    accionesClave: [
      { label: "Arrastra el BL", desc: "En «Documentos». La IA propone los campos en ámbar; tú confirmas." },
      { label: "Revisa el margen", desc: "En «Finanzas» ves coste, venta y GP del expediente." },
    ],
  },
  "/contabilidad": {
    title: "Contabilidad",
    queHace: "Plan contable PGC, diario de asientos y tesorería. Las facturas generan asientos automáticamente.",
    accionesClave: [
      { label: "Crea un asiento", desc: "Botón «Crear asiento» en el diario; cuadra debe y haber." },
      { label: "Revisa el balance", desc: "Sumas y saldos, modelo 303 y conciliación en las tarjetas de arriba." },
    ],
  },
  "/reportes": {
    title: "Reportes",
    queHace: "Cuadros de mando de tu operativa: ingresos, margen, puntualidad y volumen por modo.",
    accionesClave: [
      { label: "Lee los KPIs", desc: "Ingresos, margen medio y tiempos arriba del todo." },
      { label: "Compara por dimensión", desc: "Cliente, naviera, ruta y modo en las tablas." },
    ],
  },
};

export function helpForPath(pathname: string): ScreenHelp {
  // Detalle de expediente: /expedientes/<id>
  if (/^\/expedientes\/[^/]+/.test(pathname)) return SCREEN_HELP["/expedientes/"];
  let best: string | null = null;
  for (const key of Object.keys(SCREEN_HELP)) {
    if (key === "/expedientes/") continue;
    if (pathname === key || pathname.startsWith(`${key}/`)) {
      if (!best || key.length > best.length) best = key;
    }
  }
  return best ? SCREEN_HELP[best] : GENERIC;
}
