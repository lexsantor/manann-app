-- ─────────────────────────────────────────────────────────────────────────────
-- Manann · Seed de demo (Faro parity)
-- ─────────────────────────────────────────────────────────────────────────────
-- Puebla TODAS las secciones vacías de la org demo `atlantica` con datos
-- realistas e interrelacionados (sobre los expedientes EXP-2026-00xx ya seeded).
--
-- IDEMPOTENTE: cada bloque usa ON CONFLICT o NOT EXISTS → re-ejecutable sin
-- duplicar (base para un futuro "Reiniciar demo").
-- PORTABLE: la org se localiza por slug y expedientes/contactos por referencia
-- /nombre — sin UUIDs hardcodeados (dev y prod tienen ids distintos).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── A · Plan contable PGC 2007 ───────────────────────────────────────────────
INSERT INTO accounting_account (organization_id, code, name, type, is_system)
SELECT o.id, v.code, v.name, v.type::account_type, true
FROM organization o
CROSS JOIN (VALUES
  ('100','Capital social','patrimonio'),
  ('129','Resultado del ejercicio','patrimonio'),
  ('170','Deudas a largo plazo con entidades de crédito','pasivo'),
  ('400','Proveedores','pasivo'),
  ('410','Acreedores por prestaciones de servicios','pasivo'),
  ('430','Clientes','activo'),
  ('431','Clientes, efectos comerciales a cobrar','activo'),
  ('475','Hacienda Pública, acreedora por IVA','pasivo'),
  ('477','Hacienda Pública, IVA repercutido','pasivo'),
  ('572','Bancos e instituciones de crédito c/c','activo'),
  ('700','Ventas de mercaderías','ingreso'),
  ('705','Prestaciones de servicios','ingreso'),
  ('708','Devoluciones de ventas y operaciones similares','ingreso'),
  ('600','Compras de mercaderías','gasto'),
  ('621','Arrendamientos y cánones','gasto'),
  ('623','Servicios de profesionales independientes','gasto'),
  ('624','Transportes','gasto'),
  ('626','Servicios bancarios y similares','gasto'),
  ('628','Suministros','gasto'),
  ('629','Otros servicios','gasto'),
  ('640','Sueldos y salarios','gasto'),
  ('662','Intereses de deudas','gasto')
) AS v(code, name, type)
WHERE o.slug = 'atlantica'
ON CONFLICT (organization_id, code) DO NOTHING;

-- ── B · Asientos contables (diario) ──────────────────────────────────────────
-- Nota: ejecutar cada asiento como sentencia independiente (CTE INSERT…RETURNING
-- → INSERT líneas). El bloque es idempotente por `reference`.
WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
e AS (INSERT INTO journal_entry (organization_id, reference, date, description, period, status)
  SELECT org.id,'AST-2026-001',DATE '2026-06-03','Factura de servicios — Recanvis Auto Garraf (EXP-2026-0039)','2026-06','contabilizado'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM journal_entry j, org WHERE j.organization_id=org.id AND j.reference='AST-2026-001') RETURNING id)
INSERT INTO journal_entry_line (journal_entry_id, account_code, account_name, debit, credit, description, sort_order)
SELECT e.id,'430','Clientes',3025.00,0,'Recanvis Auto Garraf S.L.',0 FROM e
UNION ALL SELECT e.id,'705','Prestaciones de servicios',0,2500.00,'Flete + despacho DEHAM-ESBCN',1 FROM e
UNION ALL SELECT e.id,'477','Hacienda Pública, IVA repercutido',0,525.00,'IVA 21%',2 FROM e;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
e AS (INSERT INTO journal_entry (organization_id, reference, date, description, period, status)
  SELECT org.id,'AST-2026-002',DATE '2026-06-09','Cobro factura cliente — Recanvis Auto Garraf','2026-06','contabilizado'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM journal_entry j, org WHERE j.organization_id=org.id AND j.reference='AST-2026-002') RETURNING id)
INSERT INTO journal_entry_line (journal_entry_id, account_code, account_name, debit, credit, description, sort_order)
SELECT e.id,'572','Bancos e instituciones de crédito c/c',3025.00,0,'Transferencia recibida',0 FROM e
UNION ALL SELECT e.id,'430','Clientes',0,3025.00,'Recanvis Auto Garraf S.L.',1 FROM e;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
e AS (INSERT INTO journal_entry (organization_id, reference, date, description, period, status)
  SELECT org.id,'AST-2026-003',DATE '2026-06-05','Factura de naviera — flete Maersk (EXP-2026-0042)','2026-06','contabilizado'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM journal_entry j, org WHERE j.organization_id=org.id AND j.reference='AST-2026-003') RETURNING id)
