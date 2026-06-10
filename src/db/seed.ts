// Seed de Manann (PR-4): usuarios demo + 1 org + 5 expedientes realistas con
// partes, contenedores, mercancía, tracking y cargos.
// Idempotente: usuarios/org/members por onConflictDoNothing; los expedientes
// solo se siembran si la org aún no tiene ninguno (no duplica en re-runs).
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "./index";
import {
  user,
  organization,
  member,
  shipment,
  party,
  container,
  cargoLine,
  document,
  trackingEvent,
  charge,
} from "./schema";

const DEMO_USERS = [
  { name: "Alex Santoro", email: "lexsantor@gmail.com", role: "owner" as const },
  { name: "Marina Coll", email: "marina@demo.manann.app", role: "member" as const },
];

const ORG = { name: "Atlántica Forwarding S.L.", slug: "atlantica" };

// Definición declarativa de los expedientes demo.
type SeedShipment = {
  reference: string;
  status: "borrador" | "confirmado" | "en_transito" | "en_aduana" | "entregado" | "cerrado";
  mode: "maritimo" | "aereo" | "terrestre" | "ferroviario" | "multimodal";
  priority: "low" | "med" | "high" | "urgent";
  pol: string;
  pod: string;
  carrier: string;
  vessel?: string;
  voyage?: string;
  blNumber: string;
  incoterm: string;
  freightTerms: string;
  etd: string;
  eta: string;
  parties: { role: "shipper" | "consignee" | "notify"; name: string; taxId?: string; city?: string; country: string }[];
  containers: { containerNumber: string; sealNumber?: string; isoType: string; tareKg: number; grossWeightKg: number }[];
  cargo: { description: string; hsCode: string; packages: number; packageType: string; grossWeightKg: number; volumeCbm: string }[];
  tracking: { type: "salida" | "en_transito" | "llegada" | "aduana" | "descargado" | "entregado" | "cargado" | "booking" | "gate_in"; location: string; description: string; occurredAt: string }[];
  charges: { type: "flete" | "aduana" | "manipulacion" | "seguro" | "documentacion"; description: string; amount: string; payableBy: "shipper" | "consignee" }[];
  document?: { type: "bl"; filename: string; status: "confirmed" | "extracted"; aiConfidence: string };
};

