# Transferencia de Maestría: La Máquina del Freight Forwarding y los ERP que la Sirven
### Consejo privado de expertos → al fundador de Manann

*Documento II. Asume leído el documento funcional previo (módulos, expediente, DUA/ICS2/NCTS/AES, DCSA/ONE Record, benchmark CargoWise/Magaya/Riege/Descartes/Flexport, bolt-ons Raft/Expedock/Vooma/HappyRobot). Aquí no se repite la función: se enseña la industria, el dinero, el poder y el pensamiento de fundador. Niveles de confianza: [Alta], [Media], [Baja].*

---

## NIVEL 1 — EL MAPA COMPLETO

**Qué es realmente un transitario.** Olvida la definición de manual ("intermediario que organiza el transporte"). Un transitario (freight forwarder) es, económicamente, un **árbitro de dos asimetrías**: la asimetría de información (sabe qué naviera tiene hueco, a qué precio, con qué fiabilidad, qué aduana pedirá qué papel) y la asimetría de capacidad (compra espacio al por mayor y lo revende fraccionado). FIATA lo llama "el arquitecto del transporte". No posee buques ni aviones: es asset-light. Su materia prima es el conocimiento y su producto es la *certeza* de que la caja llegará y los papeles cuadrarán. [Alta]

**Cómo nació.** Los primeros forwarders fueron posaderos londinenses que reexpedían el equipaje de sus huéspedes a principios del siglo XIX. La primera empresa formal de la que hay registro es **Thomas Meadows and Company Limited**, Londres, **1836**, nacida al calor del ferrocarril fiable y los barcos de vapor que dispararon el comercio Europa–Norteamérica. Desde el principio, el núcleo del oficio fue lo mismo que hoy: **documentación y aduanas**, no mover la caja. [Alta]

**El salto que lo creó todo: el contenedor.** El 26 de abril de 1956, **Malcom McLean** —camionero de Carolina del Norte, no naviero— hizo zarpar el *Ideal-X* (petrolero T-2 reconvertido) de Newark a Houston con 58 contenedores. La carga manual de un buque costaba entonces 5,86 $/tonelada; con contenedor, 16 centavos/tonelada: una reducción de ~36×. [Alta] El contenedor estandarizó la unidad física del comercio mundial y, al hacerlo, **mercantilizó el flete marítimo** y empujó el valor hacia quien organiza la complejidad: el transitario.

**Cómo evolucionó el poder (1956→2026).** Tres olas: (1) desregulación y globalización post-OMC que multiplicó los flujos; (2) carrera de los megabuques y alianzas navieras que concentró el poder en las navieras; (3) consolidación de los forwarders.

El reparto de poder cambió radicalmente con los **megabuques y las alianzas**. En febrero de 2025 saltó por los aires el mapa: terminó la **alianza 2M** (Maersk+MSC); Maersk y Hapag-Lloyd lanzaron **Gemini Cooperation** (~290 buques, 3,4M TEU, Maersk 60%/Hapag 40%, modelo hub-and-spoke con objetivo de +90% de fiabilidad); los restos de THE Alliance (ONE, HMM, Yang Ming) formaron **Premier Alliance**; **Ocean Alliance** (CMA CGM, COSCO, OOCL, Evergreen) siguió siendo la mayor por capacidad y extendió su acuerdo hasta 2032; y **MSC**, primera naviera de la historia en superar la barrera de los 900 portacontenedores (Alphaliner cifra ~980 buques activos, >7,2M TEU y ~21,4% de la cuota mundial de flota, según gCaptain), optó por operar en solitario. [Alta]

**Los ciclos de tarifa: la lección de humildad.** El **Drewry World Container Index** tocó techo en **10.377 $/FEU en septiembre de 2021** (pico COVID) y se desplomó hasta **~1.479 $ en septiembre de 2023** — Drewry lo confirmó textualmente: *"The latest Drewry WCI composite index of $1,479.48 per 40-foot container is now 86% below the peak of $10,377 reached in September 2021."* [Alta] Quien construyó su negocio sobre los márgenes de 2021 murió en 2023. Esto importa para Manann: **el cliente transitario vive en una montaña rusa de tarifas y su software debe sobrevivir a ambos extremos.**

**La consolidación 2000-2026.** El movimiento más grande de la historia del sector: **DSV completó la compra de DB Schenker el 30 de abril de 2025 por 14.300 M€** (~106.700 M DKK), creando un grupo de ~41.600 M€ de ingresos y ~160.000 empleados; DSV duplicó su tamaño. [Alta] DSV ya había digerido antes a UTI, Panalpina y Agility. **Kuehne+Nagel** cerró 2025 como nº1 mundial en volumen marítimo y aéreo con 24.500 M CHF de ingresos netos y 4,3M TEU marítimos. [Alta] La **estrategia integrator de Maersk** (vertical: naviera + terminales + logística contractual + aduanas) busca llevar Logistics & Services hacia el 50% de ingresos para suavizar la ciclicidad brutal del flete; en 2024 el margen EBIT de ese segmento llegó al 3,6%, aún lejos del objetivo de >6%. [Alta]

**Mapa de quién gana, quién pierde, quién manda.** Las navieras tienen el activo (el buque) y, en picos, el poder de precio; pero son presa de su propia ciclicidad. Los forwarders no tienen activo pero tienen al **cliente** y la **información**: por eso las navieras (Maersk, CMA CGM) intentan integrarse hacia adelante y "comerse" al forwarder. Los cargadores (shippers) ganan cuando hay sobrecapacidad y sufren cuando no. El **demurrage/detention** (recargos por exceso de estancia del contenedor) es donde el poder se convierte en dinero: según la propia Federal Maritime Commission, *"the nine carriers have collected roughly $15.4 billion in D&D charges between April 1, 2020, and March 31, 2025"* — esas nueve son CMA CGM, COSCO, Evergreen, Hapag-Lloyd, HMM, Maersk, MSC, ONE y Yang Ming, y la cifra cubre solo los tráficos de EE.UU. [Alta]

