# Handoff Report — explorer_m4_2_1

**Mission**: Investigate the exact remediation for the rate limiting failure on `POST /login` in `Landing Page Work/tiffany-webb-crm/server.js`, setting HTTP 401 on invalid email or password, HTTP 403 on deactivated account, HTTP 400 on missing credentials, HTTP 500 on server error, and verifying how this ensures `data.count` increments so the 6th failed request strictly returns HTTP 429.

---

## 1. Observation

1. **Target Route Handler in `Landing Page Work/tiffany-webb-crm/server.js` (lines 602–640)**:
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
       ...
       await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
       res.redirect('/dashboard');
     } catch (err) {
       console.error(err);
       res.render('login', { error: 'Server error during authentication', success: null });
     }
   });
   ```
   *Direct observation*: Every error branch invokes `res.render('login', { error: ... })` without calling `res.status(...)`. In Express.js, `res.render()` defaults to HTTP status `200 OK`. Missing credentials (`email` or `password` absent) are not pre-validated and fall through to `SELECT * FROM users WHERE email = ?` returning 0 rows with HTTP 200.

2. **Active Limiter Implementation in `server.js` (lines 266–325)**:
   - Line 268 attempts `rateLimit = require('express-rate-limit')` inside a `try/catch`.
   - Inspection of `Landing Page Work/tiffany-webb-crm/node_modules` confirmed `express-rate-limit` is not present in local dependencies (`Found 0 results` for `express-rate-limit`).
   - Therefore, `createLimiter` unconditionally instantiates the **native sliding-window fallback** (lines 282–318):
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
   - Lines 320–325 configure `loginLimiter`:
     ```javascript
     const loginLimiter = createLimiter(
       15 * 60 * 1000,
       5,
       'Too many failed login attempts. Please try again in 15 minutes.',
       { skipSuccessfulRequests: true }
     );
     ```
   - Lines 328–333 attach it to `/login`:
     ```javascript
     app.use('/login', (req, res, next) => {
       if (req.method === 'POST') {
         return loginLimiter(req, res, next);
       }
       next();
     });
     ```
   - *Direct observation*: When `skipSuccessfulRequests: true` is enabled, the limiter defers counting until the `'finish'` event and increments `data.count` if and only if `res.statusCode >= 400`.

3. **Auditor, Reviewer & Challenger Empirical Test Evidence**:
   - `auditor_m4_1/handoff.md` (Observation 4): Executed 10 rapid POST requests with wrong credentials to `http://localhost:3000/login` via `X-Forwarded-For: 198.51.100.99`. All 10 requests returned HTTP status 200. Zero requests were throttled.
   - `challenger_m4_2/handoff.md` & `test/challenger_m4_2_empirical.cjs` (Test `RATE-2.2`): 6 consecutive failed attempts returned status 200 on all 6 attempts; `attempt6Blocked` evaluated to `false`.
   - `ORIGINAL_REQUEST.md` (lines 181 and 208): Explicitly mandates:
     - `3. Brute-Force Rate Limiting: /login limited to 5 attempts per 15 minutes per IP.`
     - `- [ ] Sending 6 rapid POST requests to /login with wrong credentials results in a rate-limit response on the 6th attempt.`

4. **Template View Behavior in `views/login.ejs` (lines 27–32)**:
   ```html
   <% if (typeof error !== 'undefined' && error) { %>
       <div class="alert alert-error">
           <span><%= error %></span>
           <button onclick="this.parentElement.style.display='none'" style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer;">&times;</button>
       </div>
   <% } %>
   ```
   *Direct observation*: `views/login.ejs` relies solely on the `error` template variable to display the user-facing alert. The browser renders the HTML markup identically whether HTTP status is 200, 400, 401, 403, or 500.

---

## 2. Logic Chain

1. **Step 1 (Limiter Evaluation Predicate)**:
   Observation 2 demonstrates that `loginLimiter` operates with `skipSuccessfulRequests: true`. The fallback sliding-window middleware defers recording failed attempts to `res.on('finish')` and tests `if (res.statusCode >= 400)`.

2. **Step 2 (Response Status Code Default in Controller)**:
   Observation 1 demonstrates that `POST /login` calls `res.render('login', ...)` for all error conditions (empty input, missing user, deactivated account, wrong password, catch block error) without invoking `res.status(...)`. By Express specification, un-statused render calls emit HTTP 200 OK.

