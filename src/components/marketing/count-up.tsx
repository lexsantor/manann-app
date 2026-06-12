"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  target: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ target, decimals = 0, prefix = "", suffix = "", className }: CountUpProps) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fmt = (n: number) =>
      new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();

        const dur = 1700;
        let t0: number | null = null;
        const step = (t: number) => {
          if (!t0) t0 = t;
          const p = Math.min((t - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          setDisplay(fmt(parseFloat((target * eased).toFixed(decimals))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 }
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
