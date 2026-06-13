/* FARO — per-module AI agent (spawned from the onboarding guide) */
(function () {
  const { Icon, UI } = window;
  const { fmtEur } = UI;
  const e = React.createElement;

  const act = (label, icon, opts) => Object.assign({ label, icon }, opts || {});
  const ROUTE = {
    inicio: "inbox", general: "shipments", tablas: "m-contenedores", maritimo: "mar-fcl", aereo: "air-awb",
    courier: "cou-envios", terrestre: "ter-ordenes", ferrocarril: "fer-exped", aduanas: "adu-dua",
    facturacion: "fac-venta", comercial: "com-pipeline", contabilidad: "con-cierre", calidad: "cal-incidencias",
    consultas: "consultas", listados: "lis-margenes", procesos: "proc-batch", tracking: "tracking",
    bi: "bi", sostenibilidad: "sostenibilidad", integraciones: "sys-api", sistema: "sys-usuarios",
  };

  function shipMargins() {
    return window.FARO.shipments.map((s) => {
      const t = s.charges ? s.charges.reduce((a, c) => ({ s: a.s + c.sell, b: a.b + c.buy }), { s: 0, b: 0 }) : { s: s.sell, b: s.buy };
      const gp = t.s - t.b; return { id: s.id, client: s.client.name, gp, pct: (gp / t.s) * 100 };
    });
  }

  // ---- per-module agent definitions ----
  const AG = {
    aduanas: {
      name: "Asistente de Aduanas", expertise: "Experto en DUA · ICS2 · NCTS · AES",
      hello: "Vigilo tus declaraciones aduaneras, te aviso de posibles rechazos y preparo las presentaciones. ¿En qué te ayudo?",
      suggest: [{ q: "¿Qué declaraciones están en riesgo?", icon: "alert" }, { q: "¿Cómo presento un DUA de importación?", icon: "customs" }, { q: "Revisa la ENS de S-2026-04420", icon: "shield" }],
      answer(s) {
        if (s.match(/riesgo|rechaz|problema/)) return [
          { html: "Tienes <b>1 declaración en riesgo</b>. La ENS del expediente <b>S-2026-04420</b> (Delta Foods) contiene una descripción genérica que el análisis de riesgo de ICS2 podría rechazar." },
          { type: "card", rows: [{ k: "MRN", v: "26ES…884188" }, { k: "Sistema", v: "ICS2 · ENS" }, { k: "Motivo", v: "Stop-words en descripción" }] },
          { type: "actions", items: [act("Corregir la ENS", "doc", { toast: "Descripción de mercancía mejorada por IA" }), act("Abrir expediente", "file", { go: ["expediente", { id: "S-2026-04420" }] })] }];
        if (s.match(/present|dua|import|cómo|como/)) return [
          { html: "Para presentar un <b>DUA de importación</b> a la AEAT desde Faro:" },
          { html: "1 · Confirma los campos del expediente (partida HS, valor, Incoterm).<br>2 · Faro precalcula derechos e IVA de importación.<br>3 · Genera y envía el mensaje a la AEAT.<br>4 · Recibes el MRN y, tras el análisis, el levante." },
          { type: "actions", items: [act("Ir a Aduanas", "customs", { go: ["adu-dua"] })] }];
        return null;
      },
    },
    consultas: {
      name: "Asistente de Consultas", expertise: "Busca y cruza datos de toda tu operación",
      hello: "Pregúntame en lenguaje natural y consulto la base de datos por ti, sin filtros ni Excel.",
      suggest: [{ q: "Expedientes con margen por debajo del 7 %", icon: "percent" }, { q: "¿Cuántos expedientes tiene Acme?", icon: "users" }, { q: "Envíos en aduana ahora mismo", icon: "customs" }],
      answer(s) {
        if (s.match(/margen|7|rentab|flojo/)) {
          const low = shipMargins().filter((x) => x.pct < 8).sort((a, b) => a.pct - b.pct);
          return [{ html: `Encontré <b>${low.length} expedientes</b> con margen por debajo del 8 %:` },
            { type: "card", rows: low.map((x) => ({ k: x.id + " · " + x.client, v: x.pct.toFixed(1) + " %" })) },
            { type: "actions", items: [act("Ver listado de márgenes", "percent", { go: ["lis-margenes"] })] }];
        }
        if (s.match(/acme|cuántos|cuantos|cliente/)) return [
          { html: "<b>Acme Ibérica</b> tiene <b>42 expedientes</b> este año, con 18.420 € de GP acumulado (margen medio 8,1 %). Es tu cliente nº 1 por volumen." },
          { type: "actions", items: [act("Ver en Power BI", "grid", { go: ["bi"] })] }];
        if (s.match(/aduana|customs/)) return [
          { html: "Ahora mismo hay <b>2 envíos en aduana</b>: S-2026-04420 (Delta Foods, Valencia) y la ENS pendiente de S-2026-04388." },
          { type: "actions", items: [act("Abrir Aduanas", "customs", { go: ["adu-dua"] })] }];
        return null;
      },
    },
    contabilidad: {
      name: "Asistente de Contabilidad", expertise: "Asientos, cierre mensual y conciliación",
      hello: "Te ayudo con el cierre, los asientos y a vigilar el WIP que erosiona el margen.",
      suggest: [{ q: "¿Qué falta para cerrar junio?", icon: "checkCircle" }, { q: "¿Cuánto WIP tengo abierto?", icon: "refresh" }, { q: "Prepara el asiento de reverso", icon: "bank" }],
      answer(s) {
        if (s.match(/cierr|junio|falta|cerrar/)) return [
          { html: "El cierre de <b>junio</b> está al 90 %. Asientos cuadrados e IVA conciliado. Quedan 3 bloqueos:" },
          { type: "card", rows: [{ k: "Accruals sin reversar", v: "12 · 3.110 €" }, { k: "Compras sin conciliar", v: "3" }, { k: "FX no realizada", v: "−420 €" }] },
          { type: "actions", items: [act("Ir al cierre", "bank", { go: ["con-cierre"] })] }];
        if (s.match(/wip|reverso|desv/)) return [
          { html: "El <b>WIP agregado es +3.530 €</b> (desvío accrual-vs-factura). Puedo dejarte preparado el asiento de reverso para revisarlo." },
          { type: "actions", items: [act("Preparar reverso", "refresh", { toast: "Borrador de asiento de reverso generado" }), act("Ver Contabilidad", "bank", { go: ["con-cierre"] })] }];
        return null;
      },
    },
    comercial: {
      name: "Asistente Comercial", expertise: "Pipeline, previsión y rentabilidad",
      hello: "Te ayudo a mover oportunidades, priorizar las calientes y a cotizar más rápido.",
      suggest: [{ q: "¿Qué oportunidades están calientes?", icon: "bolt" }, { q: "¿Cuánto pipeline tengo?", icon: "coins" }, { q: "¿Qué cliente es más rentable?", icon: "users" }],
      answer(s) {
        if (s.match(/calient|hot|priorit|cerrar/)) return [
          { html: "Dos oportunidades están <b>calientes</b> y conviene empujarlas esta semana:" },
          { type: "card", rows: [{ k: "Acme Ibérica · negociación", v: "86.000 €" }, { k: "Nordix · cotizado", v: "53.600 €" }] },
          { type: "actions", items: [act("Abrir pipeline", "users", { go: ["com-pipeline"] })] }];
        if (s.match(/pipeline|forecast|previsi/)) return [
          { html: "Tu pipeline total es de <b>440.200 €</b>; ponderado por probabilidad, <b>~228.000 €</b>. Win rate a 90 días: 34 %." },
          { type: "actions", items: [act("Ver pipeline", "grid", { go: ["com-pipeline"] })] }];
        if (s.match(/rentab|cliente|mejor/)) return [
          { html: "<b>Verde Agro</b> tiene el mejor margen medio (13,1 %). Por GP absoluto manda Acme; <b>Lumo</b> es el más flojo pese al volumen." },
          { type: "actions", items: [act("Ver Power BI", "grid", { go: ["bi"] })] }];
        return null;
      },
    },
    facturacion: {
      name: "Asistente de Facturación", expertise: "Ventas, compras y Verifactu",
      hello: "Vigilo que no se escape ningún cargo y que cobres a tiempo. ¿Qué reviso?",
      suggest: [{ q: "¿Qué facturas están vencidas?", icon: "clock" }, { q: "¿Algún cargo sin facturar?", icon: "money" }, { q: "Estado de Verifactu", icon: "checkCircle" }],
      answer(s) {
        if (s.match(/vencid|cobr|impag/)) return [
          { html: "Tienes <b>1 factura vencida</b>: FV-2026-1175 de Delta Foods (6.498 €), venció el 08 jun." },
          { type: "actions", items: [act("Enviar recordatorio", "invoice", { toast: "Recordatorio de pago enviado a Delta Foods" }), act("Ver facturación", "invoice", { go: ["fac-venta"] })] }];
        if (s.match(/sin factur|cargo|escap|thc/)) return [
          { html: "⚠️ El <b>THC destino (210 €)</b> del expediente S-2026-04417 sigue sin facturar. Si no se repercute, el GP cae un 65 %." },
          { type: "actions", items: [act("Facturar ahora", "money", { toast: "THC destino añadido a la factura de Acme" }), act("Abrir expediente", "file", { go: ["expediente", { id: "S-2026-04417" }] })] }];
        if (s.match(/verifactu|electr|aeat/)) return [
          { html: "<b>Verifactu</b> está activo y al día: las últimas 4 facturas se enviaron a la AEAT correctamente. Sin rechazos." }];
        return null;
      },
    },
    general: {
      name: "Asistente de Expedientes", expertise: "Todo lo que ocurre dentro del expediente",
      hello: "Resúmeme cualquier expediente, te aviso de riesgos y confirmo los campos de la IA.",
      suggest: [{ q: "Resume el expediente S-2026-04417", icon: "file" }, { q: "¿Hay algún expediente en riesgo?", icon: "alert" }, { q: "¿Qué falta por confirmar?", icon: "sparkle" }],
      answer(s) {
        if (s.match(/04417|acme|resum/)) return [
          { html: "<b>S-2026-04417</b> — FCL Shanghái→Barcelona para Acme, vía CMA CGM. En tránsito, ETA 02 jul." },
          { type: "card", rows: [{ k: "Gross profit", v: "324 €" }, { k: "Margen", v: "7,5 %" }, { k: "Riesgo", v: "THC sin facturar (210 €)" }, { k: "IA pendiente", v: "5 campos" }] },
          { type: "actions", items: [act("Abrir expediente", "file", { go: ["expediente", { id: "S-2026-04417" }] })] }];
        if (s.match(/riesgo|alert|demurr|problema/)) return [
          { html: "El más urgente es <b>S-2026-04388</b> (Lumo): lleva 3 días de demurrage sin repercutir, ~450 € en riesgo." },
          { type: "actions", items: [act("Abrir expediente", "file", { go: ["expediente", { id: "S-2026-04388" }] })] }];
        return null;
      },
    },
    tracking: {
      name: "Asistente de Tracking", expertise: "Dónde está cada envío, en tiempo real",
      hello: "Te digo la posición y los hitos de cualquier envío. ¿Cuál quieres seguir?",
      suggest: [{ q: "¿Dónde está el envío de Lumo?", icon: "pin" }, { q: "¿Qué envíos están en tránsito?", icon: "ship" }],
      answer(s) {
        if (s.match(/lumo|04388|dónde|donde/)) return [
          { html: "El envío de <b>Lumo</b> (S-2026-04388) ya descargó en Barcelona. ⚠️ Acumula 3 días de demurrage." },
          { type: "actions", items: [act("Ver en el mapa", "pin", { go: ["tracking"] })] }];
        if (s.match(/tránsito|transito|activ/)) return [
          { html: "Hay <b>3 envíos en tránsito</b>: Acme (CN→ES), Nordix (DE→MX, aéreo) y Acme LCL (ES→MX)." },
          { type: "actions", items: [act("Abrir el mapa global", "pin", { go: ["tracking"] })] }];
        return null;
      },
    },
    sostenibilidad: {
      name: "Asistente de Sostenibilidad", expertise: "Huella de CO₂ y reporte ESG",
      hello: "Calculo emisiones, te digo dónde descarbonizar y preparo el informe CSRD.",
      suggest: [{ q: "¿Cuántas emisiones llevo este mes?", icon: "shield" }, { q: "¿Qué ruta contamina más?", icon: "grid" }],
      answer(s) {
        if (s.match(/emisi|cuánt|cuant|mes|co2/)) return [
          { html: "Este mes llevas <b>242 t CO₂e</b>, un 6,1 % por debajo del objetivo. Intensidad media 11,4 g/t·km, verificada con GLEC." },
          { type: "actions", items: [act("Ver huella", "shield", { go: ["sostenibilidad"] })] }];
        if (s.match(/ruta|lane|contamin|peor/)) return [
          { html: "La ruta <b>DE→MX es la más intensiva</b> (aéreo): 28 % de tus emisiones con solo el 4 % del volumen. Propón alternativa marítima a clientes ESG." },
          { type: "actions", items: [act("Informe CSRD", "download", { toast: "Informe de emisiones CSRD generado" })] }];
        return null;
      },
    },
    bi: {
      name: "Asistente de Power BI", expertise: "Tus números, explicados",
      hello: "Te explico tus indicadores y dónde está la fuga de margen.",
      suggest: [{ q: "¿Dónde se fuga el margen?", icon: "shield" }, { q: "¿Cómo va el GP del mes?", icon: "coins" }],
      answer(s) {
        if (s.match(/fuga|margen|perd/)) return [
          { html: "La fuga recuperable del mes es <b>11.800 €</b>. El 53 % son accesorios sin facturar, 26 % desvíos de accrual." },
          { type: "actions", items: [act("Ver cuadros de mando", "grid", { go: ["bi"] })] }];
        if (s.match(/gp|benefici|mes|gross/)) return [
          { html: "El <b>GP del mes es 184,2 k€</b>, +12,4 % vs el anterior. Margen neto 3,4 %." }];
        return null;
      },
    },
  };

  // generic fallback for sections without a bespoke responder
  function genericAgent(sec) {
    const T = window.FARO_MOD.TREE.find((s) => s.id === sec);
    const label = T ? T.label : sec;
    return {
      name: "Asistente de " + label, expertise: "Tu copiloto para " + label,
      hello: "Soy tu asistente de " + label + ". Puedo orientarte y abrir lo que necesites en este módulo.",
      suggest: [{ q: "¿Qué puedo hacer aquí?", icon: "sparkle" }, { q: "Abrir " + label, icon: "arrowR" }],
      answer() { return null; },
    };
  }

  function defFor(sec) { return AG[sec] || genericAgent(sec); }

  function ModuleAgent({ sec, navigate, toast, close }) {
    const def = defFor(sec);
    const T = window.FARO_MOD.TREE.find((s) => s.id === sec);
    const [msgs, setMsgs] = React.useState([]);
    const [q, setQ] = React.useState("");
    const bodyRef = React.useRef(null);
    React.useEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs]);

    const ask = (text) => {
      if (!text.trim()) return;
      setQ("");
      setMsgs((m) => [...m, { role: "user", text }, { role: "ai", thinking: true }]);
      setTimeout(() => {
        let blocks = def.answer ? def.answer(text.toLowerCase()) : null;
        if (!blocks) blocks = [
          { html: def.expertise + ". Para esto te llevo directo al módulo, donde lo verás con todo el detalle." },
          { type: "actions", items: [act("Abrir " + (T ? T.label : sec), "arrowR", { go: [ROUTE[sec] || sec] })] }];
        setMsgs((m) => { const n = m.slice(); n[n.length - 1] = { role: "ai", blocks }; return n; });
      }, 750);
    };

    const Blocks = window.FaroAI.Blocks;
    return e("div", { className: "cop-scrim", style: { background: "transparent" }, onClick: close },
      e("div", { className: "cop", onClick: (ev) => ev.stopPropagation() },
        e("div", { className: "cop-head" },
          e("div", { className: "cop-orb-lg" }, e(Icon, { name: T ? T.icon : "sparkle", size: 18 })),
          e("div", { className: "grow" },
            e("div", { className: "cop-title" }, def.name),
            e("div", { className: "cop-sub" }, e("span", { className: "live" }), def.expertise)),
          e("button", { className: "icon-btn", onClick: close }, e(Icon, { name: "x", size: 16 }))),
        e("div", { className: "cop-body", ref: bodyRef },
          msgs.length === 0
            ? e("div", null,
                e("div", { className: "msg ai" },
                  e("div", { className: "msg-ava ai" }, e(Icon, { name: "sparkle", size: 13 })),
                  e("div", { className: "msg-bubble" }, e("p", null, def.hello))),
                e("div", { className: "cop-chips" },
                  def.suggest.map((su, i) => e("button", { key: i, className: "cop-chip", onClick: () => ask(su.q) },
                    e(Icon, { name: su.icon }), su.q, e(Icon, { name: "arrowR", size: 14, className: "arr" })))))
            : msgs.map((m, i) =>
                e("div", { key: i, className: "msg " + m.role },
                  e("div", { className: "msg-ava " + m.role }, m.role === "ai" ? e(Icon, { name: "sparkle", size: 13 }) : "MR"),
                  e("div", { className: "msg-bubble" },
                    m.role === "user" ? m.text
                      : m.thinking ? e("div", { className: "msg-think" }, e("i"), e("i"), e("i"))
                      : e(Blocks, { blocks: m.blocks, navigate, toast, ask, close }))))),
        e("div", { className: "cop-foot" },
          e("div", { className: "cop-input" },
            e("input", { value: q, autoFocus: true, placeholder: "Pregunta a tu asistente…",
              onChange: (ev) => setQ(ev.target.value), onKeyDown: (ev) => { if (ev.key === "Enter") ask(q); } }),
            e("button", { className: "cop-send", disabled: !q.trim(), onClick: () => ask(q) }, e(Icon, { name: "arrowR", size: 15 }))),
          e("div", { className: "cop-disc" }, "Asistente especializado en " + (T ? T.label : sec) + " · con acceso a tus datos")))
    );
  }

  window.ModuleAgent = ModuleAgent;
})();
