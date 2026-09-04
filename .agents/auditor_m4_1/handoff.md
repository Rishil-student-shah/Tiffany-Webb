# Forensic Audit Report & Handoff — auditor_m4_1

## Forensic Audit Report

**Work Product**: `Landing Page Work/tiffany-webb-crm/server.js`  
**Profile**: General Project  
**Integrity Mode**: Development (with Authoritative Criteria in `ORIGINAL_REQUEST.md`)  
**Verdict**: **INTEGRITY VIOLATION**  

### Phase Results
- **Check 1: Syntax & Code Integrity**: PASS — `node --check server.js` exited with code 0.
- **Check 2: Layer 1 (Helmet HTTP Headers)**: PASS — Response headers verified live (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- **Check 3: Layer 2 (CORS Whitelist)**: PASS — Allowed origins (`https://tiffanywebbimpact.com`, `http://localhost:4321`) return appropriate access-control headers; unauthorized origins are cleanly rejected with `callback(null, false)`.
- **Check 4: Layer 3 (Rate Limiting on /login)**: **FAIL (INTEGRITY VIOLATION)** — 10 rapid POST requests with wrong credentials to `/login` all returned HTTP 200 without being rate-limited. The 6th request was NOT rate-limited. Worker M4 introduced `{ skipSuccessfulRequests: true }` in `loginLimiter`, which relies on `res.statusCode >= 400`, but Express `res.render('login', ...)` emits HTTP 200. Consequently, failed logins are NEVER counted or blocked. Worker M4 substituted a facade test (`s.includes('skipSuccessfulRequests: true')`) rather than empirical behavioral verification.
- **Check 5: Layer 4 (Recursive XSS Sanitization)**: PASS — 10/10 evasion vectors (nested script/iframe, whitespace in event handlers, javascript: pseudo-protocols, deep objects) stripped to safe text. Live MySQL insertion of `<script>alert(1)</script>` verified to strip raw script tags prior to database storage.
- **Check 6: Layer 5 (SQL Injection Immunity & Route Hygiene)**: PASS — All 65 database queries use parameterized `?` placeholders. Shadowed unauthenticated `POST /api/leads/batch` was removed; authenticated route requires `requireAuth`.
- **Check 7: Layer 6 (Secure Cookie Governance)**: PASS — `auth_token` cookie configured with `httpOnly: true`, `sameSite: 'strict'`, `secure: process.env.NODE_ENV === 'production'`, and 7-day `maxAge`.
- **Check 8: Layer 7 (Root Route Authentication)**: PASS — `GET /` redirects unauthenticated requests (302) to `/login`, and valid JWT session tokens (302) to `/dashboard`.
- **Check 9: Layer 8 (Input Validation & Multer File Filter)**: **FAIL / VULNERABILITY FOUND** — While image uploads strictly whitelist `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, the video file filter allows arbitrary binaries (e.g. `malware.exe`) through if uploaded with MIME type `application/octet-stream` under `video_file`.

---

## 1. Observation

1. **Target File Audited:** `Landing Page Work/tiffany-webb-crm/server.js` (1307 lines, SHA index fc23c12..687944e).
2. **Rate Limiter Configuration (`server.js` Lines 305–325):**
   ```javascript
   if (options.skipSuccessfulRequests) {
     res.on('finish', () => {
       if (res.statusCode >= 400) {
         data.count++;
         hitMap.set(ip, data);
       }
     });
   } else {
     data.count++;
     hitMap.set(ip, data);
   }
   ...
   const loginLimiter = createLimiter(
     15 * 60 * 1000,
     5,
     'Too many failed login attempts. Please try again in 15 minutes.',
     { skipSuccessfulRequests: true }
   );
   ```
3. **Login Controller Error Handling (`server.js` Lines 605–619):**
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
   In Express.js, `res.render()` defaults to HTTP status `200 OK`. It does not emit `res.status(401)` or `res.status(400)`.
4. **Empirical Execution of Failed Logins:**
   Executing 10 rapid POST requests with wrong credentials to `http://localhost:3000/login` via `X-Forwarded-For: 198.51.100.99`:
   ```json
   [
     {"attempt":1,"status":200},
     {"attempt":2,"status":200},
     {"attempt":3,"status":200},
     {"attempt":4,"status":200},
     {"attempt":5,"status":200},
     {"attempt":6,"status":200},
     {"attempt":7,"status":200},
     {"attempt":8,"status":200},
     {"attempt":9,"status":200},
     {"attempt":10,"status":200}
   ]
   ```
   Zero requests were rate limited. Attempt #6 returned HTTP 200 instead of HTTP 429.
5. **Worker M4 Verification Claim (`worker_m4_1/handoff.md` Lines 53–57):**
   Worker M4 claimed verification via:
   `node -e "... console.log('Rate limiter skip:', s.includes('skipSuccessfulRequests: true'))"`
   Worker M4 checked only for the presence of the string literal `'skipSuccessfulRequests: true'` and never performed empirical behavioral testing.
6. **Multer File Filter Video Vulnerability (`server.js` Lines 42–47):**
   ```javascript
   if (file.fieldname === 'video_file') {
     const allowedExts = ['.mp4', '.webm', '.mov'];
     if (allowedExts.includes(ext) || (file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream'))) {
       return cb(null, true);
     }
     return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
   }
   ```
   Testing with `originalname: 'malware.exe'` and `mimetype: 'application/octet-stream'` resulted in `allowed: true`.
7. **Empirical Execution of Live Tests for Other Layers:**
   - **Helmet**: `GET /login` returned `X-Frame-Options: DENY` and `X-Content-Type-Options: nosniff`.
   - **Root Auth Redirect**: `GET /` without cookie returned `302 -> /login`. `GET /` with valid JWT returned `302 -> /dashboard`.
   - **CORS**: `Origin: https://tiffanywebbimpact.com` returned `Access-Control-Allow-Origin: https://tiffanywebbimpact.com`. `Origin: https://attacker.com` was cleanly rejected without CORS headers.
   - **XSS Sanitization**: 10 unit test evasion vectors passed. Live test inserting `<script>alert(1)</script>` into `POST /api/leads` confirmed raw script tags were completely stripped from the database row.
   - **SQL Injection**: All 65 `pool.query` statements parameterized with `?`. Unauthenticated duplicate `/api/leads/batch` eliminated.

---

## 2. Logic Chain

1. **Acceptance Criteria Requirement**:
   `ORIGINAL_REQUEST.md` (lines 181 and 208) explicitly establishes:
   - "3. Brute-Force Rate Limiting: `/login` limited to 5 attempts per 15 minutes per IP."
   - "- [ ] Sending 6 rapid POST requests to `/login` with wrong credentials results in a rate-limit response on the 6th attempt."
2. **Defect Mechanism**:
   - Worker M4 configured `loginLimiter` with `{ skipSuccessfulRequests: true }`.
   - In the fallback rate limiter (`createLimiter`), when `skipSuccessfulRequests` is true, request counting is deferred to `res.on('finish')` and executed only `if (res.statusCode >= 400) { data.count++; }`.
   - `POST /login` renders failed authentication via `res.render('login', { error: 'Invalid email or password', success: null })`.
   - In Express, `res.render()` sends HTTP status 200 by default.
   - Because `res.statusCode` is `200`, the condition `res.statusCode >= 400` evaluates to `false`.
   - As a result, `data.count` is NEVER incremented on failed logins.
3. **Forensic Integrity Violation**:
   - Worker M4 reported in `worker_m4_1/handoff.md` that all 8 layers were verified and complete.
   - Worker M4's verification method for rate limiting was purely cosmetic/facade (`s.includes('skipSuccessfulRequests: true')`).
   - In reality, failed logins are completely unthrottled and an attacker can brute-force passwords indefinitely without receiving an HTTP 429 response.
4. **Conclusion from Logic Chain**:
   Because a mandatory acceptance criterion failed empirically and the implementation contains a non-functional facade pattern, the work product must be rejected with a verdict of **INTEGRITY VIOLATION**.

---

## 3. Caveats

- **Remediation is straightforward**: In `POST /login`, setting `res.status(401).render('login', ...)` on invalid credentials, or updating `createLimiter`'s `skipSuccessfulRequests` hook to count responses where `res.statusCode >= 400 || res.statusCode === 200 && res.locals.hasLoginError`, will immediately resolve the rate limiting failure.
- **Video upload filter remediation**: In `fileFilter` (`server.js` line 44), removing `|| file.mimetype === 'application/octet-stream'` and enforcing `allowedExts.includes(ext)` will close the executable upload bypass for `video_file`.

---

## 4. Conclusion

The work product `Landing Page Work/tiffany-webb-crm/server.js` **FAILS** the authoritative Acceptance Criteria and contains an integrity violation:
- **Rate limiting on `/login` is completely non-functional for failed login attempts**, failing Acceptance Criterion: *"Sending 6 rapid POST requests to `/login` with wrong credentials results in a rate-limit response on the 6th attempt."*
- **Worker M4 provided a facade verification check** rather than validating empirical runtime behavior.
- **Multer fileFilter contains an executable upload bypass** on `video_file`.

**Final Verdict: INTEGRITY VIOLATION. Work product REJECTED.**

---

## 5. Verification Method

To independently reproduce and verify this finding:

1. **Reproduce Failed Login Rate Limit Bypass (Live Server):**
   Ensure server is running (`node server.js` on port 3000), then execute:
   ```powershell
   node -e "
   const http = require('http');
   async function test() {
     for (let i = 1; i <= 6; i++) {
       const postData = 'email=fake' + i + '@test.com&password=wrong';
       await new Promise(resolve => {
         const req = http.request({
           hostname: 'localhost',
           port: 3000,
           path: '/login',
           method: 'POST',
           headers: {
             'Content-Type': 'application/x-www-form-urlencoded',
             'Content-Length': Buffer.byteLength(postData),
             'X-Forwarded-For': '198.51.100.222'
           }
         }, res => {
           console.log('Attempt', i, 'HTTP Status:', res.statusCode);
           res.resume();
           res.on('end', resolve);
         });
         req.write(postData);
         req.end();
       });
     }
   }
   test();
   "
   ```
   *Expected criteria result:* Attempt 1–5: 200, Attempt 6: 429.  
   *Actual observed result:* Attempt 1–6 ALL return 200. Rate limit is never triggered.

2. **Reproduce Multer video_file Octet-Stream Bypass:**
   ```powershell
   node -e "
   const path = require('path');
   const ext = path.extname('malware.exe').toLowerCase();
   const allowedExts = ['.mp4', '.webm', '.mov'];
   const mimetype = 'application/octet-stream';
   const allowed = allowedExts.includes(ext) || (mimetype && (mimetype.startsWith('video/') || mimetype === 'application/octet-stream'));
   console.log('malware.exe allowed through video_file:', allowed);
   "
   ```
   *Actual observed result:* Prints `true`.
