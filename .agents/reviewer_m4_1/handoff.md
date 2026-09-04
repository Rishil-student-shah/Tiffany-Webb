# Handoff Report — reviewer_m4_1 (Milestone M4: 8-Layer Cyber-Attack Security Suite Review)

## 1. Review Summary

**Verdict**: **REQUEST_CHANGES**

The implementation in `Landing Page Work/tiffany-webb-crm/server.js` successfully hardens Layer 1 (Helmet), Layer 2 (CORS Canonical Domains), Layer 4 (Recursive XSS with multipart Multer support), Layer 5 (SQL Injection parameterization and removal of shadowed unauthenticated `/api/leads/batch`), Layer 6 (Secure Cookie governance), and Layer 7 (Root Route authentication redirect).

However, **a Critical security defect exists in Layer 3 (Rate Limiting)**:
The `loginLimiter` was configured with `skipSuccessfulRequests: true`, but the `POST /login` route handler in `server.js` renders failed login attempts using `res.render('login', { error: ... })` which sends HTTP status `200 OK`. Consequently, both `express-rate-limit` and the native sliding-window fallback classify failed login attempts as "successful" (HTTP status < 400) and **never increment the rate limiter counter**. An attacker can execute unlimited brute-force attacks against `/login` without ever being throttled, and the mandatory acceptance test ("Sending 6 rapid POST requests to /login with wrong credentials results in a rate-limit response on the 6th attempt") fails.

---

## 2. Findings

### [Critical] Finding 1: Rate Limiter Bypassed on Failed Logins (`skipSuccessfulRequests: true` vs HTTP 200)

- **What**: `loginLimiter` fails to throttle wrong credentials and brute-force password attacks.
- **Where**: `Landing Page Work/tiffany-webb-crm/server.js`:
  - Lines 320–325:
    ```javascript
    const loginLimiter = createLimiter(
      15 * 60 * 1000,
      5,
      'Too many failed login attempts. Please try again in 15 minutes.',
      { skipSuccessfulRequests: true }
    );
    ```
  - Lines 305–311 (native fallback):
    ```javascript
    if (options.skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          data.count++;
          hitMap.set(ip, data);
        }
      });
    }
    ```
  - Lines 606–618 (`POST /login` handler):
    ```javascript
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.render('login', { error: 'Invalid email or password', success: null });
    }
    ...
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('login', { error: 'Invalid email or password', success: null });
    }
    ```
- **Why**:
  1. `express-rate-limit` defines a successful request as `res.statusCode < 400`. When `skipSuccessfulRequests: true` is set, any response with `statusCode < 400` is skipped and its hit count decremented.
  2. The native sliding-window fallback explicitly checks `if (res.statusCode >= 400) data.count++;`.
  3. When an attacker supplies invalid credentials, Express executes `res.render('login', { error: ... })`. Because `res.status(...)` is never called, Express defaults `res.statusCode` to `200`.
  4. Because `200 < 400`, `express-rate-limit` skips the request, and the native fallback does not increment `data.count`.
  5. The limiter counter stays at 0 indefinitely, permitting infinite automated password guessing.
  6. This directly violates the Acceptance Criterion in `ORIGINAL_REQUEST.md`: *"Sending 6 rapid POST requests to /login with wrong credentials results in a rate-limit response on the 6th attempt."*
- **Suggestion**:
  In `app.post('/login')`, explicitly set HTTP 401 Unauthorized for invalid credentials:
  ```javascript
  if (users.length === 0) {
    return res.status(401).render('login', { error: 'Invalid email or password', success: null });
  }
  ...
  if (user.is_active === 0) {
    return res.status(403).render('login', { error: 'Your account has been deactivated. Please contact an administrator.', success: null });
  }
  ...
  if (!match) {
    return res.status(401).render('login', { error: 'Invalid email or password', success: null });
  }
  ```
  And on catch block:
  ```javascript
  return res.status(500).render('login', { error: 'Server error during authentication', success: null });
  ```
  With HTTP 401, failed requests satisfy `res.statusCode >= 400`, the counter increments, the 6th attempt triggers 429 Too Many Requests, and successful logins (which redirect with `302 Found` < 400) remain exempt.

---

### [Medium] Finding 2: Multer `video_file` Extension Whitelist Bypassed by `application/octet-stream`

- **What**: The Multer `fileFilter` for `video_file` allows arbitrary file extensions if the client sends MIME type `application/octet-stream` or `video/*`.
- **Where**: `Landing Page Work/tiffany-webb-crm/server.js`, lines 42–48:
  ```javascript
  if (file.fieldname === 'video_file') {
    const allowedExts = ['.mp4', '.webm', '.mov'];
    if (allowedExts.includes(ext) || (file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream'))) {
      return cb(null, true);
    }
    return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
  }
  ```
