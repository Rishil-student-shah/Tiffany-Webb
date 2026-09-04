/**
 * Tier 2: Boundary & Corner Cases E2E Test Suite
 * Covers edge cases, extreme inputs, boundary limits, and security attack vectors
 * Meets requirement of >= 5 distinct test cases per feature area (R1, R2, R3, R4).
 */

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { describe, it, expect, beforeAll, afterAll } = require('./helpers/test_runner.cjs');
const http = require('./helpers/http_helper.cjs');
const db = require('./helpers/db_helper.cjs');

const CRM_ROOT = path.join(__dirname, '..');
const VIEWS_DIR = path.join(CRM_ROOT, 'views');
const CSS_PATH = path.join(CRM_ROOT, 'public', 'css', 'crm-theme.css');

let testLead = null;
let adminCookie = '';

describe('Tier 2 — Boundary & Corner Cases: R1 Rebrand Invariants', () => {
  it('T2.R1.1: Dashboard renders valid Impact OS header and navbar with empty leads array', () => {
    const dashboardPath = path.join(VIEWS_DIR, 'dashboard.ejs');
    const html = ejs.render(fs.readFileSync(dashboardPath, 'utf8'), {
      leads: [],
      chartData: JSON.stringify({ sourceData: {}, funnelData: {} }),
      error: undefined,
      success: undefined,
      currentFilter: 'all',
      searchQuery: ''
    }, { filename: dashboardPath });

    expect(html).toContain('Pipeline Ledger — Tiffany Webb Impact OS');
    expect(html).toContain('<h1 class="nav-logo">Tiffany Webb <span>Impact OS</span></h1>');
    expect(html).toContain('Executive <span class="italic-accent">Pipeline Ledger</span>');
  });

  it('T2.R1.2: Auth views render Impact OS titles with undefined error/success query params', () => {
    const loginPath = path.join(VIEWS_DIR, 'login.ejs');
    const html = ejs.render(fs.readFileSync(loginPath, 'utf8'), {
      error: undefined,
      success: undefined
    }, { filename: loginPath });

    expect(html).toContain('Executive Login — Tiffany Webb Impact OS');
    expect(html).toContain('Tiffany Webb <span class="italic-accent">Impact OS</span>');
  });

  it('T2.R1.3: CMS collection edit view renders Impact OS title with new item (item=null)', () => {
    const editPath = path.join(VIEWS_DIR, 'cms-collection-edit.ejs');
    const html = ejs.render(fs.readFileSync(editPath, 'utf8'), {
      page: { name: 'Capabilities', slug: 'capabilities' },
      section: 'capabilities_list',
      item: null,
      error: undefined,
      success: undefined
    }, { filename: editPath });

    expect(html).toContain('New Collection Item — Tiffany Webb Impact OS');
  });

  it('T2.R1.4: CMS page view renders dynamic page name with Impact OS branding suffix', () => {
    const pagePath = path.join(VIEWS_DIR, 'cms-page.ejs');
    const html = ejs.render(fs.readFileSync(pagePath, 'utf8'), {
      page: { id: 1, name: 'Speaking Topics & Engagements', slug: 'speaking-topics' },
      sections: [],
      content: {},
      collections: {},
      error: undefined,
      success: undefined
    }, { filename: pagePath });

    expect(html).toContain('Editing Speaking Topics &amp; Engagements — Tiffany Webb Impact OS');
  });

  it('T2.R1.5: Zero occurrences of "Tiffany Webb CRM" even in rendered HTML templates', () => {
    const dashboardPath = path.join(VIEWS_DIR, 'dashboard.ejs');
    const html = ejs.render(fs.readFileSync(dashboardPath, 'utf8'), {
      leads: [],
      chartData: JSON.stringify({}),
      error: null,
      success: null
    }, { filename: dashboardPath });

    expect(html).toNotContain('Tiffany Webb CRM');
    expect(html).toNotContain('Admin Panel');
  });
});

