"use client";

import { useEffect, useState } from "react";
import { Zap, ImageOff } from "lucide-react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function DisplayPrefsSection() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hideImages, setHideImages] = useState(false);

  useEffect(() => {
    setReduceMotion(localStorage.getItem("reduceMotion") === "1");
    setHideImages(localStorage.getItem("hidePortImages") === "1");
  }, []);

  function handleReduceMotion(v: boolean) {
    setReduceMotion(v);
    localStorage.setItem("reduceMotion", v ? "1" : "0");
    document.body.dataset.reduceMotion = v ? "true" : "false";
  }

  function handleHideImages(v: boolean) {
    setHideImages(v);
    localStorage.setItem("hidePortImages", v ? "1" : "0");
    window.dispatchEvent(new Event("hidePortImagesChanged"));
  }

  const rows = [
    {
      icon: Zap,
      label: "Desactivar animaciones",
      description: "Elimina transiciones y efectos de movimiento en la interfaz.",
      value: reduceMotion,
      onChange: handleReduceMotion,
    },
    {
      icon: ImageOff,
      label: "Prescindir de imágenes de puerto",
      description: "Muestra un placeholder en lugar de la foto del puerto de destino.",
      value: hideImages,
      onChange: handleHideImages,
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Preferencias de visualización
      </h2>
      <div className="divide-y divide-border rounded-md border bg-card">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2/40">
                <Icon icon={row.icon} size={14} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">{row.label}</p>
                <p className="mt-0.5 text-base text-muted-foreground">{row.description}</p>
              </div>
            </div>
            <Toggle checked={row.value} onChange={row.onChange} />
          </div>
        ))}
      </div>
    </section>
  );
}
