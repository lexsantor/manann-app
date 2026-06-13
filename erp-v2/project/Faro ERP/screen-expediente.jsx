/* FARO — Expediente detail (the shipment file / job file) */
(function () {
  const { Icon, UI } = window;
  const { fmtEur, fmtN, ModeTag, StatusPill, AiField, Def, MarginBar } = UI;
  const e = React.createElement;

  const PIPE = [
    { k: "quote", l: "Cotización" }, { k: "booking", l: "Reserva" },
    { k: "in-transit", l: "Tránsito" }, { k: "customs", l: "Aduana" },
    { k: "arrived", l: "Arribo" }, { k: "delivered", l: "Entrega" },
    { k: "invoiced", l: "Factura" },
  ];
  const PIPE_IDX = { quote: 0, booking: 1, "in-transit": 2, customs: 3, arrived: 4, delivered: 5, invoiced: 6, closed: 6 };

  function ExpedienteScreen({ navigate, id, toast }) {
    const D = window.FARO;
    const sh = D.shipments.find((s) => s.id === id) || D.hero;
    const full = !!sh.charges;
    return full ? FullExpediente(sh, navigate, toast) : CondensedExpediente(sh, navigate);
  }

  // ===================== FULL (hero) =====================
  function FullExpediente(sh, navigate, toast) {
    const totals = sh.charges.reduce((a, c) => ({ sell: a.sell + c.sell, buy: a.buy + c.buy }), { sell: 0, buy: 0 });
    const gp = totals.sell - totals.buy;
    const gpPct = (gp / totals.sell) * 100;
    const nowIdx = PIPE_IDX[sh.status];
    const [confirmed, setConfirmed] = React.useState({});
    const aiKeys = Object.keys(sh.ai);
    const allDone = aiKeys.every((k) => confirmed[k]);

    const onConfirm = (label) => toast && toast("Campo confirmado · " + label);
    const confirmAll = () => {
      const all = {}; aiKeys.forEach((k) => (all[k] = true));
      setConfirmed(all); toast && toast(aiKeys.length + " campos verificados — expediente en verde");
    };

    return e("div", { className: "page page-wide screen-enter" },
      // ---- header ----
      e("div", { className: "row gap8 mb12", style: { fontSize: 12.5 } },
        e("span", { className: "faint", style: { cursor: "pointer" }, onClick: () => navigate("shipments") }, "Expedientes"),
        e(Icon, { name: "chevR", size: 13, style: { color: "var(--ink-4)" } }),
        e("span", { className: "mono", style: { fontWeight: 600 } }, sh.id)
      ),
      e("div", { className: "exp-head mb20" },
        e("div", { className: "grow" },
          e("div", { className: "row gap12", style: { flexWrap: "wrap" } },
            e("h1", { className: "t-h1 mono", style: { letterSpacing: "-.02em" } }, sh.id),
            e(StatusPill, { status: sh.status, label: sh.statusLabel }),
            e(ModeTag, { mode: sh.mode }),
            e("span", { className: "pill neutral" }, "Incoterm " + sh.incoterm),
            e("span", { className: "pill neutral" }, sh.service)
          ),
          e("div", { className: "row gap16 mt12", style: { flexWrap: "wrap" } },
            e("div", { className: "lane" },
              e("div", { className: "port" }, e("span", { className: "code" }, sh.origin.code), e("span", { className: "name" }, sh.origin.name)),
              e("div", { className: "arrow" }),
              e("div", { className: "port" }, e("span", { className: "code" }, sh.dest.code), e("span", { className: "name" }, sh.dest.name))
            ),
            e("div", { className: "faint", style: { fontSize: 12 } }, sh.carrier + " · " + sh.vessel + " · " + sh.voyage)
          )
        ),
        e("div", { className: "col", style: { alignItems: "flex-end", gap: 10 } },
          e("div", { className: "row gap8" },
            e("button", { className: "btn", onClick: () => navigate("ingest") }, e(Icon, { name: "sparkle" }), "Ingesta IA"),
            e("button", { className: "btn primary" }, e(Icon, { name: "doc" }), "Generar HBL")
          ),
          e("div", { className: "row gap16", style: { fontSize: 12 } },
            e("div", { className: "col", style: { alignItems: "flex-end" } },
              e("span", { className: "eyebrow" }, "Gross profit"),
              e("span", { className: "num", style: { fontSize: 18, fontWeight: 650, color: gp > 0 ? "var(--green-ink)" : "var(--red-ink)" } }, fmtEur(gp))),
            e("div", { className: "col", style: { alignItems: "flex-end" } },
              e("span", { className: "eyebrow" }, "Margen"),
              e("span", { className: "num", style: { fontSize: 18, fontWeight: 650 } }, gpPct.toFixed(1) + " %"))
          )
        )
      ),

      // ---- pipeline ----
      e("div", { className: "card card-pad mb20" },
        e("div", { className: "pipe" },
          PIPE.map((p, i) =>
            e("div", { key: p.k, className: "pipe-step", style: i === PIPE.length - 1 ? { flex: "none" } : null },
              e("div", { className: "pipe-node" },
                e("div", { className: "pipe-dot " + (i < nowIdx ? "done" : i === nowIdx ? "now" : "") }),
                e("div", { className: "pipe-lbl " + (i < nowIdx ? "done" : i === nowIdx ? "now" : "") }, p.l)
              ),
              i < PIPE.length - 1 ? e("div", { className: "pipe-line " + (i < nowIdx ? "done" : "") }) : null
            )
          )
        )
      ),

      // ---- body grid ----
      e("div", { style: { display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, alignItems: "start" } },
        // LEFT column
        e("div", { className: "col gap16" },
          // charges (centerpiece)
          chargesCard(sh, totals, gp, gpPct, navigate),
          // parties + transport
          partiesCard(sh, confirmed, setConfirmed, onConfirm),
          // cargo
          cargoCard(sh)
        ),
        // RIGHT column
        e("div", { className: "col gap16" },
          aiCard(sh, aiKeys, confirmed, allDone, confirmAll),
          accrualCard(sh, navigate),
          eventsCard(sh),
          docsCard(sh)
        )
      )
    );
  }

  // ---- charges table ----
  function chargesCard(sh, totals, gp, gpPct, navigate) {
    return e("div", { className: "card" },
      e("div", { className: "card-head" },
        e("span", { style: { color: "var(--ink-3)", display: "flex" } }, e(Icon, { name: "money", size: 16 })),
        e("div", { className: "grow" }, e("h3", { className: "t-h3" }, "Líneas de cargo"),
          e("div", { className: "faint", style: { fontSize: 11.5, marginTop: 1 } }, "El átomo que une operación y dinero · buy / sell por línea")),
        e("button", { className: "btn sm ghost" }, e(Icon, { name: "plus", size: 14 }), "Añadir cargo")
      ),
      e("table", { className: "tbl" },
        e("thead", null, e("tr", null,
          e("th", null, "Código"), e("th", null, "Concepto"),
          e("th", { className: "r" }, "Venta"), e("th", { className: "r" }, "Compra"),
          e("th", { className: "r" }, "Margen"), e("th", { style: { width: 90 } }, ""))),
        e("tbody", null,
          sh.charges.map((c) => {
            const m = c.sell - c.buy;
            return e("tr", { key: c.code, className: c.atRisk ? "" : "", style: c.atRisk ? { background: "var(--red-tint)" } : null },
              e("td", null, e("span", { className: "tl-code" }, c.code)),
              e("td", null,
                e("div", { className: "row gap8" }, c.desc,
                  c.atRisk ? e("span", { className: "pill red", style: { fontSize: 10, padding: "2px 6px" } }, e(Icon, { name: "alert", size: 11 }), "sin facturar") : null,
                  c.pass ? e("span", { className: "pill neutral", style: { fontSize: 10, padding: "2px 6px" } }, "pass-through") : null)),
              e("td", { className: "r tnum" }, fmtN(c.sell) + " €"),
              e("td", { className: "r tnum faint" }, fmtN(c.buy) + " €"),
              e("td", { className: "r tnum", style: { fontWeight: 600, color: m > 0 ? "var(--green-ink)" : "var(--ink-3)" } }, m > 0 ? fmtN(m) + " €" : "—"),
              e("td", null, e("div", { style: { paddingLeft: 6 } }, e(MarginBar, { sell: c.sell, buy: c.buy, thin: true })))
            );
          })
        ),
        e("tfoot", null,
          e("tr", { style: { borderTop: "2px solid var(--line-strong)" } },
            e("td", { colSpan: 2, style: { padding: "12px", fontWeight: 700 } }, "Total expediente"),
            e("td", { className: "r tnum", style: { fontWeight: 700, padding: 12 } }, fmtN(totals.sell) + " €"),
            e("td", { className: "r tnum", style: { fontWeight: 700, padding: 12, color: "var(--ink-2)" } }, fmtN(totals.buy) + " €"),
            e("td", { className: "r tnum", style: { fontWeight: 700, padding: 12, color: "var(--green-ink)" } }, fmtN(gp) + " €"),
            e("td", { style: { padding: 12, textAlign: "right", fontFamily: "var(--mono)", fontWeight: 700 } }, gpPct.toFixed(1) + "%"))
        )
      ),
      e("div", { style: { padding: "10px 16px", borderTop: "1px solid var(--line-2)", background: "var(--red-tint)", display: "flex", alignItems: "center", gap: 10 } },
        e(Icon, { name: "alert", size: 16, style: { color: "var(--red-ink)" } }),
        e("div", { style: { fontSize: 12, color: "var(--red-ink)" } },
          e("b", null, "Aviso de fuga de margen: "),
          "si no se factura el THC destino (210 €), el GP cae a 114 € (−65 %). Faro lo bloquea antes del cierre."),
        e("button", { className: "btn sm right", style: { background: "#fff" } }, "Facturar ahora")
      )
    );
  }

  // ---- parties + transport with AI fields ----
  function partiesCard(sh, confirmed, setConfirmed, onConfirm) {
    const ai = (key, label, suffix) =>
      e(AiField, { label, data: sh.ai[key], verified: confirmed[key],
        onConfirm: (l, v) => { setConfirmed((c) => ({ ...c, [key]: true })); onConfirm(l, v); }, suffix });
    return e("div", { className: "card card-pad" },
      e("div", { className: "row mb16" }, e("h3", { className: "t-h3 grow" }, "Partes y transporte"),
        e("span", { className: "faint", style: { fontSize: 11 } }, "Campos en ámbar = extraídos por IA, sin verificar")),
      e("div", { className: "def-grid" },
        e(Def, { label: "Shipper (exportador)" }, sh.shipper),
        ai("consignee", "Consignee"),
        e(Def, { label: "Notify party" }, sh.notify),
        e(Def, { label: "Agente origen" }, sh.agentOrigin),
        e(Def, { label: "Cliente" }, e("span", { className: "row gap8" }, sh.client.name, e(UI.Tier, { t: sh.client.tier }))),
        ai("incoterm", "Incoterm"),
        e(Def, { label: "MBL", mono: true }, sh.mbl),
        e(Def, { label: "HBL", mono: true }, sh.hbl),
        e(Def, { label: "ETD" }, sh.etd), e(Def, { label: "ATD" }, sh.atd),
        e(Def, { label: "ETA" }, sh.eta),
        e(Def, { label: "POL → POD", mono: true }, sh.pol + " → " + sh.pod)
      )
    );
  }

  // ---- cargo / containers ----
  function cargoCard(sh) {
    const c = sh.containers[0], p = sh.packLines[0];
    return e("div", { className: "card card-pad" },
      e("div", { className: "row mb16" }, e(Icon, { name: "container", size: 16, style: { color: "var(--ink-3)" } }),
        e("h3", { className: "t-h3" }, "Carga · " + sh.containers.length + " contenedor")),
      e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 } },
        e("div", { style: { border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 13 } },
          e("div", { className: "row mb12" },
            e("span", { className: "mono", style: { fontWeight: 600, fontSize: 13 } }, c.no),
            e("span", { className: "pill neutral right mono" }, c.iso),
            e("span", { className: "faint", style: { fontSize: 11 } }, c.isoName)),
          e("div", { className: "def-grid c3", style: { gap: "10px 14px" } },
            e(Def, { label: "Precinto", mono: true }, c.seal),
            e(Def, { label: "Bultos", mono: true }, fmtN(c.packages)),
            e(Def, { label: "Peso", mono: true }, fmtN(c.weight) + " kg"))),
        e("div", { style: { border: "1px solid var(--line)", borderRadius: "var(--r)", padding: 13 } },
          e("div", { className: "field-label mb12" }, "Pack line"),
          e("div", { style: { fontWeight: 600, marginBottom: 10 } }, p.commodity),
          e("div", { className: "def-grid c3", style: { gap: "10px 14px" } },
            e(Def, { label: "Código HS", mono: true }, p.hs),
            e(Def, { label: "Volumen", mono: true }, fmtN(p.cbm, 1) + " CBM"),
            e(Def, { label: "Peso", mono: true }, fmtN(p.weight) + " kg")))
      )
    );
  }

  // ---- AI confidence card ----
  function aiCard(sh, aiKeys, confirmed, allDone, confirmAll) {
    const doneCount = aiKeys.filter((k) => confirmed[k]).length;
    return e("div", { className: "card", style: { borderColor: allDone ? "var(--green)" : "var(--amber-line)", overflow: "hidden" } },
      e("div", { className: "card-head", style: { background: allDone ? "var(--green-tint)" : "var(--amber-tint)", borderColor: "transparent" } },
        e(Icon, { name: allDone ? "checkCircle" : "sparkle", size: 17, style: { color: allDone ? "var(--green-ink)" : "var(--amber-ink)" } }),
        e("div", { className: "grow" },
          e("h3", { className: "t-h3", style: { color: allDone ? "var(--green-ink)" : "var(--amber-ink)" } }, allDone ? "Expediente verificado" : "Faro IA pobló este expediente"),
          e("div", { style: { fontSize: 11.5, color: allDone ? "var(--green-ink)" : "var(--amber-ink)", opacity: .85 } },
            doneCount + " de " + aiKeys.length + " campos confirmados")),
      ),
      e("div", { className: "card-pad" },
        e("p", { className: "muted", style: { fontSize: 12.5, marginTop: 0, marginBottom: 12 } },
          "La IA escribe ", e("b", null, "dentro"), " del modelo de datos, no en un widget aparte. Cada campo en ámbar lleva su confianza; tú confirmas con una tecla y pasa a verde."),
        e("div", { className: "col gap6" },
          aiKeys.map((k) =>
            e("div", { key: k, className: "row gap8", style: { fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid var(--line-2)" } },
              e("span", { className: "sdot " + (confirmed[k] ? "green" : "amber") }),
              e("span", { className: "faint", style: { textTransform: "capitalize", width: 88 } }, k === "hs" ? "Código HS" : k),
              e("span", { className: "mono grow", style: { fontWeight: 600 } }, sh.ai[k].value),
              confirmed[k]
                ? e(Icon, { name: "checkCircle", size: 14, style: { color: "var(--green)" } })
                : e("span", { className: "conf" }, sh.ai[k].conf + "%"))
          )
        ),
        allDone ? null : e("button", { className: "btn terra mt12", style: { width: "100%", justifyContent: "center" }, onClick: confirmAll },
          e(Icon, { name: "check", size: 15 }), "Confirmar todos los campos")
      )
    );
  }

  // ---- accrual reconciliation ----
  function accrualCard(sh, navigate) {
    const a = sh.accrual;
    return e("div", { className: "card card-pad" },
      e("div", { className: "row mb12" }, e(Icon, { name: "refresh", size: 16, style: { color: "var(--ink-3)" } }),
        e("h3", { className: "t-h3 grow" }, "Conciliación accrual ↔ factura"),
        e("span", { className: "pill amber" }, "WIP +" + fmtEur(a.variance))),
      e("div", { className: "col gap8" },
        recoRow("Coste provisionado (accrual)", a.accrued, "ink-2"),
        recoRow("Factura real proveedor", a.accrued + a.variance, "ink"),
        e("div", { style: { borderTop: "1px solid var(--line-2)", paddingTop: 8, marginTop: 2 } },
          e("div", { className: "row" },
            e("span", { className: "grow", style: { fontWeight: 600, color: "var(--red-ink)" } }, "Desvío que erosiona margen"),
            e("span", { className: "num", style: { fontWeight: 700, color: "var(--red-ink)" } }, "+" + fmtEur(a.variance))))),
      e("div", { className: "faint", style: { fontSize: 11.5, marginTop: 10 } }, a.note),
      e("button", { className: "btn sm mt12", style: { width: "100%", justifyContent: "center" } }, "Revisar asiento contable")
    );
  }
  function recoRow(l, v, c) {
    return e("div", { className: "row", style: { fontSize: 12.5 } },
      e("span", { className: "grow", style: { color: "var(--" + c + ")" } }, l),
      e("span", { className: "num", style: { fontWeight: 600 } }, fmtEur(v)));
  }

  // ---- events timeline (DCSA) ----
  function eventsCard(sh) {
    return e("div", { className: "card card-pad" },
      e("div", { className: "row mb16" }, e(Icon, { name: "pin", size: 16, style: { color: "var(--ink-3)" } }),
        e("h3", { className: "t-h3 grow" }, "Hitos · taxonomía DCSA"),
        e("span", { className: "faint", style: { fontSize: 10.5 } }, "ACT · EST · PLN")),
      e("div", { className: "tl" },
        sh.events.map((ev, i) => {
          const act = ev.cls === "ACT";
          return e("div", { key: i, className: "tl-row" },
            e("div", { className: "tl-rail" },
              e("div", { className: "tl-node " + (act ? "act" : ev.cls === "EST" ? "est" : "") }),
              i < sh.events.length - 1 ? e("div", { className: "tl-line " + (act ? "act" : "") }) : null),
            e("div", { className: "tl-body" },
              e("div", { className: "tl-top" },
                e("span", { className: "tl-code" }, ev.code),
                e("span", { className: "tl-title" }, ev.title),
                e("span", { className: "pill " + (act ? "green" : ev.cls === "EST" ? "amber" : "neutral"), style: { fontSize: 9.5, padding: "1px 6px", marginLeft: "auto" } }, ev.cls)),
              e("div", { className: "tl-meta" }, e("span", { className: "mono" }, ev.loc), e("span", null, "·"), e("span", { className: "num" }, ev.ts))));
        })
      )
    );
  }

  // ---- docs ----
  function docsCard(sh) {
    const stMap = { verified: ["green", "Verificado"], amber: ["amber", "IA · validar"], draft: ["neutral", "Borrador"] };
    return e("div", { className: "card card-pad" },
      e("div", { className: "row mb12" }, e(Icon, { name: "doc", size: 16, style: { color: "var(--ink-3)" } }),
        e("h3", { className: "t-h3 grow" }, "Documentos"),
        e("button", { className: "btn sm ghost" }, e(Icon, { name: "plus", size: 13 }))),
      e("div", { className: "col gap8" },
        sh.docs.map((d, i) => {
          const st = stMap[d.state] || stMap.draft;
          return e("div", { key: i, className: "doc" },
            e("div", { className: "doc-ico" }, e(Icon, { name: "doc", size: 16 })),
            e("div", { className: "grow" }, e("div", { className: "doc-name" }, d.name), e("div", { className: "doc-meta" }, d.type + " · " + d.by)),
            e("span", { className: "pill " + st[0] }, st[1]));
        })
      )
    );
  }

  // ===================== CONDENSED (other shipments) =====================
  function CondensedExpediente(sh, navigate) {
    const gp = sh.gp, gpPct = sh.gpPct, nowIdx = PIPE_IDX[sh.status];
    return e("div", { className: "page page-wide screen-enter" },
      e("div", { className: "row gap8 mb12", style: { fontSize: 12.5 } },
        e("span", { className: "faint", style: { cursor: "pointer" }, onClick: () => navigate("shipments") }, "Expedientes"),
        e(Icon, { name: "chevR", size: 13, style: { color: "var(--ink-4)" } }),
        e("span", { className: "mono", style: { fontWeight: 600 } }, sh.id)),
      e("div", { className: "exp-head mb20" },
        e("div", { className: "grow" },
          e("div", { className: "row gap12 wrap" },
            e("h1", { className: "t-h1 mono" }, sh.id),
            e(StatusPill, { status: sh.status, label: sh.statusLabel }),
            e(ModeTag, { mode: sh.mode }),
            e("span", { className: "pill neutral" }, "Incoterm " + sh.incoterm)),
          e("div", { className: "row gap16 mt12 wrap" },
            e("div", { className: "lane" },
              e("div", { className: "port" }, e("span", { className: "code" }, sh.origin.code), e("span", { className: "name" }, sh.origin.name)),
              e("div", { className: "arrow" }),
              e("div", { className: "port" }, e("span", { className: "code" }, sh.dest.code), e("span", { className: "name" }, sh.dest.name))),
            e("div", { className: "faint", style: { fontSize: 12 } }, sh.carrier + " · ETD " + sh.etd + " · ETA " + sh.eta))),
        e("div", { className: "col", style: { alignItems: "flex-end", gap: 6 } },
          e("span", { className: "eyebrow" }, "Gross profit"),
          e("span", { className: "num", style: { fontSize: 24, fontWeight: 650, color: "var(--green-ink)" } }, fmtEur(gp)),
          e("span", { className: "faint num", style: { fontSize: 12 } }, gpPct.toFixed(1) + " % margen"))),
      e("div", { className: "card card-pad mb20" },
        e("div", { className: "pipe" },
          PIPE.map((p, i) =>
            e("div", { key: p.k, className: "pipe-step", style: i === PIPE.length - 1 ? { flex: "none" } : null },
              e("div", { className: "pipe-node" },
                e("div", { className: "pipe-dot " + (i < nowIdx ? "done" : i === nowIdx ? "now" : "") }),
                e("div", { className: "pipe-lbl " + (i < nowIdx ? "done" : i === nowIdx ? "now" : "") }, p.l)),
              i < PIPE.length - 1 ? e("div", { className: "pipe-line " + (i < nowIdx ? "done" : "") }) : null)))),
      e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 } },
        e("div", { className: "card card-pad" },
          e("h3", { className: "t-h3 mb16" }, "Resumen financiero"),
          e("div", { className: "row mb12" },
            e("span", { className: "grow faint" }, "Venta total"), e("span", { className: "num", style: { fontWeight: 600 } }, fmtEur(sh.sell))),
          e("div", { className: "row mb12" },
            e("span", { className: "grow faint" }, "Compra total"), e("span", { className: "num", style: { fontWeight: 600 } }, fmtEur(sh.buy))),
          e(MarginBar, { sell: sh.sell, buy: sh.buy }),
          e("div", { className: "row mt12", style: { paddingTop: 10, borderTop: "1px solid var(--line-2)" } },
            e("span", { className: "grow", style: { fontWeight: 600 } }, "Gross profit"),
            e("span", { className: "num", style: { fontWeight: 700, color: "var(--green-ink)" } }, fmtEur(gp)))),
        e("div", { className: "card card-pad" },
          e("h3", { className: "t-h3 mb12" }, "Cliente"),
          e("div", { className: "row gap8 mb16" }, e("span", { style: { fontWeight: 600, fontSize: 15 } }, sh.client.name), e(UI.Tier, { t: sh.client.tier })),
          e("p", { className: "muted", style: { fontSize: 12.5 } }, "Expediente operativo en estado “", sh.statusLabel, "”. Las líneas de cargo detalladas, hitos DCSA y documentos se gestionan igual que en el expediente de referencia."),
          e("button", { className: "btn mt12", onClick: () => navigate("expediente", { id: "S-2026-04417" }) }, "Ver expediente completo de referencia →")))
    );
  }

  window.ExpedienteScreen = ExpedienteScreen;
})();
