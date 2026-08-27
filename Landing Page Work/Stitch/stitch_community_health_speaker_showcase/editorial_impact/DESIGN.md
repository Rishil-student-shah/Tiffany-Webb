---
name: Editorial Impact
colors:
  surface: '#fef9f0'
  surface-dim: '#ded9d1'
  surface-bright: '#fef9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3ea'
  surface-container: '#f2ede4'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e7e2d9'
  on-surface: '#1d1c16'
  on-surface-variant: '#3f4944'
  inverse-surface: '#32302b'
  inverse-on-surface: '#f5f0e7'
  outline: '#6f7974'
  outline-variant: '#bec9c3'
  surface-tint: '#0e6b54'
  primary: '#00513e'
  on-primary: '#ffffff'
  primary-container: '#0e6b54'
  on-primary-container: '#98e8cb'
  inverse-primary: '#86d6ba'
  secondary: '#1f686f'
  on-secondary: '#ffffff'
  secondary-container: '#a8ebf3'
  on-secondary-container: '#256c73'
  tertiary: '#2b428a'
  on-tertiary: '#ffffff'
  tertiary-container: '#445aa3'
  on-tertiary-container: '#ced7ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a1f3d5'
  primary-fixed-dim: '#86d6ba'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#00513e'
  secondary-fixed: '#abeef6'
  secondary-fixed-dim: '#8fd1d9'
  on-secondary-fixed: '#002023'
  on-secondary-fixed-variant: '#004f55'
  tertiary-fixed: '#dce1ff'
  tertiary-fixed-dim: '#b6c4ff'
  on-tertiary-fixed: '#00164e'
  on-tertiary-fixed-variant: '#2b428a'
  background: '#fef9f0'
  on-background: '#1d1c16'
  surface-variant: '#e7e2d9'
  ivory: '#FBF6EA'
  cream: '#F3EAD6'
  gold: '#C8A24C'
  burnt: '#C15427'
  coral: '#E17356'
  mustard: '#D9A23A'
  charcoal: '#23211B'
  line: rgba(20, 19, 14, 0.12)
typography:
  display-hero:
    fontFamily: Newsreader
    fontSize: 80px
    fontWeight: '600'
    lineHeight: '0.98'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 42px
    fontWeight: '600'
    lineHeight: '1.1'
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.1'
  body-intro:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.62'
  label-eyebrow:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.34em
  label-ui:
    fontFamily: Space Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.08em
  quote-editorial:
    fontFamily: Newsreader
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 7vw
  container-max: 1500px
  sidebar-width: 290px
  card-padding: 22px
  stack-gap: 32px
---

## Brand & Style

This design system embodies the **Sage** and **Caregiver** archetypes, balancing intellectual authority with a warm, human-centric approach. It is built for a Community Impact Strategist, requiring a UI that feels both academically rigorous and deeply empathetic.

The aesthetic follows an **Editorial Minimalism** movement—fusing the structure of a premium high-end magazine with the functional clarity of modern SaaS. It avoids sterile corporate tropes in favor of "warm humanity," utilizing a layered architectural approach where content is treated as a curated exhibit.

**Key Stylistic Pillars:**
- **High-Contrast Editorial:** Dramatic shifts between massive serif displays and technical monospaced details.
- **Architectural Layering:** Using "ink" and "ivory" to create a sense of physical paper and structural depth.
- **Organic Precision:** A mix of strict grid layouts and fluid, wave-like motion or biological "tree" metaphors.
- **Immersive Whitespace:** Generous margins that allow high-impact photography and complex data to breathe.

## Colors

The palette uses a "Cool Structure / Warm Humanity" logic. The primary foundation is built on **Ivory** and **Ink**, providing a classic editorial canvas that is softer and more sophisticated than pure white and black.

**Functional Color Roles:**
- **Primaries (Emerald, Teal, Royal):** Used for categorical anchoring and structural accents. These represent the "Sage" intellectual depth.
- **Accents (Gold, Coral, Burnt Orange):** Used for interactive elements, highlights, and "Caregiver" warmth.
- **Surfaces:** Use `ivory` for main backgrounds and `cream` for nested components like cards and navigation rails to create subtle depth without shadows.
- **Typography:** Primary text uses `ink` for maximum legibility, while secondary body text uses the slightly softer `charcoal`.

## Typography

This system employs a tripartite typographic strategy to signal different levels of information:

1.  **The Editorial Serif (Newsreader):** Used for high-impact storytelling and section titles. It should feel authoritative and timeless. Use `display-hero` with tight line-heights for a sophisticated "masthead" look.
2.  **The Functional Sans (Inter):** Used for all long-form reading and core UI descriptions. It provides a clean, neutral balance to the expressive serif.
3.  **The Technical Mono (Space Mono):** Used for metadata, eyebrows, and UI labels. The heavy letter-spacing and uppercase styling create a "codex" or "index" feel, suggesting data-driven precision.

## Layout & Spacing

The layout is governed by an **Editorial Grid** that favors asymmetrical balance and generous "breathing room."

- **Main Structure:** A fixed sidebar (290px) on desktop provides persistent navigation, while the main content area uses a fluid `7vw` horizontal margin to ensure the text remains centered and readable across large displays.
- **Breakpoints:** At `920px`, the layout transitions to a single-column stack. The sidebar collapses into a high-depth mobile overlay.
- **Rhythm:** Vertical spacing between sections should be expansive (typically 80px to 120px) to signify a change in narrative "chapter."

## Elevation & Depth

This system avoids traditional material shadows in favor of **Tonal Layering** and **Glassmorphism**.

- **Surface Hierarchy:** Depth is primarily communicated through color shifts (Ivory → Cream). Surfaces don't "lift" so much as they "rest" on top of each other.
- **Glassmorphism:** Use for persistent top-level navigation (topbars). A background of `rgba(20, 19, 14, 0.86)` with a `10px blur` creates a sophisticated, dark-glass effect that maintains context of the content scrolling beneath.
- **Selective Depth:** High-intensity shadows are reserved for floating modal elements or toast notifications (`0 18px 40px rgba(0,0,0,0.4)`).
- **Interactive Glow:** For specific categorical icons, use a low-opacity shadow tinted with the section's primary color (e.g., Emerald) to create a subtle "semantic glow" on hover.

## Shapes

The shape language is "Softly Architectural." It uses structural rectangles for primary containment but softens all interaction points to feel more approachable.

- **Containers:** Cards and main content blocks use a `14px` radius.
- **Buttons & Chips:** Always use a full **Pill-shape** (rounded-full) to provide a distinct contrast against the structured grid.
- **Accent Borders:** A unique 5px solid border should be applied to the *left edge* of cards or sections to denote their category (Emerald for Impact, Teal for Strategy, etc.).

## Components

- **Buttons:** Use the Technical Mono font (`label-ui`) in uppercase. Primary buttons should be `ink` with `ivory` text or `gold` with `ink` text. The pill shape is mandatory.
- **Cards:** Set on `cream` backgrounds with a `1px` border of `line`. For categorical content, add a 5px solid accent border on the left side.
- **Input Fields:** Minimalist design with only a bottom border (`1px solid line`). Labels use the Technical Mono style at a small scale.
- **Navigation (Tree Nodes):** Use 2px lines (solid or gradient) to connect navigation items, mimicking a biological or structural "branching" system.
- **Progress Bars:** Use a thick (8px) track with rounded ends. The fill should use the primary categorical color (Emerald/Teal).
- **Toasts:** Dark containers (`ink`) with high-contrast `ivory` text, using the `rounded-xl` setting for a floating, physical feel.