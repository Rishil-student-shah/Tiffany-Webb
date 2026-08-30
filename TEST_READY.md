# TEST READY — Opaque-Box E2E Test Suite Publication

**Project:** Tiffany Webb Web Platform & CRM Content Expansion  
**Artifact:** Master Opaque-Box E2E Testing Suite (Tiers 1–4)  
**Publication Date:** 2026-08-30  
**Test Suite Status:** READY & PUBLISHED  
**Test Runner Entry Point:** `node tests/run_e2e_tests.js`  

---

## 1. Test Suite Deliverables Summary

| Artifact / File Path | Description | Test Count | Status |
|---|---|---|---|
| `tests/run_e2e_tests.js` | Master single-command E2E test runner | Runner Entry | READY |
| `tests/helpers/test_framework.js` | Lightweight BDD test suite & matcher engine | Framework | READY |
| `tests/helpers/db_helper.js` | MySQL pool manager & fixture utilities | Database Harness | READY |
| `tests/helpers/dom_parser.js` | HTML/DOM structural and attribute parser | DOM Parser | READY |
| `tests/helpers/app_harness.js` | Express & Astro SSR HTTP dispatcher | Server Harness | READY |
| `tests/tier1_feature_coverage.test.js` | Tier 1: All 7 pages (>=5 per feature) + APIs + CMS | 45 Tests | READY |
| `tests/tier2_boundary_corner_cases.test.js` | Tier 2: Empty states, 400/422/404 handling, extreme queries | 20 Tests | READY |
| `tests/tier3_cross_feature_integrations.test.js` | Tier 3: Query prefill, 301 redirects, deep anchors, CMS sync | 12 Tests | READY |
| `tests/tier4_real_world_lifecycle.test.js` | Tier 4: Complete lead inquiry lifecycle -> CRM dashboard | 7 Tests | READY |
| `TEST_INFRA.md` | Complete E2E testing infrastructure documentation | Documentation | READY |
| `TEST_READY.md` | Test suite readiness verification report | Publication | READY |

**Total Automated Test Assertions:** **84 Tests** across **4 Tiers**

---

## 2. Four-Tier Coverage Breakdown

### Tier 1: Feature Coverage (45 Tests)
- **Feature 1: `/about` Page (5 tests)**: Hero copy, 6 vignettes, BBA/MHP credentials & 4 domains, `/services#gear` signpost, `#specialism` anchor, 5 Core Values, GambleFreeGear, closing CTA.
- **Feature 2: `/services` Page (5 tests)**: Hero, 4 Capabilities with deep-link IDs, GEAR Method, speaking teaser, 6 engagement formats, 4 working steps, closing CTA.
- **Feature 3: `/services/speaking-topics` Page (5 tests)**: Hero, filter bar pills, 20 topic cards, 4 track colors, 20 prefill buttons targeting `/work-with-tiffany?topic=...`, CTA.
- **Feature 4: `/impact` Page (5 tests)**: Hero, aggregate stats band, upcoming empty banner, past empty notice, 3 outcome stories slots, practice link -> `/about#specialism`, closing CTA.
- **Feature 5: `/media` Page (5 tests)**: Hero, 3 download cards, 3 bios in 3 lengths (third-person), stage intro script, 5 talking points, Media CTA -> `/work-with-tiffany?type=Media`.
- **Feature 6: `/work-with-tiffany` Page (5 tests)**: Hero, 9-field AJAX lead form with validation attributes, 4 next steps, alternative contact info.
- **Feature 7: `/insights` Page & Article Template (5 tests)**: Hero, 3 seed articles with metadata, max-width 68ch serif template container, top-nav exclusion logic (<6 articles).
- **Feature 8: REST APIs (5 tests)**: `GET /api/content/:slug`, `POST /api/leads`, `POST /api/leads/batch`, `POST /api/pages/:id/toggle`, `POST /api/leads/bulk-delete`.
- **Feature 9: CRM CMS Admin Editing (5 tests)**: Pages listing, page section editor, collection items CRUD (add/edit/delete), lead status updates with audit logging, dashboard charts.

### Tier 2: Boundary & Corner Cases (20 Tests)
- **Empty Collections (6 tests)**: `about_affiliations` hidden, `services_faqs` hidden, `booking_faqs` hidden, `impact_upcoming` displays warm banner + CTA, `impact_past` displays archive notice, `impact_testimonials` hidden.
- **Lead Form Boundaries (6 tests)**: Missing name -> 400, missing org -> 400, malformed emails -> 422, missing event_type -> 400, null optional fields -> persisted cleanly, unparseable dates -> sanitized to null.
- **Non-Existent Routes (3 tests)**: Unknown slug -> 404, unknown CMS slug -> 404, inactive page toggle -> 404.
- **Extreme Queries (5 tests)**: HTML entity escaping for XSS prevention in `?topic=`, empty query string, 1000-character long query, special characters (`&`, `#`, `+`, `%`), unknown event type.

### Tier 3: Cross-Feature Combinations & Integrations (12 Tests)
- **Topic Prefill Flow (3 tests)**: Topic card prefill URL generation, landing on `/work-with-tiffany?topic=...` pre-populates textarea, Media CTA pre-selects `"Media / Press Inquiry"`.
- **301 Permanent Redirects (3 tests)**: `/speaking` -> 301 -> `/services`, `/book` -> 301 -> `/work-with-tiffany`, navigation links use canonical URLs.
- **Deep Link Anchors (3 tests)**: `/about` -> `/services#gear`, `/services` anchor IDs exist, `/impact` -> `/about#specialism`.
- **Dynamic CMS Synchronization (3 tests)**: Key-value updates reflect on Astro page, collection item additions reflect on rendered page, top-nav dynamically reveals `/insights` when article count reaches >=6.

### Tier 4: Real-World Application Lifecycle (7 Tests)
- **End-to-End User Inquiry & Admin Workflow (7 tests)**:
  1. User arrives on `/services/speaking-topics` and browses topics.
  2. User selects Topic #2 ("Don't Bet on Your Future (Youth Focus)") and clicks prefill button.
  3. User arrives on prefilled booking form at `/work-with-tiffany?topic=...`.
  4. User fills out 9 fields and submits via AJAX `POST /api/leads`.
  5. API validates payload, writes lead to MySQL `leads` table, and logs initial `activity_log` entry.
  6. Admin views newly submitted lead on CRM Leads Dashboard (`/dashboard`).
  7. Admin opens Lead Detail view (`/lead/:id`) and qualifies lead (`status = 'qualified'`), verifying audit log.

---

## 3. How to Execute

```bash
# From workspace root
node tests/run_e2e_tests.js
```

**Result:** All 84 test assertions run self-contained against the local MySQL database and Express/Astro application harness, validating complete adherence to `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `spec_inventory_report.md`.
