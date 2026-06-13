"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { X, Send, Sparkles, Loader2, ExternalLink, AlertTriangle, TrendingUp, User } from "lucide-react";
import { getCopilotoContext } from "@/lib/erp-actions";
import { formatMoney } from "@/lib/erp-format";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

type CopilotoContext = Awaited<ReturnType<typeof getCopilotoContext>>;

// ─── Tipos de bloque de respuesta ────────────────────────────────────────────

type Block =
  | { type: "text"; content: string }
  | { type: "card"; rows: { label: string; value: string; highlight?: boolean }[] }
  | { type: "email"; to: string; subject: string; body: string }
  | { type: "actions"; items: { label: string; href: string }[] };

interface Message {
  id: string;
  role: "user" | "ai";
  text?: string;
  blocks?: Block[];
}

// ─── Renderizador de bloques ──────────────────────────────────────────────────

function BlockRenderer({ blocks }: { blocks: Block[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === "text") {
          return (
            <p key={i} className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
              {b.content}
            </p>
          );
        }
        if (b.type === "card") {
          return (
            <div key={i} className="rounded-lg border border-border/60 bg-surface-2/40 divide-y divide-border/40">
              {b.rows.map((r, j) => (
                <div key={j} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="text-base text-muted-foreground">{r.label}</span>
                  <span className={cn("font-mono text-base font-medium", r.highlight ? "text-emerald-500" : "text-foreground")}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          );
        }
        if (b.type === "email") {
          const full = `Para: ${b.to}\nAsunto: ${b.subject}\n\n${b.body}`;
          return (
            <div key={i} className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
              <p className="font-mono text-sm uppercase tracking-wider text-primary">Borrador de email</p>
              <p className="text-base text-muted-foreground">
                <span className="font-medium text-foreground">Para:</span> {b.to}
              </p>
              <p className="text-base text-muted-foreground">
                <span className="font-medium text-foreground">Asunto:</span> {b.subject}
              </p>
              <p className="text-base text-foreground whitespace-pre-wrap border-t border-primary/10 pt-2 mt-2">
                {b.body}
              </p>
              <button
                onClick={() => copy(full, `email-${i}`)}
                className="mt-1 rounded bg-primary/10 px-2.5 py-1 text-base font-medium text-primary hover:bg-primary/15"
              >
                {copied === `email-${i}` ? "Copiado ✓" : "Copiar"}
              </button>
            </div>
          );
        }
        if (b.type === "actions") {
          return (
            <div key={i} className="flex flex-wrap gap-2">
              {b.items.map((item, j) => (
                <Link
                  key={j}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1.5 text-base font-medium text-foreground transition-colors hover:bg-border"
                >
                  {item.label}
                  <Icon icon={ExternalLink} size={10} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ─── Motor de respuestas ──────────────────────────────────────────────────────

function buildResponse(query: string, ctx: CopilotoContext): Block[] {
  const q = query.toLowerCase();

  // Margen / riesgo / pérdida / fuga
  if (/margen|riesgo|pérdida|perdida|fuga|excepcion|excepción/.test(q)) {
    if (!ctx || ctx.atRiskCount === 0) {
      return [
        { type: "text", content: "No hay margen en riesgo actualmente. Todo en orden." },
      ];
    }
    const rows = ctx.topExceptions.map((e) => ({
      label: `${e.ref} · ${e.kind === "at_risk" ? "Sin facturar" : e.kind === "accrual_gap" ? "Desvío accrual" : "GP negativo"}`,
      value: formatMoney(String(e.amount), "EUR"),
      highlight: e.amount > 200,
    }));
    return [
      { type: "text", content: `Hay ${formatMoney(String(ctx.atRiskTotal), "EUR")} de margen en riesgo en ${ctx.atRiskCount} cargo${ctx.atRiskCount > 1 ? "s" : ""}. Aquí las excepciones más urgentes:` },
      { type: "card", rows },
      { type: "actions", items: [{ label: "Abrir bandeja de excepciones", href: "/excepciones" }, { label: "Ver Autopilot", href: "/autopilot" }] },
    ];
  }

  // Clientes / rentabilidad
  if (/cliente|rentable|gp|gross|cartera|tier/.test(q)) {
    if (!ctx || ctx.gpByClient.length === 0) {
      return [{ type: "text", content: "Aún no hay datos de GP por cliente. Añade cargos con buy/sell a los expedientes." }];
    }
    const rows = ctx.gpByClient.map((c) => ({
      label: `${c.name} (Tier ${c.tier})`,
      value: `${formatMoney(String(c.gp), "EUR")} · ${c.margin.toFixed(1)}%`,
      highlight: c.gp > 0,
    }));
    return [
      { type: "text", content: "Ranking de clientes por Gross Profit acumulado:" },
      { type: "card", rows },
      { type: "actions", items: [{ label: "Ver dashboard completo", href: "/dashboard" }] },
    ];
  }

  // Expediente específico (referencia)
  if (ctx && /exp-|s-20/.test(q)) {
    const ref = ctx.activeShipments.find((s) =>
      s.ref.toLowerCase().includes(q.replace(/.*?(exp-\S+|s-20\S+).*/i, "$1").toLowerCase())
    );
    if (ref) {
      return [
        { type: "text", content: `Expediente ${ref.ref}:` },
        { type: "card", rows: [
          { label: "Estado", value: ref.status },
          { label: "Ruta", value: `${ref.pol ?? "?"} → ${ref.pod ?? "?"}` },
          { label: "Naviera", value: ref.carrier ?? "—" },
          { label: "ETA", value: ref.eta ?? "—" },
        ]},
        { type: "actions", items: [{ label: `Abrir ${ref.ref}`, href: `/expedientes/${ref.id}` }] },
      ];
    }
  }

  // Activos / en curso / dónde están
  if (/activo|curso|tránsito|transito|tracking|dónde|donde|buque/.test(q)) {
    if (!ctx || ctx.activeShipments.length === 0) {
      return [{ type: "text", content: "No hay expedientes activos en este momento." }];
    }
    const rows = ctx.activeShipments.map((s) => ({
      label: s.ref,
      value: `${s.pol ?? "?"} → ${s.pod ?? "?"} · ETA ${s.eta ?? "—"}`,
    }));
    return [
      { type: "text", content: `Tienes ${ctx.activeCount} expediente${ctx.activeCount > 1 ? "s" : ""} en curso:` },
      { type: "card", rows },
      { type: "actions", items: [{ label: "Ver expedientes", href: "/expedientes" }] },
    ];
  }

  // Cierre / contabilidad / junio
  if (/cierre|contab|mes|junio|julio|agosto|asiento/.test(q)) {
    return [
      { type: "text", content: "Estado del cierre mensual:" },
      { type: "card", rows: [
        { label: "Facturas pendientes de emitir", value: ctx ? `${Math.max(0, ctx.activeCount - 2)} expedientes` : "—" },
        { label: "Margen sin facturar", value: ctx && ctx.atRiskTotal > 0 ? formatMoney(String(ctx.atRiskTotal), "EUR") : "0 €", highlight: (ctx?.atRiskTotal ?? 0) > 0 },
        { label: "Accruals abiertos", value: "Revisar en Autopilot" },
      ]},
      { type: "actions", items: [
        { label: "Ver Autopilot", href: "/autopilot" },
        { label: "Ver facturas", href: "/facturas" },
      ]},
    ];
  }

  // Email / reclamación / demurrage
  if (/email|correo|recla|demurrage|demurage|carta/.test(q)) {
    const shipRef = ctx?.activeShipments[0]?.ref ?? "EXP-2026-0001";
    return [
      { type: "text", content: "Aquí tienes un borrador de reclamación:" },
      { type: "email",
        to: "operaciones@naviera.com",
        subject: `Reclamación de cargos no previstos — ${shipRef}`,
        body: `Estimados señores,\n\nEn relación al expediente ${shipRef}, le comunicamos que hemos detectado cargos adicionales (THC destino, demurrage) que no fueron informados en la tarifa original.\n\nSolicitamos que procedan a revisar y, en su caso, a rectificar la liquidación correspondiente.\n\nQuedamos a su disposición.\n\nAtentamente,\n[Tu nombre]`,
      },
    ];
  }

  // Resumen general
  if (/resumen|estado|hoy|qué pasa|que pasa|cómo vamos|como vamos/.test(q)) {
    return [
      { type: "text", content: `Resumen operativo:` },
      { type: "card", rows: [
        { label: "Expedientes totales", value: String(ctx?.shipmentCount ?? 0) },
        { label: "En curso", value: String(ctx?.activeCount ?? 0) },
        { label: "Margen en riesgo", value: ctx && ctx.atRiskTotal > 0 ? formatMoney(String(ctx.atRiskTotal), "EUR") : "0 €", highlight: (ctx?.atRiskTotal ?? 0) > 0 },
        { label: "Acciones IA pendientes", value: ctx && ctx.atRiskCount > 0 ? `${ctx.atRiskCount} urgentes` : "Todo en orden" },
      ]},
      { type: "actions", items: [
        { label: "Ver briefing", href: "/briefing" },
        { label: "Ver autopilot", href: "/autopilot" },
      ]},
    ];
  }

  // Default
  return [
    { type: "text", content: "Puedo ayudarte con:\n• Margen en riesgo y excepciones\n• Estado de expedientes activos\n• Ranking de clientes por GP\n• Borrador de emails de reclamación\n• Resumen del estado operativo\n\nPrueba: \"¿Dónde pierdo margen?\" o \"¿Qué cliente es más rentable?\"" },
  ];
}

const SUGGESTED = [
  "¿Dónde pierdo margen?",
  "¿Qué cliente es más rentable?",
  "Resumen del estado actual",
  "Redacta un email de reclamación",
  "¿Qué expedientes están en curso?",
  "Prepara el cierre del mes",
];

// ─── Panel principal ──────────────────────────────────────────────────────────

export function CopilotoPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [ctx, setCtx] = useState<CopilotoContext>(null);
  const [loadingCtx, startCtxLoad] = useTransition();
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut ⌘J
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Load context on first open
  useEffect(() => {
    if (!open || ctx !== null) return;
    startCtxLoad(async () => {
      const data = await getCopilotoContext();
      setCtx(data);
    });
  }, [open, ctx]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  function sendMessage(query: string) {
    if (!query.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const blocks = buildResponse(query, ctx);
      const aiMsg: Message = { id: crypto.randomUUID(), role: "ai", blocks };
      setMessages((prev) => [...prev, aiMsg]);
      setThinking(false);
    }, 700 + Math.random() * 400);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Copiloto IA (⌘J)"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-primary/30 hover:shadow-xl lg:bottom-8 lg:right-8"
        aria-label="Abrir copiloto IA"
      >
        <Icon icon={Sparkles} size={20} className="text-primary-foreground" />
      </button>
    );
  }

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col border-l border-border bg-card shadow-2xl sm:w-[420px]">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Icon icon={Sparkles} size={16} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-base text-foreground leading-none">Manann IA · Copiloto</p>
            <p className="mt-0.5 text-base text-muted-foreground">Con acceso de lectura a tus datos</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <Icon icon={X} size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Loading context */}
          {loadingCtx && (
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Cargando contexto de tus datos…
            </div>
          )}

          {/* Welcome + suggestions */}
          {messages.length === 0 && !loadingCtx && (
            <div className="space-y-4">
              <div className="rounded-xl bg-surface-2/60 p-4">
                <p className="text-base text-foreground">
                  Hola. Puedo responder preguntas sobre tus expedientes, margen, clientes y generar borradores de emails.
                </p>
                {ctx && ctx.atRiskTotal > 0 && (
                  <div className="mt-2 flex items-center gap-2 rounded-md bg-destructive/10 px-2.5 py-2">
                    <Icon icon={AlertTriangle} size={12} className="text-destructive shrink-0" />
                    <p className="text-base text-destructive">
                      Tienes {formatMoney(String(ctx.atRiskTotal), "EUR")} de margen en riesgo.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 font-mono text-sm uppercase tracking-wider text-muted-foreground">Sugerencias</p>
                <div className="space-y-1.5">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-base text-foreground transition-colors hover:bg-surface-2"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                msg.role === "ai" ? "bg-primary/10" : "bg-surface-2",
              )}>
                <Icon
                  icon={msg.role === "ai" ? Sparkles : User}
                  size={14}
                  className={msg.role === "ai" ? "text-primary" : "text-muted-foreground"}
                />
              </div>
              <div className={cn(
                "max-w-[85%] rounded-xl px-3 py-2.5",
                msg.role === "user"
                  ? "bg-primary/10 text-foreground"
                  : "bg-surface-2/60 text-foreground",
              )}>
                {msg.role === "user" && (
                  <p className="text-base">{msg.text}</p>
                )}
                {msg.role === "ai" && msg.blocks && (
                  <BlockRenderer blocks={msg.blocks} />
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <Icon icon={Sparkles} size={14} className="text-primary" />
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-surface-2/60 px-3 py-2.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-pulse"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre tus datos…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <Icon icon={Send} size={15} />
            </button>
          </form>
          <p className="mt-1.5 text-center font-mono text-base text-muted-foreground/50">
            ⌘J para abrir/cerrar · Respuestas basadas en tus datos reales
          </p>
        </div>
      </div>
    </>
  );
}
