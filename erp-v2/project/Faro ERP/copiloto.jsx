/* FARO — Copiloto: omnipresent, data-aware AI command center */
(function () {
  const { Icon, UI } = window;
  const { fmtEur } = UI;
  const e = React.createElement;

  // ---- knowledge: question → rich answer blocks ----
  function answerFor(q) {
    const D = window.FARO;
    const s = q.toLowerCase();
    const has = (...w) => w.some((x) => s.includes(x));

    if (has("margen", "perd", "riesgo", "fuga")) {
      const exc = D.exceptions.filter((x) => x.risk).sort((a, b) => b.risk - a.risk).slice(0, 3);
      const total = D.exceptions.reduce((a, x) => a + (x.risk || 0), 0);
      return [
        { html: `Ahora mismo tienes <b>${fmtEur(total)}</b> de margen en riesgo repartido en ${D.exceptions.length} incidencias. Sobre un neto del 3 %, recuperarlo equivale a <b style="color:var(--green-ink)">+33 % de beneficio</b>. Las tres más urgentes:` },
        { type: "card", rows: exc.map((x) => ({ k: x.title.split(" · ")[0], v: fmtEur(x.risk), exp: x.ref })) },
        { type: "actions", items: [
          { label: "Abrir la bandeja", icon: "inbox", go: ["inbox"] },
          { label: "Facturar THC · S-04417", icon: "money", toast: "Cargo THC destino añadido a la factura" } ] },
      ];
    }
    if (has("04417", "acme", "expediente") && !has("lumo", "email", "correo", "redact", "reclam", "escribe")) {
      const h = D.hero;
      const t = h.charges.reduce((a, c) => ({ s: a.s + c.sell, b: a.b + c.b + c.buy }), { s: 0, b: 0 });
      const gp = h.charges.reduce((a, c) => a + (c.sell - c.buy), 0);
      return [
        { html: `<b>${h.id}</b> — FCL 40'HC de Shanghái a Barcelona para Acme Ibérica, vía CMA CGM. En tránsito, ETA ${h.eta}.` },
        { type: "card", rows: [
          { k: "Gross profit", v: fmtEur(gp) }, { k: "Margen", v: "7,5 %" },
          { k: "Riesgo abierto", v: "THC destino sin facturar (210 €)" }, { k: "IA pendiente", v: "5 campos en ámbar" } ] },
        { html: `⚠️ Si no facturas el THC destino, el GP cae a 114 € (<b>−65 %</b>). Te recomiendo resolverlo antes del cierre.` },
        { type: "actions", items: [
          { label: "Abrir expediente", icon: "file", go: ["expediente", { id: h.id }] },
          { label: "Confirmar campos IA", icon: "sparkle", go: ["expediente", { id: h.id }] } ] },
      ];
    }
    if (has("cliente", "rentab", "rentable")) {
      const top = [...D.clientsGP].sort((a, b) => b.gp - a.gp).slice(0, 4);
      return [
        { html: `Por gross profit acumulado este trimestre, tu cartera se ordena así. Ojo: ningún cliente supera el 20 % del GP, lo que protege tu valoración.` },
        { type: "card", rows: top.map((c) => ({ k: c.name + " · " + c.files + " exp.", v: fmtEur(c.gp) })) },
        { html: `<b>Verde Agro</b> tiene el mejor margen medio (13,1 %); <b>Lumo</b> el más flojo (6,4 %) pese al volumen — revisaría sus accesorios.` },
        { type: "actions", items: [{ label: "Ver Power BI", icon: "grid", go: ["bi"] }] },
      ];
    }
    if (has("cierre", "mes", "junio", "contab")) {
      return [
        { html: `El cierre de <b>junio 2026</b> está casi listo: 1.284/1.284 asientos cuadrados e IVA conciliado con el 303. Quedan 3 bloqueos:` },
        { type: "card", rows: [
          { k: "Accruals sin reversar", v: "12 · 3.110 €" }, { k: "Facturas de compra sin conciliar", v: "3" }, { k: "FX no realizada", v: "−420 €" } ] },
        { html: `El <b>WIP agregado es +3.530 €</b> — se reconocerá contra el resultado del período. Puedo prepararte el asiento de reverso.` },
        { type: "actions", items: [
          { label: "Ir a Contabilidad", icon: "bank", go: ["con-cierre"] },
          { label: "Preparar reverso", icon: "refresh", toast: "Borrador de asiento de reverso generado" } ] },
      ];
    }
    if (has("email", "correo", "reclam", "redact", "escribe", "demurrage")) {
      return [
        { html: `Claro. He redactado un correo para reclamar el THC destino a Acme Ibérica, con los datos del expediente ya insertados:` },
        { type: "email", to: "operaciones@acme-iberica.es", subject: "Cargo pendiente · Expediente S-2026-04417 (THC destino)",
          body: "Estimados,\n\nEn relación al expediente S-2026-04417 (Shanghái → Barcelona, contenedor TCLU 784512-3), les confirmamos un cargo accesorio pendiente de repercutir: THC destino por importe de 210,00 €.\n\nAdjuntamos justificante de terminal. Quedamos a su disposición.\n\nUn saludo,\nTransitos Llevant" },
        { type: "actions", items: [
          { label: "Copiar", icon: "doc", toast: "Correo copiado al portapapeles" },
          { label: "Enviar", icon: "arrowR", toast: "Correo enviado a Acme Ibérica" } ] },
      ];
    }
    if (has("tracking", "dónde", "donde", "lumo", "contenedor", "barco", "buque")) {
      return [
        { html: `El expediente de <b>Lumo Retail</b> (S-2026-04388, Ho Chi Minh → Barcelona) ya descargó en Barcelona. Último evento DCSA:` },
        { type: "card", rows: [
          { k: "DISC · descarga buque", v: "Barcelona" }, { k: "Estado", v: "Arribado" }, { k: "Alerta", v: "Demurrage 3 días · 450 €" } ] },
        { html: `Recomiendo programar la recogida hoy: cada día suma ~150 € de demurrage no repercutido.` },
        { type: "actions", items: [
          { label: "Ver en el mapa", icon: "pin", go: ["tracking"] },
          { label: "Abrir expediente", icon: "file", go: ["expediente", { id: "S-2026-04388" }] } ] },
      ];
    }
    return [
      { html: `Soy <b>Faro IA</b>, tu copiloto. Vivo dentro del núcleo: leo y escribo en tus expedientes, cargos y cuentas. Prueba a preguntarme por tu margen en riesgo, un expediente, el cierre del mes, o pídeme que redacte un correo.` },
      { type: "actions", items: [{ label: "¿Dónde pierdo margen?", icon: "shield", ask: "¿Dónde estoy perdiendo margen ahora?" }] },
    ];
  }

  const SUGGEST = [
    { q: "¿Dónde estoy perdiendo margen ahora?", icon: "shield" },
    { q: "Resume el expediente S-2026-04417", icon: "file" },
    { q: "¿Qué cliente es más rentable?", icon: "users" },
    { q: "Prepara el cierre de junio", icon: "bank" },
    { q: "Redacta un email para reclamar el THC a Acme", icon: "invoice" },
  ];

  function Blocks({ blocks, navigate, toast, ask, close }) {
    return blocks.map((b, i) => {
      if (b.html) return e("p", { key: i, dangerouslySetInnerHTML: { __html: b.html } });
      if (b.type === "card") return e("div", { key: i, className: "ai-card" },
        b.rows.map((r, j) => e("div", { key: j, className: "ai-rowline" },
          e("span", { className: "k" }, r.k), e("span", { className: "v" }, r.v))));
      if (b.type === "email") return e("div", { key: i, className: "email-draft" },
        e("div", { className: "eh" }, "Para: " + b.to),
        e("div", { className: "es" }, b.subject),
        e("div", { style: { whiteSpace: "pre-wrap", color: "var(--ink-2)" } }, b.body));
      if (b.type === "actions") return e("div", { key: i, className: "ai-actions" },
        b.items.map((it, j) => e("button", { key: j, className: "btn sm" + (j === 0 ? " terra" : ""),
          onClick: () => { if (it.go) { navigate(it.go[0], it.go[1] || {}); close(); } if (it.toast) toast(it.toast); if (it.ask) ask(it.ask); } },
          it.icon ? e(Icon, { name: it.icon, size: 13 }) : null, it.label)));
      return null;
    });
  }

  function Copilot({ navigate, toast, close }) {
    const [msgs, setMsgs] = React.useState([]);
    const [q, setQ] = React.useState("");
    const bodyRef = React.useRef(null);
    React.useEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs]);

    const ask = (text) => {
      if (!text.trim()) return;
      setQ("");
      setMsgs((m) => [...m, { role: "user", text }, { role: "ai", thinking: true }]);
      setTimeout(() => {
        const blocks = answerFor(text);
        setMsgs((m) => { const n = m.slice(); n[n.length - 1] = { role: "ai", blocks }; return n; });
      }, 850);
    };

    return e("div", { className: "cop-scrim", onClick: close },
      e("div", { className: "cop", onClick: (ev) => ev.stopPropagation() },
        e("div", { className: "cop-head" },
          e("div", { className: "cop-orb-lg" }, e(Icon, { name: "sparkle", size: 18 })),
          e("div", { className: "grow" },
            e("div", { className: "cop-title" }, "Faro IA · Copiloto"),
            e("div", { className: "cop-sub" }, e("span", { className: "live" }), "Con acceso de escritura a tu núcleo")),
          e("button", { className: "icon-btn", onClick: close }, e(Icon, { name: "x", size: 16 }))),
        e("div", { className: "cop-body", ref: bodyRef },
          msgs.length === 0
            ? e("div", { className: "cop-intro" },
                e("div", { className: "cop-orb-lg", style: { margin: "0 auto", width: 48, height: 48 } }, e(Icon, { name: "sparkle", size: 24 })),
                e("h3", null, "Pregúntame lo que sea de tu operación"),
                e("p", null, "No soy un chatbot por encima del sistema: leo y escribo en el núcleo —expedientes, cargos, cuentas— con validación humana."),
                e("div", { className: "cop-chips" },
                  SUGGEST.map((su, i) => e("button", { key: i, className: "cop-chip", onClick: () => ask(su.q) },
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
            e("input", { value: q, autoFocus: true, placeholder: "Pregunta a Faro IA…",
              onChange: (ev) => setQ(ev.target.value), onKeyDown: (ev) => { if (ev.key === "Enter") ask(q); } }),
            e("button", { className: "cop-send", disabled: !q.trim(), onClick: () => ask(q) }, e(Icon, { name: "arrowR", size: 15 }))),
          e("div", { className: "cop-disc" }, "Faro IA puede proponer acciones; tú las confirmas. Antítesis de la IA periférica sobre legacy.")))
    );
  }

  window.Copilot = Copilot;
  window.FaroAI = { Blocks };
})();
