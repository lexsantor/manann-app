# Ayuda contextual click-first (cimiento de facilidad de uso) — diseño

**Fecha:** 2026-06-17
**Estado:** aprobado (enfoque 1 — click-first)

## Contexto y objetivo

Segunda propuesta de valor de Manann, junto a la IA: **es fácil e intuitivo para todos
los públicos** (edad media >50, del novato al experto). Si el producto se explica solo,
los comerciales pierden menos tiempo en demos y la adopción sube. Tensión a resolver:
el tagline «el documento se rellena solo» puede llevar a delegar todo en la IA sin saber
usar el ERP; la facilidad de uso es la respuesta.

Esta es la **primera pieza** del cimiento auto-explicativo (las siguientes —empty-states
que enseñan, tours por módulo, centro de guías— reutilizarán esto). Pieza 1 = **ayuda
contextual click-first**.

**Decisión clave de audiencia:** ayuda por **clic/tap**, no hover. El hover no se descubre
y no funciona en táctil; para usuarios 50+ el clic en un «?» es el patrón legible.

**Fuera de alcance (otras piezas / después):** empty-states instructivos, tours por módulo,
centro de guías visuales, persistencia de «no volver a mostrar», barrido de la ayuda a
todas las pantallas (esta pieza aplica a 2 pantallas de prueba + registro de ~5).

## Contexto técnico existente

- Botón **Ayuda** en `app-topbar.tsx` ya abre un `HelpModal` global y **estático** (4 atajos
  iguales en toda la app: ⌘K, ⌘J, BL, +). Lo convertimos en contextual.
- **No hay** primitivo de tooltip ni popover; **no se añaden deps Radix** — el proyecto
  hand-rollea sus primitivos (Checkbox, Switch, Sheet, ConfirmButton). Seguimos esa pauta.
- Existen `demo-tour.tsx` y `onboarding-wizard.tsx` (intro modales) — no se tocan aquí.

## Componentes

### `src/components/ui/help-hint.tsx` (nuevo) — la pieza estrella

Botón «?» discreto (icono `HelpCircle` de lucide, `strokeWidth={1.5}`, tono
`text-muted-foreground`, **nunca ámbar**). Al **clic/tap** abre un popover anclado:

- Contenido por props: `title: string`, `body: string`, `href?: string` (+ `label?` del enlace,
  por defecto «Más en Ayuda»).
- Popover: tarjeta `rounded-md border border-border bg-card` con sombra, `max-w-xs`,
  texto del cuerpo `text-sm` (≥14px) legible; padding generoso.
- Cierra con **clic fuera** y **ESC**. Un solo popover abierto a la vez basta (estado local).
- Posicionamiento v1: anclado al trigger con colocación por defecto (debajo, alineado a la
  derecha) y `max-w-xs`; sin detección de colisión avanzada (aceptable v1). Se renderiza en
  un portal (`createPortal`) para evitar recortes por `overflow`.
- a11y: el trigger es `<button type="button">` con `aria-label` (p. ej. «Ayuda: {title}»),
  `aria-expanded`, foco visible (hereda la regla global focus-visible); Enter/Espacio abren,
  ESC cierra y devuelve el foco al trigger. Respeta `prefers-reduced-motion` (sin animación
  de entrada si está activo).
- Área de toque: el botón ocupa mínimo 24×24 px de hit-area aunque el icono sea ~14px.

### `src/components/ui/tooltip.tsx` (nuevo) — secundario

Tooltip hover/foco hand-rolled (sin dep). Muestra una etiqueta corta al pasar el ratón o
enfocar por teclado; oculta al salir/blur/ESC. Uso: **solo botones de icono** (no texto de
ayuda extenso). Token-puro. Es complemento, no el vehículo principal.

### `src/lib/help-content.ts` (nuevo) — registro

Datos estáticos tipados:

```ts
export type ScreenHelp = {
  title: string;
  queHace: string;
  accionesClave: { label: string; desc: string }[];
};
export const SCREEN_HELP: Record<string, ScreenHelp> = { ... };  // clave = ruta base
export const ATAJOS: { k: string; t: string; d: string }[] = [ ... ]; // los 4 actuales
export function helpForPath(pathname: string): ScreenHelp; // match por prefijo, fallback genérico
```

- Entradas iniciales para ~5 pantallas: `/dashboard`, `/expedientes`, `/expedientes/[id]`
  (detalle), `/contabilidad`, `/reportes`.
- `helpForPath` hace match por prefijo más largo (como el sidebar) y, si no encuentra,
  devuelve una entrada **genérica** («Estás en Manann… usa ⌘K para moverte») — nunca rompe.

### `src/components/app/app-topbar.tsx` (modificar) — Ayuda contextual

`HelpModal` pasa a:
- `const pathname = usePathname();` → `const screen = helpForPath(pathname);`
- Renderiza: **título y «qué hace» de la pantalla actual**, lista de **acciones clave**, y
  debajo la sección **«Atajos»** con `ATAJOS` (lo actual, conservado).
- Mantiene el patrón modal+portal actual (ESC, clic-fuera, botón cerrar).

## Aplicación de prueba (demostrar el patrón, no barrer todo)

- **Detalle de expediente** (`expedientes/[id]`): `HelpHint` en (a) el concepto «ámbar = IA»
  (junto a la propuesta), (b) la línea compra/venta de Finanzas, (c) GP/margen.
- **Contabilidad** (`/contabilidad`): `HelpHint` en (a) «qué es el diario contable», (b) «qué
  es un asiento».
- Más entradas de registro y más `HelpHint` se añaden pantalla a pantalla en piezas
  posteriores (no en esta).

## Transversal

- **Tokens semánticos** solo (capa app = gate `design-lint` estricto). Sin hex ni paleta cruda.
- **Ámbar = solo IA.** El chrome de `HelpHint`/`Tooltip` es `muted`/`primary`, nunca `accent`.
- **a11y:** foco visible, ESC, retorno de foco, `aria-*`, `prefers-reduced-motion`.
- **Voz:** español llano, presente, frases cortas, sin exclamaciones; términos del sector con
  naturalidad (BL, asiento, GP).
- **Sin persistencia** en v1 (no «no volver a mostrar», no flags de servidor). YAGNI.
- **px pares** en tamaños arbitrarios de fuente.

## Testing / verificación

- `tsc --noEmit` limpio; `npm run build` verde (gate incluido).
- QA visual (Playwright) a **375 / 768 / 1440**, tema **claro y oscuro**:
  - `HelpHint`: abre al clic, cierra con clic-fuera y ESC, legible, no recortado, táctil OK.
  - Teclado: Tab al «?», Enter abre, ESC cierra y devuelve foco.
  - Ayuda contextual: en `/contabilidad` y en un detalle de expediente muestra contenido
    de ESA pantalla + atajos; en una ruta sin entrada, fallback genérico.
  - Ningún «?» usa ámbar; simulaciones (si aparecen) etiquetadas.

## Criterios de éxito

- Un usuario nuevo entiende qué hace cada pantalla y cada control clave **sin acompañamiento**,
  pulsando «?» o el botón Ayuda — incluido el público 50+/táctil.
- Base reutilizable lista para que las piezas siguientes (empty-states, tours, guías) la usen.
- Sin regresiones de build ni de a11y; voz y honestidad del brand book intactas.
