# Manann — Roadmap (actualizado 14-06-2026)

> Análisis: Faro ERP (boceto) ↔ Manann Production.
> `[X]` = implementado · `[ ]` = pendiente
> Orden de ejecución: cada tier es **puramente aditivo** sobre el anterior — no modifica lo ya construido.
> Esfuerzo: S ≤2 días · M 2-4 días · L 4-7 días · XL 7+ días

---

## Completado antes de este roadmap

Los tiers 1–4 y A–C están 100 % cerrados:

- **Tier 1** — Timeline visual, tour overlay, exportar PDF, búsqueda, notas internas
- **Tier 2** — Edición inline, dashboard analytics, ⌘K palette, notificaciones, Kanban
- **Tier 3** — ShipsGo real, resumen IA, auditoría, calendario ETAs, asignación agente
- **Tier 4** — Comparativa IA BL vs. factura, DUA simulado, plantillas AWB/CMR, comentarios, onboarding
- **Tier A** — Buy/sell por línea, flags at-risk/pass-through, GP en boarding pass, excepciones
- **Tier B** — Bandeja excepciones, KPI margen fugado, GP por cliente, accrual vs. factura, pipeline extendido
- **Tier C** — Autopilot inbox, briefing matutino, copiloto conversacional ⌘J

---

Orden: D → E → G → F → J → K → H → N → O → L → M → P → I → Q

## [X] Tier D — UX Power User (S · ≤2 días)

*Interacciones avanzadas sobre vistas existentes. Sin cambios de schema ni nuevas rutas.*

- [X] Bulk actions en lista: checkbox multi-select → asignar agente / cambiar estado / exportar selección
- [X] Duplicar expediente (clona campos base + partes, status = borrador)
- [X] Keyboard nav en lista (J/K o ↑↓ para navegar entre filas, Enter para abrir detalle)
- [X] Vista tabla densa (referencia, POL→POD, naviera, ETD, ETA, GP, estado) — toggle `vista=tabla`

---

## [X] Tier E — Portal de Seguimiento para Cliente (S · 1-2 días)

*Ruta pública ya existe; completar la vista stripped. Sin tocar la app privada.*

- [X] Link público `/seguimiento/[token]` sin auth — expediente accesible sin login
- [X] Botón "Compartir con cliente" en cabecera del expediente
- [X] Vista stripped completa: estado visual + countdown ETA + documentos descargables + timeline tracking

---

## [X] Tier G — Contactos & Tablas Maestras (M · 2-3 días)

*Extiende el módulo de contactos existente. Fundación para Tier K (CRM).*

- [X] `/contactos` — listado con filtros por rol
- [X] CRUD completo: crear / editar / eliminar contacto con NIF/EORI, país, límite de crédito, estado activo
- [X] Historial de expedientes por contacto (los últimos N, con GP por cada uno)
- [X] GP acumulado y margen % por contacto
- [X] Autocompletar al asignar partes (shipper, consignee, notify) en un expediente
- [X] Navieras maestras: SCAC, alianza (Gemini / Ocean Alliance / Premier), estado integración API
- [X] Tipos de contenedor: ISO 6346, clase (Dry / Reefer / Especial), tara, payload, volumen
- [X] Incoterms 2020: los 10 términos con grupo (E/F/C/D), modo aplicable, quién asume el riesgo

---

## [X] Tier F — Analítica Avanzada (M · 3-4 días)

*Nueva página `/reportes`. Lee datos existentes — cero cambios de schema.*

- [X] Selector de período (semana / mes / trimestre / año)
- [X] GP mensual — area chart, 12 meses de histórico
- [X] Top clientes por margen — tabla ordenable con tier A/B/C
- [X] Distribución de expedientes por ruta y modo (bar chart o treemap)
- [X] KPIs de tránsito: ETD estimado vs. real por naviera, días medios de retraso
- [X] Exportar PDF del informe de período

---

## [X] Tier J — Documentos Modo-Específico (M · 3-4 días)

