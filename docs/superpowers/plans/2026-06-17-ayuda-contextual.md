# Ayuda contextual click-first Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer el ERP auto-explicativo con ayuda contextual click-first: un primitivo `HelpHint` («?» que abre un popover al clic), un `Tooltip` hover secundario, un registro de ayuda por pantalla, y el botón Ayuda de la topbar pasando a mostrar la ayuda de la pantalla actual.

**Architecture:** Componentes cliente hand-rolled (sin deps nuevas, como Checkbox/Switch/Sheet). `HelpHint` y `Tooltip` son primitivos del kit. `help-content.ts` es un registro estático tipado con resolución por ruta. La topbar lee la ruta y compone el modal de ayuda. Aplicación de prueba en 2 pantallas reales vía un prop `help` reutilizable en el componente `Panel` del detalle y un `HelpHint` en el diario.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind v4 + tokens shadcn, lucide-react, `createPortal`.

## Global Constraints

- **Sin dependencias nuevas.** Primitivos hand-rolled. Nada de Radix tooltip/popover.
- **Solo tokens semánticos** (`text-muted-foreground`, `bg-card`, `border-border`, `text-primary`, `bg-muted`, `bg-background`…). Sin hex ni paleta cruda → pasa el gate `design-lint` (kit y app son estrictos en color).
- **Ámbar = solo IA.** El chrome de `HelpHint`/`Tooltip` usa `muted`/`primary`, **nunca** `accent`/ámbar. El texto de ayuda puede *mencionar* el ámbar de la IA.
- **a11y:** trigger `<button type="button">` con `aria-label` y `aria-expanded`; foco visible (regla global ya existe); ESC cierra y devuelve foco al trigger; `prefers-reduced-motion` respetado (sin animaciones de entrada).
- **Táctil/50+:** ayuda por clic/tap (no hover) en `HelpHint`; hit-area ≥24px; cuerpo ≥14px (`text-sm`).
- **px pares** en tamaños arbitrarios de fuente (`text-[10px]` permitido; nunca impares).
- **Voz:** español llano, presente, frases cortas, sin exclamaciones.
- **Sin persistencia** (v1): nada de «no volver a mostrar» ni flags.
- **No hay unit tests** (UI estática/interactiva): el ciclo de test por tarea es `node_modules/.bin/tsc --noEmit` + `npm run build` (gate incluido). La verificación visual/interactiva se concentra en la Tarea 6.
- **Push:** solo en la Tarea 6, con `gh auth switch --user lexsantor && gh auth setup-git && printf "protocol=https\nhost=github.com\n" | git credential reject` antes de `git push origin main`.

---

## File Structure

- `src/lib/help-content.ts` — **Crear.** Registro `SCREEN_HELP`, `ATAJOS`, tipo `ScreenHelp`, `helpForPath()`. Datos puros.
- `src/components/ui/help-hint.tsx` — **Crear.** Primitivo «?» click-popover (portal, ESC, clic-fuera, a11y).
- `src/components/ui/tooltip.tsx` — **Crear.** Tooltip hover/foco secundario.
- `src/components/app/app-topbar.tsx` — **Modificar.** `HelpModal` pasa a contextual (recibe `pathname`, usa `helpForPath` + `ATAJOS`).
- `src/app/(app)/expedientes/[id]/page.tsx` — **Modificar.** `Panel` gana prop opcional `help`; el panel «Documentos» lo usa.
- `src/components/app/diario-contable.tsx` — **Modificar.** `HelpHint` junto al título «Diario contable».

---

### Task 1: Registro de ayuda (`help-content.ts`)

**Files:**
- Create: `src/lib/help-content.ts`

**Interfaces:**
- Produces: `type ScreenHelp`, `const ATAJOS`, `const SCREEN_HELP`, `function helpForPath(pathname: string): ScreenHelp`.

- [ ] **Step 1: Crear el fichero con el registro completo**

