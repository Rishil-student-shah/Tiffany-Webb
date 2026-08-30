/**
 * Challenger Milestone 1 Comprehensive Empirical Verification Suite
 * Executes rigorous empirical checks on the MySQL database and seed integrity.
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { setup } = require('../setup-db');

async function runChallengerVerification() {
  console.log('================================================================');
  console.log('  CHALLENGER EMPIRICAL VERIFICATION SUITE — MILESTONE 1         ');
  console.log('================================================================\n');

  // Step 1: Ensure fresh database setup and seeding
  console.log('[1/7] Ensuring database schema and seeds are freshly applied...');
  await setup();

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

  const results = [];

  function record(checkId, title, pass, details = {}) {
    results.push({ checkId, title, pass, details });
    if (pass) {
      console.log(`  ✓ [PASS] [${checkId}] ${title}`);
    } else {
      console.error(`  ✗ [FAIL] [${checkId}] ${title}`);
      console.error('    Details:', JSON.stringify(details, null, 2));
    }
  }

  try {
    // -------------------------------------------------------------------------
    // CHECK 1: Exactly 20 Speaking Topics across 4 tracks with valid colors & audiences
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 1: 20 Speaking Topics Across 4 Tracks ---');
    const [topicPages] = await pool.query("SELECT id FROM website_pages WHERE slug = 'speaking-topics'");
    if (topicPages.length === 0) {
      record('C1.1', 'Speaking topics page exists', false, { error: 'Page not found' });
    } else {
      const pageId = topicPages[0].id;
      const [topics] = await pool.query(
        "SELECT * FROM website_collections WHERE page_id = ? AND section_name = 'topics_list' ORDER BY sort_order ASC",
        [pageId]
      );

      record('C1.1', 'Total speaking topics count equals 20', topics.length === 20, { count: topics.length });

      // Track breakdown
      const trackMap = {
        'Prevention & Awareness': { expected: 5, color: '#0E6B54', items: [] },
        'Treatment & Recovery': { expected: 8, color: '#C8A24C', items: [] },
        'Family & Community': { expected: 4, color: '#C15427', items: [] },
        'Creative Engagement': { expected: 3, color: '#4A3B69', items: [] }
      };

      let allColorsMatch = true;
      let allAudiencesValid = true;
      let allPrefillsValid = true;
      let allPendingMarked = true;

      for (const t of topics) {
        if (!trackMap[t.category]) {
          record('C1.2', `Unknown track category: ${t.category}`, false, { topic: t.title });
          continue;
        }
        trackMap[t.category].items.push(t);

        if (t.badge !== trackMap[t.category].color) {
          allColorsMatch = false;
        }

        if (!t.content_html || !t.content_html.includes('<strong>Audience:</strong>')) {
          allAudiencesValid = false;
        }

        if (!t.link_url || !t.link_url.startsWith('/work-with-tiffany?topic=')) {
          allPrefillsValid = false;
        }

        if (!t.content_html || !t.content_html.includes('[CONTENT-PENDING]')) {
          allPendingMarked = false;
        }
      }

      for (const [trackName, config] of Object.entries(trackMap)) {
        record(
          `C1.Track.${trackName.substring(0, 4)}`,
          `Track "${trackName}" has exactly ${config.expected} topics`,
          config.items.length === config.expected,
          { count: config.items.length, expected: config.expected }
        );
      }

      record('C1.3', 'All track color badges match brand color codes', allColorsMatch);
      record('C1.4', 'All topics specify explicit Audience descriptions', allAudiencesValid);
      record('C1.5', 'All topics have valid /work-with-tiffany?topic= prefill URLs', allPrefillsValid);
      record('C1.6', 'All topics have [CONTENT-PENDING] marked for session lengths', allPendingMarked);
    }

    // -------------------------------------------------------------------------
    // CHECK 2: 4 Capabilities with Deep-Link Anchor Slugs
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 2: 4 Capabilities with Deep-Link Anchor Slugs ---');
    const [servicesPages] = await pool.query("SELECT id FROM website_pages WHERE slug = 'services'");
    if (servicesPages.length === 0) {
      record('C2.1', 'Services page exists', false, { error: 'Page not found' });
    } else {
      const pageId = servicesPages[0].id;
      const [capabilities] = await pool.query(
        "SELECT * FROM website_collections WHERE page_id = ? AND section_name = 'capabilities' ORDER BY sort_order ASC",
        [pageId]
      );

      record('C2.1', 'Total capabilities count equals 4', capabilities.length === 4, { count: capabilities.length });

      const expectedSlugs = [
        'strategic-advisor',
        'program-architect',
        'community-impact-strategist',
        'speaker-facilitator'
      ];

      const actualSlugs = capabilities.map(c => c.item_slug);
      const slugsMatch = expectedSlugs.every(s => actualSlugs.includes(s)) && actualSlugs.length === 4;

      record('C2.2', 'Capability deep-link anchor slugs match specification', slugsMatch, { actualSlugs, expectedSlugs });

      const allHaveContent = capabilities.every(c => c.title && c.subtitle && c.content_html);
      record('C2.3', 'All capabilities have complete title, subtitle, and HTML scope description', allHaveContent);
    }

    // -------------------------------------------------------------------------
    // CHECK 3: Press Bios & Stage Intro Script in Third-Person
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 3: Press Bios & Stage Intro Script (Third-Person) ---');
    const [mediaPages] = await pool.query("SELECT id FROM website_pages WHERE slug = 'media'");
    if (mediaPages.length === 0) {
      record('C3.1', 'Media page exists', false, { error: 'Page not found' });
    } else {
      const pageId = mediaPages[0].id;
      const [bios] = await pool.query(
        "SELECT * FROM website_collections WHERE page_id = ? AND section_name = 'media_bios' ORDER BY sort_order ASC",
        [pageId]
      );

      record('C3.1', 'Media bios count equals 3 (Short, Medium, Long)', bios.length === 3, { count: bios.length });

      // First-person pronoun check in bios (must be zero)
      const firstPersonRegex = /\b(I|me|my|mine|we|us|our|ours)\b/i;
      let biosThirdPerson = true;
      const bioViolations = [];

      for (const b of bios) {
        if (firstPersonRegex.test(b.content_html)) {
          biosThirdPerson = false;
          bioViolations.push({ title: b.title, content: b.content_html });
        }
      }

      record('C3.2', 'All 3 media bios are strictly written in third-person', biosThirdPerson, { bioViolations });

      // Stage intro script check
      const [introRows] = await pool.query(
        "SELECT content_value FROM website_content WHERE page_id = ? AND section = 'intro_script' AND key_name = 'script_text'",
        [pageId]
      );

      const introExists = introRows.length > 0 && introRows[0].content_value;
      record('C3.3', 'Stage intro script exists in website_content', !!introExists);

      if (introExists) {
        const script = introRows[0].content_value;
        const introHasWelcome = script.includes('Please welcome Tiffany Webb') || script.includes('welcome Tiffany Webb');
        const introThirdPerson = script.includes('Our next speaker') && script.includes("She's a public-health educator");
        record('C3.4', 'Stage intro script is structured as emcee third-person introduction', introHasWelcome && introThirdPerson, { script });
      }
    }

    // -------------------------------------------------------------------------
    // CHECK 4: Empty Sections Suppression (is_active = 0 or 0 items)
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 4: Empty Sections Suppression (Constraint C7) ---');

    const emptySectionChecks = [
      { page: 'about', section: 'affiliations', collectionName: 'affiliations_list' },
      { page: 'services', section: 'faqs', collectionName: 'faqs_list' },
      { page: 'impact', section: 'upcoming', collectionName: 'upcoming_engagements' },
      { page: 'impact', section: 'past', collectionName: 'past_engagements' },
      { page: 'impact', section: 'stories', collectionName: 'outcome_stories' },
      { page: 'impact', section: 'testimonials', collectionName: 'testimonials' },
      { page: 'work-with-tiffany', section: 'faqs', collectionName: 'booking_faqs' }
    ];

    for (const chk of emptySectionChecks) {
      const [pages] = await pool.query('SELECT id FROM website_pages WHERE slug = ?', [chk.page]);
      if (pages.length === 0) {
        record(`C4.${chk.page}.${chk.section}`, `Page ${chk.page} exists`, false);
        continue;
      }
      const pageId = pages[0].id;

      // Check section_is_active in website_content
      const [contentRows] = await pool.query(
        'SELECT content_value FROM website_content WHERE page_id = ? AND section = ? AND key_name = "section_is_active"',
        [pageId, chk.section]
      );

      const isActiveVal = contentRows.length > 0 ? contentRows[0].content_value : null;
      const isContentSuppressed = isActiveVal === '0' || isActiveVal === 'false' || isActiveVal === 0;

      // Check collection items count
      const [colRows] = await pool.query(
        'SELECT COUNT(*) as count FROM website_collections WHERE page_id = ? AND section_name = ?',
        [pageId, chk.collectionName]
      );

      const colCount = colRows[0].count;
      const isSuppressed = isContentSuppressed && colCount === 0;

      record(
        `C4.${chk.page}.${chk.section}`,
        `Empty section "${chk.page}/${chk.section}" is suppressed (section_is_active=0, items=0)`,
        isSuppressed,
        { section_is_active: isActiveVal, collectionCount: colCount }
      );
    }

    // -------------------------------------------------------------------------
    // CHECK 5: No Speaking Fees & No Forbidden Personal Emails
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 5: Brand Constraints (Zero Speaking Fees & Authorized Email) ---');

    // 5.1 Forbidden personal email domains (gmail, yahoo, hotmail, etc.)
    const [emailContentMatches] = await pool.query(`
      SELECT section, key_name, content_value 
      FROM website_content 
      WHERE content_value REGEXP '(gmail|yahoo|hotmail|outlook|icloud|aol)\\\\.com'
    `);
    const [emailCollectionMatches] = await pool.query(`
      SELECT section_name, title, content_html, link_url 
      FROM website_collections 
      WHERE content_html REGEXP '(gmail|yahoo|hotmail|outlook|icloud|aol)\\\\.com'
         OR link_url REGEXP '(gmail|yahoo|hotmail|outlook|icloud|aol)\\\\.com'
    `);

    const noForbiddenEmails = emailContentMatches.length === 0 && emailCollectionMatches.length === 0;
    record('C5.1', 'Zero forbidden personal email domains exist in DB content/collections', noForbiddenEmails, {
      contentMatches: emailContentMatches,
      collectionMatches: emailCollectionMatches
    });

    // 5.2 Authoritative contact email check
    const [authEmailRows] = await pool.query(`
      SELECT section, key_name, content_value 
      FROM website_content 
      WHERE key_name = 'email'
    `);
    const allAuthEmailValid = authEmailRows.length > 0 && authEmailRows.every(r => r.content_value === 'booking@tiffanywebb.com');
    record('C5.2', 'All explicit public email fields point to authoritative "booking@tiffanywebb.com"', allAuthEmailValid, {
      emails: authEmailRows
    });

    // 5.3 Fee amounts check in copy text
    const [feeContentMatches] = await pool.query(`
      SELECT section, key_name, content_value 
      FROM website_content 
      WHERE content_value REGEXP '\\\\$[0-9]+|honorarium|[0-9]+k fee'
    `);
    const [feeCollectionMatches] = await pool.query(`
      SELECT section_name, title, content_html 
      FROM website_collections 
      WHERE content_html REGEXP '\\\\$[0-9]+|honorarium|[0-9]+k fee'
    `);

    const noFeesInCopy = feeContentMatches.length === 0 && feeCollectionMatches.length === 0;
    record('C5.3', 'Zero speaking fees or dollar pricing figures exist in database copy', noFeesInCopy, {
      contentMatches: feeContentMatches,
      collectionMatches: feeCollectionMatches
    });

    // -------------------------------------------------------------------------
    // CHECK 6: Relational Integrity & Schema Conformance
    // -------------------------------------------------------------------------
    console.log('\n--- CHECK 6: Schema & Relational Integrity ---');

    const [pageRows] = await pool.query('SELECT slug FROM website_pages');
    const pageSlugs = pageRows.map(p => p.slug);
    const expectedPageSlugs = ['home', 'about', 'services', 'speaking-topics', 'impact', 'media', 'work-with-tiffany', 'insights', 'privacy', 'terms', 'newsletter'];
    const allPagesExist = expectedPageSlugs.every(s => pageSlugs.includes(s));

    record('C6.1', 'All 11 canonical website pages exist in website_pages', allPagesExist, {
      total: pageSlugs.length,
      missing: expectedPageSlugs.filter(s => !pageSlugs.includes(s))
    });

    // Orphan check: any website_content or website_collections with invalid page_id
    const [orphanContent] = await pool.query(`
      SELECT c.id, c.page_id, c.section FROM website_content c
      LEFT JOIN website_pages p ON c.page_id = p.id
      WHERE p.id IS NULL
    `);
    const [orphanCollections] = await pool.query(`
      SELECT col.id, col.page_id, col.section_name FROM website_collections col
      LEFT JOIN website_pages p ON col.page_id = p.id
      WHERE p.id IS NULL
    `);

    record('C6.2', 'Relational integrity: 0 orphan content or collection rows', orphanContent.length === 0 && orphanCollections.length === 0, {
      orphanContentCount: orphanContent.length,
      orphanCollectionsCount: orphanCollections.length
    });

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    const totalChecks = results.length;
    const passedChecks = results.filter(r => r.pass).length;
    const failedChecks = results.filter(r => !r.pass).length;

    console.log('\n================================================================');
    console.log(`  VERIFICATION SUMMARY: ${passedChecks}/${totalChecks} PASSED (${failedChecks} FAILED)`);
    console.log('================================================================\n');

    if (failedChecks === 0) {
      console.log('>>> VERDICT: APPROVE <<<');
    } else {
      console.log('>>> VERDICT: REQUEST_CHANGES <<<');
    }

    await pool.end();
    return { totalChecks, passedChecks, failedChecks, results };

  } catch (error) {
    console.error('Fatal error during challenger verification:', error);
    await pool.end().catch(() => {});
    throw error;
  }
}

if (require.main === module) {
  runChallengerVerification()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runChallengerVerification };