const SHIPMENTS: SeedShipment[] = [
  {
    reference: "EXP-2026-0042",
    status: "en_transito",
    mode: "maritimo",
    priority: "med",
    pol: "ESBCN",
    pod: "NLRTM",
    carrier: "Maersk",
    vessel: "Madrid Maersk",
    voyage: "448W",
    blNumber: "MAEU257841930",
    incoterm: "FOB",
    freightTerms: "prepaid",
    etd: "2026-06-09",
    eta: "2026-06-18",
    parties: [
      { role: "shipper", name: "Tèxtil Vallès S.A.", taxId: "ESA08123456", city: "Sabadell", country: "ES" },
      { role: "consignee", name: "Van der Berg Trading B.V.", taxId: "NL812345678B01", city: "Rotterdam", country: "NL" },
      { role: "notify", name: "Van der Berg Trading B.V.", city: "Rotterdam", country: "NL" },
    ],
    containers: [
      { containerNumber: "MSKU1245678", sealNumber: "SL-884213", isoType: "22G1", tareKg: 2180, grossWeightKg: 19850 },
    ],
    cargo: [
      { description: "Maquinaria textil", hsCode: "8445.20", packages: 6, packageType: "bultos", grossWeightKg: 17670, volumeCbm: "28.400" },
    ],
    tracking: [
      { type: "salida", location: "ESBCN", description: "Salida del puerto de carga", occurredAt: "2026-06-09T14:20:00Z" },
      { type: "en_transito", location: "ESALG", description: "Tránsito — paso por Estrecho de Gibraltar", occurredAt: "2026-06-11T06:00:00Z" },
    ],
    charges: [
      { type: "flete", description: "Flete marítimo BCN-RTM", amount: "1850.00", payableBy: "shipper" },
      { type: "documentacion", description: "Emisión BL", amount: "65.00", payableBy: "shipper" },
    ],
    document: { type: "bl", filename: "BL-MAERSK-EXP0042.pdf", status: "confirmed", aiConfidence: "0.970" },
  },
  {
    reference: "EXP-2026-0043",
    status: "en_aduana",
    mode: "maritimo",
    priority: "high",
    pol: "CNSHA",
    pod: "ESVLC",
    carrier: "MSC",
    vessel: "MSC Gülsün",
    voyage: "FE2-027",
    blNumber: "MEDUSH1099233",
    incoterm: "CIF",
    freightTerms: "prepaid",
    etd: "2026-05-12",
    eta: "2026-06-14",
    parties: [
      { role: "shipper", name: "Shenzhen Brightway Electronics Co.", city: "Shenzhen", country: "CN" },
      { role: "consignee", name: "Levante Componentes S.L.", taxId: "ESB46789012", city: "València", country: "ES" },
    ],
    containers: [
      { containerNumber: "MEDU7781234", sealNumber: "CN-220914", isoType: "45G1", tareKg: 3750, grossWeightKg: 24100 },
    ],
    cargo: [
      { description: "Componentes electrónicos — placas de control", hsCode: "8537.10", packages: 320, packageType: "cajas", grossWeightKg: 20350, volumeCbm: "58.200" },
    ],
    tracking: [
      { type: "salida", location: "CNSHA", description: "Salida de Shanghái", occurredAt: "2026-05-12T03:00:00Z" },
      { type: "llegada", location: "ESVLC", description: "Atraque en València", occurredAt: "2026-06-14T09:30:00Z" },
      { type: "aduana", location: "ESVLC", description: "Pendiente de despacho aduanero", occurredAt: "2026-06-14T11:00:00Z" },
    ],
    charges: [
      { type: "flete", description: "Flete marítimo SHA-VLC", amount: "2980.00", payableBy: "consignee" },
      { type: "aduana", description: "Gestión despacho importación", amount: "210.00", payableBy: "consignee" },
      { type: "seguro", description: "Seguro de mercancía", amount: "145.00", payableBy: "consignee" },
    ],
    document: { type: "bl", filename: "BL-MSC-EXP0043.pdf", status: "extracted", aiConfidence: "0.910" },
  },
  {
    reference: "EXP-2026-0044",
    status: "confirmado",
    mode: "maritimo",
    priority: "med",
    pol: "ESVLC",
    pod: "USNYC",
    carrier: "CMA CGM",
    vessel: "CMA CGM Jacques Saadé",
    voyage: "TA1-512",
    blNumber: "CMAU4471882",
    incoterm: "DAP",
    freightTerms: "collect",
    etd: "2026-06-20",
    eta: "2026-07-03",
    parties: [
      { role: "shipper", name: "Bodegas Ribera del Túria S.L.", taxId: "ESB96123450", city: "Utiel", country: "ES" },
      { role: "consignee", name: "East Coast Fine Wines LLC", city: "Newark, NJ", country: "US" },
      { role: "notify", name: "Atlantic Customs Brokers Inc.", city: "New York, NY", country: "US" },
    ],
    containers: [
      { containerNumber: "CMAU4471882", sealNumber: "ES-771204", isoType: "22R1", tareKg: 3050, grossWeightKg: 21600 },
    ],
    cargo: [
      { description: "Vino embotellado D.O. Utiel-Requena", hsCode: "2204.21", packages: 1280, packageType: "cajas", grossWeightKg: 18200, volumeCbm: "24.600" },
    ],
    tracking: [
      { type: "booking", location: "ESVLC", description: "Reserva confirmada con naviera", occurredAt: "2026-06-06T10:00:00Z" },
    ],
    charges: [
      { type: "flete", description: "Flete marítimo VLC-NYC (reefer)", amount: "4250.00", payableBy: "consignee" },
      { type: "documentacion", description: "Certificado origen + fitosanitario", amount: "120.00", payableBy: "shipper" },
    ],
    document: { type: "bl", filename: "BL-CMACGM-EXP0044.pdf", status: "confirmed", aiConfidence: "0.940" },
  },
  {
    reference: "EXP-2026-0039",
    status: "entregado",
    mode: "maritimo",
    priority: "low",
    pol: "DEHAM",
    pod: "ESBCN",
    carrier: "Hapag-Lloyd",
    vessel: "Berlin Express",
    voyage: "NE-118",
    blNumber: "HLCUHAM2210567",
    incoterm: "EXW",
    freightTerms: "prepaid",
    etd: "2026-05-02",
    eta: "2026-05-12",
    parties: [
      { role: "shipper", name: "Kraftteile Nord GmbH", city: "Hamburg", country: "DE" },
      { role: "consignee", name: "Recanvis Auto Garraf S.L.", taxId: "ESB08345671", city: "Vilanova i la Geltrú", country: "ES" },
    ],
    containers: [
      { containerNumber: "HLXU3398211", sealNumber: "DE-455120", isoType: "22G1", tareKg: 2200, grossWeightKg: 15400 },
    ],
    cargo: [
      { description: "Recambios de automoción", hsCode: "8708.99", packages: 84, packageType: "pallets", grossWeightKg: 13200, volumeCbm: "31.800" },
    ],
    tracking: [
      { type: "salida", location: "DEHAM", description: "Salida de Hamburgo", occurredAt: "2026-05-02T18:00:00Z" },
      { type: "llegada", location: "ESBCN", description: "Llegada a Barcelona", occurredAt: "2026-05-12T07:15:00Z" },
      { type: "entregado", location: "ESVNG", description: "Entrega en destino", occurredAt: "2026-05-14T12:40:00Z" },
    ],
    charges: [
      { type: "flete", description: "Flete marítimo HAM-BCN", amount: "1320.00", payableBy: "consignee" },
      { type: "manipulacion", description: "THC destino", amount: "185.00", payableBy: "consignee" },
    ],
    document: { type: "bl", filename: "BL-HAPAG-EXP0039.pdf", status: "confirmed", aiConfidence: "0.960" },
  },
  {
    reference: "EXP-2026-0052",
    status: "confirmado",
    mode: "aereo",
    priority: "urgent",
    pol: "ESBCN",
    pod: "MXMEX",
    carrier: "Iberia Cargo",
    voyage: "IB6400",
    blNumber: "075-22148830",
    incoterm: "CPT",
    freightTerms: "prepaid",
    etd: "2026-06-12",
    eta: "2026-06-13",
    parties: [
      { role: "shipper", name: "Farma Pirineus S.A.", taxId: "ESA25678123", city: "Barcelona", country: "ES" },
      { role: "consignee", name: "Distribuidora Médica del Valle S.A. de C.V.", city: "Ciudad de México", country: "MX" },
    ],
    containers: [],
    cargo: [
      { description: "Producto farmacéutico — cadena de frío", hsCode: "3004.90", packages: 12, packageType: "bultos", grossWeightKg: 410, volumeCbm: "1.900" },
    ],
    tracking: [
      { type: "booking", location: "ESBCN", description: "AWB emitido — reserva confirmada", occurredAt: "2026-06-11T16:00:00Z" },
    ],
    charges: [
      { type: "flete", description: "Flete aéreo BCN-MEX (perecedero)", amount: "3680.00", payableBy: "shipper" },
      { type: "documentacion", description: "AWB + documentación sanitaria", amount: "95.00", payableBy: "shipper" },
    ],
    document: { type: "bl", filename: "AWB-IBERIA-EXP0052.pdf", status: "extracted", aiConfidence: "0.880" },
  },
];

