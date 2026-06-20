#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// design-lint — guardarraíl del sistema de diseño (ver DESIGN.md)
// Detecta deriva: paleta Tailwind cruda / hex, <select> y checkbox nativos,
// <table> hand-rolled (invariante 3 → usar DataTable), tamaños de fuente en px
// impar (invariante 7), y max-w-* anidado en páginas. El KIT (src/components/ui/) es ESTRICTO: si
// introduce paleta cruda, falla (exit 1). La capa de app se reporta como deuda
// (objetivo → 0). Con --strict, cualquier violación de app también falla.
// Uso: node scripts/design-lint.mjs [--strict]
// ─────────────────────────────────────────────────────────────────────────────
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const STRICT = process.argv.includes("--strict");

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
// Gradientes (from/to/via) y SVG (fill/stroke) quedan fuera: son atmósfera /
// data-viz, no estado semántico; no tienen token equivalente.
const RAW_COLOR = new RegExp(
  `\\b(bg|text|border|ring|ring-offset|divide|outline|decoration|shadow|accent)-(${PALETTE})-\\d{2,3}\\b`,
);
const HEX = /#[0-9a-fA-F]{3,8}\b/;
// Hex de marca permitidos (no son color de UI tokenizable).
const BRAND_HEX = /#F2C811/i; // amarillo oficial Power BI
const NATIVE_SELECT = /<select\b/;
const NATIVE_TEXTAREA = /<textarea\b/;
const NATIVE_CHECKBOX = /type=["']checkbox["']/;
const NATIVE_RADIO = /type=["']radio["']/;
const NATIVE_INPUT = /<input\b/;
const NATIVE_TABLE = /<table\b/;
// Tamaño de fuente en px impar: text-[9px], text-[11px], text-[13px]… (invariante 7).
// Solo casa el dígito final impar seguido de "px"; text-[10px] (par) no casa.
const ODD_PX = /text-\[\d*[13579]px\]/;
const NESTED_MAXW = /mx-auto\s+max-w-[2-5]xl|max-w-[2-5]xl\s+[^"']*\bspace-y-/;

// Páginas-documento imprimibles: max-w más estrecho es intencional.
const DOC_EXEMPT = /[\\/]documentos[\\/](awb|cmr)|facturas[\\/]\[id\]|cotizaciones[\\/]\[id\]/;
// Ficheros con color intencional NO tokenizable (excepciones documentadas en DESIGN.md):
// documentos imprimibles (superficie "papel"), mapas/geo (leaflet, marcadores).
const COLOR_EXEMPT = /[\\/]documentos[\\/](awb|cmr)|facturas[\\/]\[id\]|cotizaciones[\\/]\[id\]|world-map|route-map|[\\/]mapa[\\/]page|[\\/]lib[\\/]email/;
// Tablas <table> legítimas que NO migran a DataTable (excepciones documentadas en
// DESIGN.md §5). El kit (ui/data-table) queda exento por capa. Motivos:
//  · totales con <tfoot> que DataTable no soporta: finanzas, modelo303, balance, carrier-scorecard
//  · tabla editable embebida en acordeón (móvil = cards): air-manifests
//  · previsualización de import CSV (datos transitorios): csv-import, rate-csv-import
//  · panel KPI server-render con celdas bespoke ya canónicas (header+zebra): dashboard
//  · vistas-documento imprimibles ("papel") y plantillas de email (HTML inline): awb/cmr, lib/email
const TABLE_EXEMPT = /balance-sumas-saldos|modelo303-panel|finanzas-panel|carrier-scorecard|air-manifests-panel|rate-csv-import|csv-import|[\\/]dashboard[\\/]page|[\\/]documentos[\\/](awb|cmr)|[\\/]lib[\\/]email/;
// <input> crudo: el kit `Input` cubre los campos de formulario (44px, tokenizado).
// Exentos por motivo (no son campos de formulario estándar):
//  · subida de ficheros (type=file): document-upload, csv-import, rate-csv-import, bank-reconciliation
//  · oculto / autocompletar-combobox: add-party-form, contacts-tab, hs-code-search
//  · buscador (type=search): search-input
//  · editor inline compacto en tabla (patrón deliberado): currencies, document-series,
//    system-params, finanzas, crear-asiento (líneas de asiento), inline-field
//  · composer de chat del copiloto: copiloto-panel
//  · flujo wow (no tocar): ai-extraction-panel
const INPUT_EXEMPT = /document-upload|csv-import|bank-reconciliation-panel|add-party-form|contacts-tab|hs-code-search|search-input|currencies-panel|document-series-panel|system-params-panel|finanzas-panel|crear-asiento-button|inline-field|copiloto-panel|ai-extraction-panel/;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|css)$/.test(name)) acc.push(p);
  }
  return acc;
}

