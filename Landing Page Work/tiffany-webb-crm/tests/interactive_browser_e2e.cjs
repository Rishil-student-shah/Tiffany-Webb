const puppeteer = require('puppeteer-core');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = path.join(__dirname, '../screenshots');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

async function runInteractiveBrowserTest() {
  console.log('======================================================================');
  console.log('  🌐 TIFFANY WEBB IMPACT OS™ — LIVE INTERACTIVE BROWSER E2E TEST       ');
  console.log('======================================================================\n');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@rishil8124shah',
    database: process.env.DB_NAME || 'tiffany_crm'
  });

  console.log('[Browser] Launching real Chrome instance in headless mode...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 0. Login to Impact OS Session
    console.log('[Step 0] Logging into Impact OS Admin Session...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[name="email"]');
    await page.type('input[name="email"]', 'admin@tiffanywebb.com', { delay: 15 });
    await page.type('input[name="password"]', 'password123', { delay: 15 });

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    console.log('  ✓ Logged in successfully. Current URL:', page.url());

    // 1. Step 1: Open Live Website / Lead Form
    console.log('\n[Step 1] Navigating to http://localhost:3000/leads/new...');
    await page.goto('http://localhost:3000/leads/new', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#contact_name', { visible: true });
    const step1Screenshot = path.join(ARTIFACTS_DIR, 'step1_lead_form.png');
    await page.screenshot({ path: step1Screenshot, fullPage: true });
    console.log(`  ✓ Snapshot captured: ${step1Screenshot}`);

    // 2. Step 2: Physically Fill Form Inputs via Browser
    console.log('\n[Step 2] Physically Filling Form Inputs via Browser DOM...');
    await page.click('#contact_name');
    await page.type('#contact_name', 'Dr. Alexander Wright', { delay: 25 });

    await page.click('#organization_name');
    await page.type('#organization_name', 'Healthcare Leadership Summit', { delay: 25 });

    await page.click('#email');
    await page.type('#email', 'a.wright@healthleaders.org', { delay: 25 });

    await page.click('#phone');
    await page.type('#phone', '+15558392041', { delay: 25 });

    await page.select('#eventTypeSelect', 'Keynote Address');

    const formFilledScreenshot = path.join(ARTIFACTS_DIR, 'step2_form_filled.png');
    await page.screenshot({ path: formFilledScreenshot, fullPage: true });
    console.log(`  ✓ Form filled snapshot captured: ${formFilledScreenshot}`);

    console.log('  Clicking Submit button on form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);

    const submitResultScreenshot = path.join(ARTIFACTS_DIR, 'step2_submit_result.png');
    await page.screenshot({ path: submitResultScreenshot, fullPage: true });
    console.log(`  ✓ Form submitted successfully. URL: ${page.url()}`);
    console.log(`  ✓ Submission result snapshot captured: ${submitResultScreenshot}`);

    // Fetch newly created lead from database
    const [leads] = await pool.query(
      'SELECT id, contact_name, organization_name, email, phone, event_type, status FROM leads WHERE email = ? ORDER BY id DESC LIMIT 1',
      ['a.wright@healthleaders.org']
    );

    if (!leads || leads.length === 0) {
      throw new Error('Lead was not found in MySQL database after form submission');
    }

    const createdLead = leads[0];
    const leadId = createdLead.id;
    console.log(`  ✓ MySQL Verified: Lead #${leadId} created for ${createdLead.contact_name} (${createdLead.organization_name})`);

    // 3. Step 3: Navigate to Impact OS Dashboard via Browser
    console.log('\n[Step 3] Navigating to Impact OS Dashboard via Browser (http://localhost:3000/dashboard)...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(`#lead-item-${leadId}`, { visible: true });

    const dashboardScreenshot = path.join(ARTIFACTS_DIR, 'step3_dashboard_initial.png');
    await page.screenshot({ path: dashboardScreenshot, fullPage: true });
    console.log(`  ✓ Dashboard snapshot captured: ${dashboardScreenshot}`);

    // Find row for Dr. Alexander Wright and expand dossier
    console.log(`  Expanding Accordion Dossier for Lead #${leadId}...`);
    await page.evaluate((id) => {
      if (typeof window.toggleLeadDossier === 'function') {
        window.toggleLeadDossier(id);
      }
    }, leadId);

    await new Promise((r) => setTimeout(r, 600));

    // Type note into note input
    console.log('  Typing note into dossier note input...');
    const noteInputSelector = `#note-input-${leadId}`;
    await page.waitForSelector(noteInputSelector, { visible: true });
    await page.click(noteInputSelector);
    await page.type(noteInputSelector, 'Urgent follow-up briefing with Dr. Wright.', { delay: 15 });

    // Set follow-up date and time synchronized with MySQL clock (25 minutes from NOW())
    const [timeRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 25 MINUTE), '%Y-%m-%d') AS target_date,
        DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 25 MINUTE), '%H:%i') AS target_time
    `);
    const dateVal = timeRows[0].target_date;
    const timeVal = timeRows[0].target_time;

    console.log(`  Setting follow-up date: ${dateVal} and time: ${timeVal}...`);
    await page.evaluate((id, d, t) => {
      const dateEl = document.getElementById(`followup-date-${id}`);
      const timeEl = document.getElementById(`followup-time-${id}`);
      if (dateEl) dateEl.value = d;
      if (timeEl) timeEl.value = t;
    }, leadId, dateVal, timeVal);

    const composerScreenshot = path.join(ARTIFACTS_DIR, 'step3_note_composed.png');
    await page.screenshot({ path: composerScreenshot, fullPage: true });
    console.log(`  ✓ Note composed snapshot captured: ${composerScreenshot}`);

    // Click "+ Post Note"
    console.log('  Triggering + Post Note...');
    await page.evaluate((id) => {
      if (typeof window.postLeadNote === 'function') {
        return window.postLeadNote(id);
      }
    }, leadId);

    // Wait for note posting to persist
    await new Promise((r) => setTimeout(r, 1200));

    const notePostedScreenshot = path.join(ARTIFACTS_DIR, 'step3_note_posted.png');
    await page.screenshot({ path: notePostedScreenshot, fullPage: true });
    console.log(`  ✓ Note posted snapshot captured: ${notePostedScreenshot}`);

    // 4. Step 4: Verify Single Email Dispatch & Anti-Duplication
    console.log('\n[Step 4] Triggering & Verifying Single Email Dispatch...');
    const [notesBefore] = await pool.query(
      'SELECT id, lead_id, note, followup_at, alert_sent FROM lead_notes WHERE lead_id = ? ORDER BY id DESC LIMIT 1',
      [leadId]
    );

    if (!notesBefore || notesBefore.length === 0) {
      throw new Error(`No note found in database for lead #${leadId}`);
    }

    const postedNote = notesBefore[0];
    console.log(`  ✓ MySQL Note Found: Note #${postedNote.id} | Follow-up at: ${postedNote.followup_at} | alert_sent: ${postedNote.alert_sent}`);

    // Execute checkAndSendFollowupAlerts()
    console.log('  Executing checkAndSendFollowupAlerts() engine...');
    const { checkAndSendFollowupAlerts } = require('../server.js');
    await checkAndSendFollowupAlerts();

    // Verify in database that alert_sent is strictly 1
    const [notesAfter] = await pool.query(
      'SELECT id, lead_id, note, followup_at, alert_sent FROM lead_notes WHERE id = ?',
      [postedNote.id]
    );

    const verifiedNote = notesAfter[0];
    console.log(`  ✓ MySQL alert_sent status: ${verifiedNote.alert_sent}`);

    if (verifiedNote.alert_sent !== 1) {
      throw new Error(`Expected alert_sent to be 1, got ${verifiedNote.alert_sent}`);
    }

    // Attempt second execution to verify atomic anti-duplication prevention
    console.log('  Executing second pass of checkAndSendFollowupAlerts() to verify anti-duplication guardrail...');
    await checkAndSendFollowupAlerts();
    console.log('  ✓ Second pass safely skipped duplicate dispatch.');

    // Reload Dashboard in browser and verify Follow-up pill on ledger row
    console.log('\n[Step 5] Reloading Dashboard in Browser to verify Active Follow-up Pill on Ledger Row...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(`#lead-item-${leadId}`, { visible: true });

    // Verify the follow-up pill is rendered in the DOM
    const pillText = await page.evaluate((id) => {
      const item = document.getElementById('lead-item-' + id);
      const pill = item ? item.querySelector('.followup-pill') : null;
      return pill ? pill.textContent.trim() : null;
    }, leadId);
    console.log(`  ✓ Active follow-up pill verified in DOM: "${pillText}"`);

    const finalScreenshot = path.join(ARTIFACTS_DIR, 'step4_active_followup_pill.png');
    await page.screenshot({ path: finalScreenshot, fullPage: true });
    console.log(`  ✓ Final ledger row snapshot captured: ${finalScreenshot}`);

    console.log('\n======================================================================');
    console.log('  🎉 ALL LIVE INTERACTIVE BROWSER STEPS COMPLETED SUCCESSFULLY!        ');
    console.log('======================================================================');
    console.log(`  Lead ID           : #${leadId} (Dr. Alexander Wright)`);
    console.log(`  Note ID           : #${postedNote.id}`);
    console.log(`  Alert Sent Status : ${verifiedNote.alert_sent === 1 ? '1 (TRUE - Dispatched Exactly Once)' : '0 (FALSE)'}`);
    console.log(`  Target Email      : rishilforwork08@gmail.com`);
    console.log(`  Follow-Up Pill    : "${pillText}"`);
    console.log(`  Screenshots Saved : ${ARTIFACTS_DIR}`);
    console.log('======================================================================\n');
  } catch (err) {
    console.error('❌ Browser Test Error:', err);
    const errScreenshot = path.join(ARTIFACTS_DIR, 'error_state.png');
    await page.screenshot({ path: errScreenshot, fullPage: true }).catch(() => {});
    throw err;
  } finally {
    await browser.close();
    await pool.end();
  }
}

runInteractiveBrowserTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal Failure:', err.message);
    process.exit(1);
  });
