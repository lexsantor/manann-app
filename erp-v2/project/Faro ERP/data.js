/* ============================================================
   FARO — mock dataset (window.FARO)
   Realistic freight-forwarding data. Figures illustrative,
   modelled on the strategic playbook (FCL Shanghái→Barcelona).
   ============================================================ */
(function () {
  const eur = (n) => n;

  // ---- Hero expediente: FCL 40'HC Shanghái → Barcelona ----
  const S4417_charges = [
    { code: "OFR",  desc: "Flete base marítimo",        sell: 2760, buy: 2640, pass: false },
    { code: "BAF",  desc: "BAF (recargo combustible)",   sell: 460,  buy: 460,  pass: true  },
    { code: "THCO", desc: "THC origen · Shanghái",       sell: 180,  buy: 165,  pass: false },
    { code: "THCD", desc: "THC destino · Barcelona",     sell: 210,  buy: 190,  pass: false, atRisk: true },
    { code: "ISPS", desc: "ISPS (seguridad portuaria)",  sell: 22,   buy: 18,   pass: false },
    { code: "DOC",  desc: "Documentación / emisión B/L", sell: 55,   buy: 30,   pass: false },
    { code: "CCL",  desc: "Despacho aduanero importación", sell: 120, buy: 45,  pass: false },
    { code: "PORT", desc: "T3 · tasa portuaria",         sell: 38,   buy: 38,   pass: true  },
    { code: "TRK",  desc: "Transporte terrestre · BCN",  sell: 390,  buy: 340,  pass: false },
    { code: "INS",  desc: "Seguro de carga (comisión)",  sell: 90,   buy: 75,   pass: false },
  ];

  const S4417 = {
    id: "S-2026-04417",
    ref: "PO-88245 / ACME-IBERIA",
    mode: "SEA-FCL",
    service: "CY/CY",
    status: "in-transit",
    statusLabel: "En tránsito",
    client: { name: "Acme Ibérica S.L.", code: "ACMEIB", tier: "A" },
    shipper: "Ningbo Hometex Co., Ltd",
    consignee: "Acme Ibérica S.L.",
    notify: "Acme Ibérica S.L.",
    agentOrigin: "Sino-Bridge Logistics (Ningbo)",
    incoterm: "FOB",
    origin: { code: "CNSHA", name: "Shanghái" },
    dest:   { code: "ESBCN", name: "Barcelona" },
    pol: "CNSHA", pod: "ESBCN",
    carrier: "CMA CGM", scac: "CMDU",
    vessel: "CMA CGM TROCADERO", voyage: "0FANEW1MA",
    etd: "28 may 2026", atd: "29 may 2026", eta: "02 jul 2026", ata: null,
    mbl: "CMDU SHA0492215", hbl: "FARO-BCN-260417",
    containers: [
      { no: "TCLU 784512-3", iso: "45G1", isoName: "40' High Cube", seal: "ML-882144", packages: 920, weight: 18450, cbm: 62.4 },
    ],
    packLines: [
      { commodity: "Textiles para el hogar (cortinas)", hs: "6303.92", pkg: 920, weight: 18450, cbm: 62.4 },
    ],
    charges: S4417_charges,
    events: [
      { type: "EQ", code: "GTIN", title: "Gate-in terminal origen", loc: "CNSHA", cls: "ACT", ts: "27 may · 09:14" },
      { type: "EQ", code: "LOAD", title: "Cargado a bordo (laden)",  loc: "CNSHA", cls: "ACT", ts: "29 may · 02:40" },
      { type: "TR", code: "DEPA", title: "Salida buque origen",      loc: "CNSHA", cls: "ACT", ts: "29 may · 06:10" },
      { type: "TR", code: "ARRI", title: "Llegada estimada destino", loc: "ESBCN", cls: "EST", ts: "02 jul · ~14:00" },
      { type: "EQ", code: "DISC", title: "Descarga del buque",       loc: "ESBCN", cls: "PLN", ts: "02 jul" },
      { type: "EQ", code: "GTOT", title: "Gate-out terminal destino", loc: "ESBCN", cls: "PLN", ts: "—" },
    ],
    docs: [
      { name: "MBL · CMDU SHA0492215", type: "Master B/L", state: "verified", by: "IA + Marta R." },
      { name: "HBL · FARO-BCN-260417", type: "House B/L",  state: "draft",    by: "Borrador" },
      { name: "Commercial Invoice CI-2241", type: "Factura comercial", state: "amber", by: "IA · 96%" },
      { name: "Packing List PL-2241", type: "Lista de bultos", state: "amber", by: "IA · 94%" },
    ],
    // AI-extracted, unverified fields (lighthouse-amber)
    ai: {
      hs: { value: "6303.92", conf: 91 },
      weight: { value: "18.450 kg", conf: 97 },
      cbm: { value: "62,4 CBM", conf: 95 },
      incoterm: { value: "FOB", conf: 88 },
      consignee: { value: "Acme Ibérica S.L.", conf: 99 },
    },
    accrual: { accrued: 4001, invoiced: 2845, variance: 79, note: "Factura CMA CGM 4.080 € vs accrual 4.001 €" },
  };

  // ---- Other expedientes (lighter) ----
  const more = [
    {
      id: "S-2026-04420", ref: "RFQ-1182 / Delta Foods", mode: "SEA-LCL", status: "customs",
      statusLabel: "En aduana",
      client: { name: "Delta Foods S.A.", code: "DELTAF", tier: "B" },
      origin: { code: "CNNGB", name: "Ningbo" }, dest: { code: "ESVLC", name: "Valencia" },
      carrier: "Hapag-Lloyd", incoterm: "FCA", etd: "21 may 2026", eta: "26 jun 2026",
      gp: 612, gpPct: 11.4, sell: 5370, buy: 4758,
    },
    {
      id: "S-2026-04431", ref: "PO-77120 / Nordix", mode: "AIR", status: "in-transit",
      statusLabel: "En tránsito",
      client: { name: "Nordix Components", code: "NORDIX", tier: "A" },
      origin: { code: "DEFRA", name: "Frankfurt" }, dest: { code: "MXMEX", name: "México DF" },
      carrier: "Lufthansa Cargo", incoterm: "CIP", etd: "11 jun 2026", eta: "12 jun 2026",
      gp: 488, gpPct: 9.1, sell: 5360, buy: 4872,
    },
    {
      id: "S-2026-04402", ref: "PO-55410 / Talleres Vega", mode: "ROAD", status: "delivered",
      statusLabel: "Entregado",
      client: { name: "Talleres Vega", code: "TVEGA", tier: "C" },
      origin: { code: "ITMIL", name: "Milán" }, dest: { code: "ESMAD", name: "Madrid" },
      carrier: "Faro Road Network", incoterm: "DAP", etd: "02 jun 2026", eta: "05 jun 2026",
      gp: 214, gpPct: 7.9, sell: 2705, buy: 2491, uninvoiced: true,
    },
    {
      id: "S-2026-04388", ref: "PO-91002 / Lumo Retail", mode: "SEA-FCL", status: "arrived",
      statusLabel: "Arribado",
      client: { name: "Lumo Retail", code: "LUMO", tier: "A" },
      origin: { code: "VNSGN", name: "Ho Chi Minh" }, dest: { code: "ESBCN", name: "Barcelona" },
      carrier: "Maersk", incoterm: "CIF", etd: "08 may 2026", eta: "10 jun 2026",
      gp: 358, gpPct: 6.2, sell: 5774, buy: 5416, demurrage: true,
    },
    {
      id: "S-2026-04369", ref: "PO-44819 / Verde Agro", mode: "SEA-LCL", status: "delivered",
      statusLabel: "Entregado",
      client: { name: "Verde Agro Export", code: "VERDE", tier: "B" },
      origin: { code: "ESVLC", name: "Valencia" }, dest: { code: "BRSSZ", name: "Santos" },
      carrier: "MSC", incoterm: "FCA", etd: "18 may 2026", eta: "14 jun 2026",
      gp: 731, gpPct: 13.1, sell: 5580, buy: 4849,
    },
  ];

  // ---- Exceptions (the inbox) ----
  const exceptions = [
    {
      id: "x1", kind: "demurrage", sev: "red", risk: 450, riskType: "Pérdida potencial",
      title: "Demurrage acumulándose · 3 días",
      desc: "El contenedor MRKU 229301 lleva 3 días en terminal sin recoger. ~150 €/día no repercutidos al cliente.",
      ref: "S-2026-04388", client: "Lumo Retail", age: "hace 2 h",
    },
    {
      id: "x2", kind: "uninvoiced", sev: "red", risk: 324, riskType: "Margen en riesgo",
      title: "Cargo accesorio sin facturar · THC destino",
      desc: "THC destino (210 €) no incluido en la factura de venta. El GP caería de 324 € a 114 € (−65%).",
      ref: "S-2026-04417", client: "Acme Ibérica", age: "hace 40 min",
    },
    {
      id: "x3", kind: "variance", sev: "amber", risk: 79, riskType: "Desvío accrual",
      title: "Factura de proveedor supera el accrual",
      desc: "CMA CGM facturó 4.080 € frente a 4.001 € provisionados. Sobrecoste de 79 € que erosiona el margen.",
      ref: "S-2026-04417", client: "Acme Ibérica", age: "hace 1 h",
    },
    {
      id: "x4", kind: "doc", sev: "amber", risk: null, riskType: null,
      title: "Documento pendiente de validar · IA al 94%",
      desc: "Packing List PL-2241 extraído por IA. 2 campos en ámbar requieren confirmación humana antes del DUA.",
      ref: "S-2026-04417", client: "Acme Ibérica", age: "hace 1 h",
    },
    {
      id: "x5", kind: "customs", sev: "amber", risk: null, riskType: null,
      title: "DUA en riesgo de rechazo · descripción insuficiente",
      desc: "ICS2 podría rechazar la ENS: la descripción de mercancía contiene stop-words. Revisar antes de presentar.",
      ref: "S-2026-04420", client: "Delta Foods", age: "hace 3 h",
    },
    {
      id: "x6", kind: "fx", sev: "amber", risk: 80, riskType: "Riesgo de cambio",
      title: "Exposición FX sin cubrir · USD/EUR",
      desc: "Flete comprado en USD, vendido en EUR. Un movimiento del 3 % son ~80 € — casi 1/4 del beneficio del expediente.",
      ref: "S-2026-04417", client: "Acme Ibérica", age: "hace 4 h",
    },
    {
      id: "x7", kind: "uninvoiced", sev: "blue", risk: 214, riskType: "Pendiente de facturar",
      title: "Expediente entregado sin factura · 4 días",
      desc: "Entrega confirmada (POD) el 05 jun. Sin factura de venta emitida. SLA interno: facturar en 5 días.",
      ref: "S-2026-04402", client: "Talleres Vega", age: "hace 5 h",
    },
    {
      id: "x8", kind: "quote", sev: "blue", risk: null, riskType: null,
      title: "Cotización por vencer · 36 h",
      desc: "La oferta COT-2026-0912 a Nordix expira mañana. Tarifa de compra válida hasta el 14 jun.",
      ref: "COT-0912", client: "Nordix Components", age: "hace 6 h",
    },
  ];

  // ---- KPIs (CFO dashboard) ----
  const kpis = [
    { label: "Gross profit · mes", value: "184,2", unit: "k€", delta: "+12,4 %", dir: "up", icon: "coins" },
    { label: "Margen neto", value: "3,4", unit: "%", delta: "+0,3 pp", dir: "up", icon: "percent" },
    { label: "GP por expediente", value: "342", unit: "€", delta: "−4,1 %", dir: "down", icon: "file" },
    { label: "Margen fugado recuperado", value: "11,8", unit: "k€", delta: "+33 % GP", dir: "up", icon: "shield" },
  ];

  const leakage = [
    { cat: "Accesorios sin facturar", amount: 6240, pct: 53 },
    { cat: "Desvío accrual vs factura", amount: 3110, pct: 26 },
    { cat: "Demurrage no repercutido", amount: 1480, pct: 13 },
    { cat: "Diferencias de cambio", amount: 920, pct: 8 },
  ];

  const clientsGP = [
    { name: "Acme Ibérica", files: 42, gp: 18420, pct: 8.1, tier: "A" },
    { name: "Lumo Retail", files: 31, gp: 14260, pct: 6.4, tier: "A" },
    { name: "Nordix Components", files: 28, gp: 16880, pct: 9.6, tier: "A" },
    { name: "Delta Foods", files: 24, gp: 9740, pct: 11.2, tier: "B" },
    { name: "Verde Agro Export", files: 19, gp: 11030, pct: 13.4, tier: "B" },
    { name: "Talleres Vega", files: 12, gp: 3210, pct: 7.4, tier: "C" },
  ];

  // sparkline points for GP trend (12 weeks)
  const gpTrend = [120, 132, 118, 145, 138, 156, 149, 162, 158, 171, 166, 184];
  const leakTrend = [22, 19, 24, 18, 16, 14, 15, 13, 12, 11, 12, 11];

  // ---- Quote builder seed ----
  const quote = {
    id: "COT-2026-0912", client: "Nordix Components", mode: "AIR",
    origin: { code: "DEFRA", name: "Frankfurt" }, dest: { code: "MXMEX", name: "México DF" },
    incoterm: "CIP", validUntil: "14 jun 2026",
    cargo: { pieces: 14, weight: 1180, volume: 8.6, chargeable: 1437 },
    lines: [
      { code: "AFR",  desc: "Flete aéreo (peso facturable 1.437 kg)", sell: 3880, buy: 3520, pass: false },
      { code: "FSC",  desc: "Recargo combustible (FSC)", sell: 632, buy: 632, pass: true },
      { code: "SSC",  desc: "Recargo seguridad (SSC)", sell: 188, buy: 188, pass: true },
      { code: "AWB",  desc: "Emisión AWB / handling", sell: 95, buy: 42, pass: false },
      { code: "CCL",  desc: "Despacho exportación", sell: 140, buy: 60, pass: false },
      { code: "INS",  desc: "Seguro all-risk (comisión)", sell: 110, buy: 92, pass: false },
    ],
  };

  window.FARO = {
    hero: S4417,
    shipments: [S4417, ...more],
    exceptions,
    kpis, leakage, clientsGP, gpTrend, leakTrend,
    quote,
    org: { name: "Transitos Llevant", meta: "Barcelona · 18 usuarios", initials: "TL" },
    user: { name: "Marta Ruiz", initials: "MR", role: "Operativa marítimo import" },
  };
})();