```ts
export type ScreenHelp = {
  title: string;
  queHace: string;
  accionesClave: { label: string; desc: string }[];
};

export const ATAJOS: { k: string; t: string; d: string }[] = [
  { k: "⌘K", t: "Buscar y ejecutar acciones", d: "Abre el buscador para saltar a cualquier expediente o módulo." },
  { k: "⌘J", t: "Manann IA", d: "Pregunta a la IA sobre tus datos: estados, costes, riesgos." },
  { k: "BL", t: "El expediente se rellena solo", d: "Arrastra un Bill of Lading al expediente y la IA extrae los campos." },
  { k: "+", t: "Crear rápido", d: "Usa «Crear» para abrir expedientes, cotizaciones, facturas o contactos." },
];

const GENERIC: ScreenHelp = {
  title: "Estás en Manann",
  queHace: "Cada pantalla tiene su propia ayuda. Usa ⌘K para moverte rápido y el botón Ayuda cuando lo necesites.",
  accionesClave: [],
};

export const SCREEN_HELP: Record<string, ScreenHelp> = {
  "/dashboard": {
    title: "Panel general",
    queHace: "Tu resumen del día: expedientes en curso, estados y métricas operativas.",
    accionesClave: [
      { label: "Abre un expediente", desc: "Haz clic en una tarjeta o usa ⌘K para buscarlo." },
      { label: "Crea uno nuevo", desc: "Botón «Crear» arriba a la derecha." },
    ],
  },
  "/expedientes": {
    title: "Expedientes",
    queHace: "El listado de todos tus envíos. Filtra por estado y cambia entre vista tarjetas, tabla o kanban.",
    accionesClave: [
      { label: "Nuevo expediente", desc: "Créalo vacío y arrastra el BL, o impórtalo desde CSV." },
      { label: "Cambia de vista", desc: "Tarjetas para ojear, tabla para comparar venta y margen." },
    ],
  },
  "/expedientes/": {
    title: "Detalle del expediente",
    queHace: "Toda la vida del envío en un sitio: documentos, partes, contenedor, finanzas y tracking.",
    accionesClave: [
      { label: "Arrastra el BL", desc: "En «Documentos». La IA propone los campos en ámbar; tú confirmas." },
      { label: "Revisa el margen", desc: "En «Finanzas» ves coste, venta y GP del expediente." },
    ],
  },
  "/contabilidad": {
    title: "Contabilidad",
    queHace: "Plan contable PGC, diario de asientos y tesorería. Las facturas generan asientos automáticamente.",
    accionesClave: [
      { label: "Crea un asiento", desc: "Botón «Crear asiento» en el diario; cuadra debe y haber." },
      { label: "Revisa el balance", desc: "Sumas y saldos, modelo 303 y conciliación en las tarjetas de arriba." },
    ],
  },
  "/reportes": {
    title: "Reportes",
    queHace: "Cuadros de mando de tu operativa: ingresos, margen, puntualidad y volumen por modo.",
    accionesClave: [
      { label: "Lee los KPIs", desc: "Ingresos, margen medio y tiempos arriba del todo." },
      { label: "Compara por dimensión", desc: "Cliente, naviera, ruta y modo en las tablas." },
    ],
  },
};

export function helpForPath(pathname: string): ScreenHelp {
  // Detalle de expediente: /expedientes/<id>
  if (/^\/expedientes\/[^/]+/.test(pathname)) return SCREEN_HELP["/expedientes/"];
  let best: string | null = null;
  for (const key of Object.keys(SCREEN_HELP)) {
    if (key === "/expedientes/") continue;
    if (pathname === key || pathname.startsWith(`${key}/`)) {
      if (!best || key.length > best.length) best = key;
    }
  }
  return best ? SCREEN_HELP[best] : GENERIC;
}
```

