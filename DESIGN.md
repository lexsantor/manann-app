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
| 3 | **Tablas** | TODA tabla se renderiza con `<DataTable>` del kit. Trae zebra canónico (header tono A + filas alternas B/C), cabeceras mono-mayúsculas, hover, alineación, y **celda de columna-título en `text-foreground`** (resto `text-muted-foreground`). Prohibido `<table>` hand-rolled o grids-tabla. Excepciones documentadas en §5. | DataTable + lint |
| 4 | **Controles de formulario** | `Select`, `Checkbox`, `Input` del kit/shadcn (tokenizados dark/light). **Prohibido** `<select>` nativo, `<input type="checkbox">` nativo. | lint |
| 5 | **Acciones destructivas** | Borrar/anular/vaciar SIEMPRE vía `<ConfirmButton>` (AlertDialog). Nunca `onClick` destructivo directo. | revisión |
| 6 | **Color = token semántico** | Solo tokens (`bg-primary`, `text-success`, `text-warning`…). **Prohibida** la paleta cruda de Tailwind (`bg-blue-500`, `text-emerald-400`, `*-NNN`) y los hex fuera de `globals.css`. | lint (kit = estricto) |
| 7 | **Tamaños de fuente** | Solo px **pares** (8, 10, 12, 14…). Nunca 9/11/13/15px. | lint |
| 8 | **Iconos** | Lucide, `strokeWidth={1.5}`, `shrink-0`, tamaños tokenizados (h-4/h-5). | revisión |
| 9 | **Jerarquía de botones (SOLO dos)** | Usar SIEMPRE `<Button variant>` del kit. Solo existen dos CTAs visibles: `primary` (sólido sea-green, **UNA por vista**, acción principal) y `secondary` = `outline` (stroke + texto en primary, acción de apoyo — mismo estilo, `secondary` es el nombre canónico). Aparte: `destructive` (outline rojo, acciones peligrosas) y `ghost` (texto sin borde, solo para descartar/cancelar, no es un CTA). Prohibido el botón sólido slate y prohibido inventar estilos a mano. | Button + revisión |
| 10 | **Touch targets (Apple HIG)** | CTAs e inputs ≥**44px** de alto en móvil. Lo dan las alturas responsive de `Button` (`md`/`lg`) e `Input`. Buscadores y CTA primarios a **full-width** en móvil. | Button/Input + revisión |

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
- `Card` (+ `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`) — superficie canónica (`rounded-xl` + `border-border` + `bg-card`). La **base no fuerza padding ni sombra** (se quedan en `className`), así adoptarla preserva el render. Para uso nuevo, prefiere los subcomponentes.
- `.label-mono` (CSS, no componente) — etiqueta mono-mayúscula (`font-mono` 10px `tracking-wider` uppercase). Para captions y cabeceras mono; **color y peso se quedan en el call-site**. Distinta de `.eyebrow` (que es el pill de sección).
- Charts: reutiliza `report-charts.tsx` / `dashboard-charts.tsx` (themed). No dupliques recharts.

### 3.1 Registro de componentes (curado a lo que el ERP usa)

Política: si existe primitivo, **úsalo**; el equivalente **nativo está prohibido**.
Si necesitas uno marcado ⊘, **créalo primero en `ui/` y documéntalo aquí**, luego úsalo. No instalamos los ~50 de shadcn por YAGNI: solo lo que el producto usa.

