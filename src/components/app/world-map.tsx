"use client";

import dynamic from "next/dynamic";
import { portCoords } from "@/lib/port-coords";
import { portLabel } from "@/lib/erp-format";

const ComposableMap = dynamic(
  () => import("react-simple-maps").then((m) => m.ComposableMap),
  { ssr: false },
);
const Geographies = dynamic(
  () => import("react-simple-maps").then((m) => m.Geographies),
  { ssr: false },
);
const Geography = dynamic(
  () => import("react-simple-maps").then((m) => m.Geography),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-simple-maps").then((m) => m.Marker),
  { ssr: false },
);
const Line = dynamic(
  () => import("react-simple-maps").then((m) => m.Line),
  { ssr: false },
);

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export interface MapRoute {
  id: string;
  reference: string;
  pol: string | null;
  pod: string | null;
  status: string;
  carrier: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  en_transito: "hsl(var(--primary))",      // marca
  en_aduana: "hsl(var(--accent))",         // IA/estado
  confirmado: "hsl(var(--info))",
  borrador: "hsl(var(--muted-foreground))",
  entregado: "hsl(var(--success))",
  cerrado: "hsl(var(--muted-foreground))",
};

export function WorldMap({ routes }: { routes: MapRoute[] }) {
  const active = routes.filter(
    (r) => r.pol && r.pod && portCoords(r.pol) && portCoords(r.pod),
  );

  // Agrupar puertos únicos y contar expedientes por puerto
  const portCount = new Map<string, number>();
  for (const r of active) {
    if (r.pol) portCount.set(r.pol, (portCount.get(r.pol) ?? 0) + 1);
    if (r.pod) portCount.set(r.pod, (portCount.get(r.pod) ?? 0) + 1);
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
      <ComposableMap
        projectionConfig={{ scale: 147, center: [15, 20] }}
        style={{ width: "100%", height: "auto" }}
        height={420}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: unknown[] }) =>
            geographies.map((geo: unknown) => (
              <Geography
                key={(geo as { rsmKey: string }).rsmKey}
                geography={geo}
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "hsl(var(--card))" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Rutas activas */}
        {active.map((r) => {
          const from = portCoords(r.pol!);
          const to = portCoords(r.pod!);
          if (!from || !to) return null;
          const color = STATUS_COLOR[r.status] ?? "hsl(var(--muted-foreground))";
          return (
            <Line
              key={r.id}
              from={from}
              to={to}
              className="route-flow"
              stroke={color}
              strokeWidth={1.2}
              strokeLinecap="round"
              strokeDasharray="4 3"
              strokeOpacity={0.7}
            />
          );
        })}

        {/* Pins de puertos */}
        {[...portCount.entries()].map(([locode, count]) => {
          const coords = portCoords(locode);
          if (!coords) return null;
          return (
            <Marker key={locode} coordinates={coords}>
              <circle
                r={count > 1 ? 5 : 3.5}
                fill="hsl(var(--primary))"
                fillOpacity={0.9}
                stroke="#fff"
                strokeWidth={0.8}
              />
              <text
                textAnchor="middle"
                y={-8}
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: "7px",
                  fill: "hsl(var(--muted-foreground))",
                  pointerEvents: "none",
                }}
              >
                {portLabel(locode)}
              </text>
              {count > 1 && (
                <text
                  textAnchor="middle"
                  y={1.5}
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: "5px",
                    fontWeight: 700,
                    fill: "#fff",
                    pointerEvents: "none",
                  }}
                >
                  {count}
                </text>
              )}
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Leyenda */}
      <div className="absolute bottom-3 left-4 flex flex-wrap gap-3">
        {Object.entries(STATUS_COLOR).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1 text-base text-muted-foreground">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: color }}
            />
            {status.replace("_", " ")}
          </span>
        ))}
      </div>
    </div>
  );
}