- **Why**:
  Because of the logical OR (`||`), any file uploaded under fieldname `video_file` with `mimetype === 'application/octet-stream'` (the standard fallback MIME type for arbitrary binaries, `.exe`, `.php`, `.sh`) will evaluate the `if` condition to `true` and bypass the extension check, saving the file to `public/uploads/videos/`.
  In contrast, the image filter in lines 49–58 strictly checks `if (!allowedExts.includes(ext)) return cb(new Error(...))`.
- **Suggestion**:
  Enforce strict extension validation on video uploads as well:
  ```javascript
  if (file.fieldname === 'video_file') {
    const allowedExts = ['.mp4', '.webm', '.mov'];
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
    }
    return cb(null, true);
  }
  ```

---

### [Minor] Finding 3: `POST /api/leads/:id/notes` Missing `requireAuth` Enforcement

- **What**: The notes creation endpoint lacks `requireAuth` route middleware and falls back to an Admin identity if no authentication cookie exists.
- **Where**: `Landing Page Work/tiffany-webb-crm/server.js`, lines 479–502:
  ```javascript
  app.post('/api/leads/:id/notes', async (req, res) => {
    ...
    const authorName = user ? user.name : (req.session?.user?.name || 'Tiffany Webb (Admin)');
    const authorRole = user ? user.role : (req.session?.user?.role || 'admin');
  ```
- **Why**:
  An unauthenticated attacker or external script can submit notes to any lead ID and have them recorded in `lead_notes` and `activity_log` under the name "Tiffany Webb (Admin)" with role "admin".
- **Suggestion**:
  Add `requireAuth` middleware to the route declaration:
  ```javascript
  app.post('/api/leads/:id/notes', requireAuth, async (req, res) => { ... });
  ```

---

## 3. Observation

1. **File Inspected**: `Landing Page Work/tiffany-webb-crm/server.js` (1,307 lines).
2. **Layer 1 (Helmet & Header Defense)**:
   Lines 151–167:
   ```javascript
   if (helmet) {
     app.use(helmet({
       contentSecurityPolicy: false,
       frameguard: { action: 'deny' },
       noSniff: true
     }));
   } else {
     app.use((req, res, next) => {
       res.setHeader('X-Frame-Options', 'DENY');
       res.setHeader('X-Content-Type-Options', 'nosniff');
       ...
     });
   }
   app.disable('x-powered-by');
   ```
   *Observation*: Explicit `noSniff: true` and `frameguard: { action: 'deny' }` present.
3. **Layer 2 (CORS Whitelist)**:
   Lines 171–180:
   ```javascript
   const allowedOrigins = [
     'http://localhost:4321',
     'http://127.0.0.1:4321',
     'http://localhost:3000',
     'http://127.0.0.1:3000',
     'https://tiffanywebbimpact.com',
     'https://www.tiffanywebbimpact.com',
     'https://crm.tiffanywebbimpact.com',
     process.env.FRONTEND_URL
   ].filter(Boolean);
   ```
   *Observation*: Contains canonical domain invariants (`tiffanywebbimpact.com`, `crm.tiffanywebbimpact.com`). Disallowed origins invoke `callback(null, false)`. Zero matches for legacy `tiffanywebb.com`.
4. **Layer 3 (Rate Limiting & Proxy)**:
   - Line 14: `app.set('trust proxy', 1);`
   - Lines 320–325: `loginLimiter` configured with `skipSuccessfulRequests: true`.
   - Lines 607, 617: `return res.render('login', { error: 'Invalid email or password', success: null });` (HTTP 200).
5. **Layer 4 (Recursive XSS Sanitization & Multer Protection)**:
   - Lines 200–222: `sanitizeString()` runs a loop `do { ... iterations++; } while (clean !== prev && iterations < 25);` stripping `<script>`, `<iframe>`, `javascript:`, `onerror`, `onload`, `onclick`, `onmouseover`.
   - Lines 224–239: `sanitizeValue()` traverses arrays and objects recursively.
   - Lines 241–246: `sanitizeMulterBody` middleware sanitizes `req.body`.
   - Lines 941, 1004, 1062: Attached to `/cms/:slug/collection/:section/new`, `/cms/:slug/collection/:section/:id/edit`, and `/cms/:slug`.
6. **Layer 5 (SQL Parameterization & Route Shadowing)**:
   - Evaluated all 45+ `pool.query` call sites in `server.js`: 100% utilize `?` parameterized placeholders. Zero string concatenation of user input.
   - Checked `POST /api/leads/batch`: Shadowed unauthenticated route at line 425 was completely removed. Exactly 1 route remains at line 1229 with `requireAuth`.
7. **Layer 6 (Secure Cookies)**:
   - Lines 627–632:
     ```javascript
     res.cookie('auth_token', token, {
       httpOnly: true,
       sameSite: 'strict',
       secure: process.env.NODE_ENV === 'production',
       maxAge: 7 * 24 * 60 * 60 * 1000
     });
     ```
8. **Layer 7 (Root Route Authentication)**:
   - Lines 582–594: `GET /` redirects unauthenticated requests to `/login` and valid JWT sessions to `/dashboard`.
