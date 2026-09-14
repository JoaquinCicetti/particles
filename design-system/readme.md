# Growcast design system

Growcast is real-time monitoring and control for agriculture: grow rooms ("salas"), grain silos and curing rooms on one platform. The public site is a scroll-driven 3D story (a particle field of sensors and data), followed by in-flow solution sections, and a grow-room designer / quoting tool.

The look is **instrument panel at night**: a near-black graphite ground, one luminous lime, hairline borders, tracked monospace labels, and glass panels floating over a live scene. It should feel precise and technical, never playful, glossy or soft.

Copy is Spanish first (`es`), with `en` and `pt` locales.

## How to use this

- Link the one stylesheet from every page with `<link rel="stylesheet" href="styles.css">` (adjust the relative path), and put `class="dark"` on `<html>`. Dark is the brand.
- Take every color, font, shadow and easing from its variable (`var(--brand)`, `var(--mono)`, `var(--shadow-panel)`…). Never hard-code a hex the tokens already carry.
- Build with the classes in the table below. They are the same class names the production code uses (`src/styles/global.css`, `src/designer/designer.css`), so markup moves back into the repo unchanged. The foundation and component pages are plain HTML, so view source and copy the markup.
- There are two registers. **Landing** is large, airy and cinematic, and sits over a 3D scene. **Tool** (`.dz` scope) is dense 14px application UI on flat panels. Don't mix their components on one surface.

## Color

| Token | Value | Use |
|---|---|---|
| `--bg` / `--background` | `#1d1d20` | Page ground |
| `--card` | `#242429` | Raised card |
| `--popover` | `#1f1f23` | Popovers |
| `--dialog` | `#141418` | Dialogs, schematic chassis |
| `--dz-panel` · `--dz-stage` · `--dz-menu` | `#212127` · `#17171b` · `#26262c` | Tool panels, 3D stage, menus/toasts |
| `--fg` | `#f2f2f2` | Primary text |
| `--fg-dim` | white @ 86% | Body copy |
| `--dz-text-2` | white @ 62% | Secondary text in the tool |
| `--brand` | `#cad86e` | Icons, borders, active states, filled buttons |
| `--brand-bright` | `#eef7b4` | Kickers, live readings, sparklines, focus ring, glow |
| `--brand-hover` | `#b4c455` | Deeper lime |
| `--brand-dim` | lime @ 35% | Default 1px border on brand surfaces |
| `--brand-faint` | lime @ 14% | Dividers, rail tracks, list rules |
| `--dz-line` · `--dz-line-strong` | white @ 10% · 20% | Hairlines in the tool |
| `--success` · `--warning` · `--info` · `--destructive` | `#47d181` · `#f7b23b` · `#4cb2e6` · `#f15b5b` | Status |
| `--dz-danger` | `#f0a57e` | Destructive actions in the tool (softer than red) |

Lime is the **only** chromatic brand color, so use it sparingly: an outline, a label, one glowing value. Never fill large areas with it. On a filled lime button, text is `--bg` (or `--primary-foreground #373c10`).

The light theme (`:root` without `.dark`) exists only for the logged-in app. It uses ground `#e2e2df`, card `#fdfdfc`, text `#09090b` and a deeper lime `#94b42d` for contrast.

## Type

There are two families, and the split between them is strict:

- **Aeonik** (`--display`, `--body`), weights 200/300/400/500/700, for headlines, body copy and UI text.
- **IBM Plex Mono** (`--mono`), weights 300/400, for kickers, labels, units, numbers in fields, keyboard hints and meta. It is always tracked wide and usually uppercase.

