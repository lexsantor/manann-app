"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Icon } from "@/components/icon";

/**
 * Toggle de tema (pill — una de las tres excepciones rounded-full del sistema).
 * Muestra el icono del modo ACTIVO: luna en oscuro, sol en claro.
 * Todo lo dependiente del tema se gatea con `mounted` para evitar mismatch de
 * hidratación (el servidor no conoce el tema resuelto).
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
      aria-label={
        mounted
          ? isDark
            ? "Cambiar a modo claro"
            : "Cambiar a modo oscuro"
          : "Cambiar tema"
      }
      title={mounted ? (isDark ? "Modo oscuro" : "Modo claro") : undefined}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-surface-2"
    >
      {mounted ? (
        <Icon icon={isDark ? Moon : Sun} size={17} />
      ) : (
        <span className="size-[17px]" />
      )}
    </button>
  );
}
