# Original User Request

## 2026-08-30T08:58:12Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Completely redesign the UI and UX of the Tiffany Webb CRM Leads Dashboard (`views/dashboard.ejs`). The redesign must include a cohesive premium color palette (Deep Forest Sage, Ink, Ivory, Gold), elegant typography, modernized charts, a unified action/search bar, and polished animations. You are authorized to pull in external UI libraries (like Tailwind via CDN) and rebuild the frontend logic for a smoother experience.

Working directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm
Integrity mode: benchmark

## Requirements

### R1. Complete Visual Overhaul
Redesign the entire `dashboard.ejs` page to feel like a premium, modern web application. Unify the design language so that charts, action bars, search inputs, and lead cards share the same aesthetic (glassmorphism, cohesive padding, elegant typography). You may introduce Tailwind CSS via CDN or external charting libraries to achieve this.

### R2. Smooth UX and AJAX Interactions
Rewrite the frontend JavaScript in `dashboard.ejs` to eliminate clunky page reloads. Searching for leads, filtering by status tabs, and bulk-deleting leads must happen via AJAX fetches with smooth DOM transition animations (fade-ins, sliding lists). 

## Acceptance Criteria

### Visual Quality (Agent-as-Judge)
- [ ] The design utilizes the defined brand colors (Deep Forest Sage, Gold, Ivory, Ink) consistently across all components.
- [ ] There are no unstyled or clashing legacy elements remaining (e.g., bright red default buttons, misaligned charts).
- [ ] Hover states and transitions are smooth and implemented on all interactive elements.

### Functional UX (Programmatic / Agent-as-Judge)
- [ ] Typing in the search bar updates the lead list dynamically without a full page refresh.
- [ ] Clicking a status tab seamlessly hides/shows the relevant leads with an animation, without a page reload.
- [ ] Deleting a lead successfully calls the backend and removes the card from the DOM smoothly.

## 2026-08-30T09:36:29Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Build and structure all inner pages (`/about`, `/services`, `/services/speaking-topics`, `/impact`, `/media`, `/work-with-tiffany`, `/insights`) strictly adhering to the provided content specification. The design must aggressively enforce the Tiffany Webb brand system (Dark Ink background, Deep Forest Sage accents, Gold/Ivory typography, Instrument Serif / Plus Jakarta Sans).

**CRITICAL DATA REQUIREMENT:** Every single text string, paragraph, bullet point, list, and configuration array defined in the spec must be 100% database-driven. You must expose every section (including the 4 capabilities, 20 speaking topics, engagement formats, FAQ arrays, etc.) in the CRM dashboard so the user has detailed editing access to all of them.

Working directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-astro
CRM directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm
Integrity mode: development

## Requirements

### R1. Strictly Implement the Page Specifications
You must build the following pages exactly in this order with these sections:

**1. /about**
01. Page hero — "Chicago Heart A- Louisiana Soul"
02. The story — long form, first person, 5–7 paragraphs (vignettes). Mark CONTENT-PENDING.
03. Credentials & Expertise — "Expertise that moves people." + BBA, MHP + 4 areas.
04. How she works — Signpost linking to /services#gear
05. The specialism — (id="specialism") "Where this work began."
06. Values — 5 items + pull quote.
07. Professional affiliations — Config array, ships EMPTY (hidden when empty).
08. GambleFreeGear — Paragraph + link.
09. CTA → /work-with-tiffany

**2. /services (Redirect /speaking here)**
01. Page hero — "Strategy with people at the center."
02. Four Capabilities — alternating blocks with deep-link IDs (strategic-advisor, program-architect, community-impact-strategist, speaker-facilitator).
03. The GEAR Method™ (id="gear") — Expanded descriptions.
04. Speaking & Facilitation — "Conversations that create change." + link to topics.
05. Engagement Formats — 6 cards + long-tail line. Semantically appropriate icons.
06. What working together looks like — 4 steps.
07. FAQ — Config array, ships EMPTY (hidden when empty).
08. CTA → /work-with-tiffany

