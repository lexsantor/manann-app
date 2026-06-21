"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload, ArrowRight, CheckCircle2, X } from "lucide-react";
import { completeOnboarding } from "@/lib/erp-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/use-focus-trap";

const STEPS = [
  {
    icon: Sparkles,
    title: "Bienvenido a Manann",
    body: "El ERP de nueva generación para transitarios. Olvida los 40 campos a mano — aquí la IA lee el Bill of Lading y rellena el expediente. Tú solo confirmas.",
    cta: "Siguiente",
  },
  {
    icon: Upload,
    title: "El flujo wow",
    body: "Ve a un expediente, arrastra el PDF del Bill of Lading al panel de Documentos. En segundos tendrás naviera, puertos, partes, contenedor y mercancía extraídos con su nivel de confianza. Un clic para confirmar.",
    cta: "Entendido",
  },
  {
    icon: CheckCircle2,
    title: "Todo listo",
    body: "Tienes acceso a expedientes, cotizaciones, facturación, tarifas y más. El equipo de Manann está trabajando para ti. Cualquier duda, escríbenos.",
    cta: "Empezar",
  },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, !dismissed, () => handleSkip());

  if (dismissed) return null;

  const current = STEPS[step];
  const StepIcon = current.icon;
  const isLast = step === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      startTransition(async () => {
        try {
          await completeOnboarding();
        } finally {
          setDismissed(true);
          router.refresh();
        }
      });
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleSkip() {
    startTransition(async () => {
      try {
        await completeOnboarding();
      } finally {
        setDismissed(true);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Introducción a Manann"
        tabIndex={-1}
        className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl outline-none"
      >
        {/* Cerrar */}
        <button
          onClick={handleSkip}
          disabled={pending}
          className="absolute right-4 top-4 flex size-7 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Omitir introducción"
        >
          <X className="size-4" />
        </button>

        <div className="px-5 pb-6 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
          {/* Icono */}
          <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <StepIcon className="size-6 text-primary" />
          </div>

          {/* Paso */}
          <p className="mb-2 font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground/65">
            Paso {step + 1} de {STEPS.length}
          </p>

          <h2 className="mb-3 font-display text-xl font-semibold tracking-tight text-foreground">
            {current.title}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {current.body}
          </p>

          {/* Indicadores */}
          <div className="mt-6 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-border",
                )}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              disabled={pending}
              className="text-base text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Omitir
            </button>
            <Button variant="secondary" onClick={handleNext} disabled={pending}>
              {current.cta}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
