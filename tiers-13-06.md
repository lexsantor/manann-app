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

## [ ] Tier N — Operativo Avanzado (L · 5-7 días)

*Módulos de carga específicos. Sin impacto en expediciones marítimas FCL ya construidas.*

- [ ] Bookings DCSA 2.0: crear booking por buque/ruta, estados (RECEIVED / CONFIRMED / PENDING / REJECTED)
- [ ] VGM (Verified Gross Mass): campo, validación y registro según regulación IMO SOLAS
- [ ] LCL / grupaje: W/M, consolidación multi-envío en un mismo contenedor o vuelo
- [ ] Módulo courier: envíos UPS / DHL / FedEx con tracking nativo (API real o mock etiquetado)

---

## [ ] Tier O — ESG & Sostenibilidad (S · 1-2 días)

*`estimateCo2` ya existe en código — solo falta exponer la UI.*

- [ ] Badge CO₂ estimado en detalle de expediente (kg CO₂e, basado en modo + peso + km ruta)
- [ ] Dashboard ESG en `/reportes`: CO₂ total por período, comparativa por modo
- [ ] Exportar informe ESG (CSV / PDF)

---

## [ ] Tier L — Contabilidad (XL · 8-12 días)

*Módulo aislado. Lee facturas ya existentes; añade asientos y tesorería sin romper facturación actual.*

- [ ] Plan contable PGC pre-cargado: cuentas 6xx (compras), 7xx (ventas), 4xx (deudores / acreedores)
- [ ] Generación automática de asiento al emitir o cobrar una factura
- [ ] Creación manual de asientos contables
- [ ] Cierre mensual: flujo con comprobaciones (facturas sin asiento, cargos sin liquidar)
- [ ] Tesorería: vencimientos de cobros y pagos, DSO, proyección de flujo de caja 30/60/90 días
- [ ] Conciliación avanzada accrual ↔ factura real con reverso automático (umbral de desvío configurable)

---

## [ ] Tier M — Compliance & e-Factura (L · 5-7 días)

*Regulatorio. Requiere facturación consolidada (Tier L) para envíos AEAT con trazabilidad contable.*

- [ ] Verifactu / e-factura: firma electrónica y envío a AEAT (integración real o simulación etiquetada)
- [ ] ICS2 / ENS: Entry Summary Declaration (pre-llegada / pre-carga) para importaciones EU
- [ ] NCTS: New Computerised Transit System — declaración de tránsito aduanero en la UE
- [ ] AES: Automated Export System — exportación automatizada

---

## [ ] Tier P — Ecosistema & Partners (M · 3-4 días)

*Nuevo módulo independiente. Sin dependencias de tiers anteriores más allá de contactos (Tier G).*

- [ ] Directorio de partners logísticos (agentes, co-loaders, subcontratistas) con región y servicios
- [ ] Scorecard de proveedores: KPIs por carrier (puntualidad %, incidencias, coste medio por ruta)
- [ ] Compliance & sanciones: screening OFAC / SIRA antes de crear un expediente con un tercero

---

## [ ] Tier I — Landing Completar (S · 1-2 días)

*Solo marketing. Cero impacto en la app privada.*

- [ ] Actualizar `/el-expediente` con módulos financieros (GP, accrual, at-risk, margen fugado)
- [ ] Actualizar `/como-funciona` con copiloto IA, portal cliente y analítica avanzada
- [ ] Demo sandbox público: expediente de ejemplo con datos reales, navegable sin login (shareToken fijo)

---

## [ ] Tier Q — Integraciones & Scale (XL · 8+ días)

*Infraestructura avanzada. Se ejecuta última para no acoplar dependencias antes de que el producto esté estable.*

- [ ] API pública documentada (REST + webhooks) para integraciones de clientes
- [ ] DCSA Track & Trace real (complemento o sustituto de ShipsGo)
- [ ] Importación de tarifas externas (INTTRA, DESCARTES o CSV de navieras con formato estándar)
- [ ] Multiidioma EN / ES (next-intl, sin romper UI existente)
- [ ] Módulo ferroviario avanzado: China-Europa, NCTS ferroviario, corredores intra-UE
