/* FARO — shared UI primitives. Exported to window. */
(function () {
  const { Icon } = window;
  const e = React.createElement;

  // ---- formatters (locale-independent: '.' thousands, ',' decimals) ----
  const fmtN = (n, d = 0) => {
    const neg = n < 0; let x = Math.abs(n);
    let s = d > 0 ? x.toFixed(d) : String(Math.round(x));
    let parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (neg ? "-" : "") + parts[0] + (parts[1] ? "," + parts[1] : "");
  };
  const fmtEur = (n, d = 0) => fmtN(n, d) + " €";

  // ---- mode tag ----
  const MODE = {
    "SEA-FCL": { icon: "ship", label: "MARÍTIMO FCL" },
    "SEA-LCL": { icon: "ship", label: "MARÍTIMO LCL" },
    "AIR":     { icon: "plane", label: "AÉREO" },
    "ROAD":    { icon: "truck", label: "TERRESTRE" },
  };
  function ModeTag({ mode, short }) {
    const m = MODE[mode] || MODE["SEA-FCL"];
    return e("span", { className: "mode" }, e(Icon, { name: m.icon, size: 12 }), short ? mode.replace("SEA-", "") : m.label);
  }

  // ---- status pill ----
  const STATUS = {
    quote:      { cls: "neutral", dot: "ink",  label: "Cotización" },
    booking:    { cls: "blue",    dot: "blue", label: "Reservado" },
    "in-transit": { cls: "blue",  dot: "blue", label: "En tránsito" },
    customs:    { cls: "amber",   dot: "amber", label: "En aduana" },
    arrived:    { cls: "amber",   dot: "amber", label: "Arribado" },
    delivered:  { cls: "green",   dot: "green", label: "Entregado" },
    invoiced:   { cls: "green",   dot: "green", label: "Facturado" },
    closed:     { cls: "neutral", dot: "ink",  label: "Cerrado" },
  };
  function StatusPill({ status, label }) {
    const s = STATUS[status] || STATUS.quote;
    return e("span", { className: "pill " + s.cls }, e("span", { className: "dotc", style: { background: "currentColor" } }), label || s.label);
  }

  // ---- tier badge ----
  function Tier({ t }) {
    const map = { A: "ink", B: "neutral", C: "neutral" };
    return e("span", { className: "pill " + (map[t] || "neutral"), style: { padding: "2px 7px", fontFamily: "var(--mono)" } }, t);
  }

  // ---- AI / lighthouse-amber field ----
  function AiField({ label, data, verified, onConfirm, suffix }) {
    const [v, setV] = React.useState(verified || false);
    const [flash, setFlash] = React.useState(false);
    const confirm = (ev) => {
      ev && ev.stopPropagation();
      if (v) return;
      setV(true); setFlash(true);
      setTimeout(() => setFlash(false), 900);
      onConfirm && onConfirm(label, data.value);
    };
    return e("div", { className: "field" },
      e("div", { className: "field-label" }, label),
      e("div", {
          className: "ai-field " + (v ? "verified" : "amber") + (flash ? " flash" : ""),
          onClick: confirm, title: v ? "Verificado" : "Pulsa para confirmar (Enter)",
        },
        e("div", { className: "field-val" },
          e("span", null, data.value), suffix ? e("span", { className: "faint" }, suffix) : null,
          v
            ? e(Icon, { name: "checkCircle", size: 14, className: "ai-check" })
            : e(React.Fragment, null,
                e(Icon, { name: "sparkle", size: 13, className: "ai-spark" }),
                e("span", { className: "conf" }, data.conf + "%"))
        )
      )
    );
  }

  // plain definition field
  function Def({ label, children, mono }) {
    return e("div", { className: "field" },
      e("div", { className: "field-label" }, label),
      e("div", { className: "field-val" + (mono ? " mono" : "") }, children)
    );
  }

  // ---- margin bar ----
  function MarginBar({ sell, buy, thin }) {
    const mar = sell - buy;
    const buyPct = (buy / sell) * 100;
    const marPct = (mar / sell) * 100;
    return e("div", { className: "mbar" + (thin ? " thin" : "") },
      e("div", { className: "buy", style: { width: buyPct + "%" } }),
      e("div", { className: "mar", style: { width: marPct + "%" } })
    );
  }

  // ---- sparkline ----
  function Spark({ data, color, w = 120, h = 34, fill }) {
    const max = Math.max(...data), min = Math.min(...data);
    const rng = max - min || 1;
    const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / rng) * (h - 4) - 2]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const area = line + ` L${w} ${h} L0 ${h} Z`;
    return e("svg", { width: w, height: h, style: { display: "block", overflow: "visible" } },
      fill ? e("path", { d: area, fill: color, opacity: 0.1 }) : null,
      e("path", { d: line, fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }),
      e("circle", { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 2.6, fill: color })
    );
  }

  // ---- KPI card ----
  function Kpi({ k }) {
    return e("div", { className: "kpi" },
      e("div", { className: "kpi-top" },
        e("span", { className: "kpi-label" }, k.label),
        e("span", { className: "kpi-icon" }, e(Icon, { name: k.icon, size: 15 }))
      ),
      e("div", { className: "kpi-val num" }, k.value, e("span", { className: "unit" }, " " + k.unit)),
      e("div", { className: "kpi-delta " + k.dir },
        e(Icon, { name: k.dir === "up" ? "arrowUp" : "arrowDn", size: 13 }), k.delta,
        e("span", { className: "faint", style: { fontWeight: 500 } }, " vs mes anterior")
      )
    );
  }

  // ---- generic section card ----
  function Section({ title, right, children, sub, icon, noPad }) {
    return e("div", { className: "card" },
      e("div", { className: "card-head" },
        icon ? e("span", { style: { color: "var(--ink-3)", display: "flex" } }, e(Icon, { name: icon, size: 16 })) : null,
        e("div", { className: "grow" },
          e("h3", { className: "t-h3" }, title),
          sub ? e("div", { className: "faint", style: { fontSize: 11.5, fontWeight: 500, marginTop: 1 } }, sub) : null
        ),
        right || null
      ),
      e("div", noPad ? null : { className: "card-pad" }, children)
    );
  }

  window.UI = { fmtEur, fmtN, ModeTag, StatusPill, Tier, AiField, Def, MarginBar, Spark, Kpi, Section };
})();