**¿Qué significa esto para Manann y su founder?** Tu cliente no es la naviera ni el cargador: es el **transitario pequeño/mediano**, el árbitro de información que está siendo aplastado entre navieras que se integran y un CargoWise que le sube el precio. Su dolor es estructural y permanente. Construyes para el actor más presionado de la cadena — y eso es una buena posición de ataque, porque busca aliados.

---

## NIVEL 2 — EL DINERO

**Cómo gana dinero un transitario.** No con una fuente, sino con un mosaico:
1. **Spread buy/sell** (margen entre tarifa de compra a la naviera y de venta al cliente). El núcleo, pero el más mercantilizado.
2. **Accesorios** (THC, BAF/CAF, ISPS, documentación, T3 portuaria): aquí vive gran parte del margen real.
3. **Consolidación LCL** (grupaje): comprar un contenedor completo y revenderlo por m³/tonelada a varios clientes; el beneficio de consolidación se lo queda el forwarder.
4. **Customs brokerage** (despacho aduanero): alto margen, pegajoso, basado en conocimiento.
5. **Diferencias de cambio**, financiación al cliente (adelantar derechos/IVA), seguro de carga con comisión, almacenaje, y gestión de demurrage/detention (recuperar del cliente, a veces con margen).

**Márgenes reales.** El margen bruto por envío suele ser del 10–20% antes de overhead. El margen **neto** del sector es de los más finos del mundo de servicios: ~3–4% (mediana ~2,9% según datos de IBISWorld citados por GoFreight). McKinsey lo explica con precisión: *"Between 62 and 85 percent of revenues are channeled into purchasing carrier capacity… forwarders typically convert 20 to 30 percent to earnings before interest and taxes (EBIT), achieving EBIT margins of 1 to 11 percent—with return on invested capital (ROIC) typically above 20 percent, given the asset-light business model."* [Alta] Los gigantes (DSV, K+N) llegan al 5–8% neto.

**Cómo pierde dinero.** Fugas de margen (accesorios no refacturados), errores documentales, bad debt (impago del cliente), multas aduaneras, demurrage no recuperado, garantías aduaneras ejecutadas. **Sobre un margen neto del 3%, un solo demurrage no refacturado o un error de cambio de unos cientos de euros borra el beneficio de todo el expediente.** La disciplina de margen vive en operaciones y contabilidad, no en la cotización.

**KPIs que usa el private equity al comprar transitarias.** Esto es oro para entender al comprador real del ERP. Los buyers miran: **gross profit per file/per TEU**, **conversion ratio GP→EBITDA** (McKinsey: 20–30% GP→EBIT), **EBITDA per employee**, churn de clientes, y sobre todo **concentración de cartera**. Regla común (DealStream): si un solo cargador supera el 20% del gross income, se aplica un *haircut* a la valoración (0,1x–0,3x menos por cada cliente sobre el umbral); una cartera sin cliente >10% obtiene el múltiplo alto. **Múltiplos:** según Corporate Finance in Europe, las forwarders pequeñas (hasta 10M€ ingresos / 1,5M€ gross profit) se venden por **3–5× EBITDA**; las mayores por 5–7×; *"valuations with EBITDA multiples of 7 or above are almost non existing in the market of forwarding companies below 20M Euro valuation."* [Media] En el extremo premium, los grandes deals recientes han cerrado a doble dígito: bpost compró Staci a ~12,0× EV/EBITDA; GXO compró Wincanton a ~11,9× (MCF Corporate Finance, 2025). [Media]

**Descomposición de un expediente real: FCL Shanghái → Barcelona.** Sigamos cada euro (cifras ilustrativas pero realistas en mercado normalizado 2025-2026, no pico COVID; flete base orientado al WCI Shanghái–Génova del orden de 2.000–4.000 $/FEU según semana [Media]):

```
EXPEDIENTE FCL 40'HC  Shanghái(CNSHA) → Barcelona(ESBCN)  | EUR, tipo 1 USD=0,92 EUR
─────────────────────────────────────────────────────────────────────────
LÍNEA DE CARGO          VENTA(cliente)   COMPRA(prov.)   MARGEN   NOTA
─────────────────────────────────────────────────────────────────────────
Flete base marítimo        2.760           2.640          120     spread fino
BAF (bunker)                 460             460            0      pass-through
THC origen (Shanghái)        180             165           15
THC destino (Barcelona)      210             190           20
ISPS (seguridad)              22              18            4
Documentación / B/L           55              30           25      alto margen %
Despacho aduanero import     120              45           75      conocimiento
T3 / tasa portuaria           38              38            0      pass-through
Transporte terrestre BCN     390             340           50      última milla
Seguro de carga (comisión)    90              75           15      comisión 0,3%
─────────────────────────────────────────────────────────────────────────
TOTAL EXPEDIENTE           4.325           4.001          324      GP ≈ 7,5%
─────────────────────────────────────────────────────────────────────────
```

El **gross profit del expediente es ~324 €**. Ahora observa la fragilidad:
- Si el operativo **olvida refacturar el THC destino** (210 €), el GP cae a 114 € (−65%).
- Si aplica **mal el tipo de cambio** del flete (compra en USD, vende en EUR) y el USD se mueve un 3%, son ~80 € que desaparecen → casi un cuarto del beneficio.
- Si el contenedor incurre en **3 días de demurrage** a ~150 €/día y no se repercute, son 450 € → **el expediente entero pasa a pérdida**.

**Accruals vs. factura real.** Al cerrar el expediente, el ERP **provisiona** (accrual) los costes esperados de proveedor (4.001 €) aunque las facturas reales lleguen semanas después. Cuando llega la factura de la naviera y es de 4.080 € (sobrecoste de 79 € por un recargo no previsto), aparece un **WIP/diferencia accrual vs. factura** que come margen silenciosamente. El asiento contable final reconoce ingreso (4.325 €), coste (4.080 € real), y un margen de 245 € — no los 324 € que el comercial creyó vender.

