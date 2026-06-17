# Landing Storytelling (Tier I) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enriquecer la landing para que refleje el core value ya construido del ERP (calidad, red, capa financiera, copiloto, portal, analítica, CRM), respetando la voz del brand book.

**Architecture:** Trabajo puramente aditivo de contenido estático sobre 3 ficheros existentes. Se reutilizan los patrones y componentes ya presentes (`PanelFrame`/`SectionNote` en product-tabs; `FadeUp`/`StaggerGrid`/`StaggerItem` + tarjetas en las páginas marketing). Sin nueva lógica, sin fetch, sin dependencias nuevas.

**Tech Stack:** Next.js 15 (App Router, RSC), TypeScript, Tailwind v4 + tokens shadcn, lucide-react, componentes `marketing/motion`.

## Global Constraints

- **Solo contenido estático.** Ninguna server action, fetch, estado nuevo ni dependencia. Cero ficheros nuevos.
- **Capa marketing.** Los 3 ficheros viven en la zona *marketing* del `design-lint` (informativa) → no rompen el build aunque usen paleta cruda. En las **dos páginas** (`el-expediente`, `como-funciona`) se usan **clases semánticas de token** (`text-primary`, `text-accent`, `border-border`, `bg-card`, `bg-surface-2`). En **product-tabs** se sigue el estilo del propio fichero (paleta cruda `emerald/yellow/primary`) para consistencia con los 4 paneles vecinos.
- **Ámbar = solo IA.** El token `accent`/ámbar NO se usa para nada nuevo salvo «lo hizo la IA». Los badges de **Simulación** van en estilo **neutro** (`border-border` + `text-muted-foreground`), no ámbar.
- **Honestidad (regla 6).** Toda integración simulada lleva badge «Simulación — … en producción»: e-BL (ESSDOCS/Bolero/WAVE), analítica (Power BI Embedded).
- **Voz (brand book).** Encabezados en minúscula salvo inicial; presente habitual; frases cortas; **sin exclamaciones**; vetado: «transformación digital», «solución integral», «nuestros clientes». Tildes correctas («En gestión»).
- **Verificación de cada tarea (no hay unit tests — es contenido estático):** el ciclo de test es `node_modules/.bin/tsc --noEmit` limpio + `npm run build` verde (incluye gate `design-lint`). La verificación visual con Playwright se concentra en la Tarea 4.
- **Comandos git push:** antes de cualquier `git push`, ejecutar `gh auth switch --user lexsantor && gh auth setup-git && printf "protocol=https\nhost=github.com\n" | git credential reject` (gotcha de credenciales del repo). Solo se hace push en la Tarea 4.

---

## File Structure

- `src/components/marketing/product-tabs.tsx` — **Modify.** Añadir 2 paneles (`PanelCalidad`, `PanelRed`), 2 entradas a `TABS` y 2 al mapa `panel`. Responsabilidad: mockups por módulo del home.
- `src/app/(marketing)/el-expediente/page.tsx` — **Modify.** Añadir array `FINANZAS` + sección «La capa financiera». Responsabilidad: página de detalle del expediente.
- `src/app/(marketing)/como-funciona/page.tsx` — **Modify.** Añadir array `MODULOS` (tipado, con `sim?`) + sección «El producto completo». Responsabilidad: página de cómo funciona.

Cada tarea toca un fichero y termina en un deliverable verificable (build verde) e independientemente revisable.

---

### Task 1: Home — pestañas Calidad y Red en product-tabs

**Files:**
- Modify: `src/components/marketing/product-tabs.tsx`

**Interfaces:**
- Consumes: helpers existentes `PanelFrame`, `SectionNote`, `cn`.
- Produces: componentes `PanelCalidad`, `PanelRed`; entradas `calidad`/`red` en `TABS` y en el objeto `panel`.

- [ ] **Step 1: Añadir las dos entradas a `TABS`**

Reemplazar el array `TABS` (líneas 6-12) por:

