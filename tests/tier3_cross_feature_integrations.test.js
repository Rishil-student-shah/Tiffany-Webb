/**
 * Tier 3: Cross-Feature Combinations & Integrations Test Suite
 * Tests topic prefill flows, 301 redirects, deep-link anchors, and CMS -> Frontend dynamic synchronization.
 */

const { describe, it, beforeAll, afterAll, expect } = require('./helpers/test_framework');
const { getHarness } = require('./helpers/app_harness');
const { parseHTML } = require('./helpers/dom_parser');
const { query } = require('./helpers/db_helper');

describe('Tier 3: Cross-Feature Combinations & Integrations', () => {
  let harness;

  beforeAll(async () => {
    harness = getHarness();
    await harness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  // ============================================================================
  // Group 1: Speaking Topics -> Booking Form Prefill Flow
  // ============================================================================
  describe('3.1: Topic Selection to Booking Form Prefill Flow', () => {
    it('3.1.1: extracts prefill URL from Topic card #2 on /services/speaking-topics', async () => {
      const res = await harness.request('/services/speaking-topics');
      const doc = parseHTML(res.text);

      const topicCards = doc.getElementsByClassName('topic-card');
      const youthCard = topicCards.find(c => c.innerHTML.includes("Don't Bet on Your Future (Youth Focus)") || c.innerHTML.includes("Don&#39;t Bet on Your Future"));
      expect(youthCard).toBeTruthy();

      const parser = parseHTML(youthCard.fullMatch);
      const prefillLink = parser.getLinks()[0];
      expect(prefillLink).toBeTruthy();
      expect(prefillLink.href).toContain('/work-with-tiffany?topic=');
    });

    it('3.1.2: landing on /work-with-tiffany with ?topic= query auto-populates message textarea', async () => {
      const topicTitle = "Don't Bet on Your Future (Youth Focus)";
      const targetUrl = `/work-with-tiffany?topic=${encodeURIComponent(topicTitle)}`;
      
      const res = await harness.request(targetUrl);
      const doc = parseHTML(res.text);

      const form = doc.getForms()[0];
      const messageTextarea = form.textareas.find(t => t.name === 'message');
      expect(messageTextarea).toBeTruthy();
      expect(messageTextarea.value).toContain(`Inquiring about speaking topic: ${topicTitle}`);
    });

    it('3.1.3: landing on /work-with-tiffany with ?type=Media pre-selects "Media / Press Inquiry" event type', async () => {
      const res = await harness.request('/work-with-tiffany?type=Media');
      const doc = parseHTML(res.text);

      const form = doc.getForms()[0];
      const eventTypeSelect = form.selects.find(s => s.name === 'event_type');
      expect(eventTypeSelect).toBeTruthy();

      const selectedOption = eventTypeSelect.options.find(o => o.value === 'Media / Press Inquiry');
      expect(selectedOption).toBeTruthy();
      expect(res.text).toContain('<option value="Media / Press Inquiry" selected>');
    });
  });

  // ============================================================================
  // Group 2: 301 Permanent Redirects & Nav Canonicalization
  // ============================================================================
  describe('3.2: 301 Permanent Redirects & Canonical Routing', () => {
    it('3.2.1: GET /speaking returns HTTP 301 redirect with Location: /services', async () => {
      const res = await harness.request('/speaking');
      expect(res.status).toBe(301);
      expect(res.redirectUrl).toBe('/services');
    });

    it('3.2.2: GET /book returns HTTP 301 redirect with Location: /work-with-tiffany', async () => {
      const res = await harness.request('/book');
      expect(res.status).toBe(301);
      expect(res.redirectUrl).toBe('/work-with-tiffany');
    });

    it('3.2.3: Global Navigation uses canonical destinations and never legacy redirect links', async () => {
      const res = await harness.request('/about');
      const doc = parseHTML(res.text);
      const links = doc.getLinks();

      const speakingLink = links.find(l => l.href === '/speaking');
      const bookLink = links.find(l => l.href === '/book');

      expect(speakingLink).toBeFalsy();
      expect(bookLink).toBeFalsy();

      const canonicalServices = links.find(l => l.href === '/services');
      const canonicalWork = links.find(l => l.href === '/work-with-tiffany');

      expect(canonicalServices).toBeTruthy();
      expect(canonicalWork).toBeTruthy();
    });
  });

  // ============================================================================
  // Group 3: Deep Link Anchors Across Pages
  // ============================================================================
  describe('3.3: Cross-Page Deep Link Anchors', () => {
    it('3.3.1: /about "How She Works" CTA links to /services#gear and target #gear exists on /services', async () => {
      const aboutRes = await harness.request('/about');
      const aboutDoc = parseHTML(aboutRes.text);
      const signpostLink = aboutDoc.getLinks().find(l => l.href === '/services#gear');
      expect(signpostLink).toBeTruthy();

      const servicesRes = await harness.request('/services');
      const servicesDoc = parseHTML(servicesRes.text);
      const gearSection = servicesDoc.getElementById('gear');
      expect(gearSection).toBeTruthy();
      expect(gearSection.textContent).toContain('The GEAR Method™');
    });

    it('3.3.2: /services capability cards have matching anchor IDs in the DOM', async () => {
      const res = await harness.request('/services');
      const doc = parseHTML(res.text);

      const requiredIds = [
        'strategic-advisor',
        'program-architect',
        'community-impact-strategist',
        'speaker-facilitator'
      ];

      for (const anchorId of requiredIds) {
        const el = doc.getElementById(anchorId);
        expect(el).toBeTruthy();
      }
    });

    it('3.3.3: /impact Gambling Prevention Practice CTA links to /about#specialism and target #specialism exists on /about', async () => {
      const impactRes = await harness.request('/impact');
      const impactDoc = parseHTML(impactRes.text);
      const practiceLink = impactDoc.getLinks().find(l => l.href === '/about#specialism');
      expect(practiceLink).toBeTruthy();

      const aboutRes = await harness.request('/about');
      const aboutDoc = parseHTML(aboutRes.text);
      const specialismSection = aboutDoc.getElementById('specialism');
      expect(specialismSection).toBeTruthy();
      expect(specialismSection.textContent).toContain('Where this work began');
    });
  });

  // ============================================================================
  // Group 4: Dynamic CMS -> Frontend Synchronization
  // ============================================================================
  describe('3.4: Dynamic CMS Content Synchronization to Astro Frontend', () => {
    it('3.4.1: modifying a key-value in database immediately updates rendered page content', async () => {
      const [page] = await query('SELECT id FROM website_pages WHERE slug = "about"');
      const originalValue = 'Where conviction meets the pavement.';
      const tempValue = 'Where conviction meets the pavement [TIER3-LIVE-SYNC-TEST].';

      // Update in DB
      await query('UPDATE website_content SET content_value = ? WHERE page_id = ? AND section = "story" AND key_name = "headline"', [tempValue, page.id]);

      const res = await harness.request('/about');
      expect(res.text).toContain(tempValue);

      // Revert in DB
      await query('UPDATE website_content SET content_value = ? WHERE page_id = ? AND section = "story" AND key_name = "headline"', [originalValue, page.id]);

      const revertedRes = await harness.request('/about');
      expect(revertedRes.text).toContain(originalValue);
      expect(revertedRes.text).toNotContain(tempValue);
    });

    it('3.4.2: adding an item to website_collections dynamically reflects on the rendered collection list', async () => {
      const [page] = await query('SELECT id FROM website_pages WHERE slug = "about"');
      
      const [resInsert] = await query(`
        INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active)
        VALUES (?, 'values_list', 'Tier3 Dynamic Value', 'Test Subtitle', 'Dynamic synchronization verification content.', 99, 1)
      `, [page.id]);
      const newColId = resInsert.insertId;

      const res = await harness.request('/about');
      expect(res.text).toContain('Tier3 Dynamic Value');
      expect(res.text).toContain('Dynamic synchronization verification content.');

      // Clean up
      await query('DELETE FROM website_collections WHERE id = ?', [newColId]);

      const cleanRes = await harness.request('/about');
      expect(cleanRes.text).toNotContain('Tier3 Dynamic Value');
    });

    it('3.4.3: top navigation dynamically reveals /insights link when article count increases to >= 6', async () => {
      const [page] = await query('SELECT id FROM website_pages WHERE slug = "insights"');
      
      // Initially 3 articles -> Insights nav link NOT rendered
      const initRes = await harness.request('/about');
      expect(initRes.text).toNotContain('href="/insights" class="nav-link"');

      // Add 3 dummy articles to reach count 6
      const [r1] = await query('INSERT INTO website_collections (page_id, section_name, title, subtitle, sort_order, is_active) VALUES (?, "articles", "Extra 1", "Sub", 10, 1)', [page.id]);
      const [r2] = await query('INSERT INTO website_collections (page_id, section_name, title, subtitle, sort_order, is_active) VALUES (?, "articles", "Extra 2", "Sub", 11, 1)', [page.id]);
      const [r3] = await query('INSERT INTO website_collections (page_id, section_name, title, subtitle, sort_order, is_active) VALUES (?, "articles", "Extra 3", "Sub", 12, 1)', [page.id]);

      const revealedRes = await harness.request('/about');
      expect(revealedRes.text).toContain('href="/insights" class="nav-link"');

      // Clean up added articles
      await query('DELETE FROM website_collections WHERE id IN (?, ?, ?)', [r1.insertId, r2.insertId, r3.insertId]);

      const restoredRes = await harness.request('/about');
      expect(restoredRes.text).toNotContain('href="/insights" class="nav-link"');
    });
  });
});
