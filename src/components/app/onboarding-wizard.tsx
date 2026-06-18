"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload, ArrowRight, CheckCircle2, X } from "lucide-react";
import { completeOnboarding } from "@/lib/erp-actions";
import { cn } from "@/lib/utils";

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
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        {/* Cerrar */}
        <button
          onClick={handleSkip}
          disabled={pending}
          className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
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
            <button
              onClick={handleNext}
              disabled={pending}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-5 py-2.5 text-base font-medium text-primary hover:bg-primary/15 transition-colors disabled:opacity-50"
            >
              {current.cta}
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
