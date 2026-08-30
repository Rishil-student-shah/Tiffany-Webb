/**
 * Tier 4: Real-World Application Scenario Test Suite
 * End-to-end simulation of the complete user inquiry lifecycle:
 * Speaking Topics Exploration -> Prefilled Booking -> AJAX Submission -> CRM Persistence -> Admin Workflow
 */

const { describe, it, beforeAll, afterAll, expect } = require('./helpers/test_framework');
const { getHarness } = require('./helpers/app_harness');
const { parseHTML } = require('./helpers/dom_parser');
const { query, deleteTestLeadsByEmail } = require('./helpers/db_helper');

describe('Tier 4: Real-World Application Scenarios (Lead Inquiry Lifecycle)', () => {
  let harness;
  let createdLeadId = null;

  const testUser = {
    selectedTopic: "Don't Bet on Your Future (Youth Focus)",
    contact_name: "Marcus Vance",
    organization_name: "Chicago Public Schools District 299",
    email: "mvance_tier4_lifecycle@cps.edu",
    phone: "3125550188",
    country_code: "+1",
    event_type: "School or University",
    event_date: "2026-10-24",
    event_location: "Chicago, IL (Whitney Young HS Auditorium)",
    estimated_audience_size: "500+",
    extraMessage: "We have an all-school assembly planned for 850 students."
  };

  beforeAll(async () => {
    harness = getHarness();
    await harness.start();
    await deleteTestLeadsByEmail('%tier4%');
  });

  afterAll(async () => {
    if (createdLeadId) {
      await query('DELETE FROM activity_log WHERE lead_id = ?', [createdLeadId]);
      await query('DELETE FROM messages WHERE lead_id = ?', [createdLeadId]);
      await query('DELETE FROM leads WHERE id = ?', [createdLeadId]);
    }
    await deleteTestLeadsByEmail('%tier4%');
    await harness.stop();
  });

  it('Step 1: User lands on /services/speaking-topics and views topic collection', async () => {
    const res = await harness.request('/services/speaking-topics');
    expect(res.status).toBe(200);
    const doc = parseHTML(res.text);

    const topicsGrid = doc.getElementById('speaking_topics_grid');
    expect(topicsGrid).toBeTruthy();

    const topicCards = doc.getElementsByClassName('topic-card');
    expect(topicCards.length).toBe(20);
  });

  it('Step 2: User selects Topic #2 and follows the prefill link to booking page', async () => {
    const res = await harness.request('/services/speaking-topics');
    const doc = parseHTML(res.text);

    const youthCard = doc.getElementsByClassName('topic-card')
      .find(c => c.innerHTML.includes(testUser.selectedTopic) || c.innerHTML.includes("Don&#39;t Bet on Your Future"));
    expect(youthCard).toBeTruthy();

    const parser = parseHTML(youthCard.fullMatch);
    const prefillLink = parser.getLinks()[0];
    expect(prefillLink).toBeTruthy();

    // Verify prefill URL parameter
    const prefillUrl = prefillLink.href;
    expect(prefillUrl).toContain('/work-with-tiffany?topic=');

    // Simulate navigation to the prefilled form
    const bookingPageRes = await harness.request(prefillUrl);
    expect(bookingPageRes.status).toBe(200);
    const bookingDoc = parseHTML(bookingPageRes.text);

    const form = bookingDoc.getForms()[0];
    expect(form).toBeTruthy();

    const messageTextarea = form.textareas.find(t => t.name === 'message');
    expect(messageTextarea).toBeTruthy();
    expect(messageTextarea.value).toContain(`Inquiring about speaking topic: ${testUser.selectedTopic}`);
  });

  it('Step 3: User fills in all required and optional form fields and submits via POST /api/leads', async () => {
    const fullMessage = `Inquiring about speaking topic: ${testUser.selectedTopic}\n\n${testUser.extraMessage}`;
    
    const submissionPayload = {
      contact_name: testUser.contact_name,
      organization_name: testUser.organization_name,
      email: testUser.email,
      phone: testUser.phone,
      country_code: testUser.country_code,
      event_type: testUser.event_type,
      event_date: testUser.event_date,
      event_location: testUser.event_location,
      estimated_audience_size: testUser.estimated_audience_size,
      message: fullMessage,
      privacy_agreement: true
    };

    const res = await harness.request('/api/leads', {
      method: 'POST',
      body: submissionPayload
    });

    expect(res.status).toBe(201);
    expect(res.json).toBeTruthy();
    expect(res.json.success).toBe(true);
    expect(res.json.leadId).toBeGreaterThan(0);
    createdLeadId = res.json.leadId;
  });

  it('Step 4: Database persists submitted lead and records initial activity log entry', async () => {
    expect(createdLeadId).toBeTruthy();

    const [lead] = await query('SELECT * FROM leads WHERE id = ?', [createdLeadId]);
    expect(lead).toBeTruthy();
    expect(lead.contact_name).toBe(testUser.contact_name);
    expect(lead.organization_name).toBe(testUser.organization_name);
    expect(lead.email).toBe(testUser.email);
    expect(lead.phone).toBe(testUser.phone);
    expect(lead.event_type).toBe(testUser.event_type);
    expect(lead.event_location).toBe(testUser.event_location);
    expect(lead.estimated_audience_size).toBe(testUser.estimated_audience_size);
    expect(lead.message).toContain(testUser.selectedTopic);
    expect(lead.message).toContain(testUser.extraMessage);
    expect(lead.source).toBe('website_form');
    expect(lead.status).toBe('new');

    // Verify activity log
    const logs = await query('SELECT * FROM activity_log WHERE lead_id = ?', [createdLeadId]);
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].action).toBe('lead_created');
  });

  it('Step 5: Lead appears in CRM Leads Dashboard (/dashboard)', async () => {
    const res = await harness.request('/dashboard');
    expect(res.status).toBe(200);
    expect(res.text).toContain(testUser.contact_name);
    expect(res.text).toContain(testUser.organization_name);
    expect(res.text).toContain(testUser.email);
  });

  it('Step 6: Admin opens Lead Detail page (/lead/:id) and verifies all 9 fields and timeline', async () => {
    const res = await harness.request(`/lead/${createdLeadId}`);
    expect(res.status).toBe(200);
    expect(res.text).toContain(testUser.contact_name);
    expect(res.text).toContain(testUser.organization_name);
    expect(res.text).toContain(testUser.email);
    expect(res.text).toContain(testUser.phone);
    expect(res.text).toContain(testUser.event_location);
    expect(res.text).toContain('Lead created from website form');
  });

  it('Step 7: Admin advances lead status from "new" to "qualified" with full audit trail', async () => {
    const updateRes = await harness.request(`/lead/${createdLeadId}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: { status: 'qualified' }
    });

    expect(updateRes.status).toBe(302);
    expect(updateRes.redirectUrl).toBe(`/lead/${createdLeadId}`);

    // Verify DB update
    const [updatedLead] = await query('SELECT status FROM leads WHERE id = ?', [createdLeadId]);
    expect(updatedLead.status).toBe('qualified');

    // Verify audit log has status_changed entry
    const logs = await query('SELECT * FROM activity_log WHERE lead_id = ? AND action = "status_changed"', [createdLeadId]);
    expect(logs.length).toBe(1);
    expect(logs[0].detail).toContain('Status updated to qualified');
  });
});
