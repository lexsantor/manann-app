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

## Política de simulación (Mock-first)

> Cualquier ítem que dependa de una integración externa de pago, un proveedor SaaS o credenciales de terceros se implementa en modo **simulación**: UI y lógica de negocio completas, datos generados internamente, badge `Simulación — integración [X] en producción`.
>
> El código queda listo para enchufar el proveedor real cambiando únicamente la capa de datos (un archivo de servicio, una env var). La experiencia del stakeholder es idéntica a la versión real.

| Ítem | Por qué se mockea | Qué se construye |
|------|-------------------|-----------------|
| Monedas / tipos de cambio | API ECB/Fixer de pago o requiere rotación de clave | Tabla editable manualmente + lógica de conversión real en toda la app |
| Power BI | Power BI Embedded requiere workspace Microsoft 365 | Sección en `/reportes` con recharts como placeholder, iframe preparado, llamadas SDK comentadas |
| e-BL electrónico | ESSDOCS/Bolero/WAVE requieren contrato comercial | Hash SHA-256 real del PDF, estado (Original/Endorsed/Surrendered), UI completa |
| Vuelos (schedule) | APIs IATA/OAG son de pago | Catálogo propio de vuelos sin feed externo en tiempo real |
| Tender a la red | Marketplace real requeriría multi-tenant externo | Flujo completo en DB propia, emails vía Resend (funcional) |
| Multiidioma | next-intl sin romper UI existente — riesgo alto para demo | Aplazado explícitamente — no se mockea, se omite |

---

## Orden de ejecución — Tiers R a I

```
R → S → U → T → V → I
```

Cada tier es **puramente aditivo**: no modifica schema ni rutas ya existentes. Solo añade.

**Dependencia única:** Tier S requiere el catálogo de aeropuertos de Tier R para el módulo aéreo. El resto de tiers son independientes entre sí y podrían ejecutarse en distinto orden a partir de R.

---

## [ ] Tier R — Tablas Maestras & Administración (L · 4-6 días)

*Dependencias: ninguna. Primer tier del bloque nuevo — establece los catálogos que Tier S y el resto consumen.*

### Terceros / catálogos maestros

- [ ] **Puertos · UN/LOCODE** — UI de gestión sobre `port-coords.ts` ya existente: añadir, editar, activar/desactivar, buscar por código o nombre. Nueva página `/maestros/puertos`.
- [ ] **Aeropuertos** — catálogo IATA pre-cargado (seed top-300: código IATA, ciudad, país, zona horaria). UI gestionable. Nueva página `/maestros/aeropuertos`. *Requerido por Tier S (vuelos y AWB).*
- [ ] **Conceptos de cargo** — catálogo editable de líneas de coste (Flete, THC, Seguro, Handling, Demurrage…) reutilizable al crear cargos en expedientes. Página `/maestros/conceptos-cargo`.
- [ ] **Países** — listado ISO 3166-1 pre-cargado: zona económica (UE / no-UE), moneda por defecto, restricciones de exportación. Activar/desactivar por el owner; no edición libre de campos core.
- [ ] **Monedas y tipos de cambio** *(simulación)* — catálogo ISO 4217 con tipo de cambio editable manualmente (base EUR). Lógica de conversión real en toda la app. Badge `Simulación — integración ECB/Fixer en producción`. Página `/maestros/monedas`.
- [ ] **Regímenes aduaneros** — tabla maestra HS/TARIC (40 importación, 42 perfeccionamiento activo, 61 reimportación…): código, descripción, restricciones, modo aplicable. Pre-cargado, gestionable.

### Sistema / administración

