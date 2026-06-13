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

- [x] **Integración ShipsGo real** — conectar la integración marcada como "Simulación" (PR-8); 3 créditos disponibles; el único dato vivo más allá de la extracción IA
- [x] **Resumen ejecutivo IA del expediente** — botón "Resumir" → llamada a Gemini Flash con contexto del expediente → párrafo en español en panel colapsable; segunda demostración de IA nativa tras el flujo wow
- [x] **Historial de cambios / auditoría** — tabla `field_changes(shipment_id, field, old_value, new_value, changed_by, changed_at)` + panel "Actividad" en el detalle; requisito regulatorio en sector transitario
- [x] **Calendario de ETAs** — vista `/calendar`; todos los expedientes activos con punto en su fecha ETA; con `react-day-picker` (ya en shadcn)
- [x] **Asignar expediente a agente** — campo `assigned_to` (FK a `members`) en `shipments` + selector en cabecera; la tabla `members` ya existe; precursor de la colaboración del Tier 4

---

## Tier 4 — Diferenciación estructural (L · 5–8 días)

- [x] **Comparativa IA: BL vs. factura** — cruce automático de campos entre documentos ya subidos; discrepancias resaltadas en ámbar (peso, cantidad, valor, descripción); argumento más concreto contra "IA periférica"
- [x] **Flujo DUA/aduanas simulado** — botón "Preparar declaración" → panel con campos del DUA prellenados desde el expediente (HS code, valor en aduana, país de origen, régimen); etiqueta "Simulación — integración AEAT en producción"; el tipo `dua` y estado `en_aduana` ya están en schema
- [x] **Plantillas de extracción por tipo de envío** — schemas Zod + prompts para AWB aéreo y CMR terrestre, además del BL marítimo existente; detección automática del tipo de documento
- [x] **Colaboración: comentarios y @menciones** — tabla `comments(shipment_id, author_id, body, created_at)` + panel de comentarios en detalle; con `@nombre` que notifica al mencionado; requiere asignación del Tier 3
- [x] **Onboarding wizard primera vez** — overlay de 3 pasos al primer login (`onboarded = false`); guía hasta el flujo wow; contradice directamente la necesidad de academias que tienen todos los competidores

---

## Tier A — Átomo financiero (S · ≤2 días)

- [x] **Buy/sell por línea de cargo + GP en cabecera** — columna `buy_amount` en `charge` + tabla unificada venta/compra/margen en `FinanzasPanel`; GP hero en KPI cards; barra de advertencia si hay fuga
- [x] **Flags `at_risk` y `pass_through` en cargos** — pill rojo "sin facturar" + pill gris "pass-through" visibles en la tabla; aviso cuantificado de pérdida de GP
- [x] **GP en lista de expedientes** — campo GP calculado visible en cada boarding pass; icono `AlertTriangle` si hay cargos `at_risk`
- [x] **Tipos de excepción con riesgo** — campos `risk_amount` y `exception_kind` en tabla `notification`; base para la bandeja de excepciones (Tier B)

---

## Tier B — Inteligencia financiera (M · 2–4 días)

- [x] **Bandeja de excepciones** — `/excepciones` con exception inbox ordenado por riesgo €; chips at_risk/accrual_gap/GP negativo; botón resolver; banner "margen total en riesgo"; link desde sidebar (ShieldAlert)
- [x] **KPI "Margen fugado"** — panel en dashboard: suma de cargos `at_risk` con copy "+33% de beneficio"; link directo a excepciones
- [x] **GP por cliente** — tabla en dashboard: agrupa por consignatario, calcula GP/margen/tier A-B-C; visible junto a métricas operacionales
- [x] **Conciliación accrual vs. factura** — columna `accrual_amount` en `charge` + panel inline en `FinanzasPanel`; muestra provisioned/real/variación en ámbar; acción `updateChargeAccrual`
- [x] **Pipeline extendido** — estado `facturado` en `shipmentStatus` enum + stage 6 en `StatusTimeline` (barra de progreso visual completa)

---

## Tier C — Copiloto IA (M · 2–4 días)

- [x] **Autopilot inbox** — `/autopilot`; acciones derivadas de datos reales (at_risk, accrual_gap, GP negativo, ETA vencida); severidad crítica/atención; aprobar individual o masivo; contador de € recuperados; link desde sidebar (Zap)
- [x] **Briefing matutino** — `/briefing`; saludo contextual, chips (€ en riesgo, tareas críticas, acciones IA, horas ahorradas), plan del día top-5, donut tiempo ahorrado por categoría, agenda estática; link desde sidebar (Sunrise)
- [x] **Copiloto conversacional** — panel flotante ⌘J; drawer lateral 420px; contexto cargado lazy en primer open; keyword matching (excepciones, clientes, expedientes, email borrador, resumen); bloque email con copy; sugerencias en estado vacío

---

## Tier 9 — Preparación demo + distribución (S-M)

- [x] **Vercel Analytics** — `@vercel/analytics/next` en root layout; mide visitas y flujo wow sin configuración adicional
- [x] **Página de precios pública** — `/precios` con 3 planes (Demo/Pro/Empresa), tabla comparativa de features, nota de honestidad; añadida a nav y footer
- [x] **Importación masiva CSV** — `/expedientes/importar`; drag-and-drop o file picker; parse en cliente; preview de primeras 5 filas; bulk insert via server action; max 500 filas; auto-referencia si vacía; omite duplicados
- [x] **Light mode landing** — tokens CSS `--shadow-card-hero`, `--shadow-float`, `--shadow-product` adaptativos (dark pesado, light suave); status colors en hero-dashboard con variante `dark:`
- [ ] **Demo precacheada + vídeo de respaldo** — precachear extracción BL de demo y grabar vídeo 2 min para presentaciones sin API live
