/* FARO — bespoke modules II: Aduanas, Calidad, Power BI, Tracking, Consultas */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, fmtN, Section, Spark } = UI;
  const e = React.createElement;

  function head(eyebrow, title, sub, actions) {
    return e("div", { className: "page-head" },
      e("div", { className: "grow" }, e("div", { className: "eyebrow" }, eyebrow), e("h1", { className: "t-h1" }, title),
        sub ? e("div", { className: "page-sub" }, sub) : null), actions || null);
  }

  /* ============== ADUANAS · DUA workflow ============== */
  const DUAS = [
    { mrn: "26ES00281100884215", exp: "S-2026-04417", regimen: "Importación / libre práctica", tipo: "DUA", estado: "presentado", sys: "AEAT", desc: "Textiles · 6303.92" },
    { mrn: "26ES00281100884188", exp: "S-2026-04420", regimen: "Importación / libre práctica", tipo: "ENS", estado: "riesgo", sys: "ICS2", desc: "Conservas · descripción insuficiente" },
    { mrn: "26ES00281100883901", exp: "S-2026-04369", regimen: "Exportación definitiva", tipo: "AES", estado: "levante", sys: "AES", desc: "Producto agrícola · 0709" },
    { mrn: "26ES00281100883712", exp: "S-2026-04344", regimen: "Tránsito externo T1", tipo: "NCTS", estado: "transito", sys: "NCTS-P6", desc: "Maquinaria · China → Milán" },
  ];
  const DUA_STATE = {
    presentado: ["amber", "Presentado · esperando levante"],
    riesgo: ["red", "Riesgo de rechazo ICS2"],
    levante: ["green", "Levante concedido"],
    transito: ["blue", "En tránsito T1"],
  };
  const SYSTEMS = [
    { k: "AEAT · DUA", s: "Conectado", ok: true }, { k: "ICS2 · R3 (ENS)", s: "Conectado", ok: true },
    { k: "NCTS · Phase 6", s: "Conectado", ok: true }, { k: "AES · Exportación", s: "Conectado", ok: true },
    { k: "EORI / censo OEA", s: "Validado", ok: true },
  ];
  function AduanasScreen({ navigate }) {
    return e("div", { className: "page page-wide screen-enter" },
      head("Aduanas · Compliance", "Declaraciones aduaneras",
        "DUA · ICS2 · NCTS-P6 · AES — conectividad simulada en la demo (el foso real es la Fase 3)",
        e("button", { className: "btn terra" }, e(Icon, { name: "plus", size: 15 }), "Nueva declaración")),
      e("div", { className: "card card-pad mb20", style: { display: "flex", gap: 8, flexWrap: "wrap" } },
        SYSTEMS.map((sy, i) =>
          e("div", { key: i, className: "row gap8", style: { padding: "7px 12px", border: "1px solid var(--line)", borderRadius: "var(--r)", background: "var(--surface-2)" } },
            e("span", { className: "sdot " + (sy.ok ? "green" : "red") }), e("b", { style: { fontSize: 12 } }, sy.k),
            e("span", { className: "faint", style: { fontSize: 11 } }, "· " + sy.s)))),
      e("div", { className: "card", style: { overflow: "hidden" } },
        e("div", { className: "card-head" }, e(Icon, { name: "customs", size: 16, style: { color: "var(--ink-3)" } }), e("h3", { className: "t-h3 grow" }, "Declaraciones en curso")),
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null, e("th", null, "MRN"), e("th", null, "Tipo"), e("th", null, "Expediente"), e("th", null, "Régimen"), e("th", null, "Mercancía"), e("th", null, "Estado"))),
          e("tbody", null, DUAS.map((d, i) => {
            const st = DUA_STATE[d.estado];
            return e("tr", { key: i, className: "click", onClick: () => navigate("expediente", { id: d.exp }) },
              e("td", null, e("span", { className: "mono", style: { fontSize: 11.5, fontWeight: 600 } }, d.mrn)),
              e("td", null, e("span", { className: "pill neutral" }, d.tipo)),
              e("td", null, e("span", { className: "mono", style: { color: "var(--terra-deep)", fontWeight: 600 } }, d.exp)),
              e("td", null, d.regimen),
              e("td", { className: "faint" }, d.desc),
              e("td", null, e("span", { className: "pill " + st[0] }, st[1])));
          }))),
        e("div", { style: { padding: "11px 16px", background: "var(--red-tint)", borderTop: "1px solid var(--line-2)", display: "flex", gap: 10, alignItems: "center" } },
          e(Icon, { name: "alert", size: 16, style: { color: "var(--red-ink)" } }),
          e("div", { style: { fontSize: 12, color: "var(--red-ink)" } }, e("b", null, "ICS2 stop-words: "), "la ENS de S-2026-04420 contiene una descripción genérica que el análisis de riesgo puede rechazar. Corrige antes de presentar."),
          e("button", { className: "btn sm right", style: { background: "#fff" } }, "Revisar ENS")))
    );
  }

  /* ============== CALIDAD · incidencias ============== */
  const INCID = [
    { id: "INC-0421", tipo: "Demurrage", sev: "red", exp: "S-2026-04388", desc: "3 días de demurrage no repercutidos al cliente", sla: "Vence en 6 h", owner: "MR" },
    { id: "INC-0420", tipo: "No conformidad", sev: "amber", exp: "S-2026-04417", desc: "THC destino omitido en factura de venta", sla: "Vence en 1 d", owner: "JS" },
    { id: "INC-0418", tipo: "Documental", sev: "amber", exp: "S-2026-04420", desc: "Discrepancia descripción MBL vs HBL", sla: "Vence en 2 d", owner: "LF" },
    { id: "INC-0415", tipo: "Reclamación", sev: "blue", exp: "S-2026-04361", desc: "Cliente reclama retraso de 2 días en entrega", sla: "En plazo", owner: "MR" },
    { id: "INC-0410", tipo: "Resuelta", sev: "green", exp: "S-2026-04330", desc: "Avería contenedor reefer · gestionada con naviera", sla: "Cerrada", owner: "LF" },
  ];
  const SEV_P = { red: ["red", "Crítica"], amber: ["amber", "Alta"], blue: ["blue", "Media"], green: ["green", "Resuelta"] };
  function CalidadScreen({ navigate }) {
    const open = INCID.filter((i) => i.sev !== "green").length;
    return e("div", { className: "page page-wide screen-enter" },
      head("Calidad", "Incidencias y no conformidades",
        "Disciplina de margen y servicio · cada incidencia ligada a su expediente",
        e("button", { className: "btn terra" }, e(Icon, { name: "plus", size: 15 }), "Nueva incidencia")),
      e("div", { className: "row gap16 mb20 wrap" },
        kpiBox("Abiertas", open, "alert", "amber"), kpiBox("Críticas", 1, "flag", "red"),
        kpiBox("OTIF (mes)", "94,2 %", "checkCircle", "green"), kpiBox("SLA cumplido", "97 %", "clock", "ink")),
      e("div", { className: "card", style: { overflow: "hidden" } },
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null, e("th", null, "Nº"), e("th", null, "Tipo"), e("th", null, "Severidad"), e("th", null, "Expediente"), e("th", null, "Descripción"), e("th", null, "SLA"), e("th", null, "Resp."))),
          e("tbody", null, INCID.map((it, i) => {
            const sp = SEV_P[it.sev];
            return e("tr", { key: i, className: "click", onClick: () => navigate("expediente", { id: it.exp }) },
              e("td", null, e("span", { className: "mono", style: { fontWeight: 600 } }, it.id)),
              e("td", null, it.tipo),
              e("td", null, e("span", { className: "pill " + sp[0] }, sp[1])),
              e("td", null, e("span", { className: "mono", style: { color: "var(--terra-deep)", fontWeight: 600 } }, it.exp)),
              e("td", { className: "faint" }, it.desc),
              e("td", null, e("span", { style: { fontSize: 12, fontWeight: 600, color: it.sla.includes("6 h") ? "var(--red-ink)" : "var(--ink-2)" } }, it.sla)),
              e("td", null, e("span", { className: "avatar", style: { width: 24, height: 24, fontSize: 9.5 } }, it.owner)));
          }))))
    );
  }

  /* ============== POWER BI ============== */
  const LANES = [
    { l: "CN → ES", gp: 64, teu: 412 }, { l: "VN → ES", gp: 42, teu: 388 }, { l: "DE → MX", gp: 38, teu: 0 },
    { l: "ES → BR", gp: 31, teu: 366 }, { l: "IT → ES", gp: 22, teu: 0 }, { l: "CN → ES (rail)", gp: 18, teu: 290 },
  ];
  function Donut({ data }) {
    const total = data.reduce((s, d) => s + d.v, 0);
    let acc = 0; const R = 54, C = 2 * Math.PI * R;
    return e("div", { className: "row gap20", style: { alignItems: "center" } },
      e("svg", { width: 140, height: 140, viewBox: "0 0 140 140" },
        e("circle", { cx: 70, cy: 70, r: R, fill: "none", stroke: "var(--surface-3)", strokeWidth: 16 }),
        data.map((d, i) => {
          const frac = d.v / total; const dash = frac * C; const off = -acc * C; acc += frac;
          return e("circle", { key: i, cx: 70, cy: 70, r: R, fill: "none", stroke: d.c, strokeWidth: 16,
            strokeDasharray: dash + " " + (C - dash), strokeDashoffset: off, transform: "rotate(-90 70 70)" });
        }),
        e("text", { x: 70, y: 66, textAnchor: "middle", fontSize: 11, fill: "var(--ink-3)" }, "Fuga total"),
        e("text", { x: 70, y: 84, textAnchor: "middle", fontSize: 17, fontWeight: 700, fill: "var(--ink)", fontFamily: "var(--mono)" }, "11,8k€")),
      e("div", { className: "col" }, data.map((d, i) =>
        e("div", { key: i, className: "legend-row" }, e("span", { className: "legend-dot", style: { background: d.c } }), e("span", { className: "grow" }, d.l), e("span", { className: "mono", style: { fontWeight: 600 } }, fmtEur(d.amount))))));
  }
  function BIScreen({ navigate }) {
    const D = window.FARO;
    const maxGp = Math.max(...LANES.map((l) => l.gp));
    return e("div", { className: "page page-wide screen-enter" },
      head("Power BI · Cuadros de mando", "Analítica de negocio",
        "BI nativo sobre la base de datos única — sin exports a Excel, sin silos",
        e("div", { className: "row gap8" }, e("select", { className: "erp-select" }, e("option", null, "Junio 2026"), e("option", null, "Q2 2026"), e("option", null, "2026 YTD")),
          e("button", { className: "btn primary" }, e(Icon, { name: "download", size: 14 }), "Exportar"))),
      e("div", { className: "kpi-grid mb20", style: { gridTemplateColumns: "repeat(4,1fr)" } }, D.kpis.map((k, i) => e(UI.Kpi, { key: i, k }))),
      e("div", { style: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start", marginBottom: 18 } },
        e(Section, { title: "Gross profit por lane (miles €)", icon: "grid", sub: "Identifica los corredores más rentables" },
          e("div", { className: "bars" }, LANES.map((l, i) =>
            e("div", { key: i, className: "bar-col" },
              e("span", { className: "mono", style: { fontSize: 11, fontWeight: 600 } }, l.gp),
              e("div", { className: "bar" + (i % 2 ? " alt" : ""), style: { height: (l.gp / maxGp * 100) + "%" } }),
              e("span", { className: "bar-lbl" }, l.l))))),
        e(Section, { title: "Composición de la fuga de margen", icon: "shield" },
          e(Donut, { data: [
            { l: "Accesorios sin facturar", amount: 6240, v: 53, c: "var(--terra)" },
            { l: "Desvío accrual/factura", amount: 3110, v: 26, c: "var(--ink)" },
            { l: "Demurrage", amount: 1480, v: 13, c: "var(--amber)" },
            { l: "Diferencias de cambio", amount: 920, v: 8, c: "var(--ink-4)" },
          ] }))),
      e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" } },
        e(Section, { title: "Tendencia de fuga recuperada (12 sem.)", icon: "coins" },
          e("div", { className: "row", style: { alignItems: "flex-end", gap: 16 } },
            e("div", null, e("div", { className: "num", style: { fontSize: 24, fontWeight: 650 } }, "11,8 ", e("span", { className: "faint", style: { fontSize: 14 } }, "k€")),
              e("div", { className: "faint", style: { fontSize: 12 } }, "recuperado este mes")),
            e("div", { className: "grow", style: { display: "flex", justifyContent: "flex-end" } }, e(Spark, { data: D.gpTrend, color: "var(--green)", w: 320, h: 70, fill: true })))),
        e(Section, { title: "Productividad por operativo", icon: "users" },
          e("div", { className: "col gap12" }, [
            { n: "Marta Ruiz", v: 48, max: 50 }, { n: "Jordi Soler", v: 31, max: 50 }, { n: "Luis Fdez.", v: 39, max: 50 }, { n: "Faro IA (asistidos)", v: 50, max: 50, ai: true },
          ].map((p, i) =>
            e("div", { key: i }, e("div", { className: "row", style: { fontSize: 12.5, marginBottom: 4 } },
              e("span", { className: "grow" }, p.n), e("span", { className: "mono", style: { fontWeight: 600 } }, p.v + " exp./día")),
              e("div", { className: "prog" }, e("div", { style: { width: (p.v / p.max * 100) + "%", background: p.ai ? "var(--amber)" : "var(--terra)" } })))))))
    );
  }

  /* ============== TRACKING (ShipsGo) ============== */
  function TrackingScreen({ navigate }) {
    const sh = window.FARO.hero;
    const evs = sh.events;
    const doneCount = evs.filter((x) => x.cls === "ACT").length;
    return e("div", { className: "page page-wide screen-enter" },
      head("ShipsGo · Tracking", "Seguimiento en tiempo real",
        "Eventos DCSA vía API (Vizion / project44) — interoperable desde el día uno", null),
      e("div", { style: { marginBottom: 18 } }, e(window.WorldMap, { navigate })),
      e("div", { className: "card", style: { overflow: "hidden", marginBottom: 18 } },
        e("div", { style: { padding: "26px 28px", background: "linear-gradient(180deg,var(--surface-2),var(--surface))", position: "relative" } },
          e("div", { className: "row", style: { marginBottom: 22 } },
            e("span", { className: "mono", style: { fontWeight: 700, fontSize: 15 } }, sh.id),
            e("span", { className: "faint right", style: { fontSize: 12 } }, sh.carrier + " · " + sh.vessel)),
          // route line with nodes
          e("div", { style: { display: "flex", alignItems: "center", padding: "0 8px" } },
            evs.map((ev, i) => {
              const act = ev.cls === "ACT";
              return e(React.Fragment, { key: i },
                e("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 1 } },
                  e("div", { style: { width: 16, height: 16, borderRadius: "50%", background: act ? "var(--green)" : ev.cls === "EST" ? "var(--surface)" : "var(--surface)", border: "2px solid " + (act ? "var(--green)" : ev.cls === "EST" ? "var(--amber)" : "var(--line-strong)") } }),
                  e("div", { style: { textAlign: "center" } },
                    e("div", { className: "mono", style: { fontSize: 10.5, fontWeight: 600 } }, ev.code),
                    e("div", { className: "faint", style: { fontSize: 10 } }, ev.loc))),
                i < evs.length - 1 ? e("div", { style: { flex: 1, height: 3, margin: "0 4px", marginBottom: 28, background: act && evs[i + 1].cls === "ACT" ? "var(--green)" : "var(--line)" } }) : null);
            })),
          e("div", { className: "row gap8", style: { marginTop: 20 } },
            e("span", { className: "pill green" }, e(Icon, { name: "ship", size: 12 }), "En tránsito"),
            e("span", { className: "pill neutral" }, doneCount + " de " + evs.length + " hitos confirmados"),
            e("span", { className: "pill amber" }, "ETA " + sh.eta),
            e("button", { className: "btn sm right", onClick: () => navigate("expediente", { id: sh.id }) }, "Abrir expediente →")))),
      e(Section, { title: "Flota en seguimiento", icon: "pin", noPad: true },
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null, e("th", null, "Expediente"), e("th", null, "Contenedor"), e("th", null, "Último evento"), e("th", null, "Ubicación"), e("th", null, "ETA"))),
          e("tbody", null, [
            ["S-2026-04417", "TCLU 784512-3", "DEPA · salida Shanghái", "Mar de China", "02 jul"],
            ["S-2026-04388", "MRKU 229301-7", "DISC · descargado", "Barcelona", "—"],
            ["S-2026-04344", "—", "GTIN · gate-in", "Barcelona", "20 jun"],
          ].map((r, i) => e("tr", { key: i, className: "click", onClick: () => navigate("expediente", { id: r[0] }) },
            e("td", null, e("span", { className: "mono", style: { color: "var(--terra-deep)", fontWeight: 600 } }, r[0])),
            e("td", { className: "mono", style: { fontSize: 12 } }, r[1]), e("td", null, r[2]), e("td", { className: "faint" }, r[3]), e("td", { className: "mono", style: { fontSize: 12 } }, r[4]))))))
    );
  }

  /* ============== CONSULTAS ============== */
  function ConsultasScreen({ navigate }) {
    return e("div", { className: "page page-wide screen-enter" },
      head("Consultas", "Buscador de expedientes", "Consulta libre sobre la base de datos única", null),
      e("div", { className: "card card-pad mb16", style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 } },
        ["Cliente", "Ruta (POL → POD)", "Modo", "Estado", "Naviera", "Rango de fechas", "Margen", "Incoterm"].map((f, i) =>
          e("div", { key: i, className: "field" }, e("div", { className: "field-label" }, f),
            e("div", { style: { border: "1px solid var(--line)", borderRadius: "var(--r-sm)", padding: "7px 10px", background: "var(--surface-2)", color: "var(--ink-4)", fontSize: 12.5 } }, "Cualquiera")))),
      e("div", { className: "row gap8 mb16" }, e("button", { className: "btn terra" }, e(Icon, { name: "search", size: 14 }), "Ejecutar consulta"), e("button", { className: "btn ghost" }, "Guardar consulta"), e("span", { className: "right faint", style: { fontSize: 12 } }, "5 resultados")),
      e(window.DataModule, { navigate, cfg: window.FARO_MOD.GRID["lis-margenes"] }));
  }

  function kpiBox(label, val, icon, color) {
    return e("div", { className: "kpi", style: { flex: 1, minWidth: 170 } },
      e("div", { className: "kpi-top" }, e("span", { className: "kpi-label" }, label), e("span", { className: "kpi-icon", style: { color: "var(--" + color + (color === "ink" ? "-2" : "-ink") + ")" } }, e(Icon, { name: icon, size: 15 }))),
      e("div", { className: "kpi-val num", style: { color: color === "ink" ? "var(--ink)" : "var(--" + color + "-ink)" } }, val));
  }

  window.AduanasScreen = AduanasScreen;
  window.CalidadScreen = CalidadScreen;
  window.BIScreen = BIScreen;
  window.TrackingScreen = TrackingScreen;
  window.ConsultasScreen = ConsultasScreen;
})();