**¿Qué significa esto para Manann?** El valor de tu ERP no está en la pantalla bonita de tracking. Está en el **motor de cargos que no deja escapar un solo accesorio** y en la **conciliación accrual-vs-factura** que detecta los 79 € de sobrecoste. Si tu producto recupera incluso un 1% de margen fugado, sobre un neto del 3% eso es un **33% más de beneficio** para el cliente. Ese es tu pitch financiero, no "UX moderna".

---

## NIVEL 3 — EL FLUJO DE INFORMACIÓN

**Dónde nace cada dato (cadena real):**
```
SHIPPER ──► commercial invoice + packing list (valor, HS, peso, bultos)
NAVIERA ──► booking confirmation, B/L (MBL), eventos de buque
FORWARDER ► HBL, cotización, expediente, instrucciones
ADUANA ──► levante / MRN (Movement Reference Number), DUA liquidado
TERMINAL ► gate-in/gate-out, descarga, disponibilidad (gate events)
TRANSPORTISTA ► POD (proof of delivery), CMR firmado
```

**Quién modifica, quién consume.** El dato nace en un actor, se re-teclea en el ERP del forwarder, se transforma en documentos (HBL desde el MBL), se transmite a aduana, y vuelve como estado. El medio dominante de transmisión **sigue siendo el email con PDF adjunto** — no API. Las navieras empujan a digital con palo: Maersk introdujo un *"Manual Booking Amendment Fee"* de 50 $ (y 75 $ para enmiendas de B/L) tras recibir, según declaró a Supply Chain Dive, *"about 6,000 emails and phone calls every week from a significant number of shippers related to manual amendments."* [Media]

**Mapa de datos por criticidad:**
- **Crítica** (detiene la operación si falta): número de booking, HS code, B/L, levante aduanero. Sin esto, la caja no se mueve.
- **Redundante** (se re-teclea N veces): los datos de la commercial invoice se reintroducen del email al ERP, del ERP al DUA, del DUA a la factura. La industria del freight tech estima que la automatización de extracción documental reduce la entrada manual hasta un ~80% en flujos concretos. [Media]
- **Regulatoria**: ENS/ICS2, manifiestos, DUA, ISF (EE.UU.).
- **Comercial**: tarifas, cotizaciones, contratos.
- **Operativa**: eventos, hitos, excepciones.

**Single source of truth vs. realidad.** La teoría dice "un dato, una fuente". La realidad es **N versiones del mismo dato en N sistemas**: el peso está en el email del shipper, en el ERP del forwarder, en el portal de la naviera y en el DUA — y los cuatro discrepan. El operativo pasa el día reconciliando versiones.

**¿Qué significa esto para Manann?** El campo de batalla real es **el email/PDF → expediente poblado**. Si tu IA extrae la commercial invoice y puebla el expediente con validación humana (tu patrón "lighthouse-amber"), atacas exactamente el 80% redundante. No compites en "tener IA": compites en eliminar el re-tecleo, que es el dolor diario tangible.

---

## NIVEL 4 — EL ADN DEL ERP

**Por qué existe.** El ERP transitario es el **sistema nervioso central**: une el flujo físico (operaciones) con el flujo de dinero (cargos→facturas→contabilidad) y el flujo regulatorio (aduanas). No es "software de gestión": es el libro mayor del negocio + el motor de compliance.

**Thought experiment: desaparece mañana.** ¿Qué colapsa primero?
- **Colapsa de inmediato:** facturación (¿quién emite y concilia miles de líneas de cargo?), cierre contable multi-país, compliance documental aduanero, consolidación financiera de grupo, auditoría. Imposible con Excel.
- **Sobrevive con Excel y teléfono (mal, pero sobrevive):** booking, tracking manual, cotización simple, un par de expedientes al día.
- **Directamente imposible sin sistema:** contabilidad multi-divisa de cientos de expedientes, accruals que se reversan, period close mensual auditable, reporting de grupo.

**Lección.** El valor real **no está en las pantallas** (booking, tracking — esos se pueden hacer a mano). Está en el **motor de cargos** (que nada se escape) y en el **compliance** (que el DUA cuadre, que la contabilidad sea auditable). El 80% del valor vive en el 20% aburrido.

**¿Qué significa esto para Manann?** Si construyes primero el dashboard de tracking y dejas el motor de cargos para después, construyes lo prescindible y dejas lo imprescindible. **Construye el motor de cargos y el doble vínculo operativo-contable primero.** Es lo que no se puede sustituir con Excel.

---

## NIVEL 5 — DISECCIÓN DEL ERP (ángulo operativo y de riesgo)

Por módulo: usuarios reales, sus incentivos, riesgo si falla.

| Módulo | Usuario real | Qué le importa DE VERDAD | Riesgo si falla |
|---|---|---|---|
| **CRM** | Comercial de calle | Su comisión, no perder al cliente | Pérdida de pipeline, no operacional |
| **Pricing** | Pricing analyst | Cotizar rápido sin perder margen | Cotización mal → margen negativo |
| **Ops marítimo/aéreo** | Operativo (30-50 exp/día) | Velocidad, teclado, no re-teclear | La caja no se mueve / demurrage |
| **Aduanas** | Representante aduanero | Que el DUA no sea rechazado | Multa, retención de mercancía, levante bloqueado |
| **Almacén (WMS)** | Jefe de almacén | Inventario cuadrado | Pérdida física de carga |
| **Facturación** | Billing clerk | Que cada cargo llegue a factura | Fuga de margen directa |
| **Finanzas** | Controller/CFO | Cierre mensual, auditoría, cash | Cierre imposible, cuentas no auditables |
| **BI** | Dirección | GP por cliente/lane/empleado | Decisiones a ciegas |

**Coste de implementación.** CargoWise enterprise: rangos de **500–2.000 $/usuario/mes + 50.000–100.000 $+** de implementación; proyectos de 6–12 meses. Mid-market (Magaya, Logitude): 100–400 $/usuario/mes. [Media]

**Regla de incentivos clave:** quien compra (CFO/dirección) no es quien usa (operativo). El CFO compra **miedo y compliance**; el operativo quiere **densidad y teclado**. El ERP que gana satisface al comprador (compliance) aunque el usuario lo odie.

