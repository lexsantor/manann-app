/* FARO — DataModule: the classic ERP CRUD grid (config-driven) */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, fmtN } = UI;
  const e = React.createElement;

  function cell(col, row, navigate) {
    const v = row[col.key];
    if (v && v._pill) return e("span", { className: "pill " + v._pill }, v.t);
    if (col.type === "money") return e("span", { className: "tnum" }, fmtEur(v));
    if (col.type === "num") return e("span", { className: "tnum" }, fmtN(v));
    if (col.type === "mono") return e("span", { className: "mono", style: { fontSize: 12 } }, v);
    if (col.link) return e("span", { className: "mono", style: { fontWeight: 600, color: "var(--terra-deep)", cursor: "pointer" },
      onClick: (ev) => { ev.stopPropagation(); navigate("expediente", { id: v }); } }, v);
    return v;
  }

  function DataModule({ cfg, navigate, toast }) {
    const [sel, setSel] = React.useState({});
    const [q, setQ] = React.useState("");
    const [detail, setDetail] = React.useState(null);
    const [page, setPage] = React.useState(1);

    if (!cfg) return e("div", { className: "page" }, e("div", { className: "card card-pad faint" }, "Módulo no disponible en la demo."));

    const rows = cfg.rows.filter((r) =>
      q === "" || Object.values(r).some((val) => {
        const s = val && val._pill ? val.t : val;
        return String(s).toLowerCase().includes(q.toLowerCase());
      }));
    const total = rows.length;
    const allSel = total > 0 && rows.every((_, i) => sel[i]);
    const toggleAll = () => { const n = {}; if (!allSel) rows.forEach((_, i) => (n[i] = true)); setSel(n); };
    const selCount = Object.values(sel).filter(Boolean).length;

    return e("div", { className: "page page-wide screen-enter" },
      // head
      e("div", { className: "page-head" },
        e("div", { className: "grow" },
          e("div", { className: "eyebrow" }, cfg.eyebrow),
          e("h1", { className: "t-h1" }, cfg.title),
          e("div", { className: "page-sub" }, total + " registros · base de datos única (RLS multi-tenant)")),
        e("div", { className: "row gap8" },
          e("button", { className: "btn" }, e(Icon, { name: "download", size: 14 }), "Exportar"),
          e("button", { className: "btn" }, e(Icon, { name: "refresh", size: 14 }), "Importar"),
          cfg.newLabel ? e("button", { className: "btn terra" }, e(Icon, { name: "plus", size: 15 }), cfg.newLabel) : null)),

      // filters
      e("div", { className: "card", style: { padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" } },
        e("div", { className: "search", style: { width: 260, color: "var(--ink)", background: "var(--surface-2)" } },
          e(Icon, { name: "search", size: 15, style: { color: "var(--ink-3)" } }),
          e("input", { value: q, onChange: (ev) => setQ(ev.target.value), placeholder: "Buscar…",
            style: { border: "none", outline: "none", background: "transparent", font: "inherit", flex: 1, color: "inherit" } })),
        (cfg.filters || []).map((f, i) =>
          e("div", { key: i, className: "row gap6" },
            e("span", { className: "field-label" }, f.label),
            e("select", { className: "erp-select" }, f.options.map((o, j) => e("option", { key: j }, o))))),
        e("button", { className: "btn sm ghost right" }, e(Icon, { name: "settings", size: 13 }), "Columnas")),

      // toolbar
      e("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 0, padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--line)", borderBottom: "none", borderRadius: "var(--r-lg) var(--r-lg) 0 0" } },
        selCount > 0
          ? e("span", { className: "pill ink" }, selCount + " seleccionados")
          : e("span", { className: "faint", style: { fontSize: 12 } }, "Mostrando 1–" + total + " de " + total),
        e("div", { className: "row gap4 right" },
          e("button", { className: "pager", title: "Primera" }, e(Icon, { name: "chevR", size: 14, style: { transform: "rotate(180deg)" } }), e(Icon, { name: "chevR", size: 14, style: { transform: "rotate(180deg)", marginLeft: -10 } })),
          e("button", { className: "pager" }, e(Icon, { name: "chevR", size: 14, style: { transform: "rotate(180deg)" } })),
          e("span", { className: "mono", style: { fontSize: 12, padding: "0 8px" } }, "1 / 1"),
          e("button", { className: "pager" }, e(Icon, { name: "chevR", size: 14 })),
          e("button", { className: "pager", title: "Última" }, e(Icon, { name: "chevR", size: 14 }), e(Icon, { name: "chevR", size: 14, style: { marginLeft: -10 } })),
        )),

      // table
      e("div", { className: "card", style: { borderRadius: "0 0 var(--r-lg) var(--r-lg)", overflow: "hidden" } },
        e("table", { className: "tbl erp" },
          e("thead", null, e("tr", null,
            e("th", { style: { width: 38 } }, e("input", { type: "checkbox", checked: allSel, onChange: toggleAll })),
            cfg.columns.map((c) => e("th", { key: c.key, className: c.align === "r" ? "r" : "", style: c.w ? { width: c.w } : null }, c.label)),
            e("th", { style: { width: 40 } }, ""))),
          e("tbody", null,
            rows.map((r, i) =>
              e("tr", { key: i, className: "click", onClick: () => setDetail(r) },
                e("td", { onClick: (ev) => ev.stopPropagation() }, e("input", { type: "checkbox", checked: !!sel[i], onChange: () => setSel((s) => ({ ...s, [i]: !s[i] })) })),
                cfg.columns.map((c) => e("td", { key: c.key, className: c.align === "r" ? "r" : "" }, cell(c, r, navigate))),
                e("td", null, e(Icon, { name: "chevR", size: 14, style: { color: "var(--ink-4)" } })))))
        )),

      // detail drawer
      detail ? e(Drawer, { cfg, row: detail, close: () => setDetail(null), navigate }) : null,

      // bulk action bar
      selCount > 0 ? e("div", { className: "bulkbar" },
        e("span", { className: "bcount" }, selCount),
        e("span", { style: { fontSize: 12.5, fontWeight: 500 } }, selCount === 1 ? "registro seleccionado" : "registros seleccionados"),
        e("span", { className: "bsep" }),
        e("button", { className: "bulk-btn", onClick: () => { toast && toast(selCount + " registros exportados a Excel"); setSel({}); } }, e(Icon, { name: "download", size: 14 }), "Exportar"),
        e("button", { className: "bulk-btn", onClick: () => { toast && toast("Email enviado sobre " + selCount + " registros"); setSel({}); } }, e(Icon, { name: "invoice", size: 14 }), "Email"),
        e("button", { className: "bulk-btn terra", onClick: () => { toast && toast(selCount + " registros procesados en lote"); setSel({}); } }, e(Icon, { name: "bolt", size: 14 }), "Acción masiva"),
        e("span", { className: "bsep" }),
        e("button", { className: "bulk-x", onClick: () => setSel({}) }, e(Icon, { name: "x", size: 15 }))) : null
    );
  }

  function Drawer({ cfg, row, close, navigate }) {
    return e("div", { className: "scrim", style: { justifyContent: "flex-end" }, onClick: close },
      e("div", { className: "drawer", onClick: (ev) => ev.stopPropagation() },
        e("div", { className: "modal-head" },
          e(Icon, { name: cfg.icon, size: 18, style: { color: "var(--ink-3)" } }),
          e("div", { className: "grow" }, e("div", { className: "t-h3" }, cfg.title.replace(/s$/, "")), e("div", { className: "faint", style: { fontSize: 11.5 } }, "Detalle del registro")),
          e("button", { className: "icon-btn", onClick: close }, e(Icon, { name: "x", size: 16 }))),
        e("div", { className: "modal-body", style: { padding: 20 } },
          e("div", { className: "def-grid c3" },
            cfg.columns.map((c) => {
              const v = row[c.key];
              return e("div", { key: c.key, className: "field" },
                e("div", { className: "field-label" }, c.label),
                e("div", { className: "field-val" + (c.type === "mono" || c.link ? " mono" : "") },
                  v && v._pill ? e("span", { className: "pill " + v._pill }, v.t)
                    : c.type === "money" ? fmtEur(v) : c.type === "num" ? fmtN(v) : v));
            })),
          e("div", { className: "row gap8 mt24" },
            cfg.columns.find((c) => c.link) ? e("button", { className: "btn terra", onClick: () => { const lk = cfg.columns.find((c) => c.link); navigate("expediente", { id: row[lk.key] }); } }, "Abrir expediente →") : null,
            e("button", { className: "btn" }, e(Icon, { name: "doc", size: 14 }), "Editar"),
            e("button", { className: "btn ghost" }, "Historial"))))
    );
  }

  window.DataModule = DataModule;
})();