**3. /services/speaking-topics**
01. Hero — "Conversations that create change."
02. Filter Bar — By audience, By track (Client-side, no reload).
03. Topic Grid — Exactly 20 cards grouped by the 4 tracks, color-coded. Card link to form pre-fills the message field via query string. Mark session lengths/takeaways CONTENT-PENDING.
04. CTA

**4. /impact**
01. Hero — "Where the work has taken me."
02. Aggregate Band — Config-driven, ships empty.
03. Upcoming Engagements — Ships empty ("Next dates announced soon").
04. Past Engagements — Ships empty, filterable by year/format/audience.
05. Outcome Stories — 3 slots. Ships empty.
06. Gambling Prevention Work — Describe practice, do not name employer. Link -> /about#specialism.
07. Testimonials — Ships empty.
08. CTA

**5. /media**
01. Hero — "Ready for the room — and the story."
02. Downloads — Asset cards (hide unavailable ones, don't show dead links).
03. Bios — 3 lengths. THIRD PERSON voice. Mark CONTENT-PENDING.
04. Introduction Script — THIRD PERSON. Mark CONTENT-PENDING.
05. What she can speak to — short list.
06. Media inquiries CTA → /work-with-tiffany?type=Media.

**6. /work-with-tiffany (Redirect /book here)**
01. Hero — "Let's create impact together."
02. The Form — 9 fields, POSTs to https://app.tiffanywebbimpact.com/api/leads. Inline validation, no reload.
03. What happens next — 4 steps.
04. FAQ — Config-driven, ships empty.
05. Alternative contact — Email and location.

**7. /insights**
01. Hero — "Thinking out loud."
02. Article Grid — Cards with title/date/time/excerpt.
03. Article Template — max-width 68ch, serif body, large line height. Keep out of top nav until 6 articles exist.

### R2. Global Database & CRM Integration
You must modify the MySQL database schema and the CRM `server.js` / `.ejs` templates to expose all content arrays (FAQs, Testimonials, Speaking Topics, Capabilities, Media Bios, etc.) as editable collections. The Astro pages must fetch and render this data dynamically.

### R3. Remove Legacy Code
Delete the legacy sections from `/about` (`roots`, `journey`, `core`) and `/services` (`Why Tiffany`, old Hero) as they are no longer in the spec.

## Acceptance Criteria

### CRM Visibility (Programmatic)
- [ ] Every configuration array (e.g., Professional Affiliations, FAQs, Upcoming Engagements, Media Bios) is visible and editable in the CRM interface.
- [ ] The 20 Speaking Topics and 4 Capabilities have dedicated CRM editing fields.

### Architecture & Fidelity (Agent-as-Judge)
- [ ] All specified pages route correctly and render without errors.
- [ ] No placeholder organizations or dummy text are visible unless explicitly marked CONTENT-PENDING or EMPTY per the spec.
- [ ] The design strictly obeys the brand typography and color palette guidelines.

## 2026-09-03T20:59:19Z

Rebrand the Tiffany Webb CRM platform to "Tiffany Webb Impact OS™" across every user-facing view and server component, fix the Executive Pipeline Ledger UI layout (button collision and invisible chevron icon), implement a persistent multi-user team notes engine backed by MySQL, and audit the 8-Layer Cyber-Attack Security Suite for completeness.

Working directory: D:\FREELANCE\TIFFANY WEB
Integrity mode: development

**Key Paths:**
- CRM Express backend: `D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm`
- CRM server entry: `Landing Page Work/tiffany-webb-crm/server.js`
- CRM views: `Landing Page Work/tiffany-webb-crm/views/` (dashboard.ejs, new-lead.ejs, cms.ejs, cms-page.ejs, cms-collection-edit.ejs, users.ejs, lead.ejs, login.ejs, forgot-password.ejs, reset-password.ejs)
- CSS theme: `Landing Page Work/tiffany-webb-crm/public/css/crm-theme.css`
- Database schema: `Landing Page Work/database/schema.sql` and `Landing Page Work/tiffany-webb-crm/db/schema.sql`
- MySQL database: `tiffany_crm` (Host: localhost, User: root, Password: @rishil8124shah)

**Design System Rules (MUST follow):**
- Section titles use the "half-text gradient" standard: first half is solid ivory white (`#FBF6EA`), second half is wrapped in `<span class="italic-accent">` with `background: linear-gradient(92deg, #D9A23A 0%, #E17356 50%, #6C2D5A 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;`
- All section eyebrows use pure vibrant gold: `color: #D9A23A !important; font-size: 0.95rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; font-family: var(--font-mono);`
- Official domain: `tiffanywebbimpact.com`, email: `booking@tiffanywebbimpact.com`
- Never refer to the platform as "CRM" or "Admin Panel" — always "Tiffany Webb Impact OS™" or "Impact OS™"

## Requirements

### R1. Official Platform Nomenclature Invariant (Tiffany Webb Impact OS™)
Rebrand every user-facing view (all `.ejs` files in `views/`) and the server startup banner:
1. **Navbar logo**: `<h1 class="nav-logo">Tiffany Webb <span>Impact OS</span></h1>` — must appear identically on every page.
2. **Sub-module navigation links**: `Pipeline Ledger` (/dashboard), `+ Log Inbound` (/leads/new), `Website Studio` (/cms), `Team & Access` (/users), `Admin` pill, `Logout`.
3. **Browser tab titles**: Each page must use `[Module Name] — Tiffany Webb Impact OS` (e.g., `Pipeline Ledger — Tiffany Webb Impact OS`, `Log Inbound — Tiffany Webb Impact OS`, `Website Studio — Tiffany Webb Impact OS`, `Team & Access — Tiffany Webb Impact OS`, `Executive Login — Tiffany Webb Impact OS`).
4. **Dashboard header eyebrow**: Gold pulsating dot + `Executive Command & Deal Flow` in mono uppercase.
5. **Dashboard title**: `Executive <span class="italic-accent">Pipeline Ledger</span>` following the half-text gradient standard.
6. **Transactional email sender** in Nodemailer: `"Tiffany Webb Impact OS"` not `"Tiffany Webb CRM"`.
7. Zero remaining occurrences of "Tiffany Webb CRM" in any user-facing string (navbar, title tags, email sender, server banner, comments visible to user).

### R2. Fix Button Collision & Restore Missing Chevron Icon
1. **CSS grid columns** in `crm-theme.css`: `.ledger-table-header` and `.ledger-row` must use `grid-template-columns: 2.8fr 2.8fr 1.8fr 1.1fr 185px 125px;` with `gap: 1.25rem;`.
2. **Stage column**: `.col-stage` must have `min-width: 185px; flex-shrink: 0;` and `.stage-select` must have `max-width: 185px; box-sizing: border-box;`.
3. **Actions column**: `.col-actions` must have `min-width: 125px; flex-shrink: 0; display: flex; justify-content: flex-end; gap: 8px;`.
4. **Action icon buttons**: `.action-icon-btn` must be exactly `32px × 32px` with `min-width: 32px`.
5. **3rd button (chevron)**: Must render an explicit visible gold chevron via `<svg stroke="#D9A23A" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>` with `pointer-events: none` on the SVG child. Must rotate 180° when the dossier is expanded.

### R3. Persistent Multi-User Team Notes Engine
1. **Database table** `lead_notes` with columns: `id` (AUTO_INCREMENT PK), `lead_id` (FK → leads.id ON DELETE CASCADE), `user_id` (FK → users.id ON DELETE SET NULL), `author_name` (VARCHAR 150), `author_role` (VARCHAR 50, default 'staff'), `note` (TEXT), `created_at` (DATETIME, default CURRENT_TIMESTAMP).
2. **POST /api/leads/:id/notes**: Validates note body, resolves author identity from JWT/session, inserts into `lead_notes`, logs audit record into `activity_log`.
3. **GET /api/leads/:id/notes**: Returns notes in reverse chronological order.
4. **Frontend notes hub** in `dashboard.ejs` dossier accordion: text input + `+ Post Note` button, AJAX submission (no page reload), rendered feed with author initial avatar monogram, author name, role badge pill (ADMIN/ASSISTANT/STAFF), formatted timestamp, and escaped note body.

### R4. 8-Layer Cyber-Attack Security Suite Verification
Audit and verify these 8 layers are correctly implemented in `server.js`:
1. **Helmet Shield**: `helmet({ contentSecurityPolicy: false, frameguard: { action: 'deny' } })` — Clickjacking denied, X-Content-Type-Options: nosniff.
2. **CORS Hardening**: Strict whitelist for `http://localhost:4321`, `http://localhost:3000`, and `https://tiffanywebbimpact.com`.
3. **Brute-Force Rate Limiting**: `/login` limited to 5 attempts per 15 minutes per IP.
4. **XSS Sanitization**: Recursive stripping of `<script>`, `javascript:`, `onerror`, `<iframe>` from all user inputs.
5. **SQL Injection Immunity**: 100% parameterized queries with `?` placeholders — zero string concatenation in SQL.
6. **Secure Cookie Governance**: JWT `auth_token` cookie with `httpOnly: true`, `sameSite: 'strict'`, `maxAge: 7 days`.
7. **Root Route Authentication**: `GET /` redirects to `/login` (unauthenticated) or `/dashboard` (authenticated).
8. **Input Validation**: All form inputs validated and sanitized before database insertion.

## Acceptance Criteria

### Nomenclature Compliance
- [ ] `grep -ri "Tiffany Webb CRM" views/ server.js` returns exactly zero matches in user-facing strings.
- [ ] Every `.ejs` file's `<title>` tag follows the pattern `[Module Name] — Tiffany Webb Impact OS`.
- [ ] The navbar on every page renders `Tiffany Webb Impact OS` (not CRM, not Admin Panel).

### Ledger UI Layout
- [ ] The stage dropdown and action buttons on every lead row have visible clear spacing (no overlap, no touching) when viewed at 1400px viewport width.
- [ ] Every lead row renders a visible gold chevron button (not invisible, not transparent, not missing) — verified by screenshot or DOM inspection confirming `stroke="#D9A23A"` on the SVG.
- [ ] Clicking the chevron rotates it 180° and expands the dossier drawer smoothly.

### Notes Engine Functionality
- [ ] Posting a note via the dossier input field and `+ Post Note` button inserts a row into MySQL `lead_notes` table with correct `lead_id`, `author_name`, `author_role`, and `note` values.
- [ ] The note appears instantly in the notes feed without a page reload, showing author initial monogram, name, role badge, timestamp, and body.
- [ ] A corresponding audit record is inserted into `activity_log`.
- [ ] `GET /api/leads/:id/notes` returns notes in reverse chronological order.

### Security Suite
- [ ] Helmet response headers are present: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- [ ] Sending 6 rapid POST requests to `/login` with wrong credentials results in a rate-limit response on the 6th attempt.
- [ ] Submitting `<script>alert(1)</script>` in any form field does NOT store raw `<script>` tags in the database.
- [ ] No SQL query in `server.js` uses string concatenation — all use `?` parameterized placeholders.
- [ ] The `auth_token` cookie has `httpOnly: true` and `sameSite: strict`.
- [ ] Navigating to `http://localhost:3000/` while unauthenticated redirects to `/login`.

### Build & Deployment
- [ ] CRM server starts without errors on port 3000.
- [ ] `npm run build` in the Astro project completes with 0 errors.
- [ ] All changes are committed and pushed to GitHub (`git push origin main`).