**¿Qué significa esto para Manann?** Diseña sabiendo que **el operativo es el usuario pero el CFO es el comprador**. Tu demo tiene que enamorar al operativo (para que lo defienda) y tranquilizar al CFO (compliance, auditoría, factura electrónica). Dos audiencias, un producto.

---

## NIVEL 6 — MODELO DE DATOS (cliente → asiento contable)

**El grafo central:**
```
CLIENTE ──1:N──► COTIZACIÓN ──(se gana)──► EXPEDIENTE(shipment/file)
                                              │
                          ┌───────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                     CHARGE LINES        DOCUMENTOS           EVENTOS/HITOS
                     (cargos)            (HBL, factura)       (milestones)
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        FACTURA VENTA            ACCRUAL COSTE
        (a cliente)              (provisión prov.)
              │                       │
              ▼                       ▼ (llega factura real)
        ASIENTO CONTABLE ◄────── CONCILIACIÓN (WIP / diff)
              │
              ▼
        PERIOD CLOSE (cierre mensual) ──► CONSOLIDACIÓN GRUPO
```

**Entidades y cardinalidades.** Cliente (1:N) cotizaciones; cotización (1:1 o 1:N) expediente; expediente (1:N) charge lines; charge line (N:1) factura; charge line (1:1) accrual; factura/accrual (1:N) asientos contables.

**El problema del doble vínculo operativo-contable.** Cada charge line tiene **dos vidas**: una operativa (qué servicio, a quién, en qué expediente) y una contable (qué cuenta, qué IVA, qué divisa, qué período). El reto del modelo es que **toda charge line acabe en un asiento** y que el period close mensual reverse los accruals cuando llega la factura real del proveedor — generando el WIP (work in progress) que mide la diferencia accrual-vs-factura.

**Versionado.** Una cotización revisada no se sobreescribe: se versiona (v1, v2, v3) con audit trail. Un B/L enmendado guarda el original + la enmienda. Esto es requisito de auditoría, no lujo.

**Orientado a PostgreSQL/Neon.** Tablas `clients`, `quotes`, `shipments`, `charge_lines`, `invoices`, `accruals`, `journal_entries`, `periods`. Usa columnas `valid_from/valid_to` para versionado temporal, `created_at/updated_at/created_by` para auditoría, y FKs estrictas charge_line→shipment, journal_entry→charge_line. RLS por tenant.

**¿Qué significa esto para Manann?** Tu esquema Postgres debe nacer con el **doble vínculo** desde el día uno. Si modelas el expediente como "objeto operativo" sin su gemelo contable (asiento + accrual + período), tendrás que reescribir todo cuando llegue el primer cierre mensual. Modela charge_line como la entidad sagrada: es el átomo que une operación y dinero.

---

## NIVEL 7 — EL MOTOR INVISIBLE (implementable)

**1. Motor tarifario (rate engine).** Una tarifa real tiene: validez temporal (`valid_from/to`), tramos de peso/volumen, surcharges condicionales, mínimos por envío, y tipo (FAK vs commodity vs NAC).
- Aéreo: peso facturable = max(peso real, volumen×167) kg/m³ (ratio 1:6).
- Marítimo LCL: W/M = max(toneladas, m³), se cobra por el mayor.
```pseudo
function chargeable_weight(mode, real_kg, volume_m3):
    if mode == AIR:  return max(real_kg, volume_m3 * 167)
    if mode == LCL:  return max(real_kg/1000, volume_m3)  # W/M, ton vs m3
function apply_rate(rate, cw, shipment_date):
    assert rate.valid_from <= shipment_date <= rate.valid_to
    base = rate.per_unit * cw
    base = max(base, rate.minimum)            # mínimo por envío
    for s in rate.surcharges:
        if s.condition(shipment): base += s.amount
    return base
```

**2. Lógica de consolidación.** Un máster (MBL) agrupa N houses (HBL). El coste del máster se prorratea entre houses por peso, volumen o valor; el **beneficio de consolidación** (comprar FCL barato, vender LCL caro) se lo queda el forwarder.
```pseudo
function allocate_master_cost(master_cost, houses, basis='volume'):
    total = sum(h[basis] for h in houses)
    for h in houses: h.allocated = master_cost * h[basis]/total
```

**3. Revenue recognition.** ¿Cuándo se reconoce el ingreso? Opciones: at departure, at arrival, percentage of completion. Importa para el cierre mensual y la auditoría: un expediente que zarpa el 30 y llega el 5 puede reconocerse en un mes u otro, cambiando el resultado del período.

**4. Accounting engine.** Genera asientos automáticos desde charge lines: multi-divisa con tipo de transacción vs. tipo de cierre, y realized/unrealized FX (la diferencia de cambio realizada al cobrar vs. la no realizada al cerrar período).

**5. Validaciones.** Antes de confirmar un B/L o presentar un DUA: HS code válido, peso > 0, partidas cuadran con commercial invoice, cliente con crédito disponible, todos los campos obligatorios de aduana presentes.

**6. Workflows.** Motor de estados (quote→booked→in-transit→arrived→delivered→invoiced→closed) con triggers y SLAs internos (ej: "alerta si expediente sin factura 5 días tras delivery").

**7. Motor documental.** Genera PDFs (HBL, AWB, factura) desde plantillas con datos del expediente. Una sola fuente de verdad poblando N documentos.

**8. RBAC.** Permisos por usuario × sucursal × departamento × empresa del grupo. Un operativo de Barcelona no ve los márgenes de Madrid; el controller de grupo lo ve todo.

**¿Qué significa esto para Manann?** Estos ocho motores son tu producto real. El rate engine y el accounting engine son los más difíciles y los más valiosos. Empieza por el motor de cargos + accounting engine (el dinero), luego rate engine (cotización), y deja consolidación/documental para después. La IA se monta **encima** de estos motores, no los sustituye.

---

## NIVEL 8 — CARGOWISE BAJO EL MICROSCOPIO

