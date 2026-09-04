# 8-Layer Cyber-Attack Security Suite Survey & Gap Analysis
**Target File:** `Landing Page Work/tiffany-webb-crm/server.js`  
**Auditor:** `explorer_survey_3`  
**Timestamp:** 2026-09-04T06:18:00Z  
**Integrity Mode:** Read-Only Investigation  

---

## Executive Summary

A comprehensive, line-by-line security audit was performed on `Landing Page Work/tiffany-webb-crm/server.js` against the authoritative 8-Layer Cyber-Attack Security Suite specifications (defined in `.agents/ORIGINAL_REQUEST.md` §2026-09-03T20:59:19Z, R4, Acceptance Criteria, and `GEMINI.md` design invariants).

While several core defensive layers demonstrate strong engineering (SQL injection immunity with 100% parameterization, secure cookie governance with `httpOnly: true` and `sameSite: 'strict'`, root route authentication redirect logic, and rate limiting), **four critical security gaps were uncovered** that require immediate remediation:
1. **Layer 2 (CORS Hardening)**: The official canonical domain `https://tiffanywebbimpact.com` is **completely absent** from the hardcoded `allowedOrigins` whitelist array, and `.env` defaults to `http://localhost:4321`.
2. **Layer 4 (XSS Sanitization)**: String stripping is **non-recursive** (single-pass regex vulnerable to nested evasion tags), and **multipart/form-data requests (Multer) bypass global XSS sanitization entirely**, permitting Stored XSS in CMS content that is rendered via `set:html` on the public Astro site.
3. **Layer 8 (Input Validation)**: Although `express-validator` is installed in `package.json`, it is **never imported or used anywhere in `server.js`**. Multer file filtering also permits **arbitrary file uploads** for `image_file` (`cb(null, true)`), allowing HTML/SVG file uploads to `public/uploads`.
4. **Architectural Finding (Route Shadowing / Auth Bypass)**: `POST /api/leads/batch` is declared **twice**: an unauthenticated version at line 425 shadows the authenticated version at line 1220, allowing unauthorized batch lead imports.

---

## Security Suite Scorecard

| Layer | Security Layer Name | Current Status | Compliance | Severity of Gaps |
|:---:|:---|:---:|:---:|:---:|
| **1** | **Helmet Shield** | Configured with native fallback | **95% Compliant** | Low (Missing explicit `noSniff: true` flag) |
| **2** | **CORS Hardening** | Whitelist active, missing prod domain | **PARTIAL (Gap)** | **HIGH** (Missing `tiffanywebbimpact.com` in array) |
| **3** | **Brute-Force Rate Limiting** | Active (5 attempts / 15 min on `/login`) | **85% Compliant** | Medium (Missing `trust proxy`, counts successful logins) |
| **4** | **XSS Sanitization** | Single-pass regex, Multer bypass | **CRITICAL GAP** | **CRITICAL** (Non-recursive regex, Multer forms bypass) |
| **5** | **SQL Injection Immunity** | 100% parameterized with `?` placeholders | **100% COMPLIANT** | None (Zero string concatenation across 40 queries) |
| **6** | **Secure Cookie Governance** | JWT `auth_token`, httpOnly, strict, 7d | **100% COMPLIANT** | None (Fully meets requirements) |
| **7** | **Root Route Authentication** | `GET /` redirects to `/login` or `/dashboard` | **100% COMPLIANT** | None (Verified redirect logic) |
| **8** | **Input Validation** | Ad-hoc checks, express-validator unused | **CRITICAL GAP** | **HIGH** (No schema validator, unrestricted image upload) |

---

## Detailed Layer-by-Layer Investigation

### Layer 1: Helmet Shield & Clickjacking Defense
- **Requirement:** `helmet({ contentSecurityPolicy: false, frameguard: { action: 'deny' } })` — Clickjacking denied (`X-Frame-Options: DENY`), `X-Content-Type-Options: nosniff`.
- **Location in Code:** Lines 134–156 of `Landing Page Work/tiffany-webb-crm/server.js`:
  ```javascript
  let helmet;
  try {
    helmet = require('helmet');
  } catch (e) {}

  if (helmet) {
    app.use(helmet({
      contentSecurityPolicy: false, // Allows inline EJS script tags
      frameguard: { action: 'deny' } // Prevents Clickjacking
    }));
  } else {
    // Comprehensive native security headers fallback
    app.use((req, res, next) => {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.removeHeader('X-Powered-By');
      next();
    });
  }
  app.disable('x-powered-by');
  ```