INSERT INTO journal_entry_line (journal_entry_id, account_code, account_name, debit, credit, description, sort_order)
SELECT e.id,'624','Transportes',1800.00,0,'Flete marítimo ESBCN-NLRTM',0 FROM e
UNION ALL SELECT e.id,'400','Proveedores',0,1800.00,'Maersk Line',1 FROM e;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
e AS (INSERT INTO journal_entry (organization_id, reference, date, description, period, status)
  SELECT org.id,'AST-2026-004',DATE '2026-06-12','Pago a proveedor naviera Maersk','2026-06','contabilizado'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM journal_entry j, org WHERE j.organization_id=org.id AND j.reference='AST-2026-004') RETURNING id)
INSERT INTO journal_entry_line (journal_entry_id, account_code, account_name, debit, credit, description, sort_order)
SELECT e.id,'400','Proveedores',1800.00,0,'Maersk Line',0 FROM e
UNION ALL SELECT e.id,'572','Bancos e instituciones de crédito c/c',0,1800.00,'Transferencia emitida',1 FROM e;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
e AS (INSERT INTO journal_entry (organization_id, reference, date, description, period, status)
  SELECT org.id,'AST-2026-005',DATE '2026-05-31','Nómina equipo mayo 2026','2026-05','contabilizado'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM journal_entry j, org WHERE j.organization_id=org.id AND j.reference='AST-2026-005') RETURNING id)
INSERT INTO journal_entry_line (journal_entry_id, account_code, account_name, debit, credit, description, sort_order)
SELECT e.id,'640','Sueldos y salarios',4200.00,0,'Nómina mensual',0 FROM e
UNION ALL SELECT e.id,'572','Bancos e instituciones de crédito c/c',0,4200.00,'Pago nóminas',1 FROM e;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
e AS (INSERT INTO journal_entry (organization_id, reference, date, description, period, status)
  SELECT org.id,'AST-2026-006',DATE '2026-06-01','Arrendamiento oficina junio','2026-06','contabilizado'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM journal_entry j, org WHERE j.organization_id=org.id AND j.reference='AST-2026-006') RETURNING id)
INSERT INTO journal_entry_line (journal_entry_id, account_code, account_name, debit, credit, description, sort_order)
SELECT e.id,'621','Arrendamientos y cánones',1200.00,0,'Oficina Barcelona',0 FROM e
UNION ALL SELECT e.id,'572','Bancos e instituciones de crédito c/c',0,1200.00,'Recibo alquiler',1 FROM e;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
e AS (INSERT INTO journal_entry (organization_id, reference, date, description, period, status)
  SELECT org.id,'AST-2026-007',DATE '2026-06-10','Factura de servicios — Levante Componentes (EXP-2026-0043)','2026-06','borrador'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM journal_entry j, org WHERE j.organization_id=org.id AND j.reference='AST-2026-007') RETURNING id)
INSERT INTO journal_entry_line (journal_entry_id, account_code, account_name, debit, credit, description, sort_order)
SELECT e.id,'430','Clientes',6050.00,0,'Levante Componentes S.L.',0 FROM e
UNION ALL SELECT e.id,'705','Prestaciones de servicios',0,5000.00,'Flete + despacho CNSHA-ESVLC',1 FROM e
UNION ALL SELECT e.id,'477','Hacienda Pública, IVA repercutido',0,1050.00,'IVA 21%',2 FROM e;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
e AS (INSERT INTO journal_entry (organization_id, reference, date, description, period, status)
  SELECT org.id,'AST-2026-008',DATE '2026-06-13','Comisiones y servicios bancarios','2026-06','contabilizado'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM journal_entry j, org WHERE j.organization_id=org.id AND j.reference='AST-2026-008') RETURNING id)
INSERT INTO journal_entry_line (journal_entry_id, account_code, account_name, debit, credit, description, sort_order)
SELECT e.id,'626','Servicios bancarios y similares',85.00,0,'Comisión transferencias',0 FROM e
UNION ALL SELECT e.id,'572','Bancos e instituciones de crédito c/c',0,85.00,'Cargo banco',1 FROM e;

-- ── C · Catálogo de tarifas ──────────────────────────────────────────────────
INSERT INTO rate (organization_id, concept, service_type, unit, base_price, currency, valid_from, valid_to, notes, active)
SELECT o.id, v.concept, v.service_type::charge_type, v.unit::rate_unit, v.base_price, 'EUR', DATE '2026-01-01', DATE '2026-12-31', v.notes, true
FROM organization o
CROSS JOIN (VALUES
  ('Flete marítimo FCL 40HC Asia-Mediterráneo','flete','contenedor',2150.00,'Sujeto a BAF/CAF'),
  ('Flete marítimo FCL 20DV Norte de Europa','flete','contenedor',980.00,'Servicio semanal'),
  ('Flete aéreo carga general','flete','kg',3.85,'Tarifa > 1000 kg'),
  ('Grupaje LCL (peso/volumen)','flete','cbm',62.00,'Mínimo 1 W/M'),
  ('THC origen Barcelona','manipulacion','contenedor',185.00,NULL),
  ('THC destino Valencia','manipulacion','contenedor',195.00,NULL),
  ('Despacho de aduana importación','aduana','bl',95.00,NULL),
  ('Despacho de aduana exportación','aduana','bl',75.00,NULL),
  ('Emisión de BL / documentación','documentacion','bl',55.00,NULL),
  ('Seguro de mercancía (ad valorem)','seguro','plano',0.35,'% sobre valor CIF'),
  ('Almacenaje (día/contenedor)','almacenaje','contenedor',28.00,'A partir del día 5')
) AS v(concept, service_type, unit, base_price, notes)
WHERE o.slug = 'atlantica'
  AND NOT EXISTS (SELECT 1 FROM rate r WHERE r.organization_id = o.id);

