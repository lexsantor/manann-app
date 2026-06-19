"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Sparkles, X } from "lucide-react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tourForPath } from "@/lib/tours";

export const OPEN_TOUR_EVENT = "manann:open-tour";

export function GuidedTour() {
  const pathname = usePathname();
  const steps = tourForPath(pathname);
  const [step, setStep] = useState<number | null>(null);

  // Abrir al recibir el evento (lo dispara el botón Ayuda).
  useEffect(() => {
    function open() {
      setStep(0);
    }
    window.addEventListener(OPEN_TOUR_EVENT, open);
    return () => window.removeEventListener(OPEN_TOUR_EVENT, open);
  }, []);

  // Cerrar al cambiar de pantalla.
  useEffect(() => {
    setStep(null);
  }, [pathname]);

  // ESC cierra.
  useEffect(() => {
    if (step === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setStep(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [step]);

  if (!steps || step === null) return null;
  const current = steps[step];

  function next() {
    if (step === null) return;
    if (step < steps!.length - 1) setStep(step + 1);
    else setStep(null);
  }

  return (
    <>
      <div className="fixed inset-0 z-[1100] bg-background/50 backdrop-blur-[2px]" onClick={() => setStep(null)} />
      <div className="fixed bottom-6 right-6 z-[1101] w-[calc(100vw-3rem)] max-w-sm rounded-xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="font-mono text-base text-muted-foreground">
            {step + 1} / {steps.length}
          </span>
          <button
            type="button"
            onClick={() => setStep(null)}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cerrar guía"
          >
            <Icon icon={X} size={14} />
          </button>
        </div>
        <div className="px-5 pb-5 pt-3">
          <div className="flex items-center gap-1.5">
            <Icon icon={Sparkles} size={13} className="text-primary" />
            <h3 className="font-display text-base font-medium tracking-tight text-foreground">{current.title}</h3>
          </div>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">{current.body}</p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i <= step ? "w-5 bg-primary" : "w-3 bg-border",
                  )}
                />
              ))}
            </div>
            <Button type="button" size="sm" onClick={next}>
              {step < steps.length - 1 ? (
                <>
                  Siguiente <Icon icon={ChevronRight} size={13} />
                </>
              ) : (
                "Entendido"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