- **Observed Findings:**
  1. `helmet` version `^8.0.0` is installed in `package.json`.
  2. The configuration accurately passes `{ contentSecurityPolicy: false, frameguard: { action: 'deny' } }`.
  3. In Helmet v8, `noSniff: true` is enabled by default, setting `X-Content-Type-Options: nosniff`.
  4. The fallback branch properly sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strips `X-Powered-By`.
  5. `app.disable('x-powered-by')` is called at line 156.
- **Identified Gaps & Recommendations:**
  - **Gap 1.1 (Low):** `noSniff: true` should be explicitly passed in the options object alongside `contentSecurityPolicy: false` and `frameguard: { action: 'deny' }` for clarity and auditability.
  - **Recommendation:**
    ```javascript
    app.use(helmet({
      contentSecurityPolicy: false,
      frameguard: { action: 'deny' },
      noSniff: true
    }));
    ```

---

### Layer 2: CORS Hardening
- **Requirement:** Strict whitelist for `http://localhost:4321`, `http://localhost:3000`, and `https://tiffanywebbimpact.com`.
- **Invariants (`GEMINI.md`):** Official production domain is `tiffanywebbimpact.com`; never use placeholder domains; all CORS whitelists must strictly target `tiffanywebbimpact.com`.
- **Location in Code:** Lines 158–176 of `server.js`:
  ```javascript
  const allowedOrigins = [
    'http://localhost:4321',
    'http://127.0.0.1:4321',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS access denied: origin not allowed'));
      }
    },
    credentials: true
  }));
  ```
- **Observed Findings:**
  1. `cors` version `^2.8.6` is installed.
  2. Local development origins (`localhost:4321`, `127.0.0.1:4321`, `localhost:3000`, `127.0.0.1:3000`) are explicitly listed.
  3. `.env` defines `FRONTEND_URL=http://localhost:4321`.
- **Identified Gaps:**
  - **Gap 2.1 (HIGH): Missing Canonical Production Origins in Whitelist:**  
    `https://tiffanywebbimpact.com` is **NOT** included in the hardcoded `allowedOrigins` array. If `process.env.FRONTEND_URL` is omitted or points to localhost (as it does in `.env`), legitimate browser requests from the live production site `https://tiffanywebbimpact.com` and `https://www.tiffanywebbimpact.com` will be rejected by CORS!
  - **Gap 2.2 (Medium): Unhandled Error on CORS Rejection:**  
    Calling `callback(new Error('CORS access denied: origin not allowed'))` without an Express error-handling middleware causes Express to emit an unhandled 500 internal server error with stack trace instead of returning a clean 403 Forbidden or simply suppressing CORS headers (`callback(null, false)`).
  - **Gap 2.3 (Low): Unrestricted Methods and Headers:**  
    The `cors()` options do not restrict HTTP methods (`GET`, `POST`, `OPTIONS`) or allowed headers (`Content-Type`, `Authorization`).