```tsx
const TABS = [
  { id: "embarques", label: "Expedientes" },
  { id: "aduanas", label: "Aduanas" },
  { id: "crm", label: "CRM" },
  { id: "finanzas", label: "Finanzas" },
  { id: "calidad", label: "Calidad" },
  { id: "red", label: "Red" },
  { id: "reportes", label: "Reportes" },
];
```

- [ ] **Step 2: Añadir `PanelCalidad` y `PanelRed`**

Insertar estas dos funciones justo ANTES de `function PanelReportes()` (antes de la línea 250):

```tsx
function PanelCalidad() {
  const slas = [
    { name: "Respuesta a cotización", target: "objetivo < 4 h", val: "2,1 h", ok: true },
    { name: "Gestión de DUA", target: "objetivo < 24 h", val: "19 h", ok: true },
    { name: "Confirmación de booking", target: "objetivo < 8 h", val: "9,4 h", ok: false },
  ];
  const incidents = [
    { type: "Retraso", meta: "EXP-84207 · naviera", state: "En gestión", ok: false },
    { type: "Daño", meta: "EXP-84190 · terminal", state: "Cerrado", ok: true },
  ];
  return (
    <PanelFrame>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">SLA por objetivo · junio</h4>
          <div className="flex flex-col gap-2">
            {slas.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/20 px-3.5 py-2.5">
                <div>
                  <div className="text-[13.5px] font-medium">{s.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/40">{s.target}</div>
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold",
                  s.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                )}>
                  <span className="size-[3.5px] rounded-full bg-current" />
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">Incidencias abiertas</h4>
          <div className="flex flex-col gap-2">
            {incidents.map((it, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/20 px-3.5 py-2.5">
                <span className="text-[13.5px] font-medium">
                  {it.type}
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground/40">{it.meta}</span>
                </span>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-semibold",
                  it.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-primary/10 text-primary"
                )}>
                  <span className="size-[3.5px] rounded-full bg-current" />
                  {it.state}
                </span>
              </div>
            ))}
          </div>
          <SectionNote>
            SLAs por cliente y tipo de envío con semáforo de cumplimiento. Las incidencias y no conformidades quedan trazadas hasta su cierre.
          </SectionNote>
        </div>
      </div>
    </PanelFrame>
  );
}

function PanelRed() {
  const agents = [
    { name: "Meridian Freight", country: "Hamburgo, DE", meta: "Asia–Europa · FCL · LCL · Aéreo" },
    { name: "Atlas Logistics", country: "Barcelona, ES", meta: "Mediterráneo · OEA · ISO 9001" },
    { name: "Shanghai Connect", country: "Shanghái, CN", meta: "Asia–Norteamérica · FCL proyecto" },
  ];
  return (
    <PanelFrame>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">Corresponsales en la red</h4>
          <div className="flex flex-col gap-2">
            {agents.map((a) => (
              <div key={a.name} className="rounded-lg border border-border/30 bg-background/20 px-3.5 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-semibold">{a.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground/40">{a.country}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground/55">{a.meta}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-[16px] font-semibold mb-4">e-BL electrónico</h4>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-primary/60">Título electrónico</span>
            <div className="mt-2 font-display text-[22px] font-semibold text-primary">Endorsed</div>
            <div className="mt-1 font-mono text-[10px] text-muted-foreground/45">SHA-256 · 3 transferencias</div>
            <div className="mt-3 inline-flex rounded-full border border-border/40 bg-background/40 px-2.5 py-0.5 font-mono text-[9px] font-medium text-muted-foreground/55">
              Simulación — ESSDOCS/Bolero/WAVE en producción
            </div>
          </div>
          <SectionNote>
            Directorio global de corresponsales, tenders/RFQ a varios agentes y e-BL con huella SHA-256. Tu red, integrada en el expediente.
          </SectionNote>
        </div>
      </div>
    </PanelFrame>
  );
}
```

- [ ] **Step 3: Registrar los paneles en el mapa `panel`**

En `ProductTabs` (objeto `panel`, líneas 306-312), añadir las dos entradas para que quede:

