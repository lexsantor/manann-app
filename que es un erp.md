# Formación integral: ERP para transitarios (freight forwarding ERP) — Blueprint Manann

## TL;DR
- Un ERP transitario es el sistema operativo del negocio de intermediación logística: su núcleo es el **expediente** (shipment/job file), y lo que distingue a un líder (CargoWise, que según el *Journal of Commerce* de diciembre de 2025 "controla aproximadamente el 70% del mercado de software de forwarding" con una capitalización de 16.000 M USD) de un mediocre no son las funciones sino la **base de datos única**, la conectividad aduanera multipaís y la captura de cada cargo facturable.
- La tesis de Manann es correcta y está validada por el mercado en 2026: la "IA periférica sobre legacy" (bolt-on) es el patrón dominante (Raft, Expedock, HappyRobot, Vooma), mientras CargoWise sufre una rebelión de precios (Value Packs, con forwarders que reportan a JOC subidas esperadas del "25 al 35%") que abre una ventana competitiva real para un ERP AI-native de arquitectura nueva.
- Para un solo founder a coste cero, la estrategia ganadora no es replicar CargoWise (imposible: 20+ años de lógica aduanera) sino construir un **vertical demo creíble** donde la IA es nativa del core (extracción documental → expediente auto-poblado → cotización → eventos), flanqueando al incumbente por UX, transparencia de precio y velocidad, no atacándolo de frente.

---

## Key Findings

1. **El expediente es el átomo del negocio.** Todo ERP transitario gira alrededor del shipment/job file con relaciones jerárquicas fijas: un consol/máster contiene muchos houses; un shipment contiene muchos contenedores; un contenedor contiene muchas pack lines; un job contiene muchas charge lines (buy/sell). CargoWise prefija los expedientes de forwarding con "S".

2. **Los márgenes son estructuralmente finos.** El margen bruto por expedición ronda 10-20% antes de overhead; el margen neto típico 3-4%. McKinsey ("Freight forwarders' earnings amid carrier-rate volatility"): "Entre el 62% y el 85% de los ingresos se canalizan a comprar capacidad al carrier... los forwarders típicamente convierten el 20-30% del resto en EBIT, logrando márgenes EBIT del 1 al 11%, con ROIC normalmente superior al 20%". Esto significa que el ERP no es un lujo: la fuga de un solo cargo accesorio o un error de facturación puede borrar el beneficio de un expediente entero.

3. **El cumplimiento aduanero es el foso (moat) real.** La integración con sistemas gubernamentales (DUA/AEAT en España, ICS2, NCTS-P6, AES en UE, ACE en USA) es lo que hace imposible cambiar de ERP. Robert Petti (Prompt Global): DSV necesitaría "una resolución del consejo, probablemente cinco años de gestión del cambio y un plan de implementación de cuatro años" para dejar CargoWise.

4. **Estándares de datos en transición.** EDIFACT/CargoIMP (legacy) coexisten con API modernas: DCSA (ocean, ~70% del trade contenedor) y ONE Record de IATA. La Fact Sheet de IATA (diciembre 2025) confirma que ONE Record es "el estándar preferente para compartir datos entre los actores del air cargo desde el 1 de enero de 2026... más de 200 empresas en todo el mundo participan en proyectos piloto". Esto es una oportunidad: un ERP nuevo puede ser API-native desde el día uno.

5. **La ventana competitiva está abierta ahora.** La controversia de los CargoWise Value Packs (diciembre 2025) ha pasado a los forwarders "de la frustración pasiva a la evaluación activa". Han aparecido rivales AI-native explícitos (Argocore/Cargonautix) con exactamente la tesis de Manann: los ERP legacy "fueron diseñados para registrar transacciones, no para moldear resultados".

---

## Details

### PARTE 1. FUNDAMENTOS DEL NEGOCIO TRANSITARIO

**Qué es un transitario (freight forwarder).** Un **transitario** (en inglés *freight forwarder*; también "agente de carga") es una persona física o jurídica que organiza, coordina y gestiona el transporte internacional de mercancías actuando como **intermediario** entre el cargador (shipper/exportador) y las compañías de transporte (carriers). No es propietario de buques, aviones ni camiones: es un operador **asset-light** que compra capacidad de transporte al por mayor y la revende, empaquetada con servicios, al cargador. En España la figura está regulada por la Ley 16/1987 de Ordenación de los Transportes Terrestres (LOTT), y la mayoría de empresas se integran en FETEIA-OLTRA (Federación Española de Asociaciones de Transitarios). A nivel internacional las agrupa FIATA y a nivel europeo CLECAT.

*Por qué existe:* el comercio internacional implica decenas de actores, documentos y normativas por operación. Flexport lo resume: mover carga internacionalmente requiere coordinar "hasta 20 compañías diferentes". El transitario absorbe esa complejidad, y por eso su valor real no está en el flete (que es un coste pasante) sino en el **conocimiento experto** (qué Incoterm usar, qué régimen aduanero, qué ruta) y la **coordinación documental**.

**Historia del freight forwarding.** El negocio nace de la necesidad medieval-moderna de intermediarios que custodiaban y reexpedían mercancías en rutas comerciales. En la era del contenedor (post-1956) y la globalización, el transitario se profesionaliza como coordinador multimodal. El software del sector emergió en los 90: WiseTech Global (fundada 1994 en Australia por Richard White y Maree Isaacs) escribió código para transitarios australianos cuando "una oficina típica dependía de documentos impresos, instrucciones por fax, contabilidad desconectada y reintroducción manual de datos". En 2004 lanzó ediEnterprise (2ª generación); hoy CargoWise Next es la 4ª generación.

**Diferencias entre figuras (tabla comparativa):**

```
FIGURA                  ROL PRINCIPAL                         ¿ASSET?   ¿REPRESENTA EN ADUANA?
─────────────────────────────────────────────────────────────────────────────────────────
Transitario             Organiza/coordina transporte intl.    No        A veces (si es repr. aduanero)
Transportista (carrier) Mueve físicamente la mercancía         Sí        No
Operador logístico      Diseña/gestiona cadena suministro      A veces   No (típicamente)
Agente/repr. aduanero   Declara ante aduana en nombre cliente  No        Sí (es su función central)
Consignatario buques    Representa a la naviera en puerto       No        No
NVOCC                   Consolidador marítimo neutral          No        No (emite HBL)
```