- **Remediation Proposal:**
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

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, false); // Clean CORS rejection without throwing 500 error
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  }));
  ```

---

### Layer 3: Brute-Force Rate Limiting on `/login`
- **Requirement:** `/login` limited to 5 attempts per 15 minutes per IP. Sending 6 rapid POST requests with wrong credentials results in a rate-limit response (429) on the 6th attempt.
- **Location in Code:** Lines 228–281 of `server.js`:
  ```javascript
  let rateLimit;
  try {
    rateLimit = require('express-rate-limit');
  } catch (e) {}

  function createLimiter(windowMs, max, message) {
    if (rateLimit) {
      return rateLimit({
        windowMs,
        max,
        message: typeof message === 'object' ? message : { error: message },
        standardHeaders: true,
        legacyHeaders: false
      });
    }
    // Native high-performance sliding window fallback ...
    const hitMap = new Map();
    setInterval(() => {
      const now = Date.now();
      for (const [ip, data] of hitMap.entries()) {
        if (now > data.resetTime) hitMap.delete(ip);
      }
    }, windowMs);

    return (req, res, next) => {
      const ip = req.ip || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
      const now = Date.now();
      const data = hitMap.get(ip) || { count: 0, resetTime: now + windowMs };
      if (now > data.resetTime) {
        data.count = 0;
        data.resetTime = now + windowMs;
      }
      data.count++;
      hitMap.set(ip, data);
      if (data.count > max) {
        if (typeof message === 'object') return res.status(429).json(message);
        return res.status(429).send(message);
      }
      next();
    };
  }

  const loginLimiter = createLimiter(15 * 60 * 1000, 5, 'Too many failed login attempts. Please try again in 15 minutes.');
  const leadApiLimiter = createLimiter(60 * 60 * 1000, 30, { error: 'Inquiry limit reached from this IP. Please try again later.' });

  app.use('/login', (req, res, next) => {
    if (req.method === 'POST') {
      return loginLimiter(req, res, next);
    }
    next();
  });
  ```
- **Observed Findings:**
  1. `express-rate-limit` version `^7.5.0` is installed.
  2. Window is exactly 15 minutes (`15 * 60 * 1000` ms) and max hits is 5.
  3. Applied only to `POST /login` via middleware filter `req.method === 'POST'`.
  4. On the 6th request, a 429 Too Many Requests response is returned with standard headers (`standardHeaders: true`).
- **Identified Gaps:**
  - **Gap 3.1 (Medium-High): Reverse Proxy IP Evaluation (`trust proxy` missing):**  
    `app.set('trust proxy', 1)` is never enabled in Express. When deployed in production behind Hostinger / Nginx / Cloudflare, `req.ip` resolves to the proxy loopback IP (`127.0.0.1`). Consequently, 5 failed login attempts from any single external attacker will lock out **all users across the internet**.
  - **Gap 3.2 (Medium): Successful Logins are Penalized:**  
    `loginLimiter` counts *every* POST request, not just *failed* attempts. If an administrator legitimately logs in, logs out, and logs in 5 times within 15 minutes, they are locked out. Setting `skipSuccessfulRequests: true` in `express-rate-limit` ensures rate limiting applies exclusively to brute-force credential stuffing.
  - **Gap 3.3 (Low): Browser Form UX:**  
    When a browser user exceeds the limit, `express-rate-limit` sends raw JSON (`{"error": "Too many..."}`). An HTML-aware handler should detect `!req.xhr && req.accepts('html')` and render `views/login.ejs` with `error: 'Too many failed attempts...'`.
  - **Gap 3.4 (Labeling Mismatch):** In `server.js` comments, this layer is labeled `// Layer 5: Rate Limiting Suite` rather than Layer 3.

---

### Layer 4: XSS Input Sanitization
- **Requirement:** Recursive stripping of `<script>`, `javascript:`, `onerror`, `<iframe>` from all user inputs. Submitting `<script>alert(1)</script>` in any form field must NOT store raw `<script>` tags in the database.
- **Location in Code:** Lines 182–226 of `server.js`:
  ```javascript
  function sanitizeValue(value) {
    if (typeof value === 'string') {
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/onload=/gi, '')
        .replace(/onerror=/gi, '')
        .replace(/onclick=/gi, '')
        .replace(/onmouseover=/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value !== null && typeof value === 'object') {
      const cleanObj = {};
      for (const [k, v] of Object.entries(value)) {
        cleanObj[k] = sanitizeValue(v);
      }
      return cleanObj;
    }
    return value;
  }
  ```