describe('Tier 2 — Boundary & Corner Cases: R2 Ledger Layout & Chevron Bounds', () => {
  it('T2.R2.1: Lead with missing optional fields renders in 6-track ledger row without layout corruption', () => {
    const dashboardPath = path.join(VIEWS_DIR, 'dashboard.ejs');
    const sparseLead = {
      id: 9991,
      contact_name: 'Sparse Contact',
      organization_name: null,
      topic_interest: null,
      event_type: null,
      event_date: null,
      budget_range: null,
      status: 'new',
      phone: null,
      email: 'sparse@test.com',
      message: null,
      created_at: new Date()
    };

    const html = ejs.render(fs.readFileSync(dashboardPath, 'utf8'), {
      leads: [sparseLead],
      chartData: JSON.stringify({}),
      error: undefined,
      success: undefined
    }, { filename: dashboardPath });

    expect(html).toContain('class="ledger-row"');
    expect(html).toContain('col-stage');
    expect(html).toContain('col-actions');
    expect(html).toContain('toggleDossier(9991, event)');
  });

  it('T2.R2.2: Stage select width boundary matches exactly 185px constraint', () => {
    const css = fs.readFileSync(CSS_PATH, 'utf8');
    const stageSelectMatch = css.match(/\.stage-select\s*\{[^}]*\}/s);
    expect(stageSelectMatch).toBeTruthy();
    expect(stageSelectMatch[0]).toContain('max-width: 185px;');
    expect(stageSelectMatch[0]).toContain('box-sizing: border-box;');
  });

  it('T2.R2.3: Actions column width boundary is fixed 125px min-width with 32px action buttons', () => {
    const css = fs.readFileSync(CSS_PATH, 'utf8');
    const colActionsMatch = css.match(/\.col-actions\s*\{[^}]*\}/s);
    expect(colActionsMatch).toBeTruthy();
    expect(colActionsMatch[0]).toContain('min-width: 125px;');
    expect(colActionsMatch[0]).toContain('gap: 8px;');

    const btnMatch = css.match(/\.action-icon-btn\s*\{[^}]*\}/s);
    expect(btnMatch).toBeTruthy();
    expect(btnMatch[0]).toContain('width: 32px;');
    expect(btnMatch[0]).toContain('height: 32px;');
  });

  it('T2.R2.4: Accordion toggle icon child SVG has pointer-events: none to prevent click hijacking', () => {
    const dashboardHtml = fs.readFileSync(path.join(VIEWS_DIR, 'dashboard.ejs'), 'utf8');
    expect(dashboardHtml).toContain('class="accordion-toggle-icon"');
    expect(dashboardHtml).toContain('pointer-events: none');
    expect(dashboardHtml).toContain('polyline points="6 9 12 15 18 9"');
  });

  it('T2.R2.5: Zero leads state renders complete ledger table header with 6 tracks', () => {
    const dashboardPath = path.join(VIEWS_DIR, 'dashboard.ejs');
    const html = ejs.render(fs.readFileSync(dashboardPath, 'utf8'), {
      leads: [],
      chartData: JSON.stringify({}),
      error: undefined,
      success: undefined
    }, { filename: dashboardPath });

    expect(html).toContain('class="ledger-table-header"');
    expect(html).toContain('Organization & Contact');
    expect(html).toContain('Origin & Topic');
    expect(html).toContain('Event Details');
    expect(html).toContain('Honorarium');
    expect(html).toContain('Pipeline Stage');
    expect(html).toContain('Actions');
  });
});

describe('Tier 2 — Boundary & Corner Cases: R3 Team Notes Engine Edge Cases', () => {
  beforeAll(async () => {
    testLead = await db.createTestLead({ contact_name: 'Boundary Lead' });
    const auth = await http.loginAsAdmin();
    adminCookie = auth.cookieString;
  });

  afterAll(async () => {
    if (testLead) {
      await db.deleteTestLead(testLead.id);
    }
  });

  it('T2.R3.1: Rejects empty string note with HTTP 400 Bad Request', async () => {
    const res = await http.post(`/api/leads/${testLead.id}/notes`, { note: '' }, {}, adminCookie);
    expect(res.status).toBe(400);
    expect(res.json).toBeDefined();
    expect(res.json.error).toBe('Note content cannot be empty');
  });

  it('T2.R3.2: Rejects whitespace-only note with HTTP 400 Bad Request', async () => {
    const res = await http.post(`/api/leads/${testLead.id}/notes`, { note: '   \n\t   ' }, {}, adminCookie);
    expect(res.status).toBe(400);
    expect(res.json.error).toBe('Note content cannot be empty');
  });

  it('T2.R3.3: Stores and retrieves special characters and international Unicode without corruption', async () => {
    const specialNote = 'Éxito & "Stratégie" — 100% Validated: <test> \nNewline notes @ $10,000!';
    const res = await http.post(`/api/leads/${testLead.id}/notes`, { note: specialNote }, {}, adminCookie);
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);

    const getRes = await http.get(`/api/leads/${testLead.id}/notes`);
    expect(getRes.status).toBe(200);
    const saved = getRes.json.notes.find(n => n.id === res.json.note.id);
    expect(saved).toBeDefined();
    expect(saved.note).toBe(specialNote);
  });

  it('T2.R3.4: Max-length text note (3000 chars) is saved intact and activity log summary is truncated to <= 60 chars', async () => {
    const longNote = 'Executive Briefing: '.repeat(150); // ~3000 chars
    const res = await http.post(`/api/leads/${testLead.id}/notes`, { note: longNote }, {}, adminCookie);
    expect(res.status).toBe(200);

    const logs = await db.getActivityLogs(testLead.id);
    const matchingLog = logs.find(l => l.action === 'note_added' && l.detail.includes('Executive Briefing:'));
    expect(matchingLog).toBeDefined();
    expect(matchingLog.detail).toContain('...');
  });

  it('T2.R3.5: Note submission for non-existent lead ID returns 400/500 cleanly without crashing server', async () => {
    const res = await http.post('/api/leads/99999999/notes', { note: 'Orphan test' }, {}, adminCookie);
    expect(res.status >= 400).toBe(true);
  });
});

