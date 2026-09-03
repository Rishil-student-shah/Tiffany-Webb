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

## 3. Canonical Domain & Contact Invariants
- **Official Production Domain**: `tiffanywebbimpact.com`
- **Executive CRM & CMS Subdomain**: `crm.tiffanywebbimpact.com`
- **Official Booking & Inbound Email**: `booking@tiffanywebbimpact.com`
- **Strict Invariant**:
  - Never use `tiffanywebb.com` or generic placeholder emails (`info@...`, `hello@...`) in production code, mailer transports, CORS whitelists, or documentation.
  - All public inquiries, Nodemailer notification configs, and Hostinger DNS/SSL setups must strictly target `tiffanywebbimpact.com` and `booking@tiffanywebbimpact.com`.

## 4. Platform Nomenclature Invariant (Tiffany Webb Impact OS™)
- **Official Platform Name**: `Tiffany Webb Impact OS™` (or `Impact OS™`).
- **Strict Invariant**:
  - Never refer to the platform as generic "CRM", "CMS", or "Admin Panel" in user-facing UI, navbars, page titles, or client documentation.
  - Navbar logo branding must strictly display as:
    ```html
    <h1 class="nav-logo">Tiffany Webb <span>Impact OS</span></h1>
    ```
  - Page titles and browser tab metadata must strictly use:
    ```html
    <title>[Module Name] — Tiffany Webb Impact OS</title>
    ```
    *(e.g., `Pipeline Ledger — Tiffany Webb Impact OS`, `Website Studio — Tiffany Webb Impact OS`)*
  - The pipeline ledger and live website editor are official sub-modules of the unified **Impact OS™** (`Pipeline Ledger` and `Website Studio`).