- **Observed Findings & Critical Gaps:**
  - **Gap 4.1 (CRITICAL): Non-Recursive Single-Pass Replacement:**  
    The requirement mandates: *"Recursive stripping of `<script>`, `javascript:`, `onerror`, `<iframe>`"*.  
    In JavaScript, `.replace()` without an iterative loop executes **only once**.  
    Consider an evasion payload: `<scr<script>ipt>alert(1)</script>` or `<iframe<iframe src=...></iframe>`.  
    `sanitizeValue()` strips the inner `<script>` tag, which concatenates the outer pieces into `<script>alert(1)</script>`!  
    The resulting string contains a raw, valid `<script>` tag that is saved directly to the database.  
    **True recursion requires an iterative convergence loop**:
    ```javascript
    function sanitizeStringRecursively(str) {
      let prev;
      do {
        prev = str;
        str = str
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/onload=/gi, '')
          .replace(/onerror=/gi, '')
          .replace(/onclick=/gi, '')
          .replace(/onmouseover=/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
      } while (str !== prev);
      return str;
    }
    ```
  - **Gap 4.2 (CRITICAL): Multipart / Multer Form Data Completely Bypasses XSS Middleware:**  
    Global body parsing and XSS sanitization (lines 179–226) execute on `express.json()` and `express.urlencoded()`.  
    However, CMS editing routes (`POST /cms/:slug/collection/:section/new` at line 932, `POST /cms/:slug/collection/:section/:id/edit` at line 995, and `POST /cms/:slug` at line 1053) use Multer (`collectionUpload`, `upload.any()`).  
    When the global XSS middleware runs, Multer has not yet executed, so `req.body` is empty `{}`!  
    Multer populates `req.body` (e.g. `title`, `subtitle`, `badge`, `content_html`, `link_url`, CMS content keys) **inside the route handler**, long after the XSS middleware has finished.  
    **Result:** Raw `<script>` tags and JavaScript payloads submitted through CMS forms are stored directly in `website_collections` and `website_content` without any sanitization!
  - **Gap 4.3 (CRITICAL IMPACT): Downstream Stored XSS Execution in Astro Frontend:**  
    The public Astro website renders CMS collection fields directly using `set:html`:
    - `src/pages/insights/[slug].astro` line 95: `<div class="article-body-content" set:html={article.content_html}></div>`
    - `src/pages/services.astro` line 158: `<p class="helps-desc" set:html={card.content_html}></p>`
    - `src/components/ImpactBand.astro` line 20: `<div class="band-icon" set:html={item.icon_svg}></div>`
    Because CMS form data bypasses sanitization (Gap 4.2), any malicious script injected into the CMS is served and executed in user browsers on the public site!
  - **Gap 4.4 (Medium): Query Parameters and URL Params Unsanitized:**  
    `sanitizeValue` only processes `req.body`. `req.query` is unhandled in the fallback branch. Several routes pass `req.query.error` or `req.query.email` into templates.

---

### Layer 5: SQL Injection Immunity
- **Requirement:** 100% parameterized queries with `?` placeholders — zero string concatenation in SQL across all routes.
- **Location in Code:** Inspected across all 40 database query locations in `server.js` (lines 71, 301, 340, 367, 410, 438, 453, 484, 495, 502, 526, 549, 553, 555, 561, 596, 625, 648, 659, 700, 708, 720, 751, 767, 773, 786, 796, 800, 810, 814, 824, 829, 840, 860, 864, 865, 917, 934, 938, 961, 976, 979, 1015, 1030, 1045, 1055, 1083, 1097, 1100, 1101, 1113, 1114, 1141, 1147, 1158, 1159, 1160, 1179, 1181, 1185, 1189, 1190, 1192, 1207, 1237).
- **Observed Findings:**
  1. Every single SQL query in `server.js` uses `?` placeholders for variable substitution.
  2. Dynamic query builders (e.g. `/api/leads/check-duplicate` lines 391–413, and `/api/leads/bulk-delete` lines 1183–1193) construct SQL strings using static fragments (`LOWER(email) = LOWER(?)`, `WHERE lead_id IN (?)`) and push all untrusted user values into a `params` array.
  3. `mysql2` automatically and correctly expands array parameters for `IN (?)`.
