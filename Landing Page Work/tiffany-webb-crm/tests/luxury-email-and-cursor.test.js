/**
 * Automated Verification Suite for:
 * 1. Option C Solid Luxury Magnetic Pill Cursor (JS & CSS)
 * 2. Editorial Luxury Email Template Compiler (Briefing & Action Alert)
 * 3. GET /api/test-email Dispatch Endpoint to rishilforwork08@gmail.com
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.BRIEFING_EMAIL = 'rishilforwork08@gmail.com';

const { app, compileLuxuryEmailTemplate, createMailTransporter } = require('../server');

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 Starting Impact OS Luxury Email & Cursor Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Cursor JS Test
  test('Option C Cursor JS has luxury pill and dot implementation', () => {
    const jsPath = path.join(__dirname, '../public/js/impact-os-cursor.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    assert(jsContent.includes('impact-os-pill-cursor'), 'Should include impact-os-pill-cursor class');
    assert(jsContent.includes('impact-os-pill-dot'), 'Should include impact-os-pill-dot class');
    assert(jsContent.includes('pill-hover-active'), 'Should include pill-hover-active class');
    assert(jsContent.includes('rotate('), 'Should calculate rotation angle from velocity');
    assert(jsContent.includes('scale('), 'Should stretch capsule based on speed');
  });

  // 2. Cursor CSS Test
  test('Cursor CSS contains Option C styling and color tokens', () => {
    const cssPath = path.join(__dirname, '../public/css/crm-theme.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    assert(cssContent.includes('.impact-os-pill-cursor'), 'Should define .impact-os-pill-cursor');
    assert(cssContent.includes('.impact-os-pill-dot'), 'Should define .impact-os-pill-dot');
    assert(cssContent.includes('.pill-hover-active'), 'Should define .pill-hover-active');
    assert(cssContent.includes('#D9A23A'), 'Should use Gold #D9A23A accent');
    assert(cssContent.includes('border-radius: 999px'), 'Should have pill border-radius');
  });

  // 3. Email Template Compiler — Morning Briefing Mode
  test('compileLuxuryEmailTemplate renders Obsidian canvas briefing correctly', () => {
    const html = compileLuxuryEmailTemplate({
      type: 'briefing',
      title: '🌅 Daily Morning Executive Briefing',
      subtitle: 'Date: Sunday, September 6, 2026',
      kpis: [
        { label: 'Due Today', value: 4, color: '#D9A23A' },
        { label: 'Overdue', value: 1, color: '#ef4444' },
        { label: 'New Inquiries', value: 3, color: '#38bdf8' }
      ],
      dueToday: [
        {
          lead_id: 101,
          contact_name: 'Lady Sarah Sterling',
          organization_name: 'Sterling Global Impact',
          followup_at: new Date('2026-09-06T14:30:00Z'),
          note: 'Confirm keynote availability and contract terms',
          phone: '+14155552671',
          email: 'sarah@sterlingimpact.org'
        }
      ],
      overdue: [
        {
          lead_id: 99,
          contact_name: 'Marcus Vance',
          organization_name: 'Vance Capital',
          followup_at: new Date('2026-09-04T10:00:00Z'),
          note: 'Review speaker fee proposal'
        }
      ],
      overnightLeads: [
        {
          id: 105,
          contact_name: 'Elena Rostova',
          organization_name: 'European Leadership Forum',
          topic_interest: 'Keynote Speaking',
          budget_range: '$25,000 - $50,000',
          source: 'website'
        }
      ],
      crmUrl: 'https://crm.tiffanywebbimpact.com'
    });

    assert(html.includes('#080705'), 'Should use Obsidian outer canvas background #080705');
    assert(html.includes('#14120D'), 'Should use Obsidian container background #14120D');
    assert(html.includes('#FBF6EA'), 'Should use Warm Ivory text #FBF6EA');
    assert(html.includes('#D9A23A'), 'Should use Signature Gold #D9A23A');
    assert(html.includes('TIFFANY WEBB IMPACT OS™ · MORNING BRIEFING'), 'Should contain header keyline');
    assert(html.includes('Lady Sarah Sterling'), 'Should list due follow-up contact');
    assert(html.includes('Confirm keynote availability and contract terms'), 'Should render note text');
    assert(html.includes('https://wa.me/'), 'Should have WhatsApp link in follow-up');
    assert(html.includes('Marcus Vance'), 'Should render overdue item');
    assert(html.includes('Elena Rostova'), 'Should render overnight inquiry item');
    assert(html.includes('https://crm.tiffanywebbimpact.com/dashboard'), 'Should link to Impact OS Dashboard');
  });

  // 4. Email Template Compiler — 1-Hour Action Alert Mode
  test('compileLuxuryEmailTemplate renders 1-Hour Action Alert with high-contrast action buttons', () => {
    const html = compileLuxuryEmailTemplate({
      type: 'alert',
      title: '⚡ Follow-Up Due in 60 Minutes (02:00 PM)',
      subtitle: 'Scheduled Action Alert · Due at 02:00 PM',
      item: {
        id: 77,
        lead_id: 102,
        contact_name: 'Dr. Alistair Finch',
        organization_name: 'Global Health Summit 2026',
        status: 'proposal_sent',
        phone: '+12125559876',
        email: 'afinch@ghsummit.org',
        followup_at: new Date('2026-09-06T14:00:00Z'),
        note: 'Executive closing call regarding plenary session'
      },
      waPhone: '12125559876',
      cleanPhone: '12125559876',
      crmUrl: 'https://crm.tiffanywebbimpact.com'
    });

    assert(html.includes('TIFFANY WEBB IMPACT OS™ · EXECUTIVE ACTION ALERT'), 'Should contain Alert keyline');
    assert(html.includes('Dr. Alistair Finch'), 'Should render contact name');
    assert(html.includes('Global Health Summit 2026'), 'Should render organization');
    assert(html.includes('STAGE: PROPOSAL SENT'), 'Should render stage badge');
    assert(html.includes('Executive closing call regarding plenary session'), 'Should render scheduled note');
    assert(html.includes('href="https://wa.me/12125559876"'), 'Should render 1-Click WhatsApp button');
    assert(html.includes('href="tel:12125559876"'), 'Should render 1-Click Direct Call button');
    assert(html.includes('href="mailto:afinch@ghsummit.org"'), 'Should render Send Email button');
    assert(html.includes('https://crm.tiffanywebbimpact.com/lead/102'), 'Should link to full lead dossier');
  });

  // 5. GET /api/test-email Dispatch Route Test
  await asyncTest('GET /api/test-email endpoint returns success and target rishilforwork08@gmail.com', async () => {
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    try {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/api/test-email`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              resolve({ status: res.statusCode, body: parsed });
            } catch (e) {
              reject(new Error(`Failed to parse JSON: ${data}`));
            }
          });
        }).on('error', reject);
      });

      assert.strictEqual(res.status, 200, `Expected status 200, got ${res.status}`);
      assert.strictEqual(res.body.success, true, 'Expected success to be true');
      assert.strictEqual(res.body.deliveredTo, 'rishilforwork08@gmail.com', 'Expected deliveredTo to be rishilforwork08@gmail.com');
      console.log(`     Response payload: ${JSON.stringify(res.body)}`);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // 6. Edge Cases: Empty collections, null values, missing contact details
  test('compileLuxuryEmailTemplate handles empty collections and null items gracefully', () => {
    const emptyBriefing = compileLuxuryEmailTemplate({
      type: 'briefing',
      title: '🌅 Daily Morning Executive Briefing',
      kpis: [],
      dueToday: [],
      overdue: [],
      overnightLeads: []
    });
    assert(emptyBriefing.includes('No follow-ups scheduled for today'), 'Handles empty dueToday');
    assert(emptyBriefing.includes('No new inquiries received overnight'), 'Handles empty overnightLeads');
    assert(!emptyBriefing.includes('⚠️ Overdue Action Items'), 'Hides overdue section when empty');

    const bareAlert = compileLuxuryEmailTemplate({
      type: 'alert',
      item: {
        id: 5,
        lead_id: 10,
        note: 'General check-in'
      }
    });
    assert(bareAlert.includes('Client'), 'Defaults missing contact_name to Client');
    assert(bareAlert.includes('General check-in'), 'Renders note');
    assert(bareAlert.includes('STAGE: NEW'), 'Defaults missing status to NEW');
  });

  // 7. Design System Invariants Check
  test('Design system canonical rules strictly followed', () => {
    const htmlBriefing = compileLuxuryEmailTemplate({ type: 'briefing', crmUrl: 'https://crm.tiffanywebbimpact.com' });
    const htmlAlert = compileLuxuryEmailTemplate({ type: 'alert', item: { id: 1, lead_id: 1, note: 'Test' }, crmUrl: 'https://crm.tiffanywebbimpact.com' });

    assert(!htmlBriefing.includes('tiffanywebb.com') || htmlBriefing.includes('tiffanywebbimpact.com'), 'Must use official domain');
    assert(!htmlBriefing.includes('info@') && !htmlBriefing.includes('hello@'), 'No placeholder generic emails');
    assert(htmlBriefing.includes('Tiffany Webb Impact OS™'), 'Uses official platform nomenclature');
    assert(htmlAlert.includes('Tiffany Webb Impact OS™'), 'Uses official platform nomenclature');
  });

  console.log('\n======================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
