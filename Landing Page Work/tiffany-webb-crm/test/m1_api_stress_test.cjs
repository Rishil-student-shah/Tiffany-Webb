/**
 * Milestone 1 Comprehensive Empirical Stress Test Suite
 * Tiffany Webb CRM REST APIs & Inbound Lead Validation
 */

const http = require('http');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TEST_PORT = process.env.PORT || 3000;

// Import Express app (this triggers server startup on TEST_PORT)
const app = require('../server.js');

let pool;

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  testCases: []
};

function recordTest(category, name, passed, details) {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`  ✓ [PASS] [${category}] ${name}`);
  } else {
    results.failed++;
    console.error(`  ✗ [FAIL] [${category}] ${name}`);
    console.error(`     Details:`, details);
  }
  results.testCases.push({ category, name, passed, details });
}

function makeRequest(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    let postData = null;
    if (body !== null) {
      if (typeof body === 'string') {
        postData = body;
      } else {
        postData = JSON.stringify(body);
      }
      defaultHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: reqPath,
      method: method,
      headers: defaultHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: json,
          rawBody: data
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function waitForServer(maxAttempts = 20, delayMs = 250) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await makeRequest('GET', '/api/content/about');
      if (res.statusCode === 200) {
        console.log(`[INFO] Server is healthy and responding on port ${TEST_PORT}.`);
        return true;
      }
    } catch (e) {
      // wait and retry
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error(`Server failed to start on port ${TEST_PORT} within timeout.`);
}

async function runEmpiricalTests() {
  console.log('===============================================================');
  console.log('  MILESTONE 1 EMPIRICAL REST API & LEAD STRESS TEST HARNESS    ');
  console.log('===============================================================\n');

  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tiffany_crm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });

  const createdLeadIds = [];

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: GET /api/content/:slug (All 7 Inner Pages + Home)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 1: GET /api/content/:slug (7 Inner Pages & Home) ---');

    const innerPages = [
      { slug: 'about', expectedSections: ['hero', 'specialism', 'credentials'], expectedCollections: ['story_vignettes', 'values_list'] },
      { slug: 'services', expectedSections: ['hero', 'gear_method', 'working_steps'], expectedCollections: ['capabilities', 'gear_steps', 'engagement_formats'] },
      { slug: 'speaking-topics', expectedSections: ['hero', 'filter_bar'], expectedCollections: ['topics_list'] },
      { slug: 'impact', expectedSections: ['hero', 'aggregate_band', 'practice'], expectedCollections: [] },
      { slug: 'media', expectedSections: ['hero', 'intro_script', 'talking_points'], expectedCollections: ['media_bios', 'media_downloads'] },
      { slug: 'work-with-tiffany', expectedSections: ['hero', 'contact_info', 'booking_form'], expectedCollections: ['booking_next_steps'] },
      { slug: 'insights', expectedSections: ['hero', 'newsletter'], expectedCollections: ['articles'] },
      { slug: 'home', expectedSections: ['hero', 'meet_tiffany', 'footer'], expectedCollections: ['capabilities_preview'] }
    ];

    for (const p of innerPages) {
      const res = await makeRequest('GET', `/api/content/${p.slug}`);
      const is200 = res.statusCode === 200;
      const hasPageData = res.body && res.body.success === true && res.body.page && res.body.page.slug === p.slug;
      const hasContent = res.body && typeof res.body.content === 'object';
      const hasCollections = res.body && typeof res.body.collections === 'object';

      let sectionsMatch = true;
      for (const s of p.expectedSections) {
        if (!res.body.content || !res.body.content[s]) {
          sectionsMatch = false;
        }
      }

      let collectionsMatch = true;
      for (const c of p.expectedCollections) {
        if (!res.body.collections || !Array.isArray(res.body.collections[c])) {
          collectionsMatch = false;
        }
      }

      const passed = is200 && hasPageData && hasContent && hasCollections && sectionsMatch && collectionsMatch;
      recordTest('Content API', `GET /api/content/${p.slug}`, passed, {
        statusCode: res.statusCode,
        pageSlug: res.body?.page?.slug,
        missingSections: p.expectedSections.filter(s => !res.body?.content?.[s]),
        missingCollections: p.expectedCollections.filter(c => !Array.isArray(res.body?.collections?.[c]))
      });
    }

    // -------------------------------------------------------------------------
    // TEST SUITE 2: GET /api/content/:slug (Edge Cases & Attacks)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: GET /api/content/:slug Edge Cases & Attack Payloads ---');

    // 2.1 Non-existent slug
    const res404 = await makeRequest('GET', '/api/content/this-page-does-not-exist-9999');
    recordTest('Content API Edge Case', 'GET non-existent slug returns 404', res404.statusCode === 404 && res404.body.success === false, {
      statusCode: res404.statusCode,
      body: res404.body
    });

    // 2.2 SQL Injection slug: ' OR 1=1 --
    const resSqlSlug = await makeRequest('GET', '/api/content/%27%20OR%201%3D1%20--');
    recordTest('Content API Security', 'SQL Injection in slug returns 404 (safe parameterized query)', resSqlSlug.statusCode === 404 && resSqlSlug.body.success === false, {
      statusCode: resSqlSlug.statusCode,
      body: resSqlSlug.body
    });

    // 2.3 Path Traversal slug: ../../etc/passwd
    const resTraversal = await makeRequest('GET', '/api/content/..%2F..%2Fetc%2Fpasswd');
    recordTest('Content API Security', 'Path traversal slug handled safely (returns 404)', resTraversal.statusCode === 404 || resTraversal.statusCode === 400, {
      statusCode: resTraversal.statusCode
    });

    // 2.4 XSS Payload in slug
    const resXssSlug = await makeRequest('GET', '/api/content/%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    recordTest('Content API Security', 'XSS payload in slug returns 404', resXssSlug.statusCode === 404, {
      statusCode: resXssSlug.statusCode
    });

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Specialized Public Endpoints
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: Specialized Endpoints (/speaking-topics, /capabilities, /articles) ---');

    // 3.1 /api/speaking-topics
    const resTopics = await makeRequest('GET', '/api/speaking-topics');
    const topicsOk = resTopics.statusCode === 200 &&
      resTopics.body.success === true &&
      resTopics.body.count === 20 &&
      Array.isArray(resTopics.body.topics) &&
      resTopics.body.topics.length === 20 &&
      Array.isArray(resTopics.body.tracks) &&
      resTopics.body.tracks.length === 4;
    
    // Check distribution
    const trackCounts = {};
    if (resTopics.body.topics) {
      resTopics.body.topics.forEach(t => {
        trackCounts[t.track] = (trackCounts[t.track] || 0) + 1;
      });
    }
    const trackDistributionOk = trackCounts['Prevention & Awareness'] === 5 &&
                                trackCounts['Treatment & Recovery'] === 8 &&
                                trackCounts['Family & Community'] === 4 &&
                                trackCounts['Creative Engagement'] === 3;

    recordTest('Specialized API', 'GET /api/speaking-topics returns exactly 20 topics with 4-track distribution (5, 8, 4, 3)', topicsOk && trackDistributionOk, {
      statusCode: resTopics.statusCode,
      totalCount: resTopics.body.count,
      trackCounts
    });

    // 3.2 /api/capabilities
    const resCap = await makeRequest('GET', '/api/capabilities');
    const capOk = resCap.statusCode === 200 &&
      resCap.body.success === true &&
      resCap.body.count === 4 &&
      Array.isArray(resCap.body.capabilities) &&
      resCap.body.capabilities.length === 4;
    
    const expectedCapSlugs = ['strategic-advisor', 'program-architect', 'community-impact-strategist', 'speaker-facilitator'];
    const actualCapSlugs = resCap.body.capabilities ? resCap.body.capabilities.map(c => c.item_slug) : [];
    const slugsMatch = expectedCapSlugs.every(s => actualCapSlugs.includes(s));

    recordTest('Specialized API', 'GET /api/capabilities returns 4 capabilities with deep-link slugs', capOk && slugsMatch, {
      statusCode: resCap.statusCode,
      count: resCap.body.count,
      actualCapSlugs
    });

    // 3.3 /api/articles
    const resArticles = await makeRequest('GET', '/api/articles');
    const artOk = resArticles.statusCode === 200 &&
      resArticles.body.success === true &&
      resArticles.body.total === 3 &&
      Array.isArray(resArticles.body.articles) &&
      resArticles.body.articles.length === 3;

    recordTest('Specialized API', 'GET /api/articles returns 3 seed articles', artOk, {
      statusCode: resArticles.statusCode,
      total: resArticles.body.total
    });

    // -------------------------------------------------------------------------
    // TEST SUITE 4: GET /api/collections/:slug/:section
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: GET /api/collections/:slug/:section ---');

    const collectionsToTest = [
      { slug: 'about', section: 'story_vignettes', expectedCount: 6 },
      { slug: 'about', section: 'values_list', expectedCount: 5 },
      { slug: 'services', section: 'capabilities', expectedCount: 4 },
      { slug: 'services', section: 'gear_steps', expectedCount: 4 },
      { slug: 'services', section: 'engagement_formats', expectedCount: 6 },
      { slug: 'speaking-topics', section: 'topics_list', expectedCount: 20 },
      { slug: 'media', section: 'media_bios', expectedCount: 3 },
      { slug: 'media', section: 'media_downloads', expectedCount: 3 },
      { slug: 'work-with-tiffany', section: 'booking_next_steps', expectedCount: 4 },
      { slug: 'insights', section: 'articles', expectedCount: 3 }
    ];

    for (const c of collectionsToTest) {
      const res = await makeRequest('GET', `/api/collections/${c.slug}/${c.section}`);
      const passed = res.statusCode === 200 &&
        res.body.success === true &&
        res.body.count === c.expectedCount &&
        Array.isArray(res.body.items) &&
        res.body.items.length === c.expectedCount;
      
      recordTest('Collections API', `GET /api/collections/${c.slug}/${c.section} returns ${c.expectedCount} items`, passed, {
        statusCode: res.statusCode,
        count: res.body.count,
        itemsLength: res.body.items?.length
      });
    }

    // Collection edge cases:
    const resCol404 = await makeRequest('GET', '/api/collections/non-existent-page-9999/items');
    recordTest('Collections API Edge Case', 'GET /api/collections with invalid page returns 404', resCol404.statusCode === 404, {
      statusCode: resCol404.statusCode
    });

    const resColEmpty = await makeRequest('GET', '/api/collections/about/non_existent_section');
    recordTest('Collections API Edge Case', 'GET /api/collections with non-existent section returns empty items array (200 OK)', resColEmpty.statusCode === 200 && resColEmpty.body.count === 0 && resColEmpty.body.items.length === 0, {
      statusCode: resColEmpty.statusCode,
      body: resColEmpty.body
    });

    // -------------------------------------------------------------------------
    // TEST SUITE 5: POST /api/leads Validation & Ingestion
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 5: POST /api/leads (Validation, Error Codes, Ingestion) ---');

    // 5.1 Valid full submission
    const validFullPayload = {
      contact_name: 'Dr. Marcus Vance',
      organization_name: 'Great Lakes Public Health Council',
      email: 'm.vance@glhealth.org',
      country_code: '+1',
      phone: '312-555-0199',
      event_type: 'Conference Keynote',
      event_date: '2026-11-15',
      event_location: 'Chicago, IL',
      estimated_audience_size: '500+ Attendees',
      message: 'Requesting Tiffany Webb as keynote speaker for annual problem gambling awareness conference.',
      source: 'empirical_test_suite'
    };

    const resValidFull = await makeRequest('POST', '/api/leads', validFullPayload);
    const validFullPassed = resValidFull.statusCode === 201 &&
      resValidFull.body.success === true &&
      typeof resValidFull.body.lead_id === 'number';
    
    if (validFullPassed) createdLeadIds.push(resValidFull.body.lead_id);

    recordTest('Leads API', 'POST /api/leads with full valid payload returns 201 Created', validFullPassed, {
      statusCode: resValidFull.statusCode,
      body: resValidFull.body
    });

    // 5.2 Valid minimal submission (only required fields)
    const validMinimalPayload = {
      contact_name: 'Elena Rostova',
      organization_name: 'Midwest Youth Wellness',
      email: 'elena@midwestyouth.org',
      event_type: 'Workshop / Training'
    };

    const resValidMin = await makeRequest('POST', '/api/leads', validMinimalPayload);
    const validMinPassed = resValidMin.statusCode === 201 &&
      resValidMin.body.success === true &&
      typeof resValidMin.body.lead_id === 'number';

    if (validMinPassed) createdLeadIds.push(resValidMin.body.lead_id);

    recordTest('Leads API', 'POST /api/leads with minimal valid payload returns 201 Created', validMinPassed, {
      statusCode: resValidMin.statusCode,
      body: resValidMin.body
    });

    // 5.3 Missing contact_name -> 422 Unprocessable Entity
    const missingNamePayload = {
      organization_name: 'Acme Health',
      email: 'contact@acmehealth.com',
      event_type: 'Keynote'
    };
    const resMissingName = await makeRequest('POST', '/api/leads', missingNamePayload);
    recordTest('Leads Validation', 'POST /api/leads missing contact_name returns 422 with validation error', resMissingName.statusCode === 422 && resMissingName.body.success === false && resMissingName.body.errors?.length > 0, {
      statusCode: resMissingName.statusCode,
      body: resMissingName.body
    });

    // 5.4 Missing organization_name -> 422
    const missingOrgPayload = {
      contact_name: 'John Doe',
      email: 'john@example.com',
      event_type: 'Keynote'
    };
    const resMissingOrg = await makeRequest('POST', '/api/leads', missingOrgPayload);
    recordTest('Leads Validation', 'POST /api/leads missing organization_name returns 422', resMissingOrg.statusCode === 422 && resMissingOrg.body.success === false, {
      statusCode: resMissingOrg.statusCode,
      body: resMissingOrg.body
    });

    // 5.5 Missing email -> 422
    const missingEmailPayload = {
      contact_name: 'John Doe',
      organization_name: 'Acme Org',
      event_type: 'Keynote'
    };
    const resMissingEmail = await makeRequest('POST', '/api/leads', missingEmailPayload);
    recordTest('Leads Validation', 'POST /api/leads missing email returns 422', resMissingEmail.statusCode === 422 && resMissingEmail.body.success === false, {
      statusCode: resMissingEmail.statusCode,
      body: resMissingEmail.body
    });

    // 5.6 Missing event_type -> 422
    const missingEventTypePayload = {
      contact_name: 'John Doe',
      organization_name: 'Acme Org',
      email: 'john@example.com'
    };
    const resMissingEvent = await makeRequest('POST', '/api/leads', missingEventTypePayload);
    recordTest('Leads Validation', 'POST /api/leads missing event_type returns 422', resMissingEvent.statusCode === 422 && resMissingEvent.body.success === false, {
      statusCode: resMissingEvent.statusCode,
      body: resMissingEvent.body
    });

    // 5.7 Empty payload -> 422 with 4 validation errors
    const resEmpty = await makeRequest('POST', '/api/leads', {});
    recordTest('Leads Validation', 'POST /api/leads empty body returns 422 with multiple errors', resEmpty.statusCode === 422 && resEmpty.body.errors?.length >= 4, {
      statusCode: resEmpty.statusCode,
      errorsCount: resEmpty.body.errors?.length,
      errors: resEmpty.body.errors
    });

    // 5.8 Short field lengths (< 2 chars)
    const shortFieldPayload = {
      contact_name: 'A',
      organization_name: 'B',
      email: 'test@example.com',
      event_type: 'Keynote'
    };
    const resShort = await makeRequest('POST', '/api/leads', shortFieldPayload);
    recordTest('Leads Validation', 'POST /api/leads single character name/org rejected with 422', resShort.statusCode === 422 && resShort.body.errors?.length >= 2, {
      statusCode: resShort.statusCode,
      errors: resShort.body.errors
    });

    // 5.9 Invalid email formats test matrix
    const invalidEmails = [
      'plainaddress',
      'user@',
      '@domain.com',
      'user@domain',
      'user@.com',
      'user spaces@domain.com'
    ];

    for (const badEmail of invalidEmails) {
      const resBadEmail = await makeRequest('POST', '/api/leads', {
        contact_name: 'Valid Name',
        organization_name: 'Valid Org',
        email: badEmail,
        event_type: 'Keynote'
      });
      const passed = resBadEmail.statusCode === 422;
      recordTest('Leads Email Regex', `POST /api/leads with invalid email "${badEmail}" returns 422`, passed, {
        email: badEmail,
        statusCode: resBadEmail.statusCode,
        errors: resBadEmail.body.errors
      });
    }

    // 5.10 Whitespace only fields
    const resWhitespace = await makeRequest('POST', '/api/leads', {
      contact_name: '   ',
      organization_name: '   ',
      email: '   ',
      event_type: '   '
    });
    recordTest('Leads Validation', 'POST /api/leads with whitespace-only values trimmed and rejected (422)', resWhitespace.statusCode === 422 && resWhitespace.body.errors?.length >= 4, {
      statusCode: resWhitespace.statusCode,
      errors: resWhitespace.body.errors
    });

    // -------------------------------------------------------------------------
    // TEST SUITE 6: Security Stress Testing (SQL Injection, XSS, Overflow)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 6: Security & Adversarial Stress Testing ---');

    // 6.1 SQL Injection payloads in all text fields
    const sqlInjectionPayload = {
      contact_name: "Robert'); DROP TABLE dummy_test_table; --",
      organization_name: "Union Healthcare' UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12,13,14 --",
      email: 'sqli_test@security-audit.org',
      country_code: '+1',
      phone: "312-555-0123' OR '1'='1",
      event_type: "Keynote' OR 1=1; --",
      event_date: '2026-10-20',
      event_location: "Chicago'; DROP DATABASE tiffany_crm; --",
      estimated_audience_size: "1000' OR 'a'='a",
      message: "Adversarial test message containing SQL injection tokens: '; SHUTDOWN; SELECT * FROM users WHERE '1'='1'; --",
      source: 'sqli_stress_test'
    };

    const resSqli = await makeRequest('POST', '/api/leads', sqlInjectionPayload);
    const sqliPassed = resSqli.statusCode === 201 && typeof resSqli.body.lead_id === 'number';
    if (sqliPassed) createdLeadIds.push(resSqli.body.lead_id);

    // Verify DB integrity: table leads still exists and data was parameterized
    let dbIntegrityOk = false;
    let storedLead = null;
    if (sqliPassed) {
      const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [resSqli.body.lead_id]);
      if (rows.length === 1) {
        storedLead = rows[0];
        if (storedLead.contact_name === sqlInjectionPayload.contact_name &&
            storedLead.organization_name === sqlInjectionPayload.organization_name &&
            storedLead.event_location === sqlInjectionPayload.event_location) {
          dbIntegrityOk = true;
        }
      }
    }

    recordTest('Security & Sanitization', 'SQL Injection payload safely parameterized and stored as literal string', sqliPassed && dbIntegrityOk, {
      statusCode: resSqli.statusCode,
      leadId: resSqli.body.lead_id,
      dbIntegrityOk,
      storedContactName: storedLead?.contact_name
    });

    // 6.2 Stored XSS Payloads
    const xssPayload = {
      contact_name: "<script>alert('XSS_NAME')</script> Tiffany Fan",
      organization_name: "<img src=x onerror=alert('XSS_ORG')> Illinois Prevention",
      email: 'xss_test@security-audit.org',
      event_type: "Workshop <svg/onload=alert('XSS')>",
      message: "<iframe src='javascript:alert(1)'></iframe><a href='javascript:alert(document.cookie)'>Click here</a>",
      source: 'xss_stress_test'
    };

    const resXss = await makeRequest('POST', '/api/leads', xssPayload);
    const xssPassed = resXss.statusCode === 201 && typeof resXss.body.lead_id === 'number';
    if (xssPassed) createdLeadIds.push(resXss.body.lead_id);

    let xssDbOk = false;
    if (xssPassed) {
      const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [resXss.body.lead_id]);
      if (rows.length === 1 && rows[0].contact_name === xssPayload.contact_name) {
        xssDbOk = true;
      }
    }

    recordTest('Security & XSS', 'XSS payload stored safely without corrupting server or DB state', xssPassed && xssDbOk, {
      statusCode: resXss.statusCode,
      leadId: resXss.body.lead_id,
      xssDbOk
    });

    // 6.3 Extreme String Lengths (Stress Test)
    const longMessage = 'A'.repeat(25000); // 25KB message
    const longLocation = 'Chicago '.repeat(20); // 160 chars
    const extremePayload = {
      contact_name: 'Dr. Elizabeth Alexandria Montgomery-Weatherford',
      organization_name: 'The International Association of Healthcare and Social Impact Strategy Professionals',
      email: 'elizabeth.montgomery-weatherford@international-healthcare-consortium.org',
      event_type: 'Multi-Day Executive Retreat',
      event_location: longLocation,
      message: longMessage,
      source: 'extreme_length_stress_test'
    };

    const resExtreme = await makeRequest('POST', '/api/leads', extremePayload);
    const extremePassed = resExtreme.statusCode === 201 && typeof resExtreme.body.lead_id === 'number';
    if (extremePassed) createdLeadIds.push(resExtreme.body.lead_id);

    let extremeDbOk = false;
    if (extremePassed) {
      const [rows] = await pool.query('SELECT LENGTH(message) as msgLen FROM leads WHERE id = ?', [resExtreme.body.lead_id]);
      if (rows.length === 1 && rows[0].msgLen === 25000) {
        extremeDbOk = true;
      }
    }

    recordTest('Stress & Boundary', 'Extreme string length payload (25KB message) handled and stored without truncation', extremePassed && extremeDbOk, {
      statusCode: resExtreme.statusCode,
      leadId: resExtreme.body.lead_id,
      extremeDbOk
    });

    // 6.4 Unicode & Emoji Support (4-byte UTF-8)
    const emojiPayload = {
      contact_name: 'Dr. Sarah 🌟 Jenkins 🎯',
      organization_name: 'Prevention Coalition 🏛️ (Chicago & New Orleans)',
      email: 'sarah.jenkins@coalition.org',
      event_type: 'Keynote Presentation 🎤',
      message: 'Empirical verification with special chars: äöü, 日本語, العربية, 🚀💡✨',
      source: 'unicode_emoji_test'
    };

    const resEmoji = await makeRequest('POST', '/api/leads', emojiPayload);
    const emojiPassed = resEmoji.statusCode === 201 && typeof resEmoji.body.lead_id === 'number';
    if (emojiPassed) createdLeadIds.push(resEmoji.body.lead_id);

    let emojiDbOk = false;
    if (emojiPassed) {
      const [rows] = await pool.query('SELECT contact_name, message FROM leads WHERE id = ?', [resEmoji.body.lead_id]);
      if (rows.length === 1 && rows[0].contact_name === emojiPayload.contact_name && rows[0].message === emojiPayload.message) {
        emojiDbOk = true;
      }
    }

    recordTest('Unicode / UTF8mb4', 'Full 4-byte UTF-8 & Emoji support stored and retrieved without corruption', emojiPassed && emojiDbOk, {
      statusCode: resEmoji.statusCode,
      leadId: resEmoji.body.lead_id,
      emojiDbOk
    });

    // 6.5 Invalid Date Handling
    const invalidDatePayload = {
      contact_name: 'Date Tester',
      organization_name: 'Date Testing Org',
      email: 'datetester@test.org',
      event_type: 'Consulting',
      event_date: 'not-a-valid-date-string'
    };

    const resBadDate = await makeRequest('POST', '/api/leads', invalidDatePayload);
    const badDatePassed = resBadDate.statusCode === 201 && typeof resBadDate.body.lead_id === 'number';
    if (badDatePassed) createdLeadIds.push(resBadDate.body.lead_id);

    let dateStoredAsNull = false;
    if (badDatePassed) {
      const [rows] = await pool.query('SELECT event_date FROM leads WHERE id = ?', [resBadDate.body.lead_id]);
      if (rows.length === 1 && rows[0].event_date === null) {
        dateStoredAsNull = true;
      }
    }

    recordTest('Edge Case / Date Sanitization', 'Invalid date gracefully falls back to NULL without server crash (500)', badDatePassed && dateStoredAsNull, {
      statusCode: resBadDate.statusCode,
      dateStoredAsNull
    });

    // 6.6 Malformed JSON Body
    const resMalformedJson = await makeRequest('POST', '/api/leads', '{"contact_name": "Broken JSON...', { 'Content-Type': 'application/json' });
    recordTest('Robustness / Parser', 'Malformed JSON payload returns 400 Bad Request without server crash', resMalformedJson.statusCode === 400, {
      statusCode: resMalformedJson.statusCode
    });

    // -------------------------------------------------------------------------
    // TEST SUITE 7: Database Activity Logging & Relational Verification
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 7: Database Relational Integrity & Activity Log ---');

    for (const leadId of createdLeadIds) {
      const [actRows] = await pool.query('SELECT * FROM activity_log WHERE lead_id = ?', [leadId]);
      const hasLog = actRows.length > 0 && actRows[0].action === 'lead_created';
      recordTest('DB Relational Integrity', `Activity log record verified for Lead ID ${leadId}`, hasLog, {
        leadId,
        logCount: actRows.length,
        action: actRows[0]?.action,
        detail: actRows[0]?.detail
      });
    }

    // -------------------------------------------------------------------------
    // CLEANUP TEST LEADS
    // -------------------------------------------------------------------------
    console.log('\n--- CLEANUP OF TEST ARTIFACTS ---');
    if (createdLeadIds.length > 0) {
      await pool.query(`DELETE FROM activity_log WHERE lead_id IN (${createdLeadIds.join(',')})`);
      const [delResult] = await pool.query(`DELETE FROM leads WHERE id IN (${createdLeadIds.join(',')})`);
      console.log(`✓ Cleaned up ${delResult.affectedRows} empirical test leads from database.`);
    }

    // Output summary
    console.log('\n===============================================================');
    console.log(`  TEST RESULTS: ${results.passed} / ${results.total} PASSED (${results.failed} FAILED)`);
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Fatal test runner error:', err);
    results.failed++;
  } finally {
    if (pool) await pool.end();
  }

  return results;
}

(async () => {
  try {
    await waitForServer();
    const suiteResults = await runEmpiricalTests();
    process.exit(suiteResults.failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
})();