-- ── E · Pipeline / Oportunidades CRM ─────────────────────────────────────────
INSERT INTO opportunity (organization_id, contact_id, title, stage, mode, pol, pod, cargo_type, estimated_value, currency, notes, closed_at)
SELECT o.id,
  (SELECT id FROM contact c WHERE c.organization_id=o.id AND c.name=v.contact_name LIMIT 1),
  v.title, v.stage::opportunity_stage, v.mode::transport_mode, v.pol, v.pod, v.cargo_type, v.estimated_value, 'EUR', v.notes,
  CASE WHEN v.closed THEN TIMESTAMP '2026-06-01 10:00:00' ELSE NULL END
FROM organization o
CROSS JOIN (VALUES
  ('Contrato anual FCL Shenzhen-Valencia','negociacion','maritimo','CNSHA','ESVLC','Electrónica de consumo',145000.00,'Levante Componentes S.L.','12 expediciones/año, revisión trimestral de tarifa',false),
  ('Programa exportación vino a EE.UU. Q3','propuesta','maritimo','ESVLC','USNYC','Vino embotellado (reefer)',89000.00,'East Coast Fine Wines LLC','Requiere contenedor reefer y seguro ad valorem',false),
  ('Aéreo farma mensual a México','prospecto','aereo','ESBCN','MXMEX','Producto farmacéutico (temp. controlada)',62000.00,'Distribuidora Médica del Valle S.A. de C.V.','Cadena de frío activa, GDP',false),
  ('Grupaje recambios DE-ES','ganado','maritimo','DEHAM','ESBCN','Recambios de automoción',34000.00,'Recanvis Auto Garraf S.L.','Cerrado — contrato firmado',true),
  ('Terrestre Benelux semanal','perdido','terrestre','ESBCN','NLRTM','Carga paletizada',28000.00,'Van der Berg Trading B.V.','Perdido frente a competidor local',true)
) AS v(title, stage, mode, pol, pod, cargo_type, estimated_value, contact_name, notes, closed)
WHERE o.slug = 'atlantica'
  AND NOT EXISTS (SELECT 1 FROM opportunity op WHERE op.organization_id = o.id);

-- ── D · Cotizaciones (+ líneas) ──────────────────────────────────────────────
WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
q AS (
  INSERT INTO quotation (organization_id, reference, client_name, client_email, status, valid_until, currency, subtotal, tax_rate, total, notes)
  SELECT org.id,'COT-2026-0007','Levante Componentes S.L.','compras@levantecomp.es','enviada',DATE '2026-07-15','EUR',2735.00,'21',3309.35,'FCL 40HC Shenzhen-Valencia incl. despacho'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM quotation x, org WHERE x.organization_id=org.id AND x.reference='COT-2026-0007')
  RETURNING id
)
INSERT INTO quotation_line (quotation_id, concept, unit, quantity, unit_price, subtotal, sort_order)
SELECT q.id,'Flete marítimo FCL 40HC Asia-Mediterráneo','contenedor'::rate_unit,'1','2150.00','2150.00',0 FROM q
UNION ALL SELECT q.id,'THC destino Valencia','contenedor'::rate_unit,'1','195.00','195.00',1 FROM q
UNION ALL SELECT q.id,'Despacho de aduana importación','bl'::rate_unit,'1','95.00','95.00',2 FROM q
UNION ALL SELECT q.id,'Emisión de BL / documentación','bl'::rate_unit,'1','55.00','55.00',3 FROM q
UNION ALL SELECT q.id,'Almacenaje (día/contenedor)','contenedor'::rate_unit,'5','28.00','140.00',4 FROM q
UNION ALL SELECT q.id,'Seguro de mercancía','plano'::rate_unit,'1','100.00','100.00',5 FROM q;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
q AS (
  INSERT INTO quotation (organization_id, reference, client_name, client_email, status, valid_until, currency, subtotal, tax_rate, total, notes)
  SELECT org.id,'COT-2026-0008','East Coast Fine Wines LLC','ops@ecfinewines.com','aceptada',DATE '2026-07-20','EUR',3420.00,'21',4138.20,'Export reefer Valencia-Nueva York'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM quotation x, org WHERE x.organization_id=org.id AND x.reference='COT-2026-0008')
  RETURNING id
)
INSERT INTO quotation_line (quotation_id, concept, unit, quantity, unit_price, subtotal, sort_order)
SELECT q.id,'Flete marítimo FCL 40RH reefer','contenedor'::rate_unit,'1','2850.00','2850.00',0 FROM q
UNION ALL SELECT q.id,'THC origen Barcelona','contenedor'::rate_unit,'1','185.00','185.00',1 FROM q
UNION ALL SELECT q.id,'Despacho de aduana exportación','bl'::rate_unit,'1','75.00','75.00',2 FROM q
UNION ALL SELECT q.id,'Seguro de mercancía (ad valorem)','plano'::rate_unit,'1','310.00','310.00',3 FROM q;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
q AS (
  INSERT INTO quotation (organization_id, reference, client_name, client_email, status, valid_until, currency, subtotal, tax_rate, total, notes)
  SELECT org.id,'COT-2026-0009','Recanvis Auto Garraf S.L.','admin@recanvisgarraf.cat','borrador',DATE '2026-07-30','EUR',1320.00,'21',1597.20,'Grupaje recambios Hamburgo-Barcelona'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM quotation x, org WHERE x.organization_id=org.id AND x.reference='COT-2026-0009')
  RETURNING id
)
INSERT INTO quotation_line (quotation_id, concept, unit, quantity, unit_price, subtotal, sort_order)
SELECT q.id,'Grupaje LCL (peso/volumen)','cbm'::rate_unit,'18','62.00','1116.00',0 FROM q
UNION ALL SELECT q.id,'THC destino Barcelona','contenedor'::rate_unit,'1','149.00','149.00',1 FROM q
UNION ALL SELECT q.id,'Emisión de BL / documentación','bl'::rate_unit,'1','55.00','55.00',2 FROM q;

