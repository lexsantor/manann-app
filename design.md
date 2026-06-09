---
version: alpha
name: Manann-design-system
description: "An atmospheric dual-theme product system for a next-generation freight-forwarder ERP, built around a deep sea-ink canvas (#0B1418) in dark and a warm-fog off-white (#EEF1ED) in light — deliberately rejecting the corporate navy blue of every legacy logistics tool. The single brand hue is a Celtic sea-green (#34A092 dark / #1F7A6E light) used on the brand mark, primary CTAs, and focus rings; a lighthouse-amber (#E0A458 dark / #9A5E0E light) is the lone secondary accent, reserved almost exclusively for AI-extracted fields and status. All foreground/background pairs are verified to meet or exceed WCAG 2.1 AA (4.5:1 text, 3:1 UI/large). Display type is set in Fraunces (a variable serif) at 500–600 with negative tracking for an editorial, mythic voice; body in Inter Tight; data and IDs in JetBrains Mono. Surfaces lift via a light ladder with hairline borders and faint atmospheric gradient meshes (the fog of Manannán). Two radii coexist: 10px on in-app controls for operational seriousness, 9999px pills reserved for hero CTAs, status chips, and the theme toggle. All fonts are free (Google Fonts)."

colors:
  # --- shared brand ---
  primary: "#34A092"
  on-primary: "#04100D"
  primary-hover: "#46B3A4"
  primary-focus: "#34A092"
  secondary: "#4A6670"
  accent: "#E0A458"
  accent-soft: "rgba(224,164,88,0.14)"
  accent-border: "rgba(224,164,88,0.32)"
  semantic-success: "#5BBF8A"
  semantic-danger: "#D9694E"
  semantic-overlay: "rgba(4,16,13,0.6)"
  # priority tags (dark / light text values)
  priority-low: "#9FB0AA"
  priority-low-light: "#5A6B66"
  priority-med: "#57B0C4"
  priority-med-light: "#157A8C"
  priority-high: "#ED9A52"
  priority-high-light: "#A85008"
  priority-urgent: "#EC7A66"
  priority-urgent-light: "#B83A2B"
  # --- dark theme (default) ---
  canvas: "#0B1418"
  surface-1: "#122026"
  surface-2: "#16282F"
  surface-3: "#1B2F37"
  ink: "#E8EDEA"
  ink-muted: "#8A9B96"
  ink-subtle: "#7E8F88"
  hairline: "#1E3138"
  hairline-strong: "#2A434C"
  mesh-1: "rgba(46,139,127,0.16)"
  mesh-2: "rgba(74,102,112,0.18)"
  # --- light theme (data-theme="light") ---
  light-primary: "#1F7A6E"
  light-on-primary: "#FFFFFF"
  light-primary-hover: "#196357"
  light-accent: "#9A5E0E"
  light-canvas: "#EEF1ED"
  light-surface-1: "#FFFFFF"
  light-surface-2: "#F6F8F5"
  light-surface-3: "#EDF1ED"
  light-ink: "#0E1A1E"
  light-ink-muted: "#566661"
  light-ink-subtle: "#5F6E69"
  light-hairline: "#D6DED8"
  light-hairline-strong: "#C2CDC6"

typography:
  display-xl:
    fontFamily: Fraunces
    fontSize: 72px
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: -2.2px
  display-lg:
    fontFamily: Fraunces
    fontSize: 52px
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: -1.4px
  display-md:
    fontFamily: Fraunces
    fontSize: 38px
    fontWeight: 500
    lineHeight: 1.14
    letterSpacing: -0.8px
  headline:
    fontFamily: Fraunces
    fontSize: 27px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: -0.5px
  card-title:
    fontFamily: Fraunces
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.3px
  subhead:
    fontFamily: Inter Tight
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.1px
  body-lg:
    fontFamily: Inter Tight
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body:
    fontFamily: Inter Tight
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: Inter Tight
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: Inter Tight
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: 0
  button:
    fontFamily: Inter Tight
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0
  eyebrow:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: 1.8px
  mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 6px
  md: 10px
  lg: 14px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 11px 18px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 11px 18px
  button-hero-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 13px 26px
  expediente-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 24px
  feature-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 12px 14px
  field-ai:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 12px 14px
  text-input:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 10px 13px
  status-badge:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 11px
  ai-badge:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.accent}"
    typography: "{typography.mono}"
    rounded: "{rounded.sm}"
    padding: 2px 7px
  theme-toggle:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 7px 14px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xs}"
    height: 56px
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 32px
---