| Componente | Estado | Path / import | Nativo prohibido | Notas |
|---|---|---|---|---|
| Button | ✓ | `ui/button` | — | variantes shadcn |
| Input | ✓ | `ui/input` | `<input>` suelto | text/email/date/number/search van aquí |
| Textarea | ✓ | `ui/textarea` | `<textarea>` | — |
| Select | ✓ | `ui/select` (Radix) | `<select>` | también pills de estado **editables** |
| Checkbox | ✓ | `ui/checkbox` | `<input type=checkbox>` | indeterminado incluido |
| Switch | ✓ | `ui/switch` | toggles a mano | activar/desactivar |
| Label | ✓ | `ui/label` | `<label>` suelto | en formularios |
| DropdownMenu | ✓ | `ui/dropdown-menu` (Radix) | menús a mano | topbar, +Crear, acciones de fila |
| DataTable (+CellStacked, MiniBar) | ✓ | `ui/data-table` | `<table>` / grid-tabla | zebra canónico |
| PageHeader | ✓ | `ui/page-header` | cabeceras a mano | toda página |
| KpiRow / KpiCard | ✓ | `ui/kpi-card` | tiles a mano | (hero animado del dashboard es aparte) |
| Badges (Status/Mode/Grade) | ✓ | `ui/badges` | chips de color a mano | StatusBadge centraliza color |
| ConfirmButton (AlertDialog) | ✓ | `ui/confirm-button` | onClick destructivo directo | toda acción destructiva |
| Card (+ Header/Content/Footer) | ✓ | `ui/card` | `<div>` superficie a mano | base `rounded-xl`+`border`+`bg-card`; no fuerza padding/sombra |
| Sheet (slide-in) | ✓ | `ui/sheet` | slide-in reimplementado | formularios laterales |
| Charts | ✓ | `app/report-charts`, `app/dashboard-charts` | recharts suelto | themed |
| Tooltip | ⊘ | añadir al usarse | — | hoy `title=""`; crear si se generaliza |
| Dialog (modal central) | ⊘ | añadir al usarse | modal a mano | ConfirmButton/Sheet cubren casi todo |
| Tabs | ⊘ | añadir al usarse | tabs a mano | hoy sub-nav por tarjetas/URL |
| Toast/Sonner | ⊘ | añadir al usarse | — | feedback de error en updates optimistas |
| Skeleton | ⊘ | añadir al usarse | — | estados de carga (Suspense) |
| RadioGroup, Accordion, Popover, Command… | ⊘ | añadir al usarse | equivalente nativo | solo si el producto lo pide |

## 4. Radios y forma (CLAUDE.md)

`rounded-md` (10px) en todo control in-app. `rounded-full` SOLO en hero CTA,
pills de estado (StatusBadge) y toggle de tema. Badges de modo/tipo = `rounded-md`.

## 5. Cómo se mantiene (gobernanza)

El gate vive en `scripts/design-lint.mjs` y corre en `build` (`npm run build` =
`node scripts/design-lint.mjs && next build`), por lo que **reintroducir deriva
en la capa de app rompe el build**. La deuda de app está **congelada en 0**.

### Checks automatizados (qué invariante impone cada uno)

| Categoría | Invariante | Capa app | Capa kit |
|---|---|---|---|
| `paleta-cruda` / `hex` | 6 (color = token) | rompe build | **rompe build** (estricto) |
| `negro-blanco` (`bg-black`/`text-white` crudos) | 6 (color = token) | rompe build | **rompe build** (estricto) |
| `select/textarea/checkbox/radio-nativo` | 4 (controles) | rompe build | exento (el kit los envuelve) |
| `input-crudo` (`<input>` de formulario) | 4 (controles) | rompe build | exento (el kit los envuelve) |
| `label-crudo` (`<label>` de formulario) | 4 (controles) | rompe build | exento (`ui/label`) |
| `tabla-cruda` (`<table>` hand-rolled) | 3 (tablas) | rompe build | exento (`ui/data-table`) |

**`negro-blanco` — por qué y excepciones.** `RAW_COLOR` no caza `black`/`white` (no tienen escala `-NNN`), así que se colaban fuera de token y rompían el tema (un blanco fijo es invisible en light). Para scrims de modal usa `bg-background/60` (igual que `Sheet`); para texto sobre sólido, el `*-foreground` que corresponda. Exentos en el lint (`BW_EXEMPT` + `COLOR_EXEMPT`): overlays de texto **sobre foto** (login hero, `shipment-boarding-pass`, hover de tarjeta en `shipment-list-client`), el badge de marca **Power BI** en reportes, y los documentos imprimibles **AWB/CMR** (tinta sobre papel).