*Extiende el flujo de documentos existente. El flow de BL marítimo no se toca.*

- [X] AWB (Air Waybill): MAWB/HAWB, esquema Zod específico (vuelo, aerolínea, aeropuertos, HAWB, peso)
- [X] CMR (transporte por carretera): campos conductor, matrícula, punto de carga/descarga, régimen
- [X] Detección automática del tipo de documento al subir (BL / AWB / CMR / Invoice / Packing List)
- [X] Plantilla imprimible AWB (PDF exportable con marca Manann)
- [X] Plantilla imprimible CMR (PDF exportable con marca Manann)

---

## [X] Tier K — CRM & Pipeline Comercial (M · 3-4 días)

*Nuevo módulo. Requiere contactos completos (Tier G).*

- [X] `/pipeline` — oportunidades en embudo: prospecto → propuesta → negociación → ganado / perdido
- [X] Crear oportunidad desde un contacto existente (tipo carga, modo, ruta, importe estimado)
- [X] Rate search: búsqueda en catálogo propio de tarifas con filtros ruta / modo / período
- [X] Benchmarking de tarifas: alerta cuando el precio propuesto supera el histórico propio en esa ruta

---

## [X] Tier H — IA 2.0 (M · 3-5 días)

*Mejoras sobre infraestructura IA existente. Se beneficia de los datos acumulados en tiers anteriores.*

- [X] Price anomaly: "Este flete está un 40 % sobre tu histórico para BCN→RTM" (compara charge vs. tarifas maestras)
- [X] Predicción de riesgo de retraso por ruta / naviera / temporada (simulada con datos históricos)
- [X] Batch extraction: subir hasta 5 BL / AWB a la vez, extracción en paralelo, revisión multi-doc

---

## [X] Tier N — Operativo Avanzado (L · 5-7 días)

*Módulos de carga específicos. Sin impacto en expediciones marítimas FCL ya construidas.*

- [X] Bookings DCSA 2.0: crear booking por buque/ruta, estados (RECEIVED / CONFIRMED / PENDING / REJECTED)
- [X] VGM (Verified Gross Mass): campo, validación y registro según regulación IMO SOLAS
- [X] LCL / grupaje: W/M, consolidación multi-envío en un mismo contenedor o vuelo
- [X] Módulo courier: envíos UPS / DHL / FedEx con tracking nativo (API real o mock etiquetado)

---

## [X] Tier O — ESG & Sostenibilidad (S · 1-2 días)

*`estimateCo2` ya existe en código — solo falta exponer la UI.*

- [X] Badge CO₂ estimado en detalle de expediente (kg CO₂e, basado en modo + peso + km ruta)
- [X] Dashboard ESG en `/reportes`: CO₂ total por período, comparativa por modo
- [X] Exportar informe ESG (CSV / PDF)

---

## [X] Tier L — Contabilidad (XL · 8-12 días)

*Módulo aislado. Lee facturas ya existentes; añade asientos y tesorería sin romper facturación actual.*

- [X] Plan contable PGC pre-cargado: cuentas 6xx (compras), 7xx (ventas), 4xx (deudores / acreedores)
- [X] Generación automática de asiento al emitir o cobrar una factura
- [X] Creación manual de asientos contables
- [ ] Cierre mensual: flujo con comprobaciones (facturas sin asiento, cargos sin liquidar)
- [X] Tesorería: vencimientos de cobros y pagos, DSO, proyección de flujo de caja 30/60/90 días
- [ ] Conciliación avanzada accrual ↔ factura real con reverso automático (umbral de desvío configurable)

---

## [X] Tier M — Compliance & e-Factura (L · 5-7 días)

*Regulatorio. Requiere facturación consolidada (Tier L) para envíos AEAT con trazabilidad contable.*

