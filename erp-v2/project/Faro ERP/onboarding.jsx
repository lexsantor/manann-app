/* FARO — per-section onboarding: visual, role-aware "20-second" guide */
(function () {
  const { Icon } = window;
  const e = React.createElement;

  // each: roles (who it's for) · que (what it is) · caps[{i,t}] (3 things you can do)
  const C = {
    inicio: { roles: ["Operativo", "Dirección"],
      que: "Tu día empieza aquí: solo lo que puede costarte dinero, ordenado por euros en riesgo.",
      caps: [{ i: "shield", t: "Ves el margen en riesgo, no 200 expedientes" }, { i: "flag", t: "Filtras por urgencia: crítico, atención, seguimiento" }, { i: "check", t: "Resuelves cada incidencia con un clic" }] },
    general: { roles: ["Operativo"],
      que: "El expediente es el corazón del negocio: cliente, carga, cargos, hitos y documentos en un solo sitio.",
      caps: [{ i: "refresh", t: "Los datos se heredan sin volver a teclear" }, { i: "sparkle", t: "La IA rellena los campos; tú solo confirmas" }, { i: "money", t: "Cada cargo lleva su compra, venta y margen" }] },
    tablas: { roles: ["Sistema", "Operativo"],
      que: "El catálogo base que alimenta todos los módulos.",
      caps: [{ i: "container", t: "Puertos, navieras y tipos de contenedor" }, { i: "check", t: "Estándares: ISO 6346, UN/LOCODE, HS" }, { i: "grid", t: "Lo editas en una rejilla simple" }] },
    maritimo: { roles: ["Operativo marítimo"],
      que: "Embarques FCL y LCL, reservas y conocimientos de embarque.",
      caps: [{ i: "ship", t: "Reservas con la naviera (estándar DCSA)" }, { i: "container", t: "Consolidas: un máster agrupa varias casas" }, { i: "doc", t: "Generas el B/L sin discrepancias" }] },
    aereo: { roles: ["Operativo aéreo"],
      que: "Air Waybills y vuelos, listos para el estándar ONE Record.",
      caps: [{ i: "percent", t: "El peso facturable se calcula solo" }, { i: "plane", t: "MAWB de aerolínea, HAWB al cliente" }, { i: "link", t: "Conectado al estándar IATA" }] },
    courier: { roles: ["Operativo"],
      que: "Paquetería exprés multi-operador con seguimiento.",
      caps: [{ i: "box", t: "UPS, DHL y FedEx en una sola vista" }, { i: "pin", t: "Tracking unificado por envío" }, { i: "doc", t: "Etiquetas listas al instante" }] },
    terrestre: { roles: ["Operativo terrestre"],
      que: "Camión completo o de grupaje, rutas y documentos CMR.",
      caps: [{ i: "truck", t: "FTL, LTL y drayage de puerto" }, { i: "pin", t: "Última milla ligada al expediente" }, { i: "doc", t: "CMR firmado como prueba de entrega" }] },
    ferrocarril: { roles: ["Operativo"],
      que: "Expediciones por tren, ideales en el corredor China–Europa.",
      caps: [{ i: "container", t: "Bajo coste de CO₂ por contenedor" }, { i: "pin", t: "Seguimiento por corredor" }, { i: "ship", t: "Combinable en multimodal" }] },
    aduanas: { roles: ["Rep. aduanero", "CFO"],
      que: "Declaraciones DUA, ICS2, NCTS y AES, con su estado en vivo.",
      caps: [{ i: "shield", t: "El estado de cada sistema, de un vistazo" }, { i: "alert", t: "Aviso si una declaración puede rechazarse" }, { i: "customs", t: "Régimen y MRN por expediente" }] },
    facturacion: { roles: ["Facturación", "CFO"],
      que: "Facturas de venta y compra con factura electrónica.",
      caps: [{ i: "money", t: "Ningún cargo se queda sin facturar" }, { i: "refresh", t: "Concilia lo previsto con lo real" }, { i: "checkCircle", t: "Verifactu y e-factura, listos" }] },
    comercial: { roles: ["Comercial", "Dirección"],
      que: "Tu embudo de ventas, pegado al expediente.",
      caps: [{ i: "users", t: "Del primer contacto al cliente ganado" }, { i: "percent", t: "Previsión ponderada por probabilidad" }, { i: "coins", t: "Rentabilidad por cliente" }] },
    contabilidad: { roles: ["Controller", "CFO"],
      que: "Cada cargo termina en un asiento; cierre auditable.",
      caps: [{ i: "bank", t: "Asientos automáticos multi-divisa" }, { i: "checkCircle", t: "Checklist de cierre mensual" }, { i: "refresh", t: "WIP: el desvío que se come el margen" }] },
    calidad: { roles: ["Operaciones", "Dirección"],
      que: "Incidencias y reclamaciones, cada una con su plazo.",
      caps: [{ i: "flag", t: "Prioriza por gravedad y SLA" }, { i: "shield", t: "Mide OTIF y cumplimiento" }, { i: "file", t: "Todo ligado a su expediente" }] },
    consultas: { roles: ["Todos los roles"],
      que: "Busca lo que sea sobre la base única, sin Excel.",
      caps: [{ i: "search", t: "Combinas filtros a tu gusto" }, { i: "check", t: "Guardas consultas frecuentes" }, { i: "file", t: "Abres el expediente desde el resultado" }] },
    listados: { roles: ["Dirección", "CFO"],
      que: "Informes de expedientes, márgenes y vencimientos.",
      caps: [{ i: "percent", t: "Detecta expedientes poco rentables" }, { i: "clock", t: "Vencimientos de cobro y pago" }, { i: "download", t: "Exporta a Excel o PDF" }] },
    procesos: { roles: ["Sistema"],
      que: "Automatizaciones que trabajan en segundo plano.",
      caps: [{ i: "refresh", t: "Tracking y conciliación, solos" }, { i: "bolt", t: "Cola de eventos del negocio" }, { i: "alert", t: "Te avisa si algo falla" }] },
    tracking: { roles: ["Operativo", "Cliente"],
      que: "Dónde está cada envío, en tiempo real, sobre el mapa.",
      caps: [{ i: "pin", t: "Mapa global de todas tus rutas" }, { i: "ship", t: "Hitos del estándar DCSA" }, { i: "link", t: "Datos directos de los carriers" }] },
    bi: { roles: ["Dirección", "CFO"],
      que: "Tus números en vivo, sin exportar a Excel.",
      caps: [{ i: "grid", t: "Margen por ruta y por cliente" }, { i: "shield", t: "Fuga de margen detectada" }, { i: "coins", t: "Cuánto beneficio recuperas" }] },
    sostenibilidad: { roles: ["Dirección", "Cliente"],
      que: "La huella de CO₂ de cada envío, lista para CSRD.",
      caps: [{ i: "shield", t: "Emisiones por expediente y ruta" }, { i: "percent", t: "Intensidad en g/t·km" }, { i: "download", t: "Informe ESG en un clic" }] },
    integraciones: { roles: ["Sistema", "IT"],
      que: "Todo conectado por API: navieras, aduanas, contabilidad.",
      caps: [{ i: "link", t: "Carriers vía DCSA y ONE Record" }, { i: "refresh", t: "Webhooks y reintentos fiables" }, { i: "shield", t: "Sin deuda EDI legacy" }] },
    sistema: { roles: ["Administrador"],
      que: "Usuarios, permisos, empresas y auditoría.",
      caps: [{ i: "shield", t: "Aislamiento de datos por empresa" }, { i: "users", t: "Permisos por rol (RBAC)" }, { i: "eye", t: "Auditoría de todo, también de la IA" }] },
  };

  const ROLE_TONE = { Operativo: "blue", "Operativo marítimo": "blue", "Operativo aéreo": "blue", "Operativo terrestre": "blue",
    CFO: "terra", Dirección: "terra", Controller: "terra", Comercial: "green", "Rep. aduanero": "amber",
    Facturación: "amber", Operaciones: "blue", Sistema: "neutral", IT: "neutral", Administrador: "neutral",
    Cliente: "green", "Todos los roles": "neutral" };

  function Onboarding({ sec, onClose, onDisable, onConvert }) {
    const data = C[sec];
    if (!data) return null;
    const T = window.FARO_MOD.TREE.find((s) => s.id === sec);
    const title = T ? T.label : sec;
    return e("div", { className: "onb2-scrim", onClick: onClose },
      e("div", { className: "onb2", onClick: (ev) => ev.stopPropagation() },
        e("div", { className: "onb2-hero" },
          e("button", { className: "onb2-x", onClick: onClose }, e(Icon, { name: "x", size: 16 })),
          e("div", { className: "onb2-orb" }, e(Icon, { name: T ? T.icon : "files", size: 26 })),
          e("div", { className: "eyebrow", style: { color: "var(--terra-deep)", marginBottom: 8 } }, "Guía rápida · 20 segundos"),
          e("h2", null, title),
          e("p", { className: "onb2-que" }, data.que)),
        e("div", { className: "onb2-body" },
          e("div", { className: "onb2-roles" },
            e("span", { className: "lbl" }, "Para"),
            data.roles.map((r, i) => e("span", { key: i, className: "pill " + (ROLE_TONE[r] || "neutral"), style: { fontSize: 11.5 } }, r))),
          e("div", { className: "onb2-caps" },
            data.caps.map((c, i) =>
              e("div", { key: i, className: "onb2-cap" },
                e("div", { className: "onb2-cap-ic" }, e(Icon, { name: c.i, size: 19 })),
                e("div", { className: "onb2-cap-t" }, c.t))))),
        e("button", { className: "onb2-convert", onClick: () => onConvert(sec) },
          e("span", { className: "onb2-convert-orb" }, e(Icon, { name: "sparkle", size: 16 })),
          e("div", { className: "grow", style: { textAlign: "left" } },
            e("div", { style: { fontWeight: 650, fontSize: 13 } }, "Convertir en mi asistente IA"),
            e("div", { style: { fontSize: 11.5, opacity: .7 } }, "Un agente experto en " + title + ", siempre a mano")),
          e(Icon, { name: "arrowR", size: 16 })),
        e("div", { className: "onb2-foot" },
          e("button", { className: "onb2-skip", onClick: onDisable }, "No mostrar las guías"),
          e("span", { className: "grow" }),
          e("button", { className: "btn", onClick: onClose }, "Entendido")))
    );
  }

  window.Onboarding = Onboarding;
  window.FARO_ONBOARD = C;
})();