## Overview

Manann is a **dual-theme** product and marketing system for a freight-forwarder ERP. Unlike Linear (dark-only), Manann ships both a dark canvas (`{colors.canvas}` #0B1418, a deep sea-ink) and a warm-fog light canvas (`{colors.light-canvas}` #EEF1ED) toggled via a `data-theme` attribute on `<html>`. The light theme is intentionally **not** pure white — the off-white fog references the *féth fíada*, the mist of Manannán, and is gentler for the 8-hour operational use that an ERP demands.

The single brand hue is a **Celtic sea-green** (`{colors.primary}` #34A092 in dark, #1F7A6E in light) — never the corporate navy blue that saturates the logistics sector. The lone secondary accent is a **lighthouse-amber** (`{colors.accent}` #E0A458 / #9A5E0E) held in reserve almost entirely for **AI-extracted fields and status pills** — so the eye is drawn precisely to the product's "wow" moment (the document that fills itself in). Every text and UI color pair is **verified against WCAG 2.1 AA** (see the Colors → Verified Contrast table).

Display type is **Fraunces**, a variable serif, at weight 500–600 with negative tracking — an editorial, mythic voice that separates Manann from the Inter/Roboto monotony of the sector. Body is **Inter Tight**; data, IDs, and eyebrows are **JetBrains Mono**. All three are free Google Fonts.

Surfaces lift through a light ladder (canvas → surface-1 → surface-2 → surface-3) carried by hairline borders, plus faint **atmospheric gradient meshes** (`{colors.mesh-1}`, `{colors.mesh-2}`) — the only place Manann permits atmosphere, evoking sea fog.

**Key Characteristics:**
- **Dual-theme** system via `data-theme` — dark sea-ink and warm-fog light, both first-class.
- **Sea-green brand accent**, used scarcely on brand mark, primary CTA, focus ring, link emphasis. Never navy blue.
- **Lighthouse-amber** as a single secondary accent, reserved for AI-extracted data and status.
- **Two radii on purpose**: `{rounded.md}` 10px for all in-app controls (operational seriousness, the Linear/Vercel register); `{rounded.pill}` 9999px reserved for hero CTAs, status chips, and the theme toggle.
- **Fraunces serif display** for mythic/editorial voice; Inter Tight body; JetBrains Mono for data.
- Faint gradient mesh fog is the only atmosphere; otherwise surface ladder + hairlines carry depth.

## Colors

> Theme is switched by `data-theme="dark"` (default) / `data-theme="light"` on the root element. Each token below has a light counterpart prefixed `light-`.

### Brand & Accent
- **Sea-Green** ({colors.primary}): the signature Manann accent — primary CTA, brand mark, link emphasis, focus ring. #34A092 dark, #1F7A6E light (darkened for contrast on the fog canvas).
- **Sea-Green Hover** ({colors.primary-hover}): lighter green for hovered primary CTA.
- **Lighthouse-Amber** ({colors.accent}): the lone secondary accent — AI-extracted fields, status pills, document references. #E0A458 dark, #9A5E0E light (the light value is darkened specifically so amber is legible as TEXT on the fog canvas, not only as a fill). Use scarcely; it marks "the machine did this."
- **Pizarra / Slate** ({colors.secondary}): #4A6670 — secondary button borders, muted structural accents. Shared across themes.

### Verified Contrast (WCAG 2.1 AA)

> Computed ratios. Threshold: 4.5:1 for normal text, 3:1 for large text (≥24px or ≥19px bold) and UI components. All pairs below **pass**.

| Pair | Theme | Ratio | Threshold |
|---|---|---|---|
| ink #E8EDEA on canvas #0B1418 | dark | 15.73:1 | 4.5 |
| ink #E8EDEA on surface-1 #122026 | dark | 14.07:1 | 4.5 |
| ink-muted #8A9B96 on canvas | dark | 6.39:1 | 4.5 |
| ink-muted #8A9B96 on surface-1 | dark | 5.72:1 | 4.5 |
| ink-subtle #7E8F88 on canvas | dark | 5.47:1 | 4.5 |
| ink-subtle #7E8F88 on surface-1 | dark | 4.90:1 | 4.5 |
| primary #34A092 on canvas (UI/large) | dark | 5.84:1 | 3.0 |
| on-primary #04100D on primary #34A092 | dark | 6.07:1 | 4.5 |
| accent #E0A458 on canvas | dark | 8.53:1 | 3.0 |
| accent #E0A458 on surface-1 | dark | 7.63:1 | 3.0 |
| success #5BBF8A on surface-1 | dark | 7.35:1 | 3.0 |
| danger #D9694E on surface-1 | dark | 4.82:1 | 3.0 |
| ink #0E1A1E on canvas #EEF1ED | light | 15.56:1 | 4.5 |
| ink #0E1A1E on surface-1 #FFFFFF | light | 17.72:1 | 4.5 |
| ink-muted #566661 on canvas | light | 5.32:1 | 4.5 |
| ink-muted #566661 on surface-1 | light | 6.05:1 | 4.5 |
| ink-subtle #5F6E69 on canvas | light | 4.70:1 | 4.5 |
| ink-subtle #5F6E69 on surface-1 | light | 5.36:1 | 4.5 |
| primary #1F7A6E on canvas (text) | light | 4.53:1 | 4.5 |
| on-primary #FFFFFF on primary #1F7A6E | light | 5.16:1 | 4.5 |
| accent #9A5E0E on canvas (text) | light | 4.63:1 | 4.5 |
| accent #9A5E0E on surface-1 (text) | light | 5.27:1 | 4.5 |
| priority-low #9FB0AA on surface-1 | dark | 7.35:1 | 4.5 |
| priority-med #57B0C4 on surface-1 | dark | 6.67:1 | 4.5 |
| priority-high #ED9A52 on surface-1 | dark | 7.41:1 | 4.5 |
| priority-urgent #EC7A66 on surface-1 | dark | 5.98:1 | 4.5 |
| priority-low #5A6B66 on surface-1 | light | 5.63:1 | 4.5 |
| priority-med #157A8C on surface-1 | light | 5.01:1 | 4.5 |
| priority-high #A85008 on surface-1 | light | 5.50:1 | 4.5 |
| priority-urgent #B83A2B on surface-1 | light | 5.71:1 | 4.5 |

To re-verify after any color edit, run the contrast check (a 20-line Python script using the WCAG relative-luminance formula) on the changed pair before shipping.

### Surface (dark / light)
- **Canvas** ({colors.canvas} / {colors.light-canvas}): page background. #0B1418 sea-ink / #EEF1ED warm fog.
- **Surface 1** ({colors.surface-1} / {colors.light-surface-1}): cards, panels, the expediente card. #122026 / #FFFFFF.
- **Surface 2** ({colors.surface-2} / {colors.light-surface-2}): hovered/featured surfaces.
- **Surface 3** ({colors.surface-3} / {colors.light-surface-3}): sub-nav, dropdowns, nested surfaces.
- **Hairline** ({colors.hairline} / {colors.light-hairline}): 1px borders on cards and dividers.
- **Hairline Strong** ({colors.hairline-strong} / {colors.light-hairline-strong}): stronger borders, input focus.
- **Mesh 1 / Mesh 2** ({colors.mesh-1}, {colors.mesh-2}): radial gradient fog on the canvas. Light theme uses ~0.10 opacity.

### Text (dark / light)
- **Ink** ({colors.ink} / {colors.light-ink}): headlines and emphasized body. #E8EDEA / #0E1A1E.
- **Ink Muted** ({colors.ink-muted} / {colors.light-ink-muted}): secondary type, meta. #8A9B96 / #566661.
- **Ink Subtle** ({colors.ink-subtle} / {colors.light-ink-subtle}): tertiary, footer, captions. #7E8F88 / #5F6E69 — tuned to clear AA (4.5:1) even at small sizes on both canvas and surface-1.

### Semantic
- **Success** ({colors.semantic-success}): #5BBF8A — delivered states, positive confirmation.
- **Danger** ({colors.semantic-danger}): #D9694E — extraction failure, blocking errors. Warm terracotta, not fire-engine red, to stay in palette.
- **Overlay** ({colors.semantic-overlay}): modal scrim.

### Priority Tags (operations module)

Shipment/incident priority uses a **four-level scale** rendered as a `status-badge`-style pill (soft tint fill + colored text + optional leading dot). The four hues are mutually distinct AND distinct from amber — amber is reserved for "the machine did this," so it is never a priority color. Text values are verified ≥4.5:1 on the tag's surface; dots/borders ≥3:1 as UI.

| Level | Dark text | Light text | Hue |
|---|---|---|---|
| **Low** ({colors.priority-low}) | #9FB0AA | #5A6B66 | calm slate-grey |
| **Medium** ({colors.priority-med}) | #57B0C4 | #157A8C | cyan-teal (distinct from sea-green) |
| **High** ({colors.priority-high}) | #ED9A52 | #A85008 | orange |
| **Urgent** ({colors.priority-urgent}) | #EC7A66 | #B83A2B | terracotta-red |

Render: pill background = the level's hue at ~12–14% opacity (`color-mix` or rgba), text = the value above, leading dot = same as text. Never rely on color alone — always pair with the label word ("Urgente", "Alta"…) for colorblind accessibility.

## Typography

### Font Family
- **Fraunces** (Google Fonts, variable serif, `opsz` 9–144) — the display family; carries display-xl through card-title. A characterful serif with optical sizing that gives Manann its mythic/editorial voice and separates it from the Inter/Roboto monotony of the sector. Fallback: `Georgia, 'Times New Roman', serif`.

#### Fraunces optical sizing (`opsz`) per step
`opsz` should track the pixel size at which the type renders, so the serif's contrast and detail stay correct. Set `font-optical-sizing: auto` so the browser maps it automatically, and pin explicit values only where a step needs to deviate. Mapping for Manann's display steps:

| Step | Size | `opsz` |
|---|---|---|
| `display-xl` | 72px | 72 |
| `display-lg` | 52px | 52 |
| `display-md` | 38px | 38 |
| `headline` | 27px | 27 |
| `card-title` | 22px | 22 |

Rule of thumb: `opsz = round(fontSize in px)`, clamped to the 9–144 range. Below ~14px Fraunces is not used (body switches to Inter Tight), so the low end of the axis is never exercised; the practical working range is 22–72.
- **Inter Tight** (Google Fonts) — body family, button labels, subheads. Dense and legible in tables and forms (80% of an ERP). Fallback: `system-ui, -apple-system, sans-serif`.
- **JetBrains Mono** (Google Fonts) — data, IDs (expediente refs, container numbers, UN/LOCODEs), eyebrows, AI-confidence tags. Fallback: `ui-monospace, 'SF Mono', Menlo, monospace`.

Google Fonts import:
`https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap`

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 72px | 500 | 1.04 | -2.2px | Largest hero headline (Fraunces) |
| `{typography.display-lg}` | 52px | 500 | 1.08 | -1.4px | Section opener headlines |
| `{typography.display-md}` | 38px | 500 | 1.14 | -0.8px | Sub-section headlines |
| `{typography.headline}` | 27px | 500 | 1.20 | -0.5px | Card-section / CTA banner heading |
| `{typography.card-title}` | 22px | 500 | 1.25 | -0.3px | Expediente / feature card title |
| `{typography.subhead}` | 20px | 400 | 1.40 | -0.1px | Lead body (Inter Tight) |
| `{typography.body-lg}` | 18px | 400 | 1.55 | 0 | Hero subhead, lead paragraphs |
| `{typography.body}` | 16px | 400 | 1.55 | 0 | Default body |
| `{typography.body-sm}` | 14px | 400 | 1.50 | 0 | Card body, table cells, footer |
| `{typography.caption}` | 12px | 500 | 1.40 | 0 | Captions, meta, field labels |
| `{typography.button}` | 14px | 500 | 1.20 | 0 | All button labels |
| `{typography.eyebrow}` | 11px | 500 | 1.30 | 1.8px | Section eyebrow (JetBrains Mono, uppercase, positive tracking) |
| `{typography.mono}` | 13px | 400 | 1.50 | 0 | Data, IDs, AI-confidence tags |

### Principles
- **Serif display, mono eyebrow.** Fraunces carries the mythic/editorial voice; the eyebrow flips to JetBrains Mono uppercase with positive tracking (+1.8px) to read as taxonomy/technical — the deliberate tension between myth and machine.
- **Negative tracking on display** (-2.2px at 72px), neutral on body.
- **Mono = data, never chrome.** JetBrains Mono is for expediente references, container numbers, ETAs, and AI-confidence scores — the "real operational data" signal.
- **Body weight 400, display weight 500.** Resist 700+; Fraunces at 500 already has presence.

## Layout

### Spacing System
- **Base unit**: 4px. Tokens: `{spacing.xxs}` 4 · `{spacing.xs}` 8 · `{spacing.sm}` 12 · `{spacing.md}` 16 · `{spacing.lg}` 24 · `{spacing.xl}` 32 · `{spacing.xxl}` 48 · `{spacing.section}` 96.
- Card interior padding: `{spacing.lg}` 24px (feature/expediente), `{spacing.xl}` 32px (testimonial/CTA).
- In-app button padding: 11px vertical · 18px horizontal. Hero CTA: 13px · 26px.
- Field padding: 12px vertical · 14px horizontal.

### Grid & Container
- Max content width ~1080px (tighter than Linear's 1280 — Manann is denser, more operational).
- Card grids 3-up desktop → 2-up tablet → 1-up mobile.
- The **expediente detail panel** (the AI-fill moment) spans full content width — it is the protagonist, the way Linear leads with product screenshots.

### Whitespace Philosophy
In dark, the sea-ink canvas IS the whitespace; sections separate by lifting onto surface-1 panels. In light, the warm-fog canvas plays the same role, with white (`{colors.light-surface-1}`) cards lifting *up* off the fog. `{spacing.section}` 96px between sections.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 (flat) | No shadow, no border | Body type, hero text, footer |
| 1 (lift) | `{colors.surface-1}` background, 1px `{colors.hairline}` | Default cards, expediente panels |
| 2 (lift) | `{colors.surface-2}`, 1px `{colors.hairline-strong}` | Hovered / featured cards |
| 3 (lift) | `{colors.surface-3}` | Sub-nav, dropdowns |
| 4 (focus) | 2px `{colors.primary-focus}` outline at 50% | Focused input / button |

Depth is carried by the surface ladder + hairlines. Soft shadows are permitted on the brand glyph and hero CTA only. The **gradient mesh fog** adds atmosphere on the canvas — Manann's one departure from Linear's no-gradient rule, justified by the myth (sea fog).

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Tiny chips, AI-confidence tags |
| `{rounded.sm}` | 6px | Fields, inline tags |
| `{rounded.md}` | 10px | **All in-app buttons, inputs** — the operational radius |
| `{rounded.lg}` | 14px | Feature cards |
| `{rounded.xl}` | 16px | Expediente panels (the protagonist) |
| `{rounded.xxl}` | 24px | Oversized CTA banners (rare) |
| `{rounded.pill}` | 9999px | **Hero CTA, status pills, theme toggle ONLY** |

**The two-radius rule** is intentional and load-bearing: pill (9999px) signals "consumer/marketing"; it is allowed ONLY on the landing hero CTA, status chips, and the theme toggle. Everything inside the product uses 10px — operational seriousness, so a stakeholder reads "system that replaces CargoWise," not "pretty app."

## Components

### Buttons
**`button-primary`** — Sea-green CTA, the default in-app primary action. Background `{colors.primary}`, text `{colors.on-primary}`, rounded `{rounded.md}` 10px, padding 11px 18px. Hover → `{colors.primary-hover}`.

**`button-secondary`** — Transparent with slate border. Background transparent, text `{colors.ink}`, 1px `{colors.secondary}` border, rounded `{rounded.md}` 10px.

**`button-hero-cta`** — The ONE pill button. Sea-green, rounded `{rounded.pill}`, padding 13px 26px. Landing hero only.

### Cards & Containers
**`expediente-card`** — The dominant card, frames a shipment file with its AI-extracted fields. Background `{colors.surface-1}`, rounded `{rounded.xl}` 16px, padding 24px, 1px `{colors.hairline}`. This is Manann's "product screenshot" — lead sections with it.

**`feature-card`** — Generic feature tile. Background `{colors.surface-1}`, rounded `{rounded.lg}` 14px, padding 24px.

### Fields & AI
**`field`** — A data field inside an expediente. Background `{colors.canvas}`, 1px `{colors.hairline}`, rounded `{rounded.sm}` 6px. Label in `{typography.caption}` uppercase muted; value in `{typography.body}`.

**`field-ai`** — Identical to `field` but with a 1px `{colors.accent-border}` (amber) border and an **`ai-badge`** in the top-right corner showing the confidence score (e.g. `IA · 0.97`). This is the visual heartbeat of the product: amber = "the machine extracted this; confirm or correct." Fields below ~0.70 confidence get a stronger amber treatment to invite human review.

**`text-input`** — Form field. Background `{colors.surface-1}`, rounded `{rounded.md}` 10px, padding 10px 13px. Focus ring: 2px `{colors.primary-focus}` at 50%.

### Status & Badges
**`status-badge`** — Shipment status pill (e.g. "● En tránsito"). Background `{colors.accent-soft}`, text `{colors.accent}`, rounded `{rounded.pill}`, padding 4px 11px. (Other statuses may use success/ink tints.)

**`ai-badge`** — Confidence tag on AI fields. Background `{colors.accent-soft}`, text `{colors.accent}`, `{typography.mono}`, rounded `{rounded.sm}`, padding 2px 7px.

### Theme Toggle
**`theme-toggle`** — Pill control, top-right. Background `{colors.surface-1}`, text `{colors.ink-muted}`, rounded `{rounded.pill}`, padding 7px 14px. Sun icon → switches to light; moon icon → switches to dark. Persists choice (localStorage in production; in-memory in Claude artifacts).

### Navigation & Footer
**`top-nav`** — Sticky bar, wordmark left, nav center, `button-secondary` + `button-hero-cta` pair right (the pill CTA lives here on marketing). Background `{colors.canvas}`, height 56px.

**`footer`** — Link grid on `{colors.canvas}`, wordmark left, `{typography.caption}` in `{colors.ink-subtle}`.

## Do's and Don'ts

### Do
- Ship BOTH themes; treat light as first-class (an ERP is used 8h/day).
- Use `{colors.primary}` sea-green ONLY for brand mark, primary CTA, focus, link emphasis.
- Reserve `{colors.accent}` amber for AI-extracted data and status — it is the product's tell.
- Use the surface ladder for hierarchy; add the gradient mesh fog sparingly on canvas.
- Pair Fraunces 500 display with Inter Tight 400 body; flip to JetBrains Mono for eyebrows and data.
- Use `{rounded.md}` 10px for every in-app control.
- Lead sections with the `expediente-card` (the AI-fill moment is the protagonist).

### Don't
- Don't use navy/corporate blue anywhere — it is the sector cliché Manann rejects.
- Don't pill-round in-app buttons; pills are reserved (hero CTA, status, toggle).
- Don't use amber decoratively — it must always mean "machine did this" or "status."
- Don't use pure white (#FFFFFF) as the light canvas; the warm fog (#EEF1ED) is intentional.
- Don't introduce a third chromatic accent.
- Don't let the myth become decoration in-product — no gods in the UI, only clarity.
- Don't claim the AI "decides"; the UI language is propose / extract / confirm.

## Responsive Behavior

| Name | Width | Key Changes |
|---|---|---|
| Desktop-XL | 1440px | Default |
| Desktop | 1280px | Card grid 3-up |
| Tablet | 1024px | 3-up → 2-up |
| Mobile-Lg | 768px | Nav hamburger; expediente fields 2-col → 1-col |
| Mobile | 480px | Single column; display-xl 72px → ~34px |

- CTAs ≥44px tap height on touch. Fields ≥44px tap target on touch.
- `{typography.display-xl}` scales toward `{typography.display-md}` on mobile.
- Theme toggle persists across breakpoints, top-right.

## Iconography

**Set: Lucide** (ISC license, free) — chosen for zero-friction integration with shadcn/ui, which ships Lucide by default. Differentiation lives in the AI-fill moment, palette, and Fraunces — not in icons; Lucide is plumbing, used deliberately.

Lucide is outline-only and reads "technical-clean" rather than "warm-rounded," so Manann tunes it toward the brand's calm-authoritative voice:

- **`strokeWidth: 1.5`** globally (Lucide defaults to 2; 1.5 is finer and pairs better with Fraunces).
- **`strokeLinecap: round` + `strokeLinejoin: round`** globally — rounds terminals and joints, recovering some warmth without changing sets.
- **Default `size: 20px`** for in-app icons (16px in dense tables/badges, 24px in empty states/headers).
- **Configure once, not per icon.** Wrap Lucide in a single `<Icon>` component (or a context provider) that fixes size, strokeWidth, and linecaps. The DESIGN.md governs these defaults; individual call sites only pass the glyph name and overrides.
- Icon color inherits `currentColor` — it follows `{colors.ink}` / `{colors.ink-muted}` by context. Amber (`{colors.accent}`) on an icon is reserved for the same meaning as everywhere: "the machine did this" / status.

## Motion

Motion in Manann is **calm and purposeful** — the sea moves steadily, not frantically. Two named moments carry most of the weight; everything else is restraint.

### Tokens
| Token | Value | Use |
|---|---|---|
| `duration-instant` | 120ms | Hover/focus state changes, button color shifts |
| `duration-base` | 240ms | Theme toggle, dropdowns, most transitions |
| `duration-slow` | 400ms | Theme cross-fade (canvas + color), panel reveals |
| `ease-standard` | cubic-bezier(0.4, 0, 0.2, 1) | Default for most transitions |
| `ease-out` | cubic-bezier(0.16, 1, 0.3, 1) | Entrances, reveals (decelerate into place) |
| `stagger` | 60ms | Delay step between staggered list/field reveals |

### The two signature moments
1. **Theme cross-fade** — toggling `data-theme` transitions `background-color` and `color` over `duration-slow` 400ms with `ease-standard`, so dark↔light feels like fog rolling in, not a hard flip. (Honor `prefers-reduced-motion`: drop to an instant swap.)
2. **The AI-fill reveal** (the product's heartbeat) — when extraction completes, fields populate top-to-bottom with a `stagger` 60ms cascade: each `field-ai` fades+rises 6px over `duration-base` with `ease-out`, and its amber `ai-badge` scales in last. This is the visual "the document filled itself" beat — the one animation worth orchestrating carefully. Never auto-animate it more than once per document; re-renders are instant.

### Restraint rules
- No looping/ambient animation except the faint mesh fog (which may drift very slowly, ≥20s cycle, or stay static).
- No bounce/overshoot easings — they read playful; Manann is calm-authoritative.
- Always respect `prefers-reduced-motion: reduce` — disable the cascade and cross-fade, keep instant state changes.

## Iteration Guide
1. Focus on ONE component at a time; reference it by its `components:` token name.
2. Decide the surface lift before building a section.
3. Default body to `{typography.body}` 400.
4. Treat sea-green as scarce (mark, CTA, focus, link) and amber as scarcer (AI data, status).
5. Confirm every interactive control uses 10px except the three pill exceptions.
6. Verify both themes render before shipping any component.
7. After any color edit, re-run the WCAG contrast check on the changed pair (threshold 4.5:1 text / 3:1 UI+large) before merging. The Verified Contrast table is the source of truth — keep it updated.

## Known Gaps
- All palette pairs (including the four priority levels) are verified against WCAG 2.1 AA in the Verified Contrast table; re-run the check on any new color before adopting it.
- No outstanding design-token gaps. Future modules (warehouse, customs) may introduce new entities and component variants — add them as separate `components:` entries following the existing patterns.
