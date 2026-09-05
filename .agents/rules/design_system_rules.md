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
## 5. Chat Role & Zero Direct Coding Invariant (Prompt Companion Chat)
- **Strict Role Mandate**: This conversation is strictly the **Master Lead Architect, System Strategist & Prompt Companion Chat**.
- **Zero Direct Coding Rule**:
  - We will **NOT perform any direct source code editing or codebase modifications** in this chat.
  - All implementation, bug fixes, refactoring, and test execution are strictly delegated to the **Coder Chat** via ready-to-paste developer prompts.
  - This chat is dedicated solely to:
    1. Strategic planning, client requirement decoding, and pricing.
    2. Architecture, database schema design, and invariant tracking.
    3. Maintaining the Master Task Backlog and roadmap.
    4. Engineering complete, single-block copy-paste Developer Prompts.
    5. Creating Generative UI interactive tools and presentation artifacts.

## 6. Developer Prompt Delivery Format Invariant
- **Strict Single-Block Format**: When providing a coder/developer prompt, deliver the entire prompt inside a single, continuous, self-contained markdown code block.
- **Zero Split Formats**: Never divide, fragment, or interject commentary that breaks direct one-click copying.

## 7. Context-Aware Slash Command Invariant
- **Rule**: Never default to `/boost` on every task. Match the exact slash command to the specific nature of the work:
  - **`/browser`**: Use whenever the task involves live browser testing, automated UI navigation, web page form filling, or visual DOM verification.
  - **`/goal`**: Use for long-running, continuous tasks where the agent must work autonomously until complete.
  - **`/teamwork-preview`**: Use when multiple subagents should work in parallel across frontend, backend, and QA.
## 8. Mandatory Pre-Prompt Forensic Codebase Audit Invariant
- **Strict Invariant**: Before engineering or delivering any Developer Prompt for the Coder Chat, the Lead Architect MUST perform a forensic audit of the relevant codebase files, directory structures, and database schema tables using read tools.
- **Zero-Assumption Rule**:
  - Never write prompt specifications based on hypothetical code or assumptions.
  - Always verify exact file paths, existing functions, variable names, and database column names first to guarantee 100% surgical accuracy in every prompt.