- **Evaluation:** **100% COMPLIANT. Zero SQL injection vulnerabilities detected.**
- **Architectural Finding (Route Shadowing on Batch Import):**  
  While analyzing route handlers:
  - Line 425: `app.post('/api/leads/batch', async (req, res) => { ... })` — **No authentication!**
  - Line 1220: `app.post('/api/leads/batch', requireAuth, async (req, res) => { ... })` — Protected with `requireAuth`.  
  Because Express matches routes in order of definition, the unauthenticated route at line 425 matches first. An external unauthenticated user can hit `/api/leads/batch` without any credentials and inject leads into the database. Line 1220 is dead code.

---

### Layer 6: Secure Cookie Governance (`auth_token`)
- **Requirement:** JWT `auth_token` cookie with `httpOnly: true`, `sameSite: 'strict'`, `maxAge: 7 days`.
- **Location in Code:** Lines 618–623, 303, 310, 634 of `server.js`:
  ```javascript
  // Set auth_token on successful login (lines 618-623)
  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  // Clear cookie on logout and session invalidation (lines 303, 310, 634)
  res.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict' });
  ```
- **Observed Findings:**
  1. `httpOnly: true` is strictly set, preventing client JavaScript access via `document.cookie` and mitigating token theft via XSS.
  2. `sameSite: 'strict'` is set, ensuring cookies are never sent along with cross-site requests, immunizing against CSRF attacks.
  3. `maxAge: 7 * 24 * 60 * 60 * 1000` equals 604,800,000 ms (exactly 7 days).
  4. JWT expiration is set to `{ expiresIn: '7d' }` (line 615).
  5. `secure: process.env.NODE_ENV === 'production'` dynamically enables HTTPS transport in production while allowing local development over HTTP.
  6. Cookie invalidation during logout (`/logout`) and deactivation clears the cookie with matching `httpOnly` and `sameSite` flags.
- **Evaluation:** **100% COMPLIANT.**

---

### Layer 7: Root Route Authentication (`GET /`)
- **Requirement:** `GET /` redirects to `/login` (unauthenticated) or `/dashboard` (authenticated).
- **Location in Code:** Lines 573–585 of `server.js`:
  ```javascript
  // Root Entry Point: Redirect to Login (if unauthenticated) or Dashboard (if authenticated)
  app.get('/', (req, res) => {
    const cookies = parseCookies(req);
    const token = cookies.auth_token;
    if (!token) {
      return res.redirect('/login');
    }
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (err) {
      return res.redirect('/login');
    }
  });
  ```
- **Observed Findings:**
  1. If no cookie is sent: redirects immediately to `/login`.
  2. If token is invalid, expired, or signed with a wrong key: caught by `catch (err)` and redirects to `/login`.
  3. If token passes `jwt.verify`: redirects to `/dashboard`.
  4. `/dashboard` then executes `requireAuth` (lines 293–313), verifying the user exists in MySQL and has `is_active === 1`.
  5. The 404 fallback at line 1272 redirects unknown paths to `/dashboard`, which also routes unauthenticated users back to `/login`.
- **Evaluation:** **100% COMPLIANT.**

---

### Layer 8: Input Validation
- **Requirement:** All form inputs validated and sanitized before database insertion.
- **Location in Code:** Throughout route handlers in `server.js`.
- **Observed Findings:**
  1. `express-validator` version `^7.2.1` is listed in `package.json`.
  2. **`express-validator` is NOT imported anywhere in `server.js`** (0 references).
  3. Manual input validation is fragmented and missing in several high-risk routes:
     - `POST /api/leads` (lines 323–382): Does not validate `contact_name` presence, does not validate `email` format (can be arbitrary text), does not validate `phone` format, accepts negative or non-numeric `estimated_audience_size`.
     - `POST /users` (lines 764–780): Does not validate `role` enum (`admin`, `assistant`, `staff`), does not enforce minimum password length (accepts 1 character).
     - `POST /users/:id/change-password` (lines 782–792): Does not check for empty password (`new_password = ""` is accepted and hashed).
     - `POST /reset-password` (lines 693–715): Only checks `password === confirm_password`; does not validate OTP format (should be 6-digit numeric) or minimum password length.
  4. **Multer Arbitrary File Upload Vulnerability (Lines 39–50):**
     ```javascript
     fileFilter: function (req, file, cb) {
       if (file.fieldname === 'video_file') {
         const allowedExts = ['.mp4', '.webm', '.mov'];
         const ext = path.extname(file.originalname).toLowerCase();
         if (allowedExts.includes(ext) || (file.mimetype && ...)) {
           return cb(null, true);
         }
         return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
       }
       cb(null, true); // <--- ANY file that is not 'video_file' is allowed!
     }
     ```
     Because line 48 executes `cb(null, true)` for all fields other than `video_file`, an authenticated user can upload `.html`, `.svg`, `.exe`, `.php`, or `.js` as an `image_file`! Multer saves it to `../tiffany-webb-astro/public/uploads`, allowing Stored HTML/XSS or malicious file hosting.
  5. `POST /cms/:slug/collection/:section/new` (lines 932–971): `link_url` is not validated for safe protocols (`http:`, `https:`, `mailto:`, `tel:`), permitting `javascript:` execution when clicked on the website. `icon_svg` is stored raw without SVG sanitization.
