/* FARO — Ingesta IA: PDF/email → expediente auto-poblado */
(function () {
  const { Icon, UI } = window;
  const e = React.createElement;

  const FIELDS = [
    { k: "shipper", label: "Shipper", value: "Ningbo Hometex Co., Ltd", conf: 98 },
    { k: "consignee", label: "Consignee", value: "Acme Ibérica S.L.", conf: 99 },
    { k: "incoterm", label: "Incoterm", value: "FOB Shanghái", conf: 88 },
    { k: "hs", label: "Código HS", value: "6303.92", conf: 91 },
    { k: "commodity", label: "Mercancía", value: "Cortinas textiles para el hogar", conf: 94 },
    { k: "pkg", label: "Bultos", value: "920 cartons", conf: 97 },
    { k: "weight", label: "Peso bruto", value: "18.450 kg", conf: 97 },
    { k: "cbm", label: "Volumen", value: "62,4 CBM", conf: 95 },
    { k: "value", label: "Valor declarado", value: "USD 84.200", conf: 96 },
    { k: "pol", label: "POL → POD", value: "CNSHA → ESBCN", conf: 93 },
  ];
  const STEPS = [
    "Clasificando tipo de documento",
    "OCR + lectura estructural",
    "Extrayendo 24 campos del expediente",
    "Validando contra maestros (HS, UN/LOCODE)",
    "Escribiendo en el modelo de datos",
  ];

  function IngestScreen({ navigate, toast }) {
    const [phase, setPhase] = React.useState("idle"); // idle | scan | done
    const [step, setStep] = React.useState(0);
    const [shown, setShown] = React.useState(0);
    const [confirmed, setConfirmed] = React.useState({});

    const run = () => {
      setPhase("scan"); setStep(0); setShown(0); setConfirmed({});
      let s = 0;
      const stepT = setInterval(() => {
        s++; setStep(s);
        if (s >= STEPS.length) { clearInterval(stepT); setPhase("done"); revealFields(); }
      }, 620);
    };
    const revealFields = () => {
      let n = 0;
      const t = setInterval(() => {
        n++; setShown(n);
        if (n >= FIELDS.length) clearInterval(t);
      }, 130);
    };
    const confirmAll = () => {
      const all = {}; FIELDS.forEach((f) => (all[f.k] = true));
      setConfirmed(all); toast && toast(FIELDS.length + " campos verificados");
    };
    const doneCount = Object.keys(confirmed).length;
    const allConfirmed = doneCount === FIELDS.length;

    return e("div", { className: "screen-enter", style: { height: "100%", display: "flex", flexDirection: "column" } },
      // sub-header
      e("div", { style: { padding: "16px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 14, background: "var(--surface)" } },
        e("div", { className: "grow" },
          e("div", { className: "eyebrow" }, "Ingesta IA · el momento mágico"),
          e("div", { className: "t-h2", style: { marginTop: 2 } }, "Documento → expediente auto-poblado")),
        e("span", { className: "pill " + (phase === "done" ? "green" : "amber") },
          e(Icon, { name: phase === "done" ? "checkCircle" : "sparkle", size: 13 }),
          phase === "idle" ? "Listo para procesar" : phase === "scan" ? "Procesando…" : "10 campos extraídos"),
        e("button", { className: "btn", onClick: () => navigate("inbox") }, "Cerrar")),

      // split
      e("div", { className: "ingest", style: { flex: 1, minHeight: 0 } },
        // LEFT: document
        e("div", { className: "ingest-doc" },
          e("div", { style: { padding: "12px 24px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" } },
            e(Icon, { name: "doc", size: 16, style: { color: "var(--ink-3)" } }),
            e("span", { style: { fontWeight: 600, fontSize: 12.5 } }, "Commercial_Invoice_CI-2241.pdf"),
            e("span", { className: "pill neutral", style: { marginLeft: "auto" } }, "recibido por email · hace 3 min")),
          e("div", { style: { flex: 1, overflow: "auto", display: "flex" } }, InvoiceDoc(phase, step))),

        // RIGHT: output
        e("div", { className: "ingest-out" },
          e("div", { style: { flex: 1, overflow: "auto", padding: "20px 24px" } },
            phase === "idle"
              ? IdleState(run)
              : e(React.Fragment, null,
                  // process steps
                  e("div", { className: "card card-pad mb16" },
                    e("div", { className: "row mb12" }, e(Icon, { name: "sparkle", size: 16, style: { color: "var(--amber)" } }),
                      e("h3", { className: "t-h3 grow" }, "Faro IA · pipeline de extracción"),
                      phase === "done" ? e("span", { className: "pill green" }, "Completado") : null),
                    STEPS.map((s, i) => {
                      const st = i < step ? "done" : i === step ? "run" : "wait";
                      return e("div", { key: i, className: "proc-row" },
                        e("div", { className: "proc-ic " + st }, e(Icon, { name: st === "done" ? "check" : st === "run" ? "refresh" : "clock", size: 13 })),
                        e("span", { style: { fontSize: 12.5, fontWeight: st === "wait" ? 500 : 600, color: st === "wait" ? "var(--ink-4)" : "var(--ink)" } }, s),
                        st === "done" ? e("span", { className: "right faint mono", style: { fontSize: 11 } }, "ok") : null);
                    })),

                  // extracted fields
                  e("div", { className: "card", style: { borderColor: allConfirmed ? "var(--green)" : "var(--amber-line)" } },
                    e("div", { className: "card-head", style: { background: allConfirmed ? "var(--green-tint)" : "var(--amber-tint)", borderColor: "transparent" } },
                      e(Icon, { name: allConfirmed ? "checkCircle" : "bolt", size: 16, style: { color: allConfirmed ? "var(--green-ink)" : "var(--amber-ink)" } }),
                      e("div", { className: "grow" }, e("h3", { className: "t-h3", style: { color: allConfirmed ? "var(--green-ink)" : "var(--amber-ink)" } }, "Campos extraídos → expediente"),
                        e("div", { style: { fontSize: 11, color: allConfirmed ? "var(--green-ink)" : "var(--amber-ink)", opacity: .8 } }, doneCount + " de " + FIELDS.length + " confirmados")),
                      phase === "done" && !allConfirmed ? e("button", { className: "btn sm terra", onClick: confirmAll }, e(Icon, { name: "check", size: 13 }), "Confirmar todo") : null),
                    e("div", { style: { padding: "6px 16px 14px" } },
                      FIELDS.slice(0, shown).map((f) =>
                        e(FieldRow, { key: f.k, f, verified: confirmed[f.k],
                          onConfirm: () => { setConfirmed((c) => ({ ...c, [f.k]: true })); toast && toast("Confirmado · " + f.label); } })),
                      shown < FIELDS.length ? e("div", { className: "faint", style: { fontSize: 12, padding: "8px 0" } }, "Extrayendo…") : null)))),
          // footer action
          phase === "done"
            ? e("div", { style: { padding: "14px 24px", borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12, background: "var(--surface)" } },
                e("div", { className: "grow" },
                  e("div", { style: { fontWeight: 600, fontSize: 13 } }, allConfirmed ? "Expediente listo — sin re-tecleo" : "Confirma los campos en ámbar para continuar"),
                  e("div", { className: "faint", style: { fontSize: 11.5 } }, "Se atacó el 80 % redundante del data-entry · 0 campos tecleados a mano")),
                e("button", { className: "btn", onClick: run }, e(Icon, { name: "refresh", size: 14 }), "Reprocesar"),
                e("button", { className: "btn terra", disabled: !allConfirmed, onClick: () => { toast && toast("Expediente S-2026-04417 creado"); navigate("expediente", { id: "S-2026-04417" }); } },
                  e(Icon, { name: "arrowR", size: 15 }), "Crear expediente"))
            : null
        )
      )
    );
  }

  function IdleState(run) {
    return e("div", { style: { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 30 } },
      e("div", { style: { width: 58, height: 58, borderRadius: 16, background: "var(--amber-tint)", display: "grid", placeItems: "center", marginBottom: 18 } },
        e(Icon, { name: "sparkle", size: 28, style: { color: "var(--amber-ink)" } })),
      e("h2", { className: "t-h2", style: { marginBottom: 8 } }, "Un PDF se convierte en un expediente"),
      e("p", { className: "muted", style: { fontSize: 13, maxWidth: 340, marginBottom: 22 } },
        "Faro lee la factura comercial, extrae los 24 campos del expediente y los escribe ", e("b", null, "dentro"), " del modelo de datos — marcados en ámbar hasta que los confirmes."),
      e("button", { className: "btn terra", style: { padding: "10px 18px", fontSize: 13.5 }, onClick: run },
        e(Icon, { name: "bolt", size: 16 }), "Procesar documento"),
      e("div", { className: "faint", style: { fontSize: 11.5, marginTop: 14 } }, "Antítesis de la “IA periférica sobre legacy”: aquí la IA tiene permiso de escritura validada."));
  }

  function FieldRow({ f, verified, onConfirm }) {
    const [flash, setFlash] = React.useState(false);
    const click = () => { if (verified) return; setFlash(true); setTimeout(() => setFlash(false), 800); onConfirm(); };
    return e("div", { onClick: click,
        className: "row gap8 ai-field " + (verified ? "verified" : "amber") + (flash ? " flash" : ""),
        style: { fontSize: 12.5, padding: "7px 9px", margin: "3px 0", cursor: verified ? "default" : "pointer" } },
      e("span", { className: "sdot " + (verified ? "green" : "amber") }),
      e("span", { className: "faint", style: { width: 96, flex: "none" } }, f.label),
      e("span", { className: "mono grow", style: { fontWeight: 600 } }, f.value),
      verified
        ? e(Icon, { name: "checkCircle", size: 14, style: { color: "var(--green)" } })
        : e(React.Fragment, null, e("span", { className: "conf" }, f.conf + "%"), e(Icon, { name: "check", size: 13, style: { color: "var(--amber-ink)", opacity: .5 } })));
  }

  // ---- the document itself ----
  function InvoiceDoc(phase, step) {
    const e2 = React.createElement;
    const H = (txt, used) => e2("span", { className: "hl" + (used ? " used" : "") }, txt);
    const used = phase === "done";
    return e2("div", { className: "paper-doc", style: { fontFamily: "var(--mono)", fontSize: 10.5, lineHeight: 1.7 } },
      phase === "scan" ? e2("div", { className: "scan-line", style: { top: (12 + step * 17) + "%" } }) : null,
      e2("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 18, fontFamily: "var(--sans)" } },
        e2("div", null, e2("div", { style: { fontWeight: 700, fontSize: 15, color: "var(--ink)" } }, "COMMERCIAL INVOICE"),
          e2("div", { style: { fontSize: 10, color: "var(--ink-3)" } }, "No. CI-2241 · 24 May 2026")),
        e2("div", { style: { textAlign: "right", fontSize: 9.5 } }, "Ningbo Hometex Co., Ltd", e2("br"), "No. 88 Jiangnan Rd, Ningbo, CN")),
      line("Seller / Shipper:", H("Ningbo Hometex Co., Ltd", used)),
      line("Buyer / Consignee:", H("ACME IBÉRICA S.L. — Barcelona, ES", used)),
      line("Terms of delivery:", H("FOB Shanghai (Incoterms 2020)", used)),
      line("Port of loading:", H("Shanghai (CNSHA)", used)),
      line("Port of discharge:", H("Barcelona (ESBCN)", used)),
      e2("div", { style: { height: 10 } }),
      e2("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 9.5 } },
        e2("thead", null, e2("tr", { style: { borderBottom: "1px solid #ddd", color: "var(--ink-3)" } },
          e2("td", { style: { padding: "4px 0" } }, "DESCRIPTION"), e2("td", null, "HS CODE"), e2("td", null, "QTY"), e2("td", null, "G.W."), e2("td", null, "CBM"))),
        e2("tbody", null, e2("tr", null,
          e2("td", { style: { padding: "5px 0" } }, H("Home textile curtains", used)),
          e2("td", null, H("6303.92", used)),
          e2("td", null, H("920 ctn", used)),
          e2("td", null, H("18,450 kg", used)),
          e2("td", null, H("62.4", used))))),
      e2("div", { style: { height: 14 } }),
      line("Total invoice value:", H("USD 84,200.00", used)),
      e2("div", { style: { marginTop: 24, paddingTop: 12, borderTop: "1px dashed #ccc", fontSize: 9, color: "var(--ink-4)" } },
        "Country of origin: China · Net weight 17,890 kg · 1×40'HC · Payment: T/T 30 days"));
  }
  function line(l, v) {
    const e2 = React.createElement;
    return e2("div", { style: { display: "flex", gap: 8, marginBottom: 3 } },
      e2("span", { style: { color: "var(--ink-4)", width: 130, flex: "none" } }, l), e2("span", null, v));
  }

  window.IngestScreen = IngestScreen;
})();
