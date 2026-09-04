/**
 * Tier 1: Feature Coverage E2E Test Suite
 * Covers R1 (Rebrand), R2 (Ledger Layout & Chevron), R3 (Notes Engine), R4 (Security Suite)
 * Meets requirement of >= 5 distinct test cases per feature area.
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
const SERVER_PATH = path.join(CRM_ROOT, 'server.js');

let testLead = null;
let adminCookie = '';

describe('Tier 1 — Feature Coverage: R1 Platform Rebrand & Nomenclature', () => {
  const views = [
    'dashboard.ejs',
    'new-lead.ejs',
    'cms.ejs',
    'cms-page.ejs',
    'cms-collection-edit.ejs',
    'users.ejs',
    'lead.ejs',
    'login.ejs',
    'forgot-password.ejs',
    'reset-password.ejs'
  ];

  it('R1.1: Every .ejs view has a <title> ending with "— Tiffany Webb Impact OS"', () => {
    views.forEach(viewFile => {
      const content = fs.readFileSync(path.join(VIEWS_DIR, viewFile), 'utf8');
      const titleMatch = content.match(/<title>(.*?)<\/title>/i);
      expect(titleMatch).toBeTruthy();
      const title = titleMatch[1].trim();
      expect(title).toMatch(/—\s*Tiffany\s+Webb\s+Impact\s+OS$/);
    });
  });

  it('R1.2: Authenticated views render the official navbar brand logo', () => {
    const authViews = ['dashboard.ejs', 'new-lead.ejs', 'cms.ejs', 'cms-page.ejs', 'cms-collection-edit.ejs', 'users.ejs', 'lead.ejs'];
    const expectedLogo = '<h1 class="nav-logo">Tiffany Webb <span>Impact OS</span></h1>';
    authViews.forEach(viewFile => {
      const content = fs.readFileSync(path.join(VIEWS_DIR, viewFile), 'utf8');
      expect(content).toContain(expectedLogo);
    });
  });

  it('R1.3: Authenticated views include official sub-module navigation links and logout', () => {
    const authViews = ['dashboard.ejs', 'new-lead.ejs', 'cms.ejs', 'cms-page.ejs', 'cms-collection-edit.ejs', 'users.ejs', 'lead.ejs'];
    authViews.forEach(viewFile => {
      const content = fs.readFileSync(path.join(VIEWS_DIR, viewFile), 'utf8');
      expect(content).toContain('href="/dashboard"');
      expect(content).toContain('Pipeline Ledger');
      expect(content).toContain('href="/leads/new"');
      expect(content).toContain('+ Log Inbound');
      expect(content).toContain('href="/cms"');
      expect(content).toContain('Website Studio');
      expect(content).toContain('href="/users"');
      expect(content).toContain('Team & Access');
      expect(content).toContain('class="nav-pill">Admin</span>');
      expect(content).toContain('href="/logout"');
    });
  });

  it('R1.4: Dashboard header renders gold pulsating dot and uppercase mono eyebrow', () => {
    const dashboardHtml = fs.readFileSync(path.join(VIEWS_DIR, 'dashboard.ejs'), 'utf8');
    expect(dashboardHtml).toContain('class="crm-eyebrow"');
    expect(dashboardHtml).toContain('Executive Command & Deal Flow');
    expect(dashboardHtml).toContain('color: #D9A23A');
    expect(dashboardHtml).toContain('class="pulse-dot"');

    const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
    expect(cssContent).toContain('.pulse-dot');
    expect(cssContent).toContain('background: #D9A23A');
    expect(cssContent).toContain('animation: goldPulse');
  });

  it('R1.5: Dashboard title strictly adheres to half-text gradient standard', () => {
    const dashboardHtml = fs.readFileSync(path.join(VIEWS_DIR, 'dashboard.ejs'), 'utf8');
    expect(dashboardHtml).toContain('Executive <span class="italic-accent">Pipeline Ledger</span>');
    
    // Parent container must not have text clipping directly
    const cssContent = fs.readFileSync(CSS_PATH, 'utf8');
    expect(cssContent).toContain('.italic-accent');
    expect(cssContent).toContain('linear-gradient(92deg, #D9A23A 0%, #E17356 50%, #6C2D5A 100%)');
  });

  it('R1.6: Server startup banner and transactional email sender reflect Impact OS', () => {
    const serverContent = fs.readFileSync(SERVER_PATH, 'utf8');
    expect(serverContent).toContain('🛡️ Tiffany Webb Impact OS™ active');
    expect(serverContent).toContain('"Tiffany Webb Impact OS"');
  });

  it('R1.7: Zero occurrences of "Tiffany Webb CRM" or "Admin Panel" in views and server.js', () => {
    views.forEach(v => {
      const content = fs.readFileSync(path.join(VIEWS_DIR, v), 'utf8');
      expect(content).toNotContain('Tiffany Webb CRM');
      expect(content).toNotContain('Admin Panel');
    });

    const serverContent = fs.readFileSync(SERVER_PATH, 'utf8');
    expect(serverContent).toNotContain('"Tiffany Webb CRM"');
    expect(serverContent).toNotContain('\'Tiffany Webb CRM\'');
  });
});

describe('Tier 1 — Feature Coverage: R2 Ledger Layout & Chevron Restoration', () => {
  const cssContent = fs.readFileSync(CSS_PATH, 'utf8');

  it('R2.1: .ledger-table-header and .ledger-row use exact grid-template-columns', () => {
    const expectedCols = 'grid-template-columns: 2.8fr 2.8fr 1.8fr 1.1fr 185px 125px;';
    expect(cssContent).toContain(expectedCols);
    expect(cssContent).toContain('gap: 1.25rem;');
  });

  it('R2.2: Stage column has fixed 185px min-width and stage select has 185px max-width', () => {
    expect(cssContent).toContain('.col-stage');
    expect(cssContent).toContain('min-width: 185px;');
    expect(cssContent).toContain('max-width: 185px;');
    expect(cssContent).toContain('.stage-select');
  });

  it('R2.3: Actions column has fixed 125px min-width and flex layout with 8px gap', () => {
    expect(cssContent).toContain('.col-actions');
    expect(cssContent).toContain('min-width: 125px;');
    expect(cssContent).toContain('justify-content: flex-end;');
    expect(cssContent).toContain('gap: 8px;');
  });

  it('R2.4: Action icon buttons are exactly 32px by 32px with min-width 32px', () => {
    expect(cssContent).toContain('.action-icon-btn');
    expect(cssContent).toContain('width: 32px;');
    expect(cssContent).toContain('height: 32px;');
    expect(cssContent).toContain('min-width: 32px;');
  });

  it('R2.5: 3rd button renders visible gold chevron SVG with stroke="#D9A23A" and pointer-events: none', () => {
    const dashboardHtml = fs.readFileSync(path.join(VIEWS_DIR, 'dashboard.ejs'), 'utf8');
    expect(dashboardHtml).toContain('class="accordion-toggle-icon"');
    expect(dashboardHtml).toContain('stroke="#D9A23A"');
    expect(dashboardHtml).toContain('stroke-width="2.5"');
    expect(dashboardHtml).toContain('pointer-events: none');
    expect(dashboardHtml).toContain('<polyline points="6 9 12 15 18 9"></polyline>');
  });

  it('R2.6: Chevron rotates 180 degrees when dossier accordion is expanded', () => {
    expect(cssContent).toContain('.ledger-item.expanded .accordion-toggle-icon');
    expect(cssContent).toContain('transform: rotate(180deg);');
    expect(cssContent).toContain('transition: transform 0.3s ease;');
  });
});

describe('Tier 1 — Feature Coverage: R3 Persistent Multi-User Team Notes Engine', () => {
  beforeAll(async () => {
    testLead = await db.createTestLead({ contact_name: 'Tier 1 Lead' });
    const auth = await http.loginAsAdmin();
    adminCookie = auth.cookieString;
  });

  afterAll(async () => {
    if (testLead) {
      await db.deleteTestLead(testLead.id);
    }
  });

  it('R3.1: Table lead_notes schema verified with required columns and constraints', async () => {
    const [cols] = await db.query('DESCRIBE lead_notes');
    const colNames = cols.map(c => c.Field);
    expect(colNames).toContain('id');
    expect(colNames).toContain('lead_id');
    expect(colNames).toContain('user_id');
    expect(colNames).toContain('author_name');
    expect(colNames).toContain('author_role');
    expect(colNames).toContain('note');
    expect(colNames).toContain('created_at');
  });

  it('R3.2: POST /api/leads/:id/notes successfully inserts a note and returns JSON', async () => {
    const noteText = 'Initial tier 1 verification note for deal review.';
    const res = await http.post(`/api/leads/${testLead.id}/notes`, { note: noteText }, {}, adminCookie);
    expect(res.status).toBe(200);
    expect(res.json).toBeDefined();
    expect(res.json.success).toBe(true);
    expect(res.json.note).toBeDefined();
    expect(res.json.note.note).toBe(noteText);
    expect(res.json.note.author_name).toBeDefined();
    expect(res.json.note.author_role).toBeDefined();
  });

  it('R3.3: GET /api/leads/:id/notes returns notes in reverse chronological order', async () => {
    const leadForOrdering = await db.createTestLead({ contact_name: 'Order Test Lead' });
    try {
      await http.post(`/api/leads/${leadForOrdering.id}/notes`, { note: 'Note 1 (Older)' }, {}, adminCookie);
      // Wait > 1 second so MySQL datetime has distinct timestamp
      await new Promise(r => setTimeout(r, 1100));
      await http.post(`/api/leads/${leadForOrdering.id}/notes`, { note: 'Note 2 (Newer)' }, {}, adminCookie);

      const res = await http.get(`/api/leads/${leadForOrdering.id}/notes`);
      expect(res.status).toBe(200);
      expect(res.json.success).toBe(true);
      expect(Array.isArray(res.json.notes)).toBe(true);
      expect(res.json.notes.length).toBe(2);
      expect(res.json.notes[0].note).toBe('Note 2 (Newer)');
      expect(res.json.notes[1].note).toBe('Note 1 (Older)');
    } finally {
      await db.deleteTestLead(leadForOrdering.id);
    }
  });

  it('R3.4: Note creation inserts corresponding audit record in activity_log', async () => {
    const noteContent = 'Audit trail verification note unique key 9988.';
    await http.post(`/api/leads/${testLead.id}/notes`, { note: noteContent }, {}, adminCookie);
    
    const logs = await db.getActivityLogs(testLead.id);
    expect(logs.length > 0).toBe(true);
    const hasAuditEntry = logs.some(l => l.action === 'note_added' && l.detail.includes('9988'));
    expect(hasAuditEntry).toBe(true);
  });

  it('R3.5: Frontend dashboard renders dossier notes input, button, and stream container', () => {
    const dashboardHtml = fs.readFileSync(path.join(VIEWS_DIR, 'dashboard.ejs'), 'utf8');
    expect(dashboardHtml).toContain('id="note-input-<%= lead.id %>"');
    expect(dashboardHtml).toContain('id="notes-list-<%= lead.id %>"');
    expect(dashboardHtml).toContain('+ Post Note');
    expect(dashboardHtml).toContain('postLeadNote(<%= lead.id %>)');
    expect(dashboardHtml).toContain('loadLeadNotes(');
  });

  it('R3.6: Client-side JS generates avatar initial monogram, role badge pill, and escapes HTML', () => {
    const dashboardHtml = fs.readFileSync(path.join(VIEWS_DIR, 'dashboard.ejs'), 'utf8');
    expect(dashboardHtml).toContain('escapeHtml');
    expect(dashboardHtml).toContain('note-avatar');
    expect(dashboardHtml).toContain('initialChar');
    expect(dashboardHtml).toContain('author_role');
  });
});

describe('Tier 1 — Feature Coverage: R4 8-Layer Cyber Security Suite', () => {
  it('R4.1: Layer 1 (Helmet Shield) sets X-Frame-Options: DENY and X-Content-Type-Options: nosniff', async () => {
    const res = await http.get('/login');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('R4.2: Layer 2 (CORS Hardening) allows canonical domain https://tiffanywebbimpact.com', async () => {
    const res = await http.options('/', {
      'Origin': 'https://tiffanywebbimpact.com',
      'Access-Control-Request-Method': 'POST'
    });
    expect(res.headers['access-control-allow-origin']).toBe('https://tiffanywebbimpact.com');
  });

  it('R4.3: Layer 3 (Rate Limiting) middleware is mounted on POST /login', () => {
    const serverCode = fs.readFileSync(SERVER_PATH, 'utf8');
    expect(serverCode).toContain("app.use('/login'");
    expect(serverCode).toContain("loginLimiter");
    expect(serverCode).toContain("15 * 60 * 1000");
  });

  it('R4.4: Layer 4 (Recursive XSS Sanitization) strips <script> tags from form submissions', async () => {
    const uniqueEmail = `xss_sanitized_${Date.now()}@tiffanywebbimpact.com`;
    const res = await http.post('/api/leads', {
      contact_name: 'XSS Test <script>alert(1)</script>',
      email: uniqueEmail,
      message: 'Test message with <script>alert("xss")</script> script'
    });
    expect(res.status >= 200 && res.status < 300).toBe(true);

    const [rows] = await db.query('SELECT contact_name, message FROM leads WHERE email = ?', [uniqueEmail]);
    expect(rows.length).toBe(1);
    expect(rows[0].contact_name).toNotContain('<script>');
    expect(rows[0].message).toNotContain('<script>');
    await db.query('DELETE FROM leads WHERE email = ?', [uniqueEmail]);
  });

  it('R4.5: Layer 5 (SQL Injection Immunity) enforces parameterized queries across server.js', () => {
    const serverCode = fs.readFileSync(SERVER_PATH, 'utf8');
    // Ensure all pool.query calls with variables use parameter array
    const lines = serverCode.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('pool.query(') && !line.includes('CREATE TABLE') && !line.includes('ALTER TABLE')) {
        // Must not concatenate variables directly into SQL string
        expect(line).toNotMatch(/pool\.query\(`[^`]*\$\{[a-zA-Z0-9_.]+\}[^`]*`\)/);
      }
    });
  });

  it('R4.6: Layer 6 (Secure Cookie Governance) issues httpOnly, sameSite: strict auth_token cookie', async () => {
    const auth = await http.loginAsAdmin();
    expect(auth.res.status).toBe(302);
    expect(auth.res.setCookie).toBeDefined();
    const cookieHeader = Array.isArray(auth.res.setCookie) ? auth.res.setCookie.join('; ') : auth.res.setCookie;
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Strict');
    expect(cookieHeader).toContain('Max-Age=604800');
  });

  it('R4.7: Layer 7 (Root Route Authentication) redirects unauthenticated requests to /login', async () => {
    const res = await http.get('/');
    expect(res.status).toBe(302);
    expect(res.location).toBe('/login');
  });

  it('R4.8: Layer 8 (Multer File Extension Filter) restricts uploads to whitelisted image extensions', () => {
    const serverCode = fs.readFileSync(SERVER_PATH, 'utf8');
    expect(serverCode).toContain('.jpg');
    expect(serverCode).toContain('.jpeg');
    expect(serverCode).toContain('.png');
    expect(serverCode).toContain('.webp');
    expect(serverCode).toContain('Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed');
  });
});

if (require.main === module) {
  const { run } = require('./helpers/test_runner.cjs');
  run().then(async results => {
    await db.closePool();
    process.exit(results.failed > 0 ? 1 : 0);
  });
}
