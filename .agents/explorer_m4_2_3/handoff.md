# Handoff Report — explorer_m4_2_3

**Task**: Investigation and remediation design for:
1. Enforcing authentication on `POST /api/leads/:id/notes` to eliminate unauthenticated administrator identity spoofing.
2. Fixing batch lead source fallback on `POST /api/leads/batch` (line 1254) from `'csv_upload'` to `'manual'` to comply with the MySQL `leads.source` ENUM constraint.

---

## 1. Observation

1. **Unauthenticated Notes Injection in `server.js` (lines 479–507):**
   ```javascript
   app.post('/api/leads/:id/notes', async (req, res) => {
   ...
       const authorName = user ? user.name : (req.session?.user?.name || 'Tiffany Webb (Admin)');
       const authorRole = user ? user.role : (req.session?.user?.role || 'admin');
       const userId = user ? user.id : (req.session?.user?.id || null);

       const [result] = await pool.query(`
         INSERT INTO lead_notes (lead_id, user_id, author_name, author_role, note)
         VALUES (?, ?, ?, ?, ?)
       `, [leadId, userId, authorName, authorRole, note.trim()]);
   ```
   `requireAuth` middleware is completely absent from the route definition. When an unauthenticated caller sends `POST /api/leads/:id/notes` with body `{"note":"..."}` and no auth cookies, `user` is `undefined`, triggering lines 500–502 to forge the author as `'Tiffany Webb (Admin)'` with role `'admin'`.

2. **Existing Protected Route Precedents in `server.js`:**
   Inspection of `server.js` confirms that all other administrative endpoints are guarded by `requireAuth`:
   - Line 437: `app.get('/api/leads/check-duplicate', requireAuth, ...)`
   - Line 1051: `app.post('/api/pages/:id/toggle', requireAuth, ...)`
   - Line 1184: `app.post('/api/leads/bulk-delete', requireAuth, ...)`
   - Line 1229: `app.post('/api/leads/batch', requireAuth, ...)`

3. **`requireAuth` Implementation in `server.js` (lines 345–365):**
   ```javascript
   const requireAuth = async (req, res, next) => {
     const cookies = parseCookies(req);
     const token = cookies.auth_token;
     if (!token) {
       return res.redirect('/login');
     }
     try {
       const decoded = jwt.verify(token, JWT_SECRET);
       const [users] = await pool.query('SELECT id, name, email, role, is_active FROM users WHERE id = ?', [decoded.id]);
       if (users.length === 0 || !users[0].is_active) {
         res.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict' });
         return res.redirect('/login?error=' + encodeURIComponent('Session expired or account deactivated'));
       }
       req.user = users[0];
       res.locals.currentUser = users[0];
       next();
     } catch (err) {
       res.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict' });
       return res.redirect('/login');
     }
   };
   ```
   `requireAuth` verifies the JWT token against the `users` table, sets `req.user`, and redirects unauthenticated or invalid sessions to `/login` with HTTP status 302.

4. **Challenger Assertion on `requireAuth` (`test/challenger_m4_2_empirical.cjs` lines 437, 461):**
   ```javascript
   const unauthBlocked = (unauthBatchRes.statusCode === 302 && unauthBatchRes.headers.location === '/login');
   const forgedBlocked = (forgedBatchRes.statusCode === 302 && forgedBatchRes.headers.location === '/login');
   ```
   The project's test suite strictly asserts that `requireAuth` returns HTTP 302 to `/login`. Modifying global `requireAuth` to return HTTP 401 across all API routes would break these empirical test assertions.

5. **Frontend Notes Logic in `views/dashboard.ejs` (lines 594–616):**
   `postLeadNote` and `loadLeadNotes` currently call `fetch()` without checking `res.status === 401` or `res.redirected`. If redirected to `/login`, `fetch` follows to the HTML page, causing `res.json()` to fail with a syntax error and displaying a misleading `"Server error saving note"` alert.

6. **Defective Test Codifying Security Flaw (`test/tier3_cross_feature_interactions.test.cjs` lines 53–61):**
   ```javascript
   it('T3.2: Unauthenticated note creation falls back safely to default identity or session', async () => {
     const noteText = 'Headless note without auth cookie.';
     const res = await http.post(`/api/leads/${testLead1.id}/notes`, { note: noteText }, {});
     expect(res.status).toBe(200);
     expect(res.json.success).toBe(true);
     expect(res.json.note.author_name).toContain('Tiffany Webb');
     expect(res.json.note.author_role).toBe('admin');
   });
   ```
   This legacy test expects unauthenticated requests to succeed with spoofed admin credentials. It will fail once `requireAuth` is mounted.

7. **Batch Lead Fallback in `server.js` (line 1254):**
   ```javascript
   lead.source || 'csv_upload',
   ```

8. **Database Schema Definition (`db/schema.sql` line 19 & `database/schema.sql` line 19):**
   ```sql
   source ENUM('website_form','whatsapp','instagram','email','referral','manual') NOT NULL,
   ```
   The column `source` is an ENUM restricted to `'website_form'`, `'whatsapp'`, `'instagram'`, `'email'`, `'referral'`, and `'manual'`. The value `'csv_upload'` is NOT a member of this ENUM.

9. **Challenger Empirical Verification of Error 1265 (`challenger_m4_2_empirical.cjs` line 558):**
   `test/challenger_m4_2_empirical.cjs` Suite 4 Test 4.4 confirmed:
   ```
   Error: Data truncated for column 'source' at row 1
   code: 'WARN_DATA_TRUNCATED', errno: 1265, sqlState: '01000'
   ```
   Returning HTTP 500: `{"error": "Database error processing batch"}`.