-- ── F · Bookings DCSA 2.0 ────────────────────────────────────────────────────
INSERT INTO booking (organization_id, shipment_id, carrier_booking_ref, carrier_code, vessel_name, voyage_number, pol, pod, etd, eta, cutoff_date, status, notes)
SELECT o.id,
  (SELECT id FROM shipment s WHERE s.organization_id=o.id AND s.reference=v.ship_ref LIMIT 1),
  v.bref, v.scac, v.vessel, v.voyage, v.pol, v.pod, v.etd::timestamp, v.eta::timestamp, v.cutoff::timestamp, v.status::booking_status, v.notes
FROM organization o
CROSS JOIN (VALUES
  ('EXP-2026-0042','MAEU-BCN-558210','MAEU','Maersk Sevilla','614W','ESBCN','NLRTM','2026-06-08','2026-06-18','2026-06-06','confirmado','VGM enviado'),
  ('EXP-2026-0043','MEDU-SHA-339877','MEDU','MSC Diana','FE412A','CNSHA','ESVLC','2026-05-20','2026-06-14','2026-05-18','confirmado','En aduana destino'),
  ('EXP-2026-0044','CMDU-VLC-771043','CMDU','CMA CGM Lisa Marie','0NX2RW1','ESVLC','USNYC','2026-06-22','2026-07-03','2026-06-20','recibido','Pendiente confirmación naviera'),
  (NULL,'HLCU-HAM-120934','HLCU','Hapag Brussels Express','228N','DEHAM','ESBCN','2026-07-01','2026-07-08','2026-06-28','pendiente','Solicitud enviada, sin respuesta')
) AS v(ship_ref, bref, scac, vessel, voyage, pol, pod, etd, eta, cutoff, status, notes)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM booking b WHERE b.organization_id=o.id AND b.carrier_booking_ref=v.bref);

-- ── G · Declaraciones (Aduanas + VeriFactu) ──────────────────────────────────
INSERT INTO compliance_declaration (organization_id, shipment_id, type, reference_number, status, submitted_at, data)
SELECT o.id,
  (SELECT id FROM shipment s WHERE s.organization_id=o.id AND s.reference=v.ship_ref LIMIT 1),
  v.type, v.refnum, v.status, v.submitted::timestamp,
  CASE WHEN v.type='verifactu' THEN '{"modelo":"VeriFactu","régimen":"general"}'::jsonb ELSE NULL END
FROM organization o
CROSS JOIN (VALUES
  ('EXP-2026-0043','dua','26ES00281130012345678','aceptada','2026-06-11 09:20:00'),
  ('EXP-2026-0043','ens','26ES002800000ENS00451','aceptada','2026-06-09 14:05:00'),
  ('EXP-2026-0042','ncts','26NL0000T1NCTS008812','aceptada','2026-06-08 08:40:00'),
  ('EXP-2026-0044','aes','26ES002811000AES00892','pendiente',NULL),
  ('EXP-2026-0052','aes','26ES002800AIR0AES01177','aceptada','2026-06-12 16:30:00'),
  (NULL,'verifactu','VF-2026-000341','enviada','2026-06-10 12:00:00'),
  (NULL,'verifactu','VF-2026-000342','aceptada','2026-06-11 12:00:00')
) AS v(ship_ref, type, refnum, status, submitted)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM compliance_declaration d WHERE d.organization_id=o.id AND d.reference_number=v.refnum);

