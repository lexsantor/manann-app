"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Cuenta un número al entrar en viewport (efecto count-up). Acepta strings tipo "40+", "100%". */
export function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const m = value.match(/^(\D*)(\d[\d.,]*)(.*)$/s);
  const target = m ? parseFloat(m[2].replace(/[.,]/g, "")) : 0;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || !m) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, m, target, duration]);
  if (!m) return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{m[1]}{n}{m[3]}</span>;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.65, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-48px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.55, ease },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