| Class | Role | Spec |
|---|---|---|
| `.kicker` | Section eyebrow | Plex 0.72rem, 0.42em, UPPER, `--brand-bright` |
| `.h-hero` | Hero headline | Aeonik 500, `clamp(2.2rem,5.2vw,4.3rem)`, lh 1.12, 0.09em, UPPER |
| `.h-section` | Section headline | Aeonik 500, `clamp(1.7rem,3.2vw,2.7rem)`, 0.05em, UPPER |
| `.h-story` | Scroll-story caption heading | Aeonik 500, `clamp(1.3rem,2.5vw,2rem)`, 0.05em, UPPER |
| `.h-title` | Dialog / card title | Aeonik 500, 1.6rem, 0.02em, sentence case |
| `.lede` | Body copy | Aeonik **300**, 1.05–1.2rem, lh 1.7, `--fg-dim` |
| `.metric-label` | Panel label | Plex 0.7rem, 0.34em, UPPER, `--brand` |
| `.metric-value` + `.metric-unit` | A reading | Aeonik 300, large, `--brand-bright`, followed by the Plex unit |
| `.metric-note` | Fine print | Plex 0.66rem, 0.26em |
| `.wordmark` | GROWCAST | Aeonik 700, 0.85rem, 0.38em |

Headlines are uppercase Aeonik Medium, never bold. Body copy is Light. Readings are big Light numerals with a mono unit (`24.6 °C`, `68 %`, `850 ppm`). Any text over imagery or the 3D scene gets `.on-scene` (a dark text-shadow) or a soft radial scrim behind the block.

## Shape, space, elevation

- **Radius** is `--radius` 0.5rem on buttons, dialogs, panels in the tool and inputs (inputs go 0.15–0.2rem tighter). Chips, filters and toggles are full pills. The metric chip is `radius + 0.25rem`. Landing panels (`.panel`) are **square**, with corner brackets.
- **Borders** are always 1px hairlines: `--brand-dim` / `--brand-faint` on landing surfaces, `--dz-line` / `--dz-line-strong` in the tool.
- **Corner brackets** are the signature detail: 0.85rem L-shaped `--brand` strokes on the top-left and bottom-right of `.panel`.
- **Space**: the landing is fluid and loose. Side gutter is `--gutter` `clamp(1.5rem,6vw,6rem)`, sections pad about 12vh, grid gaps run 2.4–4.5rem. The tool is tight: blocks pad 1.05×1.1rem, controls are 2.25rem tall, gaps 0.3–0.75rem. `--space-1…7` (0.3 → 3rem) are the steps in use.
- **Tap targets** on the landing are ≥ 3rem.
- **Elevation** comes from deep neutral black shadows: `--shadow-panel`, `--shadow-menu`, `--shadow-dialog`. Lime glow (`--glow-cta`, `--glow-dot`) marks emphasis only and never plain elevation.
- **Texture**: `.dot-grid` (a lime dot every 28px), 4% film grain, and oversized outline-only ghost numerals (`-webkit-text-stroke: 1px` lime @ 13%).

## Icons & illustration

- Icons use a 16×16 viewBox, stroke 1.3, round caps and joins, `currentColor`, tinted `--brand`. A check is `--brand-bright` at stroke 1.6.
- There are domain glyphs for node, probe, valve, alert, CO₂, fan, phone, cooling, ripening curve and batch log; see `foundations/icons.html`. Generic UI in shadcn parts uses Lucide at 16px.
- Schematics (silo, grow room, curing rack) are line drawings in `--brand` with `--brand-bright` accents, 8.5px Plex labels, and data pulses travelling along cables. There are no photographs; imagery is the 3D particle scene and these drawings.

## Motion

- `ease` for colors and fades; `--ease-pop` `cubic-bezier(0.2,0.8,0.3,1)` for dialogs, thumbs and menus.
- Tool hovers take 0.15s, landing hovers 0.2–0.3s, and section reveals 0.8s (fade plus a 28px rise).
- Ambient loops are slow and small: chip bob 7px over 4.2s, live dot 1.6s, loader pulse 1.8s.
- Always honor `prefers-reduced-motion`.

## Components

