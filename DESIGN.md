---
name: Coffee-Brutalism
colors:
  surface: '#fff8f0'
  surface-dim: '#dfd9d2'
  surface-bright: '#fff8f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3eb'
  surface-container: '#f3ede5'
  surface-container-high: '#ede7df'
  surface-container-highest: '#e7e2da'
  on-surface: '#1d1b17'
  on-surface-variant: '#524437'
  inverse-surface: '#32302b'
  inverse-on-surface: '#f6f0e8'
  outline: '#857465'
  outline-variant: '#d7c3b1'
  surface-tint: '#8a5100'
  primary: '#8a5100'
  on-primary: '#ffffff'
  primary-container: '#e59840'
  on-primary-container: '#5c3400'
  inverse-primary: '#ffb86d'
  secondary: '#795741'
  on-secondary: '#ffffff'
  secondary-container: '#ffd1b5'
  on-secondary-container: '#7a5842'
  tertiary: '#984628'
  on-tertiary: '#ffffff'
  tertiary-container: '#f48e6a'
  on-tertiary-container: '#6e270b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcbd'
  primary-fixed-dim: '#ffb86d'
  on-primary-fixed: '#2c1600'
  on-primary-fixed-variant: '#693c00'
  secondary-fixed: '#ffdbc7'
  secondary-fixed-dim: '#eabda3'
  on-secondary-fixed: '#2d1605'
  on-secondary-fixed-variant: '#5f402c'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#7a2f14'
  background: '#fff8f0'
  on-background: '#1d1b17'
  surface-variant: '#e7e2da'
  espresso-ink: '#1A0F0A'
  surface-card: '#FFFFFF'
  badge-matcha: '#6B8E4E'
  frappe-toffee: '#D8B18A'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0em
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system translates the raw, tactile nature of specialty coffee culture into an energetic mobile-first digital experience. Tailored for urban café exploration in high-altitude Oruro, Bolivia, it fuses neobrutalist fundamentals—thick structural line work, hard-edged isometric offsets, and punchy geometric typography—with the warmth of artisanal brewing.

The visual direction rejects generic minimalist café aesthetics in favor of high-energy tactile brutalism. Visual containers mimic textured stamps, coaster blocks, and packaging labels. Interfaces feel physical, snappy, and grounded, evoking the tactile joy of coffee bean sacks, roasted aroma notes, and hand-stamped loyalty passports.

## Colors

The palette takes inspiration from the stages of roasting, extraction, and milk steaming, anchored by high-contrast structural borders:

- **Canvas & Backing (`#FAF4EC`):** A soft, warm oat-milk cream tone that eliminates sterile digital glare while maintaining contrast against stark white cards.
- **Structural Ink (`#1A0F0A`):** Dark espresso black used for typography, 3px solid component borders, and hard directional drop shadows.
- **Crema Gold (`#E59840`):** The primary energetic amber gold, used for high-intent actions, highlights, and primary CTAs.
- **Deep Mocha (`#4A2E1B`):** Secondary grounding tone for category cards, primary titles, and deep roast signatures.
- **Terracotta Cinnamon (`#DE7C5A`):** Tertiary romance and connection hue, dedicated to couple-friendly pairing features, date spots, and community highlights.
- **Coffee Leaf Green (`#6B8E4E`):** Semantic accent reserved for verified check-ins, origin stamps, and fair-trade badges.
- **Dulce de Leche / Frappé (`#D8B18A`):** Neutral accent for seasonal iced specials, secondary chips, and tertiary containers.

## Typography

Typography balances mechanical punch with high readability across mobile displays:

- **Headlines & Badges (`Space Grotesk`):** Heavyweight, wide tracking geometric display type delivering unmistakable brutalist authority. Currency figures (e.g., `Bs 24.50`) and numeric ratings always use `Space Grotesk` at bold or heavy weights.
- **Body & Metadata (`DM Sans`):** Clean, geometric, low-contrast grotesque for descriptions, opening hours, bean notes, and addresses to maximize clarity against textured borders.
- **Uppercase Rule:** Functional tags, filter pills, card stamps, and primary CTA buttons must be set in uppercase with slight positive tracking (`0.02em` to `0.06em`).

