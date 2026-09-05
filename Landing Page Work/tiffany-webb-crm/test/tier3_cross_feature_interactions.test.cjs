/**
 * Tier 3: Cross-Feature Interactions E2E Test Suite
 * Tests interactions across multiple subsystems: Auth Cookies, Notes Engine,
 * Audit Logs, Relational Cascades, and Ledger Dossier Accordions.
 */

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { describe, it, expect, beforeAll, afterAll } = require('./helpers/test_runner.cjs');
const http = require('./helpers/http_helper.cjs');
const db = require('./helpers/db_helper.cjs');

const CRM_ROOT = path.join(__dirname, '..');
const VIEWS_DIR = path.join(CRM_ROOT, 'views');

let testLead1 = null;
let testLead2 = null;
let adminCookie = '';

describe('Tier 3 — Cross-Feature Interactions: Auth, Notes, Audit & Relational Cascade', () => {
  beforeAll(async () => {
    testLead1 = await db.createTestLead({ contact_name: 'Cross Feature Lead 1' });
    testLead2 = await db.createTestLead({ contact_name: 'Cross Feature Lead 2' });
    const auth = await http.loginAsAdmin();
    adminCookie = auth.cookieString;
  });

  afterAll(async () => {
    if (testLead1) await db.deleteTestLead(testLead1.id);
    if (testLead2) await db.deleteTestLead(testLead2.id);
    await db.cleanupTestLeadsByPattern('e2e_test_%');
  });

  it('T3.1: Authenticated session cookie links author identity and generates audit log entry', async () => {
    const noteText = 'Executive strategy note with authenticated session tracking.';
    const res = await http.post(`/api/leads/${testLead1.id}/notes`, { note: noteText }, {}, adminCookie);
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);

    const note = res.json.note;
    expect(note.author_name).toBeDefined();
    expect(note.author_role).toBe('admin');

    // Verify activity log is linked to lead and action is 'note_added'
    const logs = await db.getActivityLogs(testLead1.id);
    expect(logs.length > 0).toBe(true);
    const targetLog = logs.find(l => l.action === 'note_added' && l.detail.includes('Executive strategy note'));
    expect(targetLog).toBeDefined();
    expect(targetLog.lead_id).toBe(testLead1.id);
  });

  it('T3.2: Unauthenticated note creation is rejected by requireAuth', async () => {
    const noteText = 'Headless note without auth cookie.';
    const res = await http.post(`/api/leads/${testLead1.id}/notes`, { note: noteText }, {});
    expect(res.status).toBe(302);
    expect(res.location).toBe('/login');
  });

  it('T3.3: Dynamic note posting and reverse chronological retrieval', async () => {
    const lead = await db.createTestLead({ contact_name: 'Timeline Order Lead' });
    try {
      await http.post(`/api/leads/${lead.id}/notes`, { note: 'Historical Note 1' }, {}, adminCookie);
      await new Promise(r => setTimeout(r, 1100));
      await http.post(`/api/leads/${lead.id}/notes`, { note: 'Recent Note 2' }, {}, adminCookie);

      const res = await http.get(`/api/leads/${lead.id}/notes`, {}, adminCookie);
      expect(res.status).toBe(200);
      expect(res.json.notes.length).toBe(2);
      expect(res.json.notes[0].note).toBe('Recent Note 2');
      expect(res.json.notes[1].note).toBe('Historical Note 1');
    } finally {
      await db.deleteTestLead(lead.id);
    }
  });

  it('T3.4: ON DELETE CASCADE cleans up lead_notes automatically when a lead is deleted', async () => {
    const lead = await db.createTestLead({ contact_name: 'Cascade Test Lead' });
    // Add two notes
    await http.post(`/api/leads/${lead.id}/notes`, { note: 'Cascade note alpha' }, {}, adminCookie);
    await http.post(`/api/leads/${lead.id}/notes`, { note: 'Cascade note beta' }, {}, adminCookie);

    const notesBefore = await db.getLeadNotes(lead.id);
    expect(notesBefore.length).toBe(2);

    // Delete lead from leads table
    await db.deleteTestLead(lead.id);

    // Verify notes are completely purged from database by MySQL CASCADE constraint
    const notesAfter = await db.getLeadNotes(lead.id);
    expect(notesAfter.length).toBe(0);
  });

  it('T3.5: Dossier accordion DOM IDs match across lead card, chevron, and notes hub', () => {
    const dashboardPath = path.join(VIEWS_DIR, 'dashboard.ejs');
    const mockLeads = [
      { id: 101, contact_name: 'Lead 101', organization_name: 'Org A', status: 'new', created_at: new Date() },
      { id: 202, contact_name: 'Lead 202', organization_name: 'Org B', status: 'contacted', created_at: new Date() }
    ];

    const html = ejs.render(fs.readFileSync(dashboardPath, 'utf8'), {
      leads: mockLeads,
      chartData: JSON.stringify({}),
      error: undefined,
      success: undefined
    }, { filename: dashboardPath });

    // Verify lead 101 DOM linkage
    expect(html).toContain('id="lead-item-101"');
    expect(html).toContain('toggleDossier(101, event)');
    expect(html).toContain('id="note-input-101"');
    expect(html).toContain('id="notes-list-101"');
    expect(html).toContain('postLeadNote(101)');

    // Verify lead 202 DOM linkage
    expect(html).toContain('id="lead-item-202"');
    expect(html).toContain('toggleDossier(202, event)');
    expect(html).toContain('id="note-input-202"');
    expect(html).toContain('id="notes-list-202"');
    expect(html).toContain('postLeadNote(202)');
  });

  it('T3.6: Authenticated dashboard GET /dashboard returns 200 with Pipeline Ledger layout', async () => {
    const res = await http.get('/dashboard', {}, adminCookie);
    expect(res.status).toBe(200);
    expect(res.body).toContain('Pipeline Ledger — Tiffany Webb Impact OS');
    expect(res.body).toContain('Executive <span class="italic-accent">Pipeline Ledger</span>');
    expect(res.body).toContain('Executive Command & Deal Flow');
  });
});

if (require.main === module) {
  const { run } = require('./helpers/test_runner.cjs');
  run().then(async results => {
    await db.closePool();
    process.exit(results.failed > 0 ? 1 : 0);
  });
}