### z-index (escalera de tokens)

Tokens en `globals.css`: `--z-overlay: 100`, `--z-tour: 1100`, `--z-tour-top: 1101`, `--z-toast: 1200`. Convención para overlays nuevos (modales, sheets, popovers, tour, toasts): apóyate en esta escalera en lugar de inventar `z-[NN]` sueltos. Nota de deuda: varios overlays existentes aún usan `z-40/z-50/z-[90]` crudos; migración pendiente (no la fuerza el lint todavía por riesgo de reordenar el apilado).
| `px-impar` (`text-[Npx]` impar) | 7 (px pares) | rompe build | reportado |
| `ancho-anidado` (`max-w-*` en page) | 1 (ancho 1200) | rompe build | — |

> Marketing (`(marketing)`, `components/marketing/`) es **informativo**: registra
> deuda pero no rompe el build (la landing tiene color de marca propio).

### Excepciones documentadas (invariante 3 — tablas que NO migran a DataTable)

`DataTable` no cubre todos los casos; estas `<table>` están exentas en el lint
(`TABLE_EXEMPT`) **con motivo**, no por descuido:

- **Totales con `<tfoot>`** (DataTable no soporta fila de totales): `finanzas-panel`,
  `modelo303-panel`, `balance-sumas-saldos`, `carrier-scorecard`.
- **Tabla editable en acordeón** (móvil = cards): `air-manifests-panel`.
- **Previsualización de import CSV** (datos transitorios): `csv-import`, `rate-csv-import`.
- **Panel KPI server-render con celdas bespoke** ya canónicas (header+zebra+hover):
  `dashboard/page` (tabla "Top clientes por GP"). Elegible a migrar si se generaliza.
- **Vistas-documento imprimibles y email** (HTML "papel"/inline): `documentos/awb`,
  `documentos/cmr`, `lib/email`.

Cualquier `<table>` en **otro** sitio rompe el build → usa `<DataTable>`.

### Excepciones documentadas (invariante 4 — `<input>` que NO es campo de formulario)

El kit `Input` cubre los campos de formulario. Quedan exentos en el lint
(`INPUT_EXEMPT`) los `<input>` que **no** son campos de formulario estándar:
subida de ficheros (`type=file`), ocultos/combobox de autocompletar, buscadores
(`type=search`), editores **inline compactos** en tabla (currencies/document-series/
system-params/finanzas/crear-asiento·líneas/inline-field), composer de chat del
copiloto, y el flujo wow (`ai-extraction-panel`). Cualquier `<input>` de formulario
en **otro** sitio rompe el build → usa `<Input>`.

### Checklist de PR (antes de pedir review)

- [ ] `npm run build` verde (incluye `design-lint` + `tsc` + `next build`).
- [ ] Pantalla nueva = `PageHeader` + `DataTable` + tokens + `ConfirmButton` en destructivos.
- [ ] Tablas: columna-título en `text-foreground`; resto `text-muted-foreground` (lo da DataTable).
- [ ] Color solo por token semántico (ámbar = SOLO IA/estado; primary = SOLO marca).
- [ ] Controles vía primitivos del kit (sin nativos); destructivos con confirmación.
- [ ] Radios: `rounded-md` en controles; `rounded-full` solo en hero CTA / status pills / toggle de tema.
- [ ] Fuentes en px pares; iconos Lucide `strokeWidth={1.5}` + `shrink-0`.
- [ ] CTAs/inputs ≥44px en móvil; buscadores y CTA primarios full-width en móvil.
- [ ] Si necesitas un patrón nuevo: primero hazlo primitivo en `ui/` y regístralo en §3.1, luego úsalo.
- [ ] Lo simulado se etiqueta visualmente ("Simulación — integración real en producción").