-- ── H · Gastos operativos ────────────────────────────────────────────────────
INSERT INTO expense (organization_id, date, category, description, amount, currency, supplier, shipment_id, status)
SELECT o.id, v.dt::date, v.category, v.description, v.amount, 'EUR', v.supplier,
  (SELECT id FROM shipment s WHERE s.organization_id=o.id AND s.reference=v.ship_ref LIMIT 1),
  v.status
FROM organization o
CROSS JOIN (VALUES
  ('2026-06-02','Transporte','Arrastre terrestre puerto-almacén','420.00','Transportes Peninsular S.L.','EXP-2026-0039','pagado'),
  ('2026-06-05','Aduana','Tasas DUA importación','138.50','AEAT','EXP-2026-0043','pagado'),
  ('2026-06-07','Almacén','Almacenaje 5 días contenedor','140.00','Terminal ESVLC','EXP-2026-0043','registrado'),
  ('2026-06-09','Suministros','Material de oficina','86.30','Lyreco','','pagado'),
  ('2026-06-10','Servicios profesionales','Asesoría fiscal mensual','350.00','Gestoría Mediterráneo','','registrado'),
  ('2026-06-11','Combustible','Repostaje flota propia','215.40','Repsol','','pagado'),
  ('2026-06-12','Transporte','Entrega última milla Rotterdam','295.00','Van Dijk Logistiek','EXP-2026-0042','registrado')
) AS v(dt, category, description, amount, supplier, ship_ref, status)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM expense e WHERE e.organization_id=o.id);

-- ── I · Catálogo de vuelos ───────────────────────────────────────────────────
INSERT INTO flight (organization_id, flight_number, airline, origin_iata, dest_iata, departure_date, arrival_date, aircraft_type, capacity_kg, available_kg, active)
SELECT o.id, v.fn, v.airline, v.orig, v.dest, v.dep::date, v.arr::date, v.aircraft, v.cap, v.avail, true
FROM organization o
CROSS JOIN (VALUES
  ('IB3201','Iberia Cargo','BCN','MEX','2026-06-20','2026-06-21','A330-200F',60000,18500),
  ('LH8402','Lufthansa Cargo','FRA','GRU','2026-06-22','2026-06-23','B777F',102000,34000),
  ('AF6720','Air France Cargo','CDG','JFK','2026-06-19','2026-06-19','B777F',98000,12000),
  ('EK9810','Emirates SkyCargo','DXB','BCN','2026-06-24','2026-06-24','B747-8F',134000,56000)
) AS v(fn, airline, orig, dest, dep, arr, aircraft, cap, avail)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM flight f WHERE f.organization_id=o.id AND f.flight_number=v.fn AND f.departure_date=v.dep::date);

-- ── J · Manifiestos aéreos (+ entradas) ──────────────────────────────────────
WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
m AS (
  INSERT INTO air_manifest (organization_id, mawb_number, flight_id, origin_iata, dest_iata, carrier, total_pieces, total_weight_kg, status)
  SELECT org.id,'075-44210055',
    (SELECT f.id FROM flight f, org WHERE f.organization_id=org.id AND f.flight_number='IB3201' LIMIT 1),
    'BCN','MEX','Iberia Cargo',42,1860.00,'open'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM air_manifest a, org WHERE a.organization_id=org.id AND a.mawb_number='075-44210055')
  RETURNING id
)
INSERT INTO air_manifest_entry (manifest_id, shipment_id, hawb_number, consignee, pieces, weight_kg, description)
SELECT m.id,
  (SELECT s.id FROM shipment s, organization o WHERE o.slug='atlantica' AND s.organization_id=o.id AND s.reference='EXP-2026-0052' LIMIT 1),
  'HAWB-MAN-0052','Distribuidora Médica del Valle S.A. de C.V.',18,820.00,'Producto farmacéutico temp. controlada' FROM m
UNION ALL SELECT m.id, NULL::uuid,'HAWB-MAN-0119','Comercial Azteca S.A.',14,640.00,'Componentes electrónicos' FROM m
UNION ALL SELECT m.id, NULL::uuid,'HAWB-MAN-0205','Textiles del Bajío',10,400.00,'Muestras textiles' FROM m;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
m AS (
  INSERT INTO air_manifest (organization_id, mawb_number, flight_id, origin_iata, dest_iata, carrier, total_pieces, total_weight_kg, status)
  SELECT org.id,'020-99887766',
    (SELECT f.id FROM flight f, org WHERE f.organization_id=org.id AND f.flight_number='LH8402' LIMIT 1),
    'FRA','GRU','Lufthansa Cargo',26,1240.00,'closed'
  FROM org WHERE NOT EXISTS (SELECT 1 FROM air_manifest a, org WHERE a.organization_id=org.id AND a.mawb_number='020-99887766')
  RETURNING id
)
INSERT INTO air_manifest_entry (manifest_id, shipment_id, hawb_number, consignee, pieces, weight_kg, description)
SELECT m.id, NULL::uuid,'HAWB-FRA-7781','Maquinaria Sul Ltda.',16,900.00,'Repuestos industriales' FROM m
UNION ALL SELECT m.id, NULL::uuid,'HAWB-FRA-7782','Importadora Paulista',10,340.00,'Instrumentación' FROM m;