**La empresa (WiseTech Global).** Fundada en **1994 en Sídney por Richard White y Maree Isaacs** (originalmente para corredores de aduanas australianos). IPO en ASX en **abril 2016** (~168M AUD, valoración ~1.000M AUD). Cifras **FY25** (cerrado 30 junio 2025): ingresos totales **778,7 M$** (+14%); CargoWise creció orgánicamente 17% hasta 682,2 M$ con **recurring revenue del 99%**; **EBITDA 409,5 M$ ex-costes M&A (margen 53%)**; NPAT subyacente 241,8 M$; free cash flow 287 M$. R&D: ~55% capitalización, 64% de la plantilla en desarrollo de producto, 1.226 mejoras de producto en FY25. Clientes: 24 de los 25 mayores forwarders globales. [Alta]

**La adquisición transformadora: e2open.** Anunciada el 25 mayo 2025, cerrada el **4 agosto 2025**, por **3,30 $/acción = ~2.100 M$ de enterprise value**, totalmente financiada con deuda (facilidad sindicada de 3.000M$). Es la mayor adquisición de su historia (antes había hecho ~55 por ~1.200M$ en una década). Apalancamiento pro forma ~3,5× EBITDA FY25. Guidance FY26: ingresos 1,39-1,44B$, EBITDA 550-585M$, margen 40-41% (diluido por e2open). [Alta] Otras compras clave: Containerchain, **Blume Global (2023, ~414M$)**, Envase Technologies, MatchBox Exchange.

**El producto.** Arquitectura: **single global database**, stack .NET, API eAdaptor, filosofía "productize everything, no customization". CargoWise nació como ediEnterprise (2004), SaaS (2008), CargoWise One (2014), y CargoWise Next (4ª gen, 2025). [Alta]

**Por qué domina.** Apostó por los top-25 global forwarders; pricing por transacción; **comprar competidores y migrar sus clientes a CargoWise**; inversión masiva en compliance aduanero multi-país (objetivo: cubrir 90% de los flujos manufactureros con actualizaciones en 40+ jurisdicciones). [Media]

**Por qué es impopular.** UX densa, certificaciones/formación caras, lock-in. Y el detonante de 2025-2026: **CargoWise Value Packs**. El 1 diciembre 2025 movió ~95% de clientes del modelo de licencia STL (vigente desde 2014) a un modelo por transacción: ~**19,95 $ por contenedor de importación completo**, **9,95 $ por declaración aduanera standalone**, 216+ módulos incluidos. Impacto de coste: según el Journal of Commerce (vía GoFreight), *"one forwarder told JOC they expected a 25 to 35 percent cost increase"*; el analista de freight-tech Anthony Miller calculó *"$1.5M to $2.4M in additional costs"* para quien mueve 100.000 TEU/año, y Serkan Kavas reportó en LinkedIn *"approximately 50 percent price increases with limited transparency."* Avisos con tan solo tres días hábiles, en plena temporada navideña; SEKO Logistics denunció que WiseTech entró *"directamente en tu entorno de producción la víspera de Black Friday"*. Un mecanismo de "Transitional Pricing Protection" enmascaró temporalmente la subida en algunas facturas. El CEO Zubin Appoo defendió el modelo como "Community Pricing" estandarizado y dijo *"we knew this would be disruptive"*. [Alta] Según el Journal of Commerce, *"CargoWise commands approximately 70 percent of the forwarding software market, and WiseTech Global has a $16 billion market capitalization."* [Media]

**El escándalo de gobernanza.** Richard White dejó el cargo de CEO en **octubre 2024** tras revelaciones sobre su vida personal (relaciones con empleadas y proveedores, alegaciones de acoso). En **febrero 2025 dimitieron cuatro consejeros independientes** citando "diferencias irreconciliables" sobre el papel de White; la acción cayó ~20% y el mayor fondo de pensiones australiano (AustralianSuper) vendió su participación. White fue "exculpado" por una revisión interna y **regresó como executive chairman**. En **julio 2025, Zubin Appoo** (veterano de 14 años, 2004-2018, co-creador de CargoWise) fue nombrado CEO. En 2025-2026 WiseTech anunció un recorte de ~2.000 empleos en una "transformación AI" de dos años, con fuerte malestar sindical. [Alta]

**Barreras de entrada que lo protegen.** Compliance aduanero certificado en 50+ países; contabilidad certificada multi-país; masa crítica de red (24 de top-25); 20+ años de datos; coste de cambio altísimo. Estas son las barreras **reales** — no las features.

**¿Qué significa esto para Manann?** Tres regalos del enemigo: (1) **la herida de los Value Packs** abrió la primera ola de reevaluación de plataforma entre clientes mid-market en años — hay una ventana 2025-2027; (2) **el caos de gobernanza** erosiona la confianza; (3) las barreras (compliance multi-país, red global) son justo lo que **no debes intentar replicar**. Flanquea, no asaltes de frente.

---

## NIVEL 9 — AUTOPSIA DEL SECTOR

**Por qué los ERP transitarios tienen UX de 2005.** Razones estructurales, no pereza:
1. **Quien compra no es quien usa** → la venta es top-down a dirección, que valora compliance, no estética.
2. **La densidad real que exige el operativo**: procesa 30-50 expedientes/día, necesita keyboard-first, grids densos, cero scroll. Una UX "bonita" con mucho espacio en blanco le hace *más lento*.
3. **Coste de cambio altísimo** + ciclos de venta enterprise largos → el vendedor no compite en UX.
4. **El compliance congela features**: cada cambio puede romper una integración aduanera certificada.
5. **Deuda técnica acumulada** de 20 años.

**Por qué los usuarios siguen usándolos.** Switching costs, riesgo operativo de migrar en mitad del año fiscal, integraciones aduaneras certificadas, memoria muscular del operativo (sabe la pantalla de memoria).

