# Tiffany Webb Web Platform & CRM — Opaque-Box E2E Testing Infrastructure

**Document Version:** 1.0.0  
**Test Suite Status:** Ready / Complete  
**Engine:** Node.js (v20+ / v22+) + MySQL 8  
**Architecture:** Opaque-Box Automated E2E Runner & 4-Tier Test Suite  
**Location:** `tests/`  

---

## 1. Overview & Architecture

The Tiffany Webb E2E Testing Infrastructure provides an automated, zero-fragility test harness designed to validate all aspects of the Tiffany Webb brand web platform and CRM system without depending on flaky browser binaries or external mock services.

### Core Testing Pillars
1. **Opaque-Box Verification:** Tests assert exclusively on observable outputs: rendered HTML DOM structures, HTTP status codes, redirection headers (301 Location), JSON response payloads, and database persistence records.
2. **Deterministic Data Integrity:** Connects directly to the MySQL database (`tiffany_crm`) to test live SQL queries, relational constraints, foreign keys, and dynamic updates across `website_pages`, `website_content`, `website_collections`, `leads`, and `activity_log`.
3. **Requirement-Driven 4-Tier Methodology:** Covers every section across all 7 pages, boundary/corner conditions, cross-feature integrations, and real-world user lifecycles.
4. **Single-Command Execution:** Runs the entire test suite in a single command with unified reporting and color-coded diagnostic summaries:
   ```bash
   node tests/run_e2e_tests.js
   ```

---

## 2. Infrastructure Directory Layout

```
D:\FREELANCE\TIFFANY WEB\
├── tests/
│   ├── run_e2e_tests.js                       # Master single-command E2E test runner
│   │
│   ├── helpers/
│   │   ├── test_framework.js                 # Lightweight describe/it/expect assertion engine
│   │   ├── db_helper.js                      # MySQL connection pool, query helpers & fixtures
│   │   ├── dom_parser.js                     # DOM/HTML parser for SSR template validation
│   │   └── app_harness.js                    # HTTP dispatcher for CRM APIs, CMS & SSR rendering
│   │
│   ├── tier1_feature_coverage.test.js        # Tier 1: 45 tests (>=5 per feature across all 7 pages + APIs + CMS)
│   ├── tier2_boundary_corner_cases.test.js   # Tier 2: 20 tests (empty collections, invalid payloads, 404s, XSS)
│   ├── tier3_cross_feature_integrations.test.js # Tier 3: 12 tests (prefills, 301 redirects, anchors, CMS sync)
│   └── tier4_real_world_lifecycle.test.js    # Tier 4: 7 tests (end-to-end user inquiry & CRM lifecycle)
│
├── TEST_INFRA.md                             # Infrastructure specification & architecture documentation
└── TEST_READY.md                             # Test execution results & readiness verification report
```

---

## 3. Test Harness Components

### 3.1 `test_framework.js` (Assertion Engine)
- Provides standard BDD syntax: `describe()`, `it()`, `beforeAll()`, `afterAll()`, `beforeEach()`, `afterEach()`.
- Built-in matcher library:
  * `expect(a).toBe(b)` (primitive equality)
  * `expect(a).toEqual(b)` (deep object/array equality)
  * `expect(a).toContain(b)` (substring / array element inclusion)
  * `expect(a).toNotContain(b)` (negative substring / array check)
  * `expect(a).toMatch(regex)` (regex pattern matching)
  * `expect(a).toBeGreaterThan(n)` / `toBeGreaterThanOrEqual(n)`
  * `expect(a).toBeTruthy()` / `toBeFalsy()` / `toBeNull()`
- Automatic timing per test step, stack trace formatting, and suite aggregation.

### 3.2 `db_helper.js` (Database Connector & Fixtures)
- Manages MySQL 8 connection pool with automatic keepalive and clean teardown.
- Implements transaction/query helpers: `query()`, `getPageBySlug()`, `getContentByPageSlug()`, `getLeads()`, `getActivityLog()`.
- Provides test fixture cleaners (`deleteTestLeadsByEmail`) to guarantee test isolation without polluting production lead tables.

### 3.3 `dom_parser.js` (DOM & SSR HTML Inspector)
- Parses HTML into structured query trees.
- Extracts and evaluates:
  * Elements by tag name, `id`, and `class`
  * Hyperlink URLs (`href`), anchor targets, and data attributes (`data-track`, `data-audience`)
  * HTML forms, input types, required attributes, select options, and textarea default values
  * Entity unescaping (`&mdash;`, `&quot;`, `&amp;`) and text normalization.

### 3.4 `app_harness.js` (Express & SSR Dispatcher)
- Hosts an ephemeral in-memory Express dispatch server connecting directly to MySQL.
- Mounts all CRM REST APIs: `POST /api/leads`, `GET /api/content/:slug`, `POST /api/leads/batch`, `POST /api/pages/:id/toggle`, `POST /api/leads/bulk-delete`.
- Mounts CMS EJS views: `GET /cms`, `GET /cms/:slug`, `POST /cms/:slug/collection/:section/new`, `POST /lead/:id/status`, `GET /dashboard`.
- Implements high-fidelity SSR renderer simulating Astro 5 data fetching pipelines for all 7 pages.

