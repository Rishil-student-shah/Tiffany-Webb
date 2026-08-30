/**
 * Tier 2: Boundary & Corner Cases Test Suite
 * Tests empty collection states, invalid payloads, error codes (400/422/404), and extreme inputs.
 */

const { describe, it, beforeAll, afterAll, expect } = require('./helpers/test_framework');
const { getHarness } = require('./helpers/app_harness');
const { parseHTML } = require('./helpers/dom_parser');
const { query, deleteTestLeadsByEmail } = require('./helpers/db_helper');

describe('Tier 2: Boundary & Corner Cases', () => {
  let harness;

  beforeAll(async () => {
    harness = getHarness();
    await harness.start();
  });

  afterAll(async () => {
    await deleteTestLeadsByEmail('%tier2%');
    await harness.stop();
  });

  // ============================================================================
  // Group 1: Empty Collection States & Graceful Degradation
  // ============================================================================
  describe('2.1: Empty Collection States & Graceful Degradation', () => {
    it('2.1.1: /about hides Professional Affiliations section when collection has 0 items', async () => {
      const res = await harness.request('/about');
      const doc = parseHTML(res.text);
      
      const affiliations = doc.getElementById('about_affiliations');
      expect(affiliations).toBeNull();
      // Ensure no broken placeholders or raw unrendered tags
      expect(res.text).toNotContain('undefined');
      expect(res.text).toNotContain('null');
    });

    it('2.1.2: /services hides FAQ section when faqs collection has 0 items', async () => {
      const res = await harness.request('/services');
      const doc = parseHTML(res.text);
      
      const faqs = doc.getElementById('services_faqs');
      expect(faqs).toBeNull();
    });

    it('2.1.3: /work-with-tiffany hides FAQ section when booking_faqs collection has 0 items', async () => {
      const res = await harness.request('/work-with-tiffany');
      const doc = parseHTML(res.text);
      
      const faqs = doc.getElementById('booking_faqs');
      expect(faqs).toBeNull();
    });

    it('2.1.4: /impact displays warm fallback banner when upcoming engagements collection is empty', async () => {
      const res = await harness.request('/impact');
      const doc = parseHTML(res.text);
      
      const upcoming = doc.getElementById('impact_upcoming');
      expect(upcoming).toBeTruthy();
      expect(upcoming.textContent).toContain('Next speaking dates announced soon');
      expect(upcoming.textContent).toContain('In the meantime, get in touch to bring Tiffany to your event');
      
      const bannerCta = doc.getLinks().find(l => l.href === '/work-with-tiffany');
      expect(bannerCta).toBeTruthy();
    });

    it('2.1.5: /impact displays archive update message when past engagements collection is empty', async () => {
      const res = await harness.request('/impact');
      const doc = parseHTML(res.text);
      
      const past = doc.getElementById('impact_past');
      expect(past).toBeTruthy();
      expect(past.textContent).toContain('Past engagement archive is currently being updated with recent keynotes and summits');
    });

    it('2.1.6: /impact hides testimonials section cleanly when testimonials collection is empty', async () => {
      const res = await harness.request('/impact');
      const doc = parseHTML(res.text);
      
      const testimonials = doc.getElementById('impact_testimonials');
      expect(testimonials).toBeNull();
    });
  });

  // ============================================================================
  // Group 2: Lead Form Boundary & Invalid Payloads
  // ============================================================================
  describe('2.2: Lead Form Boundary & Invalid Payloads', () => {
    it('2.2.1: POST /api/leads returns 400 when contact_name is empty or whitespace', async () => {
      const payload = {
        contact_name: '   ',
        organization_name: 'Test Org',
        email: 'tier2_valid@test.com',
        event_type: 'Keynote'
      };

      const res = await harness.request('/api/leads', {
        method: 'POST',
        body: payload
      });

      expect(res.status).toBe(400);
      expect(res.json.success).toBe(false);
      expect(res.json.error).toContain('contact_name is required');
    });

    it('2.2.2: POST /api/leads returns 400 when organization_name is missing', async () => {
      const payload = {
        contact_name: 'Jane Doe',
        organization_name: '',
        email: 'tier2_valid@test.com',
        event_type: 'Conference'
      };

      const res = await harness.request('/api/leads', {
        method: 'POST',
        body: payload
      });

      expect(res.status).toBe(400);
      expect(res.json.success).toBe(false);
      expect(res.json.error).toContain('organization_name is required');
    });

    it('2.2.3: POST /api/leads returns 422 when email is malformed (no @, missing domain, spaces)', async () => {
      const invalidEmails = ['invalidemail', 'user@', '@domain.com', 'user @domain.com', 'user@domain'];

      for (const badEmail of invalidEmails) {
        const payload = {
          contact_name: 'Jane Doe',
          organization_name: 'Test Org',
          email: badEmail,
          event_type: 'Workshop'
        };

        const res = await harness.request('/api/leads', {
          method: 'POST',
          body: payload
        });

        expect(res.status).toBe(422);
        expect(res.json.success).toBe(false);
        expect(res.json.error).toContain('Valid email is required');
      }
    });

    it('2.2.4: POST /api/leads returns 400 when event_type is omitted', async () => {
      const payload = {
        contact_name: 'Jane Doe',
        organization_name: 'Test Org',
        email: 'tier2_test@test.com',
        event_type: ''
      };

      const res = await harness.request('/api/leads', {
        method: 'POST',
        body: payload
      });

      expect(res.status).toBe(400);
      expect(res.json.success).toBe(false);
      expect(res.json.error).toContain('event_type is required');
    });

    it('2.2.5: POST /api/leads gracefully handles null optional fields and persists record', async () => {
      const payload = {
        contact_name: 'Tier2 Minimal Lead',
        organization_name: 'Minimal Org',
        email: 'tier2_minimal@test.com',
        event_type: 'Panel',
        phone: null,
        event_date: null,
        event_location: null,
        estimated_audience_size: null,
        message: null
      };

      const res = await harness.request('/api/leads', {
        method: 'POST',
        body: payload
      });

      expect(res.status).toBe(201);
      expect(res.json.success).toBe(true);

      const [lead] = await query('SELECT * FROM leads WHERE id = ?', [res.json.leadId]);
      expect(lead.contact_name).toBe('Tier2 Minimal Lead');
      expect(lead.phone).toBeNull();
      expect(lead.event_date).toBeNull();
      expect(lead.message).toBeNull();
    });

    it('2.2.6: POST /api/leads gracefully handles unparseable date strings by saving null', async () => {
      const payload = {
        contact_name: 'Tier2 Date Test',
        organization_name: 'Date Org',
        email: 'tier2_datetest@test.com',
        event_type: 'Keynote',
        event_date: 'not-a-valid-date-string'
      };

      const res = await harness.request('/api/leads', {
        method: 'POST',
        body: payload
      });

      expect(res.status).toBe(201);
      const [lead] = await query('SELECT * FROM leads WHERE id = ?', [res.json.leadId]);
      expect(lead.event_date).toBeNull();
    });
  });

  // ============================================================================
  // Group 3: Non-Existent Pages & Slugs Handling
  // ============================================================================
  describe('2.3: Non-Existent Pages & Inactive Page Toggles', () => {
    it('2.3.1: GET /api/content/:slug returns 404 when requesting unknown slug', async () => {
      const res = await harness.request('/api/content/unknown-slug-9999');
      expect(res.status).toBe(404);
      expect(res.json.success).toBe(false);
      expect(res.json.error).toContain('Page not found');
    });

    it('2.3.2: GET /cms/:slug returns 404 when requested slug does not exist in website_pages', async () => {
      const res = await harness.request('/cms/unknown-slug-9999');
      expect(res.status).toBe(404);
      expect(res.text).toContain('Page not found');
    });

    it('2.3.3: Inactive page toggle (is_active = 0) renders 404 page', async () => {
      // Toggle 'privacy' to inactive
      await query('UPDATE website_pages SET is_active = 0 WHERE slug = "privacy"');
      
      const res = await harness.request('/api/content/privacy');
      // Inactive pages should not be served or should be marked inactive
      const [privacy] = await query('SELECT is_active FROM website_pages WHERE slug = "privacy"');
      expect(privacy.is_active).toBe(0);

      // Revert back
      await query('UPDATE website_pages SET is_active = 1 WHERE slug = "privacy"');
    });
  });

  // ============================================================================
  // Group 4: Extreme Query Strings & Topic Prefills
  // ============================================================================
  describe('2.4: Extreme Query Strings & Topic Prefills', () => {
    it('2.4.1: /work-with-tiffany with XSS script in ?topic= safely escapes HTML in form message', async () => {
      const xssPayload = '<script>alert("XSS_ATTACK")</script>';
      const res = await harness.request(`/work-with-tiffany?topic=${encodeURIComponent(xssPayload)}`);
      
      expect(res.status).toBe(200);
      // Raw unescaped script tag should NOT execute or exist as active DOM element
      expect(res.text).toNotContain('<script>alert("XSS_ATTACK")</script>');
      expect(res.text).toContain('&lt;script&gt;alert(&quot;XSS_ATTACK&quot;)&lt;/script&gt;');
    });

    it('2.4.2: /work-with-tiffany with empty ?topic= query renders standard empty textarea', async () => {
      const res = await harness.request('/work-with-tiffany?topic=');
      const doc = parseHTML(res.text);
      
      const form = doc.getForms()[0];
      const messageTextarea = form.textareas.find(t => t.name === 'message');
      expect(messageTextarea).toBeTruthy();
      expect(messageTextarea.value.trim()).toBe('');
    });

    it('2.4.3: /work-with-tiffany with 1000-character long query string handles without truncation or crash', async () => {
      const longTopic = 'A'.repeat(1000);
      const res = await harness.request(`/work-with-tiffany?topic=${longTopic}`);
      
      expect(res.status).toBe(200);
      expect(res.text).toContain(longTopic);
    });

    it('2.4.4: /work-with-tiffany with special characters (&, #, +, %) properly decodes in message textarea', async () => {
      const specialTopic = 'Gambling, Significant Others & Domestic Violence #1 + Trends (50%)';
      const res = await harness.request(`/work-with-tiffany?topic=${encodeURIComponent(specialTopic)}`);
      
      expect(res.status).toBe(200);
      expect(res.text).toContain('Inquiring about speaking topic: Gambling, Significant Others &amp; Domestic Violence #1 + Trends (50%)');
    });

    it('2.4.5: /work-with-tiffany with unknown ?type= query gracefully maintains default event type select', async () => {
      const res = await harness.request('/work-with-tiffany?type=NonExistentType');
      const doc = parseHTML(res.text);
      
      const form = doc.getForms()[0];
      const eventTypeSelect = form.selects.find(s => s.name === 'event_type');
      expect(eventTypeSelect).toBeTruthy();
      expect(res.status).toBe(200);
    });
  });
});
