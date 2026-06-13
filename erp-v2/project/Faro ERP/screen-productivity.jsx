/* FARO — Briefing Matutino + Acciones IA (Autopilot) screens */
(function () {
  const { Icon, UI } = window;
  const { fmtEur } = UI;
  const e = React.createElement;
  const TONE = { red: "red", amber: "amber", blue: "blue", green: "green" };

  /* ===================== BRIEFING MATUTINO ===================== */
  function BriefingScreen({ navigate, toast }) {
    const D = window.FARO, P = window.FARO_PROD;
    const totalRisk = D.exceptions.reduce((a, x) => a + (x.risk || 0), 0);
    const items = [
      { crit: true, t: "Factura el THC destino de Acme antes del cierre", d: "S-2026-04417 · evita −65 % de GP", go: ["expediente", { id: "S-2026-04417" }] },
      { crit: true, t: "Recoge el contenedor de Lumo: 3º día de demurrage", d: "S-2026-04388 · ~150 €/día", go: ["expediente", { id: "S-2026-04388" }] },
      { crit: false, t: "2 envíos llegan hoy a Barcelona", d: "Prepara avisos de llegada y despacho", go: ["tracking"] },
      { crit: false, t: "Reclama el pago vencido de Delta Foods", d: "FV-2026-1175 · 6.498 € · venció hace 5 días", go: ["fac-venta"] },
      { crit: false, t: "Confirma 5 campos IA pendientes", d: "S-2026-04417 · listos para el DUA", go: ["expediente", { id: "S-2026-04417" }] },
    ];
    const hour = new Date().getHours();
    const greet = hour < 14 ? "Buenos días" : hour < 21 ? "Buenas tardes" : "Buenas noches";
    return e("div", { className: "page page-wide screen-enter" },
      e("div", { className: "brief-hero" },
        e("div", { className: "eyebrow", style: { color: "var(--terra-deep)", marginBottom: 10, position: "relative", zIndex: 1 } }, "Briefing matutino · " + new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })),
        e("h1", { className: "brief-hello" }, greet + ", " + D.user.name.split(" ")[0] + "."),
        e("p", { className: "brief-sub" }, "Faro ha revisado tus " + D.shipments.length + " expedientes mientras dormías. Esto es lo que importa hoy — empieza por lo crítico y deja que el Autopilot haga el resto."),
        e("div", { className: "brief-chips" },
          bchip(fmtEur(totalRisk), "margen en riesgo"),
          bchip("2", "tareas críticas"),
          bchip("7", "acciones que Faro puede hacer por ti"),
          bchip(P.timeSaved.hours + " h", "ahorradas esta semana"))),
      e("div", { style: { display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, alignItems: "start" } },
        e(UI.Section, { title: "Tu plan para hoy", icon: "check", sub: "Ordenado por impacto en margen",
            right: e("button", { className: "btn sm terra", onClick: () => navigate("autopilot") }, e(Icon, { name: "sparkle", size: 13 }), "Abrir Autopilot") },
          e("div", { className: "brief-list" },
            items.map((it, i) =>
              e("div", { key: i, className: "brief-item" + (it.crit ? " crit" : ""), onClick: () => navigate(it.go[0], it.go[1] || {}) },
                e("div", { className: "brief-num" }, it.crit ? e(Icon, { name: "alert", size: 13 }) : i + 1),
                e("div", null, e("div", { style: { fontWeight: 600, fontSize: 13.5 } }, it.t), e("div", { className: "faint", style: { fontSize: 12, marginTop: 1 } }, it.d)),
                e(Icon, { name: "arrowR", size: 16, style: { color: "var(--ink-4)" } }))))),
        e("div", { className: "col gap16" },
          TimeSavedCard(P.timeSaved),
          e(UI.Section, { title: "Agenda de hoy", icon: "clock" },
            e("div", { className: "col gap10" },
              agendaRow("09:00", "Llega CMA CGM TROCADERO info ETA", "blue"),
              agendaRow("12:30", "Cierre de tarifa Nordix (COT-0912)", "amber"),
              agendaRow("16:00", "Recogida Lumo · Drayage BCN", "red"),
              agendaRow("18:00", "Cut-off documental MSC ISABELLA", "neutral")))))
    );
  }
  function bchip(n, l) { return e("div", { className: "brief-chip" }, e("div", { className: "n" }, n), e("div", { className: "l" }, l)); }
  function agendaRow(time, txt, tone) {
    return e("div", { className: "row gap10", style: { fontSize: 12.5 } },
      e("span", { className: "mono", style: { color: "var(--ink-3)", width: 42 } }, time),
      e("span", { className: "sdot " + tone }), e("span", { className: "grow" }, txt));
  }
  function TimeSavedCard(ts) {
    const r = 38, C = 2 * Math.PI * r, off = C * (1 - ts.pct / 100);
    return e("div", { className: "card card-pad", style: { borderColor: "var(--terra)" } },
      e("div", { className: "row mb16" }, e(Icon, { name: "bolt", size: 16, style: { color: "var(--terra)" } }), e("h3", { className: "t-h3 grow" }, "Tiempo que Faro te ahorró"), e("span", { className: "pill terra" }, "esta semana")),
      e("div", { className: "tsaved" },
        e("div", { className: "tsaved-ring" },
          e("svg", { width: 86, height: 86, viewBox: "0 0 86 86" },
            e("circle", { cx: 43, cy: 43, r: r, fill: "none", stroke: "var(--surface-3)", strokeWidth: 8 }),
            e("circle", { cx: 43, cy: 43, r: r, fill: "none", stroke: "var(--terra)", strokeWidth: 8, strokeLinecap: "round",
              strokeDasharray: C, strokeDashoffset: off, transform: "rotate(-90 43 43)" })),
          e("div", { className: "v" }, ts.hours + "h")),
        e("div", { className: "grow" },
          ts.breakdown.map((b, i) => e("div", { key: i, className: "row", style: { fontSize: 12, padding: "3px 0" } },
            e("span", { className: "grow faint" }, b.l), e("span", { className: "mono", style: { fontWeight: 600 } }, b.h + " h"))))),
      e("div", { className: "faint", style: { fontSize: 11.5, marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line-2)" } },
        "Equivale a ", e("b", { style: { color: "var(--terra-deep)" } }, "casi 2 jornadas"), " liberadas para trabajo de mayor valor."));
  }

  /* ===================== ACCIONES IA (AUTOPILOT) ===================== */
  function AutopilotScreen({ navigate, toast }) {
    const P = window.FARO_PROD;
    const [state, setState] = React.useState({}); // id -> 'approved' | 'dismissed'
    const pending = P.actions.filter((a) => !state[a.id]);
    const approvedCount = Object.values(state).filter((v) => v === "approved").length;
    const recovered = P.actions.filter((a) => state[a.id] === "approved" && a.impact.includes("€") && !a.impact.includes("/"))
      .reduce((s, a) => s + (parseInt(a.impact.replace(/\D/g, "")) || 0), 0);

    const approve = (a) => { setState((s) => ({ ...s, [a.id]: "approved" })); toast && toast(a.done); };
    const dismiss = (a) => setState((s) => ({ ...s, [a.id]: "dismissed" }));
    const approveAll = () => {
      const n = {}; pending.forEach((a) => (n[a.id] = "approved"));
      setState((s) => ({ ...s, ...n }));
      toast && toast(pending.length + " acciones ejecutadas por el Autopilot");
    };

    return e("div", { className: "page page-wide screen-enter" },
      e("div", { className: "auto-head" },
        e("div", { className: "auto-orb" }, e(Icon, { name: "sparkle", size: 26 })),
        e("div", { className: "grow" },
          e("div", { className: "eyebrow", style: { color: "var(--terra-deep)" } }, "Copiloto · Autopilot"),
          e("h1", { className: "t-h1", style: { margin: "3px 0 4px" } }, "Acciones IA"),
          e("div", { className: "page-sub" }, "Faro ha preparado " + P.actions.length + " acciones concretas sobre tus datos. Revísalas y apruébalas — una a una o todas de golpe. Tú mandas; la IA ejecuta.")),
        e("div", { className: "col", style: { alignItems: "flex-end", gap: 8 } },
          e("button", { className: "btn terra", onClick: approveAll, disabled: pending.length === 0 },
            e(Icon, { name: "bolt", size: 15 }), "Aprobar todo (" + pending.length + ")"),
          approvedCount > 0 ? e("span", { className: "pill green" }, e(Icon, { name: "check", size: 12 }), approvedCount + " ejecutadas · " + (recovered ? fmtEur(recovered) + " recuperados" : "")) : null)),

      pending.length === 0
        ? e("div", { className: "card card-pad", style: { textAlign: "center", padding: 44 } },
            e("div", { style: { width: 56, height: 56, borderRadius: "50%", background: "var(--green-tint)", display: "grid", placeItems: "center", margin: "0 auto 16px" } }, e(Icon, { name: "checkCircle", size: 30, style: { color: "var(--green-ink)" } })),
            e("h2", { className: "t-h2", style: { marginBottom: 6 } }, "Bandeja vacía. Bien hecho."),
            e("p", { className: "muted", style: { fontSize: 13.5 } }, "Has resuelto todo lo que Faro te propuso. Recuperaste " + fmtEur(recovered) + " y ahorraste horas de trabajo manual."),
            e("button", { className: "btn mt16", onClick: () => navigate("inbox") }, "Volver a la bandeja"))
        : e("div", null,
            P.actions.map((a) =>
              e("div", { key: a.id, className: "act-card" + (state[a.id] ? " gone" : "") + (state[a.id] === "approved" ? " approved" : "") },
                e("div", { className: "act-ico " + TONE[a.tone], style: { background: "var(--" + a.tone + "-tint)", color: "var(--" + (a.tone === "blue" ? "blue" : a.tone + "-ink") + ")" } }, e(Icon, { name: a.icon, size: 19 })),
                e("div", { style: { minWidth: 0 } },
                  e("div", { style: { fontWeight: 600, fontSize: 13.5, lineHeight: 1.3 } }, a.title,
                    e("span", { className: "act-confz", style: { marginLeft: 7, verticalAlign: "middle" } }, "IA " + a.conf + "%")),
                  e("div", { className: "faint", style: { fontSize: 12.5, marginTop: 3 } }, a.desc)),
                e("div", { className: "row gap12", style: { alignItems: "center" } },
                  e("div", { style: { textAlign: "right" } },
                    e("div", { className: "act-impact", style: { color: a.tone === "red" ? "var(--red-ink)" : a.tone === "green" ? "var(--green-ink)" : "var(--ink)" } }, a.impact),
                    e("div", { className: "faint", style: { fontSize: 10, textTransform: "uppercase", letterSpacing: ".05em" } }, a.impactType)),
                  e("button", { className: "btn sm ghost", onClick: () => dismiss(a), title: "Descartar" }, e(Icon, { name: "x", size: 14 })),
                  e("button", { className: "btn sm terra", onClick: () => approve(a) }, e(Icon, { name: "check", size: 14 }), "Aprobar"))))),
      e("div", { className: "faint", style: { fontSize: 11.5, textAlign: "center", marginTop: 14 } },
        "Cada acción es trazable y reversible · queda registrada en Auditoría con autor “Faro IA”."));
  }

  window.BriefingScreen = BriefingScreen;
  window.AutopilotScreen = AutopilotScreen;
})();
