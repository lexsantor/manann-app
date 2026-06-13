/* FARO — Cotización (quote builder) */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, fmtN, ModeTag, MarginBar } = UI;
  const e = React.createElement;

  function QuoteScreen({ navigate, toast }) {
    const Q = window.FARO.quote;
    const [margin, setMargin] = React.useState(0); // extra margin slider, € applied to negotiable lines
    const negLines = Q.lines.filter((l) => !l.pass);

    const baseTotals = Q.lines.reduce((a, l) => ({ sell: a.sell + l.sell, buy: a.buy + l.buy }), { sell: 0, buy: 0 });
    const sell = baseTotals.sell + margin;
    const buy = baseTotals.buy;
    const gp = sell - buy; const pct = (gp / sell) * 100;

    return e("div", { className: "page screen-enter" },
      e("div", { className: "row gap8 mb12", style: { fontSize: 12.5 } },
        e("span", { className: "faint", style: { cursor: "pointer" }, onClick: () => navigate("inbox") }, "Cotizaciones"),
        e(Icon, { name: "chevR", size: 13, style: { color: "var(--ink-4)" } }),
        e("span", { className: "mono", style: { fontWeight: 600 } }, Q.id)),

      e("div", { className: "page-head" },
        e("div", { className: "grow" },
          e("div", { className: "row gap12 wrap" },
            e("h1", { className: "t-h1 mono" }, Q.id),
            e("span", { className: "pill amber" }, e(Icon, { name: "clock", size: 12 }), "Vence 14 jun · 36 h"),
            e(ModeTag, { mode: Q.mode })),
          e("div", { className: "page-sub mt8" }, Q.client + " · " + Q.origin.name + " → " + Q.dest.name + " · Incoterm " + Q.incoterm)),
        e("div", { className: "row gap8" },
          e("button", { className: "btn", onClick: () => toast && toast("Cotización marcada como perdida") }, "Marcar perdida"),
          e("button", { className: "btn terra", onClick: () => { toast && toast("Cotización ganada → expediente creado sin re-tecleo"); navigate("expediente", { id: "S-2026-04431" }); } },
            e(Icon, { name: "check", size: 15 }), "Ganada → crear expediente"))),

      // AI banner
      e("div", { className: "card card-pad mb16", style: { background: "var(--amber-tint)", borderColor: "var(--amber-line)", display: "flex", gap: 12, alignItems: "center" } },
        e(Icon, { name: "sparkle", size: 18, style: { color: "var(--amber-ink)" } }),
        e("div", { className: "grow", style: { color: "var(--amber-ink)", fontSize: 12.5 } },
          e("b", null, "Faro IA generó esta cotización"), " leyendo el RFQ por email de Nordix. Peso facturable calculado automáticamente: ",
          e("span", { className: "mono", style: { fontWeight: 700 } }, "máx(1.180 kg real, 8,6 m³ × 167) = 1.437 kg"), "."),
        e("span", { className: "pill", style: { background: "#fff", color: "var(--amber-ink)" } }, "tiempo de respuesta: 2 min vs 48 h")),

      e("div", { style: { display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 18, alignItems: "start" } },
        // lines
        e("div", { className: "card", style: { overflow: "hidden" } },
          e("div", { className: "card-head" }, e("h3", { className: "t-h3 grow" }, "Líneas de cotización"),
            e("button", { className: "btn sm ghost" }, e(Icon, { name: "plus", size: 13 }), "Añadir")),
          e("table", { className: "tbl" },
            e("thead", null, e("tr", null,
              e("th", null, "Código"), e("th", null, "Concepto"),
              e("th", { className: "r" }, "Venta"), e("th", { className: "r" }, "Compra"), e("th", { className: "r" }, "Margen"))),
            e("tbody", null,
              Q.lines.map((l) => {
                const m = l.sell - l.buy;
                return e("tr", { key: l.code },
                  e("td", null, e("span", { className: "tl-code" }, l.code)),
                  e("td", null, e("div", { className: "row gap8" }, l.desc, l.pass ? e("span", { className: "pill neutral", style: { fontSize: 10, padding: "2px 6px" } }, "pass-through") : null)),
                  e("td", { className: "r tnum" }, fmtN(l.sell) + " €"),
                  e("td", { className: "r tnum faint" }, fmtN(l.buy) + " €"),
                  e("td", { className: "r tnum", style: { fontWeight: 600, color: m > 0 ? "var(--green-ink)" : "var(--ink-3)" } }, m > 0 ? fmtN(m) + " €" : "—"));
              }),
              margin > 0 ? e("tr", { style: { background: "var(--terra-tint2)" } },
                e("td", null, e("span", { className: "tl-code", style: { borderColor: "var(--terra)", color: "var(--terra-deep)" } }, "MRG")),
                e("td", null, "Margen comercial adicional"),
                e("td", { className: "r tnum", style: { color: "var(--terra-deep)", fontWeight: 600 } }, "+" + fmtN(margin) + " €"),
                e("td", { className: "r faint" }, "—"),
                e("td", { className: "r tnum", style: { color: "var(--green-ink)", fontWeight: 600 } }, "+" + fmtN(margin) + " €")) : null),
            e("tfoot", null, e("tr", { style: { borderTop: "2px solid var(--line-strong)" } },
              e("td", { colSpan: 2, style: { padding: 12, fontWeight: 700 } }, "Total oferta"),
              e("td", { className: "r tnum", style: { fontWeight: 700, padding: 12 } }, fmtN(sell) + " €"),
              e("td", { className: "r tnum", style: { fontWeight: 700, padding: 12, color: "var(--ink-2)" } }, fmtN(buy) + " €"),
              e("td", { className: "r tnum", style: { fontWeight: 700, padding: 12, color: "var(--green-ink)" } }, fmtN(gp) + " €")))
          )),

        // side: cargo + margin control
        e("div", { className: "col gap16" },
          e("div", { className: "card card-pad" },
            e("h3", { className: "t-h3 mb16" }, "Carga"),
            e("div", { className: "def-grid c3", style: { gap: "12px 14px" } },
              kv("Piezas", Q.cargo.pieces), kv("Peso real", fmtN(Q.cargo.weight) + " kg"),
              kv("Volumen", fmtN(Q.cargo.volume, 1) + " m³"),
              kv("Peso facturable", fmtN(Q.cargo.chargeable) + " kg", true))),
          e("div", { className: "card card-pad" },
            e("div", { className: "row mb16" }, e("h3", { className: "t-h3 grow" }, "Margen y precio"),
              e("span", { className: "num pill " + (pct < 8 ? "red" : "green") }, pct.toFixed(1) + " %")),
            e("div", { className: "row mb12" }, e("span", { className: "grow faint" }, "Gross profit"),
              e("span", { className: "num", style: { fontWeight: 700, fontSize: 16, color: "var(--green-ink)" } }, fmtEur(gp))),
            e(MarginBar, { sell, buy }),
            e("div", { className: "mt16" },
              e("div", { className: "row mb8" }, e("span", { className: "field-label grow" }, "Margen comercial adicional"),
                e("span", { className: "mono", style: { fontWeight: 600 } }, "+" + fmtN(margin) + " €")),
              e("input", { type: "range", min: 0, max: 600, step: 20, value: margin,
                onChange: (ev) => setMargin(+ev.target.value),
                style: { width: "100%", accentColor: "var(--terra)" } }),
              e("div", { className: "faint", style: { fontSize: 11, marginTop: 6 } }, "Ajusta el spread vendido; las líneas pass-through no se tocan.")),
            e("button", { className: "btn primary mt16", style: { width: "100%", justifyContent: "center" } }, e(Icon, { name: "download", size: 14 }), "Generar PDF de oferta"))
        ))
    );
  }
  function kv(l, v, hi) {
    return e("div", { className: "field" }, e("div", { className: "field-label" }, l),
      e("div", { className: "field-val mono", style: hi ? { color: "var(--terra-deep)", fontWeight: 700 } : null }, v));
  }
  window.QuoteScreen = QuoteScreen;
})();
