"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Toggle de tema (pill — una de las tres excepciones rounded-full del sistema).
 * Placeholder textual en PR-1; en PR-2 usará el wrapper <Icon> de Lucide.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Cambiar tema"
      className="rounded-full border border-border bg-card px-4 py-1.5 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {mounted ? (isDark ? "Claro" : "Oscuro") : "Tema"}
    </button>
  );
}
