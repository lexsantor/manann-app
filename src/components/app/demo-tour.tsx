"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Sparkles, X } from "lucide-react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Arrastra un Bill of Lading",
    body: "En la sección Documentos (más abajo), sube el PDF del BL. La IA extrae naviera, puertos, partes y mercancía en segundos, sin teclear nada.",
  },
  {
    title: "Revisa la propuesta",
    body: "Cada campo extraído muestra su nivel de confianza. Los campos con baja confianza aparecen resaltados para que los verifiques primero.",
  },
  {
    title: "Confirma con un clic",
    body: "Pulsa «Confirmar». Los datos pasan al expediente. Si necesitas corregir algo antes, puedes hacerlo campo a campo desde el panel.",
  },
  {
    title: "El expediente queda operativo",
    body: "Tracking, partes, contenedores y cargos listos. Lo que antes tomaba 20 minutos de data-entry, Manann lo hace en 30 segundos.",
  },
];

const STORAGE_KEY = "manann-tour-seen";

export function DemoTour() {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        const t = setTimeout(() => setStep(0), 900);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage no disponible (SSR safety)
    }
  }, []);

  function close() {
    setStep(null);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
  }

  function next() {
    if (step === null) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  }

  const current = step !== null ? STEPS[step] : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setStep(0)}
        className="print:hidden inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-base text-primary transition-colors hover:bg-primary/20"
      >
        <Icon icon={Sparkles} size={11} />
        Guía demo
      </button>

      {current && (
        <>
          <div
            className="fixed inset-0 z-[1100] bg-background/50 backdrop-blur-[2px]"
            onClick={close}
          />
          <div className="fixed bottom-6 right-6 z-[1101] w-[calc(100vw-3rem)] max-w-sm rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between px-5 pt-4">
              <span className="font-mono text-base text-muted-foreground">
                {(step ?? 0) + 1} / {STEPS.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Cerrar guía"
              >
                <Icon icon={X} size={14} />
              </button>
            </div>

            <div className="px-5 pb-5 pt-3">
              <h3 className="font-display text-base font-medium tracking-tight text-foreground">
                {current.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {current.body}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex gap-1">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i <= (step ?? 0) ? "w-5 bg-primary" : "w-3 bg-border",
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {(step ?? 0) < STEPS.length - 1 ? (
                    <>Siguiente <Icon icon={ChevronRight} size={13} /></>
                  ) : (
                    "Entendido"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