-- ── K · Órdenes de transporte ────────────────────────────────────────────────
INSERT INTO transport_order (organization_id, reference, shipment_id, carrier, driver_name, license_plate, origin, destination, pickup_date, delivery_date, status, notes)
SELECT o.id, v.ref,
  (SELECT id FROM shipment s WHERE s.organization_id=o.id AND s.reference=v.ship_ref LIMIT 1),
  v.carrier, v.driver, v.plate, v.origin, v.dest, v.pickup::date, v.delivery::date, v.status, v.notes
FROM organization o
CROSS JOIN (VALUES
  ('OT-2026-0101','EXP-2026-0039','Transportes Peninsular S.L.','Joan Soler','1234-KLM','Puerto de Barcelona','Vilanova i la Geltrú','2026-05-13','2026-05-13','entregado','Entrega confirmada con albarán'),
  ('OT-2026-0102','EXP-2026-0043','Logística Garraf','María Ferrer','5678-NBP','Puerto de Valencia','Polígono Almussafes','2026-06-15','2026-06-16','en_ruta','Sujeto a despacho aduanero'),
  ('OT-2026-0103','EXP-2026-0042','TransEuropa Freight','Pieter Janssen','GH-882-K','Barcelona','Rotterdam','2026-06-19','2026-06-21','pendiente','Recogida tras consolidación'),
  ('OT-2026-0104',NULL,'Reparto Exprés BCN','Laura Gómez','9012-DFR','Almacén Zona Franca','Centro Barcelona','2026-06-14','2026-06-14','incidencia','Dirección de entrega incorrecta')
) AS v(ref, ship_ref, carrier, driver, plate, origin, dest, pickup, delivery, status, notes)
WHERE o.slug='atlantica'
ON CONFLICT (organization_id, reference) DO NOTHING;

-- ── L · Plantillas de ruta ───────────────────────────────────────────────────
INSERT INTO route_template (organization_id, name, mode, legs, transit_days, active)
SELECT o.id, v.name, v.mode::transport_mode, v.legs::jsonb, v.transit_days, true
FROM organization o
CROSS JOIN (VALUES
  ('Asia-Mediterráneo FCL','maritimo','[{"seq":1,"loc":"CNSHA","action":"Carga"},{"seq":2,"loc":"SGSIN","action":"Transbordo"},{"seq":3,"loc":"ESVLC","action":"Descarga"}]',28),
  ('Norte de Europa feeder','maritimo','[{"seq":1,"loc":"ESBCN","action":"Carga"},{"seq":2,"loc":"NLRTM","action":"Descarga"}]',6),
  ('Aéreo Europa-LatAm','aereo','[{"seq":1,"loc":"BCN","action":"Salida"},{"seq":2,"loc":"MEX","action":"Llegada"}]',2),
  ('Terrestre Benelux','terrestre','[{"seq":1,"loc":"Barcelona","action":"Recogida"},{"seq":2,"loc":"Rotterdam","action":"Entrega"}]',3)
) AS v(name, mode, legs, transit_days)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM route_template r WHERE r.organization_id=o.id);

-- ── M · Incidencias (Calidad) ────────────────────────────────────────────────
INSERT INTO incident (organization_id, shipment_id, type, description, responsible, status, resolution_date, impact_cost)
SELECT o.id,
  (SELECT id FROM shipment s WHERE s.organization_id=o.id AND s.reference=v.ship_ref LIMIT 1),
  v.type, v.description, v.responsible, v.status, v.resolution::date, v.cost
FROM organization o
CROSS JOIN (VALUES
  ('EXP-2026-0043','retraso','Demora de 2 días en inspección aduanera en Valencia','Aduana ESVLC','abierto',NULL,850.00),
  ('EXP-2026-0039','daño','Pallet dañado durante la descarga en terminal','Terminal DEHAM','cerrado','2026-05-20',1200.00),
  ('EXP-2026-0052','documental','Certificado sanitario incompleto a la llegada','Cliente','en_gestion',NULL,0.00),
  ('EXP-2026-0042','retraso','Salida del buque pospuesta 24h por congestión','Maersk Line','cerrado','2026-06-09',0.00)
) AS v(ship_ref, type, description, responsible, status, resolution, cost)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM incident i WHERE i.organization_id=o.id);

-- ── N · No conformidades (Calidad) ───────────────────────────────────────────
INSERT INTO non_conformity (organization_id, shipment_id, category, description, root_cause, corrective_action, status)
SELECT o.id,
  (SELECT id FROM shipment s WHERE s.organization_id=o.id AND s.reference=v.ship_ref LIMIT 1),
  v.category, v.description, v.root_cause, v.corrective, v.status
