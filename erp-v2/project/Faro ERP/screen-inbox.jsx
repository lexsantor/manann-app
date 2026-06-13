/* FARO — Bandeja de excepciones (the operator's home) */
(function () {
  const { Icon, UI } = window;
  const { fmtEur } = UI;
  const e = React.createElement;

  const KIND_ICO = {
    demurrage: "clock", uninvoiced: "money", variance: "refresh",
    doc: "doc", customs: "customs", fx: "percent", quote: "quote",
  };
  const SEV_LABEL = { red: "Crítico", amber: "Atención", blue: "Seguimiento" };

  function InboxScreen({ navigate, toast }) {
    const D = window.FARO;
    const [filter, setFilter] = React.useState("all");
    const [done, setDone] = React.useState({});
    const [savedView, setSavedView] = React.useState("all");
    const [snoozed, setSnoozed] = React.useState({});
    const [snoozeFor, setSnoozeFor] = React.useState(null);

    const all = D.exceptions;
    const counts = {
      all: all.length,
      red: all.filter((x) => x.sev === "red").length,
      amber: all.filter((x) => x.sev === "amber").length,
      blue: all.filter((x) => x.sev === "blue").length,
    };
    const VIEWS = window.FARO_PROD.savedViews.inbox;
    const byView = (x) => {
      if (savedView === "money") return x.risk != null;
      if (savedView === "mine") return ["x1", "x2", "x3", "x4"].includes(x.id);
      if (savedView === "today") return ["x1", "x2"].includes(x.id);
      return true;
    };
    const list = all.filter((x) => (filter === "all" || x.sev === filter) && byView(x) && !snoozed[x.id]);
    const totalRisk = all.reduce((s, x) => s + (x.risk || 0), 0);
    const criticalRisk = all.filter((x) => x.sev === "red").reduce((s, x) => s + (x.risk || 0), 0);

    const open = (x) => {
      if (x.ref.startsWith("COT")) navigate("quote");
      else navigate("expediente", { id: x.ref });
    };

    return e("div", { className: "page screen-enter" },
      // head
      e("div", { className: "page-head" },
        e("div", { className: "grow" },
          e("div", { className: "eyebrow" }, "Bandeja de excepciones"),
          e("h1", { className: "t-h1" }, "Lo que necesita tu atención hoy"),
          e("div", { className: "page-sub" },
            "Gestión por excepciones — no una lista de 200 expedientes, solo los ", all.length, " que pueden costarte margen.")
        ),
        e("div", { className: "row gap8" },
          e("button", { className: "btn", onClick: () => navigate("shipments") },
            e(Icon, { name: "files" }), "Ver todos los expedientes"),
          e("button", { className: "btn terra", onClick: () => navigate("ingest") },
            e(Icon, { name: "sparkle" }), "Ingesta IA")
        )
      ),

      // risk banner
      e("div", { className: "card", style: { padding: 0, marginBottom: 18, overflow: "hidden" } },
        e("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr" } },
          e("div", { style: { padding: "16px 20px", borderRight: "1px solid var(--line-2)", background: "linear-gradient(180deg,var(--terra-tint2),transparent)" } },
            e("div", { className: "eyebrow", style: { color: "var(--terra-deep)" } }, "Margen total en riesgo"),
            e("div", { className: "num", style: { fontSize: 32, fontWeight: 650, letterSpacing: "-.03em", marginTop: 4, color: "var(--ink)" } }, fmtEur(totalRisk)),
            e("div", { className: "faint", style: { fontSize: 12, marginTop: 2 } },
              "Sobre un neto del 3 %, recuperarlo equivale a ",
              e("b", { style: { color: "var(--green-ink)" } }, "+33 % de beneficio"), ".")
          ),
          stat("Crítico · pérdida en curso", fmtEur(criticalRisk), "red", counts.red + " incidencias"),
          stat("Sin facturar", fmtEur(all.filter((x) => x.kind === "uninvoiced").reduce((s, x) => s + (x.risk || 0), 0)), "amber", "2 expedientes"),
          stat("Documentos IA por validar", "2", "blue", "campos en ámbar")
        )
      ),

      // saved views
      e("div", { className: "views" },
        e("span", { className: "field-label", style: { marginRight: 2 } }, "Vistas"),
        VIEWS.map((v) =>
          e("button", { key: v.id, className: "view-pill" + (savedView === v.id ? " on" : ""), onClick: () => setSavedView(v.id) },
            v.label, v.count != null ? e("span", { className: "vc" }, v.count) : null)),
        e("button", { className: "view-add", title: "Guardar vista actual", onClick: () => toast && toast("Vista guardada en tu espacio") }, e(Icon, { name: "plus", size: 14 }))),

      // triage chips
      e("div", { className: "triage" },
        chip("all", "Todo", counts.all, filter, setFilter, null),
        chip("red", "Crítico", counts.red, filter, setFilter, "red"),
        chip("amber", "Atención", counts.amber, filter, setFilter, "amber"),
        chip("blue", "Seguimiento", counts.blue, filter, setFilter, "blue"),
        e("div", { className: "right row gap8 faint", style: { fontSize: 12 } },
          e(Icon, { name: "bolt", size: 14 }),
          "Ordenado por margen en riesgo")
      ),

      // list
      e("div", { className: "exc-list" },
        list.map((x) =>
          e("div", { key: x.id, className: "exc", onClick: () => open(x), style: done[x.id] ? { opacity: 0.45 } : null },
            e("div", { className: "exc-rail " + x.sev }),
            e("div", { className: "exc-ico " + x.sev }, e(Icon, { name: KIND_ICO[x.kind] || "alert", size: 18 })),
            e("div", { className: "exc-body" },
              e("div", { className: "exc-title" },
                x.title,
                e("span", { className: "pill " + x.sev, style: { fontSize: 10, padding: "2px 7px" } }, SEV_LABEL[x.sev])
              ),
              e("div", { className: "exc-desc" }, x.desc),
              e("div", { className: "exc-meta" },
                e("span", { className: "ref" }, x.ref),
                e("span", null, "·"), e("span", null, x.client),
                e("span", null, "·"), e("span", null, x.age)
              )
            ),
            e("div", { className: "exc-right", style: { position: "relative" } },
              x.risk != null
                ? e(React.Fragment, null,
                    e("div", { className: "exc-risk " + (x.sev === "red" ? "red" : "amber") }, fmtEur(x.risk)),
                    e("div", { className: "exc-risk-l" }, x.riskType))
                : e("span", { className: "pill neutral" }, x.riskType || "Acción requerida"),
              e("div", { className: "row gap6" },
                e("button", {
                    className: "btn sm ghost", title: "Posponer",
                    onClick: (ev) => { ev.stopPropagation(); setSnoozeFor(snoozeFor === x.id ? null : x.id); },
                  },
                  e(Icon, { name: "clock", size: 14 })),
                e("button", {
                    className: "btn sm",
                    onClick: (ev) => { ev.stopPropagation(); setDone((d) => ({ ...d, [x.id]: !d[x.id] })); },
                    style: done[x.id] ? { background: "var(--green-tint)", borderColor: "var(--green)", color: "var(--green-ink)" } : null,
                  },
                  e(Icon, { name: done[x.id] ? "check" : "arrowR", size: 14 }),
                  done[x.id] ? "Resuelto" : "Resolver")),
              snoozeFor === x.id ? e("div", { className: "snooze-pop", style: { top: "100%", right: 0, marginTop: 4 }, onClick: (ev) => ev.stopPropagation() },
                [["1 hora", "1h"], ["Esta tarde", "16:00"], ["Mañana", "+1d"], ["Próxima semana", "+7d"]].map((o, i) =>
                  e("div", { key: i, className: "snooze-opt", onClick: () => { setSnoozed((s) => ({ ...s, [x.id]: true })); setSnoozeFor(null); toast && toast("Pospuesto · reaparecerá " + o[0].toLowerCase()); } },
                    e(Icon, { name: "clock", size: 13, style: { color: "var(--ink-3)" } }), o[0], e("span", { className: "s" }, o[1]))) ) : null
            )
          )
        )
      ),
      list.length === 0 ? e("div", { className: "card card-pad faint", style: { textAlign: "center" } }, "Sin incidencias en este filtro.") : null
    );
  }

  function stat(label, val, sev, sub) {
    return e("div", { style: { padding: "16px 18px", borderRight: "1px solid var(--line-2)" } },
      e("div", { className: "eyebrow" }, label),
      e("div", { className: "num", style: { fontSize: 24, fontWeight: 650, marginTop: 5, color: sev === "red" ? "var(--red-ink)" : "var(--ink)" } }, val),
      e("div", { className: "faint", style: { fontSize: 11.5, marginTop: 2 } }, sub)
    );
  }

  function chip(id, label, count, filter, set, sev) {
    return e("button", { className: "tri-chip" + (filter === id ? " on" : ""), onClick: () => set(id) },
      sev ? e("span", { className: "sdot " + sev }) : null,
      label, e("span", { className: "c" }, count)
    );
  }

  window.InboxScreen = InboxScreen;
})();