10. **Frontend CSV Upload in `views/new-lead.ejs` (lines 394–403):**
    `processParsedData` extracts contact info from CSV/Excel files but does NOT supply a `source` property. Therefore, every batch upload from the Impact OS UI currently defaults to `'csv_upload'` and crashes.

---

## 2. Logic Chain

1. **Notes Authentication (Problem 1)**:
   - Observation 1 proves that `POST /api/leads/:id/notes` does not authenticate callers and falls back to `'Tiffany Webb (Admin)'`.
   - Observation 2 demonstrates that every other sensitive API in `server.js` relies on `requireAuth`.
   - Observation 3 confirms `requireAuth` verifies the database user and populates `req.user`.
   - Observation 4 shows that the test suite expects `requireAuth` to return HTTP 302 to `/login`.
   - Observation 5 reveals that checking `if (res.status === 401 || res.redirected)` in `dashboard.ejs` allows the frontend to handle both HTTP 302 redirects and HTTP 401 status codes gracefully by redirecting to `/login` with an expiration message.
   - Observation 6 indicates that test `T3.2` in `tier3_cross_feature_interactions.test.cjs` must be updated from expecting HTTP 200 with admin identity to expecting HTTP 302 redirect to `/login`.
   - **Conclusion on Problem 1**: Mounting `requireAuth` on `POST /api/leads/:id/notes`, deleting lines 487–503 in favor of `req.user`, updating `dashboard.ejs` for redirect/401 handling, and updating test `T3.2` completely eliminates admin impersonation while preserving architectural consistency.

2. **Batch Import ENUM Compliance (Problem 2)**:
   - Observation 7 shows line 1254 defaults to `'csv_upload'`.
   - Observation 8 shows that the MySQL schema strictly prohibits any value outside `('website_form','whatsapp','instagram','email','referral','manual')`.
   - Observation 9 confirms that omitting `source` causes MySQL to throw `WARN_DATA_TRUNCATED` (errno 1265) and abort the batch with HTTP 500.
   - Observation 10 shows that UI spreadsheet imports omit `source`, meaning all user imports currently fail.
   - Line 1255 already supplies `source_section = 'Batch CSV Import'`, so setting `source = 'manual'` preserves full traceability while respecting the relational constraint.
   - **Conclusion on Problem 2**: Changing line 1254 from `lead.source || 'csv_upload'` to `(lead.source && ['website_form','whatsapp','instagram','email','referral','manual'].includes(lead.source)) ? lead.source : 'manual'` immediately resolves the MySQL truncation error and allows batch imports to succeed.

---

## 3. Caveats

- **GET /api/leads/:id/notes**: Currently `GET /api/leads/:id/notes` (lines 533–546) does not enforce authentication. While securing `GET` is good practice, existing test suites (`tier2` line 200 and `tier3` line 70) call `GET /api/leads/:id/notes` without session cookies. Adding `requireAuth` to `GET` would break these tests unless test suites are simultaneously updated. The dispatch mandate specifically targets `POST /api/leads/:id/notes`.
- **Database Schema Migration**: An alternative to changing line 1254 would be running `ALTER TABLE leads MODIFY COLUMN source ENUM(..., 'csv_upload')`. However, changing server code to use `'manual'` is zero-risk, requires no database alterations, and is immediately compatible with all existing environments and documentation.

---

## 4. Conclusion

1. **Remediation for `POST /api/leads/:id/notes`**:
   - In `server.js` line 479: Change to `app.post('/api/leads/:id/notes', requireAuth, async (req, res) => {`.
   - In `server.js` lines 487–503: Replace fallback logic with:
     ```javascript
     const authorName = req.user.name;
     const authorRole = req.user.role;
     const userId = req.user.id;
     ```
   - In `views/dashboard.ejs` lines 550 and 604: Add check `if (res.status === 401 || res.redirected)` to redirect top-level window to `/login?error=Session+expired`.
   - In `test/tier3_cross_feature_interactions.test.cjs` lines 53–61: Update `T3.2` to assert `res.status === 302` and `res.location === '/login'`.

2. **Remediation for `POST /api/leads/batch`**:
   - In `server.js` line 1254: Change `lead.source || 'csv_upload'` to:
     ```javascript
     (lead.source && ['website_form','whatsapp','instagram','email','referral','manual'].includes(lead.source)) ? lead.source : 'manual',
     ```
   - In `views/new-lead.ejs` line 395: Explicitly include `source: 'manual'` in `processParsedData`.

---

## 5. Verification Method

To independently verify these remediations:

1. **Verify Unauthenticated Notes Route Blocked (HTTP 302 / 401):**
   ```powershell
   node -e "
   const http = require('http');
   const postData = JSON.stringify({ note: 'Adversarial unauth test' });
   const req = http.request({
     hostname: '127.0.0.1', port: 3000, path: '/api/leads/1/notes', method: 'POST',
     headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
   }, res => {
     console.log('Unauthenticated Status:', res.statusCode);
     console.log('Location:', res.headers.location);
   });
   req.write(postData); req.end();
   "
   ```
   *Expected result after fix:* Status `302`, Location `/login`. Zero rows inserted into `lead_notes` or `activity_log`.

2. **Verify Batch Import Fallback with MySQL ENUM:**
   ```powershell
   cd 'D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm'
   node -e "require('./test/challenger_m4_2_empirical.cjs').runEmpiricalSuite()"
   ```
   *Expected result after fix:* Test `BATCH-4.4` (`Schema consistency: POST /api/leads/batch with default fallback source succeeds without ENUM truncation error`) will report **PASS** with status `200` and `dbInsertedCount: 1`.

3. **Verify Master E2E Test Suite:**
   ```powershell
   cd 'D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm'
   node test/run_e2e_suite.cjs
   ```
   *Expected result:* All 4 tiers pass cleanly.