FROM organization o
CROSS JOIN (VALUES
  (NULL,'proceso','Retraso recurrente en la emisión del BL','Falta de checklist previo al cierre','Implantar checklist obligatorio en el flujo de cierre','abierto'),
  ('EXP-2026-0043','proveedor','La naviera no notificó el cambio de buque','Comunicación deficiente del partner','Escalar SLA de notificación con MSC','cerrado'),
  (NULL,'cliente','Instrucciones de embarque entregadas fuera de plazo','Cliente sin recordatorio automático','Activar recordatorio T-72h en el portal','en_revision')
) AS v(ship_ref, category, description, root_cause, corrective, status)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM non_conformity n WHERE n.organization_id=o.id);

-- ── O · Definiciones de SLA (Calidad) ────────────────────────────────────────
INSERT INTO sla_definition (organization_id, name, metric, target_hours, mode, active)
SELECT o.id, v.name, v.metric, v.hours, v.mode, true
FROM organization o
CROSS JOIN (VALUES
  ('Respuesta a cotización','cotizacion',4,NULL),
  ('Confirmación de booking','booking',24,'maritimo'),
  ('Presentación de DUA','dua',8,NULL),
  ('Entrega de documentación final','entrega',48,NULL)
) AS v(name, metric, hours, mode)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM sla_definition sd WHERE sd.organization_id=o.id);

-- ── P · Tenders / Red de agentes (+ ofertas) ─────────────────────────────────
INSERT INTO tender (organization_id, title, origin, destination, mode, cargo_description, weight, volume, target_date, response_deadline, status)
SELECT o.id, v.title, v.origin, v.dest, v.mode, v.cargo, v.weight, v.volume, v.target::date, v.deadline::date, v.status
FROM organization o
CROSS JOIN (VALUES
  ('FCL mensual Shanghai-Valencia','CNSHA','ESVLC','maritimo','Electrónica de consumo, 1x40HC/mes',24000.00,68.00,'2026-07-10','2026-06-28','abierto'),
  ('Aéreo urgente Madrid-Bogotá','MAD','BOG','aereo','Repuestos críticos sector industrial',1200.00,6.50,'2026-06-25','2026-06-20','abierto'),
  ('Grupaje semanal Italia-Barcelona','ITMIL','ESBCN','maritimo','Carga paletizada mixta',8000.00,22.00,'2026-07-01','2026-06-22','cerrado')
) AS v(title, origin, dest, mode, cargo, weight, volume, target, deadline, status)
WHERE o.slug='atlantica'
  AND NOT EXISTS (SELECT 1 FROM tender t WHERE t.organization_id=o.id);

INSERT INTO tender_bid (tender_id, agent_name, price, currency, transit_days, notes)
SELECT t.id, v.agent, v.price, 'EUR', v.days, v.notes
FROM tender t
JOIN organization o ON o.id=t.organization_id AND o.slug='atlantica'
CROSS JOIN (VALUES
  ('FCL mensual Shanghai-Valencia','Oceanlink Forwarding (Shanghai)',2080.00,30,'Incluye THC origen'),
  ('FCL mensual Shanghai-Valencia','Pacific Route Logistics',2240.00,27,'Tránsito más rápido vía SGSIN'),
  ('Aéreo urgente Madrid-Bogotá','AeroAndes Cargo',4850.00,2,'Conexión diaria garantizada')
) AS v(tender_title, agent, price, days, notes)
WHERE t.title=v.tender_title
  AND NOT EXISTS (SELECT 1 FROM tender_bid b WHERE b.tender_id=t.id AND b.agent_name=v.agent);

-- ── Q · Cargos de VENTA (enriquecer expedientes a paridad Faro) ───────────────
-- Los expedientes existentes solo tenían cargos de coste → Venta/GP/Margen = 0.
-- Añade líneas de venta (y el flete coste aéreo de 0052) para márgenes realistas
-- ~8-13%. Idempotente: solo si el expediente aún no tiene ningún cargo 'revenue'.
INSERT INTO charge (shipment_id, type, description, amount, currency, direction)
SELECT s.id, v.type::charge_type, v.description, v.amount::numeric, 'EUR', v.direction::charge_direction
FROM shipment s
JOIN organization o ON o.id = s.organization_id AND o.slug = 'atlantica'
JOIN (VALUES
  ('EXP-2026-0039','flete','Flete marítimo (venta)','1180.00','revenue'),
  ('EXP-2026-0039','manipulacion','THC + handling (venta)','454.00','revenue'),
  ('EXP-2026-0042','flete','Flete marítimo (venta)','1500.00','revenue'),
  ('EXP-2026-0042','manipulacion','THC + handling (venta)','604.00','revenue'),
  ('EXP-2026-0043','flete','Flete marítimo (venta)','2700.00','revenue'),
  ('EXP-2026-0043','aduana','Despacho + inspección (venta)','1047.00','revenue'),
  ('EXP-2026-0044','flete','Flete marítimo (venta)','3900.00','revenue'),
  ('EXP-2026-0044','seguro','Seguro + handling (venta)','1066.00','revenue'),
  ('EXP-2026-0052','flete','Flete aéreo (coste)','3200.00','cost'),
  ('EXP-2026-0052','flete','Flete aéreo (venta)','3600.00','revenue'),
  ('EXP-2026-0052','documentacion','Emisión AWB + handling (venta)','180.00','revenue')
) AS v(ship_ref, type, description, amount, direction) ON v.ship_ref = s.reference
WHERE NOT EXISTS (SELECT 1 FROM charge c2 WHERE c2.shipment_id = s.id AND c2.direction = 'revenue');