async function ensureUsers() {
  for (const u of DEMO_USERS) {
    await db
      .insert(user)
      .values({ id: randomUUID(), name: u.name, email: u.email, emailVerified: true })
      .onConflictDoNothing({ target: user.email });
  }
  const rows = await db.select({ id: user.id, email: user.email }).from(user);
  return new Map(rows.map((r) => [r.email, r.id]));
}

async function ensureOrg(usersByEmail: Map<string, string>) {
  await db.insert(organization).values({ name: ORG.name, slug: ORG.slug }).onConflictDoNothing({ target: organization.slug });
  const [org] = await db.select().from(organization).where(eq(organization.slug, ORG.slug));
  for (const u of DEMO_USERS) {
    const userId = usersByEmail.get(u.email);
    if (!userId) continue;
    await db
      .insert(member)
      .values({ organizationId: org.id, userId, role: u.role })
      .onConflictDoNothing();
  }
  return org;
}

async function seedShipments(orgId: string, createdBy: string | undefined) {
  const existing = await db.select({ id: shipment.id }).from(shipment).where(eq(shipment.organizationId, orgId));
  if (existing.length > 0) {
    console.log(`· la org ya tiene ${existing.length} expedientes — no re-seedeo`);
    return;
  }
  await insertShipments(orgId, createdBy);
}

