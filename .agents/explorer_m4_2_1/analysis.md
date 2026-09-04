# Rate Limiting Failure & Authentication Remediation Analysis

**Agent**: `explorer_m4_2_1` (`teamwork_preview_explorer`)  
**Date**: 2026-09-04  
**Target Component**: `Landing Page Work/tiffany-webb-crm/server.js` (`POST /login` route handler & `loginLimiter`)  
**Authoritative Reference**: `ORIGINAL_REQUEST.md` (Section `## 2026-09-03T20:59:19Z`, Requirement R4 & Acceptance Criteria line 208)  
**Input Audits**: `auditor_m4_1/handoff.md`, `reviewer_m4_1/handoff.md`, `reviewer_m4_2/handoff.md`, `challenger_m4_2/handoff.md`  

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 The Failure Observed in Audit
During the Milestone 4 forensic audit (`auditor_m4_1`), an **INTEGRITY VIOLATION** was reported because 10 rapid POST requests with incorrect credentials to `/login` all returned HTTP status `200 OK` without triggering rate limiting. The 6th request was NOT throttled, directly violating the mandatory Acceptance Criterion in `ORIGINAL_REQUEST.md`:
> `- [ ] Sending 6 rapid POST requests to /login with wrong credentials results in a rate-limit response on the 6th attempt.`

This failure was independently reproduced and confirmed by `reviewer_m4_1`, `reviewer_m4_2`, and `challenger_m4_2` (Test `RATE-2.2` in `test/challenger_m4_2_empirical.cjs`).

### 1.2 The Underlying Defect Mechanism
The defect stems from a mismatch between how rate limiting evaluates request success vs how the Express `POST /login` controller renders views:

1. **Active Limiter Implementation**:
   In `Landing Page Work/tiffany-webb-crm/server.js` (lines 266–269), `rateLimit` is loaded dynamically via `require('express-rate-limit')` inside a `try/catch`. Inspection of `node_modules` reveals that `express-rate-limit` is not present in local `node_modules`, meaning `rateLimit` is `undefined`. Consequently, `createLimiter` **always executes the native sliding-window fallback** (lines 282–318).