3. **Step 3 (Counter Increment Failure & Threshold Inaccessibility)**:
   From Steps 1 and 2, when any authentication failure occurs, `res.statusCode` is 200. Because `200 < 400`, the condition `res.statusCode >= 400` evaluates to `false`. Therefore, `data.count++` is never executed, and `hitMap.set(ip, data)` is never called on failed logins. `data.count` remains at 0 indefinitely. Consequently, `data.count >= max` (`0 >= 5`) is never reached, allowing unthrottled brute-force attacks and causing the empirical failure observed in Observation 3.

4. **Step 4 (Remediation via Explicit Status Codes)**:
   If the controller sets:
   - `res.status(400).render(...)` for missing credentials
   - `res.status(401).render(...)` for invalid email or password
   - `res.status(403).render(...)` for deactivated accounts
   - `res.status(500).render(...)` for server errors
   then every failed login emits an HTTP status code `>= 400`.
   On the `'finish'` event, `res.statusCode >= 400` evaluates to `true`.
   `data.count` increments by 1 for each failure.
   After 5 failed attempts, `data.count` equals 5.
   On the 6th attempt, `loginLimiter` detects `data.count >= 5` (`5 >= 5` is `true`) and immediately returns `res.status(429).send(...)`, intercepting the request before the route handler, database, or bcrypt are touched.

5. **Step 5 (Preservation of Successful Login Exemption)**:
   When valid credentials are provided, line 635 executes `res.redirect('/dashboard')`, which emits HTTP status 302 Found.
   Because `302 < 400`, the condition `res.statusCode >= 400` evaluates to `false`.
   `data.count` is NOT incremented.
   Successful logins remain completely exempt from rate limit quotas.

6. **Step 6 (UI Compatibility)**:
   Observation 4 shows that `views/login.ejs` displays the error alert purely based on template variable `error`. Standard web browsers render the HTML body regardless of the 4xx/5xx status code. Therefore, this fix introduces zero visual or functional regression to human users while satisfying transport-layer security requirements.

---

## 3. Caveats

1. **Active Limiter Fallback**: `express-rate-limit` is in `package.json` but not installed in local `node_modules`. All testing and runtime execution currently rely on the native sliding-window fallback in `server.js`. However, the proposed remediation is fully compatible with both the native fallback and `express-rate-limit` v7 (which also relies on `res.statusCode < 400` for `skipSuccessfulRequests`).
2. **Reverse Proxy Header Spoofing**: The limiter uses `req.ip`, which with `trust proxy: 1` respects `X-Forwarded-For`. In production, the upstream reverse proxy (e.g. Hostinger/Nginx/Cloudflare) must ensure client-supplied `X-Forwarded-For` headers are stripped or overwritten with the actual remote address.
3. **Secondary Vulnerabilities**: This handoff focuses primarily on the Rate Limiting Integrity Failure. Secondary audit findings (Multer `video_file` octet-stream bypass at line 44, unauthenticated `POST /api/leads/:id/notes` at line 479, and batch CSV `leads.source` ENUM truncation at line 1254) are documented in Section 5 of `analysis.md` for Worker M4_2 to address concurrently.

---

## 4. Conclusion

The rate limiting failure on `POST /login` is completely understood and directly remediable with zero architectural risk.

### Actionable Remediation Code
Replace lines 602–640 of `Landing Page Work/tiffany-webb-crm/server.js` with:

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
    
    // 5. Successful authentication -> Sign JWT and set secure cookie (HTTP 302 Exempt from rate limiter)
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
    // 6. Server error during authentication -> HTTP 500 Internal Server Error
    res.status(500).render('login', { error: 'Server error during authentication', success: null });
  }
});
```

---

## 5. Verification Method

To independently verify the implementation after Worker M4_2 applies the fix:

1. **Verify 6 Rapid Failed Login Attempts (Acceptance Criterion line 208)**:
   Ensure CRM server is running (`node server.js` on port 3000), then execute:
   ```powershell
   node -e "
   const http = require('http');
   async function test() {
     const testIp = '198.51.100.222';
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
   - **Verification Pass Condition**: Attempts 1 through 5 output `HTTP Status: 401`. Attempt 6 outputs `HTTP Status: 429`.
   - **Invalidation Condition**: Attempt 6 outputs HTTP 200 or HTTP 401 (not rate limited).

2. **Verify Missing Credentials Validation**:
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
       'X-Forwarded-For': '198.51.100.223'
     }
   }, res => {
     console.log('Status:', res.statusCode);
     res.resume();
   });
   req.end();
   "
   ```
   - **Verification Pass Condition**: Outputs `Status: 400`.

3. **Verify Challenger Suite**:
   ```powershell
   cd "D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm"
   node -e "require('./test/challenger_m4_2_empirical.cjs').runEmpiricalSuite()"
   ```
   - **Verification Pass Condition**: `RATE-2.2` passes.
