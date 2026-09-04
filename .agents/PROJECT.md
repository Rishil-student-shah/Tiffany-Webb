# Project: Tiffany Webb Impact OS™ Platform

## Architecture
- **Target Application**: `Landing Page Work/tiffany-webb-crm` (Express 5 backend, EJS templates) & `Landing Page Work/tiffany-webb-astro` (Public Astro static/SSR frontend)
- **Primary Server Entry**: `Landing Page Work/tiffany-webb-crm/server.js`
- **Views & UI Layout**: `Landing Page Work/tiffany-webb-crm/views/` (10 templates) + `public/css/crm-theme.css`
- **Database Layer**: MySQL (`tiffany_crm`), auto-migrating tables `leads`, `users`, `lead_notes`, `activity_log`, `messages`, `bookings`, `website_collections`, `website_content`
- **Security Suite**: 8-Layer Cyber-Attack Hardening (Helmet, Strict CORS, Rate Limiting, Recursive XSS, SQL Parameterization, Secure Cookies, Root Auth Redirect, Input & File Validation)
- **Design System Invariants**:
  - Official platform name: `Tiffany Webb Impact OS™` (or `Impact OS™`)
  - Official domain: `tiffanywebbimpact.com`, subdomains `crm.tiffanywebbimpact.com`, email `booking@tiffanywebbimpact.com`
  - Half-text gradient title standard: solid `#FBF6EA` first half + `<span class="italic-accent">` signature 3-stop gradient second half
  - Pure vibrant gold eyebrows: `#D9A23A !important`, uppercase mono with pulsating dot indicator

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Impact OS Platform Rebrand | Rebrand all 10 EJS templates, navbar logo, sub-module links, titles, startup banner, and email sender to "Tiffany Webb Impact OS™" | M1 | Survey |
| 2 | Nomenclature Compliance | Eliminate 100% of user-facing occurrences of "Tiffany Webb CRM" and "Admin Panel" | M1 | Survey |
| 3 | Ledger Grid Columns Layout | Implement `2.8fr 2.8fr 1.8fr 1.1fr 185px 125px` with `gap: 1.25rem` in `.ledger-table-header` and `.ledger-row` | M2 | Survey |
| 4 | Collision-Free Stage & Actions | Fixed width 185px `.col-stage`/`.stage-select` and 125px `.col-actions` with 32x32px `.action-icon-btn` | M2 | Survey |
| 5 | Gold Dossier Chevron & 180° Animation | Explicit gold chevron SVG with `pointer-events: none` and 180° rotation on expansion | M2 | Survey |
| 6 | Database Table `lead_notes` | Table schema with `id`, `lead_id` (FK CASCADE), `user_id` (FK SET NULL), `author_name`, `author_role`, `note`, `created_at` | M3 | Survey |
| 7 | Backend Notes API Endpoints | `POST /api/leads/:id/notes` (with audit logging in `activity_log`) and `GET /api/leads/:id/notes` | M3 | Survey |
| 8 | Frontend Dossier Notes Hub | AJAX note submission, live feed rendering with monogram avatars, roles, timestamps, and escaped text | M3 | Survey |
| 9 | Layer 1: Helmet Shield & Headers | Helmet clickjacking deny (`X-Frame-Options: DENY`) and `X-Content-Type-Options: nosniff` | M4 | Survey |
| 10 | Layer 2: CORS Domain Hardening | Whitelist `https://tiffanywebbimpact.com`, `https://crm.tiffanywebbimpact.com`, localhost:4321, localhost:3000 | M4 | Survey |
| 11 | Layer 3: Brute-Force Rate Limiting | 5 attempts / 15 min on `POST /login` with `trust proxy` configuration | M4 | Survey |
| 12 | Layer 4: Recursive XSS Sanitization | Recursive stripping of `<script>`, `javascript:`, `onerror`, `<iframe>` across JSON and Multer multipart form bodies | M4 | Survey |
| 13 | Layer 5: SQL Injection Immunity | 100% parameterized queries; remove unauthenticated duplicate `/api/leads/batch` handler | M4 | Survey |
| 14 | Layer 6: Secure Cookie Governance | JWT `auth_token` with `httpOnly: true`, `sameSite: 'strict'`, `maxAge: 7 days` | M4 | Survey |
| 15 | Layer 7: Root Route Authentication | `GET /` redirects to `/login` (unauthenticated) or `/dashboard` (authenticated) | M4 | Survey |
| 16 | Layer 8: File & Input Validation | Multer image file extension whitelist (.jpg, .jpeg, .png, .webp) and input sanitization | M4 | Survey |
| 17 | E2E Test Suite (Tiers 1-4) | Comprehensive requirement-driven opaque-box test suite for R1, R2, R3, R4 | M5 (Phase 1) | Survey |
| 18 | Adversarial Coverage Hardening (Tier 5) | White-box code analysis and edge-case stress testing | M5 (Phase 2) | Survey |
| 19 | Forensic Integrity Audit | Binary veto audit for authentic implementation | M5 (Phase 3) | Survey |
| 20 | Astro & CRM Production Build & Git Push | Server starts cleanly on port 3000, `npm run build` in Astro passes 0 errors, `git push origin main` | M5 (Phase 4) | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Platform Nomenclature Rebrand | Verify and enforce "Tiffany Webb Impact OS™" across all views and server (F1, F2) | None | DONE |
| M2 | Ledger Layout & Chevron Restoration | Verify and enforce CSS grid columns, collision guardrails, and rotating gold chevron (F3, F4, F5) | None | DONE |
| M3 | Persistent MySQL Team Notes Engine | Verify and validate `lead_notes` schema, API endpoints, audit logging, and dossier UI (F6, F7, F8) | None | DONE |
| M4 | 8-Layer Cyber-Attack Security Suite | Fix CORS whitelist, recursive XSS, Multer file extension filter, and duplicate batch route (F9–F16) | None | IN_PROGRESS |
| M5 | E2E Verification, Adversarial Hardening, Forensic Audit & Git Delivery | Run 100% E2E test suite, Tier 5 hardening, forensic audit, build verification, and git push (F17–F20) | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### `server.js` ↔ Client Browser & Astro Frontend
- **API `POST /api/leads/:id/notes`**:
  - Request: `{ note: string }` with JWT cookie `auth_token`.
  - Response: `{ success: true, note: { id: number, author_name: string, author_role: string, note: string, created_at: string } }`
  - Audit Log: Inserts `activity_log` record with `action: 'note_added'` and detail.
