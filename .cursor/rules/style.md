---
description: MotherDuck-inspired front-end style guardrails
globs: ["site/**/*.{ts,tsx,astro,mdx,css,scss,sass,less}", "src/**/*.{ts,tsx,astro,mdx,css,scss,sass,less}"]
alwaysApply: false
---

# MotherDuck Style Rules

## Brand Voice & Atmosphere

- Hero copy is loud and uppercase, but still conversational; keep lines short and confident (“Making Big Data Feel Small”).
- The tone mixes retro-instrument-panel precision with playful duck humor. Use witty subheads (“FINALLY: A database you don’t hate”) plus practical supporting copy.
- Surface duck mascots, doodles, and ISO-style tiles at major breakpoints (hero, use cases, testimonials). Keep secondary sections copy-first with simple iconography.
- Always pair visual whimsy with rigid structure: straight rules, graph-paper backgrounds, exact spacing, and obvious strokes.

## Shell & Layout Basics

- Root background is a warm cream `rgb(244 239 234 / 1)` (#F4EFEA). Never ship pure white canvases; all pages start here.
- Header + eyebrow values come from live DOM tokens: `--header-mobile: 70px`, `--header-desktop: 90px`, `--eyebrow-mobile: 70px`, `--eyebrow-desktop: 55px`.
- The eyebrow banner is always sunbeam yellow with uppercase CTA text, spanning edge-to-edge and pinned above navigation.
- Section stacks alternate between cream, sky-blue washes, and gridded cards to keep rhythm. Use wavy SVG separators or simple 2px black rules when switching backgrounds.

## Color System

```css
:root {
  --md-cream: #F4EFEA;        /* page shell */
  --md-sunbeam: #FFDE00;      /* eyebrow, promo strips */
  --md-sunbeam-dark: #E3C300; /* hover/pressed */
  --md-sky: #6FC2FF;          /* primary CTA fill */
  --md-sky-strong: #2BA5FF;   /* focus rings, active inputs */
  --md-soft-blue: #EBF9FF;    /* secondary sections */
  --md-cloud: #FFFFFF;        /* cards & quotes */
  --md-fog: #F8F8F7;          /* form fills */
  --md-ink: #383838;          /* primary text */
  --md-slate: #A1A1A1;        /* secondary text */
  --md-graphite: #000000;     /* structural strokes */
  --md-shadow: rgba(0, 0, 0, 0.08); /* hover shadows */
  --md-grid-line: #E4D6C3;    /* graph-paper overlays */
}
```

- Minimum text contrast: 5:1 on cream/blue, 7:1 when text sits on sunbeam or sky backgrounds.
- Sunbeam and sky saturations deepen ~10% on hover; darker states must still contrast with graphite outlines.
- Use opacity (not new hues) for muted variants. `rgba(111, 194, 255, 0.4)` is the current tinted highlight.
- Card borders, inputs, and CTA outlines stay `2px` graphite; only divider rules can drop to `1px`.

## Typography

```css
:root {
  --font-family-primary: "Aeonik Mono", "Aeonik Fono", "Inter", sans-serif;
  --font-family-alt: "Aeonik Fono", "Aeonik Mono", sans-serif;
  --font-hero: 72px/86px 0.02em uppercase;
  --font-h2: 32px/45px uppercase;
  --font-h3: 18px/25px uppercase;
  --font-body: 15px/22px normal-case;
  --font-ui: 14px/20px uppercase for badges & nav;
  --font-eyebrow: 12px/16px uppercase;
}
```

- Primary copy face is Aeonik Mono; Aeonik Fono handles dense body paragraphs and pull quotes.
- Headings are uppercase with 1–2px tracking. Body copy remains sentence case with natural spacing.
- Keep heading line-height tight (1.18–1.25). Body line-height stays 1.45–1.6 for readability on cream backgrounds.
- Use Mono Bold (700) for stat callouts, CTA counts, and eyebrow labels; everything else stays regular (400).

## Spacing & Rhythm

```css
:root {
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-9: 48px;
  --space-10: 64px;
  --space-11: 80px;
  --space-12: 96px;
  --space-section: 120px;
}
```

- Hero stack = `padding-block: var(--space-section)` with CTA row gaps of `var(--space-6)`.
- Feature grids keep `var(--space-7)` between tiles and `var(--space-9)` between heading, copy, and CTAs.
- Testimonials and Duckling cards carry 32px interior padding with 24px gaps between icon, heading, and paragraph.
- Mobile keeps the same ratios via `padding-block: clamp(48px, 10vw, 120px)`; never compress below 48px.

## Shape Language & Surfaces

- Corners are micro-rounded at `2px`. Only doodle tabs and wave masks introduce curves.
- Structural elements keep 2px graphite outlines: cards, inputs, CTA pills, checkboxes, and nav dropdowns.
- Graph-paper sections use `repeating-linear-gradient` backgrounds with `var(--md-grid-line)` every ~40px on cream.
- Hover depth comes from translation (`transform: translate(7px, -7px)`) plus optional `box-shadow: 0 7px 0 var(--md-graphite)`.
- Divider waves match adjacent section colors and stay ≤ 48px tall.

## Components

### Buttons & CTA Links

- **Primary CTA** (`Try 21 Days Free`, `Start Free`)
  - `background: var(--md-sky)`, `color: var(--md-ink)`, `border: 2px solid var(--md-ink)`, `border-radius: 2px`.
  - Padding `16px 22px`; uppercase text with ~0.3px tracking.
  - Transition: `transform 120ms ease-in-out, box-shadow 120ms ease`.
  - Hover: `transform: translate(7px, -7px)`; keep color + border unchanged.
  - Focus: `border-color: var(--md-sky-strong)`; no glow.
- **Secondary CTA** (Learn More / Book a Demo) stays text-only with inline arrow icons, `letter-spacing: 0.32px`, underline on hover.
- Header CTAs reuse the same rules; `LOG IN` is text-only, while `START FREE` mirrors the primary CTA at `12px 18px`.

### Inputs & Form Controls

- Inputs sit on fog backgrounds with `border: 2px solid var(--md-ink)` and `border-radius: 2px`.
- Padding: `16px 40px 16px 24px` to account for inline icons/labels.
- Focus switches the border to `var(--md-sky-strong)` with no box shadow.
- Checkbox tiles are 24px squares with 2px strokes, duck-foot icons, and `gap: var(--space-4)` between box and label.

### Cards, Tiles & Feature Rails

- Default card: white background, `padding: var(--space-8)`, `display: flex` column with `gap: var(--space-5)`, `border: 2px solid var(--md-ink)`.
- Highlight cards (testimonials) add a yellow badge tab or duck icon anchored to the top-left with `position: absolute`.
- Duckling-size cards stack vertically, consistent width, and include 120px illustration blocks above headings.
- Ecosystem matrices use 2-column grids (desktop) with `gap: var(--space-7)`; collapse to single column below 640px.

### Navigation & Eyebrow

- Eyebrow remains `background: var(--md-sunbeam)` with uppercase 14px text; include a link plus CTA chip.
- Header uses accordion-like buttons with chevrons. Dropdowns inherit cream backgrounds and 2px outlines.
- Keep header pinned, full-width, and opaque; on scroll, compress padding but never introduce translucency.

### Quote & Testimonial Blocks

- White cards, 2px outline, 32px padding.
- Body copy uses Aeonik Fono 18px italic.
- Include logo chips or duck icons anchored top-center; CTA links stay small uppercase with arrows.

### Newsletter Module

- Framed by a sunbeam-outline card.
- Stack: input → checkbox list → CTA button.
- Retain the dual-checkbox pattern (MotherDuck news + DuckDB newsletter) with both selected by default.

## Motion & Interaction

- Hover translation: `transform: translate(7px, -7px)` for CTAs/cards.
- Scroll reveals: opacity 0 → 1 and `translateY(24px → 0)` over 240ms with 70ms stagger.
- Dropdowns/accordions animate height ≤ 200ms with ease-in-out; no spring physics.
- Loading uses duck GIFs or skeleton shimmer `linear-gradient(90deg, #F4EFEA 25%, #FFFFFF 50%, #F4EFEA 75%)`.

## Iconography & Illustration

- Icons use 2px strokes, beveled corners, and spot fills from the palette above.
- Duck mascots remain upright, never mirrored, and always include full beak + feet.
- ISO cubes, arrows, and magnifiers accompany headings; keep them SVG (no raster >200KB).
- Gradients stay subtle (sunbeam → cream). Avoid neon or multicolor blends.

## Content Rules

- Headlines stay uppercase, 3–5 words max. Subheads lean playful but land on a concrete benefit.
- Body text references practitioner pains (data size, latency, onboarding) just like the live site.
- CTAs describe the action plainly (“Try 21 Days Free”, “Learn More”, “Book a Demo”).
- Persona lists (Software Engineers, Data Scientists, Data Engineers) pair one-liner pains with duck illustrations.

## Do / Don't

- ✅ Alternate cream, sunbeam, and sky sections to break long scrolls.
- ✅ Keep 2px graphite outlines on every interactive surface.
- ✅ Animate hover states with directional translation instead of color flashing.
- ✅ Use uppercase hero + section titles; keep numerals monospace.
- ❌ Introduce new color families (purple, neon gradients) without approval.
- ❌ Remove outlines or add soft, blurry shadows.
- ❌ Mix large rounded corners with square cards; the system relies on micro 2px radii.
- ❌ Ship white background pages—cream shell is mandatory.

## Implementation Checklist

1. Import the tokens above into `design-tokens.css`; never hardcode ad-hoc hex values.
2. Set `body { background: var(--md-cream); font-family: var(--font-family-primary); }`.
3. Apply header/eyebrow heights via the provided CSS variables; keep the eyebrow fixed and full-width.
4. Ensure CTAs use uppercase Aeonik, 2px outlines, and the translate-on-hover interaction.
5. Inputs/checkboxes must reuse the fog fill and sky focus color (`#2BA5FF`).
6. Alternate section backgrounds + wavy separators at 375px, 768px, and 1280px breakpoints.
7. Keep illustrations optimized SVG/Lottie with lazy-loading just like the production site.
8. Confirm text contrast + focus indicators whenever sunbeam or sky is used as a background.
9. Cache duck/grid assets and avoid raster exports larger than 200KB.
