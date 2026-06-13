/* FARO — bespoke modules I: Comercial (CRM), Contabilidad, Sistema */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, Section, Tier } = UI;
  const e = React.createElement;

  function Tabs({ tabs, tab, set }) {
    return e("div", { className: "row gap6 mb20", style: { borderBottom: "1px solid var(--line)" } },
      tabs.map((t) =>
        e("button", { key: t.id, onClick: () => set(t.id),
          style: { background: "none", border: "none", cursor: "pointer", padding: "9px 4px", marginRight: 18,
            fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600,
            color: tab === t.id ? "var(--ink)" : "var(--ink-3)",
            borderBottom: "2px solid " + (tab === t.id ? "var(--terra)" : "transparent"), marginBottom: -1 } },
          t.label)));
  }
  function head(eyebrow, title, sub, actions) {
    return e("div", { className: "page-head" },
      e("div", { className: "grow" }, e("div", { className: "eyebrow" }, eyebrow), e("h1", { className: "t-h1" }, title),
        sub ? e("div", { className: "page-sub" }, sub) : null),
      actions || null);
  }

  /* ============== COMERCIAL · CRM PIPELINE ============== */
  const STAGES = [
    { id: "lead", label: "Lead", dot: "ink" },
    { id: "qual", label: "Cualificado", dot: "blue" },
    { id: "quote", label: "Cotizado", dot: "amber" },
    { id: "nego", label: "Negociación", dot: "terra" },
    { id: "won", label: "Ganado", dot: "green" },
  ];
  const OPPS = {
    lead: [{ c: "Mediterránea Foods", r: "CNSHA → ESVLC", v: 28000, o: "JS", p: 20 }, { c: "Ibérica Textil", r: "INMAA → ESBCN", v: 15400, o: "MR", p: 15 }],
    qual: [{ c: "Cerámicas Levante", r: "ESVLC → USNYC", v: 42000, o: "JS", p: 40 }, { c: "BioPharma SL", r: "DEFRA → ESMAD", v: 9800, o: "MR", p: 35 }],
    quote: [{ c: "Nordix Components", r: "DEFRA → MXMEX", v: 53600, o: "MR", p: 55, hot: true }, { c: "Sol Naciente", r: "JPTYO → ESBCN", v: 31200, o: "JS", p: 50 }],
    nego: [{ c: "Acme Ibérica", r: "CNSHA → ESBCN", v: 86000, o: "MR", p: 75, hot: true }],
    won: [{ c: "Lumo Retail", r: "VNSGN → ESBCN", v: 74000, o: "JS", p: 100 }, { c: "Verde Agro", r: "ESVLC → BRSSZ", v: 38000, o: "MR", p: 100 }],
  };
  function ComercialScreen({ navigate }) {
    const totalPipe = Object.values(OPPS).flat().reduce((s, o) => s + o.v, 0);
    const weighted = Object.values(OPPS).flat().reduce((s, o) => s + o.v * o.p / 100, 0);
    return e("div", { className: "page page-wide screen-enter" },
      head("Comercial · CRM", "Pipeline de oportunidades",
        "Nativo al expediente — el quote ganado se convierte en shipment sin re-tecleo",
        e("button", { className: "btn terra" }, e(Icon, { name: "plus", size: 15 }), "Nueva oportunidad")),
      e("div", { className: "row gap16 mb20 wrap" },
        miniKpi("Pipeline total", fmtEur(totalPipe), "coins"),
        miniKpi("Ponderado por probabilidad", fmtEur(Math.round(weighted)), "percent"),
        miniKpi("Win rate (90 d)", "34 %", "shield"),
        miniKpi("Ciclo medio", "18 días", "clock")),
      e("div", { className: "kan" },
        STAGES.map((st) => {
          const items = OPPS[st.id] || [];
          const sum = items.reduce((s, o) => s + o.v, 0);
          return e("div", { key: st.id, className: "kan-col" },
            e("div", { className: "kan-head" },
              e("span", { className: "sdot " + st.dot }), e("b", { style: { fontSize: 12.5 } }, st.label),
              e("span", { className: "c" }, items.length)),
            e("div", { className: "kan-body" },
              e("div", { className: "faint", style: { fontSize: 11, fontWeight: 600, marginBottom: 2 } }, fmtEur(sum)),
              items.map((o, i) =>
                e("div", { key: i, className: "kan-card", onClick: () => navigate("quote") },
                  e("div", { className: "row" }, e("b", { className: "kan-name grow", style: { fontSize: 12.5 } }, o.c),
                    o.hot ? e("span", { className: "pill terra", style: { fontSize: 9.5, padding: "1px 6px", flex: "none" } }, e(Icon, { name: "bolt", size: 10 }), "hot") : null),
                  e("div", { className: "mono faint", style: { fontSize: 11, margin: "5px 0 8px" } }, o.r),
                  e("div", { className: "row" },
                    e("span", { className: "kan-amt", style: { fontSize: 13 } }, fmtEur(o.v)),
                    e("span", { className: "right row gap6" },
                      e("span", { className: "prog", style: { width: 42 } }, e("div", { style: { width: o.p + "%", background: "var(--terra)" } })),
                      e("span", { className: "avatar", style: { width: 22, height: 22, fontSize: 9.5 } }, o.o))))) ));
        }))
    );
  }

  /* ============== CONTABILIDAD ============== */
  const ASIENTOS = [
    { n: "A-2026-0912", fecha: "03 jun", desc: "Factura venta FV-2026-1182 · Acme", cuenta: "430000", debe: 5233, haber: 0 },
    { n: "A-2026-0912", fecha: "03 jun", desc: "Ingreso por servicios", cuenta: "705000", debe: 0, haber: 4325 },
    { n: "A-2026-0912", fecha: "03 jun", desc: "IVA repercutido 21%", cuenta: "477000", debe: 0, haber: 908 },
    { n: "A-2026-0908", fecha: "02 jun", desc: "Accrual coste CMA CGM · S-04417", cuenta: "600000", debe: 4001, haber: 0 },
    { n: "A-2026-0908", fecha: "02 jun", desc: "Provisión proveedor", cuenta: "400000", debe: 0, haber: 4001 },
    { n: "A-2026-0915", fecha: "12 jun", desc: "Reverso accrual / factura real (WIP +79)", cuenta: "600000", debe: 79, haber: 0 },
  ];
  function ContabilidadScreen({ navigate }) {
    const [tab, setTab] = React.useState("asientos");
    return e("div", { className: "page page-wide screen-enter" },
      head("Contabilidad", "Contabilidad",
        "El doble vínculo operativo-contable: cada charge line acaba en un asiento",
        e("div", { className: "row gap8" }, e("button", { className: "btn" }, e(Icon, { name: "download", size: 14 }), "Libro diario"),
          e("button", { className: "btn terra", onClick: () => setTab("cierre") }, e(Icon, { name: "refresh", size: 14 }), "Cierre mensual"))),
      e(Tabs, { tab, set: setTab, tabs: [{ id: "asientos", label: "Asientos" }, { id: "cierre", label: "Cierre mensual" }, { id: "tesoreria", label: "Tesorería" }] }),
      tab === "asientos" ? e("div", { className: "card", style: { overflow: "hidden" } },
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null, e("th", null, "Asiento"), e("th", null, "Fecha"), e("th", null, "Descripción"), e("th", null, "Cuenta"), e("th", { className: "r" }, "Debe"), e("th", { className: "r" }, "Haber"))),
          e("tbody", null, ASIENTOS.map((a, i) =>
            e("tr", { key: i, className: "click" },
              e("td", null, e("span", { className: "mono", style: { fontWeight: 600 } }, a.n)),
              e("td", { className: "mono", style: { fontSize: 12 } }, a.fecha),
              e("td", null, a.desc),
              e("td", null, e("span", { className: "tl-code" }, a.cuenta)),
              e("td", { className: "r tnum" }, a.debe ? fmtEur(a.debe) : "—"),
              e("td", { className: "r tnum" }, a.haber ? fmtEur(a.haber) : "—"))))))
        : tab === "cierre" ? CierreView() : TesoreriaView()
    );
  }
  function CierreView() {
    const rows = [
      { l: "Asientos cuadrados", v: "1.284 / 1.284", ok: true },
      { l: "Accruals pendientes de reversar", v: "12 · 3.110 €", ok: false },
      { l: "Facturas de compra sin conciliar", v: "3", ok: false },
      { l: "Diferencias de cambio (FX) no realizadas", v: "−420 €", ok: false },
      { l: "IVA cuadrado con modelo 303", v: "Sí", ok: true },
    ];
    return e("div", { style: { display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, alignItems: "start" } },
      e(Section, { title: "Checklist de cierre · Junio 2026", icon: "checkCircle" },
        e("div", { className: "col gap8" }, rows.map((r, i) =>
          e("div", { key: i, className: "row", style: { padding: "9px 0", borderBottom: "1px solid var(--line-2)", fontSize: 13 } },
            e("span", { className: "proc-ic " + (r.ok ? "done" : "run"), style: { width: 20, height: 20 } }, e(Icon, { name: r.ok ? "check" : "alert", size: 12 })),
            e("span", { className: "grow", style: { marginLeft: 4 } }, r.l),
            e("span", { className: "mono", style: { fontWeight: 600, color: r.ok ? "var(--green-ink)" : "var(--amber-ink)" } }, r.v)))),
        e("button", { className: "btn primary mt16", style: { width: "100%", justifyContent: "center" } }, "Ejecutar cierre del período")),
      e("div", { className: "card card-pad", style: { borderColor: "var(--amber-line)" } },
        e("div", { className: "row mb12" }, e(Icon, { name: "refresh", size: 16, style: { color: "var(--amber-ink)" } }), e("h3", { className: "t-h3 grow" }, "WIP · Work in progress")),
        e("div", { className: "num", style: { fontSize: 26, fontWeight: 650, color: "var(--amber-ink)" } }, "+3.530 €"),
        e("p", { className: "muted", style: { fontSize: 12.5 } }, "Diferencia agregada accrual-vs-factura aún sin reversar. Se reconoce contra el resultado del período al cerrar — erosiona el margen reportado si no se vigila."),
        e("button", { className: "btn mt8", style: { width: "100%", justifyContent: "center" } }, "Ver detalle por expediente")));
  }
  function TesoreriaView() {
    const items = [{ l: "Saldo bancario", v: 142800, c: "ink" }, { l: "Cobros pendientes (DSO 47 d)", v: 92410, c: "green-ink" }, { l: "Pagos pendientes", v: 64120, c: "red-ink" }, { l: "Posición neta", v: 78690, c: "ink" }];
    return e("div", { className: "row gap16 wrap" }, items.map((it, i) =>
      e("div", { key: i, className: "kpi", style: { flex: 1, minWidth: 200 } },
        e("span", { className: "kpi-label" }, it.l),
        e("div", { className: "kpi-val num", style: { color: "var(--" + it.c + ")" } }, fmtEur(it.v)))));
  }

  /* ============== SISTEMA ============== */
  const USERS = [
    { n: "Marta Ruiz", ini: "MR", rol: "Operativa marítimo import", suc: "Barcelona", est: "green", last: "ahora" },
    { n: "Jordi Soler", ini: "JS", rol: "Comercial", suc: "Barcelona", est: "green", last: "hace 12 min" },
    { n: "Ana Belmonte", ini: "AB", rol: "Controller / CFO", suc: "Madrid", est: "green", last: "hace 1 h" },
    { n: "Luis Fdez.", ini: "LF", rol: "Rep. aduanero", suc: "Valencia", est: "amber", last: "hace 3 d" },
    { n: "Faro IA", ini: "IA", rol: "Agente · escritura validada", suc: "Sistema", est: "green", last: "ahora", bot: true },
  ];
  const PERMS = ["Expedientes", "Cargos / márgenes", "Facturación", "Contabilidad", "Aduanas", "Sistema"];
  const ROLES = [
    { r: "Operativo", v: [1, 0, 0, 0, 1, 0] },
    { r: "Comercial", v: [1, 1, 0, 0, 0, 0] },
    { r: "Controller / CFO", v: [1, 1, 1, 1, 0, 0] },
    { r: "Rep. aduanero", v: [1, 0, 0, 0, 1, 0] },
    { r: "Administrador", v: [1, 1, 1, 1, 1, 1] },
  ];
  function SistemaScreen({ navigate }) {
    const [tab, setTab] = React.useState("usuarios");
    return e("div", { className: "page page-wide screen-enter" },
      head("Sistema", "Sistema",
        "RBAC · multiempresa · auditoría · Row-Level Security por tenant",
        e("button", { className: "btn terra" }, e(Icon, { name: "plus", size: 15 }), "Nuevo usuario")),
      e(Tabs, { tab, set: setTab, tabs: [{ id: "usuarios", label: "Usuarios" }, { id: "roles", label: "Roles y permisos" }, { id: "empresas", label: "Empresas" }] }),
      tab === "usuarios"
        ? e("div", { className: "card", style: { overflow: "hidden" } },
            e("table", { className: "tbl erp" },
              e("thead", null, e("tr", null, e("th", null, "Usuario"), e("th", null, "Rol"), e("th", null, "Sucursal"), e("th", null, "Estado"), e("th", { className: "r" }, "Última actividad"))),
              e("tbody", null, USERS.map((u, i) =>
                e("tr", { key: i, className: "click" },
                  e("td", null, e("div", { className: "row gap8" },
                    e("span", { className: "avatar", style: { width: 26, height: 26, fontSize: 10, background: u.bot ? "var(--amber-tint)" : "var(--surface-3)", color: u.bot ? "var(--amber-ink)" : "var(--ink)" } }, u.ini),
                    e("b", null, u.n))),
                  e("td", null, u.rol),
                  e("td", null, u.suc),
                  e("td", null, e("span", { className: "pill " + (u.est === "green" ? "green" : "amber") }, u.est === "green" ? "Activo" : "Inactivo")),
                  e("td", { className: "r faint", style: { fontSize: 12 } }, u.last))))))
        : tab === "roles"
        ? e(Section, { title: "Matriz de permisos (RBAC)", icon: "shield", noPad: true },
            e("table", { className: "tbl" },
              e("thead", null, e("tr", null, e("th", null, "Rol"), PERMS.map((p) => e("th", { key: p, style: { textAlign: "center" } }, p)))),
              e("tbody", null, ROLES.map((r, i) =>
                e("tr", { key: i }, e("td", { style: { fontWeight: 600 } }, r.r),
                  r.v.map((on, j) => e("td", { key: j, style: { textAlign: "center" } },
                    on ? e(Icon, { name: "check", size: 15, style: { color: "var(--green)" } }) : e("span", { className: "faint" }, "—"))))))))
        : e("div", { className: "row gap16 wrap" },
            [{ n: "Transitos Llevant S.L.", c: "Barcelona · matriz", nif: "ESB66012345" }, { n: "Llevant Aduanas S.L.", c: "Valencia · rep. aduanero", nif: "ESB66099112" }].map((co, i) =>
              e("div", { key: i, className: "card card-pad", style: { flex: 1, minWidth: 280 } },
                e("div", { className: "row gap10 mb12" }, e("div", { className: "org-logo", style: { width: 34, height: 34 } }, "TL"), e("div", null, e("b", null, co.n), e("div", { className: "faint", style: { fontSize: 11.5 } }, co.c))),
                e("div", { className: "field-label" }, "CIF"), e("div", { className: "mono", style: { fontWeight: 600 } }, co.nif))))
    );
  }

  function miniKpi(label, val, icon) {
    return e("div", { className: "kpi", style: { flex: 1, minWidth: 180 } },
      e("div", { className: "kpi-top" }, e("span", { className: "kpi-label" }, label), e("span", { className: "kpi-icon" }, e(Icon, { name: icon, size: 15 }))),
      e("div", { className: "kpi-val num" }, val));
  }

  window.ComercialScreen = ComercialScreen;
  window.ContabilidadScreen = ContabilidadScreen;
  window.SistemaScreen = SistemaScreen;
})();
