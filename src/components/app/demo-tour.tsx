"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Sparkles, X } from "lucide-react";

import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Arrastra un Bill of Lading",
    body: "Donde la competencia (Visual Trans, CargoWise) te obliga a teclear 40 campos a mano, en Manann sueltas el PDF en la sección Documentos y la IA extrae naviera, puertos, partes y mercancía en segundos.",
  },
  {
    title: "Revisa la propuesta",
    body: "La IA no decide por ti: cada campo muestra su nivel de confianza y los dudosos se resaltan. La máquina propone, tú confirmas — el humano siempre al mando.",
  },
  {
    title: "Confirma con un clic",
    body: "Pulsa «Confirmar» y los datos pasan al expediente. ¿Algo no cuadra? Corrígelo campo a campo antes de incorporar. Cero re-tecleo.",
  },
  {
    title: "Cruza BL y factura",
    body: "Sube la factura comercial y Manann no solo la lee: cruza ambos documentos y señala lo que no cuadra (cantidades, pesos, incoterm). La competencia hace OCR; Manann razona entre documentos.",
  },
  {
    title: "El expediente queda operativo",
    body: "Tracking, partes, contenedores y cargos listos. Lo que tu equipo tarda ~20 minutos en teclear, Manann lo deja hecho en 30 segundos — sin manual y sin legacy.",
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
                <Button type="button" size="sm" onClick={next}>
                  {(step ?? 0) < STEPS.length - 1 ? (
                    <>Siguiente <Icon icon={ChevronRight} size={13} /></>
                  ) : (
                    "Entendido"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
