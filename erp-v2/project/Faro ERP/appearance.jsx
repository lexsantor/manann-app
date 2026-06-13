/* FARO — appearance engine (theme/accent/density) + sign-in splash */
(function () {
  const { Icon } = window;
  const e = React.createElement;

  const DEFAULTS = { theme: "light", accent: "terra", density: "comfortable" };

  function loadAppearance() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem("faro_appearance") || "{}")); }
    catch (err) { return Object.assign({}, DEFAULTS); }
  }
  function applyAppearance(a) {
    const root = document.documentElement;
    let theme = a.theme;
    if (theme === "auto") theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-accent", a.accent);
    root.setAttribute("data-density", a.density);
  }
  function saveAppearance(a) { try { localStorage.setItem("faro_appearance", JSON.stringify(a)); } catch (err) {} }

  function Seg({ value, set, options }) {
    return e("div", { className: "seg" },
      options.map((o) =>
        e("button", { key: o.id, className: value === o.id ? "on" : "", onClick: () => set(o.id) },
          o.icon ? e(Icon, { name: o.icon, size: 14 }) : null, o.label)));
  }

  function AppearancePopover({ state, set, close }) {
    const ACCENTS = [
      { id: "terra", c: "#BC4B23" }, { id: "indigo", c: "#4F46E5" }, { id: "teal", c: "#0E8C7F" },
    ];
    return e("div", { className: "scrim", style: { background: "transparent", backdropFilter: "none", display: "block" }, onClick: close },
      e("div", { className: "pop", onClick: (ev) => ev.stopPropagation() },
        e("div", { className: "pop-row" },
          e("div", { className: "pop-title" }, "Tema"),
          e(Seg, { value: state.theme, set: (v) => set({ theme: v }),
            options: [{ id: "light", label: "Claro", icon: "sun" }, { id: "dark", label: "Oscuro", icon: "moon" }, { id: "auto", label: "Auto", icon: "display" }] })),
        e("div", { className: "pop-row" },
          e("div", { className: "pop-title" }, "Color de acento"),
          e("div", { className: "swatches" },
            ACCENTS.map((a) => e("div", { key: a.id, className: "swatch" + (state.accent === a.id ? " on" : ""), style: { background: a.c }, onClick: () => set({ accent: a.id }), title: a.id })))),
        e("div", { className: "pop-row" },
          e("div", { className: "pop-title" }, "Densidad"),
          e(Seg, { value: state.density, set: (v) => set({ density: v }),
            options: [{ id: "comfortable", label: "Cómoda" }, { id: "compact", label: "Compacta" }] }))));
  }

  function BrandMarkLg() {
    return e("svg", { width: 40, height: 40, viewBox: "0 0 32 32", fill: "none" },
      e("circle", { cx: 16, cy: 16, r: 15, fill: "#fff", fillOpacity: .08, stroke: "#fff", strokeOpacity: .2 }),
      e("circle", { cx: 16, cy: 16, r: 9, fill: "none", stroke: "#fff", strokeOpacity: .3, strokeWidth: 1.3 }),
      e("circle", { cx: 16, cy: 16, r: 4.4, fill: "var(--terra)" }),
      e("circle", { cx: 16, cy: 16, r: 1.7, fill: "#fff" }));
  }

  function LoginSplash({ onEnter }) {
    const onKey = (ev) => { if (ev.key === "Enter") onEnter(); };
    return e("div", { className: "login" },
      e("div", { className: "login-brandside" },
        e("div", { className: "login-glow" }), e("div", { className: "login-glow g2" }),
        e("div", { className: "login-mark" }, e(BrandMarkLg), e("span", { className: "login-word" }, "Faro")),
        e("div", { className: "login-tag" },
          e("div", { className: "eyebrow", style: { color: "var(--terra-deep)", opacity: .9, marginBottom: 14 } }, "El sistema operativo del tránsito"),
          e("h2", null, "El ERP que protege tu margen, expediente a expediente."),
          e("p", null, "IA nativa que puebla el expediente desde el email. Motor de cargos que no deja escapar un accesorio. Precio transparente. Diseñado para el transitario que CargoWise dejó atrás."),
          e("div", { className: "login-stats" },
            stat("+33 %", "beneficio recuperado"), stat("80 %", "menos data-entry"), stat("18", "módulos nativos")))),
      e("div", { className: "login-formside" },
        e("div", { className: "login-card" },
          e("h3", null, "Bienvenida de nuevo"),
          e("p", { className: "faint", style: { fontSize: 13, margin: "0 0 6px" } }, "Accede a tu espacio de Transitos Llevant."),
          e("div", { className: "login-field" }, e("label", null, "Correo"),
            e("input", { className: "login-input", defaultValue: "marta.ruiz@llevant.es", onKeyDown: onKey })),
          e("div", { className: "login-field" }, e("label", null, "Contraseña"),
            e("input", { className: "login-input", type: "password", defaultValue: "demo1234", onKeyDown: onKey })),
          e("div", { className: "login-foot" },
            e("label", { className: "row gap6", style: { cursor: "pointer" } }, e("input", { type: "checkbox", defaultChecked: true, style: { accentColor: "var(--terra)" } }), "Recordarme"),
            e("span", { style: { color: "var(--terra-deep)", cursor: "pointer", fontWeight: 600 } }, "¿Olvidaste tu contraseña?")),
          e("button", { className: "btn terra", style: { width: "100%", justifyContent: "center", marginTop: 18, padding: "11px" }, onClick: onEnter },
            e(Icon, { name: "arrowR", size: 16 }), "Entrar"),
          e("div", { className: "row gap8", style: { marginTop: 16, justifyContent: "center", fontSize: 11.5, color: "var(--ink-4)" } },
            e(Icon, { name: "lock", size: 13 }), "Cifrado en reposo · SOC 2 · GDPR · residencia de datos en la UE"))));
  }
  function stat(n, l) {
    return e("div", { className: "login-stat" }, e("div", { className: "n" }, n), e("div", { className: "l" }, l));
  }

  window.FaroAppearance = { loadAppearance, applyAppearance, saveAppearance, AppearancePopover, LoginSplash };

  // apply persisted appearance immediately (before React mounts → no flash)
  try { applyAppearance(loadAppearance()); } catch (err) {}
})();