**Por qué fracasan los nuevos entrantes.** El cementerio del freight tech:
- **Convoy** (brokerage digital de camión): valoración pico 3.800M$, +1.085M$ levantados; **cerró en octubre 2023**. Lección de su CEO Dan Lewis: "recesión de flete sin precedentes + endurecimiento monetario". Más profundo: el flete es relación, no API; sin activos físicos ni capacidad exclusiva, la tecnología no defiende el precio cuando las tarifas spot caen 40%+. Flexport compró solo el stack tecnológico, no el negocio. [Alta]
- **Flexport**: tras valoración de 8.000M$, sufrió en 2023; ingresos H1 2023 cayeron ~70% a ~700M$; despidos del 20% (enero y octubre 2023); drama Clark↔Petersen. Lección: confundió "ser empresa tech" con "ser forwarder"; el forwarding era visto como cash cow para la tech, y se descuidó. [Alta]
- **Forto (ex-FreightHub), iContainers, Twill (absorbido por Maersk)**: el digital forwarding se fragmentó por regiones como el tradicional, sin el winner-take-all prometido.

**Por qué los TMS modernos no entran en forwarding internacional.** Porque el forwarding internacional **es** aduanas + contabilidad multi-país + compliance — exactamente lo que un TMS de camión no tiene. Las restricciones invisibles: el operativo necesita densidad/teclado; el compliance congela el roadmap; el multi-tenant fiscal complica todo.

**¿Qué significa esto para Manann?** El patrón de fracaso es claro: **quemar capital intentando ser forwarder + tech a la vez, o intentar replicar la red/compliance.** Tú no tienes capital que quemar (eres solo founder, free-tier). Eso es una *ventaja*: te obliga a la única estrategia que funciona — wedge estrecho, software puro, sin activos, sin red global. La UX densa keyboard-first no es opcional: es requisito. No hagas un ERP "bonito"; haz uno **rápido**.

---

## NIVEL 10 — PENSAR COMO PRODUCT DESIGNER (con mente de operador)

**Catálogo de usuarios y jobs-to-be-done:**

| Usuario | Job-to-be-done | Fricción diaria | Tareas repetitivas |
|---|---|---|---|
| Operativo marítimo import | Mover la caja sin sorpresas | "¿Dónde está mi contenedor?" por teléfono | Re-teclear del email al sistema |
| Operativo export | Cuadrar booking + docs a tiempo | Perseguir docs al shipper | Generar HBL desde MBL |
| Operativo aéreo | Velocidad (vuelos no esperan) | Peso/volumen 1:6 a mano | Reintroducir AWB |
| Pricing analyst | Cotizar rápido sin perder margen | Buscar tarifas en N PDFs | Copiar tarifas a la cotización |
| Customs broker | DUA sin rechazo | Clasificación HS dudosa | Teclear datos de la factura al DUA |
| Comercial de calle | Cerrar al cliente | No ver el estado de sus envíos | Pedir info a operaciones |
| Billing clerk | Que cada cargo llegue a factura | Conciliar factura prov. vs accrual | Cotejar líneas a mano |
| Credit controller | Cobrar, no tener bad debt | Cliente moroso oculto | Perseguir cobros |
| Gerente sucursal | GP de su oficina | Datos dispersos | Reportes manuales |
| Dirección general | GP por cliente/lane | Decidir a ciegas | — |

**Deuda cognitiva.** Un operativo abre al día: el ERP, el email, 2-3 portales de naviera, la web de la aduana, Excel, WhatsApp. **6-8 sistemas/pestañas**. Cada salto es contexto perdido.

**Flujos ideales (criterio de operador):**
- **Keyboard-first**: todo accionable sin ratón; atajos para el operativo que hace 50/día.
- **Densidad**: grids densos, toda la info del expediente en una pantalla, cero scroll.
- **Gestión por excepciones**: en vez de un listado de 200 expedientes, un **inbox de excepciones** (solo lo que requiere acción: demurrage inminente, doc faltante, cargo sin facturar).
- **Automatización del data entry**: email/PDF → expediente poblado con confidence scores.

**¿Qué significa esto para Manann?** Tu diferenciador de diseño no es "moderno y limpio": es **"el operativo termina su día 90 minutos antes"**. Diseña el inbox de excepciones como pantalla principal, no el listado. Y mide tu éxito en *teclas pulsadas por expediente*, no en NPS de estética.

---

## NIVEL 11 — PENSAR COMO CTO (stack real de Manann)

**Multi-tenant.** Tres opciones: RLS en Postgres (una BD, filas por tenant), schema-per-tenant, database-per-tenant. Para un solo founder en Neon: **RLS en Postgres**. Trade-off: máxima simplicidad operativa y coste (un solo cluster), a cambio de rigor absoluto en las policies RLS (un bug expone datos cruzados). Schema/DB-per-tenant da aislamiento fuerte pero multiplica migraciones y coste — overengineering para tu fase. [Media]

**Event sourcing.** ¿Vale la pena para el expediente? **Honestamente, no como núcleo.** Pros: audit trail perfecto, time-travel. Contras: complejidad brutal para un solo founder, proyecciones, versionado de eventos. **Alternativa pragmática: audit log + outbox pattern.** Tabla `audit_log` (quién cambió qué cuándo) + tabla `outbox` para publicar eventos a integraciones con garantía. Obtienes el 80% del beneficio (auditoría, integraciones fiables) al 20% del coste.

**CQRS.** Sí para reporting/BI (vistas materializadas de lectura separadas del modelo transaccional); overengineering para el CRUD operativo. Aplícalo quirúrgicamente.

**Monolito modular vs. microservicios.** **Monolito modular, sin dudarlo.** Next.js en Vercel + Neon. Microservicios para un solo founder = suicidio operativo. Módulos bien separados (cargos, aduanas, finanzas) dentro de un monolito; extraes a servicio solo si algo lo exige (raro).

**IA y agentes — el corazón de tu tesis.** Dónde embeber LLMs en el core:
- **Extracción documental**: commercial invoice/packing list/B/L → campos del expediente.
- **Clasificación arancelaria HS**: sugerir el código con confidence score.
- **Cotización desde RFQ en lenguaje natural**: email del cliente → cotización estructurada.
- **Agentes de seguimiento de hitos**: vigilar eventos, alertar excepciones.

