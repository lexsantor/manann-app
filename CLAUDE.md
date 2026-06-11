# CLAUDE.md — Manann

> Lee este archivo al inicio de cada sesión. Para el plan de construcción paso a paso, lee `BUILD-PLAN.md`. Para el sistema de diseño, `MANANN-DESIGN.md` + `colors.prompt.md`. Para la voz de marca, `MANANN-storytelling.md`.

## Qué es Manann

Una **demo** de un ERP transitario (freight forwarder) de próxima generación. El objetivo NO es vender un producto: es **demostrar a stakeholders lo obsoletos que están los ERPs actuales del sector** (Visual Trans, CargoWise, ClickAndCargo, Bytemaster). Construida en solitario, en free tier, coste 0 €.

**El momento "wow"** (el corazón de todo): el usuario arrastra un Bill of Lading en PDF y el expediente de envío **se rellena solo** mediante IA. Donde la competencia obliga a teclear 40 campos a mano, Manann lee el documento y el humano solo confirma.

**Posicionamiento:** el enemigo no es la ausencia de IA (casi todos los competidores ya la tienen), sino la **IA periférica y enterrada** — añadida al borde (copilotos, OCR), escondida tras muros de venta, lastrada por academias y legacy. Manann gana con **IA nativa de extremo a extremo** (documento→expediente, no un módulo), **sin manual**, **sin legacy**, **demostrable en vivo**. UX calma, rápida, grado Linear/Notion. La IA **propone, extrae, prepara**; el humano **confirma**. Nunca azul corporativo (es el cliché del sector). Análisis competitivo completo en `MANANN-COMPETITIVE.md`.

El proyecto tiene dos partes: una **landing de demo** (5 páginas, escaparate público que abre la presentación) y el **ERP** (el producto protegido tras login, donde vive el momento wow). La home es el punto de partida; el ERP es el destino.

## Stack (decidido — no reabrir sin motivo)

| Capa | Elección | Razón en una línea |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + Server Actions, sin escribir API |
| Lenguaje | TypeScript (strict) | — |
| Estilos | Tailwind v4 + shadcn/ui tokenizado | Posees el código, sin lock-in |
| Iconos | Lucide (default de shadcn) | strokeWidth 1.5 + linecaps round (ver DESIGN.md) |
| DB | Neon Postgres | free tier, scale-to-zero |
| ORM | Drizzle | control + edge-ready |
| Auth | Better Auth | vive en Neon, sin servicio externo, RGPD-friendly |
| IA documental | Gemini (Flash) vía Vercel AI SDK | free tier, multimodal PDF nativo, `generateObject` + Zod |
| Archivos | Vercel Blob | 1 GB free, integración nativa |
| Email | Resend | 3.000/mes free, React Email |
| Tracking | ShipsGo (3 créditos) + mock | real donde se pueda, simulado creíble el resto |
| Deploy | Vercel (Hobby) | free, uso no comercial |

**No over-engineering:** sin tRPC, sin monorepo, sin Redis, sin GraphQL, sin Supabase (Neon ya es la DB). Server Actions cubren el 95% de los casos.

## Reglas no-negociables

1. **Diseño:** todo sale del sistema. Usa clases semánticas de shadcn (`bg-background`, `text-primary`, `border-border`…) que resuelven desde `globals.css`. **Nunca hardcodees hex.** Tema dual vía `data-theme` (dark default + light), ambos de primera clase.
2. **Significado del color:** sea-green (`primary`) = marca/CTA/foco, escaso. Ámbar (`accent`) = SOLO "lo hizo la IA" (campos extraídos, confianza) y estado. Prioridades = paleta propia (low/med/high/urgent), nunca ámbar. Sin tercer acento cromático.
3. **Dos radios:** `rounded-md` (10px) en todo control in-app. `rounded-full` SOLO en hero CTA, pills de estado y toggle de tema.
4. **Contraste:** cada par texto/UI está verificado WCAG 2.1 AA en `MANANN-DESIGN.md`. Tras cualquier cambio de color, re-verifica (4.5:1 texto / 3:1 UI+grande) antes de commitear.
5. **Voz:** español (España), lenguaje real del transitario (BL, contenedor, puerto, ETA, expediente). La IA propone/extrae; el humano confirma. Errores responsables, sin drama.
6. **Honestidad en la demo:** lo mockeado se etiqueta visualmente ("Simulación — integración real en producción"). Nunca afirmar que una integración simulada es real.

## Guardarraíles de comportamiento (preferencia del owner)

- **Liderar con lo que está mal o falta antes que con lo que está bien.** Correcciones primero.
- **Sin validación vacía.** Nada de "buena idea" sin una razón concreta en la misma frase.
- **Si el owner suena muy seguro pero hay un contraargumento, exponerlo antes de proceder.** La confianza no es evidencia.
- **Ante respuesta vaga, pedir el caso concreto antes de avanzar.**
- **Diferenciar hechos de inferencias.** No presentar suposiciones como hechos. Aspirar a confianza Alta; si algo queda en Media, decirlo y por qué.

## Estructura prevista (el framework la crea, no tú)

```
manann/
├── app/
│   ├── (marketing)/      # landing pública: home, features, nosotros, contacto, legales
│   ├── (auth)/           # login, magic link
│   ├── (app)/            # dashboard, expedientes, tracking (protegido)
│   └── api/              # solo lo imprescindible (webhooks, upload)
├── components/           # shadcn + propios (Icon wrapper, nav, footer)
├── db/                   # schema Drizzle + migraciones + seed
├── lib/                  # ai (extracción), auth, blob, utils
└── globals.css           # tokens (ya provisto)
```

## Free-tier — vigilar

Vercel Hobby (4 h Active CPU/mes, uso no comercial), Gemini (1.500 req/día), ShipsGo (3 créditos), Neon (0,5 GB, 100 CU-h). Para 1-2 usuarios sobra; no agotar en pruebas. Para demo en vivo: precachear la extracción de los PDFs de demo y tener vídeo de respaldo (no depender de la API en directo ante stakeholders).

## Comandos

```bash
# Scaffold inicial (PR-1):
bunx create-next-app@latest . --typescript --tailwind --app --no-eslint
# Tras scaffold, reemplazar globals.css por el provisto.
bun dev          # desarrollo
bun run build    # build de producción
bunx drizzle-kit generate && bunx drizzle-kit migrate   # migraciones
```

## Orden de trabajo

Sigue `BUILD-PLAN.md` — 9 PRs atómicos en orden. No saltar fases. Cada PR se cierra funcionando y desplegable antes del siguiente.

El proyecto incluye una **landing de 5 páginas** (home, features, nosotros, contacto, legales) como **escaparate de demo**: visualmente completa, pero legales en placeholder y contacto simple (sin RGPD de producción). La **home abre como punto de partida** (PR-2, estática, sin auth), pero el **flujo wow del ERP** (PR-7) se valida pronto por ser lo técnicamente más incierto; el resto de páginas de landing se rematan al final (PR-9). **Si solo hubiera tiempo para una cosa: PR-7 (el flujo wow)** — es el 80% del impacto.

## Decisiones abiertas (resolver al arrancar)

- **Formato de variables shadcn:** al hacer `shadcn init`, elegir HSL (los tokens provistos están en HSL). Si la CLI fuerza OKLCH, convertir o forzar HSL — coherencia, no mezcla.
- **Fuentes en producción:** mover de `@import` en CSS a `next/font` o `<link>` en `<head>` (rendimiento). Para la demo, el `@import` actual vale.
