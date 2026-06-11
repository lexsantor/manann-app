# Manann — Resumen de sesión y registro de decisiones

> Documento maestro. Consolida todo lo decidido en la sesión de arranque del proyecto. Sirve de contexto de alto nivel y de "por qué" detrás de cada archivo del kit. Para ejecutar, ver `CLAUDE.md` (Claude Code lo lee al iniciar) y `BUILD-PLAN.md`.

---

## 1. El proyecto en una frase

**Manann** es una **demo** de ERP transitario (freight forwarder) construida en solitario y a coste cero (free tier), cuyo objetivo **no es venderse como producto**, sino **demostrar a stakeholders lo obsoletos que están los ERPs actuales** del sector. El punto de partida es la demo; si marcha bien, tiene recorrido como producto real.

**El momento "wow":** arrastrar un Bill of Lading en PDF y ver el expediente **rellenarse solo** con IA. Es el mayor contraste contra Visual Trans, CargoWise, ClickAndCargo o Bytemaster, que obligan a teclear todo a mano.

---

## 2. Hallazgos del mercado (la tesis afinada tras analizar 6 competidores)

> Actualizado tras examinar las webs reales de Visual Trans, Bitácora, Bytemaster, CargoWise y DEIWorld. Detalle completo en `MANANN-COMPETITIVE.md`. La premisa inicial del informe ("el sector no tiene IA") quedó **refutada**.

- **La IA ya existe en casi todos los líderes** — Visual Trans (4 productos), Bytemaster (Copilot + OCR de facturas), CargoWise (ComplianceWise). Bitácora y DEIWorld no. Pero en todos es IA **añadida al borde**, nunca el flujo nativo "documento → expediente". **Ahí está el hueco real**, no en "tener IA".
- **CargoWise** (líder mundial, WiseTech Global) no es competidor sino el techo: 17.000+ orgs, atrincheramiento "formidable" (Morningstar). Prueba de que el modelo incumbente **funciona comercialmente**. Por eso "obsoleto" debe escoparse al segmento pequeño-mediano y a la experiencia, no al negocio.
- **Patrón del sector:** muro de ventas universal (sin precio, sin probar), complejidad endémica (academias: WiseTech Academy, _b Learn), consolidación por adquisición (VT compró DEIWorld oct-2025 → la modernización llega comprando, no reinventando).
- Los **pecados demostrables** que la demo puede ridiculizar: (1) reintroducción manual desde PDFs, (2) IA periférica vs. nativa, (3) curva de aprendizaje que exige academia, (4) producto escondido tras muro de ventas, (5) deuda técnica / legacy (DEIWorld: Joomla © 2006).
- **Contexto de negocio:** los transitarios gastan 62-85% de ingresos en capacidad de transporte (McKinsey) y operan con márgenes EBIT de 1-11%. **Implicación:** cada minuto de tecleo manual erosiona directamente un margen ya fino.
- **El hueco honesto de Manann:** IA **nativa de extremo a extremo**, **sin manual**, **sin legacy**, **demostrable en vivo sin comercial**, para el transitario pequeño-mediano que CargoWise sobredimensiona y los españoles atienden con software datado.

---

## 3. El nombre: cómo llegamos a "Manann"

Recorrido de naming, de lo descriptivo a lo mítico:
- Se descartó lo descriptivo (-Trans, -Cargo, -Soft, -Sys) por sonar a lo que se quiere ridiculizar.
- Se exploró mitología grecorromana (Kairós, Atlas, Mercurio) → demasiado trillada.
- Se viró a mitología **nórdica y celta** por escasez en software. Bifröst gustó pero estaba muy cogido en el mundo digital.
- **Lir** (dios celta del mar) enganchó, pero "Lir" solo colisiona con una software house irlandesa y es flojo para SEO (3 letras).
- **Resolución: Manann** — recorte de **Manannán mac Lir**, hijo de Lir, el dios que *gobierna* las travesías. Corto, rotundo, sin colisión en logística, conserva la raíz marina.

**El mito como producto:** Manannán cruza los océanos en *Scuabtuinne*, un barco que **navega sin velas y llega solo a su destino**; envuelve sus islas en niebla (*féth fíada*); monta a *Aenbarr*, un caballo que galopa sobre el mar. → El sistema conoce la ruta; tú no remas.

