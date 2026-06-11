# Manann ERP — Roadmap de features

> Generado 2026-06-11. Marca como `[x]` cuando esté en producción, `[~]` si está en progreso, `[ ]` si está pendiente.
> Orden dentro de cada tier: menor esfuerzo → mayor impacto.

---

## Ya construido (no en backlog)

- [x] Badge "Extraído por IA" con % confianza por campo — `ai-extraction-panel.tsx`
- [x] Indicador de documentos adjuntos (BL, factura, packing list) — detalle expediente
- [x] Multi-documento por expediente + extracción independiente — `document-upload.tsx`

---

## Tier 1 — Quick wins (S · ≤2 días)

- [x] **Timeline de estado visual** (5 etapas: Abierto → Documentación → Pre-alert → En tránsito → Entregado) — barra de progreso sobre el campo `status` existente; distinto del timeline de eventos de tracking que ya existe
- [x] **Tour overlay modo demo** — guía interactiva de 4-5 pasos que señala los momentos clave para presentaciones ante stakeholders; flag en `localStorage`
- [x] **Exportar expediente a PDF** — botón en cabecera del detalle; output con todos los campos, contenedores, partes y sello Manann
- [x] **Búsqueda full-text en expedientes** — completar los filtros existentes (solo status hoy) con `<input>` que filtra por referencia, naviera, POL, POD, partes
- [x] **Campo de notas internas** — columna `notes text` en `shipments` + textarea con autoguardado (debounce 800ms → Server Action)

---

## Tier 2 — UX diferenciadora (M · 2–4 días)

- [x] **Edición inline de campos extraídos** — click en un campo del panel de extracción lo convierte en `<input>` editable; guardar con Enter actualiza el expediente; materializa "la IA propone, el humano confirma"
- [x] **Dashboard analítica: gráficas** — completar los 4 KPIs existentes con bar chart (expedientes por semana/mes) y donut (distribución por estado); con `recharts` o shadcn charts
- [x] **⌘K command palette global** — abrir con ⌘K/Ctrl+K; buscar expedientes, navegar a secciones, cambiar tema; con `cmdk` (ya en shadcn)
- [x] **Notificaciones in-app** — icono campana en sidebar; tabla `notifications(user_id, message, read, created_at)` + dropdown con actividad reciente
- [x] **Vista Kanban de expedientes** — toggle Lista/Tablero en la lista; columnas por estado con tarjetas; complementa la vista de boarding passes

---

## Tier 3 — Credibilidad operativa (M-L · 3–5 días)

- [ ] **Integración ShipsGo real** — conectar la integración marcada como "Simulación" (PR-8); 3 créditos disponibles; el único dato vivo más allá de la extracción IA
- [ ] **Resumen ejecutivo IA del expediente** — botón "Resumir" → llamada a Gemini Flash con contexto del expediente → párrafo en español en panel colapsable; segunda demostración de IA nativa tras el flujo wow
- [ ] **Historial de cambios / auditoría** — tabla `field_changes(shipment_id, field, old_value, new_value, changed_by, changed_at)` + panel "Actividad" en el detalle; requisito regulatorio en sector transitario
- [ ] **Calendario de ETAs** — vista `/calendar`; todos los expedientes activos con punto en su fecha ETA; con `react-day-picker` (ya en shadcn)
- [ ] **Asignar expediente a agente** — campo `assigned_to` (FK a `members`) en `shipments` + selector en cabecera; la tabla `members` ya existe; precursor de la colaboración del Tier 4

---

## Tier 4 — Diferenciación estructural (L · 5–8 días)

- [ ] **Comparativa IA: BL vs. factura** — cruce automático de campos entre documentos ya subidos; discrepancias resaltadas en ámbar (peso, cantidad, valor, descripción); argumento más concreto contra "IA periférica"
- [ ] **Flujo DUA/aduanas simulado** — botón "Preparar declaración" → panel con campos del DUA prellenados desde el expediente (HS code, valor en aduana, país de origen, régimen); etiqueta "Simulación — integración AEAT en producción"; el tipo `dua` y estado `en_aduana` ya están en schema
- [ ] **Plantillas de extracción por tipo de envío** — schemas Zod + prompts para AWB aéreo y CMR terrestre, además del BL marítimo existente; detección automática del tipo de documento
- [ ] **Colaboración: comentarios y @menciones** — tabla `comments(shipment_id, author_id, body, created_at)` + panel de comentarios en detalle; con `@nombre` que notifica al mencionado; requiere asignación del Tier 3
- [ ] **Onboarding wizard primera vez** — overlay de 3 pasos al primer login (`onboarded = false`); guía hasta el flujo wow; contradice directamente la necesidad de academias que tienen todos los competidores
