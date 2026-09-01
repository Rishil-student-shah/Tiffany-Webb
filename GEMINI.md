---
trigger: always_on
description: Design system rules for section titles, half-text gradients, and eyebrow styling.
---

# Tiffany Webb Design System Rules

## 1. Section Titles (Half-Text Gradient Standard)
- **Never use 100% full-text gradient titles**.
- **First Half**: Pure solid ivory white (`#FBF6EA`, non-gradient, normal/editorial serif weight).
- **Second Half**: Wrapped in `<span class="italic-accent">` using the exact 3-stop signature gradient:
  ```css
  background: linear-gradient(92deg, #D9A23A 0%, #E17356 50%, #6C2D5A 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  display: inline;
  font-style: italic;
  ```
- **Parent Container Guardrail**: Parent title classes (`.works-title`, `.gear-h2`, `.proof-title`) must never apply `background-clip: text` directly to the parent element, ensuring the first half remains solid ivory white.

## 2. Eyebrows (Keylines)
- All section eyebrows across all pages must use pure vibrant gold:
  ```css
  color: #D9A23A !important;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-family: var(--font-mono);
  ```
