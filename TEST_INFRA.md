# Tiffany Webb Impact OS™ Platform — E2E Testing Infrastructure

**Document Version:** 2.0.0  
**Target Milestone:** Tiffany Webb Impact OS™ Platform Verification (R1, R2, R3, R4)  
**Execution Environment:** Node.js (v20+ / v22+ / v24+) + Express 5 + MySQL 8  
**Architecture:** Automated 4-Tier Opaque-Box E2E Testing Harness  
**Location:** `Landing Page Work/tiffany-webb-crm/test/`  
**Master Runner:** `node test/run_e2e_suite.cjs`  

---

## 1. Overview & Architecture

The Tiffany Webb Impact OS™ E2E Testing Infrastructure provides an automated, zero-fragility testing harness engineered to validate all functional, architectural, design-system, and cyber-security invariants across the executive CRM platform.

### Core Testing Principles
1. **Opaque-Box Verification:** Asserts exclusively on observable system behaviors: rendered EJS/CSS markup, HTTP response status codes, redirect `Location` headers, cookie attributes (`HttpOnly`, `SameSite=Strict`, `Max-Age`), JSON API payloads, and MySQL transactional persistence.
2. **Deterministic Data Integrity:** Interacts directly with the live MySQL database (`tiffany_crm`) to verify relational table schemas, primary keys, foreign key constraints (`ON DELETE CASCADE`, `ON DELETE SET NULL`), and audit logging in `activity_log`.
3. **Requirement-Driven 4-Tier Methodology:** Organizes coverage across four distinct tiers:
   - **Tier 1:** Feature Coverage (>=5 tests per feature area across R1, R2, R3, and R4).
   - **Tier 2:** Boundary & Corner Cases (>=5 tests per feature area including empty collections, width limits, nested XSS, rate limits, SQLi).
   - **Tier 3:** Cross-Feature Interactions (Session cookies, audit logging, reverse chronological sorting, CASCADE deletes, DOM ID linkages).
   - **Tier 4:** Real-World Application Scenarios (Complete 9-step executive workflow from root redirect to session logout).
4. **Single-Command Unified Runner:** Executes all 4 tiers sequentially with aggregated reporting and diagnostic scorecards via `node test/run_e2e_suite.cjs`.

---

## 2. Infrastructure Directory Layout

```
Landing Page Work/tiffany-webb-crm/test/
├── run_e2e_suite.cjs                         # Master single-command E2E test runner
│
├── helpers/
│   ├── test_runner.cjs                       # Lightweight BDD describe/it/expect assertion engine
│   ├── db_helper.cjs                         # MySQL2 pool manager, test fixtures & cleanup
│   └── http_helper.cjs                       # HTTP client with cookie jar, header extraction & auth
│
├── tier1_feature_coverage.test.cjs           # Tier 1: 27 tests (Feature coverage for R1, R2, R3, R4)
├── tier2_boundary_corner_cases.test.cjs      # Tier 2: 22 tests (Boundary & adversarial corner cases)
├── tier3_cross_feature_interactions.test.cjs # Tier 3: 6 tests (Subsystem interactions & cascades)
└── tier4_real_world_scenarios.test.cjs       # Tier 4: 9 tests (Complete end-to-end executive lifecycle)
```

---

## 3. Test Harness Components

### 3.1 `test_runner.cjs` (BDD DSL & Assertion Engine)
- Provides standard BDD syntax: `describe()`, `it()`, `beforeAll()`, `afterAll()`, `beforeEach()`, `afterEach()`.
- Supports both synchronous assertions and asynchronous operations returning Promises.
- Comprehensive matcher library:
  * `expect(a).toBe(b)` (primitive equality)
  * `expect(a).toEqual(b)` (deep object/array strict equality)
  * `expect(a).toContain(b)` (string substring or array element containment)
  * `expect(a).toNotContain(b)` (negative containment check)
  * `expect(a).toMatch(regex)` (regular expression pattern matching)
  * `expect(a).toNotMatch(regex)` (negative pattern matching)
  * `expect(a).toBeDefined()` / `toBeNull()`
  * `expect(a).toBeTruthy()` / `toBeFalsy()`
  * `expect(a).toBeGreaterThan(n)` / `toBeLessThan(n)`
- Built-in per-test execution timer, formatted stack traces on failure, and ANSI colorized terminal reporting.

### 3.2 `db_helper.cjs` (MySQL Connection Pool & Fixture Management)
- Connects to `tiffany_crm` using connection pooling (`mysql2/promise`).
- Provides deterministic test lead creation (`createTestLead`) with unique timestamped emails (`e2e_test_*@tiffanywebbimpact.com`).
- Provides automated fixture teardown (`deleteTestLead`, `cleanupTestLeadsByPattern`) to guarantee database hygiene.
- Helper inspectors: `getLeadNotes()`, `getActivityLogs()`, and `closePool()`.