En España el **representante aduanero** debe superar la prueba de capacitación anual de la AEAT (examen tipo test sobre legislación aduanera, ~48 temas) e inscribirse en el Registro de Representantes Aduaneros. Diferencia salarial indicativa: transitarios ~26.000 €/año, representantes aduaneros hasta ~50.000 €/año (fuente: Flou). El **agente de vigilancia aduanera**, en cambio, es funcionario (policía fiscal), no debe confundirse con el representante privado.

**Ecosistema completo de actores:** shipper (exportador), consignee (importador), notify party, transitario, NVOCC, naviera/aerolínea (carrier), consignatario, terminal portuaria, depósito/almacén (CFS — Container Freight Station), agente de aduanas, autoridades aduaneras (AEAT), Port Community System (Portic, Valenciaport), bancos (crédito documentario), aseguradoras, transportista terrestre (drayage/cartage), y plataformas de visibilidad.

**Flujo global de una operación internacional (ASCII):**

```
EXPORTADOR → [recogida/pickup] → ALMACÉN ORIGEN/CFS → [aduana exportación: DUA/AES]
   → PUERTO/AEROPUERTO ORIGEN → [carga en buque/avión: MBL/MAWB] → TRÁNSITO INTERNACIONAL
   → PUERTO/AEROPUERTO DESTINO → [aduana importación: DUA importación + ICS2/ENS]
   → ALMACÉN DESTINO/CFS → [última milla] → IMPORTADOR
        ↑ El transitario coordina TODO esto y emite HBL/HAWB al cliente final ↑
```

**Modos de transporte:**
- **Marítimo:** el 90% del comercio mundial por volumen (Flexport, 2025). Dos modalidades: **FCL** (Full Container Load — contenedor completo de un solo cargador) y **LCL** (Less than Container Load — carga consolidada de varios cargadores en un contenedor, también llamado *grupaje*/consolidado). Lento, barato, alto volumen.
- **Aéreo:** rápido, caro, bajo volumen/peso. Documento: AWB (Air Waybill).
- **Terrestre (carretera):** **FTL** (Full Truck Load) y **LTL** (Less than Truck Load). Cross-docking = transbordo sin almacenaje.
- **Ferroviario:** relevante en corredores como China-Europa; bajo coste de CO₂.
- **Multimodal/intermodal:** combinación de modos bajo un único documento de transporte (FBL — FIATA Bill of Lading). El operador de transporte multimodal (OTM) asume la responsabilidad como transportista principal puerta a puerta.

**Incoterms 2020 (International Commercial Terms, ICC).** Reglas que definen quién asume costes, riesgos y obligaciones en cada tramo. NO regulan precio, propiedad ni jurisdicción. Son 11 términos:

```
MULTIMODAL (cualquier modo):
  EXW  Ex Works            — vendedor pone mercancía en sus instalaciones; comprador asume casi todo
  FCA  Free Carrier        — vendedor entrega a transportista nominado; despacha exportación
  CPT  Carriage Paid To    — vendedor paga flete hasta destino; riesgo pasa al entregar al 1er carrier
  CIP  Carriage&Ins Paid   — como CPT + seguro (ahora exige cobertura Cláusula A, todo riesgo)
  DAP  Delivered at Place   — vendedor entrega en destino, listo para descarga
  DPU  Delivered at Place Unloaded — ÚNICO donde vendedor descarga (antes DAT)
  DDP  Delivered Duty Paid  — vendedor asume TODO incluido aranceles/IVA importación
SOLO MARÍTIMO/FLUVIAL:
  FAS  Free Alongside Ship  — vendedor entrega al costado del buque
  FOB  Free On Board        — vendedor entrega cargado a bordo del buque
  CFR  Cost and Freight     — vendedor paga flete; riesgo pasa al cargar
  CIF  Cost Insurance Freight— CFR + seguro (mínimo Cláusula C)
```

Cambios clave 2020 vs 2010: (1) DAT renombrado a DPU; (2) FCA permite que el comprador instruya al carrier emitir un B/L "on board" al vendedor (resuelve problema de créditos documentarios); (3) CIP eleva el seguro mínimo a Cláusula A; (4) FCA/DAP/DPU/DDP admiten transporte con medios propios. **Trampa operativa real (no teoría):** la ICC recomienda NO usar FOB/CFR/CIF para contenedores (FCL/LCL) — debe usarse FCA/CPT/CIP — porque el riesgo en FOB pasa "al cargar a bordo" pero el contenedor sale de las manos del exportador días antes, en la terminal. En la práctica el 80% de los cargadores siguen usando FOB por costumbre, generando disputas de riesgo.

### PARTE 2. ¿QUÉ ES UN ERP TRANSITARIO?

Un **ERP transitario** (freight forwarding ERP) es un sistema de información que unifica en una sola base de datos todos los procesos del negocio de intermediación logística: comercial (CRM), tarifas/cotización (pricing), operaciones (booking, tracking, documentación), aduanas, almacén, y crucialmente **contabilidad y facturación** ligadas al expediente. CargoWise se define a sí mismo como "el sistema operativo del comercio y la logística globales".

**Qué problemas resuelve (y por qué existe):** el problema central que resuelve es la **fragmentación de datos**: un expediente contiene booking, BL, papeleo aduanero, facturas de proveedor, facturas de cliente, albaranes y registros de pago, históricamente dispersos. El valor original de CargoWise fue "mover los flujos de trabajo del freight a un sistema digital estructurado". El ERP los une bajo un único número de expediente, eliminando reintroducción de datos y errores.

**Diferencias con otros sistemas (tabla):**

```
SISTEMA      FOCO                                    ¿SIRVE A UN TRANSITARIO?
──────────────────────────────────────────────────────────────────────────────
ERP genérico Finanzas/RRHH/inventario (SAP, Oracle)  No nativamente (falta expediente, BL, aduanas)
TMS          Ejecución del transporte/rutas          Parcial (le falta finanzas/aduanas integradas)
WMS          Gestión de almacén (stock, picking)     Solo el módulo almacén
CRM          Relación comercial/leads                Solo el módulo comercial
ERP transit. TODO lo anterior + expediente como core Sí: es purpose-built
```

La clave: un ERP genérico (SAP) "no fue diseñado como sistema logístico y fue adaptado después"; CargoWise "emergió de las operaciones de forwarding". La diferencia no es semántica: el expediente, el BL, las regulaciones aduaneras y el reconocimiento de ingresos por expedición son nativos. Las **plataformas colaborativas** (INTTRA, GT Nexus, Port Community Systems) NO son ERPs: son redes de intercambio de mensajes entre actores; el ERP es el sistema de registro interno del transitario que se conecta a ellas.