- [X] Verifactu / e-factura: firma electrónica y envío a AEAT (integración real o simulación etiquetada)
- [X] ICS2 / ENS: Entry Summary Declaration (pre-llegada / pre-carga) para importaciones EU
- [X] NCTS: New Computerised Transit System — declaración de tránsito aduanero en la UE
- [X] AES: Automated Export System — exportación automatizada

---

## [X] Tier P — Ecosistema & Partners (M · 3-4 días)

*Nuevo módulo independiente. Sin dependencias de tiers anteriores más allá de contactos (Tier G).*

- [X] Directorio de partners logísticos (agentes, co-loaders, subcontratistas) con región y servicios
- [X] Scorecard de proveedores: KPIs por carrier (puntualidad %, incidencias, coste medio por ruta)
- [X] Compliance & sanciones: screening OFAC / SIRA antes de crear un expediente con un tercero

---

## [ ] Tier I — Landing Completar (S · 1-2 días)

*Solo marketing. Cero impacto en la app privada.*

- [ ] Actualizar `/el-expediente` con módulos financieros (GP, accrual, at-risk, margen fugado)
- [ ] Actualizar `/como-funciona` con copiloto IA, portal cliente y analítica avanzada
- [ ] Demo sandbox público: expediente de ejemplo con datos reales, navegable sin login (shareToken fijo)

---

## [X] Tier Q — Integraciones & Scale (XL · 8+ días)

*Infraestructura avanzada. Se ejecuta última para no acoplar dependencias antes de que el producto esté estable.*

- [X] API pública documentada (REST + webhooks) para integraciones de clientes
- [X] DCSA Track & Trace real (complemento o sustituto de ShipsGo)
- [X] Importación de tarifas externas (INTTRA, DESCARTES o CSV de navieras con formato estándar)
- [ ] Multiidioma EN / ES (next-intl, sin romper UI existente)
- [X] Módulo ferroviario avanzado: China-Europa, NCTS ferroviario, corredores intra-UE

---

## GAP ANALYSIS — Ítems del menú objetivo no cubiertos en roadmap anterior

> Añadidos el 15-06-2026 tras contraste exhaustivo con la navegación funcional objetivo.
> Los tiers R–V son puramente aditivos sobre el estado actual.

---

## [ ] Tier R — Tablas Maestras & Administración (L · 4-6 días)

*Cubre todos los catálogos maestros ausentes y la configuración de sistema. Sin dependencias de tiers anteriores.*

### Terceros / Catálogos
- [ ] Puertos · UN/LOCODE: UI de gestión (añadir/editar/desactivar), búsqueda por código o nombre — los datos ya existen en `port-coords.ts`
- [ ] Aeropuertos: catálogo IATA (código, ciudad, país, zona horaria) — necesario para módulo aéreo
- [ ] Conceptos de cargo: catálogo editable de líneas de coste (flete, THC, seguro, handling…) reutilizable en expedientes
- [ ] Países: listado ISO 3166-1, zona económica (EU / non-EU), moneda por defecto
- [ ] Monedas: catálogo ISO 4217 + tipo de cambio manual (base EUR), con histórico y fecha de actualización
- [ ] Regímenes aduaneros: tabla maestrа de regímenes HS/TARIC (40, 42, 61…) con descripción y restricciones

