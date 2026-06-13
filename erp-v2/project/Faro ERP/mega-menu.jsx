/* FARO — Mega-menu launcher (flyout submenus, like a real ES ERP) */
(function () {
  const { Icon } = window;
  const e = React.createElement;

  function MegaMenu({ navigate, close }) {
    const TREE = window.FARO_MOD.TREE;
    const [open, setOpen] = React.useState(null); // {idx, top}
    const onEnter = (idx, ev) => {
      const r = ev.currentTarget.getBoundingClientRect();
      setOpen({ idx, top: Math.min(r.top, window.innerHeight - 360) });
    };
    const go = (id) => { navigate(id); close(); };
    const sec = open != null ? TREE[open.idx] : null;

    return e("div", { className: "mega-scrim", onClick: close },
      e("div", { className: "mega", onClick: (ev) => ev.stopPropagation(), onMouseLeave: () => {} },
        TREE.map((s, idx) =>
          e("div", { key: s.id,
              className: "mega-item" + (open && open.idx === idx ? " open" : ""),
              onMouseEnter: (ev) => onEnter(idx, ev),
              onClick: () => { if (s.children.length === 1) go(s.children[0].id); else { /* keep open */ } } },
            e(Icon, { name: s.icon, size: 17, className: "lead" }),
            s.label,
            s.children.length > 1 ? e(Icon, { name: "chevR", size: 15, className: "chev" }) : null))),
      sec ? e("div", { className: "mega-fly", style: { left: 290, top: open.top },
            onClick: (ev) => ev.stopPropagation(), onMouseEnter: () => setOpen(open) },
          e("div", { className: "fly-head" }, sec.label),
          sec.children.map((c) =>
            e("div", { key: c.id, className: "mega-leaf", onClick: () => go(c.id) },
              e("span", { className: "dotc" }), c.label))) : null
    );
  }

  window.MegaMenu = MegaMenu;
})();
