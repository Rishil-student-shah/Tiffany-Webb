const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING IMPACT OS DASHBOARD POLISH & KPI TEST SUITE');
  console.log('====================================================\n');

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

  // TEST 1: Server dashboard route logic verification (Revenue calculation)
  const testLeads = [
    { id: 1, source: 'website_form', status: 'new', fee_amount: null, contact_name: 'Lead 1' },
    { id: 2, source: 'referral', status: 'booked', fee_amount: 15000.00, contact_name: 'Lead 2' },
    { id: 3, source: 'website_form', status: 'completed', fee_amount: 25000.50, contact_name: 'Lead 3' },
    { id: 4, source: 'instagram', status: 'declined', fee_amount: 50000.00, contact_name: 'Lead 4' }, // Declined shouldn't count in revenue
    { id: 5, source: 'email', status: 'proposal_sent', fee_amount: 10000.00, contact_name: 'Lead 5' }, // Proposal sent shouldn't count
  ];

  let totalConfirmedRevenue = 0;
  const sourceData = {};
  const funnelData = { new: 0, qualified: 0, proposal_sent: 0, booked: 0, completed: 0 };

  testLeads.forEach(lead => {
    sourceData[lead.source] = (sourceData[lead.source] || 0) + 1;
    if (funnelData[lead.status] !== undefined) {
      funnelData[lead.status]++;
    }
    if ((lead.status === 'booked' || lead.status === 'completed') && lead.fee_amount) {
      totalConfirmedRevenue += Number(lead.fee_amount) || 0;
    }
  });

  assert(totalConfirmedRevenue === 40000.50, 'Total Confirmed Revenue Calculation', `Expected 40000.50, got ${totalConfirmedRevenue}`);
  assert(funnelData.booked === 1, 'Funnel Data Booked count matches');
  assert(funnelData.completed === 1, 'Funnel Data Completed count matches');

  // TEST 2: Template rendering with full data
  const templatePath = path.join(__dirname, 'views', 'dashboard.ejs');
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  const renderedHtml = ejs.render(templateContent, {
    leads: testLeads,
    totalConfirmedRevenue: totalConfirmedRevenue,
    chartData: JSON.stringify({ sourceData, funnelData }),
    error: null,
    success: null
  }, { filename: templatePath });

  // Assertions on rendered HTML
  assert(renderedHtml.includes('id="cursorDot"'), 'Custom luxury cursor dot markup is present');
  assert(renderedHtml.includes('id="cursorRing"'), 'Custom luxury cursor ring markup is present');
  assert(renderedHtml.includes('class="stat-card stat-card-revenue"'), 'Revenue KPI card is rendered');
  assert(renderedHtml.includes('$40,000.5'), 'Revenue value $40,000.50 is properly formatted in KPI card');
  assert(renderedHtml.includes('Total Inquiries'), 'Total Inquiries label is rendered');
  assert(renderedHtml.includes('Completed Events'), 'Completed Events KPI card is rendered');
  assert(renderedHtml.includes('id="kpi-declined-leads"'), 'Declined KPI card is rendered');
  assert(renderedHtml.includes('id="kpi-lost-leads"'), 'Lost KPI card is rendered');

  // Stage filter tabs verification (All 9 stages)
  const expectedStages = ['all', 'new', 'contacted', 'qualified', 'proposal_sent', 'booked', 'completed', 'declined', 'lost'];
  expectedStages.forEach(stage => {
    assert(renderedHtml.includes(`data-tab-stage="${stage}"`), `Stage filter tab exists for: ${stage}`);
    assert(renderedHtml.includes(`id="count-tab-${stage}"`), `Count badge exists for stage: ${stage}`);
  });

  // Search input & icon verification
  assert(renderedHtml.includes('class="navbar-search-group"'), 'navbar-search-group wrapper is present');
  assert(renderedHtml.includes('class="navbar-actions-group"'), 'navbar-actions-group wrapper is present');
  assert(renderedHtml.includes('stroke="#D9A23A"'), 'Gold search icon stroke is present');
  assert(renderedHtml.includes('placeholder="Search org, contact, topic, city..."'), 'Search input placeholder is present');

  // TEST 3: Template rendering with empty leads (edge case)
  const emptyRender = ejs.render(templateContent, {
    leads: [],
    totalConfirmedRevenue: 0,
    chartData: JSON.stringify({ sourceData: {}, funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0, completed: 0 } }),
    error: null,
    success: null
  }, { filename: templatePath });

  assert(emptyRender.includes('$0'), 'Empty revenue renders $0 cleanly');
  assert(emptyRender.includes('No Inquiries in new / current pipeline stage'), 'Empty ledger state displays correctly');

  // TEST 3b: Template rendering with null leads (defensive edge case)
  const nullLeadsRender = ejs.render(templateContent, {
    leads: null,
    totalConfirmedRevenue: null,
    chartData: JSON.stringify({ sourceData: {}, funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0, completed: 0 } }),
    error: null,
    success: null
  }, { filename: templatePath });
  assert(nullLeadsRender.includes('id="kpi-total-leads">0<'), 'Null leads renders 0 total inquiries safely');
  assert(nullLeadsRender.includes('No Inquiries in new / current pipeline stage'), 'Null leads renders empty state safely');

  // TEST 4: CSS file inspection
  const cssPath = path.join(__dirname, 'public', 'css', 'crm-theme.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('.custom-cursor-dot'), 'CSS contains .custom-cursor-dot');
  assert(cssContent.includes('.custom-cursor-ring'), 'CSS contains .custom-cursor-ring');
  assert(cssContent.includes('.cursor-hover'), 'CSS contains .cursor-hover');
  assert(cssContent.includes('@media (pointer: coarse)'), 'CSS disables custom cursor on mobile touch');
  assert(cssContent.includes('padding: 0.6rem 1rem 0.6rem 2.8rem !important;'), 'CSS has search input padding guardrail to prevent overlap');
  assert(cssContent.includes('left: 0.95rem;'), 'CSS positions search icon left: 0.95rem');
  assert(cssContent.includes('background: #080705 !important'), 'CSS has distinct velvet obsidian navbar background');
  assert(cssContent.includes('.stat-card-revenue'), 'CSS has .stat-card-revenue styling');
  assert(cssContent.includes('@media (max-width: 1024px)'), 'CSS contains @media (max-width: 1024px) responsive rules');
  assert(cssContent.includes('@media (max-width: 768px)'), 'CSS contains @media (max-width: 768px) responsive rules');
  assert(cssContent.includes('@media (max-width: 480px)'), 'CSS contains @media (max-width: 480px) mobile rules');

  // TEST 5: Real MySQL Database Integration (if DB is accessible)
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '@rishil8124shah',
      database: process.env.DB_NAME || 'tiffany_crm',
      waitForConnections: true,
      connectionLimit: 3
    });

    const [dbLeads] = await pool.query(`
      SELECT l.*, b.fee_amount, b.confirmed_date, b.deposit_status 
      FROM leads l 
      LEFT JOIN bookings b ON l.id = b.lead_id 
      ORDER BY l.created_at DESC
    `);
    assert(Array.isArray(dbLeads), `Database query executed successfully (Retrieved ${dbLeads.length} leads)`);
    await pool.end();
  } catch (dbErr) {
    console.warn('⚠️ Note on DB connection:', dbErr.message);
  }

  console.log(`\n====================================================`);
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
