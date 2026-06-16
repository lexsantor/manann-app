# DESIGN.md — Sistema de diseño de Manann ERP

> Fuente única de verdad del diseño. Si una pantalla no cumple esto, está mal —
> no al revés. Antes de tocar UI, lee esto. La regla de oro: **no inventes
> estilos locales; usa los primitivos del kit (`src/components/ui/`) y los tokens
> semánticos.** Validación automática: `npm run lint:design`.

Register: **product** (UI de aplicación / ERP). El diseño SIRVE al producto:
claro, denso, rápido, grado Linear/Notion. Tema dual (`data-theme` dark default
+ light), ambos de primera clase.

## 1. Invariantes no negociables

| # | Invariante | Regla | Lo impone |
|---|---|---|---|
| 1 | **Ancho** | El contenido vive en `max-w-[1200px]` que da el **layout** (`(app)/layout.tsx`). Las páginas **NO** añaden `mx-auto max-w-*` propio. Excepción única: vistas-documento imprimibles (factura/cotización/AWB/CMR). | layout + lint |
| 2 | **Padding de página** | Lo da el layout (`px-5 py-8 sm:px-8`). Las páginas **NO** re-añaden `p-5/p-6/p-8` al contenedor raíz. | layout + lint |
| 3 | **Tablas** | TODA tabla se renderiza con `<DataTable>` del kit. Trae zebra canónico (header tono A + filas alternas B/C), cabeceras mono-mayúsculas, hover, alineación. Prohibido `<table>` hand-rolled o grids-tabla. | DataTable + lint |
| 4 | **Controles de formulario** | `Select`, `Checkbox`, `Input` del kit/shadcn (tokenizados dark/light). **Prohibido** `<select>` nativo, `<input type="checkbox">` nativo. | lint |
| 5 | **Acciones destructivas** | Borrar/anular/vaciar SIEMPRE vía `<ConfirmButton>` (AlertDialog). Nunca `onClick` destructivo directo. | revisión |
| 6 | **Color = token semántico** | Solo tokens (`bg-primary`, `text-success`, `text-warning`…). **Prohibida** la paleta cruda de Tailwind (`bg-blue-500`, `text-emerald-400`, `*-NNN`) y los hex fuera de `globals.css`. | lint (kit = estricto) |
| 7 | **Tamaños de fuente** | Solo px **pares** (8, 10, 12, 14…). Nunca 9/11/13/15px. | revisión |
| 8 | **Iconos** | Lucide, `strokeWidth={1.5}`, `shrink-0`, tamaños tokenizados (h-4/h-5). | revisión |

## 2. Tokens (definidos en `globals.css`, mapeados en `@theme inline`)

Marca / superficie: `background, foreground, card, popover, muted, secondary,
border, input, ring, surface-2, surface-3, ink-subtle`.

Acción / estado:
- `primary` (sea-green) — **marca, CTA, foco**. Escaso.
- `accent` (lighthouse-amber) — **IA y estado** (campos extraídos/confianza). Nunca decorativo.
- Estado semántico: `success` (verde), `info` (azul, activo/en-tránsito),
  `warning` (ámbar de atención), `destructive` (rojo). Uso: `text-success bg-success/10`.
- Prioridad de expediente: `priority-{low,med,high,urgent}`. **Nunca** ámbar.

Regla de color (CLAUDE.md): primary=marca; ámbar=IA + estado; sin tercer acento
cromático decorativo. Los chips por *categoría* (p. ej. tipo de tarifa) no deben
inventar colores decorativos (azul/violeta/naranja) — usar neutro o el token de estado que corresponda.

## 3. Primitivos del kit (`src/components/ui/`) — úsalos, no los reinventes

- `PageHeader` — eyebrow + icono + título + subtítulo + acciones. Toda página lo usa.
- `KpiRow` + `KpiCard` — KPIs (label mono-mayúsculas, valor, tone/delta). **Único** KpiCard de datos. (`components/app/kpi-card.tsx` es el tile hero animado del dashboard; no mezclar.)
- `DataTable` + `CellStacked` + `MiniBar` — tablas (ver invariante 3).
- `StatusBadge` / `ModeBadge` / `GradeBadge` — badges. `StatusBadge` mapea estado→tono y centraliza el color (no pongas colores de estado a mano).
- `Checkbox` — checkbox tokenizado (indeterminado incluido).
- `ConfirmButton` — confirmación de destructivos (invariante 5).
- `Select` (shadcn) — desplegables; también para pills de estado **editables**.
- Charts: reutiliza `report-charts.tsx` / `dashboard-charts.tsx` (themed). No dupliques recharts.

## 4. Radios y forma (CLAUDE.md)

`rounded-md` (10px) en todo control in-app. `rounded-full` SOLO en hero CTA,
pills de estado (StatusBadge) y toggle de tema. Badges de modo/tipo = `rounded-md`.

## 5. Cómo se mantiene (gobernanza)

- `npm run lint:design` reporta deuda por categoría y **falla** si el kit
  (`src/components/ui/`) introduce paleta cruda. Objetivo: llevar la deuda de
  app a 0 y entonces activar el modo `--strict` en CI.
- Antes de merge: pasar `lint:design`, `tsc --noEmit`, `next build`.
- Al añadir una pantalla: PageHeader + DataTable + tokens + ConfirmButton. Si
  necesitas un patrón nuevo, primero hazlo primitivo en `ui/`, luego úsalo.
