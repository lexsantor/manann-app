/* FARO — Finanzas / CFO dashboard */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, fmtN, Kpi, Spark, Tier } = UI;
  const e = React.createElement;

  function DashboardScreen({ navigate }) {
    const D = window.FARO;
    const leakTotal = D.leakage.reduce((s, l) => s + l.amount, 0);

    return e("div", { className: "page page-wide screen-enter" },
      e("div", { className: "page-head" },
        e("div", { className: "grow" },
          e("div", { className: "eyebrow" }, "Finanzas · dirección"),
          e("h1", { className: "t-h1" }, "Salud del margen"),
          e("div", { className: "page-sub" }, "Junio 2026 · el ERP vale por cuánto margen fugado recupera, no por cuán bonito es")),
        e("div", { className: "row gap8" },
          e("button", { className: "btn" }, e(Icon, { name: "refresh", size: 14 }), "Cierre mensual"),
          e("button", { className: "btn primary" }, e(Icon, { name: "download", size: 14 }), "Exportar"))),

      // KPIs
      e("div", { className: "kpi-grid mb20", style: { gridTemplateColumns: "repeat(4,1fr)" } },
        D.kpis.map((k, i) => e(Kpi, { key: i, k }))),

      e("div", { style: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" } },
        // GP trend
        e(UI.Section, { title: "Gross profit · 12 semanas", icon: "coins",
            right: e("span", { className: "pill green" }, e(Icon, { name: "arrowUp", size: 12 }), "+12,4 %") },
          e("div", { style: { display: "flex", alignItems: "flex-end", gap: 20 } },
            e("div", null,
              e("div", { className: "num", style: { fontSize: 30, fontWeight: 650, letterSpacing: "-.03em" } }, "184,2 ", e("span", { className: "faint", style: { fontSize: 16 } }, "k€")),
              e("div", { className: "faint", style: { fontSize: 12 } }, "este mes")),
            e("div", { className: "grow", style: { display: "flex", justifyContent: "flex-end" } },
              e(Spark, { data: D.gpTrend, color: "var(--terra)", w: 380, h: 80, fill: true }))),
          e("div", { className: "row gap24 mt20", style: { paddingTop: 16, borderTop: "1px solid var(--line-2)" } },
            miniStat("GP por TEU", "412 €", "objetivo 300–600"),
            miniStat("Conversión GP→EBIT", "26 %", "rango McKinsey 20–30"),
            miniStat("EBITDA / empleado", "31,4 k€", "+8 % YoY"),
            miniStat("DSO", "47 días", "−3 días"))),

        // Margin leakage — the thesis
        e("div", { className: "card", style: { borderColor: "var(--terra)", overflow: "hidden" } },
          e("div", { className: "card-head", style: { background: "var(--terra-tint2)", borderColor: "transparent" } },
            e(Icon, { name: "shield", size: 16, style: { color: "var(--terra-deep)" } }),
            e("div", { className: "grow" }, e("h3", { className: "t-h3", style: { color: "var(--terra-deep)" } }, "Fuga de margen detectada"),
              e("div", { style: { fontSize: 11, color: "var(--terra-deep)", opacity: .8 } }, "este mes · recuperable por Faro"))),
          e("div", { className: "card-pad" },
            e("div", { className: "num", style: { fontSize: 28, fontWeight: 650, letterSpacing: "-.03em", marginBottom: 4 } }, fmtEur(leakTotal)),
            e("div", { className: "faint", style: { fontSize: 12, marginBottom: 16 } },
              "Sobre un neto del 3 %, recuperarlo es ", e("b", { style: { color: "var(--green-ink)" } }, "+33 % de beneficio"), "."),
            e("div", { className: "col gap12" },
              D.leakage.map((l, i) =>
                e("div", { key: i },
                  e("div", { className: "row", style: { fontSize: 12.5, marginBottom: 4 } },
                    e("span", { className: "grow" }, l.cat),
                    e("span", { className: "num", style: { fontWeight: 600 } }, fmtEur(l.amount))),
                  e("div", { className: "mbar thin" }, e("div", { style: { width: l.pct + "%", background: "var(--terra)" } }))))),
            e("button", { className: "btn terra mt16", style: { width: "100%", justifyContent: "center" }, onClick: () => navigate("inbox") },
              "Ver incidencias en la bandeja →"))
        )),

      // GP per client
      e("div", { className: "mt20" },
        e(UI.Section, { title: "Gross profit por cliente", icon: "users", noPad: true,
            sub: "Identifica clientes no rentables · regla PE: ningún cliente > 20 % del GP",
            right: e("button", { className: "btn sm ghost" }, "Ver todos") },
          e("table", { className: "tbl" },
            e("thead", null, e("tr", null,
              e("th", null, "Cliente"), e("th", null, "Tier"), e("th", { className: "r" }, "Expedientes"),
              e("th", { className: "r" }, "GP acumulado"), e("th", { className: "r" }, "Margen medio"), e("th", { style: { width: 160 } }, "Peso en cartera"))),
            e("tbody", null,
              D.clientsGP.map((c, i) => {
                const totalGP = D.clientsGP.reduce((s, x) => s + x.gp, 0);
                const share = (c.gp / totalGP) * 100;
                return e("tr", { key: i, className: "click" },
                  e("td", { style: { fontWeight: 600 } }, c.name),
                  e("td", null, e(Tier, { t: c.tier })),
                  e("td", { className: "r tnum" }, c.files),
                  e("td", { className: "r tnum", style: { fontWeight: 600 } }, fmtEur(c.gp)),
                  e("td", { className: "r tnum", style: { color: c.pct < 7.5 ? "var(--red-ink)" : "var(--ink)" } }, c.pct.toFixed(1) + " %"),
                  e("td", null, e("div", { className: "row gap8" },
                    e("div", { className: "mbar thin", style: { flex: 1 } }, e("div", { style: { width: share + "%", background: share > 20 ? "var(--red)" : "var(--ink-3)" } })),
                    e("span", { className: "num", style: { fontSize: 11, width: 34 } }, share.toFixed(0) + " %"))));
              }))
          ))
      )
    );
  }
  function miniStat(l, v, s) {
    return e("div", { className: "col", style: { gap: 2 } },
      e("span", { className: "eyebrow" }, l),
      e("span", { className: "num", style: { fontSize: 17, fontWeight: 650 } }, v),
      e("span", { className: "faint", style: { fontSize: 10.5 } }, s));
  }
  window.DashboardScreen = DashboardScreen;
})();