```tsx
  const panel: Record<string, React.ReactNode> = {
    embarques: <PanelEmbarques />,
    aduanas: <PanelAduanas />,
    crm: <PanelCRM />,
    finanzas: <PanelFinanzas />,
    calidad: <PanelCalidad />,
    red: <PanelRed />,
    reportes: <PanelReportes />,
  };
```

- [ ] **Step 4: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores (exit 0).

- [ ] **Step 5: Build con gate**

Run: `npm run build`
Expected: build verde (design-lint informa marketing pero no falla).

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/product-tabs.tsx
git commit -m "feat(landing): pestanas Calidad y Red en product-tabs del home"
```

---

### Task 2: /el-expediente — bloque de capa financiera

**Files:**
- Modify: `src/app/(marketing)/el-expediente/page.tsx`

**Interfaces:**
- Consumes: `Icon`, `FadeUp`, `StaggerGrid`, `StaggerItem` (ya importados); iconos lucide nuevos.
- Produces: array `FINANZAS` + sección «La capa financiera» renderizada antes del CTA.

- [ ] **Step 1: Añadir iconos al import de lucide**

Reemplazar el bloque de import de `lucide-react` (líneas 3-14) por (añade `ArrowLeftRight`, `TrendingUp`, `FileClock`, `AlertTriangle`):

```tsx
import {
  FileText,
  Sparkles,
  UserCheck,
  Satellite,
  CalendarDays,
  ClipboardList,
  Users,
  Building2,
  GitCompare,
  FileCheck2,
  ArrowLeftRight,
  TrendingUp,
  FileClock,
  AlertTriangle,
} from "lucide-react";
```

- [ ] **Step 2: Añadir el array `FINANZAS`**

Insertar después del cierre del array `LIVE` (después de la línea 87, antes de `export default function`):

```tsx
const FINANZAS = [
  {
    icon: ArrowLeftRight,
    title: "Compra y venta por línea",
    body: "Cada cargo lleva su lado: lo que cuesta y lo que se factura. El expediente conoce el coste y el ingreso de cada concepto, no solo el total.",
  },
  {
    icon: TrendingUp,
    title: "GP y margen en vivo",
    body: "El beneficio bruto y el margen se calculan solos a medida que entran costes e ingresos. Lo ves antes de facturar, no en una hoja aparte al cierre.",
  },
  {
    icon: FileClock,
    title: "Accrual vs. factura real",
    body: "Hasta que llega la factura del proveedor, el coste vive como provisión. Cuando llega la real, Manann cuadra la diferencia y avisa si se desvía.",
  },
  {
    icon: AlertTriangle,
    title: "At-risk y margen fugado",
    body: "Si el margen baja del umbral o un coste se dispara, el expediente lo marca. El dinero que se escapa se ve antes de que sea tarde.",
  },
];
```

- [ ] **Step 3: Insertar la sección antes del CTA**

Insertar este bloque JSX entre el cierre de la sección «En ruta» (línea 203, el `</div>` que cierra `bg-surface-2`) y el comentario `{/* CTA — transparent (C) */}` (línea 205):

```tsx
      {/* La capa financiera — transparent (C) */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <p className="eyebrow">La capa financiera</p>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              El margen no es una hoja aparte. Vive en el expediente.
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              Del coste al cobro, sin salir del expediente. Cada línea sabe lo
              que cuesta y lo que factura, y el margen está siempre a la vista.
            </p>
          </FadeUp>
          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FINANZAS.map((f) => (
              <StaggerItem key={f.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-surface-2">
                  <span className="flex size-9 items-center justify-center rounded-md border border-border text-primary">
                    <Icon icon={f.icon} size={18} />
                  </span>
                  <h3 className="mt-4 font-display font-medium tracking-tight text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {f.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>
```

- [ ] **Step 4: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores.

- [ ] **Step 5: Build con gate**

Run: `npm run build`
Expected: build verde.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(marketing)/el-expediente/page.tsx"
git commit -m "feat(landing): bloque de capa financiera en /el-expediente"
```

---

### Task 3: /como-funciona — sección «El producto completo»

**Files:**
- Modify: `src/app/(marketing)/como-funciona/page.tsx`

**Interfaces:**
- Consumes: `Icon`, `FadeUp`, `StaggerGrid`, `StaggerItem`; iconos lucide nuevos + `LucideIcon` (tipo).
- Produces: array tipado `MODULOS` (con `sim?`) + sección «El producto completo» antes del CTA.

- [ ] **Step 1: Añadir iconos y el tipo `LucideIcon` al import**

Reemplazar el bloque import de `lucide-react` (líneas 3-21) por (añade `MessageSquare`, `Sunrise`, `Share2`, `BarChart3`, `ListChecks`, `Handshake` y el tipo `LucideIcon`; `TrendingUp` también):

```tsx
import {
  Upload,
  ScanText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Satellite,
  CalendarDays,
  ClipboardList,
  Users,
  Building2,
  Globe,
  Zap,
  BookOpen,
  GitCompare,
  FileCheck2,
  Receipt,
  MessageSquare,
  Sunrise,
  Share2,
  BarChart3,
  TrendingUp,
  ListChecks,
  Handshake,
  type LucideIcon,
} from "lucide-react";
```

- [ ] **Step 2: Añadir el array tipado `MODULOS`**

Insertar después del cierre del array `ONGOING` (después de la línea 137, antes de `export default function`):

```tsx
const MODULOS: { icon: LucideIcon; title: string; body: string; sim?: string }[] = [
  {
    icon: MessageSquare,
    title: "Copiloto IA (⌘J)",
    body: "Pregunta en lenguaje natural sobre tus expedientes —«¿qué llega esta semana a Valencia?»— y la IA responde con el contexto real de tu operativa. Propone; tú decides.",
  },
  {
    icon: Sunrise,
    title: "Briefing matutino y autopilot",
    body: "Cada mañana, un resumen de lo que importa: ETAs del día, expedientes en riesgo y una bandeja de excepciones que la IA prioriza para ti.",
  },
  {
    icon: Share2,
    title: "Portal del cliente",
    body: "Comparte un enlace sin login y el cliente sigue su envío en tiempo real: hitos, ETA y documentos. Menos correos de «¿dónde está mi carga?».",
  },
  {
    icon: BarChart3,
    title: "Analítica avanzada",
    body: "Margen por cliente, naviera y ruta; puntualidad y volumen por modo. Cuadros de mando en vivo para decidir con datos, no con intuición.",
    sim: "Simulación — Power BI Embedded en producción",
  },
  {
    icon: TrendingUp,
    title: "CRM y pipeline comercial",
    body: "Oportunidades por etapa, de prospecto a ganado. Cada cotización aceptada se convierte en expediente con un clic, sin recolocar un solo dato.",
  },
  {
    icon: ListChecks,
    title: "Calidad y procesos",
    body: "Incidencias, no conformidades y SLAs con semáforo de cumplimiento. Lo que no se mide no mejora; aquí se mide y se traza hasta el cierre.",
  },
  {
    icon: Handshake,
    title: "Red de corresponsales",
    body: "Directorio global de agentes, tenders/RFQ a varios partners y e-BL electrónico. El transitario moderno opera en red; Manann la integra.",
  },
];
```

- [ ] **Step 3: Insertar la sección antes del CTA**

Insertar este bloque entre el cierre de la sección «Después de la confirmación» (línea 262, el `</div>` que la cierra) y el comentario `{/* CTA — surface-2 (B) */}` (línea 264):

```tsx
      {/* El producto completo — surface-2 (B) */}
      <div className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6">
          <FadeUp>
            <p className="eyebrow">El producto completo</p>
            <h2 className="mt-4 max-w-2xl font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
              Más que expedientes: todo el ciclo, un solo producto.
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              La extracción es el corazón, no el límite. Del comercial a la
              contabilidad, de la calidad a la red de corresponsales: el mismo
              producto, sin saltar entre herramientas.
            </p>
          </FadeUp>
          <StaggerGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MODULOS.map((m) => (
              <StaggerItem key={m.title}>
                <div className="h-full rounded-lg border border-border bg-card p-6 transition-colors hover:bg-background">
                  <Icon icon={m.icon} size={20} className="text-primary" />
                  <h3 className="mt-4 font-display font-medium tracking-tight text-foreground">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {m.body}
                  </p>
                  {m.sim && (
                    <span className="mt-3 inline-flex rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                      {m.sim}
                    </span>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </div>
```

- [ ] **Step 4: Typecheck**

Run: `node_modules/.bin/tsc --noEmit`
Expected: sin errores (el tipo `LucideIcon` permite el campo opcional `sim`).

- [ ] **Step 5: Build con gate**

Run: `npm run build`
Expected: build verde.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(marketing)/como-funciona/page.tsx"
git commit -m "feat(landing): seccion 'El producto completo' en /como-funciona"
```

---

### Task 4: QA visual + auditoría de honestidad + push

**Files:** ninguno (verificación). Si la QA detecta un fallo, se corrige en el fichero correspondiente y se re-commitea.

**Interfaces:** consume el resultado de las Tareas 1-3.

- [ ] **Step 1: Build final limpio**

Run: `node_modules/.bin/tsc --noEmit && npm run build`
Expected: ambos verdes.

- [ ] **Step 2: QA visual con Playwright (prod tras deploy, o local `bun dev`)**

Recorrer y capturar a **375 / 768 / 1440**, en **tema claro y oscuro**:
- Home `/` → sección de producto: comprobar que aparecen las pestañas **Calidad** y **Red** (orden: Expedientes · Aduanas · CRM · Finanzas · Calidad · Red · Reportes), que cada panel renderiza sin overflow y que las 7 pestañas no se rompen al envolver.
- `/el-expediente` → sección «La capa financiera» con 4 tarjetas, antes del CTA.
- `/como-funciona` → sección «El producto completo» con 7 tarjetas, antes del CTA.

- [ ] **Step 3: Auditoría de honestidad y ámbar**

Verificar visualmente:
- Ningún elemento nuevo usa ámbar/`accent` salvo lo que sea «lo hizo la IA».
- El e-BL (PanelRed) y la analítica (MODULOS) muestran su badge **Simulación** en estilo neutro.
- Tildes correctas («En gestión»). Sin exclamaciones. Sin palabras vetadas.

- [ ] **Step 4: Corregir hallazgos (si los hay) y commitear**

Si algo falla, editar el fichero implicado, repetir `tsc` + `build`, y:

```bash
git add -A && git commit -m "fix(landing): ajustes de QA visual del storytelling"
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
- Home product-tabs +Calidad +Red → Task 1. ✓
- /el-expediente módulos financieros (compra-venta, GP/margen, accrual, at-risk) → Task 2 (array FINANZAS, 4 tarjetas). ✓
- /como-funciona copiloto/briefing-autopilot/portal/analítica/CRM/calidad/red → Task 3 (array MODULOS, 7 tarjetas). ✓
- Transversal: componentes reutilizados ✓; estático ✓; gate verde ✓ (Tasks 1-4 build); ámbar solo IA ✓ (constraint + Task 4 audit); simulaciones etiquetadas ✓ (e-BL Task 1, analítica Task 3); voz ✓; testing visual ✓ (Task 4).
- Fuera de alcance (sandbox, etiquetas, conciliación): no aparece ninguna tarea. ✓

**2. Placeholder scan:** sin TBD/TODO; todo el JSX está completo y literal. ✓

**3. Type consistency:** `TABS` ids (`calidad`,`red`) coinciden con las claves del mapa `panel` y con los componentes `PanelCalidad`/`PanelRed`. `MODULOS` tipado con `LucideIcon` + `sim?` → el render `m.sim &&` es válido. `FINANZAS` homogéneo (sin `sim`). Iconos usados están todos en los imports nuevos. ✓

**Nota de desviación vs. spec:** el spec decía «sin paleta cruda»; se matiza que en `product-tabs` (capa marketing, gate informativo) se mantiene la paleta cruda del propio fichero por consistencia con los 4 paneles vecinos. Las dos páginas sí usan tokens. Badges de Simulación en neutro (no ámbar) para honrar «ámbar = solo IA».