- [ ] **Parámetros del sistema** — pantalla en `/settings/parametros`: moneda base de la org, SCAC/NIF propio, país, idioma por defecto de facturas, días de crédito por defecto, logo para documentos PDF.
- [ ] **Series y numeración** — configurar series por tipo de documento (ej. `FAC-{YYYY}-{###}`, `EXP-{###}`, `COT-{YYYY}-{###}`) con contador auto-incremental en DB. Página `/settings/series`.
- [ ] **Empresas y sucursales** — multi-sucursal bajo la misma org: CIF diferente, domicilio fiscal, serie propia. CRUD en `/settings/sucursales`. *(Una org, varias sucursales — no multi-empresa)*
- [ ] **Tablas maestras unificadas** — sección `/maestros` en el sidebar que agrupa todas las tablas (puertos, aeropuertos, navieras, contenedores, incoterms, conceptos de cargo, países, monedas, regímenes). Las navieras, contenedores e incoterms ya construidos en Tier G se enlazan aquí.

---

## [ ] Tier S — Módulos Operativos Faltantes (M · 3-5 días)

*Dependencias: Tier R (aeropuertos para vuelos/manifiestos). Resto de sub-ítems son independientes.*

### Aéreo — extensión

- [ ] **Vuelos** *(simulación parcial)* — catálogo propio sin feed externo: aerolínea, número, IATA origen/destino (del catálogo de aeropuertos de Tier R), horario, días operativos, vinculable a expediente. Página `/vuelos`. Badge `Sin feed en tiempo real — actualización manual`.
- [ ] **Manifiestos aéreos** — manifiesto de carga: agrupa HAWB bajo un MAWB con peso, bultos y descripción. Listado imprimible (PDF exportable con marca Manann). Vista en `/documentos/manifiestos`.

### Terrestre — módulo real

- [ ] **Órdenes de transporte** — OT vinculada a expediente: transportista (del directorio de partners), matrícula, conductor, fechas recogida/entrega, CMR referenciado, estado (pendiente / en ruta / entregado). Página `/terrestre/ordenes`.
- [ ] **Gestión de rutas** — rutas habituales: origen→destino, distancia km, tiempo estimado, coste por km como referencia tarifaria. Tabla editable. Página `/terrestre/rutas`.

### Courier — extensión

- [ ] **Etiquetas** — generación de etiqueta de envío (formato A6, código de barras 128 / QR con número de seguimiento, remitente/destinatario, peso, referencia interna). Exportable a PDF. Botón "Generar etiqueta" en el panel courier del expediente.

### Marítimo — extensión

- [ ] **Consolidaciones LCL** — vista dedicada que agrupa expedientes LCL bajo un mismo contenedor/buque: referencia de consolidación, POL, POD, naviera, ETD, lista de HBL con peso/volumen, manifiesto imprimible. Página `/maritimo/consolidaciones`.

### Ferrocarril — módulo independiente

- [ ] **Expediciones ferroviarias** — página propia `/ferroviario` con listado de expediciones, filtros por corredor (China-Europa, intra-UE) y estado. Reutiliza datos del `rail-panel.tsx` ya construido. El panel en expediente se mantiene; esta página añade la vista global.

---

## [ ] Tier U — Contabilidad Completa (M · 3-4 días)

*Dependencias: Tier L (ya construido). Cierra los tres ítems que quedaron `[ ]` en Tier L.*

- [ ] **Cierre mensual** — flujo guiado con checklist automático (facturas sin asiento, cargos sin liquidar, descuadres en tesorería), confirmación con bloqueo de período cerrado (no se pueden editar asientos del mes cerrado), botón de reapertura solo para owner.
- [ ] **Impuestos / IVA** — módulo de IVA repercutido/soportado: acumulado por período, desglose por tipo (21% / 10% / 0% / exento), conciliación con facturas emitidas y recibidas. Resumen exportable compatible con modelo 303. Página `/contabilidad/impuestos`.
- [ ] **Conciliación avanzada** — accrual ↔ factura real con reverso automático cuando la diferencia supera el umbral configurable (parámetro del sistema de Tier R). Alerta visual en el expediente cuando hay desvío.

---

## [ ] Tier T — Calidad & Procesos (S · 2-3 días)