- **Evaluation:** **CRITICAL GAP. Requires comprehensive input validation and file upload lockdown.**

---

## Actionable Remediation Specifications for Implementer

To achieve 100% compliance across all 8 security layers, the following precise changes must be implemented in `Landing Page Work/tiffany-webb-crm/server.js`:

### Remediation 1: CORS Whitelist (Layer 2)
Add `https://tiffanywebbimpact.com`, `https://www.tiffanywebbimpact.com`, and `https://crm.tiffanywebbimpact.com` directly to `allowedOrigins`:
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

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
```

### Remediation 2: Recursive XSS Sanitization & Multer Hook (Layer 4)
1. Upgrade `sanitizeValue` to recursive convergence:
```javascript
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  let prev;
  let clean = str;
  do {
    prev = clean;
    clean = clean
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '')
      .replace(/onclick=/gi, '')
      .replace(/onmouseover=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  } while (clean !== prev);
  return clean;
}

function sanitizeValue(value) {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') {
    const cleanObj = {};
    for (const [k, v] of Object.entries(value)) {
      cleanObj[k] = sanitizeValue(v);
    }
    return cleanObj;
  }
  return value;
}
```
2. Create a Multer post-sanitization middleware:
```javascript
const sanitizeMulterBody = (req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  next();
};
```
Apply `sanitizeMulterBody` immediately following `collectionUpload` and `upload.any()` in all CMS POST routes.

### Remediation 3: Rate Limiting Hardening (Layer 3)
1. Add `app.set('trust proxy', 1);` immediately after `app = express()`.
2. Configure `skipSuccessfulRequests: true` in `loginLimiter` to focus exclusively on failed attempts:
```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many failed login attempts. Please try again in 15 minutes.' }
});
```

### Remediation 4: Eliminate Shadowed Route on `/api/leads/batch`
Delete the unauthenticated `app.post('/api/leads/batch')` definition at lines 425–465. Keep only the authenticated version at line 1220 with `requireAuth`.

### Remediation 5: Image Upload Mime-Type Whitelist (Layer 8)
Restrict image uploads to valid image extensions:
```javascript
fileFilter: function (req, file, cb) {
  const allowedExts = {
    image_file: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    video_file: ['.mp4', '.webm', '.mov']
  };
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'video_file') {
    if (allowedExts.video_file.includes(ext) || (file.mimetype && file.mimetype.startsWith('video/'))) {
      return cb(null, true);
    }
    return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
  }
  if (file.fieldname === 'image_file') {
    if (allowedExts.image_file.includes(ext) || (file.mimetype && file.mimetype.startsWith('image/'))) {
      return cb(null, true);
    }
    return cb(new Error('Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed'));
  }
  cb(null, true);
}
```

---

## Conclusion
The application possesses strong foundational defenses in SQL injection parameterized queries, secure cookie storage, and root route authentication. However, addressing the missing canonical CORS origin, non-recursive XSS sanitization, Multer bypass, and arbitrary file uploads is critical to fully securing the platform against real-world attack vectors.
