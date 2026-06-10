import Link from "next/link";
import { MoveRight } from "lucide-react";

import { type ShipmentListItem } from "@/lib/erp";
import { portLabel, formatDate, MODE } from "@/lib/erp-format";
import { portImageUrl } from "@/lib/port-images";
import { StatusPill } from "@/components/app/status-pill";
import { Icon } from "@/components/icon";

function cityOnly(locode: string | null): string {
  const label = portLabel(locode);
  const idx = label.indexOf(" · ");
  return idx !== -1 ? label.slice(0, idx) : label;
}

function journeyProgress(s: ShipmentListItem): number {
  switch (s.status) {
    case "borrador":    return 0;
    case "confirmado":  return 8;
    case "en_aduana":   return 90;
    case "entregado":
    case "cerrado":     return 100;
    case "en_transito": {
      if (!s.etd || !s.eta) return 50;
      const now = Date.now();
      const start = s.etd.getTime();
      const end = s.eta.getTime();
      if (now <= start) return 12;
      if (now >= end)   return 88;
      return Math.round(((now - start) / (end - start)) * 76) + 12;
    }
    default: return 0;
  }
}

export function ShipmentBoardingPass({ s }: { s: ShipmentListItem }) {
  const pol3     = s.pol?.slice(-3) ?? "???";
  const pod3     = s.pod?.slice(-3) ?? "???";
  const polCity  = cityOnly(s.pol);
  const podCity  = cityOnly(s.pod);
  const imgUrl   = portImageUrl(s.pod ?? "");
  const progress = journeyProgress(s);
  const mode     = MODE[s.mode] ?? MODE.maritimo;

  return (
    <Link
      href={`/expedientes/${s.id}`}
      prefetch={false}
      className="group block w-[264px] shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article className="relative w-full rounded-xl border border-border bg-card shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">

        {/* ── Destination photo ─────────────────────────────────── */}
        <div className="relative h-[148px] overflow-hidden rounded-t-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={podCity}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          {/* Port codes */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50">
                  Origen
                </p>
                <p className="font-display text-[2rem] font-bold leading-none tracking-tighter text-white">
                  {pol3}
                </p>
              </div>
              <Icon icon={MoveRight} size={15} className="mb-1.5 shrink-0 text-white/35" />
              <div className="flex-1 text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/50">
                  Destino
                </p>
                <p className="font-display text-[2rem] font-bold leading-none tracking-tighter text-white">
                  {pod3}
                </p>
              </div>
            </div>
            <p className="mt-1 font-mono text-[10px] text-white/50">
              {polCity} · {podCity}
            </p>
          </div>
        </div>

        {/* ── Perforation ───────────────────────────────────────── */}
        <div className="relative flex items-center">
          <div className="absolute -left-[10px] h-5 w-5 rounded-full border border-border bg-background" />
          <div className="mx-5 h-px flex-1 border-t border-dashed border-border/70" />
          <div className="absolute -right-[10px] h-5 w-5 rounded-full border border-border bg-background" />
        </div>

        {/* ── Ticket info ───────────────────────────────────────── */}
        <div className="px-4 pb-4 pt-2.5">
          <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
            {s.reference}
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                ETD
              </p>
              <p className="mt-0.5 font-mono text-sm text-foreground">
                {formatDate(s.etd)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                ETA
              </p>
              <p className="mt-0.5 font-mono text-sm text-foreground">
                {formatDate(s.eta)}
              </p>
            </div>
          </div>

          {/* Journey progress */}
          <div className="mt-3">
            <div className="relative h-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between">
            <StatusPill status={s.status} />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon icon={mode.icon} size={12} />
              {mode.label}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
