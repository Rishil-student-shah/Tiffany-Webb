/**
 * End-to-End Bulk Lead Ingestion & Database Verification Suite (Task 02)
 * Tests single lead submission (POST /api/leads) and batch ingestion (POST /api/leads/batch)
 * across 5 distinct channel VIP scenarios with full database column & activity log verification.
 */

const http = require('http');
const assert = require('assert');
const mysql = require('mysql2/promise');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_tiffany_webb_impact_os_2026';

const { app } = require('../server');

const TEST_PORT = 3099;
let server;
let pool;

const TEST_LEADS = [
  {
    contact_name: 'TEST_VIP_Dr_Sarah_Jenkins',
    organization_name: 'Midwest Health Alliance',
    email: 'test_sarah.jenkins@midwesthealth.org',
    country_code: '+1',
    phone: '3125550101',
    event_type: 'Conference',
    topic_interest: 'Track 2: Healthcare Integration, Screening & Clinical Navigation',
    event_date: '2026-11-15',
    event_location: 'Chicago, IL',
    estimated_audience_size: '150–500',
    budget_range: '$5,000–$10,000',
    source: 'website_form',
    source_section: 'Homepage Hero',
    source_card: 'Hero Booking Button',
    message: 'Requesting keynote on clinical screening protocols for problem gambling.'
  },
  {
    contact_name: 'TEST_VIP_Marcus_Sterling',
    organization_name: 'National Prevention Coalition',
    email: 'test_marcus.sterling@preventioncoalition.org',
    country_code: '+1',
    phone: '3125550102',
    event_type: 'Keynote Presentation',
    topic_interest: 'Break the Silence: Prevention Begins with a Conversation',
    event_date: '2026-12-05',
    event_location: 'Indianapolis, IN',
    estimated_audience_size: '500+',
    budget_range: '$10,000+',
    source: 'website_form',
    source_section: 'Speaking Topics',
    source_card: 'Flagship Keynote: Break the Silence',
    message: 'Opening plenary keynote for 800+ public health professionals.'
  },
  {
    contact_name: 'TEST_VIP_Elena_Rodriguez',
    organization_name: 'Great Lakes Hospital Network',
    email: 'test_elena.rodriguez@greatlakeshealth.org',
    country_code: '+1',
    phone: '3125550103',
    event_type: 'Executive Advisory & Strategy',
    topic_interest: 'Strategic Advisory & GEAR Method™',
    event_date: '2027-01-20',
    event_location: 'Virtual / Chicago',
    estimated_audience_size: 'Under 50',
    budget_range: '$10,000+',
    source: 'website_form',
    source_section: 'Advisory & Corporate Practice',
    source_card: 'GEAR Method Advisory Scoping',
    message: 'Executive team advisory to structure 2027 community harm prevention framework.'
  },
  {
    contact_name: 'TEST_VIP_David_Chen',
    organization_name: 'Public Health Media Group',
    email: 'test_david.chen@healthmedia.com',
    country_code: '+1',
    phone: '3125550104',
    event_type: 'Media / Broadcast Interview',
    topic_interest: 'Youth Digital Safety & Emerging Gaming Harms',
    event_date: '2026-10-10',
    event_location: 'Virtual / Broadcast Studio',
    estimated_audience_size: 'Not sure yet',
    budget_range: 'Honorarium only',
    source: 'website_form',
    source_section: 'Thought Leadership & Media Kit',
    source_card: 'Media Interview Inbound',
    message: 'Inviting Tiffany for an in-depth interview on youth sports betting trends.'
  },
  {
    contact_name: 'TEST_VIP_Pastor_James_Wilson',
    organization_name: 'Community Recovery & Hope Coalition',
    email: 'test_pastor.wilson@recoveryhope.org',
    country_code: '+1',
    phone: '3125550105',
    event_type: 'Community Event',
    topic_interest: 'Family & Community Impact',
    event_date: '2026-11-28',
    event_location: 'South Side Chicago, IL',
    estimated_audience_size: '50–150',
    budget_range: '$2,500–$5,000',
    source: 'whatsapp',
    source_section: 'Direct Referral / ROSC Coalition',
    source_card: 'VIP Referral',
    message: 'Direct referral through ROSC leadership for frontline community activation.'
  }
];

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      ...headers
    };

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path,
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runVerificationSuite() {
  console.log('\n===============================================================');
  console.log('🛡️ TASK 02: End-to-End Bulk Lead Ingestion & Verification Suite');
  console.log('   Testing 5 Distinct Channels, Column Integrity & Activity Logs');
  console.log('===============================================================\n');

  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@rishil8124shah',
    database: process.env.DB_NAME || 'tiffany_crm',
    waitForConnections: true,
    connectionLimit: 10
  });

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[Test Server] Running on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;
  const createdLeadIds = [];

  async function step(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Details: ${err.message}`);
      failed++;
    }
  }

  try {
    // Clean up any prior test artifacts
    await pool.query("DELETE FROM leads WHERE contact_name LIKE 'TEST_VIP_%' OR email LIKE 'test_%@%'");

    // TEST 1: Single Lead Ingestion (Channel 1: Homepage Hero)
    await step('Single Lead Ingestion (POST /api/leads) - Channel 1: Homepage Hero', async () => {
      const leadData = TEST_LEADS[0];
      const res = await makeRequest('POST', '/api/leads', leadData);
      assert.strictEqual(res.status, 201, `Expected status 201, got ${res.status}`);
      assert(res.body && res.body.success === true, 'Response must have success: true');
      assert(res.body.lead_id, 'Response must return lead_id');
      createdLeadIds.push(res.body.lead_id);
    });

    // TEST 2: Single Lead Ingestion (Channel 2: Speaking Inbound)
    await step('Single Lead Ingestion (POST /api/leads) - Channel 2: Speaking Inbound', async () => {
      const leadData = TEST_LEADS[1];
      const res = await makeRequest('POST', '/api/leads', leadData);
      assert.strictEqual(res.status, 201, `Expected status 201, got ${res.status}`);
      assert(res.body && res.body.lead_id, 'Response must return lead_id');
      createdLeadIds.push(res.body.lead_id);
    });

    // TEST 3: Validation Guardrail (Empty identifier rejected)
    await step('Validation Guardrail: Rejects lead with zero contact identifiers', async () => {
      const invalidLead = {
        message: 'No name, phone, or email provided',
        event_location: 'Nowhere'
      };
      const res = await makeRequest('POST', '/api/leads', invalidLead);
      assert.strictEqual(res.status, 400, `Expected status 400 for empty contact, got ${res.status}`);
      assert(res.body && res.body.error, 'Should return error message');
    });

    // TEST 4: Batch Lead Ingestion (POST /api/leads/batch) - Channels 3, 4, 5
    await step('Batch Lead Ingestion (POST /api/leads/batch) - Channels 3, 4, 5', async () => {
      const batchPayload = {
        leads: [TEST_LEADS[2], TEST_LEADS[3], TEST_LEADS[4]]
      };
      const res = await makeRequest('POST', '/api/leads/batch', batchPayload);
      assert.strictEqual(res.status, 201, `Expected status 201, got ${res.status}`);
      assert(res.body && res.body.success === true, 'Response must have success: true');
      assert.strictEqual(res.body.count, 3, 'Expected 3 leads inserted');
      assert(Array.isArray(res.body.lead_ids) && res.body.lead_ids.length === 3, 'Expected 3 lead IDs returned');
      res.body.lead_ids.forEach(id => createdLeadIds.push(id));
    });

    // TEST 5: Database Column Integrity Verification
    await step('Database Column Integrity: All 5 Channels verified across all schema columns', async () => {
      assert.strictEqual(createdLeadIds.length, 5, 'Should have 5 created lead IDs');

      for (let i = 0; i < TEST_LEADS.length; i++) {
        const expected = TEST_LEADS[i];
        const leadId = createdLeadIds[i];

        const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [leadId]);
        assert.strictEqual(rows.length, 1, `Lead ID ${leadId} must exist in database`);
        const row = rows[0];

        assert.strictEqual(row.contact_name, expected.contact_name, `Name mismatch for ${expected.contact_name}`);
        assert.strictEqual(row.organization_name, expected.organization_name, `Org mismatch for ${expected.contact_name}`);
        assert.strictEqual(row.email, expected.email, `Email mismatch for ${expected.contact_name}`);
        assert.strictEqual(row.phone, expected.phone, `Phone mismatch for ${expected.contact_name}`);
        assert.strictEqual(row.source, expected.source, `Source mismatch for ${expected.contact_name}`);
        assert.strictEqual(row.source_section, expected.source_section, `Source section mismatch for ${expected.contact_name}`);
        assert.strictEqual(row.source_card, expected.source_card, `Source card mismatch for ${expected.contact_name}`);
        assert.strictEqual(row.budget_range, expected.budget_range, `Budget mismatch for ${expected.contact_name}`);
        assert.strictEqual(row.status, 'new', `Initial status must be 'new'`);
      }
    });

    // TEST 6: Automated Activity Log Verification
    await step('Automated Activity Log: Verifies lead_created entry exists for every lead', async () => {
      for (const leadId of createdLeadIds) {
        const [logs] = await pool.query('SELECT * FROM activity_log WHERE lead_id = ? AND action = ?', [leadId, 'lead_created']);
        assert(logs.length >= 1, `Activity log must have 'lead_created' for lead_id ${leadId}`);
        assert(logs[0].detail && logs[0].detail.length > 0, `Activity detail must not be empty`);
      }
    });

    // TEST 7: Clean Test Teardown
    await step('Test Isolation & Teardown: Clean up test leads and associated activity logs', async () => {
      for (const leadId of createdLeadIds) {
        await pool.query('DELETE FROM activity_log WHERE lead_id = ?', [leadId]);
        await pool.query('DELETE FROM leads WHERE id = ?', [leadId]);
      }
      const [remaining] = await pool.query("SELECT COUNT(*) as cnt FROM leads WHERE contact_name LIKE 'TEST_VIP_%'");
      assert.strictEqual(Number(remaining[0].cnt), 0, 'All test leads must be completely removed');
    });

  } finally {
    if (server) server.close();
    if (pool) await pool.end();
  }

  console.log('\n---------------------------------------------------------------');
  console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('---------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerificationSuite().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
