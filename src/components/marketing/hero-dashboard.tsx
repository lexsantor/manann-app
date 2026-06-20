import { cn } from "@/lib/utils";

const SIDEBAR_GROUPS = [
  {
    section: null,
    items: [{ label: "General", active: false }],
  },
  {
    section: "Operaciones",
    items: [
      { label: "Expedientes", active: true },
      { label: "Tracking", active: false },
      { label: "Documentos", active: false },
      { label: "Aduanas", active: false },
    ],
  },
  {
    section: "Comercial",
    items: [
      { label: "Clientes", active: false },
      { label: "Cotizaciones", active: false },
    ],
  },
  {
    section: "Finanzas",
    items: [
      { label: "Facturación", active: false },
      { label: "Gastos", active: false },
      { label: "Tarifas", active: false },
    ],
  },
  {
    section: "Análisis",
    items: [
      { label: "Reportes", active: false },
      { label: "Automatizaciones", active: false },
    ],
  },
  {
    section: "IA Manann",
    items: [{ label: "Resúmenes IA", active: false }],
  },
];

const BOTTOM_ITEMS = ["Integraciones", "Configuración"];

const KPIS = [
  { label: "En tránsito", value: "248", delta: "+12% vs. mes ant." },
  { label: "En aduana", value: "36", delta: "−8% tiempo medio" },
  { label: "Por facturar", value: "€482k", delta: "+6% margen" },
  { label: "OTD", value: "96,4%", delta: "+1,2 pts" },
];

const BARS = [38, 52, 44, 66, 58, 74, 62, 88];
const BAR_LABELS = ["S18", "S19", "S20", "S21", "S22", "S23", "S24", "S25"];

const ROWS = [
  { ref: "MNN-84213", route: "Shanghái → Valencia", mode: "FCL", status: "En tránsito", color: "primary", eta: "18 jun" },
  { ref: "MNN-84207", route: "Ningbo → Róterdam", mode: "FCL", status: "En aduana", color: "warn", eta: "14 jun" },
  { ref: "MNN-84198", route: "Bogotá → Madrid", mode: "Aéreo", status: "Entregado", color: "ok", eta: "12 jun" },
  { ref: "MNN-84190", route: "Veracruz → Barcelona", mode: "LCL", status: "Documentación", color: "neutral", eta: "21 jun" },
  { ref: "MNN-84185", route: "Busan → Hamburgo", mode: "FCL", status: "En tránsito", color: "primary", eta: "24 jun" },
];

const STATUS: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  warn: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  ok: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  neutral: "bg-border/30 text-muted-foreground/60",
};

