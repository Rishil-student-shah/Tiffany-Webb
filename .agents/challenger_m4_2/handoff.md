# Challenger Handoff Report — Milestone 4 Instance 2 (challenger_m4_2)

**Mission**: Empirically test and challenge:
1. SQL injection immunity across all queries.
2. Login rate limiting behavior (5 failed attempts per 15 min) and trust proxy.
3. Cookie security attributes and root redirect behavior.
4. Route protection on `/api/leads/batch`.

**Verdict**: **DISPROVEN** (Acceptance criterion for 6th failed login rate-limit response failed empirically; functional schema defect identified on `/api/leads/batch`).

---

## 1. Observation

### 1.1 SQL Injection Immunity
- **Source Inspection (`Landing Page Work/tiffany-webb-crm/server.js`)**:
  - Exactly 65 `pool.query` call sites exist across `server.js`.
  - All 65 calls use MySQL parameterized queries with `?` placeholders for untrusted user inputs.
  - In line 463:
    ```javascript
    const [matches] = await pool.query(
      `SELECT id, contact_name, email, phone, status, organization_name, created_at FROM leads WHERE ${conditions.join(' OR ')} ORDER BY created_at DESC LIMIT 1`,
      params
    );
    ```
    Inspection of lines 446, 452, 455 confirms `conditions` contains exclusively static SQL fragments (`'LOWER(email) = LOWER(?)'`, `"REPLACE(...) LIKE ?"`, `'phone = ?'`), while user-provided strings are appended exclusively to the `params` array.
  - In line 1123:
    ```javascript
    await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [req.params.id, 'status_changed', `Status updated to ${status}`]);
    ```
    The template literal `` `Status updated to ${status}` `` is passed as the 3rd parameter in the values array, binding it as a literal string parameter to MySQL without modifying the SQL query AST.
- **Empirical Execution (`test/challenger_m4_2_empirical.cjs`)**:
  - Test `SQL-1.2` (Authentication bypass payloads: `' OR '1'='1`, `admin' --`, `' UNION SELECT ...`, `1' OR '1'='1' #`): Returned 0 rows; authentication bypass failed.
  - Test `SQL-1.3` (Duplicate check injection: `email: "' OR '1'='1"`, `phone: "1; DROP TABLE leads;--"`): Returned 0 rows; no tables dropped.
  - Test `SQL-1.4` (Numeric ID injection: `1 OR 1=1`, `1; DROP TABLE leads;--`, `1' UNION SELECT ...`): Parameterized safely; no unintended row leakage.
  - Test `SQL-1.5` (Bulk delete status injection: `status: "new' OR '1'='1"`): Treated as literal string; 0 rows deleted, table count preserved.
  - Test `SQL-1.7` (`SHOW TABLES LIKE 'leads'`): Table `leads` remains intact.

### 1.2 Rate Limiting Behavior on POST /login & Trust Proxy
- **Source Inspection (`Landing Page Work/tiffany-webb-crm/server.js`)**:
  - Line 14:
    ```javascript
    app.set('trust proxy', 1);
    ```
  - Lines 320-325:
    ```javascript
    const loginLimiter = createLimiter(
      15 * 60 * 1000,
      5,
      'Too many failed login attempts. Please try again in 15 minutes.',
      { skipSuccessfulRequests: true }
    );
    ```
  - Lines 305-311 (Native fallback rate limiter):
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
  - Lines 605-618 (POST `/login` handler):
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
- **Empirical Execution (`test/challenger_m4_2_empirical.cjs`)**:
  - Test `RATE-2.2`: Sent 6 consecutive POST requests to `http://127.0.0.1:3000/login` with invalid credentials from a dedicated test IP via `X-Forwarded-For: 198.51.100.70`.
  - Tool Output:
    ```
    Attempt 1: status 200, isRateLimited: false
    Attempt 2: status 200, isRateLimited: false
    Attempt 3: status 200, isRateLimited: false
    Attempt 4: status 200, isRateLimited: false
    Attempt 5: status 200, isRateLimited: false
    Attempt 6: status 200, isRateLimited: false
    ```
  - Acceptance criterion requirement from `ORIGINAL_REQUEST.md` line 208:
    > `- [ ] Sending 6 rapid POST requests to /login with wrong credentials results in a rate-limit response on the 6th attempt.`
  - Direct Result: **FAILED**. The 6th request returned HTTP 200, not HTTP 429.