### Sistema / Administración
- [ ] Parámetros del sistema: moneda base, SCAC/NIF propio, país de la empresa, idioma de facturas, días de crédito por defecto
- [ ] Series y numeración de documentos: configurar series (FAC-2025-###, EXP-###) y contadores por tipo de documento
- [ ] Empresas y sucursales: soporte multi-sucursal (CIF diferente, domicilio fiscal, delegación comercial) vinculadas a la misma org

---

## [ ] Tier S — Módulos Operativos Faltantes (M · 3-5 días)

*Aéreo completo, Terrestre real y gaps menores en Marítimo y Courier. Sin cambios de schema en lo ya construido.*

### Aéreo — extensión
- [ ] Vuelos: catálogo de vuelos operativos (aerolínea, número, origen/destino, horario), vinculable a expediente aéreo
- [ ] Manifiestos aéreos: manifiesto de carga (Cargo Manifest) agrupa HAWB bajo un MAWB; listado imprimible

### Terrestre — módulo real
- [ ] Órdenes de transporte: OT vinculada a expediente (transportista, matrícula, conductor, fecha recogida/entrega, CMR referenciado)
- [ ] Gestión de rutas: definición de rutas habituales (origen→destino, distancia km, tiempo estimado, coste por km)

### Courier — extensión
- [ ] Etiquetas: generación de etiqueta de envío courier (formato A6, código de barras/QR, datos remitente/destinatario, número de seguimiento)

### Marítimo — extensión
- [ ] Consolidaciones: vista dedicada que agrupa varios expedientes LCL bajo un mismo contenedor/buque (manifiesto de consolidación)

### Ferrocarril — módulo independiente
- [ ] Expediciones ferroviarias: página propia `/ferroviario` con listado de expediciones, filtros por corredor y estado — actualmente solo existe como panel dentro del expediente

---

## [ ] Tier T — Calidad & Procesos (S · 2-3 días)

*Nuevo módulo de calidad y UI de gestión de procesos internos.*

### Calidad
- [ ] Incidencias: registro de incidencias operativas vinculadas a expediente (tipo, descripción, responsable, estado abierto/cerrado, fecha resolución)
- [ ] No conformidades: registro formal de NC (categoría, causa raíz, acción correctiva, evidencia adjunta, seguimiento)
- [ ] SLA y objetivos: definición de SLAs por tipo de envío/cliente (tiempo respuesta cotización, tiempo gestión DUA…) y semáforo de cumplimiento

### Procesos
- [ ] Cola de eventos: UI que muestra webhooks disparados, payload, estado (entregado / fallido / reintentando), historial de reintentos

---

## [ ] Tier U — Contabilidad Completa (M · 3-4 días)

*Cierra los ítems pendientes de Tier L que quedaron marcados `[ ]`.*

- [ ] Cierre mensual: flujo de cierre con checklist automático (facturas sin asiento, cargos sin liquidar, descuadres), bloqueo de período cerrado
- [ ] Impuestos: módulo de IVA — acumulado repercutido / soportado por período, conciliación con facturas, generación de resumen para modelo 303
- [ ] Conciliación avanzada accrual ↔ factura real con reverso automático (umbral de desvío configurable)

---

## [ ] Tier V — Red & Partners Completo (M · 3-4 días)

*Extiende Tier P. Convierte el directorio básico en una red colaborativa real.*

- [ ] Por qué te contratan: perfil público de la empresa dentro de la red — especialidades, corredores habituales, certificaciones, idiomas, capacidad
- [ ] Red de agentes: marketplace interno — buscar agentes corresponsales por país/corredor/modo, solicitar colaboración
- [ ] Tender a la red: envío de RFQ a múltiples partners de la red con plazo de respuesta, comparador de ofertas recibidas
- [ ] Documentos digitales (e-BL): soporte de eBL electrónico — hash del documento registrado, estado (original / endorsed / surrendered), vinculado al expediente

---

## Gaps parciales ya registrados — pendientes de completar

*(Ítems que tienen algo construido pero no están completos)*

- [ ] **Puertos UI** — datos existen en `port-coords.ts`, falta pantalla de gestión (cubierto en Tier R)
- [ ] **Tablas maestras unificadas** — navieras / contenedores / incoterms dispersos; falta sección `/maestros` que los agrupe junto con los nuevos de Tier R
- [ ] **Roles y permisos granulares** — 3 roles fijos; falta configuración de permisos por sección (ver / editar / admin) (Tier R, si se decide implementar)
- [ ] **Power BI** — `/reportes` tiene charts nativos; conector Power BI real requeriría workspace + credencial (no free tier — decisión pendiente)
- [ ] **Multiidioma** (Tier Q) — explícitamente aplazado; EN/ES con next-intl

