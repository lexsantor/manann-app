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
  "/cotizaciones": {
    title: "Cotizaciones",
    queHace: "Las ofertas que envías al cliente. Genéralas, mándalas y conviértelas en expediente al ganarlas.",
    accionesClave: [
      { label: "Nueva cotización", desc: "Desde plantilla o con la IA; añade conceptos y márgenes." },
      { label: "Gánala → expediente", desc: "Una cotización aceptada se vuelve expediente con un clic." },
    ],
  },
  "/facturas": {
    title: "Facturación",
    queHace: "Las facturas emitidas. Nacen de los costes y la venta de un expediente, sin recolocar datos.",
    accionesClave: [
      { label: "Genera una factura", desc: "Desde el panel de finanzas de un expediente." },
      { label: "Sigue el cobro", desc: "Estado de cada factura: emitida, enviada, pagada o vencida." },
    ],
  },
  "/gastos": {
    title: "Gastos",
    queHace: "Gastos operativos de la organización, por categoría, que no cuelgan de un expediente concreto.",
    accionesClave: [
      { label: "Añadir gasto", desc: "Fecha, categoría, importe y proveedor." },
      { label: "Revisa el total", desc: "El acumulado del período, arriba." },
    ],
  },
  "/tarifas": {
    title: "Tarifas",
    queHace: "Tu tarifario de referencia: flete, THC, despacho… por concepto y unidad, con vigencia.",
    accionesClave: [
      { label: "Nueva tarifa", desc: "Concepto, tipo, unidad, precio base y validez." },
      { label: "Importa por CSV", desc: "Carga el tarifario de golpe desde un archivo." },
    ],
  },
  "/aduanas": {
    title: "Aduanas",
    queHace: "Las declaraciones aduaneras de todos los expedientes: DUA, ENS, NCTS, AES y su estado.",
    accionesClave: [
      { label: "Filtra por tipo", desc: "DUA, ENS, NCTS o AES con las pestañas de arriba." },
      { label: "Prepara desde el expediente", desc: "El DUA se prerellena con los datos ya extraídos." },
    ],
  },
  "/vuelos": {
    title: "Vuelos",
    queHace: "Catálogo de vuelos de carga para asignar a manifiestos aéreos (MAWB).",
    accionesClave: [
      { label: "Nuevo vuelo", desc: "Aerolínea, número, aeropuertos, horario y capacidad." },
      { label: "Asígnalo a un MAWB", desc: "Desde el manifiesto aéreo correspondiente." },
    ],
  },
  "/manifiestos": {
    title: "Manifiestos aéreos",
    queHace: "Agrupan los HAWB bajo un MAWB, con peso, bultos y descripción. Imprimibles.",
    accionesClave: [
      { label: "Nuevo manifiesto", desc: "Crea el MAWB y añade sus partidas HAWB." },
      { label: "Expande un MAWB", desc: "Para ver y editar su desglose de HAWBs." },
    ],
  },
  "/ordenes-transporte": {
    title: "Órdenes de transporte",
    queHace: "La gestión terrestre: transportista, matrícula, conductor, recogida y entrega.",
    accionesClave: [
      { label: "Nueva orden", desc: "Vincula expediente, transportista y fechas." },
      { label: "Cambia el estado", desc: "Pendiente → en ruta → entregado, desde el selector." },
    ],
  },
  "/rutas": {
    title: "Rutas",
    queHace: "Rutas terrestres habituales con distancia, tiempo y coste por km de referencia.",
    accionesClave: [
      { label: "Nueva ruta", desc: "Origen, destino y parámetros de referencia." },
    ],
  },
  "/pipeline": {
    title: "Pipeline comercial",
    queHace: "Tus oportunidades por etapa, de prospecto a ganado, con el valor de cada una.",
    accionesClave: [
      { label: "Nueva oportunidad", desc: "Añádela a la etapa que corresponda." },
      { label: "Avanza de etapa", desc: "Muévela por el tablero según evoluciona." },
    ],
  },
  "/contactos": {
    title: "Contactos y tablas maestras",
    queHace: "Tu directorio de exportadores, importadores, navieras y agentes, más tablas de referencia.",
    accionesClave: [
      { label: "Nuevo contacto", desc: "O impórtalos desde tus expedientes existentes." },
      { label: "Consulta las maestras", desc: "Navieras, contenedores e incoterms en las pestañas." },
    ],
  },
  "/partners": {
    title: "Partners y red",
    queHace: "Tu directorio de corresponsales y subcontratistas, con scorecard de puntualidad y screening.",
    accionesClave: [
      { label: "Tu perfil en la red", desc: "Especialidades, corredores y certificaciones." },
      { label: "Red y tenders", desc: "Busca agentes por país y envíales peticiones de oferta." },
    ],
  },
  "/partners/red": {
    title: "Red de agentes",
    queHace: "Directorio de corresponsales verificados por país, modo y corredor.",
    accionesClave: [
      { label: "Busca un agente", desc: "Filtra por país, corredor o modo de transporte." },
    ],
  },
  "/partners/tender": {
    title: "Tender a la red",
    queHace: "Envía una petición de oferta (RFQ) a varios corresponsales y compara sus respuestas.",
    accionesClave: [
      { label: "Nuevo tender", desc: "Describe la carga y la ruta; elige a quién enviarlo." },
      { label: "Compara ofertas", desc: "Las respuestas llegan al mismo sitio." },
    ],
  },
  "/calidad": {
    title: "Calidad y procesos",
    queHace: "Incidencias, no conformidades y SLAs con semáforo de cumplimiento.",
    accionesClave: [
      { label: "Registra una incidencia", desc: "Tipo, responsable, estado y coste de impacto." },
      { label: "Define SLAs", desc: "Objetivos de tiempo por métrica y su cumplimiento." },
    ],
  },
  "/conectores": {
    title: "Conectores",
    queHace: "Integraciones con navieras, aduanas, contabilidad y comunicación. Lo simulado va etiquetado.",
    accionesClave: [
      { label: "Revisa el estado", desc: "Conectadas, en catálogo y en producción." },
    ],
  },
  "/excepciones": {
    title: "Excepciones",
    queHace: "La bandeja de lo que requiere tu atención: retrasos, márgenes en riesgo y avisos.",
    accionesClave: [
      { label: "Prioriza y resuelve", desc: "La IA ordena por impacto; la decisión es tuya." },
    ],
  },
  "/maestros": {
    title: "Tablas maestras",
    queHace: "Los catálogos que alimentan la operativa: puertos, aeropuertos, países, monedas, conceptos, regímenes y más.",
    accionesClave: [
      { label: "Busca y gestiona", desc: "Cada tabla es editable y buscable." },
    ],
  },
  "/briefing": {
    title: "Briefing matutino",
    queHace: "El resumen del día por la IA: ETAs, expedientes en riesgo y lo que necesita tu atención.",
    accionesClave: [
      { label: "Empieza por aquí", desc: "Lo importante antes de abrir cada expediente." },
    ],
  },
  "/autopilot": {
    title: "Autopilot",
    queHace: "La bandeja donde la IA prepara y ordena el trabajo. Propone; tú confirmas.",
    accionesClave: [
      { label: "Revisa lo propuesto", desc: "Nada se ejecuta sin tu visto bueno." },
    ],
  },
  "/consolidaciones": {
    title: "Consolidaciones LCL",
    queHace: "Agrupan varios expedientes LCL bajo un mismo contenedor, con su manifiesto imprimible.",
    accionesClave: [
      { label: "Revisa la carga", desc: "POL, POD, naviera y la lista de HBL con peso y volumen." },
    ],
  },
  "/ferroviario": {
    title: "Ferroviario",
    queHace: "Las expediciones por ferrocarril, con filtros por corredor (China-Europa, intra-UE) y estado.",
    accionesClave: [
      { label: "Filtra por corredor", desc: "Para ver el tráfico de cada ruta ferroviaria." },
    ],
  },
  "/documentos": {
    title: "Documentos",
    queHace: "Todos los documentos de tus expedientes en un solo sitio.",
    accionesClave: [
      { label: "Búscalos", desc: "Por expediente, tipo o referencia." },
    ],
  },
  "/calendar": {
    title: "Calendario",
    queHace: "Tus expedientes con ETA en una vista mensual; detecta picos de operativa de un vistazo.",
    accionesClave: [
      { label: "Mira la semana", desc: "Qué llega y cuándo, sin abrir cada expediente." },
    ],
  },
  "/procesos/eventos": {
    title: "Cola de eventos",
    queHace: "Los webhooks disparados: payload, destino, respuesta y estado, con reintento manual.",
    accionesClave: [
      { label: "Reintenta los fallidos", desc: "Desde el propio evento." },
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
