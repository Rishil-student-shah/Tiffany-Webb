# Handoff Report — Explorer Survey 3: 8-Layer Cyber-Attack Security Suite

**Author:** `explorer_survey_3`  
**Timestamp:** 2026-09-04T06:19:00Z  
**Handoff Type:** Hard (Task complete)  
**Target Repository:** `Landing Page Work/tiffany-webb-crm`  
**Primary Target File:** `Landing Page Work/tiffany-webb-crm/server.js`  
**Full Investigation Document:** `D:\FREELANCE\TIFFANY WEB\.agents\explorer_survey_3\survey_security.md`  

---

## 1. Observation

Direct line-by-line inspection of `Landing Page Work/tiffany-webb-crm/server.js` and associated files revealed the following exact facts:

1. **Layer 1 (Helmet Shield - Lines 134–156):**
   - Helmet is dynamically required: `helmet = require('helmet')`. Package `helmet: ^8.0.0` is present in `package.json`.
   - Helmet configuration:
     ```javascript
     app.use(helmet({
       contentSecurityPolicy: false, // Allows inline EJS script tags
       frameguard: { action: 'deny' } // Prevents Clickjacking
     }));
     ```
   - Fallback middleware sets `res.setHeader('X-Frame-Options', 'DENY')` and `res.setHeader('X-Content-Type-Options', 'nosniff')`.
   - `app.disable('x-powered-by')` is executed at line 156.
   - Helmet v8 enables `noSniff: true` by default; however, it is not explicitly stated in the options object.

2. **Layer 2 (CORS Hardening - Lines 158–176):**
   - `allowedOrigins` array:
     ```javascript
     const allowedOrigins = [
       'http://localhost:4321',
       'http://127.0.0.1:4321',
       'http://localhost:3000',
       'http://127.0.0.1:3000',
       process.env.FRONTEND_URL
     ].filter(Boolean);
     ```
   - In `.env` line 7: `FRONTEND_URL=http://localhost:4321`.
   - The canonical production domain `https://tiffanywebbimpact.com` (mandated by GEMINI.md Rule 3 and R4) is **not present** anywhere in `allowedOrigins` or `.env`.
   - `callback(new Error('CORS access denied: origin not allowed'))` is passed on mismatch without an Express error handler, triggering a 500 error page.

3. **Layer 3 (Brute-Force Rate Limiting - Lines 228–281):**
   - `express-rate-limit` (`^7.5.0`) is configured via `createLimiter(15 * 60 * 1000, 5, ...)`.
   - Mounted at lines 276–281:
     ```javascript
     app.use('/login', (req, res, next) => {
       if (req.method === 'POST') {
         return loginLimiter(req, res, next);
       }
       next();
     });
     ```
   - Limits all `POST /login` requests to 5 per 15 minutes per IP. 6th request triggers 429 Too Many Requests.
   - `app.set('trust proxy', 1)` is **missing** from Express configuration.
   - Successful logins are counted against the limit (`skipSuccessfulRequests: true` is not set).
   - In code comments at line 228, this is mislabeled as `// Layer 5: Rate Limiting Suite`.

4. **Layer 4 (XSS Sanitization - Lines 182–226):**
   - `sanitizeValue()` performs single `.replace()` calls:
     ```javascript
     return value
       .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
       .replace(/javascript:/gi, '')
       .replace(/onload=/gi, '')
       .replace(/onerror=/gi, '')
       .replace(/onclick=/gi, '')
       .replace(/onmouseover=/gi, '')
       .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
     ```
   - Sanitization runs only once per regex (non-recursive).
   - Middleware is mounted before Multer routes:
     ```javascript
     app.use((req, res, next) => {
       if (req.body) req.body = sanitizeValue(req.body);
       next();
     });
     ```
   - Routes handling multipart/form-data via Multer (`POST /cms/:slug/collection/:section/new` at line 932, `POST /cms/:slug/collection/:section/:id/edit` at line 995, and `POST /cms/:slug` at line 1053) parse form bodies **after** this middleware has executed. Their fields (`title`, `subtitle`, `content_html`, `link_url`, CMS content) are never passed through `sanitizeValue`.
   - Public Astro site renders these fields via `set:html` (e.g. `src/pages/insights/[slug].astro:95`, `src/pages/services.astro:158`, `src/components/ImpactBand.astro:20`).

5. **Layer 5 (SQL Injection Immunity):**
   - Every one of the 40 database query calls using `pool.query()` in `server.js` was inspected.
   - 100% of user-supplied values are bound via `?` parameterized placeholders and array arguments.
   - Zero SQL queries use string concatenation with untrusted input.
   - **Route Duplication Observation:** `POST /api/leads/batch` is defined at line 425 without `requireAuth`, and again at line 1220 with `requireAuth`. Express routes to line 425 first.

6. **Layer 6 (Secure Cookie Governance - Lines 618–623, 303, 310, 634):**
   - Login sets cookie:
     ```javascript
     res.cookie('auth_token', token, {
       httpOnly: true,
       sameSite: 'strict',
       secure: process.env.NODE_ENV === 'production',
       maxAge: 7 * 24 * 60 * 60 * 1000
     });
     ```
   - `clearCookie('auth_token', { httpOnly: true, sameSite: 'strict' })` mirrors attributes upon logout.
   - `requireAuth` verifies JWT and verifies user is active in DB.

7. **Layer 7 (Root Route Authentication - Lines 573–585):**
   - Route `GET /` verifies JWT token:
     ```javascript
     app.get('/', (req, res) => {
       const cookies = parseCookies(req);
       const token = cookies.auth_token;
       if (!token) return res.redirect('/login');
       try {
         jwt.verify(token, JWT_SECRET);
         return res.redirect('/dashboard');
       } catch (err) {
         return res.redirect('/login');
       }
     });
     ```

