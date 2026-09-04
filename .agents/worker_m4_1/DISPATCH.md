# Dispatch for Worker M4 (8-Layer Cyber-Attack Security Suite Hardening)

## 2026-09-04T06:25:00Z
You are worker_m4_1, an implementation worker.
Working directory: D:\FREELANCE\TIFFANY WEB\.agents\worker_m4_1
Parent conversation ID: 47012479-2d4c-4107-bf59-7c0841797227

MANDATORY INPUTS:
1. Authoritative request: `D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md` (specifically section `## 2026-09-03T20:59:19Z`, R4, and Acceptance Criteria).
2. Project specification: `D:\FREELANCE\TIFFANY WEB\.agents\PROJECT.md`.
3. Design system rules: `D:\FREELANCE\TIFFANY WEB\GEMINI.md` and `D:\FREELANCE\TIFFANY WEB\.agents\rules\design_system_rules.md`.
4. Detailed Explorer 3 Survey findings and remediation steps in:
   - `D:\FREELANCE\TIFFANY WEB\.agents\explorer_survey_3\survey_security.md`
   - `D:\FREELANCE\TIFFANY WEB\.agents\explorer_survey_3\handoff.md`

WRITE OWNERSHIP:
You exclusively own:
`Landing Page Work/tiffany-webb-crm/server.js`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASKS:
Remediate the security gaps identified by Explorer 3 in `Landing Page Work/tiffany-webb-crm/server.js`:
1. **Layer 1 (Helmet Shield)**:
   - Explicitly configure Helmet with:
     ```javascript
     helmet({
       contentSecurityPolicy: false,
       frameguard: { action: 'deny' },
       noSniff: true
     })
     ```
   - Ensure fallback headers `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff` remain in place.
2. **Layer 2 (CORS Hardening)**:
   - Add canonical production domain `https://tiffanywebbimpact.com` and subdomain `https://crm.tiffanywebbimpact.com` to `allowedOrigins`:
     ```javascript
     const allowedOrigins = [
       'http://localhost:4321',
       'http://127.0.0.1:4321',
       'http://localhost:3000',
       'http://127.0.0.1:3000',
       'https://tiffanywebbimpact.com',
       'https://crm.tiffanywebbimpact.com',
       process.env.FRONTEND_URL
     ].filter(Boolean);
     ```
3. **Layer 3 (Brute-Force Rate Limiting)**:
   - Add `app.set('trust proxy', 1);` before rate limiters.
   - Configure `loginLimiter` with `skipSuccessfulRequests: true` if appropriate, while strictly enforcing 5 failed attempts per 15 mins per IP.
4. **Layer 4 (Recursive XSS Sanitization)**:
   - Implement true recursive sanitization in `sanitizeValue()`: loop until string is unchanged so nested payloads like `<scr<script>ipt>` are fully stripped.
   - Strip `<script>`, `javascript:`, `onerror`, `onload`, `onclick`, `onmouseover`, and `<iframe>`.
   - Apply sanitization not only to `req.body` in global middleware, but also sanitize fields in multipart/form-data routes parsed by Multer (e.g. `POST /cms/:slug/collection/:section/new`, `POST /cms/:slug/collection/:section/:id/edit`, `POST /cms/:slug`).
5. **Layer 5 (SQL Injection Immunity & Route Hygiene)**:
   - Fix route shadowing on `POST /api/leads/batch`: line 425 lacks `requireAuth`, while line 1220 has `requireAuth`. Ensure `requireAuth` is strictly enforced on `/api/leads/batch` and eliminate the unauthenticated duplicate.
   - Confirm 100% parameterization with `?` placeholders is preserved across all routes.
6. **Layer 6 (Secure Cookie Governance)**:
   - Confirm JWT `auth_token` cookie retains `httpOnly: true`, `sameSite: 'strict'`, `maxAge: 7 * 24 * 60 * 60 * 1000`, and `secure: process.env.NODE_ENV === 'production'`.
7. **Layer 7 (Root Route Authentication)**:
   - Confirm `GET /` redirects unauthenticated visitors to `/login` and authenticated sessions to `/dashboard`.
8. **Layer 8 (Input & File Validation)**:
   - Update Multer file filter in `server.js` (around lines 39–50): whitelist image file extensions/MIME types (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) and reject executable/script/HTML uploads.

VERIFICATION:
- Test running node server syntax check: `node --check server.js`.
- Document all changes and tests in `D:\FREELANCE\TIFFANY WEB\.agents\worker_m4_1\handoff.md`.
- When done, message parent (conversation ID: 47012479-2d4c-4107-bf59-7c0841797227).