> Pendiente si escala: verificar dominio (.com/.app) y marca (OEPM/EUIPO). No comprobado en sesión.

---

## 4. Identidad de marca

- **Tagline:** *El sistema conoce la ruta. Tú no remas.*
- **Voz:** calma con autoridad; concreta (lenguaje real del transitario); el humano manda (la IA propone/extrae, el humano confirma); el mito es estructura, no decoración.
- **El enemigo:** no la ausencia de IA (casi todos la tienen ya), sino la **IA periférica y enterrada** — añadida al borde, escondida tras muros de venta, lastrada por complejidad (academias) y legacy. La experiencia rota para el segmento pequeño-mediano.
- **Decisión visual clave — NUNCA azul.** Todo el sector viste de azul corporativo; Manann usa el **verde-pizarra del mar atlántico** + **niebla cálida** + **ámbar de faro**. En una sala de capturas azules, una pantalla verde-niebla se recuerda.

Detalle completo en `MANANN-storytelling.md`.

---

## 5. Sistema de diseño (decisiones cerradas)

- **Tema dual** vía `data-theme`: dark (tinta de mar #0B1418) y light (niebla cálida #EEF1ED, **nunca blanco puro**). Ambos de primera clase — un ERP se usa 8h/día.
- **Color con significado:** sea-green (`primary`, #34A092 dark / #1F7A6E light) = marca/CTA/foco, escaso. Ámbar (`accent`, #E0A458 / #9A5E0E) = **solo "lo hizo la IA"** y estado. Sin tercer acento cromático.
- **Prioridades** (módulo operaciones): paleta propia de 4 niveles (low slate / med cian-teal / high naranja / urgent terracota), nunca ámbar. Siempre con la palabra al lado (accesibilidad daltonismo).
- **Dos radios:** 10px en todo control in-app; pill (9999px) **solo** en hero CTA, status y toggle. (Se discutió full-rounded; se descartó para in-app por restar seriedad operativa.)
- **Tipografía (Google Fonts):** Fraunces (serif variable, display, voz mítica) + Inter Tight (cuerpo) + JetBrains Mono (datos/IDs). `opsz = round(fontSize px)`, rango práctico 22-72.
- **Iconos:** Lucide (default de shadcn, se mantiene por facilidad), tuneado con strokeWidth 1.5 + linecaps redondeados para ganar calidez. (Se evaluó Phosphor; se descartó porque la diferenciación no está en los iconos.)
- **Contraste:** los 30+ pares texto/UI están **verificados WCAG 2.1 AA por cálculo** (no estimados). Tabla en `MANANN-DESIGN.md`.
- **Motion:** calma; dos momentos firma (cross-fade de tema = niebla; cascada de relleno IA = el latido). Respeta `prefers-reduced-motion`.

Detalle completo en `MANANN-DESIGN.md`; resumen operativo en `colors.prompt.md`; tokens en `globals.css`.

---

## 6. Stack técnico (free tier, decidido)

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Actions, sin escribir API |
| Estilos | Tailwind v4 + shadcn/ui tokenizado | Posees el código, sin lock-in |
| Iconos | Lucide | Default de shadcn, cero fricción |
| DB | Neon Postgres | free, scale-to-zero |
| ORM | Drizzle | control + edge |
| Auth | Better Auth | vive en Neon, sin servicio externo, RGPD-friendly |
| IA documental | Gemini Flash + Vercel AI SDK | free tier, multimodal PDF, `generateObject` + Zod |
| Archivos | Vercel Blob | 1 GB free |
| Email | Resend | 3.000/mes free |
| Tracking | ShipsGo (3 créditos) + mock | real donde se pueda |
| Deploy | Vercel Hobby | free (uso no comercial) |

**Decisiones de NO hacer:** sin Supabase (Neon ya es la DB; se evitó la redundancia inicial Neon+Supabase+Clerk), sin tRPC, sin monorepo, sin Redis, sin GraphQL. Server Actions cubren el 95%.

**Plan B de IA** si Gemini falla (<90% campos): Claude Sonnet o Mistral OCR 3 (`mistral-ocr-2512`).

---

## 7. Plan de construcción (9 PRs)

Orden: la **home** abre (PR-2) como punto de partida; el **flujo wow** (PR-7) se valida pronto por ser lo más incierto; el resto de la landing se remata al final (PR-9).

1. Scaffolding · 2. Landing HOME · 3. Auth · 4. Esquema+seed · 5. UI base ERP · 6. Subida PDF · 7. **Flujo wow ⭐** · 8. Tracking · 9. Resto landing + pulido.

**Landing = escaparate de demo** (5 páginas: home, features, nosotros, contacto, legales). Visualmente completa, pero legales en placeholder y contacto simple — sin RGPD de producción ni captación pública. Se endurece solo si el proyecto pasa a real.

**Real vs. mockeado:** real = auth, esquema, subida, **extracción IA**, UI, landing, 2-3 tracking (ShipsGo). Mockeado creíble (y etiquetado) = AEAT/SII, Portic, Inttra, navieras, tracking sin crédito, legales. Regla de honestidad: nunca presentar lo simulado como real.

Detalle ejecutable en `BUILD-PLAN.md`.

---

## 8. Riesgos y mitigaciones

- **"Solo una UI bonita":** el mayor riesgo. Mitigación: la extracción IA es real y funciona en vivo; enmarcar el valor en el coste del data-entry.
- **Fallo de IA en directo:** precachear extracción de los PDFs de demo + vídeo de respaldo. No depender de la API en vivo ante stakeholders.
- **Free tiers:** Vercel 4h CPU/mes y uso no comercial; Gemini 1.500 req/día; ShipsGo 3 créditos; Neon 0,5 GB. Para 1-2 usuarios sobra; vigilar en pruebas. Si comercializa → Vercel Pro.
- **Expectativas infladas:** etiquetar qué es demostrativo vs. producción.

---

## 9. El kit de archivos producido

| Archivo | Rol |
|---|---|
| `CLAUDE.md` | Cerebro de sesión de Claude Code (lo lee al iniciar). Lean, <100 líneas. |
| `BUILD-PLAN.md` | 9 PRs ejecutables + esquema de datos + flujo wow + real/mock. |
| `MANANN-DESIGN.md` | Fuente de verdad visual (tokens, contraste verificado, motion, iconos). |
| `colors.prompt.md` | Resumen operativo del diseño para sesiones de Claude Code. |
| `MANANN-storytelling.md` | Voz de marca, mito, banco de mensajes. |
| `MANANN-COMPETITIVE.md` | Inteligencia competitiva maestra (6 competidores) + tesis afinada. |
| `MANANN-COMPETITIVE-{visualtrans,bitacora,bytemaster,cargowise,deiworld}.md` | Teardowns individuales detallados. |
| `globals.css` | Tokens listos para shadcn + Tailwind v4 (ambos temas). |
| `manann-brand-v2.html` | Hoja de marca interactiva (toggle dark/light, comparativa de radios). |

---

## 10. Pasos inmediatos

1. Poner el kit en una carpeta vacía. Abrir Claude Code y decir: **"Lee CLAUDE.md y empezamos por el PR-1."**
2. Al hacer `shadcn init`, elegir **formato HSL** (los tokens lo están). Si fuerza OKLCH, convertir — coherencia, no mezcla.
3. Mover fuentes de `@import` a `next/font` antes de producción (para la demo, el `@import` vale).
4. Generar la capa `.claude/` (settings.json que deny `.env`, .claudeignore, blueprints) ejecutando la skill bootstrap-project sobre la carpeta real — blinda credenciales, algo fuera del alcance de este chat.

---

## 11. Decisiones abiertas (conscientes, no olvidos)

- Dominio y marca de "Manann" — verificar si escala.
- Formato de variables shadcn (HSL vs OKLCH) — decidir al init.
- Endurecer legales + RGPD + consentimiento de cookies — solo si la landing pasa a pública real.
- Icon set definitivo confirmado (Lucide); priority tags y motion ya especificados.

---

*Fin del resumen. La identidad y el sistema están cerrados; el siguiente movimiento es construir.*