- **API `GET /api/leads/:id/notes`**:
  - Request: Empty body, lead `:id` in URL.
  - Response: `{ success: true, notes: LeadNote[] }` sorted `created_at DESC`.
- **CORS Allowed Origins**:
  - `http://localhost:4321`, `http://localhost:3000`, `http://127.0.0.1:4321`, `http://127.0.0.1:3000`, `https://tiffanywebbimpact.com`, `https://crm.tiffanywebbimpact.com`
- **Security Middleware Chain**:
  - `helmet` -> `cors` -> `trust proxy` -> `express.json` / `express.urlencoded` -> recursive `sanitizeValue` -> Multer (with image extension filter) -> route handlers -> parameterized `pool.query`

## Code Layout
- `Landing Page Work/tiffany-webb-crm/server.js`: Express server, security middlewares, authentication, and REST APIs.
- `Landing Page Work/tiffany-webb-crm/views/`: 10 EJS views (`dashboard.ejs`, `lead.ejs`, `new-lead.ejs`, `users.ejs`, `cms.ejs`, `cms-page.ejs`, `cms-collection-edit.ejs`, `login.ejs`, `forgot-password.ejs`, `reset-password.ejs`).
- `Landing Page Work/tiffany-webb-crm/public/css/crm-theme.css`: Core design system CSS, ledger grid layout, responsive styles.
- `Landing Page Work/database/schema.sql` & `Landing Page Work/tiffany-webb-crm/db/schema.sql`: Database table declarations.
- `Landing Page Work/tiffany-webb-astro/`: Astro frontend application.
