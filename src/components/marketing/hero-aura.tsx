"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Aura de hero de marca, reutilizable en todas las páginas de marketing.
 * Líneas de ruta curvas animadas (metáfora de tráfico/transitario) en sea-green
 * + glows suaves. Theme-aware (currentColor = --primary), detrás del contenido,
 * decorativa (aria-hidden, pointer-events-none) y respeta prefers-reduced-motion.
 */
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
          strokeOpacity={0.05 + p.id * 0.012}
          initial={animate ? { pathLength: 0.3, opacity: 0.5 } : false}
          animate={
            animate
              ? { pathLength: 1, opacity: [0.2, 0.55, 0.2], pathOffset: [0, 1, 0] }
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

export function HeroAura() {
  const reduce = useReducedMotion();
  const animate = !reduce;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Glows ambientales */}
      <div className="absolute -top-[20%] left-1/2 h-[60vh] w-[70vh] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-[130px]" />
      <div className="absolute -right-[10%] top-[10%] h-[40vh] w-[40vh] rounded-full bg-accent/[0.05] blur-[110px]" />
      {/* Líneas de ruta */}
      <div className="absolute inset-0 opacity-[0.65]">
        <RouteLines position={1} animate={animate} />
        <RouteLines position={-1} animate={animate} />
      </div>
    </div>
  );
}