### 1.3 Cookie Security Attributes & Root Redirect Behavior
- **Source Inspection (`Landing Page Work/tiffany-webb-crm/server.js`)**:
  - Lines 627-632:
    ```javascript
    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    ```
  - Lines 582-594:
    ```javascript
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
- **Empirical Execution (`test/challenger_m4_2_empirical.cjs`)**:
  - Test `COOKIE-3.1`: Successful login yielded `Set-Cookie: auth_token=...; Max-Age=604800; Path=/; Expires=...; HttpOnly; SameSite=Strict`. All 3 attributes verified.
  - Test `ROOT-3.2`: `GET /` without cookie returned HTTP 302 with `Location: /login`.
  - Test `ROOT-3.3`: `GET /` with forged JWT returned HTTP 302 with `Location: /login`.
  - Test `ROOT-3.4`: `GET /` with valid authenticated JWT returned HTTP 302 with `Location: /dashboard`.

### 1.4 Route Protection and Schema Consistency on /api/leads/batch
- **Source Inspection (`Landing Page Work/tiffany-webb-crm/server.js`)**:
  - Line 1229:
    ```javascript
    app.post('/api/leads/batch', requireAuth, async (req, res) => { ... });
    ```
  - Lines 1253-1255:
    ```javascript
    lead.source || 'csv_upload',
    lead.source_section || 'Batch CSV Import',
    ```
- **Database Schema Inspection (`Landing Page Work/tiffany-webb-crm/db/schema.sql` line 19)**:
  ```sql
  source ENUM('website_form','whatsapp','instagram','email','referral','manual') NOT NULL,
  ```
- **Empirical Execution (`test/challenger_m4_2_empirical.cjs`)**:
  - Test `BATCH-4.1`: Unauthenticated `POST /api/leads/batch` returned HTTP 302 with `Location: /login`; 0 rows inserted into MySQL.
  - Test `BATCH-4.2`: `POST /api/leads/batch` with forged token returned HTTP 302 with `Location: /login`; 0 rows inserted into MySQL.
  - Test `BATCH-4.3`: Authenticated `POST /api/leads/batch` with explicit valid enum `source: 'manual'` returned HTTP 200 `{ success: true, count: 1 }`; row verified in database.
  - Test `BATCH-4.4`: Authenticated `POST /api/leads/batch` with omitted source (triggering default `lead.source || 'csv_upload'`) threw:
    ```
    Error: Data truncated for column 'source' at row 1
    code: 'WARN_DATA_TRUNCATED', errno: 1265, sqlState: '01000'
    ```
    Returning HTTP 500: `{"error": "Database error processing batch"}`.

---

## 2. Logic Chain

1. **SQL Injection Immunity**:
   - Observations 1.1 confirm that all 65 SQL queries in `server.js` utilize parameter substitution placeholders (`?`).
   - Dynamic tests against MySQL with SQL injection payloads demonstrated zero syntax breakages, zero authentication bypasses, zero row leakages, and zero schema mutations.
   - Therefore, SQL injection immunity is **CONFIRMED**.

2. **Login Rate Limiting Flaw**:
   - `loginLimiter` specifies `{ skipSuccessfulRequests: true }`.
   - In `express-rate-limit` and the native sliding window fallback (Observation 1.2), `skipSuccessfulRequests` instructs the limiter to only count requests where `res.statusCode >= 400` (skipping status codes `< 400`).
   - In Express, `res.render('login', { error: ... })` defaults to HTTP 200 OK.
   - When an invalid password or email is submitted, the server renders the login view with HTTP 200.
   - Because HTTP 200 is `< 400`, `res.statusCode >= 400` evaluates to `false`, and the request counter is NEVER incremented.
   - Consequently, 6 rapid invalid login attempts returned HTTP 200 across all 6 attempts, failing the acceptance criterion requiring an HTTP 429 response on attempt 6.
   - Therefore, login rate limiting behavior is **DISPROVEN / VULNERABLE**.

3. **Cookie Security Attributes & Root Redirect**:
   - The emitted `Set-Cookie` header includes `HttpOnly`, `SameSite=Strict`, and `Max-Age=604800` (Observation 1.3).
   - Unauthenticated and forged requests to `/` redirect to `/login`, while authenticated requests redirect to `/dashboard`.
   - Therefore, cookie security and root redirect behavior are **CONFIRMED**.

4. **Route Protection & Batch Upload Schema Defect**:
   - Unauthenticated and forged requests to `/api/leads/batch` are intercepted by `requireAuth` and redirected to `/login` without database writes.
   - Therefore, route protection on `/api/leads/batch` is **CONFIRMED**.
   - However, when authenticated, batch CSV uploads that rely on the default fallback `lead.source || 'csv_upload'` fail with HTTP 500 because `'csv_upload'` is not defined in the `leads.source` MySQL ENUM (`'website_form','whatsapp','instagram','email','referral','manual'`).

---

## 3. Caveats

- **Network Environment**: Testing was conducted against `http://127.0.0.1:3000` with simulated `X-Forwarded-For` proxy headers. In an actual reverse proxy deployment (such as Cloudflare or Nginx), the proxy must be configured to overwrite `X-Forwarded-For` with the true client IP to prevent client IP spoofing.
- **Scope Limit**: Only routes and middleware specified in Milestone 4 R4 and the dispatch instructions were challenged. Other endpoints (such as `/forgot-password` OTP generation) were not evaluated for rate limiting.

