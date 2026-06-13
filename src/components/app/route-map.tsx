"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import "leaflet/dist/leaflet.css";

import { portCoords, portLabel, TRACKING_TYPE } from "@/lib/erp-format";

// Colores de marca (Leaflet no consume tokens CSS; hex del sistema de diseño).
const SEA_GREEN = "#34A092";
const AMBER = "#E0A458";
const SLATE = "#4A6670";

interface RouteMapProps {
  pol: string | null;
  pod: string | null;
  events: { location: string | null; type: string }[];
}

export function RouteMap({ pol, pod, events }: RouteMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const origin = portCoords(pol);
  const dest = portCoords(pod);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el) return;

      map = L.map(el, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: true,
        dragging: true,
      });
      map.zoomControl.setPosition("bottomright");

      const dark = resolvedTheme !== "light";
      const tiles = dark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      L.tileLayer(tiles, { maxZoom: 10, minZoom: 1 }).addTo(map);

      const pts: [number, number][] = [];

      // Ruta POL→POD (línea discontinua, esquemática).
      if (origin && dest) {
        L.polyline([origin, dest], {
          color: SLATE,
          weight: 1.5,
          opacity: 0.7,
          dashArray: "5 6",
        }).addTo(map);
        pts.push(origin, dest);
      }

      const dot = (
        coord: [number, number],
        color: string,
        radius: number,
        label: string,
        fill = true,
      ) =>
        L.circleMarker(coord, {
          color,
          weight: 2,
          radius,
          fillColor: color,
          fillOpacity: fill ? 0.9 : 0.15,
        })
          .addTo(map!)
          .bindTooltip(label, { direction: "top", offset: [0, -4] });

      if (origin) dot(origin, SEA_GREEN, 6, `Origen · ${portLabel(pol)}`);
      if (dest) dot(dest, SEA_GREEN, 6, `Destino · ${portLabel(pod)}`, false);

      // Eventos (orden desc: el primero es la posición actual).
      events.forEach((e, i) => {
        const c = portCoords(e.location);
        if (!c) return;
        pts.push(c);
        const current = i === 0;
        const label = `${TRACKING_TYPE[e.type] ?? e.type} · ${portLabel(e.location)}`;
        if (current) {
          const pulseIcon = L.divIcon({
            className: "",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            html: `<span style="
              display:block;position:relative;width:20px;height:20px;">
              <span style="
                position:absolute;inset:0;border-radius:50%;
                background:${AMBER};opacity:0.25;
                animation:manann-pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite;">
              </span>
              <span style="
                position:absolute;top:4px;left:4px;width:12px;height:12px;
                border-radius:50%;background:${AMBER};border:2px solid #fff;">
              </span>
            </span>`,
          });
          L.marker(c, { icon: pulseIcon })
            .addTo(map!)
            .bindTooltip(label, { direction: "top", offset: [0, -4] });
        } else {
          dot(c, AMBER, 4, label);
        }
      });

      if (pts.length) {
        map.fitBounds(L.latLngBounds(pts).pad(0.35));
      } else {
        map.setView([30, 0], 2);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
    // Re-render al cambiar de tema o de datos.
  }, [resolvedTheme, pol, pod, events, origin, dest]);

  return (
    <div
      ref={ref}
      className="h-[240px] w-full overflow-hidden rounded-md border border-border bg-surface-2"
      aria-label="Mapa de la ruta del expediente"
    />
  );
}