2. **The `skipSuccessfulRequests` Contract in `createLimiter`**:
   In `server.js` (lines 305–311), the native limiter implements `skipSuccessfulRequests` as follows:
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
   ```
   *Notice the predicate*: `if (res.statusCode >= 400)`. Counting is deferred until the HTTP response has finished sending, and `data.count` is incremented **only if the response status code is 400 or greater**. (Note: even if `express-rate-limit` were installed, its specification similarly decrements hit counts when `res.statusCode < 400`).

3. **Express `res.render()` Default Status Code**:
   In `server.js` (lines 605–619), the `POST /login` controller handles authentication failures:
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
   In Express.js, invoking `res.render('view', data)` without explicitly setting `res.status(...)` defaults `res.statusCode` to **`200 OK`**.

4. **The Deadlock**:
   - For every failed login attempt, Express sends `res.statusCode = 200`.
   - When the response finishes, `res.on('finish')` checks `if (res.statusCode >= 400)`.
   - `200 >= 400` evaluates to **`false`**.
   - `data.count` is **never incremented**.
   - `hitMap.set(ip, data)` is never called for failed requests.
   - On every subsequent attempt, `data.count` remains `0`.
   - The condition `if (data.count >= max)` (`0 >= 5`) is never satisfied.
   - An attacker can execute infinite automated credential-stuffing or brute-force attacks without ever receiving HTTP 429.

---

## 2. Comprehensive HTTP Status Code Taxonomy for `POST /login`

To resolve the defect and establish robust HTTP semantics, `app.post('/login')` must return explicit HTTP status codes corresponding to each failure condition:

| Condition | Current Status Code | Proposed Remediation Status Code | Rationale & Rate Limiter Behavior |
|---|---|---|---|
| **Missing Credentials** (empty/null `email` or `password`) | `200 OK` (via MySQL empty match) | **`400 Bad Request`** | RFC 9110 §15.5.1: Payload is invalid/incomplete. `400 >= 400` evaluates to `true`. Increments `data.count`. Prevents unauthenticated fuzzers from flooding the endpoint with empty requests to probe timing. |
| **Invalid Email** (user record not found) | `200 OK` | **`401 Unauthorized`** | RFC 9110 §15.5.2: Authentication credentials missing or invalid. `401 >= 400` evaluates to `true`. Increments `data.count`. |
| **Deactivated Account** (`user.is_active === 0`) | `200 OK` | **`403 Forbidden`** | RFC 9110 §15.5.4: Server recognizes the identity but refuses to authorize access. `403 >= 400` evaluates to `true`. Increments `data.count`. Prevents automated enumeration against locked/deactivated accounts. |
| **Invalid Password** (`bcrypt.compare` returns `false`) | `200 OK` | **`401 Unauthorized`** | RFC 9110 §15.5.2: Invalid authentication credentials. `401 >= 400` evaluates to `true`. Increments `data.count`. Core brute-force defense trigger. |
| **Internal Server Error** (`catch (err)`) | `200 OK` | **`500 Internal Server Error`** | RFC 9110 §15.6.1: Server encountered unexpected error (e.g. database down). `500 >= 400` evaluates to `true`. Increments `data.count`. Prevents DoS amplification attacks against a struggling backend database. |
| **Successful Authentication** (valid email + password) | `302 Found` (via `res.redirect`) | **`302 Found`** (Unchanged) | `302 < 400`. Condition `res.statusCode >= 400` evaluates to `false`. **`data.count` is NOT incremented**. Legitimate users who authenticate successfully are exempted from consuming rate limit quota. |

### 2.1 User Experience Impact in Browsers
In HTML browsers, returning HTTP 400, 401, 403, or 500 alongside `res.render('login', { error, success })` causes **zero visual degradation**. Browsers parse and display HTML response bodies identically regardless of whether the HTTP status is 200, 400, 401, 403, or 500.
The EJS template `views/login.ejs` (lines 27–32):
```html
<% if (typeof error !== 'undefined' && error) { %>
    <div class="alert alert-error">
        <span><%= error %></span>
        <button onclick="this.parentElement.style.display='none'">&times;</button>
    </div>
<% } %>
```
will render the identical gold/ivory branded alert box to the executive user, while the HTTP transport layer accurately signals the client error to rate limiters, reverse proxies, and automated security scanners.

---

## 3. Detailed Lifecycle: How `data.count` Increments and Triggers HTTP 429 on Attempt 6

Here is the exact step-by-step lifecycle and state machine across 6 consecutive failed login attempts from client IP `198.51.100.222`:

```
Client (IP: 198.51.100.222)
       │
       │ Attempt 1: POST /login (Wrong Password)
       ▼
[loginLimiter Middleware]
  ├─ Resolves IP: req.ip = '198.51.100.222' (via trust proxy: 1 & X-Forwarded-For)
  ├─ Lookup: hitMap.get('198.51.100.222') -> undefined
  ├─ Initializes: data = { count: 0, resetTime: T + 15min }
  ├─ Evaluates: data.count (0) >= max (5) -> FALSE
  ├─ Attaches hook: res.on('finish', () => { if (res.statusCode >= 400) { data.count++; hitMap.set(ip, data); } })
  └─ Calls next()
       │
       ▼
[POST /login Route Handler]
  ├─ Validates credentials -> bcrypt mismatch
  └─ Executes: res.status(401).render('login', { error: 'Invalid email or password', success: null })
       │
       ▼
[HTTP Response Finished Event: 'finish']
  ├─ res.statusCode is 401
  ├─ 401 >= 400 -> TRUE
  ├─ data.count becomes 1
  └─ hitMap.set('198.51.100.222', { count: 1, resetTime: ... })
  └─ Response delivered to Client: HTTP 401