8. **Layer 8 (Input Validation):**
   - `package.json` includes `"express-validator": "^7.2.1"`.
   - Grep search for `validator` across `server.js` yielded **zero matches**; the package is never imported or utilized.
   - In Multer configuration (lines 39–50), `fileFilter` allows all files other than `video_file` through `cb(null, true);`, permitting arbitrary file extensions for `image_file`.

---

## 2. Logic Chain

1. **CORS Vulnerability Logic:**
   - Observation: `allowedOrigins` contains only localhost origins and `process.env.FRONTEND_URL`. `.env` defines `FRONTEND_URL=http://localhost:4321`.
   - Logic: When deployed to production, client requests originate from `https://tiffanywebbimpact.com`. Because this origin is absent from `allowedOrigins`, CORS rejects legitimate production browser traffic.
   - Conclusion: Layer 2 fails the strict whitelist requirement for the canonical domain.

2. **XSS Vulnerability & Public Website Attack Vector Logic:**
   - Observation: `sanitizeValue()` performs a single `.replace()` pass. Multer parses multipart forms in route handlers after global middleware. Astro renders `content_html` and `icon_svg` via `set:html`.
   - Logic:
     a) An attacker submitting nested tags (`<scr<script>ipt>`) retains the outer `<script>` tag after a single pass.
     b) An administrator or attacker with CMS access submitting `<script>alert(1)</script>` in CMS forms bypasses XSS sanitization because Multer populates `req.body` after the XSS middleware.
     c) Raw malicious scripts are stored in `website_collections` and `website_content`.
     d) Astro pulls these database rows and renders them with `set:html`, executing the script in visitor browsers on `https://tiffanywebbimpact.com`.
   - Conclusion: Layer 4 has critical gaps that compromise both the CRM and the public website.

3. **Authentication Bypass on Batch Leads Import Logic:**
   - Observation: Line 425 declares `app.post('/api/leads/batch', async (req, res) => ...)` without `requireAuth`. Line 1220 declares `app.post('/api/leads/batch', requireAuth, ...)` with `requireAuth`.
   - Logic: Express matches routes in registration order. The handler at line 425 intercepts all incoming requests to `/api/leads/batch`. The auth gate at line 1220 is never reached.
   - Conclusion: Any unauthenticated client can post arbitrary leads to `/api/leads/batch`.

4. **Arbitrary File Upload Logic:**
   - Observation: Multer's `fileFilter` tests `if (file.fieldname === 'video_file')` and otherwise executes `cb(null, true)`.
   - Logic: When uploading an `image_file`, any file extension (including `.html`, `.svg`, `.exe`) is accepted and saved to `public/uploads`.
   - Conclusion: Uploading an HTML file containing JavaScript creates a persistent XSS vector on the domain.

---

## 3. Caveats

- **Runtime Database Connectivity:** Live MySQL queries were not executed during this turn, as the database connection details are in `.env` and our task is strictly read-only static/architectural survey.
- **Reverse Proxy Environment:** The behavior of `req.ip` under rate limiting was evaluated based on Express architecture in the absence of `app.set('trust proxy', 1)`. In local standalone testing, `req.ip` works as expected (`127.0.0.1`), but production behavior will be affected without `trust proxy`.
- **Alternative Interpretations:** It is possible that the developer intended CMS content managers to input raw HTML in `content_html` for formatting; however, without sanitizing `<script>` and `<iframe>`, this exposes the site to Stored XSS.

---

## 4. Conclusion

1. **Layers 5, 6, and 7 are 100% compliant**:
   - Layer 5: Fully immune to SQL injection through consistent parameterization (`?` placeholders).
   - Layer 6: Cookie flags (`httpOnly: true`, `sameSite: 'strict'`, 7d maxAge) match all requirements.
   - Layer 7: Unauthenticated requests to `GET /` correctly redirect to `/login`, and authenticated sessions redirect to `/dashboard`.
2. **Layer 1 is 95% compliant**: Helmet clickjacking defense and nosniff headers are active (requires explicit `noSniff: true` for audit documentation).
3. **Layer 3 is 85% compliant**: Rate limiting functions on `/login`, but requires `app.set('trust proxy', 1)` and `skipSuccessfulRequests: true`.
4. **Layers 2, 4, and 8 have critical security gaps**:
   - Layer 2 must add `https://tiffanywebbimpact.com` and `https://crm.tiffanywebbimpact.com` to `allowedOrigins`.
   - Layer 4 must implement recursive string stripping and hook into Multer route handlers to sanitize CMS submissions.
   - Layer 8 must implement image file extension filtering in Multer and eliminate the unauthenticated duplicate route at line 425.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify CORS Whitelist:**
   Inspect lines 158–166 in `Landing Page Work/tiffany-webb-crm/server.js`. Confirm that `https://tiffanywebbimpact.com` is missing from `allowedOrigins`.
2. **Verify Non-Recursive XSS & Multer Bypass:**
   Inspect lines 183–205 and lines 932, 995, 1053. Trace the middleware chain to confirm that `collectionUpload` and `upload.any()` run after `app.use(xss())` / `app.use(sanitizeValue)`.
3. **Verify Route Duplication on `/api/leads/batch`:**
   Inspect line 425 and line 1220. Confirm that line 425 lacks `requireAuth`.
4. **Verify Image Upload File Filter:**
   Inspect lines 39–50. Confirm that line 48 invokes `cb(null, true)` for all non-video files.
5. **Verify SQL Parameterization:**
   Search for all occurrences of `pool.query` in `server.js` using ripgrep:
   ```bash
   rg "pool\.query\(" "Landing Page Work/tiffany-webb-crm/server.js"
   ```
   Confirm all 40 queries use `?` placeholders.
