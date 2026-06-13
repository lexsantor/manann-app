/* FARO — productivity overlays: keyboard map, quick-add, notifications, bulk bar */
(function () {
  const { Icon } = window;
  const e = React.createElement;

  function Kbd({ k }) { return e("span", { className: "kbd" }, k); }

  /* ---- Keyboard shortcut map ---- */
  function KeyboardMap({ close }) {
    const S = window.FARO_PROD.shortcuts;
    return e("div", { className: "scrim", style: { placeItems: "center" }, onClick: close },
      e("div", { className: "modal kbd-modal", onClick: (ev) => ev.stopPropagation(), style: { maxHeight: "none" } },
        e("div", { className: "modal-head" },
          e(Icon, { name: "cmd", size: 18, style: { color: "var(--ink-3)" } }),
          e("div", { className: "grow" }, e("div", { className: "t-h3" }, "Mapa de teclado"), e("div", { className: "faint", style: { fontSize: 11.5 } }, "Faro está pensado para no soltar el teclado")),
          e("button", { className: "icon-btn", onClick: close }, e(Icon, { name: "x", size: 16 }))),
        e("div", { style: { padding: "16px 20px" } },
          e("div", { className: "kbd-grid" },
            S.map((s, i) =>
              e("div", { key: i, className: "kbd-row" },
                e("span", { className: "lbl" }, s.lbl),
                e("span", { className: "kbd-keys" }, s.keys.map((k, j) => e(Kbd, { key: j, k }))))))))
    );
  }

  /* ---- Quick add ---- */
  function QuickAdd({ navigate, close, anchorX }) {
    const items = window.FARO_PROD.quickAdd;
    return e("div", { className: "scrim", style: { background: "transparent", backdropFilter: "none", display: "block" }, onClick: close },
      e("div", { className: "qa-pop", style: { left: (anchorX || 280) + "px" }, onClick: (ev) => ev.stopPropagation() },
        e("div", { style: { padding: "4px 8px 7px", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-4)", fontWeight: 600 } }, "Crear nuevo"),
        items.map((it) =>
          e("div", { key: it.id, className: "qa-item", onClick: () => { navigate(it.go[0]); close(); } },
            e("span", { className: "ic" }, e(Icon, { name: it.icon, size: 16 })),
            it.label, e("span", { className: "s" }, it.kbd)))));
  }

  /* ---- Notification center ---- */
  function Notifications({ navigate, close }) {
    const [items, setItems] = React.useState(window.FARO_PROD.notifs);
    const markAll = () => setItems((l) => l.map((n) => ({ ...n, unread: false })));
    const open = (n) => { if (n.exp) navigate("expediente", { id: n.exp }); else if (n.go) navigate(n.go[0]); close(); };
    return e("div", { className: "scrim", style: { background: "transparent", backdropFilter: "none", display: "block" }, onClick: close },
      e("div", { className: "notif-pop", onClick: (ev) => ev.stopPropagation() },
        e("div", { className: "notif-head" },
          e(Icon, { name: "bell", size: 16, style: { color: "var(--ink-3)" } }),
          e("div", { className: "t-h3 grow" }, "Notificaciones"),
          e("button", { className: "btn sm ghost", onClick: markAll }, "Marcar leídas")),
        e("div", { className: "notif-list" },
          items.map((n) =>
            e("div", { key: n.id, className: "notif" + (n.unread ? " unread" : ""), onClick: () => open(n) },
              e("div", { className: "notif-ic", style: { background: "var(--" + n.tone + "-tint)", color: "var(--" + (n.tone === "blue" ? "blue" : n.tone === "neutral" ? "ink-2" : n.tone + "-ink") + ")" } }, e(Icon, { name: n.icon, size: 16 })),
              e("div", { className: "grow" },
                e("div", { className: "notif-t" }, n.t), e("div", { className: "notif-d" }, n.d), e("div", { className: "notif-time" }, n.time)),
              n.unread ? e("span", { className: "sdot terra", style: { background: "var(--terra)", marginTop: 5 } }) : null))),
        e("div", { style: { padding: "10px 15px", borderTop: "1px solid var(--line-2)", textAlign: "center" } },
          e("button", { className: "btn sm ghost", onClick: () => { navigate("autopilot"); close(); } }, e(Icon, { name: "sparkle", size: 13 }), "Ver acciones que Faro puede automatizar"))));
  }

  window.FaroProd = { KeyboardMap, QuickAdd, Notifications };
})();