*Dependencias: ninguna. Módulo aislado que solo lee expedientes ya existentes.*

### Calidad

- [ ] **Incidencias** — registro de incidencias operativas vinculadas a expediente: tipo (retraso / daño / pérdida / documental), descripción, responsable, estado (abierto / en gestión / cerrado), fecha resolución, coste de impacto. Página `/calidad/incidencias`.
- [ ] **No conformidades** — registro formal de NC: categoría, causa raíz (proceso / proveedor / cliente / externo), acción correctiva, evidencia adjunta (Vercel Blob), seguimiento con historial de cambios. Página `/calidad/no-conformidades`.
- [ ] **SLA y objetivos** — definición de SLAs por tipo de envío o cliente (tiempo respuesta cotización, tiempo gestión DUA, tiempo confirmación booking…). Semáforo verde/ámbar/rojo de cumplimiento por expediente y resumen global. Página `/calidad/sla`.
- [ ] **Power BI** *(simulación)* — sección "Power BI" dentro de `/reportes`: dashboard estático con recharts como placeholder visual, iframe preparado con dimensiones reales, llamadas al SDK de Power BI Embedded comentadas y listas para activar con workspace. Badge `Simulación — Power BI Embedded en producción`.

### Procesos

- [ ] **Cola de eventos** — UI que muestra webhooks disparados: payload, URL destino, código HTTP de respuesta, timestamp, estado (entregado / fallido / reintentando). Botón de reintento manual. Lee tabla `webhook` + log de disparos. Página `/procesos/eventos`.

---

## [ ] Tier V — Red & Partners Completo (M · 3-4 días)

*Dependencias: Tier P (ya construido). Extiende `partner-directory.tsx` y `carrier-scorecard.tsx`.*

- [ ] **Por qué te contratan** — perfil público de la organización dentro de la red: especialidades logísticas, corredores habituales, certificaciones (ISO, OEA…), idiomas, capacidad mensual estimada. Editable en settings, visible para otros miembros. Sección `/partners/perfil`.
- [ ] **Red de agentes** — directorio ampliado de corresponsales: buscar por país, corredor o modo; ver perfil completo; solicitar colaboración (genera notificación interna). Datos en DB propia. Página `/partners/red`.
- [ ] **Tender a la red** *(parcialmente simulado)* — envío de RFQ a múltiples partners seleccionados: descripción de carga, ruta, fecha, condiciones. Plazo de respuesta configurable. Comparador de ofertas recibidas. Notificación por email vía Resend (funcional). Página `/partners/tender`.
- [ ] **e-BL electrónico** *(simulación)* — eBL vinculado al expediente: hash SHA-256 del PDF del BL como huella digital, estado del título (Original / Endorsed / Surrendered / Void), historial de transferencias con fecha y firmante de cada cambio. Sin blockchain real. Badge `Simulación — integración ESSDOCS/Bolero/WAVE en producción`. Panel adicional en el expediente marítimo.

---

## [ ] Tier I — Landing Completar (S · 1-2 días)

*Dependencias: ninguna. Cero impacto en la app privada. Se ejecuta al final, cuando el producto está pulido.*

- [ ] Actualizar `/el-expediente` con módulos financieros (GP, accrual, at-risk, margen fugado)
- [ ] Actualizar `/como-funciona` con copiloto IA, portal cliente y analítica avanzada
- [ ] Demo sandbox público: expediente de ejemplo con datos reales, navegable sin login (shareToken fijo)

---

## Pendiente explícito — no en ningún tier

- **Multiidioma EN/ES** (next-intl) — aplazado indefinidamente. Riesgo alto de romper UI existente para una demo. No se mockea, no se incluye.
- **Roles y permisos granulares** — 3 roles fijos (owner/admin/member) suficientes para la demo. Si se decide implementar, va dentro de Tier R como extensión de `/settings`. No está en scope actual.