### PARTE 3. ARQUITECTURA COMPLETA DEL ERP

**Capas (relacionadas con el stack de Manann):**

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: SPA/SSR — Next.js + shadcn/ui (Manann)             │
│  Portales: operativo interno · cliente (self-service) · agente│
├─────────────────────────────────────────────────────────────┤
│ API LAYER: REST/GraphQL + Webhooks  (Next.js API routes/     │
│            Vercel serverless functions en Manann)            │
├─────────────────────────────────────────────────────────────┤
│ BACKEND/LÓGICA: motor de workflow, reglas de negocio,        │
│   cálculo de márgenes, IA nativa (extracción/cotización)     │
├─────────────────────────────────────────────────────────────┤
│ DATOS: PostgreSQL (Neon en Manann) — base de datos única     │
│   multiempresa/multicliente/multipaís/multimoneda            │
├─────────────────────────────────────────────────────────────┤
│ INTEGRACIONES: EDI/EDIFACT · API carriers (DCSA/ONE Record)· │
│   aduanas (AEAT/ICS2/NCTS/AES/ACE) · tracking (project44…)   │
└─────────────────────────────────────────────────────────────┘
```

**SaaS vs on-premise:** CargoWise y los modernos son cloud/SaaS sobre "una base de datos global única". Riege ofrece cloud Y on-premise porque algunos clientes UE tienen requisitos de residencia de datos. Para Manann (coste cero, solo founder), SaaS multi-tenant es la única opción viable: Vercel (frontend/serverless) + Neon (Postgres serverless con scale-to-zero) permiten arrancar en free-tier.

**Monolito vs microservicios vs event-driven:** los incumbentes son arquitecturas "fuertemente acopladas" (tightly coupled), lo que según Argocore las hace "estructuralmente limitadas" para incrustar inteligencia predictiva. Para un solo founder, un **monolito modular** (modular monolith) en Next.js es lo correcto: microservicios son overhead prematuro. La arquitectura **event-driven** (eventos de dominio: `ShipmentCreated`, `ContainerGatedIn`, `InvoiceIssued`) sí es valiosa porque el negocio ES un flujo de eventos — y Postgres + webhooks bastan para emularla sin Kafka.

**Multi-dimensionalidad obligatoria:**
- **Multiempresa:** un grupo con varias razones sociales/sucursales.
- **Multicliente (multi-tenant):** aislamiento de datos por organización (Row-Level Security en Postgres — nativo en Neon).
- **Multipaís:** reglas aduaneras y fiscales por jurisdicción.
- **Multiidioma y multimoneda:** documentos y contabilidad. CargoWise destaca "trabajar con diferentes monedas y regulaciones de cada país".

**Seguridad, roles y permisos:** RBAC (Role-Based Access Control), auditoría (audit trail), cifrado. En Postgres/Neon, Row-Level Security para aislamiento multi-tenant es la pieza clave.

### PARTE 4. EL CORAZÓN DEL ERP: EL EXPEDIENTE (SHIPMENT FILE / JOB FILE)

El **expediente** (shipment file o job file) es el registro maestro de una operación. En CargoWise los expedientes de forwarding se prefijan con "S". Es donde converge todo: cliente, proveedores, transporte, documentos, costes y ventas.

**Campos típicos (validado contra CargoWise/Magaya/GoFreight):**

```
IDENTIFICACIÓN     nº expediente (S-…), referencia cliente, modo (SEA/AIR/ROAD)
PARTES             shipper, consignee, notify party, agente origen/destino
DOCUMENTOS         MBL (Master BL), HBL (House BL), MAWB/HAWB, DUA/MRN
TRANSPORTE         carrier (SCAC), vessel/voyage o vuelo, POL/POD (UN/LOCODE)
FECHAS             ETD, ETA, ATD, ATA (estimated/actual time of departure/arrival)
CARGA              nº contenedor, tipo ISO (22G1/42G1/45G1/22R1…), nº bultos,
                   peso bruto, volumen (CBM), descripción mercancía, código HS
COMERCIAL          Incoterm, término de servicio (CY-CY / CY-DOOR), valor declarado
FINANZAS           charge lines: cada cargo con BUY (coste/accrual) y SELL (venta)
                   crédito documentario (L/C), licencia de exportación
