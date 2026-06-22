"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function format(n: number, decimals: number) {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function CountUp({ target, decimals = 0, prefix = "", suffix = "", className }: CountUpProps) {
  // Estado base = valor REAL. Asi SSR, sin-JS, pre-scroll y lector de pantalla
  // muestran el numero, nunca "0" (que invertia el mensaje).
  const [display, setDisplay] = useState(() => format(target, decimals));
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced-motion: se queda en el valor real, sin animar.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Si ya esta a la vista al montar (above-the-fold), no animar: evita el
    // salto a 0 y vuelta. Solo animan las cifras que el usuario aun no ha visto.
    const rect = el.getBoundingClientRect();
    const visibleNow = rect.top < window.innerHeight && rect.bottom > 0;
    if (visibleNow) {
      started.current = true;
      return;
    }

    // Bajo el pliegue: arranca en 0 y cuenta hacia el valor al entrar en viewport.
    setDisplay(format(0, decimals));

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();

        const dur = 1700;
        let t0: number | null = null;
        const step = (t: number) => {
          if (t0 === null) t0 = t;
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          setDisplay(format(parseFloat((target * eased).toFixed(decimals)), decimals));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [target, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
