/* FARO — productivity suite data (window.FARO_PROD) */
(function () {
  // ---- Acciones IA (Autopilot queue) ----
  const actions = [
    { id: "a1", icon: "money", tone: "red", title: "Facturar THC destino · S-2026-04417",
      desc: "El THC destino (210 €) no está en la factura de venta. Faro lo añade y reemite.",
      impact: "+210 €", impactType: "Margen recuperado", conf: 98, exp: "S-2026-04417",
      done: "THC destino facturado · GP restablecido a 324 €" },
    { id: "a2", icon: "clock", tone: "red", title: "Programar recogida · evitar demurrage",
      desc: "Contenedor MRKU 229301 lleva 3 días en terminal. Faro agenda la recogida con Drayage BCN hoy.",
      impact: "+150 €/día", impactType: "Coste evitado", conf: 92, exp: "S-2026-04388",
      done: "Recogida programada para hoy 16:00 con Drayage BCN" },
    { id: "a3", icon: "refresh", tone: "amber", title: "Reversar desvío de accrual · CMA CGM",
      desc: "Factura 4.080 € vs accrual 4.001 €. Faro prepara el asiento de reverso por 79 €.",
      impact: "79 €", impactType: "Desvío conciliado", conf: 95, exp: "S-2026-04417",
      done: "Asiento de reverso generado, pendiente de validación contable" },
    { id: "a4", icon: "invoice", tone: "amber", title: "Enviar recordatorio de pago · Delta Foods",
      desc: "FV-2026-1175 (6.498 €) venció el 08 jun. Faro envía recordatorio cordial con el enlace de pago.",
      impact: "6.498 €", impactType: "Cobro acelerado", conf: 90, exp: null,
      done: "Recordatorio de pago enviado a Delta Foods" },
    { id: "a5", icon: "customs", tone: "amber", title: "Corregir descripción de la ENS · S-2026-04420",
      desc: "La ENS contiene stop-words que ICS2 podría rechazar. Faro reescribe la descripción de mercancía.",
      impact: "Evita rechazo", impactType: "Cumplimiento aduanero", conf: 88, exp: "S-2026-04420",
      done: "Descripción de mercancía corregida y validada contra TARIC" },
    { id: "a6", icon: "doc", tone: "blue", title: "Emitir HBL borrador · S-2026-04417",
      desc: "El máster está confirmado. Faro genera el HBL a partir de los datos del expediente.",
      impact: "8 min", impactType: "Tiempo ahorrado", conf: 96, exp: "S-2026-04417",
      done: "HBL borrador generado y adjuntado al expediente" },
    { id: "a7", icon: "sparkle", tone: "blue", title: "Confirmar 5 campos IA · S-2026-04417",
      desc: "Cinco campos en ámbar con confianza >90 %. Faro los marca como verificados para el DUA.",
      impact: "5 campos", impactType: "Expediente en verde", conf: 94, exp: "S-2026-04417",
      done: "5 campos confirmados · expediente listo para aduanas" },
  ];

  // ---- Notifications ----
  const notifs = [
    { id: "n1", icon: "alert", tone: "red", t: "Demurrage acumulándose", d: "S-2026-04388 · 3 días sin recoger (~450 €)", time: "hace 8 min", unread: true, exp: "S-2026-04388" },
    { id: "n2", icon: "sparkle", tone: "amber", t: "Ingesta IA completada", d: "CI-2241 procesada · 10 campos extraídos, pendientes de confirmar", time: "hace 22 min", unread: true, go: ["ingest"] },
    { id: "n3", icon: "ship", tone: "blue", t: "Evento DCSA · DEPA", d: "CMA CGM TROCADERO salió de Shanghái", time: "hace 1 h", unread: true, exp: "S-2026-04417" },
    { id: "n4", icon: "invoice", tone: "green", t: "Cobro recibido", d: "Lumo Retail · FV-2026-1180 · 6.987 €", time: "hace 3 h", unread: false, go: ["fac-venta"] },
    { id: "n5", icon: "customs", tone: "amber", t: "Levante concedido", d: "S-2026-04369 · exportación AES autorizada", time: "hace 5 h", unread: false, exp: "S-2026-04369" },
    { id: "n6", icon: "users", tone: "neutral", t: "Cotización aceptada", d: "Nordix aceptó COT-2026-0912", time: "ayer", unread: false, go: ["com-pipeline"] },
  ];

  // ---- Quick add ----
  const quickAdd = [
    { id: "ingest", label: "Expediente (Ingesta IA)", icon: "sparkle", kbd: "E", go: ["ingest"] },
    { id: "quote", label: "Cotización", icon: "quote", kbd: "C", go: ["quote"] },
    { id: "fac", label: "Factura de venta", icon: "invoice", kbd: "F", go: ["fac-venta"] },
    { id: "booking", label: "Booking marítimo", icon: "ship", kbd: "B", go: ["mar-bookings"] },
    { id: "tercero", label: "Tercero (cliente/proveedor)", icon: "users", kbd: "T", go: ["m-terceros"] },
    { id: "inc", label: "Incidencia de calidad", icon: "shield", kbd: "I", go: ["cal-incidencias"] },
  ];

  // ---- Keyboard shortcuts ----
  const shortcuts = [
    { lbl: "Buscar / ir a (Comando)", keys: ["⌘", "K"] },
    { lbl: "Abrir Copiloto IA", keys: ["⌘", "J"] },
    { lbl: "Crear rápido", keys: ["⌘", "N"] },
    { lbl: "Bandeja de excepciones", keys: ["G", "B"] },
    { lbl: "Expedientes", keys: ["G", "E"] },
    { lbl: "Acciones IA (Autopilot)", keys: ["G", "A"] },
    { lbl: "Briefing matutino", keys: ["G", "I"] },
    { lbl: "Power BI", keys: ["G", "P"] },
    { lbl: "Notificaciones", keys: ["⌘", "B"] },
    { lbl: "Modo claro / oscuro", keys: ["⌘", "/"] },
    { lbl: "Mapa de teclado (esta ventana)", keys: ["?"] },
    { lbl: "Cerrar cualquier panel", keys: ["Esc"] },
  ];

  // ---- Time saved ----
  const timeSaved = {
    hours: 14.2, pct: 71,
    breakdown: [
      { l: "Ingesta IA (sin re-tecleo)", h: 6.4 },
      { l: "Acciones IA aprobadas", h: 3.8 },
      { l: "Conciliación automática", h: 2.6 },
      { l: "Documentos autogenerados", h: 1.4 },
    ],
  };

  // ---- Saved views ----
  const savedViews = {
    inbox: [
      { id: "all", label: "Todo", count: null },
      { id: "mine", label: "Asignadas a mí", count: 4 },
      { id: "money", label: "Margen en riesgo", count: 3 },
      { id: "today", label: "Vencen hoy", count: 2 },
    ],
  };

  window.FARO_PROD = { actions, notifs, quickAdd, shortcuts, timeSaved, savedViews };
})();