-- ── R · Facturas (+ líneas) ───────────────────────────────────────────────────
-- Cada factura como sentencia independiente (CTE INSERT…RETURNING → líneas).
-- Idempotente por (reference, shipment_id). Importes = venta del expediente +21% IVA.
WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
sh AS (SELECT s.id FROM shipment s, org WHERE s.organization_id=org.id AND s.reference='EXP-2026-0039'),
inv AS (INSERT INTO invoice (shipment_id, reference, status, issue_date, due_date, subtotal, tax_rate, total, currency, client_name)
  SELECT sh.id,'FAC-2026-0101','pagada',DATE '2026-05-15',DATE '2026-06-14',1634.00,21,1977.14,'EUR','Recanvis Auto Garraf S.L.'
  FROM sh WHERE NOT EXISTS (SELECT 1 FROM invoice i, sh WHERE i.reference='FAC-2026-0101' AND i.shipment_id=sh.id) RETURNING id)
INSERT INTO invoice_line (invoice_id, concept, quantity, unit_price, tax_rate, subtotal, sort_order)
SELECT inv.id,'Flete marítimo DEHAM-ESBCN',1,1180.00,21,1180.00,0 FROM inv
UNION ALL SELECT inv.id,'THC + despacho',1,454.00,21,454.00,1 FROM inv;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
sh AS (SELECT s.id FROM shipment s, org WHERE s.organization_id=org.id AND s.reference='EXP-2026-0043'),
inv AS (INSERT INTO invoice (shipment_id, reference, status, issue_date, due_date, subtotal, tax_rate, total, currency, client_name)
  SELECT sh.id,'FAC-2026-0102','enviada',DATE '2026-06-11',DATE '2026-07-11',3747.00,21,4533.87,'EUR','Levante Componentes S.L.'
  FROM sh WHERE NOT EXISTS (SELECT 1 FROM invoice i, sh WHERE i.reference='FAC-2026-0102' AND i.shipment_id=sh.id) RETURNING id)
INSERT INTO invoice_line (invoice_id, concept, quantity, unit_price, tax_rate, subtotal, sort_order)
SELECT inv.id,'Flete marítimo CNSHA-ESVLC',1,2700.00,21,2700.00,0 FROM inv
UNION ALL SELECT inv.id,'Despacho + inspección',1,1047.00,21,1047.00,1 FROM inv;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
sh AS (SELECT s.id FROM shipment s, org WHERE s.organization_id=org.id AND s.reference='EXP-2026-0044'),
inv AS (INSERT INTO invoice (shipment_id, reference, status, issue_date, due_date, subtotal, tax_rate, total, currency, client_name)
  SELECT sh.id,'FAC-2026-0103','emitida',DATE '2026-06-13',DATE '2026-07-13',4966.00,21,6008.86,'EUR','East Coast Fine Wines LLC'
  FROM sh WHERE NOT EXISTS (SELECT 1 FROM invoice i, sh WHERE i.reference='FAC-2026-0103' AND i.shipment_id=sh.id) RETURNING id)
INSERT INTO invoice_line (invoice_id, concept, quantity, unit_price, tax_rate, subtotal, sort_order)
SELECT inv.id,'Flete marítimo ESVLC-USNYC',1,3900.00,21,3900.00,0 FROM inv
UNION ALL SELECT inv.id,'Seguro + handling',1,1066.00,21,1066.00,1 FROM inv;

WITH org AS (SELECT id FROM organization WHERE slug='atlantica'),
sh AS (SELECT s.id FROM shipment s, org WHERE s.organization_id=org.id AND s.reference='EXP-2026-0052'),
inv AS (INSERT INTO invoice (shipment_id, reference, status, issue_date, due_date, subtotal, tax_rate, total, currency, client_name)
  SELECT sh.id,'FAC-2026-0104','vencida',DATE '2026-05-05',DATE '2026-06-04',3780.00,21,4573.80,'EUR','Distribuidora Médica del Valle S.A. de C.V.'
  FROM sh WHERE NOT EXISTS (SELECT 1 FROM invoice i, sh WHERE i.reference='FAC-2026-0104' AND i.shipment_id=sh.id) RETURNING id)
INSERT INTO invoice_line (invoice_id, concept, quantity, unit_price, tax_rate, subtotal, sort_order)
SELECT inv.id,'Flete aéreo ESBCN-MXMEX',1,3600.00,21,3600.00,0 FROM inv
UNION ALL SELECT inv.id,'Emisión AWB + handling',1,180.00,21,180.00,1 FROM inv;