---

## 4. Four-Tier Test Suite Specification

### Tier 1: Feature Coverage (>=5 tests per feature, 45 total)
| Feature # | Scope | Key Validations |
|---|---|---|
| **Feature 1** | `/about` Page | Hero copy, 6 thematic vignettes, BBA/MHP credentials & 4 expertise areas, `/services#gear` signpost, `#specialism` anchor, 5 Core Values, GambleFreeGear, closing CTA. |
| **Feature 2** | `/services` Page | Hero, 4 Capabilities with deep-link IDs (`#strategic-advisor`, `#program-architect`, etc.), GEAR Method 4 steps, speaking teaser, 6 formats, 4 working steps, closing CTA. |
| **Feature 3** | `/services/speaking-topics` | Hero, filter bar pills, exactly 20 topic cards, 4 track color coding, 20 prefill buttons targeting `/work-with-tiffany?topic=...`, CTA. |
| **Feature 4** | `/impact` Page | Hero, aggregate stats (15+ Years, 4,000+ Hours, 20 Topics), upcoming empty state banner, past empty state archive notice, 3 outcome stories slots, practice link -> `/about#specialism`, closing CTA. |
| **Feature 5** | `/media` Page | Hero, 3 download cards (One-Sheet, Media Kit, Capability Kit), 3 bios in 3 lengths (Short, Medium, Long) with copy triggers, stage intro script, 5 talking points, Media CTA -> `/work-with-tiffany?type=Media`. |
| **Feature 6** | `/work-with-tiffany` | Hero, 9-field AJAX lead form with HTML5 validation, 4 next steps, alternative contact info (`booking@tiffanywebb.com`, Chicago location). |
| **Feature 7** | `/insights` Page | Hero, 3 seed article cards with tags and read times, max-width 68ch serif template container, navigation exclusion rule (<6 articles). |
| **Feature 8** | Public REST APIs | `GET /api/content/:slug` JSON contract, `POST /api/leads` validation & storage, `POST /api/leads/batch` CSV ingestion, `POST /api/pages/:id/toggle`, `POST /api/leads/bulk-delete`. |
| **Feature 9** | CRM CMS Admin | Pages listing, page section editor, collection items CRUD (add/edit/delete), lead status updates with audit logging, dashboard charts. |

### Tier 2: Boundary & Corner Cases (20 tests)
- **Empty Collections:** Graceful collapse of `about_affiliations`, `services_faqs`, `booking_faqs`, and `impact_testimonials` with zero UI gaps; fallback banners on `impact_upcoming` and `impact_past`.
- **Payload Validation:** HTTP 400 on missing name/org/event_type; HTTP 422 on malformed email; graceful null storage on optional fields; invalid date string sanitization.
- **Route Error Handling:** HTTP 404 on non-existent slugs, inactive pages (`is_active = 0`), and invalid CMS routes.
- **Extreme Inputs:** HTML entity escaping for XSS prevention in `?topic=`, empty query strings, 1000-character long query strings, and special characters (`&`, `#`, `+`, `%`).

### Tier 3: Cross-Feature Combinations & Integrations (12 tests)
- **Topic Prefill Hand-Off:** Speaking topic card click -> auto-populates `/work-with-tiffany` textarea with `"Inquiring about speaking topic: [Title]"`; Media CTA pre-selects `"Media / Press Inquiry"`.
- **301 Permanent Redirects:** `/speaking` -> 301 -> `/services`; `/book` -> 301 -> `/work-with-tiffany`; global navigation links point to canonical routes.
- **Deep Link Anchors:** Cross-page anchor validation (`/about` -> `/services#gear`, `/impact` -> `/about#specialism`, `#strategic-advisor` on `/services`).
- **CMS -> Frontend Dynamic Sync:** Live DB key-value edits immediately update rendered Astro HTML; collection item insertions/deletions reflect instantly; top nav `/insights` link dynamically appears when published articles reach >=6.

### Tier 4: Real-World Application Lifecycle (7 tests)
End-to-end 7-step lead inquiry simulation:
1. User arrives on `/services/speaking-topics` and browses topics.
2. User selects Topic #2 ("Don't Bet on Your Future (Youth Focus)") and follows prefill link.
3. User lands on `/work-with-tiffany`, where form initializes with prefilled topic message.
4. User completes 9 form fields and submits via AJAX `POST /api/leads`.
5. API validates and persists lead into MySQL `leads` table with initial `activity_log` entry.
6. Admin opens CRM Leads Dashboard (`/dashboard`), verifying the new lead appears.
7. Admin opens Lead Detail view (`/lead/:id`) and updates status to `'qualified'`, recording audit log entry.

---

## 5. How to Run the Tests

### Single Command
```bash
node tests/run_e2e_tests.js
```

### Environment Configuration
Ensure `.env` in `Landing Page Work/tiffany-webb-crm/.env` contains valid MySQL credentials:
```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=@rishil8124shah
DB_NAME=tiffany_crm
PORT=3000
```