| Class | What it is | Shown in |
|---|---|---|
| `.cta` + `.cta-arrow` | Primary landing CTA: dark glass, lime outline, glowing mono text | components/buttons.html |
| `.nav-cta` | Outline button; fills lime on hover | components/buttons.html |
| `.btn-solid` (+ `.btn-block`) | Solid lime button (dialog send) | components/buttons.html |
| `.dz-btn` with `.dz-btn-primary`, `.dz-btn-danger`, `.dz-icon-btn` | Tool buttons, 2.25rem | components/buttons.html |
| `.dialog-field` | Landing field: mono lime label above a quiet input | components/forms.html |
| `.lang-track` + `.lang-thumb` + `.lang-opt` | Language pill toggle | components/forms.html |
| `.dz-field`, `.dz-input`, `.dz-num-box` + `.dz-num-unit` | Tool fields; number values in mono with unit | components/forms.html |
| `.dz-stepper`, `.dz-seg`, `.dz-filter` | Stepper, segmented control, filter chips | components/forms.html |
| `.panel` (+ `.sol-list`) | Glass panel with corner brackets | components/surfaces.html |
| `.metric-float` (+ `.metric-head/-name/-read/-spark`) | Live sensor reading chip | components/surfaces.html |
| `.sol-chips`, `.sol-step-n` | Pill tags, numbered step marker | components/surfaces.html |
| `.dialog-backdrop` + `.dialog` (+ `.dialog-close`, `.dialog-sub`) | Modal | components/surfaces.html |
| `.dz-menu`, `.dz-toast` | Tool context menu and toast | components/surfaces.html |
| `.nav` + `.brand` + `.brand-mark` + `.wordmark` | Top bar over the scene | components/navigation.html |
| `.sidenav` + `.sidenav-item`, `.rail-track/-fill/-dot` | Section index and scroll progress | components/navigation.html |
| `.dz-tabs` + `.dz-tab`, `.dz-list` + `.dz-row` | Tool tabs and inventory list | components/navigation.html |

States are built in: focus is a 3px `--brand-bright` `:focus-visible` ring, `::selection` is lime, disabled tool controls drop to 35% opacity, active/selected is a lime @ 12–14% fill plus a lime edge (underline on tabs, left bar on rows).

## Brand mark

`assets/logo.svg` is the Growcast mark, three leaf-shaped arms joined like a sensor node, drawn in `#cad86e`. Apply it as a CSS mask (`.brand-mark`) so it takes `--brand`, `--brand-bright` or `--fg`. Beside the `.wordmark` it sits at 2rem. On hover it rotates -8° and scales 1.06. Don't add effects, outlines or other colors.

## Voice

Short, concrete, operational. Talk about measurements, rooms and decisions ("del campo a la decisión"). Kickers are categorical or numbered (`01 — SILOS`, `RED DE SENSORES`). Say "sala" for a cultivation room.

## Do

- Keep the ground dark graphite and use one lime.
- Draw 1px hairlines and put brackets on hero panels.
- Track the mono labels wide.
- Put a scrim or text-shadow behind anything that sits over the scene.
- Show data as data: a big light numeral, a mono unit, a small sparkline.

## Don't

- Don't introduce a second brand hue, gradient buttons or colored shadows.
- Don't use bubbly, over-rounded cards, bold headlines, or long copy in full-white regular weight.
- Don't use stock photography.
- Don't mix landing and tool components on one surface.

## Files

- `styles.css`: the only stylesheet (tokens plus components). Link it from every page.
- `readme.md`: this guide.
- `thumbnail.html`: the project cover.
- `foundations/color.html`: brand, ground, status and light-app palettes.
- `foundations/type.html`: the type scale at real sizes.
- `foundations/layout.html`: radius, borders, brackets, elevation and texture.
- `foundations/icons.html`: the domain glyph set.
- `components/buttons.html`: landing and tool buttons.
- `components/forms.html`: landing fields, language toggle, tool inputs, stepper, segmented, filters.
- `components/surfaces.html`: panel, metric chip, pill tags, dialog, menu, toast.
- `components/navigation.html`: nav bar, section index and rail, tool tabs and list.
- `assets/logo.svg`, `assets/favicon.svg`: the mark.
- `fonts/`: Aeonik woff2 (licensed, for Growcast work only).
