/* FARO — competitive gap-closers: Rate search, Sostenibilidad CO₂, Integraciones, Portal cliente */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, fmtN, Section, Spark, StatusPill, ModeTag } = UI;
  const e = React.createElement;
  const head = (eyebrow, title, sub, actions) =>
    e("div", { className: "page-head" }, e("div", { className: "grow" },
      e("div", { className: "eyebrow" }, eyebrow), e("h1", { className: "t-h1" }, title),
      sub ? e("div", { className: "page-sub" }, sub) : null), actions || null);

  /* ===================== RATE SEARCH (Freightify/GoFreight gap) ===================== */
  const RATES = [
    { carrier: "Maersk", svc: "Gemini Cooperation", transit: 32, buy: 2480, co2: 1.18, valid: "30 jun", reliab: 94, best: true },
    { carrier: "Hapag-Lloyd", svc: "Gemini Cooperation", transit: 33, buy: 2560, co2: 1.15, valid: "02 jul", reliab: 92, green: true },
    { carrier: "CMA CGM", svc: "Ocean Alliance", transit: 30, buy: 2640, co2: 1.22, valid: "28 jun", reliab: 88, fast: true },
    { carrier: "COSCO", svc: "Ocean Alliance", transit: 31, buy: 2700, co2: 1.20, valid: "29 jun", reliab: 85 },
    { carrier: "MSC", svc: "Independiente", transit: 35, buy: 2390, co2: 1.31, valid: "25 jun", reliab: 81, cheap: true },
  ];
  function RateScreen({ navigate, toast }) {
    const [margin, setMargin] = React.useState(12);
    const [sort, setSort] = React.useState("best");
    let rows = RATES.slice();
    if (sort === "price") rows.sort((a, b) => a.buy - b.buy);
    else if (sort === "transit") rows.sort((a, b) => a.transit - b.transit);
    else if (sort === "co2") rows.sort((a, b) => a.co2 - b.co2);
    else rows.sort((a, b) => (b.best ? 1 : 0) - (a.best ? 1 : 0) || a.buy - b.buy);
    return e("div", { className: "page page-wide screen-enter" },
      head("Comercial · Rate management", "Buscador de tarifas",
        "“La Expedia del flete”: tarifas de compra multi-carrier, margen aplicado y cotización en 2 minutos",
        e("button", { className: "btn" }, e(Icon, { name: "download", size: 14 }), "Importar tarifario")),
      // search bar
      e("div", { className: "card card-pad mb16", style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 14, alignItems: "end" } },
        field("Origen", "Shanghái (CNSHA)"), field("Destino", "Barcelona (ESBCN)"),
        field("Equipo", "1 × 40'HC"), field("Salida", "Esta semana"),
        e("button", { className: "btn terra", style: { height: 38 } }, e(Icon, { name: "search", size: 15 }), "Buscar")),
      // controls
      e("div", { className: "row gap12 mb16 wrap" },
        e("span", { className: "faint", style: { fontSize: 12.5 } }, RATES.length + " tarifas · CNSHA → ESBCN"),
        e("div", { className: "row gap6" }, e("span", { className: "field-label" }, "Ordenar"),
          e("select", { className: "erp-select", value: sort, onChange: (ev) => setSort(ev.target.value) },
            e("option", { value: "best" }, "Recomendado"), e("option", { value: "price" }, "Precio"),
            e("option", { value: "transit" }, "Tránsito"), e("option", { value: "co2" }, "CO₂"))),
        e("div", { className: "row gap8 right" }, e("span", { className: "field-label" }, "Margen"),
          e("input", { type: "range", min: 5, max: 25, value: margin, onChange: (ev) => setMargin(+ev.target.value), style: { accentColor: "var(--terra)" } }),
          e("span", { className: "mono", style: { fontWeight: 600, width: 34 } }, margin + " %"))),
      e("div", { className: "col gap10" },
        rows.map((r, i) => {
          const sell = Math.round(r.buy * (1 + margin / 100));
          return e("div", { key: i, className: "rate-card" + (r.best ? " best" : ""), onClick: () => { toast && toast("Cotización creada desde tarifa " + r.carrier); navigate("quote"); } },
            e("div", null,
              e("div", { className: "row gap8" }, e("b", { style: { fontSize: 14 } }, r.carrier),
                r.best ? e("span", { className: "pill terra", style: { fontSize: 9.5, padding: "1px 6px" } }, "Recomendado") : null),
              e("div", { className: "faint", style: { fontSize: 11.5, marginTop: 2 } }, r.svc),
              e("div", { className: "row gap6", style: { marginTop: 7 } },
                r.fast ? tag("Más rápido", "blue") : null, r.cheap ? tag("Más barato", "amber") : null,
                r.green ? tag("Menor CO₂", "green") : null,
                e("span", { className: "pill neutral", style: { fontSize: 10 } }, "Fiabilidad " + r.reliab + " %"))),
            e("div", { className: "rate-specs" },
              spec(r.transit + " d", "tránsito"), spec(r.co2.toFixed(2), "t CO₂e"), spec(r.valid, "validez")),
            e("div", { className: "rate-price" },
              e("div", { className: "rate-sell" }, fmtEur(sell)),
              e("div", { className: "rate-buy" }, "compra " + fmtEur(r.buy) + " · margen " + fmtEur(sell - r.buy)),
              e("button", { className: "btn sm terra", style: { marginTop: 8 } }, "Cotizar", e(Icon, { name: "arrowR", size: 13 }))));
        }))
    );
  }
  const spec = (v, l) => e("div", { className: "rate-spec" }, e("div", { className: "v" }, v), e("div", { className: "l" }, l));
  const tag = (t, c) => e("span", { className: "pill " + c, style: { fontSize: 10, padding: "1px 7px" } }, t);
  const field = (l, v) => e("div", { className: "field" }, e("div", { className: "field-label" }, l),
    e("div", { style: { border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "8px 11px", background: "var(--surface-2)", fontSize: 13, fontWeight: 500 } }, v));

  /* ===================== SOSTENIBILIDAD · CO₂ (ESG/CSRD gap) ===================== */
  const EM_LANES = [{ l: "CN → ES", v: 64 }, { l: "VN → ES", v: 48 }, { l: "DE → MX", v: 71 }, { l: "ES → BR", v: 39 }, { l: "IT → ES", v: 12 }, { l: "Rail CN-ES", v: 8 }];
  const EM_SHIP = [
    { id: "S-2026-04417", mode: "SEA-FCL", km: 19400, t: 18.4, co2: 1.18 },
    { id: "S-2026-04431", mode: "AIR", km: 9600, t: 1.18, co2: 6.92 },
    { id: "S-2026-04388", mode: "SEA-FCL", km: 17800, t: 21.0, co2: 1.05 },
    { id: "S-2026-04369", mode: "SEA-LCL", km: 9100, t: 12.1, co2: 0.74 },
    { id: "S-2026-04402", mode: "ROAD", km: 1600, t: 8.0, co2: 0.21 },
  ];
  function SustainabilityScreen({ navigate }) {
    const max = Math.max(...EM_LANES.map((l) => l.v));
    return e("div", { className: "page page-wide screen-enter" },
      head("Sostenibilidad · ESG", "Huella de carbono",
        "Emisiones por expediente y lane (GLEC / ISO 14083) — listo para el reporte CSRD",
        e("button", { className: "btn primary" }, e(Icon, { name: "download", size: 14 }), "Informe CSRD")),
      e("div", { className: "kpi-grid mb20", style: { gridTemplateColumns: "repeat(4,1fr)" } },
        kpi("Emisiones · mes", "242", "t CO₂e", "−6,1 % vs objetivo", "up"),
        kpi("Intensidad media", "11,4", "g/t·km", "GLEC v3 verificado", null),
        kpi("Cobertura de datos", "96", "%", "datos primarios de carrier", "up"),
        kpi("Compensado", "38", "t CO₂e", "vía proyectos certificados", "up")),
      e("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, alignItems: "start", marginBottom: 18 } },
        e(Section, { title: "Emisiones por lane (t CO₂e)", icon: "grid", sub: "Identifica dónde descarbonizar primero" },
          e("div", { className: "bars" }, EM_LANES.map((l, i) =>
            e("div", { key: i, className: "bar-col" },
              e("span", { className: "mono", style: { fontSize: 11, fontWeight: 600 } }, l.v),
              e("div", { className: "bar" + (i % 2 ? " alt" : ""), style: { height: (l.v / max * 100) + "%", background: i === 2 ? "var(--red)" : undefined } }),
              e("span", { className: "bar-lbl" }, l.l))))),
        e(Section, { title: "Reparto por modo", icon: "ship" },
          e("div", { className: "col gap12" }, [
            { m: "Marítimo", p: 58, c: "var(--blue)" }, { m: "Aéreo", p: 28, c: "var(--red)" },
            { m: "Terrestre", p: 11, c: "var(--terra)" }, { m: "Ferrocarril", p: 3, c: "var(--green)" },
          ].map((x, i) => e("div", { key: i },
            e("div", { className: "row", style: { fontSize: 12.5, marginBottom: 4 } }, e("span", { className: "grow" }, x.m), e("span", { className: "mono", style: { fontWeight: 600 } }, x.p + " %")),
            e("div", { className: "prog" }, e("div", { style: { width: x.p + "%", background: x.c } }))))),
          e("p", { className: "faint", style: { fontSize: 11.5, marginTop: 12 } }, "El aéreo es el 28 % de emisiones con solo el 4 % del volumen. Propón alternativas marítimas a clientes sensibles a ESG."))),
      e(Section, { title: "Huella por expediente", icon: "file", noPad: true, sub: "Adjunta el certificado de emisiones a cada factura" },
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null, e("th", null, "Expediente"), e("th", null, "Modo"), e("th", { className: "r" }, "Distancia"), e("th", { className: "r" }, "Peso"), e("th", { className: "r" }, "t CO₂e"), e("th", { className: "r" }, "Intensidad"))),
          e("tbody", null, EM_SHIP.map((s, i) =>
            e("tr", { key: i, className: "click", onClick: () => navigate("expediente", { id: s.id }) },
              e("td", null, e("span", { className: "mono", style: { color: "var(--terra-deep)", fontWeight: 600 } }, s.id)),
              e("td", null, e(ModeTag, { mode: s.mode, short: true })),
              e("td", { className: "r tnum" }, fmtN(s.km) + " km"),
              e("td", { className: "r tnum" }, s.t + " t"),
              e("td", { className: "r tnum", style: { fontWeight: 600, color: s.co2 > 5 ? "var(--red-ink)" : "var(--ink)" } }, s.co2.toFixed(2)),
              e("td", { className: "r tnum faint" }, (s.co2 * 1000 / (s.t * s.km / 1000)).toFixed(1) + " g/t·km"))))))
    );
  }
  function kpi(l, v, u, d, dir) {
    return e("div", { className: "kpi" },
      e("div", { className: "kpi-top" }, e("span", { className: "kpi-label" }, l), e("span", { className: "kpi-icon" }, e(Icon, { name: "shield", size: 15 }))),
      e("div", { className: "kpi-val num" }, v, e("span", { className: "unit" }, " " + u)),
      e("div", { className: "kpi-delta " + (dir || "up"), style: dir ? null : { color: "var(--ink-3)" } }, dir ? e(Icon, { name: dir === "up" ? "arrowUp" : "arrowDn", size: 13 }) : null, d));
  }

  /* ===================== INTEGRACIONES (API-native proof) ===================== */
  const CONN = [
    { n: "Maersk", c: "Naviera · DCSA", s: "ok", x: "MAEU" }, { n: "Hapag-Lloyd", c: "Naviera · DCSA", s: "ok", x: "HLCU" },
    { n: "CMA CGM", c: "Naviera · DCSA", s: "ok", x: "CMDU" }, { n: "INTTRA", c: "Booking multi-carrier", s: "ok", x: "INT" },
    { n: "project44", c: "Visibilidad multimodal", s: "ok", x: "P44" }, { n: "Vizion", c: "Tracking ocean API", s: "ok", x: "VIZ" },
    { n: "ONE Record", c: "Aéreo · IATA", s: "beta", x: "1R" }, { n: "AEAT", c: "Aduanas · DUA", s: "ok", x: "AE" },
    { n: "ICS2", c: "Aduanas · ENS", s: "ok", x: "ICS" }, { n: "NCTS-P6", c: "Tránsito UE", s: "ok", x: "NCT" },
    { n: "Portic", c: "PCS Barcelona", s: "ok", x: "POR" }, { n: "Valenciaport", c: "PCS Valencia", s: "ok", x: "VPC" },
    { n: "Verifactu", c: "AEAT · e-factura", s: "ok", x: "VF" }, { n: "Holded", c: "Contabilidad", s: "ok", x: "HLD" },
    { n: "Stripe", c: "Cobros", s: "ok", x: "ST" }, { n: "Freightify", c: "Rate management", s: "beta", x: "FY" },
    { n: "HubSpot", c: "CRM", s: "off", x: "HS" }, { n: "Power BI", c: "Analítica", s: "ok", x: "BI" },
  ];
  function IntegrationsScreen({ navigate }) {
    const ok = CONN.filter((c) => c.s === "ok").length;
    return e("div", { className: "page page-wide screen-enter" },
      head("Integraciones · API-native", "Conectores y API",
        "Arquitectura API-first (DCSA · ONE Record · project44). Webhooks, idempotencia y outbox — sin deuda EDI legacy",
        e("button", { className: "btn terra" }, e(Icon, { name: "plus", size: 15 }), "Añadir conector")),
      e("div", { className: "row gap12 mb20 wrap" },
        kpi2(ok + " / " + CONN.length, "conectores activos"), kpi2("99,98 %", "uptime 90 d"),
        kpi2("1,2 M", "eventos / mes"), kpi2("REST + Webhooks", "API pública v2")),
      e("div", { className: "intg-grid" },
        CONN.map((c, i) => {
          const st = c.s === "ok" ? ["green", "Conectado"] : c.s === "beta" ? ["amber", "Beta"] : ["neutral", "Disponible"];
          return e("div", { key: i, className: "intg" },
            e("div", { className: "intg-logo" }, c.x),
            e("div", { className: "grow" },
              e("div", { className: "intg-name" }, c.n), e("div", { className: "intg-cat" }, c.c),
              e("span", { className: "pill " + st[0], style: { marginTop: 8, fontSize: 10 } }, st[1])),
            e("button", { className: "icon-btn", style: { width: 28, height: 28 } }, e(Icon, { name: c.s === "off" ? "plus" : "settings", size: 14 })));
        }))
    );
  }
  const kpi2 = (v, l) => e("div", { className: "kpi", style: { flex: 1, minWidth: 170 } },
    e("div", { className: "kpi-val num", style: { fontSize: 20 } }, v), e("div", { className: "kpi-label", style: { marginTop: 2 } }, l));

  /* ===================== PORTAL DEL CLIENTE (Flexport gap) ===================== */
  const P_SHIP = [
    { id: "S-2026-04417", route: "Shanghái → Barcelona", mode: "SEA-FCL", status: "in-transit", statusLabel: "En tránsito", eta: "02 jul", prog: 55 },
    { id: "S-2026-04344", route: "Barcelona → Veracruz", mode: "SEA-LCL", status: "booking", statusLabel: "Reservado", eta: "18 jul", prog: 20 },
    { id: "S-2026-04201", route: "Shanghái → Barcelona", mode: "SEA-FCL", status: "delivered", statusLabel: "Entregado", eta: "—", prog: 100 },
  ];
  function PortalScreen({ navigate }) {
    const [tab, setTab] = React.useState("envios");
    const TABS = [{ id: "envios", l: "Mis envíos", i: "ship" }, { id: "cotizar", l: "Solicitar cotización", i: "quote" }, { id: "facturas", l: "Facturas", i: "invoice" }, { id: "docs", l: "Documentos", i: "doc" }];
    return e("div", { className: "portal" },
      e("div", { className: "portal-top" },
        e("div", { className: "portal-brand" }, e("div", { className: "portal-logo" }, "A"),
          e("div", null, e("div", { style: { fontWeight: 700, fontSize: 15 } }, "Acme Ibérica"), e("div", { className: "faint", style: { fontSize: 11 } }, "Portal de cliente · powered by Faro"))),
        e("div", { className: "right row gap10" },
          e("span", { className: "pill green" }, e("span", { className: "sdot green" }), "3 envíos activos"),
          e("div", { className: "avatar", style: { width: 32, height: 32, fontSize: 11 } }, "AC"),
          e("button", { className: "btn sm", onClick: () => navigate("inbox") }, e(Icon, { name: "arrowR", size: 13, style: { transform: "rotate(180deg)" } }), "Volver al ERP"))),
      e("div", { className: "portal-tabs" }, TABS.map((t) =>
        e("div", { key: t.id, className: "portal-tab" + (tab === t.id ? " on" : ""), onClick: () => setTab(t.id) }, e(Icon, { name: t.i, size: 15 }), t.l))),
      e("div", { className: "portal-body" }, e("div", { className: "portal-page" },
        tab === "envios" ? PortalEnvios()
          : tab === "cotizar" ? PortalCotizar()
          : tab === "facturas" ? PortalFacturas()
          : PortalDocs()))
    );
  }
  function PortalEnvios() {
    return e(React.Fragment, null,
      e("h2", { className: "t-h2 mb16" }, "Mis envíos"),
      e("div", { className: "col gap12" }, P_SHIP.map((s, i) =>
        e("div", { key: i, className: "card card-pad" },
          e("div", { className: "row gap12 mb12 wrap" },
            e("span", { className: "mono", style: { fontWeight: 700, fontSize: 14 } }, s.id),
            e(ModeTag, { mode: s.mode, short: true }), e(StatusPill, { status: s.status, label: s.statusLabel }),
            e("span", { className: "grow" }), e("span", { className: "faint", style: { fontSize: 12.5 } }, s.route),
            s.eta !== "—" ? e("span", { className: "pill amber" }, "ETA " + s.eta) : null),
          e("div", { className: "ptrack" }, e("div", { style: { width: s.prog + "%" } })),
          e("div", { className: "row mt12 gap8" },
            e("button", { className: "btn sm" }, e(Icon, { name: "pin", size: 13 }), "Seguir en el mapa"),
            e("button", { className: "btn sm ghost" }, e(Icon, { name: "doc", size: 13 }), "Documentos"),
            e("button", { className: "btn sm ghost right" }, "Detalle", e(Icon, { name: "arrowR", size: 13 }))))))
    );
  }
  function PortalCotizar() {
    return e(React.Fragment, null,
      e("h2", { className: "t-h2 mb8" }, "Solicitar cotización"),
      e("p", { className: "muted", style: { marginTop: 0, marginBottom: 18, fontSize: 13.5 } }, "Respuesta en menos de 2 horas. Nuestra IA prepara la oferta al instante."),
      e("div", { className: "card card-pad", style: { maxWidth: 640 } },
        e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } },
          field("Origen", "Shanghái, CN"), field("Destino", "Barcelona, ES"),
          field("Modo", "Marítimo FCL"), field("Equipo / carga", "1 × 40'HC"),
          field("Mercancía", "Textil para el hogar"), field("Incoterm", "FOB")),
        e("button", { className: "btn terra mt16", style: { width: "100%", justifyContent: "center" } }, e(Icon, { name: "sparkle", size: 15 }), "Solicitar oferta")));
  }
  function PortalFacturas() {
    const rows = [["FV-2026-1182", "03 jun", "5.233 €", "amber", "Pendiente"], ["FV-2026-1090", "12 may", "4.880 €", "green", "Pagada"], ["FV-2026-0991", "28 abr", "6.120 €", "green", "Pagada"]];
    return e(React.Fragment, null, e("h2", { className: "t-h2 mb16" }, "Facturas"),
      e("div", { className: "card", style: { overflow: "hidden" } }, e("table", { className: "tbl erp" },
        e("thead", null, e("tr", null, e("th", null, "Factura"), e("th", null, "Fecha"), e("th", { className: "r" }, "Importe"), e("th", null, "Estado"), e("th", null, ""))),
        e("tbody", null, rows.map((r, i) => e("tr", { key: i },
          e("td", null, e("span", { className: "mono", style: { fontWeight: 600 } }, r[0])), e("td", { className: "faint" }, r[1]),
          e("td", { className: "r tnum", style: { fontWeight: 600 } }, r[2]),
          e("td", null, e("span", { className: "pill " + r[3] }, r[4])),
          e("td", { className: "r" }, r[3] === "amber" ? e("button", { className: "btn sm terra" }, "Pagar ahora") : e("button", { className: "btn sm ghost" }, e(Icon, { name: "download", size: 13 }), "PDF"))))))));
  }
  function PortalDocs() {
    const docs = [["MBL · CMDU SHA0492215", "S-2026-04417"], ["Factura comercial CI-2241", "S-2026-04417"], ["Arrival Notice", "S-2026-04201"], ["POD firmado", "S-2026-04201"]];
    return e(React.Fragment, null, e("h2", { className: "t-h2 mb16" }, "Documentos"),
      e("div", { className: "col gap8", style: { maxWidth: 640 } }, docs.map((d, i) =>
        e("div", { key: i, className: "doc" }, e("div", { className: "doc-ico" }, e(Icon, { name: "doc", size: 16 })),
          e("div", { className: "grow" }, e("div", { className: "doc-name" }, d[0]), e("div", { className: "doc-meta" }, d[1])),
          e("button", { className: "btn sm ghost" }, e(Icon, { name: "download", size: 13 }), "Descargar")))));
  }

  window.RateScreen = RateScreen;
  window.SustainabilityScreen = SustainabilityScreen;
  window.IntegrationsScreen = IntegrationsScreen;
  window.PortalScreen = PortalScreen;
})();