... [Attempts 2, 3, 4, 5 follow identical cycle]
    Attempt 2 finished -> data.count = 2 (HTTP 401 delivered)
    Attempt 3 finished -> data.count = 3 (HTTP 401 delivered)
    Attempt 4 finished -> data.count = 4 (HTTP 401 delivered)
    Attempt 5 finished -> data.count = 5 (HTTP 401 delivered)
...

       │
       │ Attempt 6: POST /login (Wrong or Any Password)
       ▼
[loginLimiter Middleware]
  ├─ Resolves IP: req.ip = '198.51.100.222'
  ├─ Lookup: hitMap.get('198.51.100.222') -> { count: 5, resetTime: ... }
  ├─ Evaluates: data.count (5) >= max (5) -> TRUE!
  ├─ BLOCKS REQUEST IMMEDIATELY:
  │    return res.status(429).send('Too many failed login attempts. Please try again in 15 minutes.');
  └─ next() is NEVER called.
       │
       ▼ (Perimeter Defense)
Route handler is bypassed. MySQL is NOT queried. bcrypt is NOT executed.
Response delivered to Client: HTTP 429 Too Many Requests.
```

### 3.1 Verification of Successful Login Exemption
Suppose a user fails 2 attempts (`data.count = 2`), and on attempt 3 provides valid credentials:
1. `loginLimiter` checks `data.count >= 5` (`2 >= 5` is `false`) and attaches `res.on('finish')`.
2. `POST /login` validates credentials, sets the `auth_token` JWT cookie, updates `last_login_at`, and calls `res.redirect('/dashboard')`.
3. Express sends HTTP `302 Found`.
4. Response finishes.
5. In `res.on('finish')`: `res.statusCode` is `302`. `302 >= 400` is **`false`**.
6. `data.count` is **not incremented** (remains 2).
7. The user lands safely on `/dashboard`.

---

## 4. Proposed Code Replacement for `server.js`

### 4.1 Target File & Location
- **File**: `Landing Page Work/tiffany-webb-crm/server.js`
- **Location**: Lines 602–640

### 4.2 Code Comparison

#### Current Code (`server.js` lines 602–640):
```javascript
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
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
    
    // Sign JWT token and set secure HTTP-only cookie
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Server error during authentication', success: null });
  }
});
```

#### Proposed Remediated Code:
```javascript
app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  // 1. Missing credentials validation -> HTTP 400 Bad Request
  if (!email || !password || !String(email).trim() || !String(password).trim()) {
    return res.status(400).render('login', { error: 'Email and password are required', success: null });
  }

  try {
    const cleanEmail = String(email).trim();
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);

    // 2. User not found -> HTTP 401 Unauthorized
    if (users.length === 0) {
      return res.status(401).render('login', { error: 'Invalid email or password', success: null });
    }
    
    const user = users[0];

    // 3. Deactivated account -> HTTP 403 Forbidden
    if (user.is_active === 0) {
      return res.status(403).render('login', { error: 'Your account has been deactivated. Please contact an administrator.', success: null });
    }

    // 4. Password mismatch -> HTTP 401 Unauthorized
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).render('login', { error: 'Invalid email or password', success: null });
    }
    
    // 5. Successful authentication -> Sign JWT token and set secure HTTP-only cookie (HTTP 302 Exempt from rate limit counter)
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login authentication error:', err);
    // 6. Internal server error -> HTTP 500 Internal Server Error
    res.status(500).render('login', { error: 'Server error during authentication', success: null });
  }
});
```

---

## 5. Synthesis of Secondary Forensic & Review Findings

While the rate limiting failure on `POST /login` is the primary blocker, the forensic audit and reviewer reports identified four additional vulnerabilities in `server.js` that Worker M4_2 should remediate concurrently:

### 5.1 Multer `video_file` Extension Whitelist Bypass (Auditor Finding 6, Reviewer 1 Finding 2, Reviewer 2 Finding 3)
- **Location**: `server.js` lines 42–48.
- **Flaw**:
  ```javascript
  if (allowedExts.includes(ext) || (file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream'))) {
    return cb(null, true);
  }
  ```
  The logical OR allows any file with `application/octet-stream` (e.g. `malware.exe`, `shell.php`) to bypass the extension whitelist and be written to `public/uploads/videos/`.
- **Remediation**: Remove the `application/octet-stream` bypass and enforce extension checking strictly:
  ```javascript
  if (file.fieldname === 'video_file') {
    const allowedExts = ['.mp4', '.webm', '.mov'];
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
    }
    return cb(null, true);
  }
  ```

### 5.2 Unauthenticated Notes Injection & Admin Impersonation (Reviewer 1 Finding 3, Reviewer 2 Finding 2)
- **Location**: `server.js` line 479 (`POST /api/leads/:id/notes`).
- **Flaw**: Missing `requireAuth` middleware and explicitly falling back to `'Tiffany Webb (Admin)'` / `'admin'` when no session exists.
- **Remediation**: Add `requireAuth` to the route:
  ```javascript
  app.post('/api/leads/:id/notes', requireAuth, async (req, res) => { ... });
  ```

### 5.3 Arbitrary File Extension Writing in `saveBase64Image` (Reviewer 2 Finding 4)
- **Location**: `server.js` lines 107–118.
- **Flaw**: Regex extracts arbitrary MIME sub-type without whitelist.
- **Remediation**: Add an explicit image extension map (`jpeg`, `jpg`, `png`, `webp`, `gif`).

### 5.4 Batch CSV Upload MySQL ENUM Truncation (Challenger Finding 1.4)
- **Location**: `server.js` line 1254.
- **Flaw**: `lead.source || 'csv_upload'` crashes with MySQL Error 1265 (`WARN_DATA_TRUNCATED`) because `'csv_upload'` is not in `leads.source` ENUM (`'website_form','whatsapp','instagram','email','referral','manual'`).
- **Remediation**: Change fallback to valid ENUM value: `lead.source || 'manual'`.

---

## 6. Independent Verification & Validation Plan

Once the implementer applies the changes to `server.js`, the remediation can be verified immediately using the following empirical tests:

### 6.1 Test 1: 6 Rapid Failed Login Attempts (Rate Limiting Verification)
Execute the following Node.js one-liner against the running server (`port 3000`):
```powershell
node -e "
const http = require('http');
async function test() {
  const testIp = '198.51.100.199';
  for (let i = 1; i <= 6; i++) {
    const postData = 'email=fake' + i + '@test.com&password=wrongpassword';
    await new Promise(resolve => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'X-Forwarded-For': testIp
        }
      }, res => {
        console.log('Attempt', i, 'Status:', res.statusCode);
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
**Expected Output**:
```
Attempt 1 Status: 401
Attempt 2 Status: 401
Attempt 3 Status: 401
Attempt 4 Status: 401
Attempt 5 Status: 401
Attempt 6 Status: 429
```

### 6.2 Test 2: Missing Credentials Validation
Send a POST request with empty body or empty strings:
```powershell
node -e "
const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': 0,
    'X-Forwarded-For': '198.51.100.188'
  }
}, res => {
  console.log('Missing Credentials Status:', res.statusCode);
  res.resume();
});
req.end();
"
```
**Expected Output**: `Missing Credentials Status: 400`

### 6.3 Test 3: Successful Login Redirection & Non-Incrementation
Send valid credentials and check status:
**Expected Output**: `Status: 302`, `Location: /dashboard`, `Set-Cookie: auth_token=...`. Follow-up requests from that IP are not throttled.

### 6.4 Test 4: Run Co-Located Empirical Challenger Suite
```powershell
cd "D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm"
node -e "require('./test/challenger_m4_2_empirical.cjs').runEmpiricalSuite()"
```
**Expected Output**: Test `RATE-2.2` passes with `100% PASS`.