---

## 4. Conclusion

Overall Milestone 4 Verdict: **DISPROVEN**.

While SQL injection immunity, cookie security attributes, root route redirects, and route protection on `/api/leads/batch` are robustly implemented and verified, two defects must be resolved:

1. **Defect 1 (Security - Rate Limiter Bypass)**:
   - **Root Cause**: `POST /login` renders error views with HTTP 200 rather than an HTTP 4xx status code (such as HTTP 401 Unauthorized), causing `loginLimiter` with `skipSuccessfulRequests: true` to ignore all failed login attempts.
   - **Remediation**: In `server.js` `POST /login`, return `res.status(401).render('login', { error: 'Invalid email or password', success: null })` for failed credentials and deactivated accounts.

2. **Defect 2 (Functional - Batch CSV ENUM Constraint Violation)**:
   - **Root Cause**: `server.js` line 1254 sets `lead.source || 'csv_upload'`, but MySQL `leads.source` ENUM does not include `'csv_upload'`.
   - **Remediation**: Either update `server.js` line 1254 to fallback to `'manual'` (e.g. `lead.source || 'manual'`), or execute an ALTER TABLE schema migration to add `'csv_upload'` to `leads.source` ENUM.

---

## 5. Verification Method

To independently reproduce and verify these findings, run the co-located empirical challenger suite:

```powershell
cd "D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm"
node -e "require('./test/challenger_m4_2_empirical.cjs').runEmpiricalSuite()"
```

### Invalidation Conditions
- Defect 1 is invalidated if sending 6 rapid POST requests with wrong credentials to `http://127.0.0.1:3000/login` returns HTTP 429 on the 6th attempt.
- Defect 2 is invalidated if an authenticated POST request to `http://127.0.0.1:3000/api/leads/batch` with `{ "leads": [{ "contact_name": "Test Lead" }] }` (omitting `source`) returns HTTP 200 without a MySQL error 1265.