function layerOf(rel) {
  if (rel.includes("components/ui/")) return "kit";
  if (rel.includes("components/marketing/") || rel.includes("app/(marketing)")) return "marketing";
  return "app";
}

const findings = { kit: [], app: [], marketing: [] };

for (const file of walk(join(ROOT, "src"))) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (rel.endsWith("globals.css")) continue; // define los tokens: permitido
  const layer = layerOf(rel);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const at = (cat) => findings[layer].push({ rel, line: i + 1, cat, text: line.trim().slice(0, 100) });
    const colorExempt = COLOR_EXEMPT.test(rel);
    if (RAW_COLOR.test(line) && !colorExempt) at("paleta-cruda");
    if (HEX.test(line) && !rel.endsWith(".css") && !colorExempt && !BRAND_HEX.test(line)) at("hex");
    // El kit (ui/) puede envolver tags nativos: es su función. Solo se controlan
    // los nativos en la capa de app/marketing (que debe usar los primitivos).
    if (layer !== "kit") {
      if (NATIVE_SELECT.test(line)) at("select-nativo");
      if (NATIVE_TEXTAREA.test(line)) at("textarea-nativo");
      if (NATIVE_CHECKBOX.test(line)) at("checkbox-nativo");
      if (NATIVE_RADIO.test(line)) at("radio-nativo");
      // Tabla hand-rolled (invariante 3): debe ser <DataTable>. El kit la envuelve;
      // las tablas especiales documentadas (totales/acordeón/preview/doc) están exentas.
      if (NATIVE_TABLE.test(line) && !TABLE_EXEMPT.test(rel)) at("tabla-cruda");
      // Input crudo (invariante 4): campo de formulario debe ser kit `Input`.
      // Exentos los inputs no-formulario documentados (file/hidden/search/inline/chat/wow).
      if (NATIVE_INPUT.test(line) && !INPUT_EXEMPT.test(rel)) at("input-crudo");
    }
    // Fuente en px impar (invariante 7): aplica a todas las capas; en el kit se
    // reporta pero solo el color rompe su gate; en app cuenta como deuda (→ 0).
    if (ODD_PX.test(line)) at("px-impar");
    if (rel.includes("app/(app)") && rel.endsWith("page.tsx") && NESTED_MAXW.test(line) && !DOC_EXEMPT.test(rel)) at("ancho-anidado");
  });
}

function summarize(list) {
  const by = {};
  for (const f of list) by[f.cat] = (by[f.cat] ?? 0) + 1;
  return by;
}

function printLayer(name, list) {
  const by = summarize(list);
  const total = list.length;
  console.log(`\n${name.toUpperCase()} — ${total} hallazgo(s)`);
  for (const [cat, n] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${cat}`);
  return total;
}

console.log("── design-lint (ver DESIGN.md) ──");
printLayer("kit (src/components/ui — ESTRICTO en color)", findings.kit);
const appN = printLayer("app (deuda → 0)", findings.app);
printLayer("marketing (informativo)", findings.marketing);

// El kit es la fuente de los tokens: gate estricto solo sobre color (invariante 6).
const kitColor = findings.kit.filter((f) => f.cat === "paleta-cruda" || f.cat === "hex");
if (kitColor.length > 0) {
  console.log("\nKIT con paleta cruda — top:");
  kitColor.slice(0, 20).forEach((f) => console.log(`  ${f.rel}:${f.line}  [${f.cat}] ${f.text}`));
}

let exit = 0;
if (kitColor.length > 0) {
  console.error(`\n✗ FALLO: el kit debe usar solo tokens de color (${kitColor.length} violación/es).`);
  exit = 1;
}
// Deuda de app congelada en 0: cualquier reintroducción rompe el build (prebuild).
if (appN > 0) {
  console.log("\nAPP — top:");
  findings.app.slice(0, 25).forEach((f) => console.log(`  ${f.rel}:${f.line}  [${f.cat}] ${f.text}`));
  console.error(`\n✗ FALLO: ${appN} violación/es de diseño en la capa de app (deuda → debe ser 0). Usa tokens/primitivos (ver DESIGN.md).`);
  exit = 1;
}
void STRICT;
if (exit === 0) console.log("\n✓ Kit limpio. Deuda de app registrada arriba (objetivo: 0).");
process.exit(exit);
