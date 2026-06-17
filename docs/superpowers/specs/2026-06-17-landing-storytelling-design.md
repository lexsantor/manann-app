# Landing storytelling (Tier I) — diseño

**Fecha:** 2026-06-17
**Estado:** aprobado (enfoque A — enriquecer en el sitio, aditivo)

## Contexto y objetivo

El ERP de Manann tiene construido mucho más de lo que la landing cuenta. La landing
«abre la presentación» a inversores, así que debe reflejar las capacidades reales ya
existentes. Este trabajo es **solo storytelling/copy sobre páginas existentes** — sin
ingeniería nueva, sin tocar la app privada, sin nueva lógica de datos.

Fuente autoritativa de voz y narrativa: `MANANN-storytelling.md` (3 pilares, estructura
de landing, reglas de voz) y el brand book. Mensaje central: «Tú mantienes el rumbo».

**Fuera de alcance (otra tanda):** sandbox demo público navegable sin login; rellenar
huecos de features (etiquetas courier, profundidad de conciliación avanzada).

## Gaps medidos (lo que falta contar)

- **Home `product-tabs.tsx`:** cubre Expedientes, Aduanas, Finanzas, Reportes. Faltan
  pestañas **Calidad** y **Red**.
- **`/el-expediente`:** cuenta IA/documento/tracking/resumen/ETA/auditoría/responsable/
  contactos/BL-vs-factura. Falta el bloque de **capa financiera** (GP, accrual, at-risk,
  margen fugado).
- **`/como-funciona`:** cuenta el flujo documento→IA→confirma + tracking/resumen/calendario/
  trazabilidad/equipo/contactos/aduanas/cotizaciones-facturación. Faltan **copiloto IA (⌘J),
  briefing/autopilot, portal del cliente, analítica avanzada, CRM/pipeline, calidad, red**.

## Diseño por superficie

### S1 — Home: `src/components/marketing/product-tabs.tsx` (+2 pestañas)

Añadir dos pestañas siguiendo el patrón visual y la estructura de datos de las 4 existentes
(cada pestaña renderiza un mini-mockup):

- **Calidad** — semáforo SLA (verde/ámbar/rojo) + 2-3 incidencias (tipo · estado) +
  línea «objetivos de servicio por cliente». Funcional real → sin badge de simulación.
- **Red** — corresponsales por país + comparador de tender + estado de e-BL. El e-BL
  lleva badge `Simulación — ESSDOCS/Bolero/WAVE en producción`.

El orden de pestañas pasa a: **Expedientes · Aduanas · Finanzas · Calidad · Red · Reportes**
(Expedientes primero, Reportes al final; las dos nuevas en el centro).

### S2 — `/el-expediente`: bloque de capa financiera (sección nueva, aditiva)

Tras las secciones actuales, una sección que cuente que el margen vive en el expediente.
Reutiliza el patrón de tarjetas/`expediente-card-demo` ya usado en la página.

- **Compra/venta por línea** — cada cargo con su lado buy/sell.
- **GP y margen en vivo** — se calcula solo en el expediente, sin hoja aparte.
- **Accrual vs. factura real** — provisión hasta que llega la factura; cuadre automático.
- **At-risk / margen fugado** — alerta visual cuando el margen se desvía del previsto.

Encabezado: «el margen no es una hoja aparte. vive en el expediente.»

### S3 — `/como-funciona`: tarjetas de módulo (aditivo en el grid existente)

Añadir tarjetas al grid de módulos ya existente («después de la confirmación»):

- **copiloto IA (⌘J)** — preguntas en lenguaje natural sobre tus expedientes.
- **briefing matutino / autopilot** — bandeja de excepciones y resumen del día.
- **portal del cliente** — enlace sin login para que el cliente siga su envío (share `/s/[token]`).
- **analítica avanzada** — margen por cliente/naviera/ruta, puntualidad. Badge `Simulación — Power BI Embedded en producción`.
- **CRM / pipeline** — oportunidades por etapa; cotización → expediente.
- **calidad** — incidencias, no conformidades, SLA con semáforo.
- **red de corresponsales** — directorio, tender, e-BL (e-BL con badge de simulación).

## Transversal

- **Componentes:** reutilizar `product-tabs`, `expediente-card-demo`, `count-up`, `motion`,
  `hero`/patrones de sección existentes. **Cero dependencias nuevas.**
- **Datos:** contenido estático. Sin fetch, sin server actions, sin nueva lógica. Sin
  manejo de errores nuevo.
- **Estilo:** clases semánticas de tokens (sin hex ni paleta cruda) → pasa el gate
  `design-lint`. Encabezados en minúscula, presente, frases cortas. Sin exclamaciones.
- **Honestidad (regla 6):** e-BL, Power BI, monedas/tipos de cambio, AEAT → badge
  «Simulación — … en producción». **Ámbar reservado exclusivamente a lo que hace la IA**;
  nunca decorativo.
- **Voz:** lo que suena a Manann («la IA propone. tú confirmas.», «el mando es tuyo»,
  «sin academias, sin manuales»); evitar lo vetado (transformación digital, solución
  integral, «nuestros clientes» inexistentes, exclamaciones).

## Testing / verificación

- `tsc --noEmit` limpio.
- `npm run build` verde (incluye gate `design-lint`).
- QA visual con Playwright a 375 / 768 / 1440, tema claro y oscuro, en home (tabs Calidad/
  Red), `/el-expediente` (bloque financiero) y `/como-funciona` (tarjetas nuevas).
- Verificar que ningún badge de IA (ámbar) se usa como decoración y que toda simulación
  está etiquetada.

## Criterios de éxito

- Un inversor que recorra la landing ve reflejadas las capacidades reales: IA documental,
  ciclo completo (incl. capa financiera), copiloto, portal, analítica, calidad y red.
- Sin regresiones visuales ni de build. Voz y honestidad del brand book intactas.