// Inserta los 5 expedientes demo (sin comprobar si ya existen).
export async function insertShipments(
  orgId: string,
  createdBy: string | undefined,
) {
  for (const s of SHIPMENTS) {
    const [row] = await db
      .insert(shipment)
      .values({
        organizationId: orgId,
        reference: s.reference,
        status: s.status,
        mode: s.mode,
        priority: s.priority,
        pol: s.pol,
        pod: s.pod,
        carrier: s.carrier,
        vessel: s.vessel,
        voyage: s.voyage,
        blNumber: s.blNumber,
        incoterm: s.incoterm,
        freightTerms: s.freightTerms,
        etd: new Date(s.etd),
        eta: new Date(s.eta),
        createdBy: createdBy ?? null,
      })
      .returning({ id: shipment.id });
    const sid = row.id;

    if (s.parties.length)
      await db.insert(party).values(s.parties.map((p) => ({ shipmentId: sid, ...p })));

    const containerIdByNumber = new Map<string, string>();
    if (s.containers.length) {
      const inserted = await db
        .insert(container)
        .values(s.containers.map((c) => ({ shipmentId: sid, ...c })))
        .returning({ id: container.id, num: container.containerNumber });
      for (const c of inserted) containerIdByNumber.set(c.num, c.id);
    }

    if (s.cargo.length)
      await db.insert(cargoLine).values(
        s.cargo.map((c) => ({
          shipmentId: sid,
          containerId: s.containers[0] ? containerIdByNumber.get(s.containers[0].containerNumber) : null,
          ...c,
        })),
      );

    if (s.tracking.length)
      await db.insert(trackingEvent).values(
        s.tracking.map((t) => ({
          shipmentId: sid,
          type: t.type,
          location: t.location,
          description: t.description,
          vessel: s.vessel,
          source: "mock" as const,
          occurredAt: new Date(t.occurredAt),
        })),
      );

    if (s.charges.length)
      await db.insert(charge).values(s.charges.map((c) => ({ shipmentId: sid, ...c })));

    if (s.document)
      await db.insert(document).values({
        shipmentId: sid,
        type: s.document.type,
        status: s.document.status,
        filename: s.document.filename,
        aiConfidence: s.document.aiConfidence,
        uploadedBy: createdBy ?? null,
      });

    console.log(`  ✓ ${s.reference} (${s.status}) — ${s.pol}→${s.pod}`);
  }
}

async function seed() {
  const usersByEmail = await ensureUsers();
  console.log(`✓ usuarios: ${[...usersByEmail.keys()].join(", ")}`);
  const org = await ensureOrg(usersByEmail);
  console.log(`✓ org: ${org.name} (${org.slug})`);
  const owner = usersByEmail.get(DEMO_USERS[0].email);
  await seedShipments(org.id, owner);
}

// Reset de demo: borra TODOS los expedientes de la org (cascade) y re-siembra
// los 5 originales. Lo usa la acción de reset del panel.
export async function reseedDemo(
  orgId: string,
  createdBy: string | undefined,
) {
  await db.delete(shipment).where(eq(shipment.organizationId, orgId));
  await insertShipments(orgId, createdBy);
}

// Solo auto-ejecuta el seed cuando se corre directamente (bun run src/db/seed.ts),
// no cuando se importa (la acción de reset importa reseedDemo).
if ((import.meta as unknown as { main?: boolean }).main) {
  seed()
    .then(() => {
      console.log("Seed completado.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed falló:", err);
      process.exit(1);
    });
}