9. **Layer 8 (Input & File Validation)**:
   - Lines 49–58: Image uploads restricted strictly to `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`. `.svg`, `.html`, `.php`, `.exe` rejected with Error.
   - Lines 1288–1295: Express error handler intercepts fileFilter errors and displays feedback cleanly without unhandled crashes.

---

## 4. Logic Chain

1. **Premise 1**: Acceptance Criterion R4 in `ORIGINAL_REQUEST.md` mandates: *"Sending 6 rapid POST requests to /login with wrong credentials results in a rate-limit response on the 6th attempt."*
2. **Premise 2**: In `server.js` (lines 320–325), `loginLimiter` was instantiated with `{ skipSuccessfulRequests: true }`.
3. **Premise 3**: In both `express-rate-limit` and the custom fallback in `server.js` (lines 305–311), requests with `res.statusCode < 400` are treated as successful and either decremented or not counted (`if (res.statusCode >= 400) data.count++;`).
4. **Premise 4**: In `server.js` (lines 607, 617), failed login attempts are terminated with `res.render('login', { error: 'Invalid email or password', success: null })`, sending default HTTP status 200.
5. **Deduction**: Because 200 is less than 400, every failed login attempt is treated as a successful request. The counter is never incremented. After 6, 10, or 1,000 failed attempts, the limiter never fires, allowing unlimited brute-force attacks and causing the acceptance test to fail.
6. **Conclusion**: Changes must be requested to return HTTP 401 on failed logins before Milestone M4 can be approved.

---

## 5. Verified Claims vs Unverified Items

### Verified Claims
- **Layer 1 (Helmet)**: `frameguard: { action: 'deny' }` and `noSniff: true` present in both helmet options and fallback middleware. -> **PASS**
- **Layer 2 (CORS)**: `https://tiffanywebbimpact.com`, `https://www.tiffanywebbimpact.com`, `https://crm.tiffanywebbimpact.com` in `allowedOrigins`. -> **PASS**
- **Layer 4 (XSS Sanitization)**: Iterative convergence loop correctly strips nested `<scr<script>ipt>` and event handlers; Multer multipart routes protected via `sanitizeMulterBody`. -> **PASS**
- **Layer 5 (SQL Parameterization)**: All queries parameterized; duplicate `/api/leads/batch` removed. -> **PASS**
- **Layer 6 (Cookies)**: `httpOnly: true`, `sameSite: 'strict'`, 7d maxAge confirmed. -> **PASS**
- **Layer 7 (Root Route)**: `GET /` redirects unauthenticated to `/login` and authenticated to `/dashboard`. -> **PASS**
- **Layer 8 (Image Whitelist)**: Image upload extensions strictly enforced; `.svg` rejected. -> **PASS**

### Failed / Disproven Claims
- **Layer 3 (Rate Limiting on Wrong Credentials)**: Worker M4 claimed `loginLimiter` properly rate-limits failed logins. Disproven by code inspection: `skipSuccessfulRequests: true` combined with `res.render()` returning HTTP 200 prevents failed logins from ever being counted. -> **FAIL**

---

## 6. Caveats

- Direct command execution via `run_command` timed out waiting for user terminal permission; verification was conducted through complete static analysis, AST/regex parsing, and review of empirical test scripts (`test_empirical_security.js` and `auditor_m4_1/audit_runner.js`).

---

## 7. Conclusion & Next Steps

Milestone M4 is very close to complete, but Worker M4 must make one targeted fix in `Landing Page Work/tiffany-webb-crm/server.js`:
1. In `app.post('/login')`, update failed authentication render calls (lines 607, 612, 617, 638) to return HTTP 401/403/500:
   - Line 607: `return res.status(401).render('login', { error: 'Invalid email or password', success: null });`
   - Line 612: `return res.status(403).render('login', { error: 'Your account has been deactivated. Please contact an administrator.', success: null });`
   - Line 617: `return res.status(401).render('login', { error: 'Invalid email or password', success: null });`
   - Line 638: `return res.status(500).render('login', { error: 'Server error during authentication', success: null });`
2. *(Recommended)* In `fileFilter` (line 44), tighten the `video_file` branch so that only `.mp4`, `.webm`, and `.mov` extensions are accepted regardless of MIME type.
3. *(Recommended)* Add `requireAuth` to `POST /api/leads/:id/notes` (line 479).

**Verdict**: **REQUEST_CHANGES**

---

## 8. Verification Method

Once Worker M4 applies the fix:
1. Send 6 consecutive POST requests to `/login` with incorrect credentials:
   - Attempts 1–5 should respond with HTTP 401 and the rendered login page with the error message.
   - Attempt 6 should respond with HTTP 429 Too Many Requests.
2. Send a valid POST request to `/login`:
   - Should respond with HTTP 302 redirect to `/dashboard` and should NOT be blocked by the rate limiter.
