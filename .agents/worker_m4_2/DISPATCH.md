# Dispatch for Worker M4_2 (Security Remediation Implementation)

## 2026-09-04T06:55:00Z
You are worker_m4_2, an implementation worker (`teamwork_preview_worker`).
Working directory: D:\FREELANCE\TIFFANY WEB\.agents\worker_m4_2
Parent conversation ID: 47012479-2d4c-4107-bf59-7c0841797227

MANDATORY INPUTS:
1. Authoritative request: `D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md` (specifically section `## 2026-09-03T20:59:19Z`, R3, R4, Acceptance Criteria).
2. Project specification: `D:\FREELANCE\TIFFANY WEB\.agents\PROJECT.md`.
3. Forensic Auditor Evidence: `D:\FREELANCE\TIFFANY WEB\.agents\auditor_m4_1\handoff.md`.
4. Explorer Remediation Proposals:
   - `D:\FREELANCE\TIFFANY WEB\.agents\explorer_m4_2_1\analysis.md` & `handoff.md`
   - `D:\FREELANCE\TIFFANY WEB\.agents\explorer_m4_2_2\analysis.md` & `handoff.md`
   - `D:\FREELANCE\TIFFANY WEB\.agents\explorer_m4_2_3\analysis.md` & `handoff.md`

WRITE OWNERSHIP:
You exclusively own:
- `Landing Page Work/tiffany-webb-crm/server.js`
- `Landing Page Work/tiffany-webb-crm/views/dashboard.ejs`
- `Landing Page Work/tiffany-webb-crm/views/new-lead.ejs`
- `Landing Page Work/tiffany-webb-crm/test/tier3_cross_feature_interactions.test.cjs`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASKS:
1. **Fix Rate Limiting on `POST /login` in `server.js`**:
   - In `POST /login`, return explicit HTTP status codes:
     - Missing email/password: `return res.status(400).render('login', { error: 'Email and password are required', success: null });`
     - User not found: `return res.status(401).render('login', { error: 'Invalid email or password', success: null });`
     - Deactivated user (`user.is_active === 0`): `return res.status(403).render('login', { error: 'Your account has been deactivated. Please contact an administrator.', success: null });`
     - Password mismatch: `return res.status(401).render('login', { error: 'Invalid email or password', success: null });`
     - Server error: `return res.status(500).render('login', { error: 'Server error during authentication', success: null });`
   - This ensures `res.statusCode >= 400` on failures, so the native rate limiter increments `data.count` on `'finish'`. The 6th failed request strictly returns HTTP 429 Too Many Requests. Successful logins (302 redirect) remain exempt.

2. **Fix Multer `fileFilter` and `saveBase64Image` in `server.js`**:
   - For `video_file`: Remove the `application/octet-stream` bypass. Require that `ext` is in `['.mp4', '.webm', '.mov']` AND `file.mimetype` is in `['video/mp4', 'video/webm', 'video/quicktime', 'video/x-quicktime', 'video/mov']`. Reject all other files with `new Error('Only .mp4, .webm, and .mov video files are allowed')`.
   - For `image_file`: Keep strict extension check `['.jpg', '.jpeg', '.png', '.webp', '.gif']` and image MIME check.
   - In `saveBase64Image`: Whitelist allowed raster image MIME subtypes (`jpeg`, `jpg`, `png`, `webp`, `gif`). If invalid, return `null`.

3. **Enforce `requireAuth` on `POST /api/leads/:id/notes` in `server.js`**:
   - Change `app.post('/api/leads/:id/notes', async (req, res) => ...)` to `app.post('/api/leads/:id/notes', requireAuth, async (req, res) => ...)`.
   - Remove manual fallback to `'Tiffany Webb (Admin)'`. Resolve author directly from `req.user` (`req.user.name`, `req.user.role || 'staff'`, `req.user.id`).
   - In `views/dashboard.ejs`, update `loadLeadNotes` and `postLeadNote` to check if response is redirected or 401, redirecting to `/login?error=Session+expired`.
   - In `test/tier3_cross_feature_interactions.test.cjs`, update test `T3.2` to verify that unauthenticated requests to `/api/leads/:id/notes` are redirected to `/login` (302).

4. **Fix Batch Source Fallback on `POST /api/leads/batch` in `server.js`**:
   - In `server.js` around line 1254: validate `lead.source` against allowed MySQL ENUM `['website_form', 'whatsapp', 'instagram', 'email', 'referral', 'manual']`. Default to `'manual'` if absent or invalid.
   - In `views/new-lead.ejs`, ensure parsed batch rows default `source: 'manual'`.

VERIFICATION:
- Verify `node --check server.js` returns exit code 0.
- Empirically verify rate limiting by sending 6 rapid failed logins: verify attempt 6 returns HTTP 429.
- Run the test suite: `node test/run_e2e_suite.cjs`.
- Document all changes and tests in `D:\FREELANCE\TIFFANY WEB\.agents\worker_m4_2\handoff.md`.
- Notify parent via send_message when complete.