```

Los **tipos ISO de contenedor** (norma ISO 6346, registro oficial BIC): 22G1 = 20' dry general; 42G1 = 40' dry; 45G1 = 40' High Cube; 22R1/42R1/45R1 = reefer (refrigerado); 22U1 = open top; 22P1 = flat rack; 22T1 = tanque. Nota técnica: los carriers a veces usan el código de grupo antiguo (22GP/22G0) en sus API; el ERP debe almacenar ambos.

**Ciclo de vida, estados y subestados (validado):** GoFreight define seis etapas: "cotización y booking, documentación y compliance, coordinación con carrier, tracking y actualizaciones de hitos, gestión de excepciones, y entrega con reconciliación post-entrega". Estados típicos: Quote (Draft → Sent → Won/Lost/Expired) → Booking (confirmado) → In-Transit → Arrival → Delivery → Invoiced → Closed. **Matiz crítico (teoría vs realidad):** los estados de cotización en GoFreight son un enum fijo (8 estados), pero los **hitos de shipment son configurables por forwarder** — Magaya ofrece "más de 1.000 milestones configurables". No existe una lista canónica universal de estados; cada empresa adapta los suyos. Un ERP nuevo debe ofrecer un motor de estados configurable, no hardcodear.

**Relaciones (ERD conceptual):** un consol/máster → muchos houses (CargoWise "permite emparejar numerosos HBL con un único MBL"); un shipment → muchos contenedores; un contenedor → muchas pack lines (commodities); un job → muchas charge lines (buy/sell). Estas cardinalidades son el esqueleto del modelo de datos (Parte 7).

### PARTE 5. MÓDULOS DEL ERP EN PROFUNDIDAD

Para cada módulo: **objetivo · usuarios · entradas · procesamiento · reglas · integraciones · KPIs · problemas · oportunidades.**

**5.1 CRM (comercial).** *Objetivo:* gestionar leads, oportunidades, clientes y actividad comercial. *Usuarios:* comercial, dirección. *Entradas:* contactos, RFQs (Request for Quotation). *Procesamiento:* pipeline de oportunidades. *Reglas:* asignación, scoring. *KPIs:* tasa de conversión, CAC (Customer Acquisition Cost), LTV. *Problemas:* CRM desconectado de operaciones (datos duplicados entre quote y shipment — la "double-entry tax"). *Oportunidad:* CRM nativo al expediente para análisis de rentabilidad por cliente.

**5.2 Pricing (tarifarios/rate management/cotización).** *Objetivo:* gestionar tarifas de compra (buy) y venta (sell), contratos con carriers, y generar cotizaciones. *Entradas:* tarifas de carriers (en PDF, Excel, email — sin estandarizar; el gran dolor que Freightify ataca). *Procesamiento:* matching de tarifa + accesorios + margen. *Regla clave:* el margen es el spread buy/sell + accesorios. *KPIs:* tiempo de respuesta a cotización (Flexport Rate Explorer y Freightify reducen un proceso de "hasta 48 horas a dos minutos"), win rate. *Problema:* tarifas en formatos heterogéneos. *Oportunidad AI-native:* extracción automática de tarifas y cotización instantánea.

**5.3 Operaciones (booking, planning, tracking, documentación).** *Objetivo:* ejecutar el expediente. *Procesamiento:* reserva con carrier, generación documental, seguimiento de hitos. *Integraciones:* INTTRA, API de carriers, plataformas de visibilidad. *KPIs:* expedientes por operativo (productividad), exception rate.

**5.4 Transporte marítimo (FCL, LCL, consolidados, BL).** El **Bill of Lading (BL/conocimiento de embarque)** es contrato de transporte + recibo + título de propiedad. Distinción crucial:
- **Master BL (MBL):** lo emite la naviera (carrier) al NVOCC/transitario. Shipper y consignee son el NVOCC o sus agentes.
- **House BL (HBL):** lo emite el NVOCC/transitario al cliente final real. Shipper = exportador real, consignee = importador real.
- *Ejemplo real:* un NVOCC consolida carga de varios exportadores en Shanghái hacia Rotterdam. Reserva un contenedor con la naviera (recibe 1 MBL a su nombre) y emite HBLs individuales a cada cliente. **Riesgo operativo:** cualquier discrepancia entre MBL y HBL (descripción, puerto, consignee) provoca retención en puerto, penalizaciones o demoras. Por eso la precisión documental es crítica. Nota regulatoria: bajo ICS2, los forwarders/NVOCC que emiten su propio HBL pasaron a tener obligaciones de filing propias.

**5.5 Transporte aéreo (AWB).** El **Air Waybill (AWB)** es el equivalente aéreo del BL pero NO es título de propiedad (no negociable). **MAWB** (Master AWB, aerolínea→forwarder) y **HAWB** (House AWB, forwarder→cliente). Estándar de mensajería: CargoIMP (legacy) y Cargo-XML, evolucionando a ONE Record (IATA).

**5.6 Transporte terrestre (FTL, LTL, cross-docking).** Drayage (puerto→almacén), cartage, FTL/LTL. Integración con redes de carriers terrestres.

**5.7 Aduanas.** *Objetivo:* presentar declaraciones y gestionar regímenes. **DUA (Documento Único Administrativo)** es la declaración aduanera en España, presentada telemáticamente a la AEAT vía EDIFACT o formulario web. **Regímenes aduaneros (CAU — Código Aduanero de la Unión, Reglamento UE 952/2013):**

```
RÉGIMEN                    QUÉ HACE                                          EJEMPLO
──────────────────────────────────────────────────────────────────────────────────
Despacho a libre práctica  "Unioniza" mercancía no-UE (paga aranceles)      Import. para consumo UE
Tránsito (externo T1/      Circula sin pagar derechos (suspendido)          China→Barcelona→Milán (T1)
  interno T2)
Depósito aduanero          Almacena sin devengar derechos (ilimitado)        Stock pre-nacionalización
Zona franca                Enclave exento; permite transformación            Puerto de Barcelona ZF
Perfeccionamiento activo   Importa, transforma, reexporta sin aranceles      Madera Brasil→muebles→USA
Perfeccionamiento pasivo   Exporta UE, transforma fuera, reimporta           Reparación fuera UE
Importación temporal       Exención si se reexporta (~24 meses)              Ferias, muestras (ATA)
Destino especial/final     Exención condicionada a uso final                 Vigilado por aduana
Exportación                Salida definitiva (justifica exención IVA)        DAE confirma salida
```

**Sistemas gubernamentales (UE y mundo):**
- **ICS2** (Import Control System 2): sistema UE de información anticipada de carga (ENS — Entry Summary Declaration) para análisis de riesgo pre-llegada. Release 3 plenamente operativo desde el 1 de septiembre de 2025 para todos los modos (incluidos carretera y ferrocarril). ICS1 eliminado.
- **NCTS** (New Computerised Transit System): gestión del tránsito UE; Phase 6 (P6) interactúa con ICS2; emite MRN (Movement Reference Number) y TAD (Transit Accompanying Document).
- **AES** (Automated Export System): implementa exportación/salida del CAU. Se vincula con NCTS desde el 16 de mayo de 2026.
- **ACE** (Automated Commercial Environment): equivalente estadounidense (CBP). Incluye ISF (Importer Security Filing, "10+2") presentado ≥24h antes de cargar.
- **EORI** (Economic Operators Registration and Identification): identificación obligatoria del operador. **OEA/AEO** (Operador Económico Autorizado): estatus de confianza con menos controles; la UE tiene reconocimiento mutuo con USA, China, Japón, Suiza, Noruega y Andorra.

**5.8 Almacén (WMS).** Recepciones (warehouse receipts), inventario, picking, packing. Integración con dimensioner machines (Onboard Logistics reportó +300% de productividad de almacén con CargoWise).

**5.9 Facturación.** *Objetivo:* costes, ventas, márgenes, revenue recognition. *Regla clave:* cada charge line tiene buy (accrual/coste) y sell (venta); el margen por expediente es la suma de spreads. *Problema crítico:* fuga de márgenes (margin leakage) — accesorios no capturados, errores de facturación. Sobre un margen neto del 3%, un solo cargo de demurrage no capturado borra el beneficio del expediente.

**5.10 Finanzas.** Contabilidad, tesorería, riesgo de crédito (bad debt). El cumplimiento contable multipaís es, junto con aduanas, el segundo gran foso de CargoWise.

**5.11 Business Intelligence.** Reporting, dashboards, KPIs. Problema: "los datos viven en hojas de cálculo, exports de TMS, portales de carrier y sistemas contables que no se hablan". Oportunidad: BI nativo sobre la base única.

### PARTE 6. FLUJO REAL DE UNA OPERACIÓN PASO A PASO

```
1. CLIENTE SOLICITA COTIZACIÓN (RFQ por email)
   └─ ERP: se crea/identifica lead/cliente en CRM. IA extrae datos del email.
