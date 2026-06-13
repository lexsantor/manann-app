/* FARO — global ops world map (mission-control style) */
(function () {
  const e = React.createElement;
  const W = 1000, H = 460;
  const proj = (lon, lat) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];

  const PORTS = {
    CNSHA: { lon: 121.5, lat: 31.2, name: "Shanghái" },
    ESBCN: { lon: 2.18, lat: 41.38, name: "Barcelona" },
    ESVLC: { lon: -0.33, lat: 39.46, name: "Valencia" },
    DEHAM: { lon: 9.9, lat: 53.5, name: "Hamburgo" },
    VNSGN: { lon: 106.7, lat: 10.8, name: "Ho Chi Minh" },
    BRSSZ: { lon: -46.3, lat: -23.9, name: "Santos" },
    MXMEX: { lon: -99, lat: 19.4, name: "México" },
    DEFRA: { lon: 8.68, lat: 50.1, name: "Frankfurt" },
  };
  const ROUTES = [
    { from: "CNSHA", to: "ESBCN", status: "active", exp: "S-2026-04417" },
    { from: "VNSGN", to: "ESBCN", status: "active", exp: "S-2026-04388" },
    { from: "DEFRA", to: "MXMEX", status: "air", exp: "S-2026-04431" },
    { from: "ESVLC", to: "BRSSZ", status: "done", exp: "S-2026-04369" },
    { from: "DEHAM", to: "ESBCN", status: "done", exp: "S-2026-04330" },
  ];
  const COLOR = { active: "var(--terra)", air: "#E8A24A", done: "#3D9E66" };

  function arc(a, b, lift) {
    const [x1, y1] = a, [x2, y2] = b;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const cy = my - dist * (lift || 0.28);
    return { d: `M${x1} ${y1} Q${mx} ${cy} ${x2} ${y2}`, id: "r" + Math.round(x1) + Math.round(x2) };
  }

  function WorldMap({ navigate }) {
    // dot grid backdrop
    const dots = [];
    for (let gx = 16; gx < W; gx += 23) {
      for (let gy = 18; gy < H; gy += 23) {
        const dx = (gx - W / 2) / (W / 2), dy = (gy - H / 2) / (H / 2);
        const v = 1 - Math.min(1, dx * dx + dy * dy); // vignette
        if (v < 0.06) continue;
        dots.push(e("circle", { key: gx + "-" + gy, className: "opsmap-dot", cx: gx, cy: gy, r: 1.4, opacity: 0.18 + v * 0.5 }));
      }
    }
    const ports = {};
    Object.keys(PORTS).forEach((k) => (ports[k] = proj(PORTS[k].lon, PORTS[k].lat)));

    return e("div", { className: "opsmap" },
      e("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "xMidYMid meet" },
        e("g", null, dots),
        // routes
        ROUTES.map((r, i) => {
          const A = ports[r.from], B = ports[r.to];
          const path = arc(A, B, r.status === "air" ? 0.34 : 0.26);
          const col = COLOR[r.status];
          return e("g", { key: i, style: { cursor: "pointer" }, onClick: () => navigate && navigate("expediente", { id: r.exp }) },
            e("path", { id: path.id, className: "opsmap-route", d: path.d, stroke: col, strokeWidth: 1.4, opacity: 0.4 }),
            e("path", { className: "opsmap-route opsmap-flow", d: path.d, stroke: col, strokeWidth: 2 }),
            r.status !== "done"
              ? e("circle", { r: 3, fill: col },
                  e("animateMotion", { dur: (5 + i) + "s", repeatCount: "indefinite", path: path.d }))
              : null);
        }),
        // ports
        Object.keys(PORTS).map((k) => {
          const [x, y] = ports[k];
          const active = ROUTES.some((r) => (r.from === k || r.to === k) && r.status !== "done");
          return e("g", { key: k },
            active ? e("circle", { className: "opsmap-pulse", cx: x, cy: y, r: 5 }) : null,
            e("circle", { className: "opsmap-port-ring", cx: x, cy: y, r: 5, strokeWidth: 1.4, style: { stroke: active ? "var(--terra)" : "#3D9E66" } }),
            e("circle", { className: "opsmap-port", cx: x, cy: y, r: 2.4 }),
            e("text", { className: "opsmap-city", x: x + 8, y: y + 3 }, PORTS[k].name));
        })),
      e("div", { className: "opsmap-stat" },
        e("div", { className: "n" }, "3"), e("div", { className: "l" }, "en tránsito ahora")),
      e("div", { className: "opsmap-legend" },
        leg("var(--terra)", "Marítimo activo"), leg("#E8A24A", "Aéreo"), leg("#3D9E66", "Entregado")));
  }
  function leg(c, t) {
    return e("div", { className: "opsmap-leg" }, e("span", { className: "d", style: { background: c } }), t);
  }

  window.WorldMap = WorldMap;
})();