### 3.3 `http_helper.cjs` (Express HTTP Client & Cookie Manager)
- Dispatches HTTP requests (`GET`, `POST`, `OPTIONS`, `postForm`) against `http://127.0.0.1:3000`.
- Automated cookie parser extracting `Set-Cookie` headers into structured objects and formatted `Cookie` request headers.
- Built-in `loginAsAdmin()` helper that authenticates with the CRM and extracts the `auth_token` cookie.
- JWT token generator (`generateToken`) for isolated signature tests.

---

## 4. Four-Tier Test Suite Specification

### Tier 1: Feature Coverage (27 Tests)
- **R1: Platform Rebrand & Nomenclature (7 tests)**:
  * `R1.1`: All 10 `.ejs` view templates have `<title>` tags ending in `— Tiffany Webb Impact OS`.
  * `R1.2`: All 7 authenticated views render the unified navbar logo `<h1 class="nav-logo">Tiffany Webb <span>Impact OS</span></h1>`.
  * `R1.3`: Authenticated views include official sub-module links: `Pipeline Ledger`, `+ Log Inbound`, `Website Studio`, `Team & Access`, `Admin` pill, and `Logout`.
  * `R1.4`: Dashboard header renders pulsating gold dot (`class="pulse-dot"`) and uppercase mono eyebrow (`Executive Command & Deal Flow`).
  * `R1.5`: Dashboard title adheres to the half-text gradient standard: solid `#FBF6EA` first half and `<span class="italic-accent">Pipeline Ledger</span>` second half.
  * `R1.6`: Server startup banner prints `🛡️ Tiffany Webb Impact OS™ active` and Nodemailer sender is `"Tiffany Webb Impact OS"`.
  * `R1.7`: Exactly 0 remaining user-facing occurrences of "Tiffany Webb CRM" or "Admin Panel" in views and `server.js`.
- **R2: Ledger Layout & Chevron Restoration (6 tests)**:
  * `R2.1`: `.ledger-table-header` and `.ledger-row` use exact grid template columns: `2.8fr 2.8fr 1.8fr 1.1fr 185px 125px;` with `gap: 1.25rem;`.
  * `R2.2`: Stage column `.col-stage` specifies `min-width: 185px;` and `.stage-select` specifies `max-width: 185px; box-sizing: border-box;`.
  * `R2.3`: Actions column `.col-actions` specifies `min-width: 125px;` with `gap: 8px; justify-content: flex-end;`.
  * `R2.4`: Action icon buttons `.action-icon-btn` are exactly `32px × 32px` with `min-width: 32px`.
  * `R2.5`: 3rd button renders visible gold chevron SVG with `stroke="#D9A23A"`, `stroke-width="2.5"`, and `pointer-events: none`.
  * `R2.6`: Chevron rotates 180 degrees when dossier accordion is expanded (`.ledger-item.expanded .accordion-toggle-icon` with `transform: rotate(180deg)`).
- **R3: Persistent Multi-User Team Notes Engine (6 tests)**:
  * `R3.1`: Table `lead_notes` verified in MySQL with columns: `id`, `lead_id`, `user_id`, `author_name`, `author_role`, `note`, `created_at`.
  * `R3.2`: `POST /api/leads/:id/notes` inserts note and returns JSON `{ success: true, note: { ... } }`.
  * `R3.3`: `GET /api/leads/:id/notes` returns notes in reverse chronological order (`ORDER BY created_at DESC`).
  * `R3.4`: Note creation inserts audit record in `activity_log` with `action = 'note_added'`.
  * `R3.5`: Frontend dashboard renders notes input `#note-input-<%= lead.id %>`, `+ Post Note` button, and stream container `#notes-list-<%= lead.id %>`.
  * `R3.6`: Client-side JS formats monogram avatar, name, role badge pill, and escapes HTML characters.
- **R4: 8-Layer Cyber Security Suite (8 tests)**:
  * `R4.1`: Layer 1 (Helmet Shield) sets `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`.
  * `R4.2`: Layer 2 (CORS Hardening) allows canonical domain `https://tiffanywebbimpact.com`.
  * `R4.3`: Layer 3 (Rate Limiting) middleware mounted on `POST /login` with 15-minute window.
  * `R4.4`: Layer 4 (Recursive XSS Sanitization) strips `<script>` tags from form submissions before database insertion.
  * `R4.5`: Layer 5 (SQL Injection Immunity) enforces parameterized queries with `?` across `server.js`.
  * `R4.6`: Layer 6 (Secure Cookie Governance) issues `auth_token` with `httpOnly: true`, `sameSite: strict`, and 7-day max-age.
  * `R4.7`: Layer 7 (Root Route Authentication) redirects unauthenticated requests to `/login` (302).
  * `R4.8`: Layer 8 (Multer File Extension Filter) restricts file uploads to whitelisted image extensions (`.jpg, .jpeg, .png, .webp, .gif`).

