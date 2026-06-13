/* FARO — Red & Partners: the 10 partner-grade features that win contracts */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, fmtN, Section, StatusPill, ModeTag, Tier } = UI;
  const e = React.createElement;
  const head = (eyebrow, title, sub, actions) =>
    e("div", { className: "page-head" }, e("div", { className: "grow" },
      e("div", { className: "eyebrow" }, eyebrow), e("h1", { className: "t-h1" }, title),
      sub ? e("div", { className: "page-sub" }, sub) : null), actions || null);
  const kpi = (label, val, unit, sub, icon) => e("div", { className: "kpi" },
    e("div", { className: "kpi-top" }, e("span", { className: "kpi-label" }, label), e("span", { className: "kpi-icon" }, e(Icon, { name: icon, size: 15 }))),
    e("div", { className: "kpi-val num" }, val, unit ? e("span", { className: "unit" }, " " + unit) : null),
    sub ? e("div", { className: "kpi-delta", style: { color: "var(--ink-3)" } }, sub) : null);
  function Stars({ n }) {
    return e("span", { className: "stars" }, [1, 2, 3, 4, 5].map((i) =>
      e(Icon, { key: i, name: "star", size: 13, style: { color: i <= Math.round(n) ? "var(--amber)" : "var(--line-strong)", fill: i <= Math.round(n) ? "var(--amber)" : "none" } })));
  }

  /* ===================== 1 · RED DE AGENTES ===================== */
  const AGENTS = [
    { city: "Shanghái", country: "China", name: "Sino-Bridge Logistics", net: "WCA", since: 2019, vol: 142, rating: 4.8, x: 80, y: 38 },
    { city: "Ningbo", country: "China", name: "EastPort Forwarding", net: "WCA", since: 2021, vol: 88, rating: 4.6, x: 82, y: 40 },
    { city: "Ho Chi Minh", country: "Vietnam", name: "Mekong Freight", net: "JCtrans", since: 2022, vol: 54, rating: 4.4, x: 77, y: 56 },
    { city: "Hamburgo", country: "Alemania", name: "NordSee Spedition", net: "FIATA", since: 2018, vol: 96, rating: 4.9, x: 50, y: 26 },
    { city: "Santos", country: "Brasil", name: "AtlanticoCargo", net: "WCA", since: 2020, vol: 41, rating: 4.3, x: 35, y: 66 },
    { city: "México DF", country: "México", name: "Azteca Logistics", net: "JCtrans", since: 2023, vol: 33, rating: 4.5, x: 18, y: 50 },
    { city: "Nueva York", country: "EE. UU.", name: "Liberty Freight Inc.", net: "WCA", since: 2017, vol: 110, rating: 4.7, x: 27, y: 38 },
  ];
  function AgentNetworkScreen({ navigate, toast }) {
    return e("div", { className: "page page-wide screen-enter" },
      head("Red & Partners", "Red global de agentes",
        "Tu activo más valioso: 132 agentes corresponsales en 48 países. Co-load, expedientes compartidos y liquidación en una sola red.",
        e("button", { className: "btn terra", onClick: () => toast && toast("Invitación enviada al agente") }, e(Icon, { name: "plus", size: 15 }), "Invitar agente")),
      e("div", { className: "kpi-grid mb20", style: { gridTemplateColumns: "repeat(4,1fr)" } },
        kpi("Agentes activos", "132", null, "en 48 países", "handshake"),
        kpi("Redes", "WCA · FIATA · JC", null, "membresías verificadas", "globe"),
        kpi("Co-loads · mes", "37", null, "+14 % vs mes anterior", "container"),
        kpi("Rating medio de red", "4,7", "/ 5", "sobre 1.240 valoraciones", "star")),
      e("div", { style: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, alignItems: "start" } },
        e("div", { className: "opsmap", style: { padding: 0 } },
          e("svg", { viewBox: "0 0 100 80", preserveAspectRatio: "xMidYMid meet", style: { width: "100%", height: "auto" } },
            // spokes from HQ (Barcelona ~ x52 y30)
            AGENTS.map((a, i) => e("line", { key: "l" + i, x1: 52, y1: 30, x2: a.x, y2: a.y, stroke: "var(--terra)", strokeWidth: 0.35, opacity: 0.5, strokeDasharray: "1 1.6" })),
            AGENTS.map((a, i) => e("g", { key: i, style: { cursor: "pointer" } },
              e("circle", { className: "opsmap-pulse", cx: a.x, cy: a.y, r: 1.6 }),
              e("circle", { cx: a.x, cy: a.y, r: 1.6, fill: "#fff", stroke: "var(--terra)", strokeWidth: 0.5 }),
              e("text", { x: a.x + 2.4, y: a.y + 1, fontSize: 2.4, fill: "rgba(255,255,255,.65)" }, a.city))),
            e("circle", { cx: 52, cy: 30, r: 2.6, fill: "var(--terra)" }),
            e("circle", { cx: 52, cy: 30, r: 2.6, fill: "none", stroke: "#fff", strokeWidth: 0.6 }),
            e("text", { x: 52, y: 26.4, fontSize: 2.7, fill: "#fff", textAnchor: "middle", fontWeight: 700 }, "Barcelona · HQ")),
          e("div", { className: "opsmap-stat" }, e("div", { className: "n" }, "48"), e("div", { className: "l" }, "países cubiertos"))),
        e(Section, { title: "Agentes corresponsales", icon: "handshake", noPad: true,
            right: e("span", { className: "faint", style: { fontSize: 11.5 } }, AGENTS.length + " destacados") },
          e("table", { className: "tbl erp" },
            e("thead", null, e("tr", null, e("th", null, "Agente"), e("th", null, "Red"), e("th", { className: "r" }, "Vol."), e("th", null, "Rating"))),
            e("tbody", null, AGENTS.map((a, i) =>
              e("tr", { key: i, className: "click", onClick: () => toast && toast("Abriendo perfil de " + a.name) },
                e("td", null, e("b", { style: { fontSize: 12.5 } }, a.name), e("div", { className: "faint", style: { fontSize: 11 } }, a.city + ", " + a.country + " · desde " + a.since)),
                e("td", null, e("span", { className: "pill neutral" }, a.net)),
                e("td", { className: "r tnum" }, a.vol),
                e("td", null, e(Stars, { n: a.rating })))))))));
  }

  /* ===================== 2 · TENDER A LA RED ===================== */
  const BIDS = [
    { agent: "Sino-Bridge Logistics", city: "Shanghái", buy: 2480, transit: 32, rating: 4.8, valid: "30 jun", best: true },
    { agent: "EastPort Forwarding", city: "Ningbo", buy: 2390, transit: 35, rating: 4.6, cheap: true },
    { agent: "Mekong Freight", city: "Shanghái", buy: 2560, transit: 30, rating: 4.4, fast: true },
  ];
  function TenderScreen({ navigate, toast }) {
    return e("div", { className: "page page-wide screen-enter" },
      head("Red & Partners", "Tender a la red",
        "Lanza un RFQ a tu red de agentes y recibe ofertas comparables en horas, no días. Adjudica con un clic.",
        e("button", { className: "btn terra", onClick: () => toast && toast("RFQ enviado a 6 agentes de la red") }, e(Icon, { name: "sparkle", size: 15 }), "Nuevo tender")),
      e("div", { className: "card card-pad mb16", style: { display: "grid", gridTemplateColumns: "repeat(4,1fr) auto", gap: 16, alignItems: "center", background: "var(--surface-2)" } },
        defv("Ruta", "CNSHA → ESBCN"), defv("Equipo", "2 × 40'HC"), defv("Mercancía", "Electrónica de consumo"),
        defv("Respuesta", "6 / 6 agentes"), e("span", { className: "pill green", style: { justifySelf: "end" } }, e("span", { className: "sdot green" }), "Tender abierto · 18 h")),
      e("div", { className: "col gap10" },
        BIDS.map((b, i) =>
          e("div", { key: i, className: "rate-card" + (b.best ? " best" : ""), style: { gridTemplateColumns: "1.3fr 1fr auto" } },
            e("div", null,
              e("div", { className: "row gap8" }, e("b", { style: { fontSize: 14 } }, b.agent), b.best ? e("span", { className: "pill terra", style: { fontSize: 9.5, padding: "1px 6px" } }, "Recomendado") : null),
              e("div", { className: "faint", style: { fontSize: 11.5, marginTop: 2 } }, b.city + " · oferta válida hasta " + (b.valid || "28 jun")),
              e("div", { className: "row gap6", style: { marginTop: 7 } }, e(Stars, { n: b.rating }),
                b.fast ? e("span", { className: "pill blue", style: { fontSize: 10 } }, "Más rápido") : null,
                b.cheap ? e("span", { className: "pill amber", style: { fontSize: 10 } }, "Más barato") : null)),
            e("div", { className: "rate-specs" }, spec(b.transit + " d", "tránsito"), spec(fmtN(b.buy) + " €", "compra")),
            e("div", { className: "rate-price" },
              e("button", { className: "btn sm terra", onClick: () => { toast && toast("Adjudicado a " + b.agent + " → expediente creado"); navigate("quote"); } }, "Adjudicar", e(Icon, { name: "arrowR", size: 13 })),
              e("button", { className: "btn sm ghost", style: { marginTop: 6 } }, "Mensaje")))) ));
  }

  /* ===================== 3 · SCORECARD DE PROVEEDORES ===================== */
  const SCORES = [
    { name: "Maersk", type: "Naviera", otp: 94, claims: 0.3, resp: "2 h", score: 4.7, trend: "up" },
    { name: "Hapag-Lloyd", type: "Naviera", otp: 92, claims: 0.4, resp: "3 h", score: 4.6, trend: "up" },
    { name: "CMA CGM", type: "Naviera", otp: 88, claims: 0.6, resp: "5 h", score: 4.3, trend: "flat" },
    { name: "MSC", type: "Naviera", otp: 81, claims: 0.9, resp: "8 h", score: 3.9, trend: "down" },
    { name: "Drayage BCN", type: "Terrestre", otp: 96, claims: 0.1, resp: "1 h", score: 4.8, trend: "up" },
    { name: "Lufthansa Cargo", type: "Aéreo", otp: 90, claims: 0.5, resp: "4 h", score: 4.5, trend: "flat" },
  ];
  function ScorecardScreen({ navigate }) {
    return e("div", { className: "page page-wide screen-enter" },
      head("Red & Partners", "Scorecard de proveedores",
        "Datos objetivos de fiabilidad por carrier y partner. Negocia con hechos, prioriza a quien cumple.", null),
      e("div", { className: "kpi-grid mb20", style: { gridTemplateColumns: "repeat(4,1fr)" } },
        kpi("On-time medio", "90,2", "%", "ponderado por volumen", "clock"),
        kpi("Ratio de reclamaciones", "0,5", "%", "por debajo del sector", "shieldcheck"),
        kpi("Respuesta media", "3,8", "h", "a incidencias", "refresh"),
        kpi("Proveedores activos", "24", null, "evaluados este trimestre", "handshake")),
      e(Section, { title: "Ranking de fiabilidad", icon: "scale", noPad: true, sub: "Actualizado con datos reales de tus expedientes" },
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null, e("th", null, "Proveedor"), e("th", null, "Tipo"), e("th", { className: "r" }, "On-time"), e("th", { className: "r" }, "Reclam."), e("th", { className: "r" }, "Respuesta"), e("th", null, "Valoración"), e("th", null, ""))),
          e("tbody", null, SCORES.map((s, i) =>
            e("tr", { key: i, className: "click" },
              e("td", null, e("b", null, s.name)),
              e("td", null, e("span", { className: "pill neutral" }, s.type)),
              e("td", { className: "r" }, e("div", { className: "row gap8", style: { justifyContent: "flex-end" } },
                e("span", { className: "tnum", style: { width: 38, color: s.otp < 85 ? "var(--red-ink)" : s.otp < 92 ? "var(--amber-ink)" : "var(--green-ink)" } }, s.otp + "%"),
                e("div", { className: "prog", style: { width: 60 } }, e("div", { style: { width: s.otp + "%", background: s.otp < 85 ? "var(--red)" : s.otp < 92 ? "var(--amber)" : "var(--green)" } })))),
              e("td", { className: "r tnum" }, s.claims + "%"),
              e("td", { className: "r tnum faint" }, s.resp),
              e("td", null, e(Stars, { n: s.score })),
              e("td", null, e(Icon, { name: s.trend === "up" ? "arrowUp" : s.trend === "down" ? "arrowDn" : "arrowR", size: 15, style: { color: s.trend === "up" ? "var(--green)" : s.trend === "down" ? "var(--red)" : "var(--ink-4)" } }))))))
    ));
  }

  /* ===================== 4 · DOCUMENTOS DIGITALES (e-BL) ===================== */
  const EDOCS = [
    { type: "eFBL · FIATA", id: "FARO-BCN-260417", exp: "S-2026-04417", state: "verified", issued: "29 may", by: "Faro · sellado" },
    { type: "e-B/L · CMA CGM", id: "CMDU SHA0492215", exp: "S-2026-04417", state: "transferred", issued: "29 may", by: "Endosado a Acme" },
    { type: "e-CMR", id: "CMR-2026-0912", exp: "S-2026-04402", state: "signed", issued: "05 jun", by: "Firma del receptor" },
    { type: "e-AWB", id: "020-77120945", exp: "S-2026-04431", state: "verified", issued: "11 jun", by: "ONE Record" },
  ];
  const EST = { verified: ["green", "Verificado"], transferred: ["blue", "Endosado"], signed: ["terra", "Firmado"] };
  function DigitalDocsScreen({ navigate }) {
    return e("div", { className: "page page-wide screen-enter" },
      head("Red & Partners", "Documentos digitales verificables",
        "e-B/L, e-CMR y FIATA eFBL con sello criptográfico y trazabilidad. Confianza sin papel — el estándar que tus partners exigen.",
        e("button", { className: "btn terra" }, e(Icon, { name: "plus", size: 15 }), "Emitir documento")),
      e("div", { style: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, alignItems: "start" } },
        e(Section, { title: "Documentos electrónicos", icon: "seal", noPad: true },
          e("table", { className: "tbl erp" },
            e("thead", null, e("tr", null, e("th", null, "Tipo"), e("th", null, "Nº"), e("th", null, "Expediente"), e("th", null, "Estado"), e("th", null, "Emitido"))),
            e("tbody", null, EDOCS.map((d, i) => {
              const st = EST[d.state];
              return e("tr", { key: i, className: "click", onClick: () => navigate("expediente", { id: d.exp }) },
                e("td", null, e("b", { style: { fontSize: 12.5 } }, d.type)),
                e("td", null, e("span", { className: "mono", style: { fontSize: 12 } }, d.id)),
                e("td", null, e("span", { className: "mono", style: { color: "var(--terra-deep)", fontWeight: 600 } }, d.exp)),
                e("td", null, e("span", { className: "pill " + st[0] }, st[1])),
                e("td", null, e("div", { style: { fontSize: 12 } }, d.issued), e("div", { className: "faint", style: { fontSize: 11 } }, d.by)));
            })))),
        // verification card
        e("div", { className: "card card-pad", style: { textAlign: "center", borderColor: "var(--green)" } },
          e("div", { style: { width: 50, height: 50, borderRadius: "50%", background: "var(--green-tint)", display: "grid", placeItems: "center", margin: "0 auto 12px" } }, e(Icon, { name: "shieldcheck", size: 26, style: { color: "var(--green-ink)" } })),
          e("div", { className: "t-h3", style: { marginBottom: 4 } }, "Documento verificado"),
          e("div", { className: "faint", style: { fontSize: 12, marginBottom: 14 } }, "FARO-BCN-260417 · eFBL FIATA"),
          // faux QR
          e("div", { className: "qr", style: { margin: "0 auto 14px" } },
            Array.from({ length: 144 }).map((_, i) => e("span", { key: i, style: { background: (i * 37 % 5 < 2 || i % 9 === 0) ? "var(--ink)" : "transparent" } }))),
          e("div", { className: "mono", style: { fontSize: 10.5, color: "var(--ink-3)", wordBreak: "break-all", marginBottom: 12 } }, "sha256:9f2c…a41b · sello FIATA"),
          e("div", { className: "def-grid c2", style: { textAlign: "left", gap: "8px 12px" } },
            defv("Emisor", "Transitos Llevant"), defv("Cadena", "FIATA eFBL"),
            defv("Endosos", "1 · a Acme"), defv("Estado", "Íntegro")))) );
  }

  /* ===================== 5 · COMPLIANCE & SANCIONES ===================== */
  const SCREEN = [
    { name: "Acme Ibérica S.L.", role: "Consignee", country: "ES", result: "clear" },
    { name: "Ningbo Hometex Co.", role: "Shipper", country: "CN", result: "clear" },
    { name: "Sino-Bridge Logistics", role: "Agente", country: "CN", result: "review", note: "Coincidencia parcial de nombre (95 %) — revisar manualmente" },
    { name: "Nordix Components", role: "Cliente", country: "DE", result: "clear" },
    { name: "Mercancía · cortinas textiles", role: "Producto", country: "—", result: "dualuse", note: "No es doble uso · arancel 6303.92 verificado" },
  ];
  const SRES = { clear: ["green", "Limpio", "shieldcheck"], review: ["amber", "Revisar", "alert"], dualuse: ["blue", "Verificado", "check"] };
  function ComplianceScreen({ navigate, toast }) {
    return e("div", { className: "page page-wide screen-enter" },
      head("Red & Partners", "Compliance & sanciones",
        "Cribado automático de listas de sanciones (OFAC, UE, ONU), denied-party y doble uso en cada expediente. Tus partners contratan a quien no les expone a multas.",
        e("button", { className: "btn", onClick: () => toast && toast("Re-cribado completado · 0 alertas nuevas") }, e(Icon, { name: "refresh", size: 14 }), "Re-cribar")),
      e("div", { className: "kpi-grid mb20", style: { gridTemplateColumns: "repeat(4,1fr)" } },
        kpi("Partes cribadas · mes", "1.284", null, "automático en cada alta", "shieldcheck"),
        kpi("Listas sincronizadas", "OFAC · UE · ONU", null, "actualizadas a diario", "globe"),
        kpi("Alertas abiertas", "1", null, "coincidencia parcial", "alert"),
        kpi("Cobertura", "100", "%", "ninguna parte sin cribar", "check")),
      e("div", { className: "card card-pad mb16", style: { borderColor: "var(--amber-line)", background: "var(--amber-tint)", display: "flex", gap: 12, alignItems: "center" } },
        e(Icon, { name: "alert", size: 18, style: { color: "var(--amber-ink)" } }),
        e("div", { className: "grow", style: { fontSize: 12.5, color: "var(--amber-ink)" } }, e("b", null, "1 coincidencia parcial: "), "“Sino-Bridge Logistics” coincide al 95 % con una entrada de vigilancia. Revisa y documenta antes de operar."),
        e("button", { className: "btn sm", style: { background: "#fff" }, onClick: () => toast && toast("Marcado como falso positivo · registrado en Auditoría") }, "Revisar")),
      e(Section, { title: "Resultado del cribado · S-2026-04417", icon: "shield", noPad: true },
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null, e("th", null, "Parte / Ítem"), e("th", null, "Rol"), e("th", null, "País"), e("th", null, "Resultado"), e("th", null, "Detalle"))),
          e("tbody", null, SCREEN.map((s, i) => {
            const r = SRES[s.result];
            return e("tr", { key: i, className: "click" },
              e("td", null, e("b", { style: { fontSize: 12.5 } }, s.name)),
              e("td", null, s.role), e("td", null, e("span", { className: "mono" }, s.country)),
              e("td", null, e("span", { className: "pill " + r[0] }, e(Icon, { name: r[2], size: 11 }), r[1])),
              e("td", { className: "faint", style: { fontSize: 12 } }, s.note || "Sin coincidencias"));
          }))))
    );
  }

  /* ===================== 6 · PARTNER HUB (all 10) ===================== */
  const PARTNER_FEATURES = [
    { i: "handshake", t: "Red global de agentes", d: "132 agentes en 48 países, co-load y expedientes compartidos.", go: "red-agentes", st: ["green", "Activo"] },
    { i: "sparkle", t: "Tender a la red", d: "RFQ a tu red, ofertas comparables en horas, adjudicación en 1 clic.", go: "tender-red", st: ["green", "Activo"] },
    { i: "scale", t: "Scorecard de proveedores", d: "Fiabilidad objetiva por carrier: on-time, reclamaciones, respuesta.", go: "proveedores-scorecard", st: ["green", "Activo"] },
    { i: "seal", t: "Documentos digitales (e-BL)", d: "e-B/L, e-CMR y FIATA eFBL con sello criptográfico verificable.", go: "docs-digitales", st: ["green", "Activo"] },
    { i: "shieldcheck", t: "Compliance & sanciones", d: "Cribado OFAC/UE/ONU, denied-party y doble uso automático.", go: "compliance-screening", st: ["green", "Activo"] },
    { i: "shield", t: "Seguro de mercancía embebido", d: "Cobertura all-risk por expediente con prima al instante.", go: "seguro", st: ["amber", "Demo"] },
    { i: "bank", t: "Liquidación inter-agente", d: "Netting y disbursement automático entre agentes de la red.", go: "liquidacion", st: ["amber", "Demo"] },
    { i: "link", t: "Tracking compartible (white-label)", d: "Enlace público con tu marca para que el cliente final siga su carga.", go: "tracking-publico", st: ["amber", "Demo"] },
    { i: "grid", t: "Marketplace de partners", d: "Directorio de transportistas, almacenes y aduaneros homologados.", go: "marketplace", st: ["amber", "Demo"] },
    { i: "doc", t: "Contratos & SLA", d: "Acuerdos de nivel de servicio y tarifas contractuales por partner.", go: "contratos", st: ["amber", "Demo"] },
  ];
  function PartnersHubScreen({ navigate, toast }) {
    const demo = { seguro: "Prima all-risk calculada: 0,18 % del valor · cobertura inmediata",
      liquidacion: "Netting del mes: 12 agentes · saldo neto 8.420 € · 1 transferencia",
      "tracking-publico": "Enlace público generado: faro.app/t/ACME-04417 (con tu marca)",
      marketplace: "48 partners homologados disponibles en tu zona",
      contratos: "Contrato marco con Maersk · SLA on-time 92 % · vigente" };
    const run = (go) => { if (demo[go]) toast && toast(demo[go]); else navigate(go); };
    return e("div", { className: "page page-wide screen-enter" },
      head("Red & Partners", "Por qué te contratan",
        "Diez capacidades de red, confianza y cumplimiento que convierten a Faro en el partner que todo operador logístico quiere.",
        e("button", { className: "btn terra", onClick: () => navigate("red-agentes") }, e(Icon, { name: "handshake", size: 15 }), "Ver la red")),
      e("div", { className: "partner-grid" },
        PARTNER_FEATURES.map((f, i) =>
          e("div", { key: i, className: "partner-card", onClick: () => run(f.go) },
            e("div", { className: "partner-ic" }, e(Icon, { name: f.i, size: 21 })),
            e("div", { className: "grow" },
              e("div", { className: "partner-t" }, f.t),
              e("div", { className: "partner-d" }, f.d)),
            e("div", { className: "col", style: { alignItems: "flex-end", gap: 8, flex: "none" } },
              e("span", { className: "pill " + f.st[0], style: { fontSize: 10 } }, f.st[1]),
              e(Icon, { name: "arrowR", size: 16, style: { color: "var(--ink-4)" } })))))
    );
  }

  const spec = (v, l) => e("div", { className: "rate-spec" }, e("div", { className: "v" }, v), e("div", { className: "l" }, l));
  const defv = (l, v) => e("div", { className: "field" }, e("div", { className: "field-label" }, l), e("div", { className: "field-val" }, v));

  window.AgentNetworkScreen = AgentNetworkScreen;
  window.TenderScreen = TenderScreen;
  window.ScorecardScreen = ScorecardScreen;
  window.DigitalDocsScreen = DigitalDocsScreen;
  window.ComplianceScreen = ComplianceScreen;
  window.PartnersHubScreen = PartnersHubScreen;
})();
