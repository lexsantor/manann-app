# Manann — Design system primer (for Claude Code)

Paste this at the start of a Claude Code session, or keep it in the repo root. It is the operational summary of `MANANN-DESIGN.md` and `MANANN-storytelling.md`. When in doubt, those two files win.

## What Manann is
A demo of a next-generation freight-forwarder ERP whose purpose is to make legacy ERPs (Visual Trans, CargoWise, ClickAndCargo…) look obsolete. The hero moment: a user drops a Bill of Lading PDF and the shipment file (expediente) **fills itself in** via AI. UX is calm, fast, Linear/Notion-grade. Voice: calm authority, the human confirms, the machine proposes. **Never navy blue** — that's the sector cliché.

## Stack
Next.js 15 (App Router) · Tailwind v4 · shadcn/ui (tokenized to this system) · Neon Postgres · Drizzle · Better Auth · Gemini (AI SDK, doc extraction) · Vercel Blob · Resend. All free-tier.

## Non-negotiable rules
1. **Theme**: dual, via `data-theme="dark"` (default) / `data-theme="light"` on `<html>`. Both first-class. Use shadcn semantic classes (`bg-background`, `text-foreground`, `bg-card`, `text-primary`, `text-muted-foreground`, `border-border`) — they resolve from `globals.css`. Never hardcode hex.
2. **Color meaning**:
   - **sea-green** (`primary`) = brand mark, primary CTA, focus ring, link emphasis. Scarce.
   - **lighthouse-amber** (`accent`) = ONLY "the machine did this" (AI-extracted fields, confidence tags) and status. Never decorative.
   - **slate** (`secondary`) = secondary button borders, muted structure.
   - No third chromatic accent.
3. **Two radii**: `rounded-md` (10px) on every in-app control. `rounded-full` ONLY on: hero CTA, status pills, theme toggle. Never pill-round in-app buttons.
4. **Type**: `font-display` (Fraunces serif) for h1–h3 and card titles, weight 500, negative tracking. `font-sans` (Inter Tight) for body/buttons, weight 400. `font-mono` (JetBrains Mono) for data/IDs/eyebrows. Eyebrows: use `.eyebrow` (mono, uppercase, +tracking). Set `font-optical-sizing: auto` on Fraunces; `opsz = round(fontSize px)`, working range 22–72 (below ~14px use Inter Tight, never Fraunces).
5. **Icons**: Lucide (shadcn default — keep it). Global defaults: `size=20`, `strokeWidth=1.5`, rounded linecaps/joins. Wrap in one `<Icon>` component; don't set per-call. 16px in dense tables, 24px in empty states.
6. **Light canvas is warm fog `#EEF1ED`, never pure white.** Dark canvas is sea-ink `#0B1418`, never pure black.
7. **Contrast**: every text/UI pair is verified WCAG 2.1 AA in the DESIGN.md table. After ANY color change, re-check the pair (4.5:1 text / 3:1 UI+large) before committing.

## Motion
Calm, purposeful. Durations: 120ms (states) / 240ms (most) / 400ms (theme cross-fade, reveals). Easings: `--ease-standard`, `--ease-out`. Two signature moments only:
- **Theme cross-fade** (400ms) — fog rolling in, not a hard flip.
- **AI-fill reveal** — fields cascade top-to-bottom, 60ms stagger, fade+rise 6px, amber badge scales in last. Use `.ai-reveal` with `--i` index. Once per document; re-renders instant.
No bounce/overshoot. Always honor `prefers-reduced-motion`.

## Key tokens (reference — full set in globals.css)
| Role | Dark | Light |
|---|---|---|
| canvas / background | #0B1418 | #EEF1ED |
| surface-1 / card | #122026 | #FFFFFF |
| ink / foreground | #E8EDEA | #0E1A1E |
| ink-muted | #8A9B96 | #566661 |
| primary (sea-green) | #34A092 | #1F7A6E |
| accent (amber) | #E0A458 | #9A5E0E |
| secondary (slate) | #4A6670 | #4A6670 |
| border / hairline | #1E3138 | #D6DED8 |
| success | #5BBF8A | #3DA372 |
| destructive | #D9694E | #C0543B |

**Priority tags** (operations module — pill: text+dot = hue, fill = hue at 13%; use classes `.priority-low/-med/-high/-urgent`):
| Level | Dark | Light |
|---|---|---|
| Low (slate) | #9FB0AA | #5A6B66 |
| Medium (cyan-teal) | #57B0C4 | #157A8C |
| High (orange) | #ED9A52 | #A85008 |
| Urgent (terracotta) | #EC7A66 | #B83A2B |

Priority hues never use amber (amber = AI only). Never rely on color alone — always pair with the label word (Urgente/Alta…) for colorblind accessibility.

## The expediente card is the protagonist
Lead UI sections with it (it's Manann's "product screenshot"). `rounded-xl` (16px). Inside: `field` components (`rounded-sm` 6px); AI-extracted ones are `field-ai` — amber border + an `ai-badge` showing confidence (e.g. `IA · 0.97`), mono font. Fields under ~0.70 confidence get stronger amber to invite human review.

## Voice in copy
Spanish (Spain), concrete domain language (BL, contenedor, puerto, ETA, expediente). The AI proposes/extracts/prepares; the human confirms. No exclamation spam. Errors are responsible, no drama: "No hemos podido leer el contenedor. Complétalo tú y seguimos."
