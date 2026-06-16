#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// design-lint — guardarraíl del sistema de diseño (ver DESIGN.md)
// Detecta deriva: paleta Tailwind cruda / hex, <select> y checkbox nativos,
// y max-w-* anidado en páginas. El KIT (src/components/ui/) es ESTRICTO: si
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
const RAW_COLOR = new RegExp(
  `\\b(bg|text|border|ring|ring-offset|from|to|via|fill|stroke|divide|outline|decoration|shadow|accent)-(${PALETTE})-\\d{2,3}\\b`,
);
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const NATIVE_SELECT = /<select\b/;
const NATIVE_TEXTAREA = /<textarea\b/;
const NATIVE_CHECKBOX = /type=["']checkbox["']/;
const NATIVE_RADIO = /type=["']radio["']/;
const NESTED_MAXW = /mx-auto\s+max-w-[2-5]xl|max-w-[2-5]xl\s+[^"']*\bspace-y-/;

// Páginas-documento imprimibles: max-w más estrecho es intencional.
const DOC_EXEMPT = /[\\/]documentos[\\/](awb|cmr)|facturas[\\/]\[id\]|cotizaciones[\\/]\[id\]/;

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
    if (RAW_COLOR.test(line)) at("paleta-cruda");
    if (HEX.test(line) && !rel.endsWith(".css")) at("hex");
    // El kit (ui/) puede envolver tags nativos: es su función. Solo se controlan
    // los nativos en la capa de app/marketing (que debe usar los primitivos).
    if (layer !== "kit") {
      if (NATIVE_SELECT.test(line)) at("select-nativo");
      if (NATIVE_TEXTAREA.test(line)) at("textarea-nativo");
      if (NATIVE_CHECKBOX.test(line)) at("checkbox-nativo");
      if (NATIVE_RADIO.test(line)) at("radio-nativo");
    }
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
if (STRICT && appN > 0) {
  console.error(`\n✗ FALLO (--strict): ${appN} violación/es en la capa de app.`);
  exit = 1;
}
if (exit === 0) console.log("\n✓ Kit limpio. Deuda de app registrada arriba (objetivo: 0).");
process.exit(exit);
