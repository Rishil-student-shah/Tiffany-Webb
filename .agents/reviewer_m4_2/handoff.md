# Handoff Report — reviewer_m4_2 (Milestone M4: 8-Layer Cyber-Attack Security Suite Review)

## 1. Review Summary

**Verdict**: **REQUEST_CHANGES**

**Overall Risk Assessment**: **CRITICAL**

An independent, adversarial security review of `Landing Page Work/tiffany-webb-crm/server.js` was conducted against the requirements of Milestone 4, the Authoritative Request (`ORIGINAL_REQUEST.md` ## 2026-09-03T20:59:19Z, R4), and the Acceptance Criteria.

While Worker M4 successfully improved several defensive layers (Helmet clickjacking/nosniff headers, canonical CORS domains, recursive XSS sanitization across nested payloads, removal of the unauthenticated batch lead route, parameterized SQL queries, and secure cookie configuration), **one Critical defect and two High-severity security vulnerabilities remain active in production code**:

1. **[Critical] Login Brute-Force Rate Limiter Inoperative**: `loginLimiter` specifies `skipSuccessfulRequests: true`. However, `POST /login` renders failed authentication responses using `res.render('login', { error: ... })`, which Express defaults to HTTP status `200 OK`. As a result, both `express-rate-limit` and the native sliding-window fallback classify failed attempts as "successful" (`res.statusCode < 400`) and never increment the failure counter. Live testing confirmed that 8 rapid failed login attempts all returned HTTP 200 without triggering rate limiting on the 6th attempt.
2. **[High] Unauthenticated Admin Impersonation on `POST /api/leads/:id/notes`**: The endpoint lacks `requireAuth` middleware and explicitly falls back to `Tiffany Webb (Admin)` / `admin` when no session or cookie is provided. Live testing confirmed that an unauthenticated caller can post notes to any lead and insert audit log entries under the administrator identity.
3. **[High] Multer `video_file` Arbitrary File Upload via `application/octet-stream`**: The file filter uses a logical OR condition that allows any file with MIME type `application/octet-stream` (standard for generic binary uploads or curl requests) or `video/*` to bypass extension whitelisting, permitting uploads of `.php`, `.exe`, `.html`, or `.svg` files directly into `public/uploads/videos/`.

Changes are strictly requested before Milestone 4 can be approved.

---

## 2. Findings

### [Critical] Finding 1: Rate Limiter Bypassed on Failed Logins (`skipSuccessfulRequests: true` vs HTTP 200 OK)

- **What**: The rate limiter on `/login` fails to throttle incorrect credentials, allowing infinite automated password guessing.
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
  - Lines 305–311 (native sliding-window fallback):
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
  - Lines 605–619 (`POST /login` route handler):
    ```javascript
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.render('login', { error: 'Invalid email or password', success: null });
    }
    
    const user = users[0];
    if (user.is_active === 0) {
      return res.render('login', { error: 'Your account has been deactivated. Please contact an administrator.', success: null });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('login', { error: 'Invalid email or password', success: null });
    }
    ```
- **Why**:
  1. `express-rate-limit` considers any response with `statusCode < 400` successful; with `skipSuccessfulRequests: true`, it decrements/skips the hit count.
  2. The native fallback explicitly tests `if (res.statusCode >= 400) data.count++;`.
  3. When login fails (non-existent user, deactivated account, incorrect password), Express executes `res.render(...)` without an explicit HTTP status code, defaulting to `200 OK`.
  4. Because `200 < 400`, the counter is never incremented.
  5. Live verification against `http://localhost:3000/login` proved that 8 consecutive wrong-password POST requests returned HTTP 200; the 6th attempt was NOT blocked.
  6. This fails Acceptance Criteria: *"Sending 6 rapid POST requests to `/login` with wrong credentials results in a rate-limit response on the 6th attempt."*
- **Suggestion**:
  In `app.post('/login')`, explicitly return HTTP 401 Unauthorized (or 403 Forbidden for deactivated accounts) when authentication fails:
  ```javascript
  if (users.length === 0) {
    return res.status(401).render('login', { error: 'Invalid email or password', success: null });
  }
  if (user.is_active === 0) {
    return res.status(403).render('login', { error: 'Your account has been deactivated. Please contact an administrator.', success: null });
  }
  if (!match) {
    return res.status(401).render('login', { error: 'Invalid email or password', success: null });
  }
  ```
  And in the catch block:
  ```javascript
  return res.status(500).render('login', { error: 'Server error during authentication', success: null });
  ```

---

### [High] Finding 2: Unauthenticated Note Injection and Administrator Identity Spoofing

- **What**: `POST /api/leads/:id/notes` allows unauthenticated callers to inject persistent notes into any lead, attributing them to `"Tiffany Webb (Admin)"` with role `"admin"`.
- **Where**: `Landing Page Work/tiffany-webb-crm/server.js`, lines 479–515:
  ```javascript
  app.post('/api/leads/:id/notes', async (req, res) => {
    try {
      const leadId = req.params.id;
      const { note } = req.body;
      if (!note || !note.trim()) {
        return res.status(400).json({ error: 'Note content cannot be empty' });
      }
      let user = req.user;
      if (!user) {
        const cookies = parseCookies(req);
        if (cookies.auth_token) {
          try {
            const decoded = jwt.verify(cookies.auth_token, JWT_SECRET);
            const [users] = await pool.query('SELECT id, name, email, role, is_active FROM users WHERE id = ?', [decoded.id]);
            if (users.length > 0 && users[0].is_active) {
              user = users[0];
            }
          } catch (e) {}
        }
      }
      const authorName = user ? user.name : (req.session?.user?.name || 'Tiffany Webb (Admin)');
      const authorRole = user ? user.role : (req.session?.user?.role || 'admin');
      const userId = user ? user.id : (req.session?.user?.id || null);

      const [result] = await pool.query(`
        INSERT INTO lead_notes (lead_id, user_id, author_name, author_role, note)
        VALUES (?, ?, ?, ?, ?)
      `, [leadId, userId, authorName, authorRole, note.trim()]);
  ```
- **Why**:
  1. The route does not use `requireAuth` middleware.
  2. If an unauthenticated attacker sends a request with no cookies, `user` is undefined, causing the system to fall back to `'Tiffany Webb (Admin)'` and `'admin'`.
  3. Live test: An unauthenticated POST to `/api/leads/3/notes` returned `200 OK` and created Note ID 14 under author `"Tiffany Webb (Admin)"`, role `"admin"`, and recorded an activity log entry `Internal note by Tiffany Webb (Admin) (admin): ...`.
  4. This violates Milestone 4 Requirement R3 (Secure multi-user team notes engine with resolved authenticated identity).
- **Suggestion**:
  Protect the route with `requireAuth`:
  ```javascript
  app.post('/api/leads/:id/notes', requireAuth, async (req, res) => {
  ```
  And remove the unauthenticated fallback so that `req.user` is strictly required.

---

### [High] Finding 3: Multer `video_file` Extension Whitelist Bypassed by `application/octet-stream`

- **What**: The Multer `fileFilter` for `video_file` allows arbitrary file extensions if the MIME type is `application/octet-stream` or `video/*`.
- **Where**: `Landing Page Work/tiffany-webb-crm/server.js`, lines 40–48:
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
  1. The logical OR (`||`) accepts any file if `file.mimetype === 'application/octet-stream'`.
  2. Because `application/octet-stream` is the default MIME type for raw binary data or curl uploads, an attacker can upload files like `exploit.php`, `backdoor.exe`, `payload.html`, or `xss.svg`.
  3. The file is saved directly to `../tiffany-webb-astro/public/uploads/videos/` with its original extension (`${uniqueSuffix}-${baseName}${ext}`).
  4. Because Express statically serves `/uploads`, uploading `.html` or `.svg` creates a Stored Cross-Site Scripting (XSS) vulnerability.
  5. In contrast, the image filter at lines 49–58 correctly enforces `if (!allowedExts.includes(ext)) return cb(...)`.
- **Suggestion**:
  Enforce strict extension checking for `video_file` as well:
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

### [Medium] Finding 4: Arbitrary File Extension Writing in `saveBase64Image`

- **What**: `saveBase64Image` extracts arbitrary MIME sub-types from data URLs without a whitelist, permitting the creation of arbitrary files in `public/uploads/`.
- **Where**: `Landing Page Work/tiffany-webb-crm/server.js`, lines 107–118:
  ```javascript
  const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return dataUrl;
  }
  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const buffer = Buffer.from(matches[2], 'base64');
  ...
  const filename = `${Date.now()}-cropped-${Math.round(Math.random() * 1E9)}.${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  ```
- **Why**:
  Any value matching `[a-zA-Z0-9+]+` after `data:image/` is used directly as the file extension (e.g. `data:image/svg+xml;base64,...`, `data:image/html;base64,...`, `data:image/php;base64,...`).
- **Suggestion**:
  Whitelist allowed image extensions:
  ```javascript
  const rawSubtype = matches[1].toLowerCase();
  const allowedMap = { 'jpeg': 'jpg', 'jpg': 'jpg', 'png': 'png', 'webp': 'webp', 'gif': 'gif' };
  const ext = allowedMap[rawSubtype];
  if (!ext) return dataUrl;
  ```

---

### [Medium] Finding 5: Rate Limiting Bypass on `POST /api/leads` via `is_manual`

- **What**: External callers can bypass `leadApiLimiter` on `POST /api/leads` by setting `is_manual: true`.
- **Where**: `Landing Page Work/tiffany-webb-crm/server.js`, lines 370–375:
  ```javascript
  app.post('/api/leads', (req, res, next) => {
    if (req.body && req.body.is_manual) {
      return next();
    }
    return leadApiLimiter(req, res, next);
  }, async (req, res) => {
  ```
- **Why**:
  `req.body.is_manual` is not checked for authentication. A bot sending public inquiries with `{"is_manual": true}` will bypass the 30 req/hr rate limiter completely.
- **Suggestion**:
  Only bypass `leadApiLimiter` if the user is authenticated (e.g. valid session / JWT cookie present):
  ```javascript
  app.post('/api/leads', (req, res, next) => {
    const cookies = parseCookies(req);
    const isAuthenticated = !!(cookies.auth_token);
    if (req.body && req.body.is_manual && isAuthenticated) {
      return next();
    }
    return leadApiLimiter(req, res, next);
  }, ...
  ```

---

## 3. Observation

1. **Target File Audited:** `Landing Page Work/tiffany-webb-crm/server.js` (1,307 lines, SHA-256 verified, clean syntax via `node --check`).
2. **Layer 1 (Helmet & Clickjacking Defense):**
   - Lines 151–167: Configured with `contentSecurityPolicy: false`, `frameguard: { action: 'deny' }`, and `noSniff: true`. Native fallback headers present.
   - Verified via live HTTP request: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
3. **Layer 2 (CORS Hardening):**
   - Lines 171–193: Strict whitelist contains `http://localhost:4321`, `http://127.0.0.1:4321`, `http://localhost:3000`, `http://127.0.0.1:3000`, `https://tiffanywebbimpact.com`, `https://www.tiffanywebbimpact.com`, `https://crm.tiffanywebbimpact.com`.
   - Disallowed origins rejected with `callback(null, false)`. Zero matches for legacy `tiffanywebb.com`.
4. **Layer 3 (Rate Limiting Suite):**
   - Lines 14, 320–333: `app.set('trust proxy', 1)` enabled. `loginLimiter` set to 5 attempts per 15 minutes with `skipSuccessfulRequests: true`.
   - Lines 606–619: Failed login attempts render `login.ejs` with HTTP 200 OK.
   - Verification command: Sent 8 consecutive failed login POST requests to `http://localhost:3000/login`. All 8 returned HTTP 200; attempt 6 was not rate-limited.
5. **Layer 4 (Recursive XSS Sanitization & Multer Body Sanitization):**
   - Lines 200–246: Iterative convergence loop `do { ... iterations++; } while (clean !== prev && iterations < 25)` stripping `<script>`, `<iframe>`, `javascript:`, `onerror`, `onload`, `onclick`, `onmouseover`.
   - Evaluated 10 evasion vectors and 30-level nested tags in `test_empirical_security.js` (10/10 passed).
   - Attached `sanitizeMulterBody` to `/cms/:slug/collection/:section/new`, `/cms/:slug/collection/:section/:id/edit`, and `/cms/:slug`.
6. **Layer 5 (SQL Injection Immunity & Shadow Route Removal):**
   - Checked all 45+ `pool.query` call sites: 100% utilize `?` parameterized placeholders. Zero string concatenation of user input.
   - Shadowed unauthenticated `POST /api/leads/batch` removed. Remaining route at line 1229 uses `requireAuth`.
7. **Layer 6 (Secure Cookie Governance):**
   - Lines 627–632: `auth_token` cookie configured with `httpOnly: true`, `sameSite: 'strict'`, `secure: process.env.NODE_ENV === 'production'`, `maxAge: 7 * 24 * 60 * 60 * 1000`.
8. **Layer 7 (Root Route Authentication):**
   - Lines 582–594: `GET /` issues HTTP 302 redirecting unauthenticated requests to `/login` and valid JWT sessions to `/dashboard`.
9. **Layer 8 (Input & File Validation):**
   - Image uploads strictly check `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`.
   - Video uploads allow bypass via `mimetype === 'application/octet-stream'`.
   - `saveBase64Image` lacks extension whitelist.

---

## 4. Logic Chain

1. **Acceptance Criteria Requirement:** `ORIGINAL_REQUEST.md` specifically mandates: *"Sending 6 rapid POST requests to `/login` with wrong credentials results in a rate-limit response on the 6th attempt."*
2. **Observation of Code Behavior:** `POST /login` calls `res.render('login', { error: 'Invalid email or password', success: null })` without calling `res.status(...)`. Express defaults un-statused renders to HTTP 200.
3. **Rate Limiter Mechanism:** Both `express-rate-limit` (when configured with `skipSuccessfulRequests: true`) and the sliding-window fallback in `server.js` evaluate success as `statusCode < 400`. Because HTTP 200 < 400, every failed attempt is classified as successful, causing the hit counter to be decremented or never incremented.
4. **Empirical Confirmation:** Sending 8 consecutive failed login requests produced eight HTTP 200 responses. The 6th request was not rate-limited. Therefore, the brute-force protection fails both logically and empirically.
5. **Observation of Notes API:** `POST /api/leads/:id/notes` does not specify `requireAuth`. Lines 500–502 fallback to `'Tiffany Webb (Admin)'` and `'admin'` when `user` is undefined.
6. **Empirical Confirmation:** Sending an unauthenticated POST request to `/api/leads/3/notes` returned HTTP 200, creating Note ID 14 and an activity log entry attributed to the administrator. This is an authorization bypass and identity spoofing flaw.
7. **Observation of Multer Video Filter:** Lines 42–47 contain `if (allowedExts.includes(ext) || (file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream'))) return cb(null, true);`.
8. **Logical Deduction:** The `||` operator evaluates to `true` whenever `file.mimetype` is `application/octet-stream`, regardless of whether `ext` is `.mp4`, `.webm`, or `.mov`. Consequently, non-video files (`.php`, `.exe`, `.html`, `.svg`) are accepted and stored with their original extensions in `public/uploads/videos/`.
9. **Conclusion:** Because the system fails the mandatory rate limiting acceptance test and contains authorization and upload bypasses, the work cannot be approved.

---

## 5. Caveats

- Database tests were performed against the active local development database `tiffany_crm`.
- `helmet` npm package is declared in `package.json` but is not installed in local `node_modules`; however, the native fallback middleware is fully functional and delivers all required headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).

---

## 6. Conclusion

**Verdict**: **REQUEST_CHANGES**

Milestone 4 implementation in `Landing Page Work/tiffany-webb-crm/server.js` is rejected due to:
1. **Critical failure of Login Rate Limiting (Acceptance Criteria unmet)**.
2. **High-severity Unauthenticated Notes Injection & Admin Impersonation**.
3. **High-severity Multer `video_file` Extension Whitelist Bypass**.
4. **Medium-severity Arbitrary Extension Creation in `saveBase64Image`**.
5. **Medium-severity Rate Limit Bypass on `POST /api/leads` via unverified `is_manual` flag**.

Once these five remediation items are applied and verified, the 8-Layer Cyber-Attack Security Suite will meet production-grade standards.

---

## 7. Verification Method

To independently verify these findings:

1. **Verify Rate Limiter Bypass on `/login`:**
   ```powershell
   node -e "
   const http = require('http');
   async function sendPost() {
     return new Promise((resolve) => {
       const postData = 'email=fake%40test.com&password=wrongpassword';
       const req = http.request({
         hostname: 'localhost', port: 3000, path: '/login', method: 'POST',
         headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData) }
       }, (res) => resolve(res.statusCode));
       req.write(postData); req.end();
     });
   }
   (async () => {
     for (let i = 1; i <= 7; i++) {
       const status = await sendPost();
       console.log('Attempt ' + i + ': status = ' + status);
     }
   })();"
   ```
   *Expected behavior according to acceptance criteria:* Attempt 6 should return `429 Too Many Requests`.
   *Actual behavior observed:* All attempts return `200 OK`.

2. **Verify Unauthenticated Note Posting & Identity Spoofing:**
   ```powershell
   node -e "
   const http = require('http');
   const postData = JSON.stringify({ note: 'Adversarial audit test note' });
   const req = http.request({
     hostname: 'localhost', port: 3000, path: '/api/leads/3/notes', method: 'POST',
     headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
   }, (res) => {
     let b = ''; res.on('data', d => b += d);
     res.on('end', () => console.log('Status:', res.statusCode, 'Body:', b));
   });
   req.write(postData); req.end();"
   ```
   *Expected secure behavior:* HTTP 302 redirect to `/login` or HTTP 401 Unauthorized.
   *Actual behavior observed:* HTTP 200 with note created as `"Tiffany Webb (Admin)"`.

3. **Verify Video Upload Filter Bypass:**
   ```powershell
   cd "D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm"
   node -e "
   const fs = require('fs');
   const s = fs.readFileSync('server.js', 'utf8');
   const filterCode = s.slice(s.indexOf('fileFilter: function'), s.indexOf('const collectionUpload'));
   console.log('Allows octet-stream for any extension:', filterCode.includes('application/octet-stream'));
   "
   ```
   *Expected secure behavior:* Output `false`. Strict whitelist on extensions only.
   *Actual behavior observed:* Output `true`.
