"use client";

import { useRef } from "react";

// Navegación por teclado tipo Linear sobre filas con [data-shipment-row].
// Las filas (server components) se pasan como children: aquí solo va el handler.
export function KeyboardListNav({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowDown", "ArrowUp", "j", "k"];
    if (!keys.includes(e.key)) return;

    const rows = Array.from(
      ref.current?.querySelectorAll<HTMLElement>("[data-shipment-row]") ?? [],
    );
    if (!rows.length) return;

    e.preventDefault();
    const current = rows.indexOf(document.activeElement as HTMLElement);
    const down = e.key === "ArrowDown" || e.key === "j";
    let next: number;
    if (current < 0) next = 0;
    else if (down) next = Math.min(current + 1, rows.length - 1);
    else next = Math.max(current - 1, 0);
    rows[next]?.focus();
  }

  return (
    <div ref={ref} onKeyDown={onKeyDown} className="space-y-2">
      {children}
    </div>
  );
}
