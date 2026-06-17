# Tours reutilizables por módulo (pieza 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development o superpowers:executing-plans. Steps con checkbox `- [ ]`.

**Goal:** Una guía paso a paso reutilizable por pantalla, lanzada **bajo demanda** desde el botón Ayuda (nunca intrusiva), generalizando el patrón de `demo-tour`.

**Architecture:** Un único `GuidedTour` cliente montado en el layout de la app; lee la ruta con `usePathname`, obtiene sus pasos de un registro `lib/tours.ts`, y se abre al recibir un CustomEvent que dispara el botón «Ver guía de esta pantalla» del modal de Ayuda. El detalle de expediente conserva su `DemoTour` propio (no se toca).

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind v4 + tokens, lucide-react, CustomEvent del DOM.

## Global Constraints

- **Sin deps nuevas.** Sin persistencia. Solo tokens semánticos (gate app/kit estricto). Ámbar solo IA.
- **Bajo demanda:** el tour NUNCA se auto-muestra; solo al pulsar «Ver guía de esta pantalla».
- **a11y:** ESC cierra; foco operable; `prefers-reduced-motion` (sin animaciones nuevas más allá de las clases existentes de demo-tour, que ya son sutiles).
- **Voz:** español llano, presente, frases cortas, sin exclamaciones. px pares.
- **No hay unit tests** (UI): ciclo de test por tarea = `node_modules/.bin/tsc --noEmit` + `npm run build`. QA visual en la Tarea 4.
- **Push** solo en la Tarea 4 con el switch de credenciales `gh auth switch --user lexsantor && gh auth setup-git && printf "protocol=https\nhost=github.com\n" | git credential reject`.

---

## File Structure

- `src/lib/tours.ts` — **Crear.** `TourStep`, `TOURS` (dashboard, expedientes, contabilidad), `tourForPath()`.
- `src/components/app/guided-tour.tsx` — **Crear.** Componente global, escucha el evento, renderiza la tarjeta de pasos.
- `src/app/(app)/layout.tsx` — **Modificar.** Montar `<GuidedTour />`.
- `src/components/app/app-topbar.tsx` — **Modificar.** Botón «Ver guía de esta pantalla» en el `HelpModal` (si hay tour para la ruta) que dispara el evento.

---

### Task 1: Registro de tours (`tours.ts`)

**Files:**
- Create: `src/lib/tours.ts`

**Interfaces:**
- Produces: `type TourStep = { title: string; body: string }`; `const TOURS: Record<string, TourStep[]>`; `function tourForPath(pathname: string): TourStep[] | null`.

- [ ] **Step 1: Crear el fichero**

```ts
export type TourStep = { title: string; body: string };

export const TOURS: Record<string, TourStep[]> = {
  "/dashboard": [
    { title: "Tu panel del día", body: "De un vistazo: expedientes en curso, sus estados y las métricas operativas. Es tu punto de partida cada mañana." },
    { title: "Abre cualquier expediente", body: "Haz clic en una tarjeta para entrar al detalle. O pulsa ⌘K en cualquier momento para buscar y saltar a donde quieras." },
    { title: "Crea sin fricción", body: "El botón «Crear» abre expedientes, cotizaciones, facturas o contactos. Y con ⌘J le preguntas a la IA sobre tus datos." },
  ],
  "/expedientes": [
    { title: "Todos tus envíos", body: "El listado completo de expedientes. Filtra por estado con las pestañas de arriba." },
    { title: "Tres vistas", body: "Cambia entre tarjetas para ojear, tabla para comparar venta y margen, y kanban por estado, con los iconos de vista." },
    { title: "Empieza un expediente", body: "Créalo vacío y arrastra el BL —la IA lo rellena— o impórtalo desde un CSV. Tú confirmas." },
  ],
  "/contabilidad": [
    { title: "Contabilidad de verdad", body: "Plan contable PGC, diario de asientos y tesorería. Las facturas que emites generan su asiento automáticamente." },
    { title: "El diario", body: "Cada movimiento es un asiento con debe y haber que cuadran. Crea asientos manuales con «Crear asiento»." },
    { title: "Cierres e impuestos", body: "Desde las tarjetas de arriba: sumas y saldos, modelo 303 de IVA y conciliación de extracto contra diario." },
  ],
};

export function tourForPath(pathname: string): TourStep[] | null {
  // El detalle de expediente tiene su propia guía (DemoTour).
  if (/^\/expedientes\/[^/]+/.test(pathname)) return null;
  let best: string | null = null;
  for (const key of Object.keys(TOURS)) {
    if (pathname === key || pathname.startsWith(`${key}/`)) {
      if (!best || key.length > best.length) best = key;
    }
  }
  return best ? TOURS[best] : null;
}
```

