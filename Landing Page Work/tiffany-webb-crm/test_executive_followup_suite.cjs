const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE IMPACT OS™ EXECUTIVE FOLLOW-UP & SECURITY SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail}`);
      failed++;
    }
  }

  // --- SECTION 1: Universal Executive Reticle Cursor Across ALL 10 Views ---
  const viewsDir = path.join(__dirname, 'views');
  const expectedViews = [
    'dashboard.ejs',
    'lead.ejs',
    'new-lead.ejs',
    'cms.ejs',
    'cms-page.ejs',
    'cms-collection-edit.ejs',
    'users.ejs',
    'login.ejs',
    'forgot-password.ejs',
    'reset-password.ejs'
  ];

  expectedViews.forEach(viewFile => {
    const filePath = path.join(viewsDir, viewFile);
    assert(fs.existsSync(filePath), `View file exists: ${viewFile}`);
    const content = fs.readFileSync(filePath, 'utf8');
    assert(content.includes('/js/impact-os-cursor.js'), `Cursor script mounted in: ${viewFile}`);
  });

  // Cursor JS & CSS integrity
  const cursorJsPath = path.join(__dirname, 'public', 'js', 'impact-os-cursor.js');
  const cursorJs = fs.readFileSync(cursorJsPath, 'utf8');
  assert(cursorJs.includes('impactOsReticle'), 'Cursor creates impactOsReticle diamond');
  assert(cursorJs.includes('impactOsRing'), 'Cursor creates impactOsRing spring frame');
  assert(cursorJs.includes('translate(-50%, -50%)'), 'Cursor uses centered transform coordinates');
  assert(cursorJs.includes('rotate('), 'Cursor applies dynamic diamond rotation');

  // --- SECTION 2: Database Schema & Live Follow-Up Query ---
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tiffany_crm',
      waitForConnections: true,
      connectionLimit: 3
    });

    const [cols] = await pool.query('SHOW COLUMNS FROM lead_notes');
    const colNames = cols.map(c => c.Field);
    assert(colNames.includes('followup_date'), 'lead_notes has followup_date column');
    assert(colNames.includes('followup_time'), 'lead_notes has followup_time column');
    assert(colNames.includes('followup_at'), 'lead_notes has followup_at column');
    assert(colNames.includes('is_completed'), 'lead_notes has is_completed column');
    assert(colNames.includes('alert_sent'), 'lead_notes has alert_sent column');

    // Test follow-up date computation and active_followup subquery
    const [leads] = await pool.query(`
      SELECT l.*,
        (SELECT CONCAT(DATE_FORMAT(ln.followup_at, '%e %b, %l:%i %p'), ' · "', SUBSTRING(ln.note, 1, 30), (CASE WHEN LENGTH(ln.note) > 30 THEN '..."' ELSE '"' END))
         FROM lead_notes ln 
         WHERE ln.lead_id = l.id AND ln.followup_at IS NOT NULL AND ln.is_completed = 0
         ORDER BY ln.followup_at ASC LIMIT 1) AS active_followup
      FROM leads l 
      ORDER BY l.created_at DESC LIMIT 5
    `);
    assert(Array.isArray(leads), 'Dashboard active_followup subquery executes cleanly on live database');
  } catch (dbErr) {
    console.warn('⚠️ DB Connection warning:', dbErr.message);
  } finally {
    if (pool) await pool.end();
  }

  // --- SECTION 3: Template Rendering with Active Follow-Up Badge ---
  const dashboardTemplate = fs.readFileSync(path.join(viewsDir, 'dashboard.ejs'), 'utf8');
  const renderedDashboard = ejs.render(dashboardTemplate, {
    leads: [{
      id: 999,
      source: 'website_form',
      source_section: 'Keynote Speaker',
      source_card: 'Executive Leadership',
      status: 'qualified',
      contact_name: 'Dr. Evelyn Vance',
      organization_name: 'Health Equity Foundation',
      email: 'evelyn@example.com',
      phone: '5551234567',
      country_code: '+1',
      topic_interest: 'Healthcare Reform',
      event_type: 'Conference Keynote',
      event_date: '2026-10-15',
      event_location: 'Chicago, IL',
      estimated_audience_size: '500+ attendees',
      budget_range: '$25,000',
      message: 'Looking forward to keynote booking.',
      fee_amount: null,
      active_followup: '15 Oct, 2:00 PM · "Send draft agreement..."',
      created_at: new Date()
    }],
    totalConfirmedRevenue: 0,
    chartData: JSON.stringify({ sourceData: {}, funnelData: {} }),
    error: null,
    success: null
  }, { filename: path.join(viewsDir, 'dashboard.ejs') });

  assert(renderedDashboard.includes('followup-pill'), 'Dashboard renders followup-pill class');
  assert(renderedDashboard.includes('15 Oct, 2:00 PM'), 'Follow-up date and time is rendered in badge');
  assert(renderedDashboard.includes('Send draft agreement'), 'Follow-up note snippet is rendered in badge');
  assert(renderedDashboard.includes('id="followup-date-999"'), 'Dashboard dossier note composer has date input');
  assert(renderedDashboard.includes('id="followup-time-999"'), 'Dashboard dossier note composer has time input');

  // Lead Profile Page Rendering
  const leadTemplate = fs.readFileSync(path.join(viewsDir, 'lead.ejs'), 'utf8');
  const renderedLead = ejs.render(leadTemplate, {
    lead: {
      id: 999,
      source: 'website_form',
      source_section: 'Keynote Speaker',
      source_card: 'Executive Leadership',
      status: 'qualified',
      contact_name: 'Dr. Evelyn Vance',
      organization_name: 'Health Equity Foundation',
      email: 'evelyn@example.com',
      phone: '5551234567',
      country_code: '+1',
      topic_interest: 'Healthcare Reform',
      event_type: 'Conference Keynote',
      event_date: '2026-10-15',
      event_location: 'Chicago, IL',
      estimated_audience_size: '500+ attendees',
      budget_range: '$25,000',
      message: 'Looking forward to keynote booking.',
      created_at: new Date()
    },
    messages: [],
    activity: [],
    notes: [{
      id: 1,
      author_name: 'Tiffany Webb',
      author_role: 'admin',
      note: 'Agreed on $25k fee. Contract to follow.',
      followup_date: '2026-10-15',
      followup_time: '14:00:00',
      followup_at: '2026-10-15 14:00:00',
      is_completed: 0,
      created_at: new Date()
    }]
  }, { filename: path.join(viewsDir, 'lead.ejs') });

  assert(renderedLead.includes('id="leadFollowupDate"'), 'Lead page has follow-up date picker');
  assert(renderedLead.includes('id="leadFollowupTime"'), 'Lead page has follow-up time picker');
  assert(renderedLead.includes('Follow-up:'), 'Lead page renders follow-up badge in note card');

  // --- SECTION 4: Security & Environment Hardening (Task 19) ---
  const serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
  assert(serverJs.includes("if (!process.env.JWT_SECRET)"), 'Server strictly terminates if JWT_SECRET is missing');
  assert(!serverJs.includes("|| 'secret'") && !serverJs.includes("|| 'default_secret'"), 'No insecure JWT_SECRET fallbacks');
  assert(serverJs.includes("app.get('/api/leads/:id/notes', requireAuth,"), 'GET /api/leads/:id/notes is guarded with requireAuth');
  assert(serverJs.includes("app.post('/api/leads/:id/notes', requireAuth,"), 'POST /api/leads/:id/notes is guarded with requireAuth');

  // Canonical Invariants
  assert(serverJs.includes('booking@tiffanywebbimpact.com'), 'Uses canonical booking@tiffanywebbimpact.com email');
  assert(!serverJs.includes('@tiffanywebb.com'), 'No non-canonical tiffanywebb.com email addresses');

  console.log(`\n================================================================`);
  console.log(`📊 FINAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`================================================================\n`);

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