2. COMERCIAL CREA OPORTUNIDAD + COTIZACIÓN
   └─ ERP: módulo Pricing busca tarifa buy, añade margen → genera quote (Draft→Sent)
3. CLIENTE ACEPTA → SE GENERA EXPEDIENTE
   └─ ERP: quote (Won) se convierte en shipment "con todos los datos intactos" (sin re-tecleo)
4. RESERVA CON NAVIERA (booking)
   └─ ERP: envía booking (EDIFACT/API DCSA) → recibe confirmación + MBL
5. GESTIÓN DOCUMENTAL
   └─ ERP: genera HBL, comercial invoice, packing list, arrival notice, delivery order
6. ADUANAS
   └─ ERP: presenta DUA/AES (AEAT) + ENS (ICS2) → recibe MRN → levante
7. TRACKING
   └─ ERP: recibe eventos (GTIN, LOAD, DEPA, ARRI, DISC, GTOT) vía API tracking
8. ENTREGA (POD — Proof of Delivery)
   └─ ERP: marca hito de entrega; captura POD
9. FACTURACIÓN
   └─ ERP: genera factura de venta; concilia factura de proveedor (accrual vs real)
10. COBRO
   └─ ERP: tesorería registra cobro; cierra expediente; calcula margen final
```

El valor del ERP está en que cada paso **hereda los datos del anterior sin reintroducción**. La "double-entry tax" (re-teclear del quote al shipment) es la queja nº1 de los usuarios de Magaya según GoFreight.

### PARTE 7. MODELO DE DATOS (PostgreSQL / Neon)

**Esquema conceptual (ERD textual):**

```
organizations (multi-tenant root; RLS por organization_id)
  └─< users (RBAC: role)
  └─< parties (shipper/consignee/notify/carrier/agent — tabla polimórfica por type)
  └─< quotes ──< quote_lines
  └─< shipments (EXPEDIENTE — PK shipment_id, FK organization_id, customer_id)
        ├─ atributos: mode, incoterm, pol, pod, etd, eta, atd, ata, status
        ├─< bills (type: MBL|HBL|MAWB|HAWB; bl_number; parties FK)
        ├─< containers (container_no, iso_type 22G1…, seal_no)
        │     └─< pack_lines (commodity, hs_code, packages, gross_weight, cbm)
        ├─< charge_lines (charge_code, buy_amount, sell_amount, currency, accrual_flag)
        ├─< customs_declarations (dua_mrn, regime, status)
        └─< events (event_type, classifier PLN/EST/ACT, timestamp, location_unlocode)
  └─< invoices ──< invoice_lines (link a charge_lines)
```

**Principios:** claves primarias UUID o bigint; foreign keys con integridad referencial; normalización 3NF para datos maestros (parties, ports, carriers) pero desnormalización selectiva para reporting; **auditoría** (created_at, updated_at, created_by + tabla audit_log o triggers). En USA se exigen 7+ años de histórico aduanero — la retención es obligatoria. Postgres/Neon: usar Row-Level Security para aislamiento multi-tenant, JSONB para campos flexibles (metadatos de IA), e índices sobre shipment_id, bl_number, container_no.

**Taxonomía de eventos DCSA (a implementar en `events`):** tres tipos — **equipment, transport, shipment**. Clasificadores: **PLN** (planned), **EST** (estimated), **ACT** (actual). Códigos de evento de equipo: **GTIN** (gate in), **GTOT** (gate out), **LOAD**, **DISC** (discharge), **STUF** (stuffing), **STRP** (stripping), **PICK**, **DROP**. Eventos de transporte: **ARRI** (arrived), **DEPA** (departed). Ejemplo de hito compuesto: "Loaded on vessel at origin port" = EQUIPMENT + LOAD + LADEN + VESSEL + POL. La cadena documental DCSA es: **Booking → Shipping Instructions (SI) → Transport Document (Draft → Issued)**, con estados de booking RECEIVED → PENDING UPDATE → CONFIRMED → (PENDING AMENDMENT) → CANCELLED/REJECTED. Adoptar esta taxonomía estándar desde el día uno hace a Manann interoperable con project44, Vizion, Hapag-Lloyd, etc.

### PARTE 8. INTEGRACIONES

**Navieras:** INTTRA (plataforma de booking multi-carrier), API directas de carriers (Maersk, Hapag-Lloyd), y el estándar **DCSA** (Digital Container Shipping Association, fundada 2019; 9 de los 10 mayores carriers, ~70% del trade contenedor) que publica API REST estándar para Track & Trace, Booking 2.0, y eBL. DCSA NO es plataforma: publica estándares gratuitos.

**Aerolíneas:** CargoIMP (legacy EDI), Cargo-XML, y **ONE Record** de IATA — estándar de data sharing con "vista única del envío" sobre API web (JSON-LD). Según la Fact Sheet de IATA (diciembre 2025), es "el estándar preferente para compartir datos entre los actores del air cargo desde el 1 de enero de 2026... más de 200 empresas en proyectos piloto", con aerolíneas que representan el 72% del volumen global de AWB en camino de adoptarlo, más de 100 proveedores de IT y 10.000 forwarders alineados (Brendan Sullivan, Global Head of Cargo de IATA).

**Puertos (Port Community Systems):** Portic (Barcelona), Valenciaport PCS (Valencia, "best-in-class", 400+ empresas, integrado con INTTRA y GT Nexus). Gestionan manifiestos, declaraciones sumarias, VGM (Verified Gross Mass), órdenes de transporte terrestre.

**Aduanas:** AEAT (DUA vía EDIFACT/XML), ICS2/NCTS/AES (UE), ACE (USA).

**Tracking:** project44 (multimodal, 1.000+ carriers, enterprise, implementación en trimestres), FourKites, Vizion (API-first, JSON+webhooks, "pocos dólares por contenedor"), Terminal49.

**Formatos de datos (tabla):**

```
FORMATO        TIPO        USO TÍPICO                          ÉPOCA
──────────────────────────────────────────────────────────────────────
EDIFACT        EDI (UN)    IFTMIN (instrucción), IFTSTA (status),  Legacy dominante
                           IFTMCS (manifiesto), IFTMAN (aviso llegada)
