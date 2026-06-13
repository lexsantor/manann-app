/* FARO — app shell, router, mega-menu, command palette, toasts */
(function () {
  const { Icon, UI } = window;
  const e = React.createElement;

  // curated sidebar (full breadth lives in the Menú launcher)
  const NAV = [
    { group: "Operación", items: [
      { id: "briefing", label: "Briefing", icon: "sun", sec: "inicio" },
      { id: "inbox", label: "Bandeja", icon: "inbox", sec: "inicio", alert: true },
      { id: "autopilot", label: "Acciones IA", icon: "sparkle", sec: "inicio", agent: true },
      { id: "shipments", label: "Expedientes", icon: "files", sec: "general" },
      { id: "mar-fcl", label: "Marítimo", icon: "ship", sec: "maritimo" },
      { id: "air-awb", label: "Aéreo", icon: "plane", sec: "aereo" },
      { id: "ter-ordenes", label: "Terrestre", icon: "truck", sec: "terrestre" },
      { id: "tracking", label: "Tracking", icon: "pin", sec: "tracking" },
    ]},
    { group: "Comercial", items: [
      { id: "com-pipeline", label: "Comercial", icon: "users", sec: "comercial" },
      { id: "quote", label: "Cotizaciones", icon: "quote", sec: "general" },
      { id: "red", label: "Red & Partners", icon: "handshake", sec: "red" },
    ]},
    { group: "Administración", items: [
      { id: "adu-dua", label: "Aduanas", icon: "customs", sec: "aduanas" },
      { id: "fac-venta", label: "Facturación", icon: "invoice", sec: "facturacion" },
      { id: "con-asientos", label: "Contabilidad", icon: "bank", sec: "contabilidad" },
    ]},
    { group: "Análisis", items: [
      { id: "bi", label: "Power BI", icon: "grid", sec: "bi" },
      { id: "sostenibilidad", label: "Sostenibilidad", icon: "shield", sec: "sostenibilidad" },
      { id: "lis-margenes", label: "Listados", icon: "files", sec: "listados" },
      { id: "consultas", label: "Consultas", icon: "search", sec: "consultas" },
    ]},
    { group: "Configuración", items: [
      { id: "m-contenedores", label: "Tablas maestras", icon: "bank", sec: "tablas" },
      { id: "sys-api", label: "Integraciones", icon: "link", sec: "integraciones" },
      { id: "cal-incidencias", label: "Calidad", icon: "shield", sec: "calidad" },
      { id: "proc-batch", label: "Procesos", icon: "settings", sec: "procesos" },
      { id: "sys-usuarios", label: "Sistema", icon: "settings", sec: "sistema" },
    ]},
  ];

  function secOf(id) {
    const T = window.FARO_MOD.TREE;
    for (const s of T) if (s.id === id || s.children.some((c) => c.id === id)) return s.id;
    if (id === "expediente") return "general";
    return null;
  }
  function leafLabel(id) {
    const T = window.FARO_MOD.TREE;
    for (const s of T) { const c = s.children.find((x) => x.id === id); if (c) return [s.label, c.label]; }
    return ["", ""];
  }

  function BrandMark() {
    return e("svg", { className: "brand-mark", viewBox: "0 0 32 32", fill: "none" },
      e("circle", { cx: 16, cy: 16, r: 15, fill: "var(--ink)" }),
      e("circle", { cx: 16, cy: 16, r: 9, fill: "none", stroke: "#fff", strokeOpacity: .28, strokeWidth: 1.4 }),
      e("circle", { cx: 16, cy: 16, r: 4.4, fill: "var(--terra)" }),
      e("circle", { cx: 16, cy: 16, r: 1.7, fill: "#fff" }));
  }

  const NAV_IDS = new Set();
  NAV.forEach((g) => g.items.forEach((it) => NAV_IDS.add(it.id)));
  const SPECIAL_LABEL = { briefing: ["Inicio", "Briefing matutino"], autopilot: ["Copiloto", "Acciones IA"] };

  function Sidebar({ view, navigate }) {
    const D = window.FARO;
    const curSec = secOf(view.name);
    const isDirect = NAV_IDS.has(view.name);
    return e("aside", { className: "sidebar" },
      e("div", { className: "brand" },
        e(BrandMark),
        e("div", { className: "col", style: { gap: 0 } },
          e("span", { className: "brand-word" }, "Faro"),
          e("span", { className: "brand-sub" }, "Tránsito · ERP"))),
      e("nav", { className: "nav long" },
        NAV.map((g) =>
          e(React.Fragment, { key: g.group },
            e("div", { className: "nav-group-label" }, g.group),
            g.items.map((it) => {
              const active = it.id === view.name || (!isDirect && it.sec === curSec);
              return e("div", { key: it.id, className: "nav-item" + (active ? " active" : "") + (it.alert ? " alert" : ""),
                  onClick: () => navigate(it.id) },
                e(Icon, { name: it.icon, size: 17 }), it.label,
                it.alert ? e("span", { className: "nav-count" }, D.exceptions.length) : null,
                it.agent ? e("span", { className: "nav-count", style: { background: "var(--terra-tint)", color: "var(--terra-deep)" } }, window.FARO_PROD.actions.length) : null);
            })))),
      e("div", { className: "side-foot" },
        e("div", { className: "org" },
          e("div", { className: "org-logo" }, D.org.initials),
          e("div", { className: "col", style: { gap: 0 } },
            e("span", { className: "org-name" }, D.org.name),
            e("span", { className: "org-meta" }, D.org.meta)),
          e(Icon, { name: "chevD", size: 14, style: { marginLeft: "auto", color: "var(--ink-4)" } }))));
  }

  function Topbar({ view, navigate, openCmd, openMega, onGuide, appearance, setAppearance, openAppearance, openCopilot, openQuickAdd, openNotif }) {
    const D = window.FARO;
    const lbl = view.name === "expediente" ? ["General", view.params.id] : (SPECIAL_LABEL[view.name] || leafLabel(view.name));
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    return e("header", { className: "topbar" },
      e("button", { className: "menu-btn", onClick: openMega }, e(Icon, { name: "grid", size: 16 }), "Menú"),
      e("div", { className: "crumb" },
        e("span", null, lbl[0]),
        e(Icon, { name: "chevR", size: 13 }),
        e("b", null, lbl[1] || "Faro")),
      e("div", { className: "search", onClick: openCmd },
        e(Icon, { name: "search", size: 15 }),
        e("span", { className: "grow", style: { fontSize: 12.5 } }, "Buscar o ejecutar una acción…"),
        e("span", { className: "kbd" }, "⌘K")),
      e("button", { className: "copilot-btn", onClick: openCopilot, title: "Faro IA · Copiloto (⌘J)" },
        e("span", { className: "copilot-orb" }, e(Icon, { name: "sparkle", size: 13 })), "Faro IA",
        e("span", { className: "copilot-kbd" }, "⌘J")),
      e("div", { className: "top-actions" },
        e("button", { className: "btn terra sm", onClick: openQuickAdd, id: "qa-anchor", title: "Crear rápido (⌘N)" }, e(Icon, { name: "plus", size: 15 }), "Crear"),
        e("button", { className: "icon-btn", onClick: () => setAppearance({ theme: isDark ? "light" : "dark" }), title: isDark ? "Modo claro" : "Modo oscuro" }, e(Icon, { name: isDark ? "sun" : "moon", size: 17 })),
        e("button", { className: "icon-btn", onClick: openAppearance, title: "Apariencia" }, e(Icon, { name: "sliders", size: 17 })),
        e("button", { className: "icon-btn", onClick: onGuide, title: "Guía de esta sección" }, e(Icon, { name: "help", size: 17 })),
        e("button", { className: "icon-btn", onClick: openNotif, title: "Notificaciones (⌘B)" }, e(Icon, { name: "bell", size: 17 }), e("span", { className: "dot" })),
        e("div", { className: "avatar", title: D.user.name }, D.user.initials)));
  }

  function Cmdk({ navigate, close, toast, setAppearance, isDark, openCopilot }) {
    const [q, setQ] = React.useState("");
    const [sel, setSel] = React.useState(0);
    const T = window.FARO_MOD.TREE;
    const goItems = T.flatMap((s) => s.children.map((c) => ({ t: c.label, sec: s.label, run: () => navigate(c.id) })));
    // ⌘K that DOES things, not just navigates
    const actions = [
      { t: "Facturar el THC destino pendiente · S-2026-04417", icon: "money", run: () => { toast("THC destino facturado · +210 € de margen"); navigate("expediente", { id: "S-2026-04417" }); } },
      { t: "Aprobar todas las Acciones IA del Autopilot", icon: "sparkle", run: () => { navigate("autopilot"); setTimeout(() => toast("7 acciones listas para aprobar"), 300); } },
      { t: "Nueva ingesta IA de documento", icon: "sparkle", run: () => navigate("ingest") },
      { t: "Redactar un email con el Copiloto", icon: "invoice", run: () => openCopilot() },
      { t: "Cambiar a modo " + (isDark ? "claro" : "oscuro"), icon: isDark ? "sun" : "moon", run: () => setAppearance({ theme: isDark ? "light" : "dark" }) },
      { t: "Generar informe CSRD de emisiones", icon: "download", run: () => { navigate("sostenibilidad"); setTimeout(() => toast("Informe CSRD generado"), 300); } },
      { t: "Preparar el cierre contable de junio", icon: "bank", run: () => navigate("con-cierre") },
      { t: "Abrir expediente S-2026-04417", icon: "file", run: () => navigate("expediente", { id: "S-2026-04417" }) },
    ];
    const fA = actions.filter((r) => r.t.toLowerCase().includes(q.toLowerCase()));
    const fG = goItems.filter((r) => r.t.toLowerCase().includes(q.toLowerCase())).slice(0, 7);
    const flat = [...fA, ...fG];
    const go = (r) => { r.run(); close(); };
    const onKey = (ev) => {
      if (ev.key === "ArrowDown") { ev.preventDefault(); setSel((s) => Math.min(s + 1, flat.length - 1)); }
      else if (ev.key === "ArrowUp") { ev.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      else if (ev.key === "Enter" && flat[sel]) go(flat[sel]);
    };
    React.useEffect(() => setSel(0), [q]);
    let idx = -1;
    const rowCls = (i) => "cmdk-item" + (i === sel ? " sel" : "");
    return e("div", { className: "scrim", onClick: close },
      e("div", { className: "cmdk", onClick: (ev) => ev.stopPropagation() },
        e("div", { className: "cmdk-in" }, e(Icon, { name: "cmd", size: 18 }),
          e("input", { autoFocus: true, value: q, placeholder: "Busca un módulo o ejecuta una acción…", onChange: (ev) => setQ(ev.target.value), onKeyDown: onKey })),
        e("div", { className: "cmdk-list" },
          fA.length ? e("div", { className: "cmdk-sec" }, "Acciones · ejecutar") : null,
          fA.map((r) => { idx++; const i = idx; return e("div", { key: "a" + i, className: rowCls(i), onMouseEnter: () => setSel(i), onClick: () => go(r) }, e(Icon, { name: r.icon, size: 16 }), e("span", { className: "t" }, r.t), e("span", { className: "s" }, "↵")); }),
          fG.length ? e("div", { className: "cmdk-sec" }, "Ir a módulo") : null,
          fG.map((r) => { idx++; const i = idx; return e("div", { key: "g" + i, className: rowCls(i), onMouseEnter: () => setSel(i), onClick: () => go(r) }, e(Icon, { name: "arrowR", size: 16 }), e("span", { className: "t" }, r.t), e("span", { className: "s" }, r.sec)); }),
          flat.length === 0 ? e("div", { className: "faint", style: { padding: 16, fontSize: 13 } }, "Sin resultados.") : null)));
  }

  function Toasts({ toasts }) {
    return e("div", { className: "toasts" }, toasts.map((t) => e("div", { key: t.id, className: "toast" }, e(Icon, { name: "checkCircle", size: 17, className: "tg" }), t.msg)));
  }

  function ModulePlaceholder({ navigate, name }) {
    const lbl = leafLabel(name);
    return e("div", { className: "page screen-enter" },
      e("div", { className: "page-head" }, e("div", { className: "grow" }, e("div", { className: "eyebrow" }, lbl[0]), e("h1", { className: "t-h1" }, lbl[1] || "Módulo"))),
      e("div", { className: "card card-pad", style: { display: "flex", gap: 20, alignItems: "flex-start", padding: 26 } },
        e("div", { style: { width: 50, height: 50, borderRadius: 14, background: "var(--surface-2)", display: "grid", placeItems: "center", flex: "none" } }, e(Icon, { name: "files", size: 24, style: { color: "var(--ink-2)" } })),
        e("div", { className: "grow" },
          e("p", { className: "muted", style: { fontSize: 13.5, marginTop: 0, maxWidth: 540 } }, "Este submódulo forma parte del mapa funcional de Faro. En esta demo se prioriza el motor de cargos, la ingesta IA y la conciliación contable — donde vive el 80 % del valor."),
          e("div", { className: "row gap8 mt16" },
            e("button", { className: "btn", onClick: () => navigate("inbox") }, "← Bandeja"),
            e("button", { className: "btn terra", onClick: () => navigate("ingest") }, e(Icon, { name: "sparkle", size: 14 }), "Probar Ingesta IA")))));
  }

  function App() {
    const [view, setView] = React.useState({ name: "inbox", params: {} });
    const [cmd, setCmd] = React.useState(false);
    const [mega, setMega] = React.useState(false);
    const [cop, setCop] = React.useState(false);
    const [quickAdd, setQuickAdd] = React.useState(false);
    const [notif, setNotif] = React.useState(false);
    const [kbdMap, setKbdMap] = React.useState(false);
    const [toasts, setToasts] = React.useState([]);
    const tid = React.useRef(0);

    // module agents (spawned from onboarding guides), persisted
    const [agentSec, setAgentSec] = React.useState(null);
    const [agentsOn, setAgentsOn] = React.useState(() => {
      try { return new Set(JSON.parse(localStorage.getItem("faro_agents") || "[]")); } catch (e) { return new Set(); }
    });

    // onboarding guides (persisted)
    const [onbSeen, setOnbSeen] = React.useState(() => {
      try { return new Set(JSON.parse(localStorage.getItem("faro_onb_seen") || "[]")); } catch (e) { return new Set(); }
    });
    const [onbOff, setOnbOff] = React.useState(() => localStorage.getItem("faro_onb_off") === "1");
    const [forcedSec, setForcedSec] = React.useState(null);

    // appearance (theme / accent / density)
    const A = window.FaroAppearance;
    const [appearance, setAppearanceState] = React.useState(() => A.loadAppearance());
    const [appOpen, setAppOpen] = React.useState(false);
    React.useEffect(() => { A.applyAppearance(appearance); A.saveAppearance(appearance); }, [appearance]);
    const setAppearance = (patch) => setAppearanceState((p) => ({ ...p, ...patch }));

    // sign-in gate (per session)
    const [entered, setEntered] = React.useState(() => sessionStorage.getItem("faro_entered") === "1");
    const enter = () => { sessionStorage.setItem("faro_entered", "1"); setEntered(true); };

    const navigate = (name, params = {}) => {
      setView({ name, params }); setMega(false); setCmd(false); setForcedSec(null);
      const c = document.querySelector(".content"); if (c) c.scrollTop = 0;
    };
    const toast = (msg) => { const id = ++tid.current; setToasts((t) => [...t, { id, msg }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800); };

    const curSec = secOf(view.name);
    const hasGuide = curSec && window.FARO_ONBOARD && window.FARO_ONBOARD[curSec];
    const showOnb = hasGuide && (forcedSec === curSec || (!onbOff && !onbSeen.has(curSec)));
    const closeOnb = () => {
      setForcedSec(null);
      setOnbSeen((prev) => { const n = new Set(prev); n.add(curSec); try { localStorage.setItem("faro_onb_seen", JSON.stringify([...n])); } catch (e) {} return n; });
    };
    const disableOnb = () => { setOnbOff(true); setForcedSec(null); try { localStorage.setItem("faro_onb_off", "1"); } catch (e) {} };
    const openGuide = () => { if (hasGuide) { setOnbOff(false); setForcedSec(curSec); } };

    // convert a guide into a persistent module agent
    const convertToAgent = (sec) => {
      setForcedSec(null);
      setOnbSeen((prev) => { const n = new Set(prev); n.add(sec); try { localStorage.setItem("faro_onb_seen", JSON.stringify([...n])); } catch (e) {} return n; });
      setAgentsOn((prev) => { const n = new Set(prev); n.add(sec); try { localStorage.setItem("faro_agents", JSON.stringify([...n])); } catch (e) {} return n; });
      setAgentSec(sec);
    };
    const agentActiveHere = hasGuide && agentsOn.has(curSec);

    React.useEffect(() => {
      let gPending = false, gTimer = null;
      const GO = { b: "inbox", e: "shipments", a: "autopilot", i: "briefing", p: "bi", t: "tracking" };
      const isTyping = (t) => t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      const h = (ev) => {
        const meta = ev.metaKey || ev.ctrlKey;
        if (meta && ev.key.toLowerCase() === "k") { ev.preventDefault(); setCmd((c) => !c); return; }
        if (meta && ev.key.toLowerCase() === "j") { ev.preventDefault(); setCop((c) => !c); return; }
        if (meta && ev.key.toLowerCase() === "n") { ev.preventDefault(); setQuickAdd((c) => !c); return; }
        if (meta && ev.key.toLowerCase() === "b") { ev.preventDefault(); setNotif((c) => !c); return; }
        if (meta && ev.key === "/") { ev.preventDefault(); setAppearance({ theme: document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark" }); return; }
        if (ev.key === "Escape") { setCmd(false); setMega(false); setCop(false); setQuickAdd(false); setNotif(false); setKbdMap(false); setAgentSec(null); return; }
        if (isTyping(ev.target) || meta) return;
        if (ev.key === "?") { ev.preventDefault(); setKbdMap(true); return; }
        if (ev.key.toLowerCase() === "g") { gPending = true; clearTimeout(gTimer); gTimer = setTimeout(() => (gPending = false), 1200); return; }
        if (gPending && GO[ev.key.toLowerCase()]) { gPending = false; navigate(GO[ev.key.toLowerCase()]); }
      };
      window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
    }, []);

    const BESPOKE = {
      inbox: () => e(window.InboxScreen, { navigate, toast }),
      dashboard: () => e(window.DashboardScreen, { navigate }),
      shipments: () => e(window.ShipmentsScreen, { navigate, toast }),
      expediente: () => e(window.ExpedienteScreen, { navigate, id: view.params.id, toast }),
      quote: () => e(window.QuoteScreen, { navigate, toast }),
      ingest: () => e(window.IngestScreen, { navigate, toast }),
      "com-pipeline": () => e(window.ComercialScreen, { navigate }),
      "con-asientos": () => e(window.ContabilidadScreen, { navigate }),
      "con-cierre": () => e(window.ContabilidadScreen, { navigate }),
      "con-tesoreria": () => e(window.ContabilidadScreen, { navigate }),
      "sys-usuarios": () => e(window.SistemaScreen, { navigate }),
      "sys-roles": () => e(window.SistemaScreen, { navigate }),
      "sys-empresas": () => e(window.SistemaScreen, { navigate }),
      "cal-incidencias": () => e(window.CalidadScreen, { navigate }),
      "cal-nc": () => e(window.CalidadScreen, { navigate }),
      "cal-sla": () => e(window.CalidadScreen, { navigate }),
      bi: () => e(window.BIScreen, { navigate }),
      tracking: () => e(window.TrackingScreen, { navigate }),
      consultas: () => e(window.ConsultasScreen, { navigate }),
      "com-oport": () => e(window.ComercialScreen, { navigate }),
      "com-tarifas": () => e(window.RateScreen, { navigate, toast }),
      sostenibilidad: () => e(window.SustainabilityScreen, { navigate }),
      "sys-api": () => e(window.IntegrationsScreen, { navigate }),
      portal: () => e(window.PortalScreen, { navigate }),
      red: () => e(window.PartnersHubScreen, { navigate, toast }),
      "red-agentes": () => e(window.AgentNetworkScreen, { navigate, toast }),
      "tender-red": () => e(window.TenderScreen, { navigate, toast }),
      "proveedores-scorecard": () => e(window.ScorecardScreen, { navigate }),
      "docs-digitales": () => e(window.DigitalDocsScreen, { navigate }),
      "compliance-screening": () => e(window.ComplianceScreen, { navigate, toast }),
      briefing: () => e(window.BriefingScreen, { navigate, toast }),
      autopilot: () => e(window.AutopilotScreen, { navigate, toast }),
    };
    // all aduanas leaves → AduanasScreen
    ["adu-dua","adu-ics2","adu-ncts","adu-aes","adu-regimenes"].forEach((k) => (BESPOKE[k] = () => e(window.AduanasScreen, { navigate })));

    let screen;
    if (BESPOKE[view.name]) screen = BESPOKE[view.name]();
    else if (window.FARO_MOD.GRID[view.name]) screen = e(window.DataModule, { navigate, toast, cfg: window.FARO_MOD.GRID[view.name] });
    else screen = e(ModulePlaceholder, { navigate, name: view.name });

    const fullBleed = view.name === "ingest";
    if (!entered) return e(window.FaroAppearance.LoginSplash, { onEnter: enter });
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const qaX = Math.max(20, (typeof window !== "undefined" ? window.innerWidth : 1200) - 760);
    return e("div", { className: "app" },
      e(Sidebar, { view, navigate }),
      e("div", { className: "main" },
        e(Topbar, { view, navigate, openCmd: () => setCmd(true), openMega: () => setMega(true), onGuide: openGuide, appearance, setAppearance, openAppearance: () => setAppOpen(true), openCopilot: () => setCop(true), openQuickAdd: () => setQuickAdd(true), openNotif: () => setNotif(true) }),
        e("div", { className: "content", style: fullBleed ? { overflow: "hidden" } : null }, screen)),
      mega ? e(window.MegaMenu, { navigate, close: () => setMega(false) }) : null,
      cmd ? e(Cmdk, { navigate, close: () => setCmd(false), toast, setAppearance, isDark, openCopilot: () => setCop(true) }) : null,
      cop ? e(window.Copilot, { navigate, toast, close: () => setCop(false) }) : null,
      agentSec ? e(window.ModuleAgent, { sec: agentSec, navigate, toast, close: () => setAgentSec(null) }) : null,
      appOpen ? e(window.FaroAppearance.AppearancePopover, { state: appearance, set: setAppearance, close: () => setAppOpen(false) }) : null,
      quickAdd ? e(window.FaroProd.QuickAdd, { navigate, close: () => setQuickAdd(false), anchorX: qaX }) : null,
      notif ? e(window.FaroProd.Notifications, { navigate, close: () => setNotif(false) }) : null,
      kbdMap ? e(window.FaroProd.KeyboardMap, { close: () => setKbdMap(false) }) : null,
      showOnb ? e(window.Onboarding, { sec: curSec, onClose: closeOnb, onDisable: disableOnb, onConvert: convertToAgent }) : null,
      (agentActiveHere && !agentSec && !showOnb) ? e("button", { className: "agent-fab", onClick: () => setAgentSec(curSec) },
        e("span", { className: "agent-fab-orb" }, e(Icon, { name: "sparkle", size: 16 })),
        e("div", { className: "col", style: { gap: 0, alignItems: "flex-start" } },
          e("span", null, "Asistente de " + ((window.FARO_MOD.TREE.find((s) => s.id === curSec) || {}).label || "módulo")),
          e("span", { className: "sub" }, "Pregúntame lo que sea"))) : null,
      e(Toasts, { toasts }));
  }

  window.FaroApp = App;
})();