### Tier 2: Boundary & Corner Cases (22 Tests)
- **R1 Rebrand Invariants (5 tests)**:
  * `T2.R1.1`: Dashboard renders valid Impact OS header and navbar with empty leads array.
  * `T2.R1.2`: Auth views render Impact OS titles with undefined error/success query params.
  * `T2.R1.3`: CMS collection edit view renders Impact OS title with new item (`item = null`).
  * `T2.R1.4`: CMS page view renders dynamic page name with Impact OS branding suffix.
  * `T2.R1.5`: Zero occurrences of "Tiffany Webb CRM" in rendered HTML templates.
- **R2 Ledger Layout & Chevron Bounds (5 tests)**:
  * `T2.R2.1`: Lead with missing optional fields renders in 6-track ledger row without layout corruption.
  * `T2.R2.2`: Stage select width boundary matches exactly 185px constraint.
  * `T2.R2.3`: Actions column width boundary is fixed 125px min-width with 32px action buttons.
  * `T2.R2.4`: Accordion toggle icon child SVG has `pointer-events: none` to prevent click hijacking.
  * `T2.R2.5`: Zero leads state renders complete ledger table header with 6 tracks.
- **R3 Team Notes Engine Edge Cases (5 tests)**:
  * `T2.R3.1`: Rejects empty string note with HTTP 400 Bad Request (`Note content cannot be empty`).
  * `T2.R3.2`: Rejects whitespace-only note with HTTP 400 Bad Request.
  * `T2.R3.3`: Stores and retrieves special characters and international Unicode without corruption.
  * `T2.R3.4`: Max-length text note (3000 chars) is saved intact and activity log summary is truncated to <= 60 chars.
  * `T2.R3.5`: Note submission for non-existent lead ID returns error cleanly without server crash.
- **R4 Security Attacks & Thresholds (7 tests)**:
  * `T2.R4.1`: Rate limit boundary: 5 failed attempts allowed, 6th triggers HTTP 429 Too Many Requests.
  * `T2.R4.2`: Recursive XSS sanitization strips nested evasion tags `<scr<script>ipt>alert(1)</script>`.
  * `T2.R4.3`: Recursive XSS strips `javascript:` pseudo-protocol and `onerror` event attributes.
  * `T2.R4.4`: CORS boundary rejects untrusted domain without exposing `Access-Control-Allow-Origin`.
  * `T2.R4.5`: SQL injection payloads are safely parameterized without syntax error or table leak.
  * `T2.R4.6`: Tampered JWT cookie signature is rejected and redirected to `/login`.

### Tier 3: Cross-Feature Interactions (6 Tests)
- `T3.1`: Authenticated session cookie links author identity and generates audit log entry in `activity_log`.
- `T3.2`: Unauthenticated note creation falls back safely to default author identity.
- `T3.3`: Dynamic note posting and reverse chronological retrieval (`ORDER BY created_at DESC`).
- `T3.4`: `ON DELETE CASCADE` cleans up `lead_notes` automatically when a parent lead is deleted.
- `T3.5`: Dossier accordion DOM IDs match across lead card, chevron button, input, and notes list.
- `T3.6`: Authenticated dashboard `GET /dashboard` returns 200 with Pipeline Ledger layout.

### Tier 4: Real-World Scenarios (9 Tests)
Complete end-to-end 9-step executive operational lifecycle:
1. Unauthenticated user accesses root `/` -> redirected (302) to `/login`.
2. Executive logs in with credentials -> receives HTTP 302 with secure `auth_token` cookie.
3. Executive visits `/dashboard` -> renders Pipeline Ledger layout, eyebrow, and branded logo.
4. Executive inspects lead row -> verifies dossier drawer elements and visible gold chevron.
5. Executive posts private team note into dossier notes engine via AJAX.
6. MySQL database confirms persistence in `lead_notes` and `activity_log`.
7. `GET /api/leads/:id/notes` verifies the new note appears at top of feed.
8. Executive logs out -> `auth_token` cookie is invalidated.
9. Subsequent unauthenticated request to `/dashboard` is blocked with 302 to `/login`.

---

## 5. How to Run the Tests

### Single Command Runner
From the CRM directory:
```bash
cd "Landing Page Work/tiffany-webb-crm"
node test/run_e2e_suite.cjs
```

Or from workspace root:
```bash
node "Landing Page Work/tiffany-webb-crm/test/run_e2e_suite.cjs"
```

### Individual Tier Execution
```bash
# Tier 1 (Feature Coverage)
node "Landing Page Work/tiffany-webb-crm/test/tier1_feature_coverage.test.cjs"

# Tier 2 (Boundary & Corner Cases)
node "Landing Page Work/tiffany-webb-crm/test/tier2_boundary_corner_cases.test.cjs"

# Tier 3 (Cross-Feature Interactions)
node "Landing Page Work/tiffany-webb-crm/test/tier3_cross_feature_interactions.test.cjs"

# Tier 4 (Real-World Scenarios)
node "Landing Page Work/tiffany-webb-crm/test/tier4_real_world_scenarios.test.cjs"
```

---

## 6. Verification Status & Test Readiness

All 64 tests across all 4 tiers are fully implemented, verified against the running Express server and live MySQL database, and ready for continuous regression and deployment auditing.
