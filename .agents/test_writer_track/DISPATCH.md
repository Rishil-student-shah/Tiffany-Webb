# Dispatch for E2E Test Suite Track

## 2026-09-04T06:25:00Z
You are test_writer_track, an E2E Test Suite Developer (`teamwork_preview_test_writer`).
Working directory: D:\FREELANCE\TIFFANY WEB\.agents\test_writer_track
Parent conversation ID: 47012479-2d4c-4107-bf59-7c0841797227

MANDATORY INPUTS:
1. Authoritative request: `D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md` (specifically section `## 2026-09-03T20:59:19Z`, Requirements R1-R4, Acceptance Criteria).
2. Project specification: `D:\FREELANCE\TIFFANY WEB\.agents\PROJECT.md`.
3. Design system rules: `D:\FREELANCE\TIFFANY WEB\GEMINI.md` and `D:\FREELANCE\TIFFANY WEB\.agents\rules\design_system_rules.md`.
4. Explorer Survey findings:
   - `D:\FREELANCE\TIFFANY WEB\.agents\explorer_survey_1\survey_views_ui.md`
   - `D:\FREELANCE\TIFFANY WEB\.agents\explorer_survey_2\survey_notes_db.md`
   - `D:\FREELANCE\TIFFANY WEB\.agents\explorer_survey_3\survey_security.md`

OBJECTIVES:
Build the complete requirement-driven E2E test suite covering R1, R2, R3, and R4 across 4 tiers:
- **Tier 1: Feature Coverage (>=5 per feature area)**:
  - R1: Rebrand verification (views titles, navbar logo, sub-module links, gold pulsating dot eyebrow, half-text gradient title, startup banner, email sender, zero "Tiffany Webb CRM").
  - R2: Ledger layout verification (grid template columns `2.8fr 2.8fr 1.8fr 1.1fr 185px 125px`, stage column 185px, actions column 125px, 32x32px buttons, visible gold chevron `<svg stroke="#D9A23A">`, 180° rotation).
  - R3: Notes engine verification (table `lead_notes`, POST `/api/leads/:id/notes`, GET `/api/leads/:id/notes`, audit log in `activity_log`, dossier UI rendering).
  - R4: Security suite verification (Helmet headers, CORS whitelist, login rate limiting, recursive XSS sanitization, SQL parameterization, secure cookies, root route auth redirect).
- **Tier 2: Boundary & Corner Cases (>=5 per feature area)**:
  - Empty notes, whitespace notes, special characters, max-length notes.
  - Rate limit boundary: 5 attempts allowed, 6th attempt triggers 429.
  - Nested XSS payloads: `<scr<script>ipt>alert(1)</script>`, `javascript:alert(1)`, `<iframe src="...">`.
  - CORS boundary: localhost and `https://tiffanywebbimpact.com` allowed, rogue domains blocked.
  - SQL injection payloads (`' OR 1=1 --`, `UNION SELECT`) cleanly parameterized.
- **Tier 3: Cross-Feature Interactions**:
  - Authenticated session cookie + note creation + audit log generation.
  - Unauthenticated request to `/api/leads/:id/notes` vs authenticated.
  - Post note + retrieve notes ordered by created_at DESC.
- **Tier 4: Real-World Scenarios**:
  - Full end-to-end user workflow: unauthenticated root redirect to `/login`, executive login with cookie issuance, navigate to `/dashboard` (Pipeline Ledger), expand dossier accordion (verify gold chevron rotates), post an internal team note, verify instant appearance with monogram avatar and role badge, logout and verify cookie invalidation.

DELIVERABLES:
1. Create `D:\FREELANCE\TIFFANY WEB\TEST_INFRA.md` following the template.
2. Implement executable test runner script(s) in `Landing Page Work/tiffany-webb-crm/test/`.
3. Execute the tests and verify pass/fail semantics.
4. When all tests pass, create `D:\FREELANCE\TIFFANY WEB\TEST_READY.md` at project root with coverage summary.
5. Write handoff report to `D:\FREELANCE\TIFFANY WEB\.agents\test_writer_track\handoff.md`.
6. Notify parent via send_message.