- [ ] **Step 2: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/tours.ts
git commit -m "feat(help): registro de tours por pantalla (tours.ts)"
```

---

### Task 2: Componente `GuidedTour`

**Files:**
- Create: `src/components/app/guided-tour.tsx`

**Interfaces:**
- Consumes: `tourForPath` de `@/lib/tours`.
- Produces: `function GuidedTour()`; `const OPEN_TOUR_EVENT = "manann:open-tour"`.

- [ ] **Step 1: Crear el componente**

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Sparkles, X } from "lucide-react";
import { Icon } from "@/components/icon";
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
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {step < steps.length - 1 ? (
                <>
                  Siguiente <Icon icon={ChevronRight} size={13} />
                </>
              ) : (
                "Entendido"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `node_modules/.bin/tsc --noEmit && npm run build`
Expected: ambos verdes (componente token-puro).

- [ ] **Step 3: Commit**

```bash
git add src/components/app/guided-tour.tsx
git commit -m "feat(help): GuidedTour reutilizable por pantalla (bajo demanda)"
```

---

### Task 3: Montar + lanzar desde Ayuda

**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Modify: `src/components/app/app-topbar.tsx`

**Interfaces:**
- Consumes: `GuidedTour` (Task 2), `tourForPath` (Task 1), `OPEN_TOUR_EVENT`.

- [ ] **Step 1: Montar `GuidedTour` en el layout**

En `src/app/(app)/layout.tsx`, añadir el import junto a los demás (tras `import { CopilotoPanel } from "@/components/app/copiloto-panel";`):

```tsx
import { GuidedTour } from "@/components/app/guided-tour";
```

Y montarlo tras `<CommandPalette />` (línea 38). El bloque pasa a:

```tsx
      <CommandPalette />
      <CopilotoPanel />
      <GuidedTour />
      {ctx.org && !ctx.org.onboarded && <OnboardingWizard />}
```

- [ ] **Step 2: Importar el registro en la topbar**

En `src/components/app/app-topbar.tsx`, junto al import existente `import { helpForPath, ATAJOS } from "@/lib/help-content";`, añadir:

```tsx
import { tourForPath } from "@/lib/tours";
```

- [ ] **Step 3: Añadir el botón «Ver guía» en `HelpModal`**

En `HelpModal`, justo después de `const screen = helpForPath(pathname);` añadir:

```tsx
  const hasTour = tourForPath(pathname) !== null;
```

Después, dentro del JSX, localizar el inicio de la sección de Atajos:

```tsx
        <p className="mt-6 mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Atajos</p>
```

e insertar JUSTO ANTES de esa línea el botón condicional:

```tsx
        {hasTour && (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("manann:open-tour"));
              onClose();
            }}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Ver guía de esta pantalla
          </button>
        )}
```

(El icono `Sparkles` ya está importado en `app-topbar.tsx`; si no lo estuviera, añádelo al import de `lucide-react`. Verifícalo y, si falta, agrégalo.)

- [ ] **Step 4: Typecheck + build**

Run: `node_modules/.bin/tsc --noEmit && npm run build`
Expected: ambos verdes.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/layout.tsx" src/components/app/app-topbar.tsx
git commit -m "feat(help): montar GuidedTour y lanzarlo desde el boton Ayuda"
```

---

### Task 4: QA visual + push

**Files:** ninguno (verificación; corregir y re-commitear si hace falta).

- [ ] **Step 1: Build final**

Run: `node_modules/.bin/tsc --noEmit && npm run build`
Expected: ambos verdes.

- [ ] **Step 2: QA con Playwright (tras deploy)**

A 1440 y 375, autenticado:
- En `/contabilidad`: abrir botón **Ayuda** → aparece «Ver guía de esta pantalla» → al pulsarlo, se abre la tarjeta de pasos abajo a la derecha; «Siguiente» avanza (3 pasos), indicador `1/3`; «Entendido» cierra; **ESC** cierra; clic en backdrop cierra.
- En `/dashboard` y `/expedientes`: la guía existe y se lanza igual.
- En **detalle de expediente** (`/expedientes/<id>`): el botón Ayuda **NO** muestra «Ver guía» (tiene su `DemoTour` propio), pero su «Guía demo» sigue funcionando.
- El tour NO se auto-muestra al navegar (solo al pulsar el botón).

- [ ] **Step 3: Auditoría tokens/voz**

Sin ámbar nuevo (el chrome usa `primary`); legible en ambos temas; sin overflow; copys en voz Manann.

- [ ] **Step 4: Corregir (si hace falta) y push**

```bash
git add -A && git commit -m "fix(help): ajustes de QA del GuidedTour"
gh auth switch --user lexsantor && gh auth setup-git && printf "protocol=https\nhost=github.com\n" | git credential reject
git push origin main
```

---

## Self-Review

**1. Spec coverage:** generalizar demo-tour → `GuidedTour` (Task 2) ✓; registro por pantalla (Task 1) ✓; bajo demanda desde Ayuda (Task 3) ✓; detalle de expediente conserva su DemoTour (`tourForPath` devuelve null para `/expedientes/<id>`) ✓; pantallas iniciales dashboard/expedientes/contabilidad ✓; tokens/voz/a11y/sin deps (Global Constraints) ✓; testing tsc+build+visual (Task 4) ✓.

**2. Placeholder scan:** sin TBD/TODO; todo el código completo y literal. ✓

**3. Type consistency:** `tourForPath` (Task 1) devuelve `TourStep[] | null`, consumido en `GuidedTour` (Task 2) y en la topbar (`hasTour`, Task 3) con esa forma. `OPEN_TOUR_EVENT = "manann:open-tour"` coincide con el `new CustomEvent("manann:open-tour")` del botón Ayuda. El guard `if (step === null) return;` en `next()` evita el null en `step`. ✓

**Nota:** la comunicación topbar→tour es por `CustomEvent` del DOM (sin store global); `GuidedTour` montado una vez en el layout escucha en `window`.