## Layout & Spacing

A mobile-first fluid layout built on an 8px grid foundation:

- **Mobile Viewports (<640px):** Single-column stack with persistent `1rem` outer canvas padding. Micro-spacing ensures compact density suitable for walking-navigation and quick browsing.
- **Tablet / Desktop Viewports (≥640px):** Multi-column fluid grid scaling up to 12 columns with max container constraint of 1024px to retain an intimate, app-like poster feel.
- **Rhythm:** Spacing follows structural offsets: gaps between interacting cards correspond directly with drop-shadow distances (`space-md` ensures cards never overlap adjacent shadows).

## Elevation & Depth

This design system rejects blurred shadows and tonal gradient skeuomorphism. Depth is strictly defined by physical offset and solid ink displacement:

- **Borders:** All actionable cards, modals, tags, and inputs must use a `3px solid #1A0F0A` border.
- **Zero-Blur Hard Shadows:**
  - **Level 1 (Subtle / Chips / Inputs):** `2px 2px 0px 0px #1A0F0A`
  - **Level 2 (Standard Cards / Buttons):** `4px 4px 0px 0px #1A0F0A`
  - **Level 3 (Modals / Hero Features / Sticky Navigation):** `8px 8px 0px 0px #1A0F0A`
- **Active / Pressed Motion:** Elements depress physically on tap: the drop shadow collapses to `0px 0px 0px 0px #1A0F0A`, and the container translates diagonally down and right by the shadow distance (`translate(4px, 4px)`).

## Shapes

The design system employs softened geometric forms to blend brutalist edge with coffee friendliness:

- **Corner Radius:** Standard components use `8px` (`rounded-lg`) corner radii.
- **Pill Exceptions:** Micro tags, status chips, and verification badges may use full circular pills (`rounded-full`) while strictly maintaining the `3px solid #1A0F0A` boundary stroke.

## Components

### Buttons
- **Primary Action:** Background `#E59840`, text `#1A0F0A`, `3px solid #1A0F0A` border, `4px 4px 0px 0px #1A0F0A` shadow, `rounded-lg` radius. Uppercase bold font. Depresses to `0px` shadow on `:active`.
- **Secondary Action:** Background `#FFFFFF`, text `#1A0F0A`, matching `3px` border and `4px` shadow.
- **Accent / CofiDúo:** Background `#DE7C5A`, text `#FFFFFF`, matching border and shadow.

### Cards
- **Café Item & Route Cards:** Background `#FFFFFF`, padding `1rem`, `3px solid #1A0F0A` border, `4px 4px 0px 0px #1A0F0A` shadow, `8px` border radius. Image headers feature a clean horizontal `3px solid #1A0F0A` divider separating imagery from metadata.

### Badges & Chips
- **Filter Chips:** Inactive: `#FFFFFF` fill with `2px` border and `2px 2px 0px 0px` shadow. Active: `#E59840` fill with reversed state or pressed displacement.
- **Verification Stamp:** Leaf green `#6B8E4E` background with pure white text, solid black border, rotated slightly (`-2deg`) to resemble an ink inspection stamp.

### Input Fields & Search
- Background `#FFFFFF`, text `#1A0F0A`, placeholder `#1A0F0A` at 50% opacity, `3px solid #1A0F0A` border, `2px 2px 0px 0px #1A0F0A` shadow. Focus states shift the shadow to `#E59840` or expand the offset to `4px 4px`.

### Checkboxes & Radios
- Box width and height of 24px, `3px solid #1A0F0A` outline, sharp 4px inner rounding. Checked state fills with `#E59840` sporting an unmistakable chunky black checkmark icon.

### Route & Coaster Stamp (Domain Specific)
- **Coffee Passport Stamp:** Circular container (`rounded-full`), `3px solid #1A0F0A`, textured perforated border simulation with centered roast profile typography.
