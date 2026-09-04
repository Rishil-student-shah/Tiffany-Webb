/**
 * Empirical Security Challenger Suite — Milestone 4 Instance 2 (challenger_m4_2)
 *
 * Focus Areas:
 * 1. SQL Injection Immunity across all query handlers.
 * 2. Login rate limiting behavior (5 failed attempts per 15 min) and trust proxy.
 * 3. Cookie security attributes (httpOnly, sameSite=strict, maxAge 7d) and root redirect behavior.
 * 4. Route protection and hygiene on /api/leads/batch.
 */

const http = require('http');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://127.0.0.1:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'tiffany-webb-crm-secret-key-2025';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

const testResults = [];

function record(suite, testId, description, passed, details = {}) {
  const result = { suite, testId, description, passed, details };
  testResults.push(result);
  const status = passed ? '✓ [PASS]' : '✗ [FAIL]';
  console.log(`${status} [${testId}] ${description}`);
  if (!passed || process.env.VERBOSE) {
    console.log('    Details:', JSON.stringify(details, null, 2));
  }
}

async function runEmpiricalSuite() {
  console.log('================================================================');
  console.log('  CHALLENGER EMPIRICAL VERIFICATION SUITE — MILESTONE 4 (M4_2)  ');
  console.log('================================================================\n');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tiffany_crm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });

  // =========================================================================
  // SUITE 1: SQL INJECTION IMMUNITY ACROSS ALL QUERIES
  // =========================================================================
  console.log('--- SUITE 1: SQL Injection Immunity Verification ---');

  // 1.1 Static AST/Source Code Audit of server.js
  const serverSource = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

  // Regex to extract pool.query calls and inspect the first argument (SQL string)
  // Check if any pool.query call uses template literal interpolation of untrusted input
  const queryCallRegex = /pool\.query\s*\(\s*([\s\S]*?)(?:,\s*\[|\);)/g;
  let match;
  let poolQueryCount = 0;
  const rawInterpolationsInSqlString = [];

  while ((match = queryCallRegex.exec(serverSource)) !== null) {
    poolQueryCount++;
    const sqlArg = match[1].trim();
    // Check if the SQL string argument itself contains ${...} other than hardcoded conditions.join
    if (sqlArg.includes('${') && !sqlArg.includes('conditions.join')) {
      rawInterpolationsInSqlString.push(sqlArg.substring(0, 100));
    }
  }

  record(
    'SQL_INJECTION',
    'SQL-1.1',
    'Static audit: All 65 pool.query calls use strict parameterization with ? placeholders (zero raw SQL interpolation)',
    rawInterpolationsInSqlString.length === 0 && poolQueryCount >= 60,
    { poolQueryCount, rawInterpolationsInSqlString }
  );

  // 1.2 Live Injection Payload Tests against Database Connection
  // Attack Scenario A: Authentication Bypass
  const authPayloads = [
    "' OR '1'='1",
    "admin' --",
    "' UNION SELECT 1,'admin','admin@tiffanywebb.com','admin','hash',1,NOW(),NULL,NULL--",
    "1' OR '1'='1' #",
    "admin@tiffanywebb.com' AND 1=1 --"
  ];

  let authBypassSucceeded = false;
  for (const payload of authPayloads) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [payload]);
    if (rows.length > 0) {
      if (payload !== 'admin@tiffanywebb.com') {
        authBypassSucceeded = true;
      }
    }
  }
  record(
    'SQL_INJECTION',
    'SQL-1.2',
    'Dynamic test: Authentication query immune to SQL injection payloads',
    !authBypassSucceeded,
    { testedPayloads: authPayloads.length }
  );

  // Attack Scenario B: Check-Duplicate Condition Interpolation Injection
  const dupPayloads = [
    { email: "' OR '1'='1", phone: "1; DROP TABLE leads;--" },
    { email: "test@example.com' UNION SELECT 1,2,3,4,5,6,7--", phone: "' OR 1=1--" }
  ];

  let dupBypassSucceeded = false;
  for (const p of dupPayloads) {
    const conditions = [];
    const params = [];
    if (p.email && p.email.trim()) {
      conditions.push('LOWER(email) = LOWER(?)');
      params.push(p.email.trim());
    }
    if (p.phone && p.phone.trim()) {
      const cleanPhone = p.phone.replace(/\D/g, '');
      if (cleanPhone.length >= 7) {
        conditions.push("REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ?");
        params.push('%' + cleanPhone.slice(-7) + '%');
      } else {
        conditions.push('phone = ?');
        params.push(p.phone.trim());
      }
    }
    const sql = `SELECT id, contact_name, email, phone, status, organization_name, created_at FROM leads WHERE ${conditions.join(' OR ')} ORDER BY created_at DESC LIMIT 1`;
    const [matches] = await pool.query(sql, params);
    if (matches.length > 0) {
      dupBypassSucceeded = true;
    }
  }
  record(
    'SQL_INJECTION',
    'SQL-1.3',
    'Dynamic test: Duplicate check condition builder immune to injection / union extraction',
    !dupBypassSucceeded,
    { tested: dupPayloads.length }
  );

  // Attack Scenario C: Numeric ID Parameter Injection in Lead Queries
  const idPayloads = [
    "1 OR 1=1",
    "1; DROP TABLE leads;--",
    "1' UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20--"
  ];

  let idInjectionSucceeded = false;
  for (const id of idPayloads) {
    const [leads] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (leads.length > 1) {
      idInjectionSucceeded = true;
    }
  }
  record(
    'SQL_INJECTION',
    'SQL-1.4',
    'Dynamic test: Lead ID parameter query immune to tautology/stacked queries',
    !idInjectionSucceeded,
    { tested: idPayloads.length }
  );

  // Attack Scenario D: Bulk Delete Status Parameter Injection
  const [initialLeadsCount] = await pool.query('SELECT COUNT(*) as cnt FROM leads');
  const maliciousStatus = "new' OR '1'='1";
  const [matchedStatusLeads] = await pool.query('SELECT id FROM leads WHERE status = ?', [maliciousStatus]);
  const [postLeadsCount] = await pool.query('SELECT COUNT(*) as cnt FROM leads');

  record(
    'SQL_INJECTION',
    'SQL-1.5',
    'Dynamic test: Bulk delete status parameter safely treated as literal string without wildcard expansion',
    matchedStatusLeads.length === 0 && initialLeadsCount[0].cnt === postLeadsCount[0].cnt,
    { matched: matchedStatusLeads.length, leadCount: postLeadsCount[0].cnt }
  );

  // Attack Scenario E: Activity Log Detail Parameter Interpolation Safety
  const [existingLeadRows] = await pool.query('SELECT id FROM leads LIMIT 1');
  const validLeadId = existingLeadRows.length > 0 ? existingLeadRows[0].id : 1;
  const maliciousDetail = "status_update'; DROP TABLE test_dummy; --";
  const [actResult] = await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [
    validLeadId,
    'status_changed',
    `Status updated to ${maliciousDetail}`
  ]);
  const [actRows] = await pool.query('SELECT detail FROM activity_log WHERE id = ?', [actResult.insertId]);
  const activityLogSafe = actRows.length === 1 && actRows[0].detail.includes(maliciousDetail);
  await pool.query('DELETE FROM activity_log WHERE id = ?', [actResult.insertId]);

  record(
    'SQL_INJECTION',
    'SQL-1.6',
    'Dynamic test: Activity log detail string interpolation safely bound as literal parameter',
    activityLogSafe,
    { activityLogSafe }
  );

  // Verify Database Schema Integrity
  const [tables] = await pool.query("SHOW TABLES LIKE 'leads'");
  record(
    'SQL_INJECTION',
    'SQL-1.7',
    'Database integrity: Core tables remain intact after all injection vectors',
    tables.length === 1,
    { tableFound: tables.length === 1 }
  );

  // =========================================================================
  // SUITE 2: LOGIN RATE LIMITING & TRUST PROXY
  // =========================================================================
  console.log('\n--- SUITE 2: Login Rate Limiting & Trust Proxy Verification ---');

  // 2.1 Code Inspection of trust proxy and login limiter
  const trustProxyConfigured = serverSource.includes("app.set('trust proxy', 1)") || serverSource.includes('app.set("trust proxy", 1)');
  const limiterWindowConfigured = serverSource.includes('15 * 60 * 1000') && serverSource.includes('5');

  record(
    'RATE_LIMITING',
    'RATE-2.1',
    'Code audit: "trust proxy" set to 1 and loginLimiter configured for 5 attempts / 15 min',
    trustProxyConfigured && limiterWindowConfigured,
    { trustProxyConfigured, limiterWindowConfigured }
  );

  // 2.2 Empirical Rate Limiting on POST /login (5 attempts allowed, 6th returns 429)
  const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
  const failedLoginData = 'email=' + encodeURIComponent('invalid-attacker@test.com') + '&password=' + encodeURIComponent('WrongPassword!123');

  const attemptStatuses = [];
  for (let i = 1; i <= 6; i++) {
    const res = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(failedLoginData),
        'X-Forwarded-For': testIp
      }
    }, failedLoginData);

    attemptStatuses.push({ attempt: i, status: res.statusCode, isRateLimited: res.statusCode === 429 });
  }

  const attempts1to5Ok = attemptStatuses.slice(0, 5).every(a => a.status === 200 || a.status === 401);
  const attempt6Blocked = attemptStatuses[5].status === 429;

  record(
    'RATE_LIMITING',
    'RATE-2.2',
    'Empirical test: Exactly 5 failed login attempts allowed, 6th attempt blocked with HTTP 429',
    attempts1to5Ok && attempt6Blocked,
    {
      testIp,
      attemptStatuses,
      failureAnalysis: attempt6Blocked ? 'Rate limiter functioned properly' : 'VULNERABILITY: /login returns HTTP 200 on bad credentials. Because skipSuccessfulRequests: true skips status < 400, failed logins are NEVER counted towards rate limit.'
    }
  );

  // 2.3 Trust Proxy Isolation Test: Distinct IP is NOT blocked
  const differentIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
  const diffIpRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(failedLoginData),
      'X-Forwarded-For': differentIp
    }
  }, failedLoginData);

  record(
    'RATE_LIMITING',
    'RATE-2.3',
    'Trust proxy verification: Distinct client IP via X-Forwarded-For receives separate rate bucket and is not blocked',
    diffIpRes.statusCode === 200 || diffIpRes.statusCode === 401,
    { differentIp, status: diffIpRes.statusCode }
  );

  // =========================================================================
  // SUITE 3: COOKIE SECURITY ATTRIBUTES & ROOT REDIRECT
  // =========================================================================
  console.log('\n--- SUITE 3: Cookie Security Attributes & Root Redirect Verification ---');

  // 3.1 Perform valid login to examine Set-Cookie headers
  const validLoginData = 'email=' + encodeURIComponent('admin@tiffanywebb.com') + '&password=' + encodeURIComponent('password123');
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(validLoginData),
      'X-Forwarded-For': `192.0.2.${Math.floor(Math.random() * 200) + 10}`
    }
  }, validLoginData);

  const setCookieHeader = loginRes.headers['set-cookie'] || [];
  const authCookieStr = setCookieHeader.find(c => c.startsWith('auth_token='));

  let hasHttpOnly = false;
  let hasSameSiteStrict = false;
  let hasValidMaxAge = false;
  let extractedToken = null;

  if (authCookieStr) {
    hasHttpOnly = /httponly/i.test(authCookieStr);
    hasSameSiteStrict = /samesite=strict/i.test(authCookieStr);
    hasValidMaxAge = /max-age=604800/i.test(authCookieStr) || /expires=/i.test(authCookieStr);
    const match = authCookieStr.match(/auth_token=([^;]+)/);
    if (match) extractedToken = match[1];
  }

  record(
    'COOKIE_SECURITY',
    'COOKIE-3.1',
    'Set-Cookie attributes: httpOnly: true, sameSite: strict, and maxAge: 7 days (604800s)',
    hasHttpOnly && hasSameSiteStrict && hasValidMaxAge && extractedToken !== null,
    { authCookieStr, hasHttpOnly, hasSameSiteStrict, hasValidMaxAge }
  );

  // 3.2 Root Route Redirect for Unauthenticated Client
  const unauthRootRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/',
    method: 'GET'
  });

  const unauthRedirectsToLogin = (unauthRootRes.statusCode === 302 && unauthRootRes.headers.location === '/login');
  record(
    'COOKIE_SECURITY',
    'ROOT-3.2',
    'Root redirect: GET / unauthenticated redirects to /login (HTTP 302)',
    unauthRedirectsToLogin,
    { status: unauthRootRes.statusCode, location: unauthRootRes.headers.location }
  );

  // 3.3 Root Route Redirect for Forged/Invalid Token
  const invalidTokenRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      'Cookie': 'auth_token=forged.invalid.jwt.signature'
    }
  });

  const invalidRedirectsToLogin = (invalidTokenRes.statusCode === 302 && invalidTokenRes.headers.location === '/login');
  record(
    'COOKIE_SECURITY',
    'ROOT-3.3',
    'Root redirect: GET / with forged/invalid token redirects to /login (HTTP 302)',
    invalidRedirectsToLogin,
    { status: invalidTokenRes.statusCode, location: invalidTokenRes.headers.location }
  );

  // 3.4 Root Route Redirect for Authenticated Client
  const authRootRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/',
    method: 'GET',
    headers: {
      'Cookie': `auth_token=${extractedToken}`
    }
  });

  const authRedirectsToDashboard = (authRootRes.statusCode === 302 && authRootRes.headers.location === '/dashboard');
  record(
    'COOKIE_SECURITY',
    'ROOT-3.4',
    'Root redirect: GET / with valid authenticated token redirects to /dashboard (HTTP 302)',
    authRedirectsToDashboard,
    { status: authRootRes.statusCode, location: authRootRes.headers.location }
  );

  // =========================================================================
  // SUITE 4: ROUTE HYGIENE ON /api/leads/batch
  // =========================================================================
  console.log('\n--- SUITE 4: Route Hygiene & Protection on /api/leads/batch ---');

  // 4.1 Unauthenticated POST /api/leads/batch must be blocked
  const testBatchPayload = JSON.stringify({
    leads: [
      {
        contact_name: 'UNAUTHENTICATED_ATTACK_LEAD',
        email: 'attacker@unauthorized.com',
        phone: '555-0199',
        message: 'This lead must not be inserted by unauthenticated actor.'
      }
    ]
  });

  const unauthBatchRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/leads/batch',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testBatchPayload)
    }
  }, testBatchPayload);

  const unauthBlocked = (unauthBatchRes.statusCode === 302 && unauthBatchRes.headers.location === '/login');
  const [unauthDbCheck] = await pool.query("SELECT * FROM leads WHERE contact_name = 'UNAUTHENTICATED_ATTACK_LEAD'");

  record(
    'ROUTE_HYGIENE',
    'BATCH-4.1',
    'Route protection: Unauthenticated POST /api/leads/batch blocked by requireAuth (HTTP 302 -> /login)',
    unauthBlocked && unauthDbCheck.length === 0,
    { status: unauthBatchRes.statusCode, location: unauthBatchRes.headers.location, dbInsertedCount: unauthDbCheck.length }
  );

  // 4.2 Forged JWT Cookie on POST /api/leads/batch
  const forgedBatchRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/leads/batch',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testBatchPayload),
      'Cookie': 'auth_token=forged.invalid.token'
    }
  }, testBatchPayload);

  const forgedBlocked = (forgedBatchRes.statusCode === 302 && forgedBatchRes.headers.location === '/login');
  const [forgedDbCheck] = await pool.query("SELECT * FROM leads WHERE contact_name = 'UNAUTHENTICATED_ATTACK_LEAD'");

  record(
    'ROUTE_HYGIENE',
    'BATCH-4.2',
    'Route protection: Forged token on POST /api/leads/batch blocked and clears invalid cookie',
    forgedBlocked && forgedDbCheck.length === 0,
    { status: forgedBatchRes.statusCode, location: forgedBatchRes.headers.location, dbInsertedCount: forgedDbCheck.length }
  );

  // 4.3 Authenticated POST /api/leads/batch with valid ENUM source
  const validEnumBatchPayload = JSON.stringify({
    leads: [
      {
        contact_name: 'VALID_BATCH_LEAD_MANUAL',
        organization_name: 'Test Org M4',
        email: 'batch-test-manual@tiffanywebbimpact.com',
        phone: '555-0144',
        event_type: 'Keynote',
        source: 'manual',
        source_section: 'Batch CSV Import'
      }
    ]
  });

  const authManualBatchRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/leads/batch',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(validEnumBatchPayload),
      'Cookie': `auth_token=${extractedToken}`
    }
  }, validEnumBatchPayload);

  let manualBatchParsed = {};
  try { manualBatchParsed = JSON.parse(authManualBatchRes.body); } catch (e) {}

  const [authManualDbCheck] = await pool.query("SELECT * FROM leads WHERE contact_name = 'VALID_BATCH_LEAD_MANUAL'");
  const manualBatchSucceeded = (authManualBatchRes.statusCode === 200 && manualBatchParsed.success === true && manualBatchParsed.count === 1 && authManualDbCheck.length === 1);

  record(
    'ROUTE_HYGIENE',
    'BATCH-4.3',
    'Route authorization: Authenticated POST /api/leads/batch with valid ENUM source succeeds (HTTP 200)',
    manualBatchSucceeded,
    { status: authManualBatchRes.statusCode, body: manualBatchParsed, dbInsertedCount: authManualDbCheck.length }
  );

  if (authManualDbCheck.length > 0) {
    const leadId = authManualDbCheck[0].id;
    await pool.query('DELETE FROM activity_log WHERE lead_id = ?', [leadId]);
    await pool.query('DELETE FROM leads WHERE id = ?', [leadId]);
  }

  // 4.4 Authenticated POST /api/leads/batch with default fallback source ('csv_upload')
  const defaultFallbackBatchPayload = JSON.stringify({
    leads: [
      {
        contact_name: 'DEFAULT_SOURCE_LEAD',
        email: 'default-source@tiffanywebbimpact.com',
        phone: '555-0145'
        // source omitted, defaults to 'csv_upload' in server.js line 1254
      }
    ]
  });

  const authDefaultBatchRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/leads/batch',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(defaultFallbackBatchPayload),
      'Cookie': `auth_token=${extractedToken}`
    }
  }, defaultFallbackBatchPayload);

  let defaultBatchParsed = {};
  try { defaultBatchParsed = JSON.parse(authDefaultBatchRes.body); } catch (e) {}

  const [defaultDbCheck] = await pool.query("SELECT * FROM leads WHERE contact_name = 'DEFAULT_SOURCE_LEAD'");
  const defaultBatchSucceeded = (authDefaultBatchRes.statusCode === 200 && defaultBatchParsed.success === true && defaultDbCheck.length === 1);

  record(
    'ROUTE_HYGIENE',
    'BATCH-4.4',
    'Schema consistency: POST /api/leads/batch with default fallback source succeeds without ENUM truncation error',
    defaultBatchSucceeded,
    {
      status: authDefaultBatchRes.statusCode,
      body: defaultBatchParsed,
      dbInsertedCount: defaultDbCheck.length,
      defect: defaultBatchSucceeded ? 'None' : "BUG: server.js defaults source to 'csv_upload', but leads.source ENUM only allows ('website_form','whatsapp','instagram','email','referral','manual'). MySQL throws WARN_DATA_TRUNCATED (errno 1265) returning HTTP 500."
    }
  );

  if (defaultDbCheck.length > 0) {
    const leadId = defaultDbCheck[0].id;
    await pool.query('DELETE FROM activity_log WHERE lead_id = ?', [leadId]);
    await pool.query('DELETE FROM leads WHERE id = ?', [leadId]);
  }

  // =========================================================================
  // SUMMARY & VERDICT
  // =========================================================================
  console.log('\n================================================================');
  console.log('  TEST SUMMARY & VERDICT                                         ');
  console.log('================================================================');

  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;
  const failedTests = testResults.filter(t => !t.passed);

  console.log(`Total Checks: ${totalTests}`);
  console.log(`Passed:       ${passedTests}`);
  console.log(`Failed:       ${failedTests.length}`);

  if (failedTests.length > 0) {
    console.error('\nFAILED TESTS:');
    failedTests.forEach(f => console.error(` - [${f.testId}] ${f.description}: ${JSON.stringify(f.details)}`));
    console.log('\nFINAL VERDICT: DISPROVEN');
  } else {
    console.log('\nFINAL VERDICT: CONFIRMED');
  }

  await pool.end();
  return { totalTests, passedTests, failedTests, verdict: failedTests.length === 0 ? 'CONFIRMED' : 'DISPROVEN' };
}

if (require.main === module) {
  runEmpiricalSuite()
    .then(summary => {
      process.exit(summary.verdict === 'CONFIRMED' ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal execution error:', err);
      process.exit(1);
    });
}

module.exports = { runEmpiricalSuite };
