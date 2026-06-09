# BUILD-PLAN.md — Manann

Plan de construcción en 9 PRs atómicos. Orden estricto. Cada PR cierra **funcionando y desplegado en Vercel** antes del siguiente. Estimación en solitario: 4-6 fines de semana (50-80 h). Lee `CLAUDE.md` primero.

> Regla de oro: construir lo real donde aporta (el flujo wow DEBE ser real), mockear de forma creíble lo que no es viable gratis (integraciones AEAT/Portic/navieras). Etiquetar siempre lo simulado.
>
> Orden estratégico: la **home** abre como punto de partida (PR-2), pero el **flujo wow del ERP** (PR-7) se valida pronto porque es lo técnicamente más incierto. El resto de páginas de landing se rematan al final (PR-9), cuando el riesgo ya está despejado. La landing es **escaparate de demo**: visualmente completa, pero legales en placeholder y contacto simple (sin RGPD de producción ni captación pública real).

---

## PR-1 · Scaffolding (2-3 h)
**Meta:** pipeline end-to-end vivo.
- `bunx create-next-app@latest . --typescript --tailwind --app --no-eslint`.
- Reemplazar `globals.css` por el provisto. Verificar que el tema dual (`data-theme`) y las fuentes cargan.
- Conectar Neon (cadena de conexión en `.env`, nunca commiteada). Instalar Drizzle + `drizzle-kit`. shadcn init (formato HSL).
- Primera migración vacía. Deploy inicial a Vercel.
- **Cierre:** un "hello" desplegado en Vercel leyendo de Neon.

## PR-2 · Landing — HOME (4-6 h) — el punto de partida
**Meta:** la cara pública que abre la demo. Estática, sin auth.
- Ruta pública `/` (grupo `(marketing)`). Hero con el tagline ("El sistema conoce la ruta. Tú no remas."), el pitch del momento wow, y CTA al login/demo.
- Estética grado Linear/Notion siguiendo `MANANN-DESIGN.md` (hero CTA = pill; resto in-app = 10px). Tema dual con toggle.
- Top-nav + footer reutilizables (servirán al resto de páginas de landing en PR-9).
- **Cierre:** `/` desplegada, deslumbra en 30s, da paso al login.

## PR-3 · Auth (2-4 h)
**Meta:** login funcional, 1-2 usuarios.
- Better Auth sobre Neon. Login por email/magic-link vía Resend.
- Middleware de sesión protegiendo `(app)`. CTA de la home enlaza aquí.
- Seed: 1-2 usuarios + 1 organization.
- **Cierre:** login → dashboard vacío protegido.

## PR-4 · Esquema de datos + seed (3-5 h)
**Meta:** dominio transitario modelado y poblado con datos creíbles.
- Implementar el esquema (abajo) en Drizzle. Migrar.
- Seed: 3-5 expedientes ficticios con puertos UN/LOCODE reales (ESBCN, NLRTM…), navieras reales (Maersk, MSC…), contenedores con formato ISO 6346 válido.
- **Cierre:** `drizzle-kit studio` muestra datos coherentes.

## PR-5 · UI base del ERP estilo Linear (4-6 h)
**Meta:** la cáscara navegable de la app.
- Layout `(app)` con nav lateral. `Icon` wrapper de Lucide (size 20, strokeWidth 1.5, linecaps round) en `components/`.
- Lista de expedientes (tabla rápida, teclado-friendly). Vista de detalle (`expediente-card`, rounded-xl).
- Dashboard con 3-4 KPIs simples (en tránsito, retrasados, entregados este mes).
- **Cierre:** navegar lista → detalle → dashboard, en ambos temas.

## PR-6 · Subida de documentos (3-4 h)
**Meta:** PDF en el sistema.
- Drag-and-drop a Vercel Blob. Registro en tabla `document` (estado `uploaded`).
- **Cierre:** subir un PDF, verlo listado con su `blob_url`.

## PR-7 · EL FLUJO WOW (6-10 h) ⭐ — la pieza que convence
**Meta:** BL en PDF → expediente autorrellenado. Esto es la demo.
- Endpoint (Server Action o route) que toma el PDF de Blob y llama a Gemini Flash vía Vercel AI SDK con `generateObject` + esquema Zod del BL (campos abajo).
- Guardar `extracted_json` + `confidence` por campo en `document`. Estado → `extracted`.
- Prellenar el formulario de expediente. Campos extraídos = `field-ai` (borde ámbar + `ai-badge` con confianza, p.ej. `IA · 0.97`).
- **Human-in-the-loop:** campos con confianza <0.70 resaltados, editables, foco automático. El usuario confirma → estado `validated`, se crea el `shipment`.
- Animación `.ai-reveal` (cascada 60ms) al poblar.
- **Cierre:** arrastrar un BL real → ver el expediente rellenarse → confirmar → expediente creado.

### Prompt de extracción (guía)
System: *"Eres experto en documentación de comercio internacional. Extrae los campos del Bill of Lading adjunto. Si un campo no aparece o es ilegible, devuelve null y baja la confianza. No inventes valores."* — `generateObject` con esquema Zod, reintento ante `NoObjectGeneratedError`. Confianza por campo en el propio esquema.