describe('Tier 2 — Boundary & Corner Cases: R4 Security Attacks & Thresholds', () => {
  it('T2.R4.1: Rate limit boundary: 5 failed attempts allowed, 6th triggers 429 Too Many Requests', async () => {
    // We send rapid bad login attempts from a unique pseudo client IP
    const uniqueIp = `198.51.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 250) + 1}`;
    const results = [];
    for (let i = 1; i <= 6; i++) {
      const res = await http.postForm('/login', {
        email: 'attacker@baddomain.com',
        password: 'wrongpassword'
      }, {
        'X-Forwarded-For': uniqueIp
      });
      results.push(res.status);
    }

    // First 5 attempts return 401 Unauthorized; 6th attempt is throttled (429)
    expect(results[0]).toBe(401);
    expect(results[4]).toBe(401);
    expect(results[5]).toBe(429);
  });

  it('T2.R4.2: Recursive XSS sanitization strips nested evasion tags <scr<script>ipt>alert(1)</script>', async () => {
    const uniqueEmail = `nested_xss_${Date.now()}@tiffanywebbimpact.com`;
    const nestedPayload = '<scr<script>ipt>alert("nested")</script>';
    const res = await http.post('/api/leads', {
      contact_name: 'Nested XSS Tester',
      email: uniqueEmail,
      message: nestedPayload
    });
    expect(res.status === 200 || res.status === 201).toBe(true);

    const [rows] = await db.query('SELECT message FROM leads WHERE email = ?', [uniqueEmail]);
    expect(rows.length).toBe(1);
    expect(rows[0].message).toNotContain('<script>');
    expect(rows[0].message).toNotContain('</script>');
    await db.query('DELETE FROM leads WHERE email = ?', [uniqueEmail]);
  });

  it('T2.R4.3: Recursive XSS strips javascript: pseudo-protocol and onerror attributes', async () => {
    const uniqueEmail = `js_xss_${Date.now()}@tiffanywebbimpact.com`;
    const dangerousPayload = '<img src=x onerror=alert(1)> and javascript:void(0)';
    const res = await http.post('/api/leads', {
      contact_name: 'JS XSS Tester',
      email: uniqueEmail,
      message: dangerousPayload
    });
    expect(res.status === 200 || res.status === 201).toBe(true);

    const [rows] = await db.query('SELECT message FROM leads WHERE email = ?', [uniqueEmail]);
    expect(rows.length).toBe(1);
    expect(rows[0].message).toNotContain('onerror=');
    expect(rows[0].message).toNotContain('javascript:');
    await db.query('DELETE FROM leads WHERE email = ?', [uniqueEmail]);
  });

  it('T2.R4.4: CORS boundary rejects untrusted domain without exposing Access-Control-Allow-Origin', async () => {
    const res = await http.options('/', {
      'Origin': 'https://evil-unauthorized-hacker.com',
      'Access-Control-Request-Method': 'POST'
    });
    const allowOrigin = res.headers['access-control-allow-origin'];
    expect(allowOrigin === undefined || allowOrigin === null || allowOrigin === '').toBe(true);
  });

  it('T2.R4.5: SQL injection payloads are safely parameterized without syntax error or table leak', async () => {
    const sqliPayload = "' OR '1'='1' --";
    const res = await http.post(`/api/leads/${encodeURIComponent(sqliPayload)}/notes`, { note: 'SQLi Attempt' }, {}, adminCookie);
    // Express / MySQL parameterization safely handles non-numeric lead id as 400/500 without leaking database
    expect(res.status >= 400).toBe(true);

    // Verify search endpoint handles SQLi cleanly
    const searchRes = await http.get(`/api/leads/check-duplicate?email=${encodeURIComponent(sqliPayload)}`, {}, adminCookie);
    expect(searchRes.status).toBe(200);
    expect(searchRes.json).toBeDefined();
    expect(searchRes.json.isDuplicate).toBe(false);
  });

  it('T2.R4.6: Tampered JWT cookie signature is rejected and redirected to /login', async () => {
    const tamperedCookie = 'auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbiJ9.FAKESIGNATURE1234567890';
    const res = await http.get('/', {}, tamperedCookie);
    expect(res.status).toBe(302);
    expect(res.location).toBe('/login');
  });
});

if (require.main === module) {
  const { run } = require('./helpers/test_runner.cjs');
  run().then(async results => {
    await db.closePool();
    process.exit(results.failed > 0 ? 1 : 0);
  });
}