export function HeroDashboard() {
  return (
    <div className="relative">
      {/* App window */}
      <div
        className="overflow-hidden rounded-xl border border-border"
        style={{
          background: "linear-gradient(180deg, hsl(var(--card) / 0.92), hsl(var(--background) / 0.97))",
          boxShadow:
            "var(--shadow-card-hero), inset 0 0 0 1px hsl(var(--foreground) / 0.03), inset 0 -1px 60px -20px hsl(var(--primary) / 0.22)",
        }}
      >
        {/* Chrome bar */}
        <div className="flex items-center gap-2 border-b border-border/50 bg-surface-2/60 px-4 py-2.5">
          <div className="flex gap-1.5">
            {["hsl(5 72% 58% / 0.65)", "hsl(38 70% 56% / 0.65)", "hsl(140 48% 48% / 0.65)"].map((bg, i) => (
              <span key={i} className="block size-2.5 rounded-full" style={{ background: bg }} />
            ))}
          </div>
          <div className="flex flex-1 justify-center">
            <span className="truncate rounded-md border border-border/25 bg-background/50 px-4 py-1 font-mono text-[10px] text-muted-foreground/45 tracking-tight">
              app.manann.com/expedientes
            </span>
          </div>
        </div>

        {/* Body grid */}
        <div style={{ display: "grid", gridTemplateColumns: "192px 1fr", minHeight: 500 }}>
          {/* Sidebar */}
          <div className="hidden flex-col border-r border-border/35 overflow-y-auto px-2 py-3 sm:flex">
            {/* Logo */}
            <div className="mb-2 flex items-center gap-2 px-2 py-1">
              <span
                className="block size-3.5 rotate-45 rounded-[3px] shrink-0"
                style={{
                  background: "linear-gradient(135deg, hsl(172 51% 52%), hsl(185 55% 66%))",
                  boxShadow: "0 0 10px hsl(var(--primary) / 0.45)",
                }}
              />
              <span className="font-display text-sm font-semibold tracking-tight">Manann</span>
            </div>

            {/* Groups */}
            {SIDEBAR_GROUPS.map((group, gi) => (
              <div key={gi} className={cn(gi > 0 ? "mt-3" : "mt-1")}>
                {group.section && (
                  <p className="mb-0.5 px-2.5 font-mono text-[8px] uppercase tracking-[0.18em] text-muted-foreground/30">
                    {group.section}
                  </p>
                )}
                {group.items.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2.5 py-[5px] text-[12px]",
                      item.active
                        ? "bg-primary/9 text-foreground"
                        : "text-muted-foreground/50 hover:text-muted-foreground/70"
                    )}
                  >
                    <span
                      className={cn(
                        "size-[4px] shrink-0 rounded-[2px]",
                        item.active ? "bg-primary" : "bg-muted-foreground/20"
                      )}
                      style={item.active ? { boxShadow: "0 0 6px hsl(var(--primary))" } : undefined}
                    />
                    {item.label}
                  </div>
                ))}
              </div>
            ))}

            {/* Bottom utilities */}
            <div className="mt-auto border-t border-border/25 px-2 pt-2.5 pb-1">
              {BOTTOM_ITEMS.map((label) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-md px-2.5 py-[5px] text-[12px] text-muted-foreground/35"
                >
                  <span className="size-[4px] shrink-0 rounded-[2px] bg-muted-foreground/15" />
                  {label}
                </div>
              ))}
              <span className="mt-1.5 block font-mono text-[10px] text-muted-foreground/25 px-2.5">
                OP · Valencia HQ
              </span>
            </div>
          </div>

          {/* Main */}
          <div className="flex flex-col gap-3 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-base font-semibold tracking-tight">Expedientes activos</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/40">Actualizado hace 2 min</div>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span
                  className="shrink-0 whitespace-nowrap rounded-[7px] px-3 py-1.5 font-mono text-[10px] font-semibold text-background"
                  style={{ background: "linear-gradient(120deg, hsl(172 51% 42%), hsl(185 55% 62%))" }}
                >
                  + Nuevo expediente
                </span>
                <span className="flex size-7 items-center justify-center rounded-full border border-border bg-card font-mono text-[10px] font-semibold text-muted-foreground/60">
                  LM
                </span>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {KPIS.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-border/35 bg-background/20 p-2.5">
                  <div className="font-mono text-[8px] uppercase tracking-[0.06em] text-muted-foreground/40">{kpi.label}</div>
                  <div className="mt-1 font-display text-[18px] font-semibold leading-none tracking-tight">{kpi.value}</div>
                  <div className="mt-1 text-[10px] font-semibold text-primary/60">{kpi.delta}</div>
                </div>
              ))}
            </div>

            {/* Split: chart + table */}
            <div className="flex flex-1 gap-2.5" style={{ minHeight: 0 }}>
              {/* Bar chart */}
              <div className="w-[240px] shrink-0 rounded-lg border border-border/35 bg-background/20 p-3">
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-[12px] font-semibold">Volumen semanal</span>
                  <span className="font-mono text-[8px] text-muted-foreground/35">TEU</span>
                </div>
                <div className="flex h-[80px] items-end gap-1.5">
                  {BARS.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-[2px]"
                      style={{
                        height: `${h}%`,
                        background:
                          i === 7
                            ? "linear-gradient(180deg, hsl(172 51% 52%), hsl(185 55% 68%))"
                            : "linear-gradient(180deg, hsl(var(--primary) / 0.35), hsl(var(--primary) / 0.15))",
                        boxShadow: i === 7 ? "0 0 10px hsl(var(--primary) / 0.35)" : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex gap-1.5">
                  {BAR_LABELS.map((l) => (
                    <div key={l} className="flex-1 text-center font-mono text-[8px] text-muted-foreground/30">{l}</div>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-hidden rounded-lg border border-border/35 bg-background/20">
                <div
                  className="grid items-center gap-2 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground/30"
                  style={{ gridTemplateColumns: "1fr 1.5fr 0.7fr 1fr 0.55fr" }}
                >
                  <span>Referencia</span>
                  <span>Ruta</span>
                  <span>Modo</span>
                  <span>Estado</span>
                  <span className="text-right">ETA</span>
                </div>
                {ROWS.map((row) => (
                  <div
                    key={row.ref}
                    className="grid items-center gap-2 border-t border-border/20 px-3 py-1.5"
                    style={{ gridTemplateColumns: "1fr 1.5fr 0.7fr 1fr 0.55fr" }}
                  >
                    <span className="font-mono text-[10px] text-primary/75">{row.ref}</span>
                    <span className="truncate text-[10px] text-muted-foreground/55">{row.route}</span>
                    <span className="w-fit rounded-full border border-border/20 bg-background/25 px-1.5 py-0.5 font-mono text-[8px] text-muted-foreground/40">
                      {row.mode}
                    </span>
                    <span className={cn("inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[8px] font-semibold", STATUS[row.color])}>
                      <span className="size-[3px] rounded-full bg-current" />
                      {row.status}
                    </span>
                    <span className="text-right font-mono text-[10px] text-muted-foreground/35">{row.eta}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Float card A — right */}
      <div className="animate-float-a absolute -right-8 top-[80px] z-10 hidden w-[214px] rounded-xl border border-border/65 bg-background/85 p-3.5 backdrop-blur-xl shadow-[var(--shadow-float)] sm:block">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-primary">MNN-84213</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[8px] font-semibold text-primary/75">En tránsito</span>
        </div>
        <div className="mt-1.5 text-[12px] font-semibold">Estrecho de Malaca</div>
        <div className="mt-0.5 text-[10px] text-muted-foreground/55">MSC Aurora V. · 14.860 TEU</div>
        <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-border/20">
          <div
            className="h-full w-[72%] rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(172 51% 42%), hsl(185 55% 66%))",
              boxShadow: "0 0 8px hsl(var(--primary) / 0.5)",
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground/35">
          <span>72% del trayecto</span>
          <span>ETA 18 jun</span>
        </div>
      </div>

      {/* Float card B — left */}
      <div className="animate-float-b absolute -left-8 bottom-[88px] z-10 hidden w-[214px] rounded-xl border border-border/65 bg-background/85 p-3.5 backdrop-blur-xl shadow-[var(--shadow-float)] sm:block">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-[12px] text-emerald-400">
            ✓
          </div>
          <div>
            <div className="text-[12px] font-semibold leading-snug">DUA admitida · canal verde</div>
            <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/40">Aduana Valencia · hace 4 min</div>
          </div>
        </div>
      </div>
    </div>
  );
}