**El patrón clave: human-in-the-loop con "lighthouse-amber".** La IA **escribe en el modelo de datos** pero marca los campos generados en ámbar (no verificados) con su confidence score; el operativo confirma con un golpe de teclado y pasan a verde. **Esto es exactamente la antítesis de "IA periférica atornillada sobre legacy"**: tu IA escribe en el núcleo, no flota encima.

**Integraciones.** Estrategia de adaptadores (un adaptador por naviera/aduana), colas, idempotencia (clave de idempotencia por mensaje), reintentos con backoff, webhooks entrantes con verificación. El outbox pattern garantiza entrega.

**Seguridad.** RLS + cifrado en reposo (Neon lo da) + **SOC 2** como requisito de venta enterprise (sin él, ningún CFO de cierto tamaño firma). Residencia de datos UE/GDPR: Neon en región europea.

**Escalabilidad global.** Edge (Vercel) para el frontend; Neon con read replicas por región si hace falta; pero **no optimices para escala que no tienes** — un solo founder optimiza para velocidad de iteración, no para 10.000 tenants.

**¿Qué significa esto para Manann?** Tu stack (Next.js/Vercel/Neon) es perfecto para la estrategia correcta: monolito modular, RLS, audit log + outbox (no event sourcing), CQRS solo en BI, IA escribiendo en el core con lighthouse-amber. Tu tesis competitiva ("el enemigo es la IA periférica sobre legacy") se materializa técnicamente en que **tu IA tiene permisos de escritura validada sobre el modelo de datos** — algo que un bolt-on sobre CargoWise nunca tendrá.

---

## NIVEL 12 — PENSAR COMO FUNDADOR

**Supón que levantamos una startup para flanquear a CargoWise. Honestidad brutal:**

**Qué construiríamos (el wedge):** el **inbox de operaciones con IA que puebla expedientes** desde email/PDF, con motor de cargos sólido detrás. Atacas el 80% redundante (data entry) y el motor de margen, los dos dolores tangibles.

**Qué NO construiríamos (y por qué):**
- Aduanas multi-país certificadas (50+ jurisdicciones) → 20 años y compliance imposible para un solo founder.
- Contabilidad certificada por país → barrera regulatoria brutal.
- Red global de agentes → no es software, es negocio físico.

**Qué ignoraríamos deliberadamente:** el tracking en tiempo real con mapa bonito (lo valora menos el cliente de lo que crees), las integraciones EDI legacy con cada naviera (empieza con email parsing, que cubre el 90% real), los grandes forwarders (su lock-in es total).

**Qué automatizaríamos primero:** la **entrada de datos: email/PDF → expediente poblado.** Es el wedge con ROI más visible y demostrable en una demo de 5 minutos.

**Dónde está el verdadero moat del sector:** NO las features. Es (1) compliance, (2) datos históricos, (3) red, (4) coste de cambio. ¿Cuál puede construir un nuevo entrante? **El coste de cambio** (vía datos del cliente que viven en tu sistema) y, con el tiempo, **datos propios** (de los expedientes que procesas). Compliance y red son inalcanzables al principio — por eso atacas a quien no los necesita tanto: el pequeño/mediano.

**Qué parte del mercado atacaríamos primero:** **transitarios pequeños/medianos de 5-50 empleados** sin ERP real o con software legacy local, nichos LCL/grupaje, mercados desatendidos como **España y LatAm** (donde operas desde casa y hablas el idioma). Estos son los huérfanos: demasiado grandes para Excel, demasiado pequeños para CargoWise, y ahora golpeados por los Value Packs.

**Evaluación honesta de 4 wedges para un solo founder sin capital:**

| Wedge | Pros | Contras | Veredicto solo-founder |
|---|---|---|---|
| 1. Cotización IA standalone | Fácil demo, dolor claro | Feature, no sistema; fácil de copiar; no pega al cliente | Punto de entrada débil, alto churn |
| 2. **Inbox ops con IA que puebla expedientes** | Ataca el 80% redundante; pega; camino natural al ERP | Requiere motor de cargos detrás | **El mejor: wedge → plataforma** |
| 3. ERP completo de nicho | Máximo valor, máximo lock-in | 2-3 años hasta vender; mata a un solo founder | Demasiado para empezar |
| 4. Capa de visibilidad/portal cliente | Bonito, vendible | Es justo lo prescindible (Nivel 4); commodity | Trampa de la UX |

**Cómo secuenciar:** demo (lo que ya construyes) → **3-5 clientes de diseño** (transitarios españoles pequeños que sufren) → con tracción, decidir si capital o bootstrap → producto completo módulo a módulo (cargos→facturación→aduanas locales ES).

**Benchmarks de pricing SaaS del sector:** Logitude **45-90 $/usuario/mes** (Economy/Business/First Class); GoFreight ~100-500 $ rango; Magaya ~300 $/usuario/mes (custom, ~3.000 $/mes para 10 usuarios). Mid-market FMS: **100-400 $/usuario/mes**; enterprise 500-2.000 $+. [Media] Tu hueco: precio transparente y predecible (la antítesis de Value Packs), publicado en web, sin "contact sales".

**¿Qué significa esto para Manann?** Tu wedge es el #2. Tu mercado es el transitario español/LatAm de 5-50 empleados. Tu pricing es transparente y plano (el contra-Value-Pack). Y tu secuencia es demo→clientes de diseño→producto, no producto→ventas. Eres pequeño: esa es tu arma, no tu debilidad.

---

## NIVEL 13 — LO QUE NADIE TE CUENTA SOBRE LOS ERP TRANSITARIOS

