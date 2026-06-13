/* ============================================================
   FARO — full module map + ERP grid datasets (window.FARO_MOD)
   Spanish freight-forwarding ERP. Realistic but illustrative.
   ============================================================ */
(function () {
  // ---------- MODULE TREE (mega-menu + routing) ----------
  // leaf: { id, label }  -> id routes to a screen or grid config
  const TREE = [
    { id: "inicio", label: "Inicio", icon: "inbox", children: [
      { id: "inbox", label: "Bandeja de excepciones" },
      { id: "dashboard", label: "Panel financiero" },
    ]},
    { id: "sistema", label: "Sistema", icon: "settings", children: [
      { id: "sys-usuarios", label: "Usuarios" },
      { id: "sys-roles", label: "Roles y permisos" },
      { id: "sys-empresas", label: "Empresas y sucursales" },
      { id: "sys-auditoria", label: "Auditoría" },
      { id: "sys-params", label: "Parámetros" },
    ]},
    { id: "tablas", label: "Tablas maestras", icon: "bank", children: [
      { id: "m-terceros", label: "Terceros" },
      { id: "m-puertos", label: "Puertos · UN/LOCODE" },
      { id: "m-navieras", label: "Navieras / Carriers" },
      { id: "m-aeropuertos", label: "Aeropuertos" },
      { id: "m-contenedores", label: "Tipos de contenedor" },
      { id: "m-conceptos", label: "Conceptos de cargo" },
      { id: "m-incoterms", label: "Incoterms 2020" },
      { id: "m-paises", label: "Países" },
      { id: "m-monedas", label: "Monedas" },
      { id: "m-hs", label: "Códigos arancelarios (HS)" },
    ]},
    { id: "general", label: "General", icon: "files", children: [
      { id: "shipments", label: "Expedientes" },
      { id: "ingest", label: "Nuevo · Ingesta IA" },
      { id: "quote", label: "Cotizaciones" },
    ]},
    { id: "maritimo", label: "Marítimo", icon: "ship", children: [
      { id: "mar-fcl", label: "Embarques FCL" },
      { id: "mar-lcl", label: "Embarques LCL / Grupaje" },
      { id: "mar-bookings", label: "Bookings" },
      { id: "mar-bls", label: "Conocimientos (B/L)" },
      { id: "mar-consol", label: "Consolidaciones" },
      { id: "mar-vgm", label: "VGM" },
    ]},
    { id: "aereo", label: "Aéreo", icon: "plane", children: [
      { id: "air-awb", label: "AWB · MAWB / HAWB" },
      { id: "air-vuelos", label: "Vuelos" },
      { id: "air-manif", label: "Manifiestos" },
    ]},
    { id: "courier", label: "Courier", icon: "box", children: [
      { id: "cou-envios", label: "Envíos courier" },
      { id: "cou-etiquetas", label: "Etiquetas" },
    ]},
    { id: "terrestre", label: "Terrestre", icon: "truck", children: [
      { id: "ter-ordenes", label: "Órdenes de transporte" },
      { id: "ter-rutas", label: "Rutas" },
      { id: "ter-cmr", label: "CMR" },
    ]},
    { id: "ferrocarril", label: "Ferrocarril", icon: "container", children: [
      { id: "fer-exped", label: "Expediciones ferroviarias" },
    ]},
    { id: "aduanas", label: "Aduanas", icon: "customs", children: [
      { id: "adu-dua", label: "DUA" },
      { id: "adu-ics2", label: "ICS2 · ENS" },
      { id: "adu-ncts", label: "NCTS · Tránsito" },
      { id: "adu-aes", label: "AES · Exportación" },
      { id: "adu-regimenes", label: "Regímenes aduaneros" },
    ]},
    { id: "facturacion", label: "Facturación", icon: "invoice", children: [
      { id: "fac-venta", label: "Facturas de venta" },
      { id: "fac-compra", label: "Facturas de compra" },
      { id: "fac-series", label: "Series y numeración" },
      { id: "fac-everifactu", label: "Verifactu / e-factura" },
    ]},
    { id: "comercial", label: "Comercial", icon: "users", children: [
      { id: "com-pipeline", label: "Pipeline (CRM)" },
      { id: "com-oport", label: "Oportunidades" },
      { id: "quote", label: "Cotizaciones" },
      { id: "com-tarifas", label: "Tarifas · Rate search" },
      { id: "com-clientes", label: "Clientes" },
      { id: "portal", label: "Portal del cliente" },
    ]},
    { id: "contabilidad", label: "Contabilidad", icon: "bank", children: [
      { id: "con-asientos", label: "Asientos" },
      { id: "con-plan", label: "Plan contable" },
      { id: "con-cierre", label: "Cierre mensual" },
      { id: "con-tesoreria", label: "Tesorería" },
      { id: "con-impuestos", label: "Impuestos" },
    ]},
    { id: "calidad", label: "Calidad", icon: "shield", children: [
      { id: "cal-incidencias", label: "Incidencias" },
      { id: "cal-nc", label: "No conformidades" },
      { id: "cal-sla", label: "SLA y objetivos" },
    ]},
    { id: "consultas", label: "Consultas", icon: "search", children: [
      { id: "consultas", label: "Buscador de expedientes" },
    ]},
    { id: "listados", label: "Listados", icon: "files", children: [
      { id: "lis-exped", label: "Listado de expedientes" },
      { id: "lis-margenes", label: "Listado de márgenes" },
      { id: "lis-vencimientos", label: "Vencimientos" },
    ]},
    { id: "procesos", label: "Procesos", icon: "settings", children: [
      { id: "proc-batch", label: "Procesos programados" },
      { id: "proc-import", label: "Importaciones" },
      { id: "proc-cola", label: "Cola de eventos" },
    ]},
    { id: "tracking", label: "ShipsGo · Tracking", icon: "pin", children: [
      { id: "tracking", label: "Seguimiento en tiempo real" },
    ]},
    { id: "bi", label: "Power BI", icon: "grid", children: [
      { id: "bi", label: "Cuadros de mando" },
    ]},
    { id: "sostenibilidad", label: "Sostenibilidad", icon: "shield", children: [
      { id: "sostenibilidad", label: "Huella de CO₂ · ESG" },
    ]},
    { id: "red", label: "Red & Partners", icon: "handshake", children: [
      { id: "red", label: "Por qué te contratan" },
      { id: "red-agentes", label: "Red de agentes" },
      { id: "tender-red", label: "Tender a la red" },
      { id: "proveedores-scorecard", label: "Scorecard de proveedores" },
      { id: "docs-digitales", label: "Documentos digitales (e-BL)" },
      { id: "compliance-screening", label: "Compliance & sanciones" },
    ]},
    { id: "integraciones", label: "Integraciones", icon: "link", children: [
      { id: "sys-api", label: "Conectores y API" },
    ]},
  ];

  // bespoke screens handled outside the generic grid
  const BESPOKE = new Set(["inbox","dashboard","shipments","ingest","quote","expediente",
    "com-pipeline","con-asientos","con-cierre","adu-dua","cal-incidencias","sys-usuarios","bi","tracking","consultas"]);

  // ---------- helpers ----------
  const P = (cls, txt) => ({ _pill: cls, t: txt });

  // ---------- GRID CONFIGS ----------
  const G = {};

  // Tipos de contenedor (matches the reference screenshot)
  G["m-contenedores"] = {
    title: "Tipos de contenedor", eyebrow: "Tablas maestras", icon: "container", newLabel: "Nuevo tipo",
    filters: [{ label: "Clase", options: ["Todas", "Dry", "Reefer", "Especial"] }, { label: "Tamaño", options: ["Todos", "20'", "40'", "45'"] }],
    columns: [
      { key: "iso", label: "ISO 6346", type: "mono", w: 90 },
      { key: "nombre", label: "Descripción" },
      { key: "clase", label: "Clase", type: "pill" },
      { key: "largo", label: "Largo", align: "r", type: "mono" },
      { key: "tara", label: "Tara (kg)", align: "r", type: "num" },
      { key: "payload", label: "Carga máx. (kg)", align: "r", type: "num" },
      { key: "vol", label: "Vol. (m³)", align: "r", type: "mono" },
    ],
    rows: [
      { iso: "22G1", nombre: "20' Dry General", clase: P("neutral","Dry"), largo: "20'", tara: 2230, payload: 28250, vol: "33,2" },
      { iso: "42G1", nombre: "40' Dry General", clase: P("neutral","Dry"), largo: "40'", tara: 3750, payload: 28750, vol: "67,7" },
      { iso: "45G1", nombre: "40' High Cube", clase: P("neutral","Dry"), largo: "40'", tara: 3900, payload: 28600, vol: "76,4" },
      { iso: "L5G1", nombre: "45' High Cube", clase: P("neutral","Dry"), largo: "45'", tara: 4800, payload: 27700, vol: "86,1" },
      { iso: "22R1", nombre: "20' Reefer", clase: P("blue","Reefer"), largo: "20'", tara: 3000, payload: 27480, vol: "28,3" },
      { iso: "45R1", nombre: "40' High Cube Reefer", clase: P("blue","Reefer"), largo: "40'", tara: 4640, payload: 29360, vol: "67,3" },
      { iso: "22U1", nombre: "20' Open Top", clase: P("amber","Especial"), largo: "20'", tara: 2350, payload: 28130, vol: "32,0" },
      { iso: "22P1", nombre: "20' Flat Rack", clase: P("amber","Especial"), largo: "20'", tara: 2740, payload: 27740, vol: "—" },
      { iso: "22T1", nombre: "20' Tank", clase: P("amber","Especial"), largo: "20'", tara: 3900, payload: 26580, vol: "21,0" },
      { iso: "42U1", nombre: "40' Open Top", clase: P("amber","Especial"), largo: "40'", tara: 4290, payload: 28210, vol: "65,0" },
    ],
  };

  G["m-terceros"] = {
    title: "Terceros", eyebrow: "Tablas maestras", icon: "users", newLabel: "Nuevo tercero",
    filters: [{ label: "Tipo", options: ["Todos", "Cliente", "Proveedor", "Agente"] }, { label: "Estado", options: ["Todos", "Activo", "Bloqueado"] }],
    columns: [
      { key: "cod", label: "Código", type: "mono", w: 90 },
      { key: "nombre", label: "Nombre" },
      { key: "tipo", label: "Tipo", type: "pill" },
      { key: "pais", label: "País" },
      { key: "nif", label: "NIF / EORI", type: "mono" },
      { key: "credito", label: "Crédito", align: "r", type: "money" },
      { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { cod: "ACMEIB", nombre: "Acme Ibérica S.L.", tipo: P("ink","Cliente"), pais: "España", nif: "ESB66012345", credito: 50000, estado: P("green","Activo") },
      { cod: "LUMO", nombre: "Lumo Retail", tipo: P("ink","Cliente"), pais: "España", nif: "ESB12877901", credito: 75000, estado: P("green","Activo") },
      { cod: "NORDIX", nombre: "Nordix Components", tipo: P("ink","Cliente"), pais: "Alemania", nif: "DE811209853", credito: 60000, estado: P("green","Activo") },
      { cod: "DELTAF", nombre: "Delta Foods S.A.", tipo: P("ink","Cliente"), pais: "España", nif: "ESA09112233", credito: 30000, estado: P("amber","Revisión") },
      { cod: "CMACGM", nombre: "CMA CGM", tipo: P("blue","Proveedor"), pais: "Francia", nif: "FR47562024422", credito: 0, estado: P("green","Activo") },
      { cod: "HLAG", nombre: "Hapag-Lloyd AG", tipo: P("blue","Proveedor"), pais: "Alemania", nif: "DE118634976", credito: 0, estado: P("green","Activo") },
      { cod: "SINOBR", nombre: "Sino-Bridge Logistics", tipo: P("terra","Agente"), pais: "China", nif: "—", credito: 0, estado: P("green","Activo") },
      { cod: "TVEGA", nombre: "Talleres Vega", tipo: P("ink","Cliente"), pais: "España", nif: "ESB45091002", credito: 12000, estado: P("red","Bloqueado") },
      { cod: "VERDE", nombre: "Verde Agro Export", tipo: P("ink","Cliente"), pais: "España", nif: "ESB78440091", credito: 40000, estado: P("green","Activo") },
    ],
  };

  G["m-puertos"] = {
    title: "Puertos", eyebrow: "Tablas maestras · UN/LOCODE", icon: "pin", newLabel: "Nuevo puerto",
    filters: [{ label: "País", options: ["Todos", "España", "China", "Alemania"] }, { label: "Modo", options: ["Todos", "Marítimo", "Aéreo"] }],
    columns: [
      { key: "code", label: "UN/LOCODE", type: "mono", w: 110 },
      { key: "nombre", label: "Puerto" }, { key: "pais", label: "País" },
      { key: "tipo", label: "Tipo", type: "pill" }, { key: "zona", label: "Zona horaria", type: "mono" },
    ],
    rows: [
      { code: "ESBCN", nombre: "Barcelona", pais: "España", tipo: P("blue","Marítimo"), zona: "UTC+1" },
      { code: "ESVLC", nombre: "Valencia", pais: "España", tipo: P("blue","Marítimo"), zona: "UTC+1" },
      { code: "ESALG", nombre: "Algeciras", pais: "España", tipo: P("blue","Marítimo"), zona: "UTC+1" },
      { code: "CNSHA", nombre: "Shanghái", pais: "China", tipo: P("blue","Marítimo"), zona: "UTC+8" },
      { code: "CNNGB", nombre: "Ningbo", pais: "China", tipo: P("blue","Marítimo"), zona: "UTC+8" },
      { code: "DEHAM", nombre: "Hamburgo", pais: "Alemania", tipo: P("blue","Marítimo"), zona: "UTC+1" },
      { code: "NLRTM", nombre: "Rotterdam", pais: "Países Bajos", tipo: P("blue","Marítimo"), zona: "UTC+1" },
      { code: "DEFRA", nombre: "Frankfurt", pais: "Alemania", tipo: P("amber","Aéreo"), zona: "UTC+1" },
      { code: "VNSGN", nombre: "Ho Chi Minh", pais: "Vietnam", tipo: P("blue","Marítimo"), zona: "UTC+7" },
      { code: "BRSSZ", nombre: "Santos", pais: "Brasil", tipo: P("blue","Marítimo"), zona: "UTC-3" },
    ],
  };

  G["m-navieras"] = {
    title: "Navieras / Carriers", eyebrow: "Tablas maestras", icon: "ship", newLabel: "Nueva naviera",
    filters: [{ label: "Alianza", options: ["Todas", "Gemini", "Ocean Alliance", "Premier", "Independiente"] }],
    columns: [
      { key: "scac", label: "SCAC", type: "mono", w: 80 }, { key: "nombre", label: "Naviera" },
      { key: "alianza", label: "Alianza", type: "pill" }, { key: "flota", label: "Flota (buques)", align: "r", type: "num" },
      { key: "teu", label: "Capacidad (TEU)", align: "r", type: "num" }, { key: "api", label: "API", type: "pill" },
    ],
    rows: [
      { scac: "MAEU", nombre: "Maersk", alianza: P("terra","Gemini"), flota: 690, teu: 4300000, api: P("green","DCSA") },
      { scac: "HLCU", nombre: "Hapag-Lloyd", alianza: P("terra","Gemini"), flota: 287, teu: 2300000, api: P("green","DCSA") },
      { scac: "MSCU", nombre: "MSC", alianza: P("neutral","Independiente"), flota: 980, teu: 7200000, api: P("green","DCSA") },
      { scac: "CMDU", nombre: "CMA CGM", alianza: P("blue","Ocean Alliance"), flota: 650, teu: 3900000, api: P("green","DCSA") },
      { scac: "COSU", nombre: "COSCO", alianza: P("blue","Ocean Alliance"), flota: 490, teu: 3100000, api: P("amber","EDI") },
      { scac: "ONEY", nombre: "ONE", alianza: P("amber","Premier"), flota: 240, teu: 1900000, api: P("green","DCSA") },
      { scac: "EGLV", nombre: "Evergreen", alianza: P("blue","Ocean Alliance"), flota: 220, teu: 1700000, api: P("amber","EDI") },
    ],
  };

  G["m-conceptos"] = {
    title: "Conceptos de cargo", eyebrow: "Tablas maestras", icon: "money", newLabel: "Nuevo concepto",
    filters: [{ label: "Tipo", options: ["Todos", "Flete", "Accesorio", "Tasa", "Servicio"] }],
    columns: [
      { key: "code", label: "Código", type: "mono", w: 90 }, { key: "desc", label: "Concepto" },
      { key: "tipo", label: "Tipo", type: "pill" }, { key: "iva", label: "IVA", align: "r", type: "mono" },
      { key: "cuenta", label: "Cuenta contable", type: "mono" },
    ],
    rows: [
      { code: "OFR", desc: "Flete base marítimo", tipo: P("ink","Flete"), iva: "0%", cuenta: "705000" },
      { code: "AFR", desc: "Flete aéreo", tipo: P("ink","Flete"), iva: "0%", cuenta: "705001" },
      { code: "THCO", desc: "THC origen", tipo: P("blue","Accesorio"), iva: "21%", cuenta: "705100" },
      { code: "THCD", desc: "THC destino", tipo: P("blue","Accesorio"), iva: "21%", cuenta: "705100" },
      { code: "BAF", desc: "Recargo combustible (BAF)", tipo: P("blue","Accesorio"), iva: "0%", cuenta: "705200" },
      { code: "DOC", desc: "Documentación / B/L", tipo: P("terra","Servicio"), iva: "21%", cuenta: "705300" },
      { code: "CCL", desc: "Despacho aduanero", tipo: P("terra","Servicio"), iva: "21%", cuenta: "705400" },
      { code: "PORT", desc: "T3 · tasa portuaria", tipo: P("amber","Tasa"), iva: "21%", cuenta: "705500" },
      { code: "DEM", desc: "Demurrage / detention", tipo: P("blue","Accesorio"), iva: "21%", cuenta: "705600" },
    ],
  };

  G["m-incoterms"] = {
    title: "Incoterms 2020", eyebrow: "Tablas maestras", icon: "doc", newLabel: null,
    filters: [{ label: "Grupo", options: ["Todos", "E", "F", "C", "D"] }, { label: "Modo", options: ["Todos", "Multimodal", "Marítimo"] }],
    columns: [
      { key: "code", label: "Código", type: "mono", w: 80 }, { key: "nombre", label: "Término" },
      { key: "grupo", label: "Grupo", type: "pill" }, { key: "modo", label: "Modo" }, { key: "riesgo", label: "El riesgo pasa…" },
    ],
    rows: [
      { code: "EXW", nombre: "Ex Works", grupo: P("neutral","E"), modo: "Multimodal", riesgo: "En instalaciones del vendedor" },
      { code: "FCA", nombre: "Free Carrier", grupo: P("blue","F"), modo: "Multimodal", riesgo: "Al entregar al transportista" },
      { code: "FOB", nombre: "Free On Board", grupo: P("blue","F"), modo: "Marítimo", riesgo: "Al cargar a bordo" },
      { code: "CFR", nombre: "Cost and Freight", grupo: P("amber","C"), modo: "Marítimo", riesgo: "Al cargar a bordo" },
      { code: "CIF", nombre: "Cost, Insurance & Freight", grupo: P("amber","C"), modo: "Marítimo", riesgo: "Al cargar a bordo" },
      { code: "CPT", nombre: "Carriage Paid To", grupo: P("amber","C"), modo: "Multimodal", riesgo: "Al entregar al 1er carrier" },
      { code: "CIP", nombre: "Carriage & Insurance Paid", grupo: P("amber","C"), modo: "Multimodal", riesgo: "Al entregar al 1er carrier" },
      { code: "DAP", nombre: "Delivered at Place", grupo: P("terra","D"), modo: "Multimodal", riesgo: "En destino, listo descarga" },
      { code: "DPU", nombre: "Delivered at Place Unloaded", grupo: P("terra","D"), modo: "Multimodal", riesgo: "En destino, descargado" },
      { code: "DDP", nombre: "Delivered Duty Paid", grupo: P("terra","D"), modo: "Multimodal", riesgo: "En destino, despachado" },
    ],
  };

  // Marítimo embarques (FCL/LCL), bookings, BLs, AWB, courier, terrestre, ferrocarril, facturas
  const lane = (a,b)=>a+" → "+b;
  G["mar-fcl"] = {
    title: "Embarques FCL", eyebrow: "Marítimo", icon: "ship", newLabel: "Nuevo embarque",
    filters: [{ label: "Estado", options: ["Todos","En tránsito","En aduana","Entregado"] }, { label: "Naviera", options: ["Todas","Maersk","CMA CGM","MSC"] }],
    columns: [
      { key: "id", label: "Expediente", type: "mono", w: 130, link: true }, { key: "ruta", label: "Ruta" },
      { key: "cliente", label: "Cliente" }, { key: "carrier", label: "Naviera" },
      { key: "cnt", label: "Contenedor", type: "mono" }, { key: "etd", label: "ETD", type: "mono" },
      { key: "estado", label: "Estado", type: "pill" }, { key: "gp", label: "GP", align: "r", type: "money" },
    ],
    rows: [
      { id: "S-2026-04417", ruta: lane("CNSHA","ESBCN"), cliente: "Acme Ibérica", carrier: "CMA CGM", cnt: "TCLU 784512-3", etd: "28 may", estado: P("blue","En tránsito"), gp: 324 },
      { id: "S-2026-04388", ruta: lane("VNSGN","ESBCN"), cliente: "Lumo Retail", carrier: "Maersk", cnt: "MRKU 229301-7", etd: "08 may", estado: P("amber","Arribado"), gp: 358 },
      { id: "S-2026-04361", ruta: lane("CNNGB","ESVLC"), cliente: "Delta Foods", carrier: "MSC", cnt: "MSCU 551204-1", etd: "02 may", estado: P("green","Entregado"), gp: 540 },
      { id: "S-2026-04355", ruta: lane("CNSHA","ESALG"), cliente: "Lumo Retail", carrier: "COSCO", cnt: "CSNU 882140-9", etd: "29 abr", estado: P("green","Entregado"), gp: 612 },
      { id: "S-2026-04330", ruta: lane("DEHAM","ESBCN"), cliente: "Nordix", carrier: "Hapag-Lloyd", cnt: "HLXU 112094-3", etd: "21 abr", estado: P("green","Entregado"), gp: 289 },
    ],
  };
  G["mar-lcl"] = {
    title: "Embarques LCL / Grupaje", eyebrow: "Marítimo", icon: "ship", newLabel: "Nuevo grupaje",
    filters: [{ label: "Estado", options: ["Todos","En tránsito","En aduana"] }],
    columns: [
      { key: "id", label: "Expediente", type: "mono", w: 130, link: true }, { key: "ruta", label: "Ruta" },
      { key: "cliente", label: "Cliente" }, { key: "wm", label: "W/M", align: "r", type: "mono" },
      { key: "consol", label: "Consol.", type: "mono" }, { key: "estado", label: "Estado", type: "pill" }, { key: "gp", label: "GP", align: "r", type: "money" },
    ],
    rows: [
      { id: "S-2026-04420", ruta: lane("CNNGB","ESVLC"), cliente: "Delta Foods", wm: "8,4", consol: "CONS-2210", estado: P("amber","En aduana"), gp: 612 },
      { id: "S-2026-04369", ruta: lane("ESVLC","BRSSZ"), cliente: "Verde Agro", wm: "12,1", consol: "CONS-2188", estado: P("green","Entregado"), gp: 731 },
      { id: "S-2026-04344", ruta: lane("ESBCN","MXVER"), cliente: "Acme Ibérica", wm: "5,7", consol: "CONS-2201", estado: P("blue","En tránsito"), gp: 402 },
    ],
  };
  G["mar-bookings"] = {
    title: "Bookings", eyebrow: "Marítimo · DCSA Booking 2.0", icon: "doc", newLabel: "Nuevo booking",
    filters: [{ label: "Estado", options: ["Todos","RECEIVED","CONFIRMED","PENDING"] }],
    columns: [
      { key: "bk", label: "Booking", type: "mono", w: 130 }, { key: "carrier", label: "Naviera" },
      { key: "ruta", label: "Ruta" }, { key: "vessel", label: "Buque / Vuelo" }, { key: "estado", label: "Estado DCSA", type: "pill" },
    ],
    rows: [
      { bk: "CMDU-SHA0492", carrier: "CMA CGM", ruta: lane("CNSHA","ESBCN"), vessel: "CMA CGM TROCADERO", estado: P("green","CONFIRMED") },
      { bk: "MAEU-7782213", carrier: "Maersk", ruta: lane("VNSGN","ESBCN"), vessel: "MAERSK SELETAR", estado: P("amber","PENDING UPDATE") },
      { bk: "MSCU-0091245", carrier: "MSC", ruta: lane("CNNGB","ESVLC"), vessel: "MSC ISABELLA", estado: P("blue","RECEIVED") },
      { bk: "HLCU-2240118", carrier: "Hapag-Lloyd", ruta: lane("DEHAM","ESBCN"), vessel: "BERLIN EXPRESS", estado: P("green","CONFIRMED") },
    ],
  };
  G["mar-bls"] = {
    title: "Conocimientos de embarque (B/L)", eyebrow: "Marítimo", icon: "doc", newLabel: "Nuevo B/L",
    filters: [{ label: "Tipo", options: ["Todos","MBL","HBL"] }, { label: "Estado", options: ["Todos","Borrador","Emitido"] }],
    columns: [
      { key: "bl", label: "Nº B/L", type: "mono", w: 150 }, { key: "tipo", label: "Tipo", type: "pill" },
      { key: "exp", label: "Expediente", type: "mono", link: true }, { key: "shipper", label: "Shipper" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { bl: "CMDU SHA0492215", tipo: P("ink","MBL"), exp: "S-2026-04417", shipper: "Ningbo Hometex", estado: P("green","Emitido") },
      { bl: "FARO-BCN-260417", tipo: P("blue","HBL"), exp: "S-2026-04417", shipper: "Ningbo Hometex", estado: P("amber","Borrador") },
      { bl: "MAEU SGN772210", tipo: P("ink","MBL"), exp: "S-2026-04388", shipper: "Saigon Furniture", estado: P("green","Emitido") },
      { bl: "FARO-BCN-260388", tipo: P("blue","HBL"), exp: "S-2026-04388", shipper: "Saigon Furniture", estado: P("green","Emitido") },
    ],
  };
  G["air-awb"] = {
    title: "Air Waybills", eyebrow: "Aéreo · ONE Record", icon: "plane", newLabel: "Nuevo AWB",
    filters: [{ label: "Tipo", options: ["Todos","MAWB","HAWB"] }],
    columns: [
      { key: "awb", label: "Nº AWB", type: "mono", w: 130 }, { key: "tipo", label: "Tipo", type: "pill" },
      { key: "ruta", label: "Ruta" }, { key: "carrier", label: "Aerolínea" }, { key: "peso", label: "Peso fact.", align: "r", type: "mono" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { awb: "020-77120945", tipo: P("ink","MAWB"), ruta: lane("DEFRA","MXMEX"), carrier: "Lufthansa Cargo", peso: "1.437 kg", estado: P("blue","En tránsito") },
      { awb: "FARO-A-26431", tipo: P("blue","HAWB"), ruta: lane("DEFRA","MXMEX"), carrier: "Lufthansa Cargo", peso: "1.437 kg", estado: P("blue","En tránsito") },
      { awb: "075-22014478", tipo: P("ink","MAWB"), ruta: lane("ESMAD","USJFK"), carrier: "Iberia Cargo", peso: "880 kg", estado: P("green","Entregado") },
    ],
  };
  G["cou-envios"] = {
    title: "Envíos courier", eyebrow: "Courier", icon: "box", newLabel: "Nuevo envío",
    filters: [{ label: "Operador", options: ["Todos","UPS","DHL","FedEx"] }],
    columns: [
      { key: "track", label: "Tracking", type: "mono", w: 150 }, { key: "op", label: "Operador" },
      { key: "destino", label: "Destino" }, { key: "peso", label: "Peso", align: "r", type: "mono" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { track: "1Z999AA10123", op: "UPS", destino: "Lisboa, PT", peso: "4,2 kg", estado: P("green","Entregado") },
      { track: "JD0099112847", op: "DHL", destino: "Milán, IT", peso: "12,0 kg", estado: P("blue","En reparto") },
      { track: "7712 8841 9920", op: "FedEx", destino: "Casablanca, MA", peso: "2,1 kg", estado: P("amber","En aduana") },
    ],
  };
  G["ter-ordenes"] = {
    title: "Órdenes de transporte terrestre", eyebrow: "Terrestre", icon: "truck", newLabel: "Nueva orden",
    filters: [{ label: "Tipo", options: ["Todos","FTL","LTL","Drayage"] }],
    columns: [
      { key: "id", label: "Orden", type: "mono", w: 120 }, { key: "tipo", label: "Tipo", type: "pill" },
      { key: "ruta", label: "Ruta" }, { key: "transp", label: "Transportista" }, { key: "fecha", label: "Recogida", type: "mono" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { id: "TR-2026-0912", tipo: P("ink","FTL"), ruta: lane("Milán","Madrid"), transp: "Faro Road Network", fecha: "02 jun", estado: P("green","Entregado") },
      { id: "TR-2026-0921", tipo: P("blue","Drayage"), ruta: lane("Pto. BCN","Almacén"), transp: "Drayage BCN S.L.", fecha: "12 jun", estado: P("blue","En curso") },
      { id: "TR-2026-0918", tipo: P("amber","LTL"), ruta: lane("Valencia","Lyon"), transp: "TransEuropa", fecha: "10 jun", estado: P("blue","En curso") },
    ],
  };
  G["fer-exped"] = {
    title: "Expediciones ferroviarias", eyebrow: "Ferrocarril", icon: "container", newLabel: "Nueva expedición",
    filters: [{ label: "Corredor", options: ["Todos","China-Europa","Intra-UE"] }],
    columns: [
      { key: "id", label: "Expedición", type: "mono", w: 130 }, { key: "ruta", label: "Corredor" },
      { key: "tren", label: "Tren", type: "mono" }, { key: "teus", label: "TEU", align: "r", type: "num" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { id: "RL-2026-0044", ruta: lane("Xi'an","Madrid"), tren: "YX-1147", teus: 90, estado: P("blue","En tránsito") },
      { id: "RL-2026-0041", ruta: lane("Duisburg","Zaragoza"), tren: "EU-2208", teus: 42, estado: P("green","Entregado") },
    ],
  };
  G["fac-venta"] = {
    title: "Facturas de venta", eyebrow: "Facturación", icon: "invoice", newLabel: "Nueva factura",
    filters: [{ label: "Estado", options: ["Todos","Emitida","Cobrada","Vencida"] }, { label: "Serie", options: ["Todas","FV-2026","AB-2026"] }],
    columns: [
      { key: "num", label: "Nº factura", type: "mono", w: 120 }, { key: "cliente", label: "Cliente" },
      { key: "exp", label: "Expediente", type: "mono", link: true }, { key: "fecha", label: "Fecha", type: "mono" },
      { key: "base", label: "Base", align: "r", type: "money" }, { key: "total", label: "Total", align: "r", type: "money" },
      { key: "everi", label: "Verifactu", type: "pill" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { num: "FV-2026-1182", cliente: "Acme Ibérica", exp: "S-2026-04417", fecha: "03 jun", base: 4325, total: 5233, everi: P("green","Enviada"), estado: P("amber","Emitida") },
      { num: "FV-2026-1180", cliente: "Lumo Retail", exp: "S-2026-04388", fecha: "01 jun", base: 5774, total: 6987, everi: P("green","Enviada"), estado: P("green","Cobrada") },
      { num: "FV-2026-1175", cliente: "Delta Foods", exp: "S-2026-04361", fecha: "28 may", base: 5370, total: 6498, everi: P("green","Enviada"), estado: P("red","Vencida") },
      { num: "FV-2026-1170", cliente: "Verde Agro", exp: "S-2026-04369", fecha: "24 may", base: 5580, total: 6752, everi: P("green","Enviada"), estado: P("green","Cobrada") },
    ],
  };
  G["fac-compra"] = {
    title: "Facturas de compra", eyebrow: "Facturación", icon: "invoice", newLabel: "Registrar factura",
    filters: [{ label: "Estado", options: ["Todos","Conciliada","Pendiente","Desvío"] }],
    columns: [
      { key: "num", label: "Nº proveedor", type: "mono", w: 130 }, { key: "prov", label: "Proveedor" },
      { key: "exp", label: "Expediente", type: "mono", link: true }, { key: "accrual", label: "Accrual", align: "r", type: "money" },
      { key: "factura", label: "Factura", align: "r", type: "money" }, { key: "desvio", label: "Desvío", align: "r", type: "money" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { num: "CMACGM-44821", prov: "CMA CGM", exp: "S-2026-04417", accrual: 4001, factura: 4080, desvio: 79, estado: P("amber","Desvío") },
      { num: "MAEU-99210", prov: "Maersk", exp: "S-2026-04388", accrual: 5416, factura: 5416, desvio: 0, estado: P("green","Conciliada") },
      { num: "DRAYBCN-1182", prov: "Drayage BCN", exp: "S-2026-04388", accrual: 340, factura: 365, desvio: 25, estado: P("amber","Desvío") },
    ],
  };
  G["sys-auditoria"] = {
    title: "Auditoría", eyebrow: "Sistema · audit log", icon: "eye", newLabel: null,
    filters: [{ label: "Acción", options: ["Todas","Creación","Edición","Borrado","Login"] }, { label: "Usuario", options: ["Todos","Marta Ruiz","Faro IA"] }],
    columns: [
      { key: "ts", label: "Fecha/hora", type: "mono", w: 140 }, { key: "user", label: "Usuario" },
      { key: "accion", label: "Acción", type: "pill" }, { key: "ent", label: "Entidad", type: "mono" }, { key: "detalle", label: "Detalle" },
    ],
    rows: [
      { ts: "13 jun 09:41", user: "Faro IA", accion: P("blue","Edición"), ent: "S-2026-04417", detalle: "Pobló 10 campos desde CI-2241 (ámbar)" },
      { ts: "13 jun 09:42", user: "Marta Ruiz", accion: P("green","Edición"), ent: "S-2026-04417", detalle: "Confirmó 5 campos IA → verde" },
      { ts: "13 jun 09:10", user: "Marta Ruiz", accion: P("ink","Login"), ent: "auth", detalle: "Inicio de sesión · 2FA ok" },
      { ts: "12 jun 18:22", user: "J. Soler", accion: P("terra","Creación"), ent: "FV-2026-1182", detalle: "Emitió factura de venta" },
      { ts: "12 jun 17:05", user: "Marta Ruiz", accion: P("red","Borrado"), ent: "TR-2026-0900", detalle: "Anuló orden terrestre duplicada" },
    ],
  };
  G["proc-batch"] = {
    title: "Procesos programados", eyebrow: "Procesos", icon: "refresh", newLabel: "Nuevo proceso",
    filters: [{ label: "Estado", options: ["Todos","Activo","Pausado","Error"] }],
    columns: [
      { key: "nombre", label: "Proceso" }, { key: "cron", label: "Frecuencia", type: "mono" },
      { key: "ult", label: "Última ejecución", type: "mono" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { nombre: "Polling tracking DCSA (Vizion)", cron: "cada 15 min", ult: "13 jun 09:30", estado: P("green","Activo") },
      { nombre: "Conciliación accrual ↔ factura", cron: "diario 06:00", ult: "13 jun 06:00", estado: P("green","Activo") },
      { nombre: "Envío Verifactu AEAT", cron: "al emitir", ult: "13 jun 09:42", estado: P("green","Activo") },
      { nombre: "Alertas de demurrage", cron: "cada 1 h", ult: "13 jun 09:00", estado: P("amber","1 alerta") },
      { nombre: "Import tarifas (Freightify)", cron: "semanal lun", ult: "09 jun 03:00", estado: P("red","Error API") },
    ],
  };
  // Listings reuse expedientes-like
  G["lis-margenes"] = {
    title: "Listado de márgenes por expediente", eyebrow: "Listados", icon: "percent", newLabel: null,
    filters: [{ label: "Periodo", options: ["Junio 2026","Mayo 2026","Q2 2026"] }, { label: "Margen", options: ["Todos","< 7 %","≥ 7 %"] }],
    columns: [
      { key: "id", label: "Expediente", type: "mono", link: true }, { key: "cliente", label: "Cliente" },
      { key: "venta", label: "Venta", align: "r", type: "money" }, { key: "compra", label: "Compra", align: "r", type: "money" },
      { key: "gp", label: "GP", align: "r", type: "money" }, { key: "pct", label: "Margen", align: "r", type: "mono" },
    ],
    rows: [
      { id: "S-2026-04417", cliente: "Acme Ibérica", venta: 4325, compra: 4001, gp: 324, pct: "7,5%" },
      { id: "S-2026-04420", cliente: "Delta Foods", venta: 5370, compra: 4758, gp: 612, pct: "11,4%" },
      { id: "S-2026-04388", cliente: "Lumo Retail", venta: 5774, compra: 5416, gp: 358, pct: "6,2%" },
      { id: "S-2026-04369", cliente: "Verde Agro", venta: 5580, compra: 4849, gp: 731, pct: "13,1%" },
      { id: "S-2026-04402", cliente: "Talleres Vega", venta: 2705, compra: 2491, gp: 214, pct: "7,9%" },
    ],
  };
  G["lis-vencimientos"] = {
    title: "Vencimientos", eyebrow: "Listados · tesorería", icon: "clock", newLabel: null,
    filters: [{ label: "Tipo", options: ["Todos","Cobro","Pago"] }, { label: "Estado", options: ["Todos","Vencido","Próximo"] }],
    columns: [
      { key: "doc", label: "Documento", type: "mono", w: 130 }, { key: "tercero", label: "Tercero" },
      { key: "tipo", label: "Tipo", type: "pill" }, { key: "venc", label: "Vencimiento", type: "mono" },
      { key: "importe", label: "Importe", align: "r", type: "money" }, { key: "estado", label: "Estado", type: "pill" },
    ],
    rows: [
      { doc: "FV-2026-1175", tercero: "Delta Foods", tipo: P("green","Cobro"), venc: "08 jun", importe: 6498, estado: P("red","Vencido") },
      { doc: "CMACGM-44821", tercero: "CMA CGM", tipo: P("blue","Pago"), venc: "18 jun", importe: 4080, estado: P("amber","Próximo") },
      { doc: "FV-2026-1182", tercero: "Acme Ibérica", tipo: P("green","Cobro"), venc: "03 jul", importe: 5233, estado: P("neutral","Pendiente") },
    ],
  };

  // alias common leaves to existing configs / screens
  G["lis-exped"] = null; // handled by shipments screen
  G["con-plan"] = {
    title: "Plan contable", eyebrow: "Contabilidad · PGC", icon: "bank", newLabel: "Nueva cuenta",
    filters: [{ label: "Grupo", options: ["Todos","6 Compras","7 Ventas","4 Acreedores/Deudores"] }],
    columns: [
      { key: "cuenta", label: "Cuenta", type: "mono", w: 110 }, { key: "desc", label: "Descripción" },
      { key: "grupo", label: "Grupo", type: "pill" }, { key: "saldo", label: "Saldo", align: "r", type: "money" },
    ],
    rows: [
      { cuenta: "705000", desc: "Prestación de servicios · flete", grupo: P("green","7 Ventas"), saldo: 184200 },
      { cuenta: "600000", desc: "Compras de capacidad (carrier)", grupo: P("blue","6 Compras"), saldo: 151340 },
      { cuenta: "430000", desc: "Clientes", grupo: P("amber","4 Deudores"), saldo: 92410 },
      { cuenta: "400000", desc: "Proveedores", grupo: P("amber","4 Acreedores"), saldo: 64120 },
      { cuenta: "477000", desc: "IVA repercutido", grupo: P("neutral","4 Admin."), saldo: 38680 },
    ],
  };

  window.FARO_MOD = { TREE, BESPOKE, GRID: G };
})();