ANSI X12       EDI (USA)   304 (shipping instr.), 310 (freight)    Legacy USA
CargoIMP       EDI aéreo   AWB, mensajería aérea                   Legacy aéreo
XML/Cargo-XML  XML         Declaraciones, e-AWB                    Transición
JSON           JSON        API REST modernas                       Moderno
DCSA           API REST    Ocean T&T, Booking                      Moderno (2019+)
ONE Record     API/JSON-LD Air cargo data sharing                 Moderno (2026 estándar)
```

Para Manann: ser **API/JSON-native** (DCSA, ONE Record, project44) desde el inicio, con adaptadores EDIFACT solo cuando un carrier lo exija. Esto evita la deuda técnica del legacy.

### PARTE 9. KPIs Y GESTIÓN

```
KPI                          DEFINICIÓN                                  BENCHMARK
──────────────────────────────────────────────────────────────────────────────────
Margen bruto/expedición      sell − buy (spread + accesorios)            10-20% (antes overhead)
Margen neto                  tras todos los costes operativos            3-4% típico
Gross profit per TEU         beneficio bruto por contenedor              300-600 USD/TEU objetivo
Margen por cliente           ingresos − costes directos − overhead       Identifica clientes no rentables
OTIF                         On Time In Full (entregas correctas)        Servicio
Fill rate                    % capacidad utilizada (consolidación)       LCL: +20-30% margen consolidando
Lead time                    tiempo origen→destino                       Operativo
Coste operativo              SG&A                                        70% o menos de ingresos
Productividad                expedientes por operativo                   Eficiencia
Exception rate               % envíos con incidencia                     Calidad
```

**Quién mira qué:**
- **CEO:** crecimiento de ingresos, cuota, margen neto, expansión geográfica.
- **CFO:** margen bruto/neto, fuga de márgenes, riesgo de crédito (bad debt), tesorería, DSO.
- **COO/Director Operaciones:** productividad (expedientes/operativo), OTIF, exception rate, lead time, on-time del carrier.

McKinsey confirma márgenes EBIT del 1-11% con ROIC típicamente >20% por el modelo asset-light. **Interpretación clave:** como el flete es coste pasante, el apalancamiento operativo (más expedientes con el mismo equipo, vía automatización) y el control de fugas mueven más el beneficio que subir precios.

### PARTE 10. PROBLEMAS REALES DEL SECTOR

1. **Software legacy:** arquitecturas fuertemente acopladas, difíciles de evolucionar. Argocore: "diseñados para proceso lineal, registro de transacciones e integridad financiera".
2. **Dependencia de Excel:** tarifas, KPIs y reconciliaciones en hojas de cálculo desconectadas.
3. **Datos duplicados:** la "double-entry tax" (re-teclear del quote al shipment) es la queja nº1 de usuarios de Magaya.
4. **Falta de trazabilidad:** datos en silos (TMS, portales, contabilidad que no se hablan).
5. **Errores operativos y facturación incorrecta:** sobre margen del 3%, un error borra el beneficio.
6. **Retrasos documentales:** discrepancias MBL/HBL → retenciones en puerto.
7. **Integraciones deficientes:** ICS2 rechaza automáticamente declaraciones con descripciones insuficientes ("stop words").
8. **Coste y opacidad del software:** la controversia CargoWise Value Packs (subidas 20-50%, ver Parte 11).

### PARTE 11. BENCHMARK MUNDIAL

**Incumbentes / ERP completos:**

**CargoWise (WiseTech Global).** *Arquitectura:* base de datos global única, cloud, CargoWise Next es la 4ª generación. *Funcionalidades:* forwarding, customs, warehousing, transporte, e-commerce, contabilidad. *Cuota:* según el *Journal of Commerce* (diciembre 2025), "CargoWise controla aproximadamente el 70% del mercado de software de forwarding, y WiseTech Global tiene una capitalización de 16.000 M USD"; usado por 24 de los 25 mayores 3PL. *Fortalezas:* cobertura aduanera multipaís (20+ países), integración contable, base única, foso de switching enorme (<1% de attrition según Prompt Global). *Debilidades:* complejidad ("usamos el 20% de las funciones"), implementación de 6-12+ meses, "feature bloat", y la **crisis de precios de 2025-2026**: el modelo Value Packs (per-transaction, ~19,95 USD por contenedor de importación full, ~9,95 USD por entrada de aduana standalone) provocó "inquietud sin precedentes" (The Loadstar); un forwarder dijo a JOC que esperaba "un aumento de coste del 25 al 35%". El CEO Zubin Appoo admitió que "sabíamos que sería disruptivo". WiseTech extendió además su alcance al shipper completando el **4 de agosto de 2025 la adquisición de e2open** a 3,30 USD/acción, valor de empresa de 2.100 M USD (3.250 M AUD), financiada íntegramente con deuda — su mayor adquisición. *Posicionamiento:* enterprise, mission-critical. *Modelo de negocio:* per-transaction (antes seat+transaction licence, STL).

**Magaya.** *Arquitectura:* cloud, fuerte en Américas. *Diferencial:* combina forwarding + WMS (warehouse) en un entorno. *Fortalezas:* mid-market, soporte telefónico 24/7/365, fácil integración. *Debilidades:* UX percibida como "anticuada", double-entry tax.

**BluJay Solutions (ahora e2open).** Integrada en e2open, ahora propiedad de WiseTech (ver arriba), lo que consolida aún más el mercado.

**Descartes Systems Group.** *Arquitectura:* ecosistema data-rich, red logística cloud (Global Logistics Network). *Fortalezas:* compliance, denied party screening, HTS lookup, herencia Aljex en brokerage. *Debilidades:* no es un FMS completo (a menudo requiere herramientas adicionales).

**Riege Software (Scope).** *Arquitectura:* cloud Y on-premise. *Datos:* ~22M€ ingresos, 120 empleados, CEO Christian Riege, fundada 1985. *Fortalezas:* forwarding + customs en Europa (DACH), filings ATLAS/AES/NCTS nativos, hasta 50% de ahorro en tiempo de declaraciones, clientes como Lufthansa Cargo, DB Schenker. Opera en 63 países (pero sin integración local completa en todos). *Debilidades:* menos conocida fuera de Europa, documentación en inglés más escasa.

**Softlink Global (Logi-Sys).** *Datos:* ~15M USD ingresos, 300 empleados, CEO Amit Maheshwari, fundada 2000. *Fortalezas:* fuerte en mercados emergentes (India, Oriente Medio), embebe requisitos regulatorios locales.

**Jugadores modernos / AI-native (críticos para la tesis Manann):**

**Flexport.** *Modelo:* digital freight forwarder con plataforma propia; el flete es ~75% de ingresos. Según Sacra, los ingresos hicieron pico en ~4.100 M USD en 2022, cayeron a 1.600 M en 2023 y se recuperaron a ~2.100 M en 2024 (+30% interanual). Fue "técnicamente rentable" en 2025 solo gracias a una ganancia puntual de ~250 M USD por la venta del activo Convoy (comprado por ~16 M); apunta a rentabilidad orgánica en 2026. *Estrategia 2025-2026:* de "capa de visibilidad" a "motor de automatización y ejecución"; Customs Technology Suite, Rate Explorer ("estilo aerolínea"), 20+ herramientas AI, feature "Intelligence" (preguntas en lenguaje natural). *Debilidad:* su diferenciación front-end puede no ser un foso durable.

**AI bolt-on / agentes (el "enemigo" según la tesis Manann):**
- **Raft.ai:** automatización de finanzas logísticas, AP matching, agentes de IA "desplegados dentro de las operaciones".
- **Expedock:** extracción documental (90%+ accuracy, 10.000+ docs/mes), agentes "FREYA".
- **Vooma:** agentes AI multicanal (email/texto/voz) para freight brokers. Levantó 16,6 M USD totales: 13 M de Serie A liderada por Craft Ventures más 3,6 M de seed liderada por Index Ventures (anunciado el 2 de diciembre de 2024). El cofundador Jesse Buckingham declaró que introducen "IA que encaja de forma natural en los sistemas, flujos de trabajo y canales de comunicación existentes" — es decir, bolt-on sobre legacy por diseño.
- **HappyRobot:** agentes de voz/IA para supply chain. Cerró una **Serie B de 44 M USD liderada por Base10 Partners** (con a16z, YC, Tokio Marine y World Innovation Lab) a una valoración de ~500 M USD el 3 de septiembre de 2025; financiación total ~62 M USD; 70+ clientes incluyendo DHL, Ryder y Werner; CEO y cofundador Pablo Palafox (fundadores españoles). Se integra explícitamente "sobre TMS/ERP/CRM existentes".
- **Argocore (Cargonautix):** rival AI-native que sí comparte la tesis Manann ("reemplazo, no add-on permanente"); "los sistemas legacy son estructuralmente limitados".

**Plataformas SaaS modernas:** Shipthis (AI-driven, white-label, completo), GoFreight (UX moderna, mejor rating, pricing transparente), Freightify (rate management, $12M Sequoia, "Expedia del ocean freight"), GoComet (AI-native, predictive ETA), Cargoflip.

**Síntesis del benchmark (ASCII):**

```
                  FOSO ADUANERO  UX MODERNA  IA NATIVA  PRECIO TRANSPARENTE
