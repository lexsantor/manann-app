"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Aura de hero de marca, reutilizable y full-bleed (debe ir en un contenedor
 * `relative overflow-hidden` a ancho completo). Líneas de ruta curvas animadas
 * (metáfora de tráfico) en sea-green + glows. Theme-aware (currentColor =
 * --primary), decorativa (aria-hidden, pointer-events-none), respeta
 * prefers-reduced-motion. El prop `variant` cambia de dónde entran las curvas y
 * la posición de los glows, para que cada hero sea distinto pero cohesivo.
 */
const VARIANTS = [
  { gA: "-top-[20%] left-1/2 -translate-x-1/2", gB: "-right-[8%] top-[8%]", t: "" },
  { gA: "-top-[15%] -left-[12%]", gB: "bottom-[2%] right-[10%]", t: "-scale-x-100" },
  { gA: "-top-[22%] right-[6%]", gB: "-bottom-[6%] -left-[10%]", t: "rotate-180" },
  { gA: "-top-[10%] left-1/4", gB: "top-[16%] right-1/4", t: "-scale-y-100" },
  { gA: "-top-[18%] left-[8%]", gB: "-bottom-[8%] right-1/3", t: "-scale-x-100 rotate-180" },
];

function RouteLines({ position, animate }: { position: number; animate: boolean }) {
  const paths = Array.from({ length: 16 }, (_, i) => {
    const o = i * 6 * position;
    return {
      id: i,
      d: `M-${360 - o} -${120 + i * 9}C-${360 - o} -${120 + i * 9} -${180 - o} ${260 - i * 9} ${300 - o} ${360 - i * 9}C${760 - o} ${460 - i * 9} ${940 - o} ${760 - i * 9} ${940 - o} ${760 - i * 9}`,
      width: 0.6 + i * 0.045,
    };
  });

  return (
    <svg
      className="h-full w-full text-primary"
      viewBox="0 0 696 460"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {paths.map((p) => (
        <motion.path
          key={p.id}
          d={p.d}
          stroke="currentColor"
          strokeWidth={p.width}
          strokeOpacity={0.06 + p.id * 0.013}
          initial={animate ? { pathLength: 0.3, opacity: 0.5 } : false}
          animate={
            animate
              ? { pathLength: 1, opacity: [0.25, 0.6, 0.25], pathOffset: [0, 1, 0] }
              : undefined
          }
          transition={{
            duration: 24 + (p.id % 6) * 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </svg>
  );
}

export function HeroAura({ variant = 0 }: { variant?: number }) {
  const reduce = useReducedMotion();
  const animate = !reduce;
  const v = VARIANTS[variant % VARIANTS.length];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Glows ambientales (posición según variant) */}
      <div className={`absolute h-[62vh] w-[72vh] rounded-full bg-primary/[0.14] blur-[130px] sm:bg-primary/[0.09] ${v.gA}`} />
      <div className={`absolute h-[42vh] w-[42vh] rounded-full bg-accent/[0.09] blur-[110px] sm:bg-accent/[0.055] ${v.gB}`} />
      {/* Líneas de ruta (orientación según variant) */}
      <div className={`absolute inset-0 opacity-100 sm:opacity-[0.85] ${v.t}`}>
        <RouteLines position={1} animate={animate} />
        <RouteLines position={-1} animate={animate} />
      </div>
    </div>
  );
}
