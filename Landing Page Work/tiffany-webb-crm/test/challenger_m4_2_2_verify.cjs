/**
 * Challenger M4.2.2 Empirical Verification Harness
 * Tests:
 * 1. Unauthenticated / forged calls to POST /api/leads/:id/notes
 * 2. POST /api/leads/batch default source fallback to 'manual' (no MySQL 1265 truncation errors)
 */

const http = require('http');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production_123';

function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (postData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: reqHeaders
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          json
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('======================================================================');
  console.log('  CHALLENGER M4.2.2 EMPIRICAL ADVERSARIAL TEST HARNESS                ');
  console.log('======================================================================\n');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@rishil8124shah',
    database: process.env.DB_NAME || 'tiffany_crm'
  });

  const results = {
    test1_unauth_notes: null,
    test2_forged_notes: null,
    test3_batch_missing_source: null,
    test4_batch_custom_source: null
  };

  try {
    // -------------------------------------------------------------
    // PART 1: Unauthenticated & Forged Notes Injection
    // -------------------------------------------------------------
    console.log('>>> TESTING PART 1: Unauthenticated Notes Injection Enforcement');
    const [[{ count: notesBefore }]] = await pool.query('SELECT COUNT(*) as count FROM lead_notes');
    const [[{ count: auditBefore }]] = await pool.query("SELECT COUNT(*) as count FROM activity_log WHERE action = 'note_added'");

    // Subtest 1.1: No cookie
    const resUnauth = await makeRequest({
      method: 'POST',
      path: '/api/leads/1/notes',
      body: { note: 'ADVERSARIAL_PAYLOAD_NO_COOKIE' }
    });

    // Subtest 1.2: Forged / Invalid Cookie
    const resForged = await makeRequest({
      method: 'POST',
      path: '/api/leads/1/notes',
      headers: {
        'Cookie': 'auth_token=invalid.forged.jwt'
      },
      body: { note: 'ADVERSARIAL_PAYLOAD_FORGED_JWT' }
    });

    const [[{ count: notesAfter }]] = await pool.query('SELECT COUNT(*) as count FROM lead_notes');
    const [[{ count: auditAfter }]] = await pool.query("SELECT COUNT(*) as count FROM activity_log WHERE action = 'note_added'");

    const unauthRedirectsToLogin = resUnauth.statusCode === 302 && resUnauth.headers.location === '/login';
    const forgedRedirectsToLogin = resForged.statusCode === 302 && resForged.headers.location === '/login';
    const notesTableUntouched = notesBefore === notesAfter;
    const auditTableUntouched = auditBefore === auditAfter;

    results.test1_unauth_notes = {
      statusCode: resUnauth.statusCode,
      location: resUnauth.headers.location,
      redirectsToLogin: unauthRedirectsToLogin,
      pass: unauthRedirectsToLogin && notesTableUntouched
    };

    results.test2_forged_notes = {
      statusCode: resForged.statusCode,
      location: resForged.headers.location,
      redirectsToLogin: forgedRedirectsToLogin,
      pass: forgedRedirectsToLogin && notesTableUntouched
    };

    console.log(`  [1.1] No Cookie: HTTP ${resUnauth.statusCode} -> Location: ${resUnauth.headers.location} (Expected: 302 /login) | PASS: ${unauthRedirectsToLogin}`);
    console.log(`  [1.2] Forged Cookie: HTTP ${resForged.statusCode} -> Location: ${resForged.headers.location} (Expected: 302 /login) | PASS: ${forgedRedirectsToLogin}`);
    console.log(`  [1.3] Database Tamper Proof: notes delta = ${notesAfter - notesBefore}, audit delta = ${auditAfter - auditBefore} | PASS: ${notesTableUntouched && auditTableUntouched}\n`);

    // -------------------------------------------------------------
    // PART 2: Batch Lead Import Source ENUM Compliance
    // -------------------------------------------------------------
    console.log('>>> TESTING PART 2: Batch Lead Import Source ENUM Compliance');

    // Generate valid admin token for authenticated batch endpoint
    const [users] = await pool.query("SELECT id, name, email, role FROM users WHERE role = 'admin' AND is_active = 1 LIMIT 1");
    if (users.length === 0) {
      throw new Error('No active admin user found in database to authenticate batch request');
    }
    const adminUser = users[0];
    const validToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const authHeader = { 'Cookie': `auth_token=${validToken}` };

    // Clean up any existing test batch leads
    await pool.query("DELETE FROM activity_log WHERE lead_id IN (SELECT id FROM leads WHERE email LIKE 'batch_challenger_%@example.com')");
    await pool.query("DELETE FROM leads WHERE email LIKE 'batch_challenger_%@example.com'");

    // Subtest 2.1: Batch payload with missing `source`
    const batchMissingSource = {
      leads: [
        {
          name: 'Batch Tester Missing Source',
          email: 'batch_challenger_missing@example.com',
          org: 'Acme Corp',
          phone: '+15550001',
          topic: 'Leadership Strategy',
          location: 'Chicago, IL',
          message: 'Testing missing source default'
        }
      ]
    };

    const resBatch1 = await makeRequest({
      method: 'POST',
      path: '/api/leads/batch',
      headers: authHeader,
      body: batchMissingSource
    });

    // Subtest 2.2: Batch payload with non-ENUM custom `source` (e.g. 'csv_upload', 'custom_crm', 'conference_expo')
    const batchCustomSource = {
      leads: [
        {
          name: 'Batch Tester Custom Source 1',
          email: 'batch_challenger_custom1@example.com',
          source: 'csv_upload',
          org: 'Global Inc',
          message: 'Testing non-enum source csv_upload'
        },
        {
          name: 'Batch Tester Custom Source 2',
          email: 'batch_challenger_custom2@example.com',
          source: 'conference_expo',
          org: 'Events LLC',
          message: 'Testing non-enum source conference_expo'
        }
      ]
    };

    const resBatch2 = await makeRequest({
      method: 'POST',
      path: '/api/leads/batch',
      headers: authHeader,
      body: batchCustomSource
    });

    // Verify in database what source was inserted
    const [insertedRows] = await pool.query(
      "SELECT id, contact_name, email, source, source_section FROM leads WHERE email LIKE 'batch_challenger_%@example.com' ORDER BY id ASC"
    );

    console.log(`  [2.1] Batch missing source: HTTP ${resBatch1.statusCode}, response:`, resBatch1.json);
    console.log(`  [2.2] Batch non-enum source: HTTP ${resBatch2.statusCode}, response:`, resBatch2.json);
    console.log(`  [2.3] Inserted records in DB count: ${insertedRows.length}`);
    for (const row of insertedRows) {
      console.log(`        Lead ID ${row.id}: email=${row.email}, source='${row.source}', section='${row.source_section}'`);
    }

    const batch1Success = resBatch1.statusCode === 200 && resBatch1.json && resBatch1.json.success === true && resBatch1.json.count === 1;
    const batch2Success = resBatch2.statusCode === 200 && resBatch2.json && resBatch2.json.success === true && resBatch2.json.count === 2;
    const allInsertedAreManual = insertedRows.length === 3 && insertedRows.every(r => r.source === 'manual');

    results.test3_batch_missing_source = {
      statusCode: resBatch1.statusCode,
      response: resBatch1.json,
      pass: batch1Success
    };

    results.test4_batch_custom_source = {
      statusCode: resBatch2.statusCode,
      response: resBatch2.json,
      insertedSources: insertedRows.map(r => ({ email: r.email, source: r.source })),
      pass: batch2Success && allInsertedAreManual
    };

    console.log(`  [2.4] Batch ENUM Compliance: All defaulted to 'manual' without MySQL 1265 errors | PASS: ${allInsertedAreManual}\n`);

    // Clean up test records
    await pool.query("DELETE FROM activity_log WHERE lead_id IN (SELECT id FROM leads WHERE email LIKE 'batch_challenger_%@example.com')");
    await pool.query("DELETE FROM leads WHERE email LIKE 'batch_challenger_%@example.com'");

    console.log('======================================================================');
    console.log('  SUMMARY OF RESULTS:');
    console.log(`  Part 1 (Unauthenticated /api/leads/:id/notes blocked): ${results.test1_unauth_notes.pass && results.test2_forged_notes.pass ? 'PASS' : 'FAIL'}`);
    console.log(`  Part 2 (Batch source defaults to manual without ENUM error): ${results.test3_batch_missing_source.pass && results.test4_batch_custom_source.pass ? 'PASS' : 'FAIL'}`);
    console.log('======================================================================');

    const allPassed = results.test1_unauth_notes.pass &&
                      results.test2_forged_notes.pass &&
                      results.test3_batch_missing_source.pass &&
                      results.test4_batch_custom_source.pass;

    if (!allPassed) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
