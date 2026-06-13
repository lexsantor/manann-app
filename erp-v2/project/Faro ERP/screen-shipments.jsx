/* FARO — Expedientes (list view) */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, ModeTag, StatusPill, Tier, MarginBar } = UI;
  const e = React.createElement;

  function ShipmentsScreen({ navigate, toast }) {
    const D = window.FARO;
    const [q, setQ] = React.useState("");
    const [mode, setMode] = React.useState("all");
    const [sel, setSel] = React.useState({});
    const rows = D.shipments.filter((s) =>
      (mode === "all" || s.mode === mode) &&
      (q === "" || (s.id + s.client.name + s.origin.code + s.dest.code).toLowerCase().includes(q.toLowerCase())));

    const sumOf = (s) => s.charges ? s.charges.reduce((a, c) => ({ sell: a.sell + c.sell, buy: a.buy + c.buy }), { sell: 0, buy: 0 }) : { sell: s.sell, buy: s.buy };
    const selIds = Object.keys(sel).filter((k) => sel[k]);
    const allSel = rows.length > 0 && rows.every((s) => sel[s.id]);
    const toggleAll = () => { if (allSel) setSel({}); else { const n = {}; rows.forEach((s) => (n[s.id] = true)); setSel(n); } };
    const bulk = (label) => { toast && toast(label + " · " + selIds.length + " expedientes"); setSel({}); };

    return e("div", { className: "page page-wide screen-enter" },
      e("div", { className: "page-head" },
        e("div", { className: "grow" },
          e("div", { className: "eyebrow" }, "Expedientes"),
          e("h1", { className: "t-h1" }, "Todos los expedientes"),
          e("div", { className: "page-sub" }, D.shipments.length + " expedientes activos · base de datos única, sin silos")),
        e("button", { className: "btn terra", onClick: () => navigate("ingest") }, e(Icon, { name: "sparkle" }), "Nuevo · Ingesta IA")),

      e("div", { className: "row gap8 mb16 wrap" },
        e("div", { className: "search", style: { width: 260, color: "var(--ink)" } },
          e(Icon, { name: "search", size: 15, style: { color: "var(--ink-3)" } }),
          e("input", { value: q, onChange: (ev) => setQ(ev.target.value), placeholder: "Buscar expediente, cliente, puerto…",
            style: { border: "none", outline: "none", background: "transparent", font: "inherit", flex: 1, color: "inherit" } })),
        e("div", { className: "row gap6" },
          ["all", "SEA-FCL", "SEA-LCL", "AIR", "ROAD"].map((m) =>
            e("button", { key: m, className: "tri-chip" + (mode === m ? " on" : ""), onClick: () => setMode(m), style: { padding: "6px 11px" } },
              m === "all" ? "Todos" : m.replace("SEA-", "")))),
        e("span", { className: "right faint", style: { fontSize: 12 } }, rows.length + " resultados")),

      e("div", { className: "card", style: { overflow: "hidden" } },
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null,
            e("th", { style: { width: 38 } }, e("input", { type: "checkbox", checked: allSel, onChange: toggleAll })),
            e("th", null, "Expediente"), e("th", null, "Modo"), e("th", null, "Ruta"),
            e("th", null, "Cliente"), e("th", null, "Estado"),
            e("th", { className: "r" }, "Venta"), e("th", { className: "r" }, "GP"),
            e("th", { style: { width: 110 } }, "Margen"))),
          e("tbody", null,
            rows.map((s) => {
              const t = sumOf(s); const gp = t.sell - t.buy; const pct = (gp / t.sell) * 100;
              return e("tr", { key: s.id, className: "click", onClick: () => navigate("expediente", { id: s.id }) },
                e("td", { onClick: (ev) => ev.stopPropagation() }, e("input", { type: "checkbox", checked: !!sel[s.id], onChange: () => setSel((p) => ({ ...p, [s.id]: !p[s.id] })) })),
                e("td", null, e("div", { className: "mono", style: { fontWeight: 600 } }, s.id),
                  e("div", { className: "faint", style: { fontSize: 11 } }, s.ref)),
                e("td", null, e(ModeTag, { mode: s.mode, short: true })),
                e("td", null, e("span", { className: "mono", style: { fontSize: 12 } }, s.origin.code),
                  e("span", { className: "faint" }, " → "), e("span", { className: "mono", style: { fontSize: 12 } }, s.dest.code),
                  e("div", { className: "faint", style: { fontSize: 11 } }, s.origin.name + " → " + s.dest.name)),
                e("td", null, e("div", { className: "row gap6" }, s.client.name, e(Tier, { t: s.client.tier }))),
                e("td", null, e(StatusPill, { status: s.status, label: s.statusLabel })),
                e("td", { className: "r tnum" }, fmtEur(t.sell)),
                e("td", { className: "r tnum", style: { fontWeight: 600, color: "var(--green-ink)" } }, fmtEur(gp)),
                e("td", null, e("div", { className: "row gap8" },
                  e("span", { className: "num", style: { fontSize: 11, width: 32, color: pct < 7 ? "var(--red-ink)" : "var(--ink-2)" } }, pct.toFixed(1) + "%"),
                  e("div", { style: { flex: 1 } }, e(MarginBar, { sell: t.sell, buy: t.buy, thin: true })))));
            }))
        )),

      // bulk AI action bar (matches the master-grid pattern)
      selIds.length > 0 ? e("div", { className: "bulkbar" },
        e("span", { className: "bcount" }, selIds.length),
        e("span", { style: { fontSize: 12.5, fontWeight: 500 } }, selIds.length === 1 ? "expediente seleccionado" : "expedientes seleccionados"),
        e("span", { className: "bsep" }),
        e("button", { className: "bulk-btn", onClick: () => bulk("Facturas de venta emitidas") }, e(Icon, { name: "invoice", size: 14 }), "Facturar"),
        e("button", { className: "bulk-btn", onClick: () => bulk("Recordatorio de documentación enviado") }, e(Icon, { name: "doc", size: 14 }), "Pedir docs"),
        e("button", { className: "bulk-btn", onClick: () => bulk("Tracking actualizado") }, e(Icon, { name: "refresh", size: 14 }), "Tracking"),
        e("button", { className: "bulk-btn terra", onClick: () => bulk("Procesados en lote por la IA") }, e(Icon, { name: "bolt", size: 14 }), "Acción IA"),
        e("span", { className: "bsep" }),
        e("button", { className: "bulk-x", onClick: () => setSel({}) }, e(Icon, { name: "x", size: 15 }))) : null
    );
  }
  window.ShipmentsScreen = ShipmentsScreen;
})();