CargoWise              ★★★★★        ★★          ★          ★
Descartes              ★★★★★        ★★          ★★         ★★
Riege/Scope            ★★★★         ★★★         ★★         ★★★
Magaya                 ★★★          ★★          ★★         ★★★
GoFreight              ★★           ★★★★        ★★★        ★★★★
Flexport               ★★★          ★★★★        ★★★        ★★★
AI bolt-ons (Raft…)    ✗            ★★★★        ★★★★       ★★★
Argocore/Cargonautix   ?            ★★★★        ★★★★★      ?
MANANN (objetivo)      [demo]       ★★★★★       ★★★★★      ★★★★★
```

### PARTE 12. CÓMO DISEÑAR EL ERP TRANSITARIO DEFINITIVO EN 2026 (ADAPTADO A MANANN)

**Contexto Manann:** solo founder, coste cero (free-tier), demo-first, stack Next.js/Vercel/Neon/shadcn, tesis anti-"IA periférica".

**Qué significa AI-native (no bolt-on) en un ERP transitario:**
- **Extracción documental como entrada del core:** un email/PDF (BL, factura, packing list) entra → la IA extrae los 24+ campos → **puebla el expediente directamente**, no un widget aparte. La IA es la capa de ingreso de datos, no un asistente lateral.
- **Cotización automática:** la IA lee el RFQ en lenguaje natural y genera la quote contra el tarifario.
- **Expedientes auto-gestionados:** agentes que persiguen hitos faltantes (ETA), detectan excepciones y proponen acciones — pero el dato vive en el core, no en un sistema externo.
- **Decisión embebida en el workflow:** a diferencia de los bolt-ons que "leen emails y navegan portales" por fuera, en Manann la inteligencia está en el motor de workflow sobre la base única. Esto es precisamente lo que Appoo (WiseTech) admite que los rivales no pueden hacer sin el código fuente: "necesitan que WiseTech construya esa IA porque tenemos acceso al código fuente y podemos construir IA en el motor de workflow". Manann, al ser nuevo, tiene esa ventaja por diseño.

**Arquitectura propuesta (realista para solo founder):**
```
Next.js (App Router) + shadcn/ui    → frontend + portales (operativo/cliente)
Vercel serverless functions          → API + lógica + orquestación IA
Neon Postgres (RLS multi-tenant)     → base única; JSONB para metadatos IA
LLM API (extracción/cotización)      → capa IA nativa
Webhooks + cron (Vercel)             → eventos de dominio (emula event-driven)
Adaptadores DCSA/ONE Record/project44 → integraciones API-first
```

**Módulos a priorizar (demo-first):** (1) ingreso documental IA → expediente; (2) expediente con estados configurables; (3) cotización IA; (4) tracking con taxonomía DCSA; (5) márgenes por expediente. Customs y contabilidad multipaís se **simulan** en la demo (no se construyen de verdad: requieren capital y equipo).

**Roadmap realista para un solo founder:**
```
FASE 0 (demo)   Expediente + extracción IA + cotización + tracking (mock data). Coste 0.
FASE 1 (piloto) 1-2 transitarios reales; integrar 1 API tracking real (Vizion).
FASE 2 (nicho)  Vertical específico (p.ej. LCL España-LatAm); contabilidad básica.
FASE 3 (escala) Requiere capital/equipo: aduanas reales (AEAT/ICS2), multipaís.
```

**Ventajas competitivas honestas:**
- *Realista para solo founder:* UX 10x superior, IA nativa, precio transparente, velocidad de demo, interoperabilidad estándar (DCSA/ONE Record).
- *Requiere capital/equipo (ser honesto):* cobertura aduanera multipaís (el foso de CargoWise = 20+ años de lógica), integración contable certificada por país, red global de agentes, soporte 24/7, retención de 7 años de histórico aduanero.

**Estrategia para flanquear (no atacar de frente) a CargoWise:** no replicar su "zoo" (Benjamin Riege). En su lugar: (1) **explotar la rebelión de precios** — los forwarders pasaron "de frustración pasiva a evaluación activa"; (2) **ganar por simplicidad y transparencia** (como hace GoFreight); (3) **ser AI-native real, no bolt-on** (diferenciarse de Raft/Expedock/HappyRobot que viven sobre legacy); (4) **empezar en un nicho geográfico/modal** donde el foso aduanero importe menos (España LCL, e-commerce). El honest truth: ningún solo founder reemplaza CargoWise; el objetivo es construir una demo creíble y un wedge en un nicho, no desplazar al líder.

### PARTE 13. MASTERCLASS FINAL (síntesis ejecutiva)

**¿Cómo funciona realmente un ERP transitario?** Es una base de datos única donde el **expediente** hereda datos a través de un flujo de eventos (quote→booking→tránsito→aduana→entrega→factura→cobro), capturando en cada charge line el spread buy/sell. El ERP no "transporta": registra, coordina y, sobre todo, **protege el margen** evitando fugas y re-tecleo.

**Componentes críticos:** (1) el expediente y su modelo de datos; (2) la conectividad aduanera multipaís; (3) la integración contable; (4) la captura de cada cargo facturable; (5) la trazabilidad de eventos.

**Qué distingue un ERP mediocre de uno líder:** no las funciones (todos las tienen), sino la **base de datos única** (sin silos ni double-entry), la **profundidad del foso aduanero**, la **fiabilidad** y, crecientemente, si la **IA es nativa del core o un añadido**. Un mediocre fuerza re-tecleo y vive en Excel; un líder unifica y automatiza.

**Dónde está la disrupción:** la arquitectura. Argocore lo articula: los legacy "fueron construidos para registrar transacciones, no para moldear resultados". La oportunidad es un core AI-native donde la inteligencia esté embebida en el motor de workflow, no atornillada encima.

**Qué debería construir Manann:** un ERP de demostración donde la **IA sea la capa de ingreso y orquestación del core** (extracción documental → expediente auto-poblado → cotización → eventos → márgenes), con UX excepcional, precio transparente e interoperabilidad estándar (DCSA/ONE Record), enfocado en un nicho donde el foso aduanero no sea decisivo. La tesis de Manann ("el enemigo es la IA periférica sobre legacy") es estratégicamente correcta y está validada por el mercado de 2026: los bolt-ons proliferan precisamente porque no pueden tocar el core de los incumbentes — y ahí, en un core nuevo y limpio, está la ventaja estructural que un solo founder puede demostrar aunque no pueda (todavía) escalar.

---

## Recommendations

1. **Construir la demo alrededor del expediente y la extracción IA primero** (Fase 0, coste cero). El "momento mágico" que convence a un transitario real es ver un PDF de BL convertirse automáticamente en un expediente poblado con sus 24+ campos. Benchmark de éxito: demo creíble ante 3 transitarios reales.
2. **Adoptar taxonomías estándar desde el día uno:** DCSA (eventos ocean: GTIN/LOAD/DEPA/ARRI/DISC/GTOT, clasificadores PLN/EST/ACT), ISO 6346 (tipos de contenedor), UN/LOCODE (puertos), HS codes. Esto da interoperabilidad gratis y credibilidad técnica.
3. **No construir aduanas ni contabilidad multipaís reales en la demo** — simularlas. Son el foso de CargoWise y requieren capital/equipo (umbral que cambia la recomendación: solo abordarlas tras financiación en Fase 3).
4. **Explotar la ventana de precios de CargoWise ahora:** posicionar Manann con precio transparente y predecible (lo opuesto a Value Packs). Umbral que dispararía aceleración: si CargoWise revierte los Value Packs, el ángulo de precio pierde fuerza y habría que reforzar el de IA nativa.
5. **Diferenciarse explícitamente de los bolt-ons** (Raft, Expedock, HappyRobot, Vooma) en el mensaje: ellos viven sobre legacy; Manann es core nuevo con IA nativa. Esta es la tesis y debe ser el pitch.
6. **Elegir un nicho de entrada** (p.ej. LCL/grupaje España↔LatAm, o e-commerce cross-border) donde el foso aduanero multipaís importe menos y la UX/IA importen más.

## Caveats

- **Especulación de mercado:** las afirmaciones sobre la "ventana competitiva" abierta por los CargoWise Value Packs reflejan reportajes de The Loadstar/Journal of Commerce de 2025-2026 y opiniones de competidores (Riege, Magaya, Prompt Global) — son interesados. El switching real sigue siendo "cauto"; nadie ha desplazado a CargoWise.
- **Cifras de margen:** los rangos (10-20% bruto, 3-4% neto, 300-600 USD/TEU) provienen de GoFreight, McKinsey e IBISWorld y varían enormemente por modo, lane y tamaño. No son auditados universalmente; algunos modelos de blogs (StartupModelHub, FinancialModelsLab) citan cifras inconsistentes (p.ej. "81% gross margin") que parecen erróneas y no deben tomarse como benchmark del sector.
- **Campos internos de CargoWise:** WiseTech no publica diccionario de datos público; los nombres de campos/prefijo "S" provienen de partners de integración y guías de certificación (confianza media-alta), no de documentación oficial.
- **Códigos DCSA:** alta confianza (fuente DCSA + Vizion + Hapag-Lloyd), pero los estados de shipment en ERPs reales son **configurables**, no enums universales. No presentar ninguna lista de estados como canónica.
- **Cifras de Flexport:** el dato de ingresos 2025 proviene de Sacra y refleja recuperación desde 2.100 M USD en 2024; la "rentabilidad" de 2025 fue puntual (venta de Convoy), no orgánica. Distintas fuentes citan cifras de ingresos brutos superiores que no están corroboradas y se han descartado.
- **Viabilidad solo-founder:** la honestidad estratégica es central — un ERP transitario completo y competitivo requiere capital y equipo. Manann es viable como demo y wedge de nicho, no como reemplazo de incumbentes a corto plazo.
- **Normativa en movimiento:** ICS2 R3, NCTS-P6 y el vínculo AES-NCTS (16 mayo 2026) tienen derogaciones temporales por país; verificar el estado vigente por Estado miembro antes de cualquier afirmación operativa.