- [ ] **Step 2: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/lib/help-content.ts
git commit -m "feat(help): registro de ayuda por pantalla (help-content)"
```

---

### Task 2: Primitivo `HelpHint` (el «?» click-popover)

**Files:**
- Create: `src/components/ui/help-hint.tsx`

**Interfaces:**
- Produces: `function HelpHint(props: { title: string; body: string; href?: string; linkLabel?: string; className?: string })`.

- [ ] **Step 1: Crear el componente**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type HelpHintProps = {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

const POPOVER_WIDTH = 288; // ~18rem

export function HelpHint({ title, body, href, linkLabel = "Más en Ayuda", className }: HelpHintProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    function place() {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let left = r.right - POPOVER_WIDTH;
      if (left < 8) left = 8;
      const maxLeft = window.innerWidth - 8 - POPOVER_WIDTH;
      if (left > maxLeft) left = Math.max(8, maxLeft);
      setPos({ top: r.bottom + 6, left });
    }
    place();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Ayuda: ${title}`}
        aria-expanded={open}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground",
          className,
        )}
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      {open && pos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[90]" aria-hidden="true" onClick={() => setOpen(false)} />
            <div
              role="dialog"
              aria-label={title}
              style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
              className="fixed z-[91] rounded-md border border-border bg-card p-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  aria-label="Cerrar"
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              {href && (
                <Link
                  href={href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="mt-2.5 inline-block text-sm font-medium text-primary hover:underline"
                >
                  {linkLabel}
                </Link>
              )}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Build (gate)**

Run: `npm run build`
Expected: verde (kit estricto en color; el componente es token-puro).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/help-hint.tsx
git commit -m "feat(help): primitivo HelpHint click-popover (tactil/50+/a11y)"
```

---

### Task 3: Primitivo `Tooltip` (hover/foco, secundario)

**Files:**
- Create: `src/components/ui/tooltip.tsx`

**Interfaces:**
- Produces: `function Tooltip(props: { label: string; children: React.ReactNode; className?: string })`.

- [ ] **Step 1: Crear el componente**

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-foreground shadow-md",
            className,
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/tooltip.tsx
git commit -m "feat(help): primitivo Tooltip hover/foco secundario"
```

---

### Task 4: Ayuda de la topbar contextual

**Files:**
- Modify: `src/components/app/app-topbar.tsx`

**Interfaces:**
- Consumes: `helpForPath`, `ATAJOS` de `@/lib/help-content`; `pathname` (ya disponible en el componente, línea 54).
- Produces: `HelpModal` contextual.

- [ ] **Step 1: Importar el registro**

Tras la línea `import { cn } from "@/lib/utils";` (línea 29) añadir:

```tsx
import { helpForPath, ATAJOS } from "@/lib/help-content";
```

- [ ] **Step 2: Pasar `pathname` al modal**

Localizar `{help && <HelpModal onClose={() => setHelp(false)} />}` y reemplazar por:

```tsx
{help && <HelpModal onClose={() => setHelp(false)} pathname={pathname} />}
```

- [ ] **Step 3: Reescribir `HelpModal` como contextual**

Reemplazar TODA la función `function HelpModal({ onClose }: { onClose: () => void }) { ... }` (desde su firma hasta su `}` de cierre) por:

```tsx
function HelpModal({ onClose, pathname }: { onClose: () => void; pathname: string }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const screen = helpForPath(pathname);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{screen.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{screen.queHace}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-md p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        {screen.accionesClave.length > 0 && (
          <ul className="mt-5 space-y-3">
            {screen.accionesClave.map((a) => (
              <li key={a.label}>
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">Atajos</p>
        <ul className="space-y-3">
          {ATAJOS.map((tip) => (
            <li key={tip.t} className="flex items-start gap-3">
              <kbd className="mt-0.5 flex h-6 shrink-0 items-center justify-center rounded-md border border-border bg-background px-2 font-mono text-xs text-foreground">{tip.k}</kbd>
              <div>
                <p className="text-sm font-medium text-foreground">{tip.t}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{tip.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
```

(Esto elimina el array `const TIPS` antiguo, que vivía dentro de la función.)

- [ ] **Step 4: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores (no quedan referencias a `TIPS`).

- [ ] **Step 5: Build (gate)**

Run: `npm run build`
Expected: verde.

- [ ] **Step 6: Commit**

```bash
git add src/components/app/app-topbar.tsx
git commit -m "feat(help): boton Ayuda contextual por pantalla en la topbar"
```

---

### Task 5: Aplicación de prueba (Panel.help + Documentos + diario)

**Files:**
- Modify: `src/app/(app)/expedientes/[id]/page.tsx`
- Modify: `src/components/app/diario-contable.tsx`

**Interfaces:**
- Consumes: `HelpHint` de `@/components/ui/help-hint`.

- [ ] **Step 1: Importar `HelpHint` en el detalle de expediente**

En `src/app/(app)/expedientes/[id]/page.tsx`, junto a los imports de componentes (p. ej. tras `import { FinanzasPanel } from "@/components/app/finanzas-panel";`, línea 51) añadir:

```tsx
import { HelpHint } from "@/components/ui/help-hint";
```

- [ ] **Step 2: Añadir el prop `help` al componente `Panel`**

Localizar la firma de `Panel` (su destructure de props incluye `title`, `icon`, `children`). Añadir el campo opcional. La interfaz de props pasa a:

```tsx
  title: string;
  icon: LucideIcon;
  help?: { title: string; body: string };
  children: React.ReactNode;
```

Y en la firma de la función, destructurar `help`:

```tsx
function Panel({ title, icon, help, children }: {
```

(Mantén el resto de la firma/anotación tal cual; solo añade `help,` y el campo en el tipo.)

- [ ] **Step 3: Renderizar el `HelpHint` tras el título**

Reemplazar el bloque de cabecera del `Panel`:

```tsx
      <div className="mb-4 flex items-center gap-2">
        <Icon icon={icon} size={16} className="text-muted-foreground" />
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          {title}
        </h2>
      </div>
```

por:

```tsx
      <div className="mb-4 flex items-center gap-2">
        <Icon icon={icon} size={16} className="text-muted-foreground" />
        <h2 className="font-display text-base font-medium tracking-tight text-foreground">
          {title}
        </h2>
        {help && <HelpHint title={help.title} body={help.body} />}
      </div>
```

- [ ] **Step 4: Pasar `help` al panel «Documentos»**

Localizar `<Panel title="Documentos" icon={FileText}>` y reemplazar por:

```tsx
    <Panel
      title="Documentos"
      icon={FileText}
      help={{
        title: "El documento se rellena solo",
        body: "Arrastra el BL, AWB o CMR en PDF. La IA extrae los campos y los propone en ámbar con su nivel de confianza; tú revisas y confirmas. El ámbar siempre significa «lo hizo la IA».",
      }}
    >
```

- [ ] **Step 5: Importar y añadir `HelpHint` en el diario**

En `src/components/app/diario-contable.tsx`, añadir el import (junto a los demás, p. ej. tras `import { CrearAsientoButton } from "@/components/app/crear-asiento-button";`, línea 6):

```tsx
import { HelpHint } from "@/components/ui/help-hint";
```

Localizar el grupo izquierdo del header del diario:

```tsx
        <div className="flex items-center gap-2">
          <Icon icon={ScrollText} size={14} className="text-muted-foreground" />
          <span className="font-display text-sm font-medium text-foreground">Diario contable</span>
          <span className="font-mono text-xs text-muted-foreground">({entries.length})</span>
        </div>
```

y reemplazarlo por (añade el `HelpHint` al final del grupo):

```tsx
        <div className="flex items-center gap-2">
          <Icon icon={ScrollText} size={14} className="text-muted-foreground" />
          <span className="font-display text-sm font-medium text-foreground">Diario contable</span>
          <span className="font-mono text-xs text-muted-foreground">({entries.length})</span>
          <HelpHint
            title="Diario y asientos"
            body="Cada movimiento contable es un asiento con debe y haber que deben cuadrar. Las facturas generan su asiento automáticamente; aquí creas o revisas los manuales."
          />
        </div>
```

- [ ] **Step 6: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Build (gate)**

Run: `npm run build`
Expected: verde.

- [ ] **Step 8: Commit**

```bash
git add "src/app/(app)/expedientes/[id]/page.tsx" src/components/app/diario-contable.tsx
git commit -m "feat(help): HelpHint de prueba en Documentos (expediente) y diario contable"
```

---

### Task 6: QA visual + push

**Files:** ninguno (verificación; si algo falla, corregir el fichero implicado y re-commitear).

- [ ] **Step 1: Build final**

Run: `node_modules/.bin/tsc --noEmit && npm run build`
Expected: ambos verdes.

- [ ] **Step 2: QA visual con Playwright (tras deploy o `bun dev`)**

A **375 / 768 / 1440**, tema **claro y oscuro**, autenticado (botón «Entrar a la demo»):
- **Detalle de expediente** (`/expedientes/<id>`): junto al título «Documentos» aparece el «?». Al **clic** abre el popover «El documento se rellena solo»; cierra con **clic fuera** y con **ESC**; el popover no se recorta y es legible. Con teclado: Tab hasta el «?», Enter abre, ESC cierra y el foco vuelve al «?».
- **Contabilidad** (`/contabilidad`): «?» junto a «Diario contable» con el mismo comportamiento.
- **Botón Ayuda (topbar)**: en `/contabilidad` muestra título «Contabilidad» + acciones clave + sección «Atajos»; en un detalle de expediente muestra «Detalle del expediente»; en una ruta sin entrada (p. ej. `/calendar`) muestra el genérico «Estás en Manann». ESC y clic-fuera cierran.

- [ ] **Step 3: Auditoría de tokens/ámbar**

Verificar que el «?» y el popover usan gris/`muted` y `primary` (enlace), **nunca ámbar**; que el texto es legible en ambos temas; sin overflow.

- [ ] **Step 4: Corregir hallazgos (si los hay) y commitear**

```bash
git add -A && git commit -m "fix(help): ajustes de QA visual de la ayuda contextual"
```

- [ ] **Step 5: Push a main (deploy)**

```bash
gh auth switch --user lexsantor && gh auth setup-git && printf "protocol=https\nhost=github.com\n" | git credential reject
git push origin main
```
Expected: push OK; Vercel auto-despliega.

---

## Self-Review

**1. Spec coverage:**
- `ui/help-hint.tsx` (click-popover, táctil/50+, ESC, a11y, portal, no ámbar) → Task 2. ✓
- `ui/tooltip.tsx` (hover/foco secundario, sin deps) → Task 3. ✓
- `lib/help-content.ts` (registro + ATAJOS + `helpForPath` con fallback) → Task 1. ✓
- `HelpModal` contextual por ruta → Task 4. ✓
- Aplicación de prueba en detalle de expediente + Contabilidad → Task 5. ✓
- Registro de ~5 pantallas → Task 1 (dashboard, expedientes, detalle, contabilidad, reportes). ✓
- Solo tokens / sin deps / sin persistencia / px pares / voz → Global Constraints + código token-puro. ✓
- Testing tsc+build+visual (375/768/1440, ambos temas) → Tasks + Task 6. ✓
- Fuera de alcance (empty-states, tours, centro de guías, «no volver a mostrar», barrido total) → no hay tareas para eso. ✓

**2. Placeholder scan:** sin TBD/TODO; todo el código está completo y literal. ✓

**3. Type consistency:** `HelpHint` props (`title`, `body`, `href?`, `linkLabel?`, `className?`) coinciden entre Task 2 (definición) y Task 5 (uso: solo `title`/`body`). `ScreenHelp`/`helpForPath`/`ATAJOS` definidos en Task 1 y consumidos en Task 4 con la misma forma. `Panel` gana `help?: { title; body }` (Task 5) consistente con el uso en «Documentos». ✓

**Nota:** `HelpHint` se renderiza dentro de componentes server (página de detalle) como isla cliente — válido en App Router; los props pasados son strings serializables.