**Verdades incómodas:**
1. **El ERP no se compra por features, sino por miedo y compliance.** El CFO firma porque teme una multa aduanera o un cierre contable imposible, no porque la UX sea bonita.
2. **El operativo odia el sistema pero lo defiende ante el cambio.** La memoria muscular es un foso. Migrar le aterra más que la fealdad.
3. **Los datos maestros sucios matan más implantaciones que la tecnología.** Tarifas mal cargadas, clientes duplicados, HS codes erróneos — eso hunde proyectos, no el código.
4. **El 80% del valor está en el 20% aburrido:** facturación, cargos y aduanas. El tracking es lo que se enseña en la demo; los cargos son lo que paga las nóminas.
5. **El cliente del ERP es el CFO, no el operativo.** Diseña para que el operativo lo ame y el CFO lo compre.

**Mitos:**
- *"La UX vende ERPs enterprise por sí sola."* No. Tranquiliza al usuario, pero el CFO compra compliance.
- *"La IA reemplazará al operativo a corto plazo."* No. La IA *aumenta* al operativo (le quita el re-tecleo); el juicio sobre excepciones, relaciones y problemas sigue siendo humano. Convoy murió por creer que el software sustituía la relación.
- *"El tracking en tiempo real es lo que más valora el cliente final."* Sobrevalorado. El cargador valora más una factura correcta y que no haya demurrage sorpresa.

**Errores frecuentes de nuevos entrantes:**
- Construir el dashboard antes que el motor de cargos.
- Subestimar aduanas y contabilidad (las dos cosas difíciles y valiosas).
- Vender a quien no decide (al operativo en vez de al CFO/dueño).
- Regalar el producto a los early adopters equivocados (el transitario que quiere "gratis para siempre" nunca pagará).

**Lecciones de fracasos:** Convoy (el software no sustituye la relación ni la capacidad física), Flexport (no confundas ser tech con ser forwarder), el digital forwarding (se fragmenta por regiones; no hay winner-take-all).

**Oportunidades ocultas:**
1. **Factura electrónica obligatoria en España como caballo de Troya.** Verifactu (RD 1007/2023) obligatorio para sociedades desde **1 enero 2027** y autónomos desde 1 julio 2027 (tras prórroga del RD-ley 15/2025); la factura electrónica B2B (Ley Crea y Crece / RD 238/2026) con entrada escalonada — 12 meses para empresas >8M€, 24 meses para el resto, tras la orden ministerial cuya entrada en vigor se fija en torno a octubre 2026/2027. [Alta] Todo transitario español **tendrá que** adaptar su facturación. Es una puerta de entrada regulatoria perfecta: entras por compliance y te quedas por el ERP.
2. **Relevo generacional** en transitarias familiares españolas: la generación que monta el negocio se jubila; la siguiente quiere software moderno.
3. **La ventana de precios Value Packs 2025-2026:** primera ola de reevaluación de plataforma en años.

**Tendencias inevitables 2026-2030:** consolidación del sector (DSV-Schenker marca el tono); estándares API DCSA/ONE Record desplazando al EDI; IA agéntica en el core; presión regulatoria (ICS2/CBAM/e-invoicing); escasez de talento operativo (que empuja la automatización).

**¿Qué significa esto para Manann?** Tu tesis ("el enemigo es la IA periférica sobre legacy") es correcta *y* incompleta. El enemigo real es **la fricción del operativo + el miedo del CFO**. Si tu IA escribe validada en el core (no flota encima), tu pricing es transparente (contra Value Packs), tu producto cumple la factura electrónica española (caballo de Troya), y atacas al transitario pequeño español en pleno relevo generacional y herido por CargoWise — estás en la única intersección donde un solo founder con free-tiers puede ganar. No construyas el dashboard. Construye el motor de cargos, automatiza el email→expediente, cumple Verifactu/Crea-y-Crece, y deja que la herida de los Value Packs te traiga los primeros clientes.

---

## SÍNTESIS FINAL — LA MÁQUINA, NO EL SOFTWARE

Si tuvieras que retener cinco frases de este consejo:

1. **El transitario es un árbitro de información sobre un negocio de margen del 3%.** Su software vale por cuánto margen fugado recupera, no por cuán bonito es.
2. **El valor vive en el motor de cargos y el compliance, no en las pantallas.** Construye el doble vínculo operativo-contable primero.
3. **CargoWise está herido (Value Packs, gobernanza) pero protegido por murallas que no debes asaltar (compliance multi-país, red).** Flanquea por el mid-market español/LatAm.
4. **Tu IA escribe validada en el núcleo (lighthouse-amber); la de tus competidores flota encima del legacy.** Ahí está tu tesis hecha código.
5. **Ser solo founder con free-tiers no es tu debilidad: es la disciplina que mató a Convoy y casi a Flexport.** Wedge estrecho, software puro, email→expediente, factura electrónica como puerta, pricing transparente.

*La industria creó los ERP porque el comercio internacional genera más información crítica, regulatoria y financiera de la que un humano puede reconciliar a mano sin perder dinero. Entiende la máquina —el dinero, el poder, los flujos— y el software se diseña solo.*

*Fin del documento II.*

---

### NOTA SOBRE FIABILIDAD DE LAS FUENTES
- Cifras financieras de WiseTech, DSV, K+N, Maersk y los acuerdos (e2open, DSV-Schenker): de comunicados oficiales y prensa financiera primaria → **[Alta]**.
- Datos del WCI, alianzas navieras, Value Packs, escándalo de gobernanza, fracasos (Convoy/Flexport): prensa especializada contrastada (Drewry, The Loadstar, CNBC, gCaptain, FMC) → **[Alta]**.
- Múltiplos de PE, márgenes McKinsey, demurrage FMC: fuentes nombradas pero algunas con antigüedad o cobertura parcial (Corporate Finance in Europe ~2014; D&D FMC solo tráficos EE.UU.) → **[Media]**.
- Cifras del expediente FCL Shanghái-Barcelona: **ilustrativas**, construidas con estructura de cargos real y flete orientado al WCI, no extraídas de una factura concreta → **[Media/Baja]**. Úsalas como modelo numérico, no como dato auditado.
- Calendario de factura electrónica española: normativa en evolución a fecha del documento (RD 238/2026 y orden ministerial aún sujetos a confirmación de fechas en BOE); contrastar la última versión oficial antes de tomar decisiones de producto → **[Media]**.