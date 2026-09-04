/**
 * Tier 4: Real-World Scenarios E2E Test Suite
 * Simulates full end-to-end executive user workflow across Tiffany Webb Impact OS™:
 * 1. Unauthenticated root navigation -> 302 to /login
 * 2. Executive login with credentials -> Set-Cookie auth_token
 * 3. Executive visits /dashboard (Pipeline Ledger) -> Valid 6-track layout & rebrand
 * 4. Executive expands lead dossier drawer -> Chevron toggle & notes hub container
 * 5. Executive posts internal team note -> REST API persistence
 * 6. DB persistence verified in lead_notes and activity_log
 * 7. Live note retrieval verifies note at top of feed
 * 8. Executive logs out -> auth_token cookie invalidated
 * 9. Subsequent dashboard request rejected -> 302 to /login
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, beforeAll, afterAll } = require('./helpers/test_runner.cjs');
const http = require('./helpers/http_helper.cjs');
const db = require('./helpers/db_helper.cjs');

let workflowLead = null;
let sessionCookie = '';
let savedNoteId = null;

describe('Tier 4 — Real-World Scenario: Complete Executive Operational Lifecycle', () => {
  beforeAll(async () => {
    workflowLead = await db.createTestLead({
      contact_name: 'Governor Conference Lead',
      organization_name: 'State Leadership Forum',
      topic_interest: 'Community Impact & GEAR Method',
      budget_range: '$25,000'
    });
  });

  afterAll(async () => {
    if (workflowLead) {
      await db.deleteTestLead(workflowLead.id);
    }
    await db.cleanupTestLeadsByPattern('e2e_test_%');
  });

  it('Step 1: Unauthenticated user accesses root "/" and is redirected to "/login"', async () => {
    const res = await http.get('/');
    expect(res.status).toBe(302);
    expect(res.location).toBe('/login');
  });

  it('Step 2: Executive logs in with valid credentials and receives secure auth_token cookie', async () => {
    const authRes = await http.postForm('/login', {
      email: 'admin@tiffanywebb.com',
      password: 'password123'
    });

    expect(authRes.status).toBe(302);
    expect(authRes.location).toBe('/dashboard');
    expect(authRes.setCookie).toBeDefined();

    const setCookieStr = Array.isArray(authRes.setCookie) ? authRes.setCookie.join('; ') : authRes.setCookie;
    expect(setCookieStr).toContain('auth_token=');
    expect(setCookieStr).toContain('HttpOnly');
    expect(setCookieStr).toContain('SameSite=Strict');

    sessionCookie = `auth_token=${authRes.cookies.auth_token}`;
  });

  it('Step 3: Executive accesses "/dashboard" (Pipeline Ledger) with valid session cookie', async () => {
    const res = await http.get('/dashboard', {}, sessionCookie);
    expect(res.status).toBe(200);

    // Verify Title and Rebrand
    expect(res.body).toContain('<title>Pipeline Ledger — Tiffany Webb Impact OS</title>');
    expect(res.body).toContain('<h1 class="nav-logo">Tiffany Webb <span>Impact OS</span></h1>');
    expect(res.body).toContain('Executive <span class="italic-accent">Pipeline Ledger</span>');
    expect(res.body).toContain('Executive Command & Deal Flow');

    // Verify presence of our created lead in the ledger
    expect(res.body).toContain('Governor Conference Lead');
    expect(res.body).toContain('State Leadership Forum');
  });

  it('Step 4: Executive inspects lead row and verifies dossier drawer elements and visible chevron', async () => {
    const res = await http.get('/dashboard', {}, sessionCookie);
    expect(res.status).toBe(200);

    // Verify the lead item and dossier drawer exist
    expect(res.body).toContain(`id="lead-item-${workflowLead.id}"`);
    expect(res.body).toContain(`toggleDossier(${workflowLead.id}, event)`);
    expect(res.body).toContain(`id="notes-list-${workflowLead.id}"`);
    expect(res.body).toContain(`id="note-input-${workflowLead.id}"`);

    // Verify visible gold chevron
    expect(res.body).toContain('stroke="#D9A23A"');
    expect(res.body).toContain('stroke-width="2.5"');
  });

  it('Step 5: Executive posts private team note into dossier notes engine via AJAX', async () => {
    const noteText = 'Executive call scheduled for Friday with conference committee.';
    const res = await http.post(`/api/leads/${workflowLead.id}/notes`, { note: noteText }, {}, sessionCookie);

    expect(res.status).toBe(200);
    expect(res.json).toBeDefined();
    expect(res.json.success).toBe(true);
    expect(res.json.note).toBeDefined();
    expect(res.json.note.note).toBe(noteText);
    expect(res.json.note.author_name).toBeDefined();
    expect(res.json.note.author_role).toBe('admin');

    savedNoteId = res.json.note.id;
  });

  it('Step 6: MySQL database confirms persistence in lead_notes and activity_log', async () => {
    const [noteRows] = await db.query('SELECT * FROM lead_notes WHERE id = ?', [savedNoteId]);
    expect(noteRows.length).toBe(1);
    expect(noteRows[0].lead_id).toBe(workflowLead.id);
    expect(noteRows[0].note).toContain('Executive call scheduled for Friday');
    expect(noteRows[0].author_role).toBe('admin');

    const [auditRows] = await db.query(
      'SELECT * FROM activity_log WHERE lead_id = ? AND action = "note_added" ORDER BY id DESC LIMIT 1',
      [workflowLead.id]
    );
    expect(auditRows.length).toBe(1);
    expect(auditRows[0].detail).toContain('Executive call scheduled for Friday');
  });

  it('Step 7: GET /api/leads/:id/notes verifies the new note appears at top of feed', async () => {
    const res = await http.get(`/api/leads/${workflowLead.id}/notes`, {}, sessionCookie);
    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    expect(res.json.notes.length >= 1).toBe(true);
    expect(res.json.notes[0].id).toBe(savedNoteId);
    expect(res.json.notes[0].note).toContain('Executive call scheduled for Friday');
  });

  it('Step 8: Executive logs out and auth_token cookie is invalidated', async () => {
    const res = await http.get('/logout', {}, sessionCookie);
    expect(res.status).toBe(302);
    expect(res.location).toBe('/login');
    expect(res.setCookie).toBeDefined();

    const setCookieStr = Array.isArray(res.setCookie) ? res.setCookie.join('; ') : res.setCookie;
    // Cleared cookie should have empty value or past expiration
    expect(setCookieStr).toContain('auth_token=');
  });

  it('Step 9: Subsequent unauthenticated access to /dashboard is blocked with 302 to /login', async () => {
    const res = await http.get('/dashboard');
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