### Campos del BL a extraer (esquema Zod)
`shipper`, `consignee`, `notify_party`, `carrier`, `vessel_name`, `voyage`, `port_of_loading`, `port_of_discharge`, `place_of_receipt`, `place_of_delivery`, `bl_number`, `booking_number`, `container_numbers[]`, `seal_numbers[]`, `marks_and_numbers`, `description_of_goods`, `hs_code`, `gross_weight`, `measurement_cbm`, `number_of_packages`, `freight_terms` (prepaid/collect), `date_of_issue`. Cada campo con `.describe()` y un `confidence` (0-1) paralelo.

**Plan B si Gemini falla** (<90% campos correctos en BLs de prueba): probar Claude Sonnet (mejor en docs sucios) o Mistral OCR 3 (`mistral-ocr-2512`, ~$1-2/1.000 págs) en dos pasos.

## PR-8 · Tracking visual (4-6 h)
**Meta:** seguimiento creíble.
- Timeline de `tracking_event` + mapa (Leaflet o Mapbox free) con posición.
- 2-3 envíos con tracking REAL vía ShipsGo (gastar créditos con cuidado). El resto, `tracking_event` mockeados con timestamps coherentes (source = `mock`).
- **Cierre:** abrir un expediente → ver su timeline y posición.

## PR-9 · Resto de landing + pulido de demo (6-10 h)
**Meta:** landing completa (5 páginas) y todo listo para la sala.
- Páginas de landing restantes, reutilizando nav/footer del PR-2:
  - **Features** — el momento wow explicado + diferenciadores (UX, IA nativa, anti-azul).
  - **Nosotros** — la historia/mito de Manann (de `MANANN-storytelling.md`).
  - **Contacto** — formulario simple que envía email vía Resend (sin CRM, sin RGPD de producción).
  - **Legales** — aviso legal / privacidad / cookies en PLACEHOLDER (etiquetado como tal; endurecer solo si el proyecto pasa a público real).
- Pulido del ERP: estados vacíos con microcopy, animaciones de entrada (page-load stagger), datos de muestra finales, modo "reset demo", etiquetas "DEMO / datos simulados".
- Precachear extracción de los PDFs de demo + grabar vídeo de respaldo (no depender de la API en vivo ante stakeholders).
- **Cierre:** recorrido completo home → features → login → ERP wow → tracking, en ambos temas, con plan B ante fallo de IA.

---

## Esquema de datos (Drizzle / Postgres)

- **organization**: id, name, created_at.
- **user** (Better Auth): id, email, name, org_id.
- **shipment** (expediente): id, org_id, reference ("EXP-2026-0001"), mode (ocean/air/road), direction (import/export), status (quote/booked/in_transit/customs/delivered/closed), priority (low/med/high/urgent), incoterm, shipper_id, consignee_id, notify_party_id, pol (UN/LOCODE), pod (UN/LOCODE), etd, eta, vessel_name, voyage, mbl_number, hbl_number, carrier, created_from_document_id (FK), created_at, updated_at.
- **party** (shipper/consignee/notify/carrier): id, org_id, role, name, address, country, tax_id, contact_email.
- **container**: id, shipment_id, container_number (ISO 6346), type (20GP/40HC…), seal_number, weight_kg, volume_cbm.
- **cargo_line**: id, shipment_id, description, hs_code, packages, weight_kg, volume_cbm.
- **document**: id, shipment_id (nullable hasta asignar), org_id, type (bl/awb/invoice/packing_list/customs), filename, blob_url, status (uploaded/processing/extracted/validated/failed), extracted_json (jsonb), confidence (jsonb por campo), uploaded_at.
- **tracking_event**: id, shipment_id, code (gate_in/loaded/departed/arrived/discharged/delivered…), location, timestamp, source (shipsgo/ais/manual/mock).
- **charge**: id, shipment_id, concept, type (buy/sell), amount, currency.

Relaciones: organization 1—N user/shipment/party; shipment 1—N container/cargo_line/document/tracking_event/charge; party N—shipment (shipper/consignee/notify). IDs internos = UUID (no reutilizar NIF/identificadores externos).

## Qué es real vs. mockeado (regla de honestidad)

| Real | Mockeado de forma creíble |
|---|---|
| Auth, esquema, subida PDF | Integración AEAT/SII, Portic, Inttra |
| **Extracción IA (PR-7) — debe ser real** | Reservas con navieras |
| UI, dashboard, landing, ambos temas | Tracking de los envíos sin crédito ShipsGo |
| 2-3 tracking reales (ShipsGo) | Documentos aduaneros de ejemplo |
| Contacto vía Resend (PR-9) | Páginas legales (placeholder etiquetado) |

Todo lo mockeado: datos de muestra realistas (UN/LOCODE y buques reales, contenedores ISO 6346 válidos) + etiqueta visual. Nunca presentar una integración simulada como real ante el stakeholder.
