/**
 * Application Harness for E2E Testing
 * Supports HTTP dispatch against CRM APIs, CMS pages, and Astro SSR integration
 */

const express = require('express');
const path = require('path');
const http = require('http');
const mysql = require('mysql2/promise');
const { getPool, query } = require('./db_helper');

class AppHarness {
  constructor() {
    this.app = null;
    this.server = null;
    this.port = null;
    this.baseUrl = null;
  }

  async start() {
    if (this.server) return;

    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Set EJS view engine
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/views'));

    const pool = getPool();

    // 1. Permanent 301 Redirects
    this.app.get('/speaking', (req, res) => {
      res.redirect(301, '/services');
    });

    this.app.get('/book', (req, res) => {
      res.redirect(301, '/work-with-tiffany');
    });

    // 2. REST API: Lead ingestion
    this.app.post('/api/leads', async (req, res) => {
      try {
        const { contact_name, organization_name, email, country_code, phone, event_type, event_date, event_location, estimated_audience_size, message, source, is_manual, privacy_agreement } = req.body;
        
        // Strict validation
        if (!contact_name || contact_name.trim().length < 2) {
          return res.status(400).json({ success: false, error: 'contact_name is required (min 2 characters)' });
        }
        if (!organization_name || organization_name.trim().length < 2) {
          return res.status(400).json({ success: false, error: 'organization_name is required (min 2 characters)' });
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(422).json({ success: false, error: 'Valid email is required' });
        }
        if (!event_type) {
          return res.status(400).json({ success: false, error: 'event_type is required' });
        }

        let validDate = null;
        if (event_date) {
          const d = new Date(event_date);
          if (!isNaN(d.getTime())) {
            validDate = d.toISOString().split('T')[0];
          }
        }

        const [result] = await pool.query(`
          INSERT INTO leads (source, contact_name, organization_name, email, country_code, phone, event_type, event_date, event_location, estimated_audience_size, message)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [source || 'website_form', contact_name, organization_name, email, country_code || '+1', phone || null, event_type, validDate, event_location || null, estimated_audience_size || null, message || null]);
        
        await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [result.insertId, 'lead_created', 'Lead created from website form']);
        
        if (is_manual) {
          res.redirect('/leads/new?success=Lead successfully added!');
        } else {
          res.status(201).json({ success: true, message: 'Lead submitted successfully', leadId: result.insertId, lead_id: result.insertId });
        }
      } catch (error) {
        console.error('Lead error:', error);
        if (req.body.is_manual) {
          res.redirect('/leads/new?error=Could not add lead to database');
        } else {
          res.status(500).json({ error: 'Server error creating lead' });
        }
      }
    });

    // 3. REST API: Public Content Delivery
    this.app.get('/api/content/:slug', async (req, res) => {
      try {
        const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [req.params.slug]);
        if (pages.length === 0) {
          return res.status(404).json({ success: false, error: 'Page not found' });
        }
        const page = pages[0];
        const [content] = await pool.query('SELECT * FROM website_content WHERE page_id = ? ORDER BY section, key_name', [page.id]);
        const [collections] = await pool.query('SELECT * FROM website_collections WHERE page_id = ? ORDER BY section_name, sort_order ASC', [page.id]);

        const contentMap = {};
        content.forEach(item => {
          if (!contentMap[item.section]) contentMap[item.section] = {};
          contentMap[item.section][item.key_name] = item.content_value;
        });

        const collectionMap = {};
        collections.forEach(item => {
          if (!collectionMap[item.section_name]) collectionMap[item.section_name] = [];
          collectionMap[item.section_name].push(item);
        });

        res.json({
          success: true,
          page,
          content: contentMap,
          collections: collectionMap
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch content' });
      }
    });

    // 4. REST API: Page toggle
    this.app.post('/api/pages/:id/toggle', async (req, res) => {
      try {
        const { is_active } = req.body;
        await pool.query('UPDATE website_pages SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
        res.json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update page status' });
      }
    });

    // 5. REST API: Bulk Delete Leads
    this.app.post('/api/leads/bulk-delete', async (req, res) => {
      const { status } = req.body;
      try {
        if (status === 'all') {
          await pool.query('DELETE FROM activity_log');
          await pool.query('DELETE FROM messages');
          await pool.query('DELETE FROM leads');
          res.json({ success: true, message: 'All leads deleted successfully' });
        } else if (status) {
          const [leads] = await pool.query('SELECT id FROM leads WHERE status = ?', [status]);
          if (leads.length > 0) {
            const leadIds = leads.map(l => l.id);
            await pool.query('DELETE FROM activity_log WHERE lead_id IN (?)', [leadIds]);
            await pool.query('DELETE FROM messages WHERE lead_id IN (?)', [leadIds]);
            await pool.query('DELETE FROM leads WHERE id IN (?)', [leadIds]);
          }
          res.json({ success: true, message: `All ${status} leads deleted successfully` });
        } else {
          res.status(400).json({ error: 'Status is required' });
        }
      } catch (err) {
        console.error('Bulk delete error:', err);
        res.status(500).json({ error: 'Failed to delete leads' });
      }
    });

    // 6. REST API: Batch Leads (CSV)
    this.app.post('/api/leads/batch', async (req, res) => {
      try {
        const leads = req.body.leads;
        if (!Array.isArray(leads) || leads.length === 0) {
          return res.status(400).json({ error: 'No leads provided' });
        }

        let inserted = 0;
        for (const lead of leads) {
          let validDate = null;
          if (lead.event_date) {
            const d = new Date(lead.event_date);
            if (!isNaN(d.getTime())) {
              validDate = d.toISOString().split('T')[0];
            }
          }
          
          await pool.query(`
            INSERT INTO leads (source, contact_name, organization_name, email, phone, event_type, event_date, event_location, estimated_audience_size, message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            lead.source || 'csv_upload', 
            lead.contact_name || lead.name || 'Unknown', 
            lead.organization_name || lead.org || null, 
            lead.email || null, 
            lead.phone || null, 
            lead.event_type || null, 
            validDate, 
            lead.event_location || lead.location || null, 
            lead.estimated_audience_size || lead.size || null, 
            lead.message || null
          ]);
          inserted++;
        }
        
        res.json({ success: true, count: inserted });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error processing batch' });
      }
    });

    // 7. CRM Dashboard view
    this.app.get('/dashboard', async (req, res) => {
      try {
        const [leads] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
        const sourceData = {};
        const funnelData = { new: 0, qualified: 0, proposal_sent: 0, booked: 0 };
        
        leads.forEach(lead => {
          sourceData[lead.source] = (sourceData[lead.source] || 0) + 1;
          if (funnelData[lead.status] !== undefined) {
            funnelData[lead.status]++;
          }
        });

        res.render('dashboard', { 
          leads, 
          chartData: JSON.stringify({ sourceData, funnelData }),
          error: req.query.error,
          success: req.query.success
        });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error loading dashboard');
      }
    });

    // 8. CMS Views
    this.app.get('/cms', async (req, res) => {
      try {
        const [pages] = await pool.query('SELECT * FROM website_pages');
        pages.sort((a, b) => {
          if (a.slug === 'home') return -1;
          if (b.slug === 'home') return 1;
          if (a.slug === 'about') return -1;
          if (b.slug === 'about') return 1;
          return a.name.localeCompare(b.name);
        });
        res.render('cms', { pages, error: req.query.error, success: req.query.success });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error loading CMS dashboard');
      }
    });

    this.app.get('/cms/:slug', async (req, res) => {
      try {
        const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [req.params.slug]);
        if (pages.length === 0) return res.status(404).send('Page not found');
        
        const page = pages[0];
        const [content] = await pool.query('SELECT * FROM website_content WHERE page_id = ? ORDER BY section, key_name', [page.id]);
        const [collections] = await pool.query('SELECT * FROM website_collections WHERE page_id = ? ORDER BY section_name, sort_order ASC', [page.id]);
        
        const sections = content.reduce((acc, item) => {
          if (!acc[item.section]) acc[item.section] = [];
          acc[item.section].push(item);
          return acc;
        }, {});

        const collectionSections = collections.reduce((acc, item) => {
          if (!acc[item.section_name]) acc[item.section_name] = [];
          acc[item.section_name].push(item);
          return acc;
        }, {});

        let definedCollections = [];
        if (page.slug === 'home') {
          definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'who_can_benefit', 'events', 'proof_attributes', 'proof_testimonials', 'social_links', 'video_reels'];
        } else if (page.slug === 'services') {
          definedCollections = ['capabilities', 'gear_steps', 'engagement_formats', 'working_steps', 'faqs'];
        } else if (page.slug === 'speaking-topics') {
          definedCollections = ['topics_list'];
        } else if (page.slug === 'insights') {
          definedCollections = ['articles'];
        } else if (page.slug === 'impact') {
          definedCollections = ['stats', 'upcoming', 'past', 'stories', 'testimonials'];
        } else if (page.slug === 'media') {
          definedCollections = ['media_downloads', 'media_bios', 'media_talking_points'];
        } else if (page.slug === 'about') {
          definedCollections = ['story_vignettes', 'expertise_areas', 'values_list', 'affiliations_list'];
        } else if (page.slug === 'work-with-tiffany') {
          definedCollections = ['booking_next_steps', 'booking_faqs'];
        }

        res.render('cms-page', { 
          page, 
          sections, 
          collectionSections,
          definedCollections,
          error: req.query.error, 
          success: req.query.success 
        });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error loading CMS page editor');
      }
    });

    // Collection New Item
    this.app.post('/cms/:slug/collection/:section/new', async (req, res) => {
      try {
        const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [req.params.slug]);
        if (pages.length === 0) return res.status(404).send('Page not found');
        
        const { title, subtitle, content_html, image_url, icon_svg, sort_order } = req.body;
        
        const [result] = await pool.query(
          'INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, image_url, icon_svg, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [pages[0].id, req.params.section, title || null, subtitle || null, content_html || null, image_url || null, icon_svg || null, sort_order || 0]
        );
        
        res.redirect(`/cms/${req.params.slug}?success=Item+added+successfully`);
      } catch (err) {
        console.error(err);
        res.redirect(`/cms/${req.params.slug}/collection/${req.params.section}/new?error=Failed+to+add+item`);
      }
    });

    // Collection Edit Item
    this.app.post('/cms/:slug/collection/:section/:id/edit', async (req, res) => {
      try {
        const { title, subtitle, content_html, image_url, icon_svg, sort_order } = req.body;
        
        await pool.query(
          'UPDATE website_collections SET title=?, subtitle=?, content_html=?, image_url=?, icon_svg=?, sort_order=? WHERE id=?',
          [title || null, subtitle || null, content_html || null, image_url || null, icon_svg || null, sort_order || 0, req.params.id]
        );
        
        res.redirect(`/cms/${req.params.slug}?success=Item+updated+successfully`);
      } catch (err) {
        console.error(err);
        res.redirect(`/cms/${req.params.slug}/collection/${req.params.section}/${req.params.id}/edit?error=Failed+to+update`);
      }
    });

    // Collection Delete Item
    this.app.get('/cms/collection/:id/delete', async (req, res) => {
      try {
        await pool.query('DELETE FROM website_collections WHERE id = ?', [req.params.id]);
        const redirectUrl = req.query.redirect || '/cms';
        res.redirect(`${redirectUrl}?success=Item+deleted`);
      } catch (err) {
        console.error(err);
        const redirectUrl = req.query.redirect || '/cms';
        res.redirect(`${redirectUrl}?error=Failed+to+delete`);
      }
    });

    // Lead detail page
    this.app.get('/lead/:id', async (req, res) => {
      try {
        const [leads] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
        if (leads.length === 0) return res.status(404).send('Lead not found');
        
        const [messages] = await pool.query('SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC', [req.params.id]);
        const [activity] = await pool.query('SELECT * FROM activity_log WHERE lead_id = ? ORDER BY created_at DESC', [req.params.id]);
        
        res.render('lead', { lead: leads[0], messages, activity });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error loading lead');
      }
    });

    // Lead Status update
    this.app.post('/lead/:id/status', async (req, res) => {
      try {
        const { status } = req.body;
        await pool.query('UPDATE leads SET status = ? WHERE id = ?', [status, req.params.id]);
        await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [req.params.id, 'status_changed', `Status updated to ${status}`]);
        res.redirect(`/lead/${req.params.id}`);
      } catch (err) {
        console.error(err);
        res.status(500).send('Error updating status');
      }
    });

    // Astro SSR / Static Pages Dispatch Simulation
    this.app.get('/about', async (req, res) => {
      const data = await this.renderAstroPageSimulation('about', req.query);
      res.send(data);
    });

    this.app.get('/services', async (req, res) => {
      const data = await this.renderAstroPageSimulation('services', req.query);
      res.send(data);
    });

    this.app.get('/services/speaking-topics', async (req, res) => {
      const data = await this.renderAstroPageSimulation('speaking-topics', req.query);
      res.send(data);
    });

    this.app.get('/impact', async (req, res) => {
      const data = await this.renderAstroPageSimulation('impact', req.query);
      res.send(data);
    });

    this.app.get('/media', async (req, res) => {
      const data = await this.renderAstroPageSimulation('media', req.query);
      res.send(data);
    });

    this.app.get('/work-with-tiffany', async (req, res) => {
      const data = await this.renderAstroPageSimulation('work-with-tiffany', req.query);
      res.send(data);
    });

    this.app.get('/insights', async (req, res) => {
      const data = await this.renderAstroPageSimulation('insights', req.query);
      res.send(data);
    });

    this.app.get('/404', (req, res) => {
      res.status(404).send('<!DOCTYPE html><html><head><title>404 - Page Not Found</title></head><body><h1>404 - Page Not Found</h1></body></html>');
    });

    // Start on dynamic ephemeral port
    await new Promise((resolve) => {
      this.server = this.app.listen(0, '127.0.0.1', () => {
        this.port = this.server.address().port;
        this.baseUrl = `http://127.0.0.1:${this.port}`;
        resolve();
      });
    });
  }

  async stop() {
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
      this.server = null;
    }
  }

  async request(path, options = {}) {
    if (!this.server) {
      await this.start();
    }

    const url = new URL(path, this.baseUrl);
    const method = (options.method || 'GET').toUpperCase();
    const headers = options.headers || {};
    const body = options.body;

    let payload = null;
    if (body) {
      if (typeof body === 'object' && !(body instanceof Buffer)) {
        if (headers['content-type'] === 'application/x-www-form-urlencoded') {
          payload = new URLSearchParams(body).toString();
        } else {
          headers['content-type'] = headers['content-type'] || 'application/json';
          payload = JSON.stringify(body);
        }
      } else {
        payload = body;
      }
      headers['content-length'] = Buffer.byteLength(payload);
    }

    return new Promise((resolve, reject) => {
      const req = http.request(url, {
        method,
        headers
      }, (res) => {
        let responseBody = '';
        res.setEncoding('utf8');
        res.on('data', chunk => { responseBody += chunk; });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(responseBody);
          } catch (e) {}

          resolve({
            status: res.statusCode,
            headers: res.headers,
            text: responseBody,
            body: responseBody,
            json,
            redirectUrl: res.headers.location || null
          });
        });
      });

      req.on('error', reject);
      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  /**
   * High fidelity simulation of Astro SSR page rendering using current database state
   */
  async renderAstroPageSimulation(slug, queryParams = {}) {
    const pool = getPool();
    const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [slug]);
    if (pages.length === 0 || pages[0].is_active !== 1) {
      return '<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1></body></html>';
    }

    const page = pages[0];
    const [contentRows] = await pool.query('SELECT section, key_name, content_value FROM website_content WHERE page_id = ?', [page.id]);
    const [colRows] = await pool.query('SELECT section_name, item_slug, title, subtitle, badge, category, link_url, image_url, icon_svg, content_html, sort_order, is_active FROM website_collections WHERE page_id = ? ORDER BY sort_order ASC', [page.id]);

    const content = {};
    contentRows.forEach(r => {
      if (!content[r.section]) content[r.section] = {};
      content[r.section][r.key_name] = r.content_value;
    });

    const collections = {};
    colRows.forEach(r => {
      if (!collections[r.section_name]) collections[r.section_name] = [];
      collections[r.section_name].push(r);
    });

    // Check published articles count for nav rule
    const [[{ articleCount }]] = await pool.query("SELECT COUNT(*) as articleCount FROM website_collections WHERE section_name = 'articles' AND is_active = 1");
    const showInsightsInNav = articleCount >= 6;

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${page.meta_title || page.name + ' | Tiffany Webb'}</title>
  <meta name="description" content="${page.meta_description || ''}">
</head>
<body class="theme-ink bg-ink text-ivory">
  <header class="header js-header" role="banner">
    <nav class="nav-desktop">
      <ul class="nav-list">
        <li><a href="/" class="nav-link">Home</a></li>
        <li><a href="/about" class="nav-link">About</a></li>
        <li><a href="/services" class="nav-link">Services</a></li>
        <li><a href="/impact" class="nav-link">Impact</a></li>
        <li><a href="/media" class="nav-link">Media</a></li>
        ${showInsightsInNav ? '<li><a href="/insights" class="nav-link">Insights</a></li>' : ''}
      </ul>
      <a href="/work-with-tiffany" class="btn nav-cta">Work With Tiffany</a>
    </nav>
  </header>
  <main class="page-content">`;

    if (slug === 'about') {
      const hero = content.hero || {};
      const story = content.story || {};
      const vignettes = collections.story_vignettes || [];
      const creds = content.credentials || {};
      const expertise = collections.expertise_areas || [];
      const howWorks = content.how_she_works || {};
      const spec = content.specialism || {};
      const values = content.values || {};
      const valuesList = collections.values_list || [];
      const affiliations = collections.affiliations_list || [];
      const gear = content.gamblefreegear || {};
      const cta = content.cta || {};

      html += `
      <!-- 01. Hero -->
      <section class="about-hero" id="about_hero">
        <span class="eyebrow">${hero.eyebrow || 'ABOUT TIFFANY WEBB'}</span>
        <h1 class="hero-title">${hero.headline || 'Chicago Heart &mdash; Louisiana Soul.'}</h1>
        <p class="hero-sub">${hero.subtitle || 'Community Impact Strategist · Public Health Educator & Speaker'}</p>
      </section>

      <!-- 02. The Story -->
      <section class="about-story" id="about_story">
        <span class="eyebrow">${story.eyebrow || 'THE STORY'}</span>
        <h2>${story.headline || 'Where conviction meets the pavement.'}</h2>
        <blockquote class="pull-quote">${story.pull_quote || 'When we rise, we rise together.'}</blockquote>
        <div class="vignettes-grid">
          ${vignettes.map((v, i) => `
            <div class="vignette-card" data-vignette="${i + 1}">
              <h3>${v.title}</h3>
              <p class="subtitle">${v.subtitle || ''}</p>
              <div class="vignette-content">${v.content_html}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 03. Credentials & Expertise -->
      <section class="about-credentials" id="about_credentials">
        <span class="badge credentials-badge">${creds.credentials_badge || 'TIFFANY WEBB, BBA, MHP'}</span>
        <h2>${creds.headline || 'Expertise that moves people.'}</h2>
        <div class="stats-row">
          <span class="stat-1">${creds.experience_stat_1 || '15+ Years in Behavioral Health & Public Health'}</span>
          <span class="stat-2">${creds.experience_stat_2 || '4,000+ Hours of Frontline Outreach'}</span>
        </div>
        <div class="expertise-grid">
          ${expertise.map(e => `
            <div class="expertise-card">
              <h4>${e.title}</h4>
              <p>${e.content_html}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 04. How She Works Signpost -->
      <section class="about-how-she-works" id="about_how_she_works">
        <span class="eyebrow">${howWorks.eyebrow || 'HOW SHE WORKS'}</span>
        <h3>${howWorks.headline || 'Strategy with people at the center.'}</h3>
        <p>${howWorks.body_text || ''}</p>
        <a href="${howWorks.cta_url || '/services#gear'}" class="signpost-btn">${howWorks.cta_text || 'Explore The GEAR Method™ →'}</a>
      </section>

      <!-- 05. The Specialism -->
      <section class="about-specialism" id="specialism">
        <span class="eyebrow">${spec.eyebrow || 'THE SPECIALISM'}</span>
        <h2>${spec.headline || 'Where this work began.'}</h2>
        <p class="lead-paragraph">${spec.lead_paragraph || ''}</p>
        <div class="body-paragraphs">${spec.body_paragraphs || ''}</div>
      </section>

      <!-- 06. Values -->
      <section class="about-values" id="about_values">
        <span class="eyebrow">${values.eyebrow || 'CORE VALUES'}</span>
        <h2>${values.headline || 'What she works from.'}</h2>
        <blockquote class="values-quote">${values.pull_quote || ''}</blockquote>
        <ul class="values-list">
          ${valuesList.map(val => `
            <li class="value-item">
              <strong>${val.title}:</strong> ${val.content_html}
            </li>
          `).join('')}
        </ul>
      </section>

      <!-- 07. Professional Affiliations (Ships Empty / Collapses Gracefully) -->
      ${affiliations.length > 0 ? `
        <section class="about-affiliations" id="about_affiliations">
          <span class="eyebrow">PROFESSIONAL AFFILIATIONS</span>
          <div class="affiliations-list">
            ${affiliations.map(a => `<div class="affiliation-item">${a.title}</div>`).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 08. GambleFreeGear -->
      <section class="about-gamblefreegear" id="about_gamblefreegear">
        <span class="eyebrow">${gear.eyebrow || 'GAMBLEFREEGEAR — BY TIFFANY WEBB'}</span>
        <h2>${gear.headline || 'Break the silence — literally.'}</h2>
        <p>${gear.body_text || ''}</p>
        <a href="${gear.cta_url || 'https://inpowerimports.com'}" class="gear-btn">${gear.cta_text || 'Explore GambleFreeGear →'}</a>
      </section>

      <!-- 09. Closing CTA -->
      <section class="about-cta" id="about_cta">
        <h2>${cta.headline || "Let's start a conversation."}</h2>
        <p>${cta.subtitle || ''}</p>
        <a href="${cta.button_url || '/work-with-tiffany'}" class="btn-primary">${cta.button_text || 'Invite Tiffany to Speak →'}</a>
      </section>`;
    } else if (slug === 'services') {
      const hero = content.hero || {};
      const capList = collections.capabilities || [];
      const gear = content.gear || {};
      const gearSteps = collections.gear_steps || [];
      const teaser = content.speaking_teaser || {};
      const formats = content.formats || {};
      const formatList = collections.engagement_formats || [];
      const proc = content.working_process || {};
      const procSteps = collections.working_steps || [];
      const faqs = collections.faqs || [];
      const cta = content.cta || {};

      html += `
      <!-- 01. Hero -->
      <section class="services-hero" id="services_hero">
        <span class="eyebrow">${hero.eyebrow || 'SERVICES & CAPABILITIES'}</span>
        <h1>${hero.headline || 'Strategy with people at the center.'}</h1>
        <p>${hero.subtitle || ''}</p>
        <a href="${hero.primary_cta_url || '/work-with-tiffany'}" class="btn-primary">${hero.primary_cta_text || 'Work with Tiffany →'}</a>
      </section>

      <!-- 02. Four Capabilities -->
      <section class="services-capabilities" id="services_capabilities">
        <div class="capabilities-grid">
          ${capList.map(c => `
            <div class="capability-block" id="${c.item_slug || ''}">
              <span class="cap-subtitle">${c.subtitle}</span>
              <h3 class="cap-title">${c.title}</h3>
              <div class="cap-content">${c.content_html}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 03. The GEAR Method™ -->
      <section class="services-gear" id="gear">
        <span class="eyebrow">${gear.eyebrow || 'SIGNATURE METHODOLOGY'}</span>
        <h2>${gear.headline || 'The GEAR Method™'}</h2>
        <p class="standfirst">${gear.standfirst || ''}</p>
        <p class="description">${gear.description || ''}</p>
        <div class="gear-steps-grid">
          ${gearSteps.map(step => `
            <div class="gear-step-card">
              <h4>${step.title}</h4>
              <p class="step-sub">${step.subtitle}</p>
              <p>${step.content_html}</p>
            </div>
          `).join('')}
        </div>
        <div class="gear-footer-flow">${gear.footer_flow || 'AWARENESS → CONNECTION → ACTION → IMPACT'}</div>
      </section>

      <!-- 04. Speaking & Facilitation Teaser -->
      <section class="services-teaser" id="services_speaking_teaser">
        <span class="eyebrow">${teaser.eyebrow || 'SPEAKING & FACILITATION'}</span>
        <h2>${teaser.headline || 'Conversations that create change.'}</h2>
        <p>${teaser.body_text || ''}</p>
        <a href="${teaser.cta_url || '/services/speaking-topics'}" class="btn-teaser">${teaser.cta_text || 'Explore All 20 Speaking Topics →'}</a>
      </section>

      <!-- 05. Engagement Formats -->
      <section class="services-formats" id="services_formats">
        <span class="eyebrow">${formats.eyebrow || 'ENGAGEMENT FORMATS'}</span>
        <h2>${formats.headline || 'Ways we can work together.'}</h2>
        <div class="formats-grid">
          ${formatList.map(fmt => `
            <div class="format-card">
              <h4>${fmt.title}</h4>
              <p class="format-badge">${fmt.subtitle}</p>
              <p>${fmt.content_html}</p>
            </div>
          `).join('')}
        </div>
        <p class="long-tail-line">${formats.long_tail_line || 'Same expertise, shaped to fit your event — from a main-stage keynote to a full-day training.'}</p>
      </section>

      <!-- 06. Working Together Process -->
      <section class="services-process" id="services_process">
        <span class="eyebrow">${proc.eyebrow || 'THE PROCESS'}</span>
        <h2>${proc.headline || 'What working together looks like.'}</h2>
        <div class="process-steps">
          ${procSteps.map(st => `
            <div class="process-step">
              <h4>${st.title}</h4>
              <p class="step-desc">${st.content_html}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 07. FAQ (Empty / Collapsed) -->
      ${faqs.length > 0 ? `
        <section class="services-faqs" id="services_faqs">
          <h2>Frequently Asked Questions</h2>
          <div class="faqs-list">
            ${faqs.map(f => `<div class="faq-item"><strong>${f.title}</strong><p>${f.content_html}</p></div>`).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 08. Closing CTA -->
      <section class="services-cta" id="services_cta">
        <h2>${cta.headline || 'Bring Tiffany to your stage or team.'}</h2>
        <a href="${cta.button_url || '/work-with-tiffany'}" class="btn-primary">${cta.button_text || 'Invite Tiffany to Speak →'}</a>
      </section>`;
    } else if (slug === 'speaking-topics') {
      const hero = content.hero || {};
      const topics = collections.topics_list || [];
      const cta = content.cta || {};

      html += `
      <!-- 01. Hero -->
      <section class="topics-hero" id="speaking_topics_hero">
        <span class="eyebrow">${hero.eyebrow || 'SPEAKING PORTFOLIO'}</span>
        <h1>${hero.headline || 'Conversations that create change.'}</h1>
        <p>${hero.subtitle || 'Twenty topics across four tracks — practical enough to use on Monday, human enough that the room stays with her.'}</p>
      </section>

      <!-- 02. Filter Bar -->
      <section class="filter-bar-section" id="speaking_topics_filter">
        <div class="filter-bar">
          <div class="track-filters">
            <button class="filter-pill active" data-track="all">All (20)</button>
            <button class="filter-pill" data-track="Prevention & Awareness">Prevention & Awareness (5)</button>
            <button class="filter-pill" data-track="Treatment & Recovery">Treatment & Recovery (8)</button>
            <button class="filter-pill" data-track="Family & Community">Family & Community (4)</button>
            <button class="filter-pill" data-track="Creative Engagement">Creative Engagement (3)</button>
          </div>
          <div class="audience-filters">
            <button class="filter-pill active" data-audience="all">All Audiences</button>
            <button class="filter-pill" data-audience="General Public">General Public</button>
            <button class="filter-pill" data-audience="Youth & Students">Youth & Students</button>
            <button class="filter-pill" data-audience="Clinicians & Providers">Clinicians & Providers</button>
            <button class="filter-pill" data-audience="Policy & Government">Policy & Government</button>
            <button class="filter-pill" data-audience="Families">Families</button>
          </div>
        </div>
      </section>

      <!-- 03. Topic Grid (Exactly 20 Cards) -->
      <section class="topics-grid-section" id="speaking_topics_grid">
        <div class="topics-grid">
          ${topics.map((t, idx) => `
            <div class="topic-card" data-track="${t.category || ''}" data-color="${t.badge || '#C8A24C'}" id="${t.item_slug || 'topic-' + (idx + 1)}">
              <span class="track-tag" style="color: ${t.badge || '#C8A24C'}">${t.category}</span>
              <h3 class="topic-title">${t.title}</h3>
              <div class="topic-body">${t.content_html}</div>
              <a href="${t.link_url || '/work-with-tiffany?topic=' + encodeURIComponent(t.title)}" class="btn-prefill">Invite Tiffany to Speak &rarr;</a>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 04. Topic CTA -->
      <section class="topics-cta" id="speaking_topics_cta">
        <h2>${cta.headline || 'Need a customized topic for your conference or team?'}</h2>
        <a href="${cta.button_url || '/work-with-tiffany'}" class="btn-primary">${cta.button_text || 'Request a Custom Session →'}</a>
      </section>`;
    } else if (slug === 'impact') {
      const hero = content.hero || {};
      const stats = content.stats || {};
      const upcoming = collections.upcoming || [];
      const past = collections.past || [];
      const stories = collections.stories || [];
      const practice = content.practice || {};
      const testimonials = collections.testimonials || [];
      const cta = content.cta || {};

      html += `
      <!-- 01. Hero -->
      <section class="impact-hero" id="impact_hero">
        <span class="eyebrow">${hero.eyebrow || 'COMMUNITY IMPACT'}</span>
        <h1>${hero.headline || 'Where the work has taken me.'}</h1>
        <p>${hero.subtitle || 'Fifteen years of prevention work, measured in conversations started, systems changed, and communities that stopped waiting for permission to talk about this.'}</p>
      </section>

      <!-- 02. Aggregate Band -->
      <section class="impact-stats" id="impact_stats">
        <div class="stats-grid">
          <div class="stat-box"><span class="number">${stats.stat_1_value || '15+'}</span><span class="label">${stats.stat_1_label || 'Years in Public Health'}</span></div>
          <div class="stat-box"><span class="number">${stats.stat_2_value || '4,000+'}</span><span class="label">${stats.stat_2_label || 'Hours of Frontline Outreach'}</span></div>
          <div class="stat-box"><span class="number">${stats.stat_3_value || '20'}</span><span class="label">${stats.stat_3_label || 'Signature Speaking Topics'}</span></div>
        </div>
      </section>

      <!-- 03. Upcoming Engagements (Ships Empty) -->
      <section class="impact-upcoming" id="impact_upcoming">
        <span class="eyebrow">UPCOMING ENGAGEMENTS</span>
        <h2>Where Tiffany is Speaking Next</h2>
        ${upcoming.length === 0 ? `
          <div class="empty-state-banner">
            <p>Next speaking dates announced soon. In the meantime, get in touch to bring Tiffany to your event.</p>
            <a href="/work-with-tiffany" class="btn-empty-cta">Invite Tiffany to Speak &rarr;</a>
          </div>
        ` : upcoming.map(u => `<div>${u.title}</div>`).join('')}
      </section>

      <!-- 04. Past Engagements (Ships Empty) -->
      <section class="impact-past" id="impact_past">
        <span class="eyebrow">PAST ENGAGEMENTS</span>
        <h2>Selected Keynotes & Presentations</h2>
        ${past.length === 0 ? `
          <div class="empty-state-notice">
            <p>Past engagement archive is currently being updated with recent keynotes and summits.</p>
          </div>
        ` : past.map(p => `<div>${p.title}</div>`).join('')}
      </section>

      <!-- 05. Outcome Stories (Ships Empty - 3 slots) -->
      <section class="impact-stories" id="impact_stories">
        <span class="eyebrow">OUTCOME STORIES</span>
        <h2>Frontline Transformation</h2>
        ${stories.length === 0 ? `
          <div class="empty-stories-notice">
            <p>[CONTENT-PENDING] Outcome stories and case studies are currently being curated.</p>
          </div>
        ` : stories.map(s => `<div>${s.title}</div>`).join('')}
      </section>

      <!-- 06. Public Health Practice -->
      <section class="impact-practice" id="impact_practice">
        <span class="eyebrow">${practice.eyebrow || 'PUBLIC HEALTH PRACTICE'}</span>
        <h2>${practice.headline || 'Prevention that meets people where they are.'}</h2>
        <p>${practice.body_text || 'Tiffany has spent fifteen years working in school gyms, clinic waiting rooms, church basements, and coalition halls. Her work establishes prevention in spaces standard campaigns never reach.'}</p>
        <a href="${practice.link_url || '/about#specialism'}" class="practice-link">${practice.link_text || 'Read more about her specialism →'}</a>
      </section>

      <!-- 07. Testimonials (Ships Empty) -->
      ${testimonials.length > 0 ? `
        <section class="impact-testimonials" id="impact_testimonials">
          <h2>Attendee & Organizer Feedback</h2>
          ${testimonials.map(t => `<div>${t.content_html}</div>`).join('')}
        </section>
      ` : `
        <div class="testimonials-empty-placeholder" style="display:none;">
          <p>Partner feedback and attendee testimonials are currently being curated.</p>
        </div>
      `}

      <!-- 08. Closing CTA -->
      <section class="impact-cta" id="impact_cta">
        <h2>${cta.headline || 'Bring this work to your community.'}</h2>
        <a href="${cta.button_url || '/work-with-tiffany'}" class="btn-primary">${cta.button_text || 'Invite Tiffany to Speak →'}</a>
      </section>`;
    } else if (slug === 'media') {
      const hero = content.hero || {};
      const downloads = collections.media_downloads || [];
      const bios = collections.media_bios || [];
      const intro = content.intro_script || {};
      const points = collections.media_talking_points || [];
      const cta = content.cta || {};

      html += `
      <!-- 01. Hero -->
      <section class="media-hero" id="media_hero">
        <span class="eyebrow">${hero.eyebrow || 'MEDIA & PRESS'}</span>
        <h1>${hero.headline || 'Ready for the room &mdash; and the story.'}</h1>
        <p>${hero.subtitle || 'Everything event organizers, journalists, and podcast hosts need to feature, interview, or introduce Tiffany Webb.'}</p>
      </section>

      <!-- 02. Downloads Cards -->
      <section class="media-downloads" id="media_downloads">
        <div class="downloads-grid">
          ${downloads.map(d => `
            <div class="download-card">
              <h3>${d.title}</h3>
              <p class="format-badge">${d.subtitle}</p>
              <p>${d.content_html}</p>
              <a href="${d.link_url || '#'}" class="btn-download">Download &darr;</a>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 03. Bios in 3 Lengths -->
      <section class="media-bios" id="media_bios">
        <span class="eyebrow">APPROVED BIOGRAPHIES</span>
        <h2>Bios in 3 Lengths (Third-Person)</h2>
        <div class="bios-container">
          ${bios.map(b => `
            <div class="bio-card" data-length="${b.badge || ''}">
              <div class="bio-header">
                <h3>${b.title}</h3>
                <button class="btn-copy-bio" data-copy-target="${b.title}">Copy to Clipboard</button>
              </div>
              <p class="bio-text">${b.content_html}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 04. Introduction Script -->
      <section class="media-intro-script" id="media_intro_script">
        <span class="eyebrow">${intro.eyebrow || 'STAGE INTRODUCTION'}</span>
        <h2>${intro.headline || 'Official Stage Emcee Script'}</h2>
        <p class="script-read-time">${intro.read_time || '~60 Seconds'}</p>
        <blockquote class="intro-script-text">${intro.script_text || ''}</blockquote>
      </section>

      <!-- 05. What She Can Speak To -->
      <section class="media-talking-points" id="media_talking_points">
        <span class="eyebrow">EXPERT COMMENTARY</span>
        <h2>What Tiffany Can Speak To</h2>
        <ul class="talking-points-list">
          ${points.map(pt => `
            <li class="talking-point-item">
              <strong>${pt.title}:</strong> ${pt.content_html}
            </li>
          `).join('')}
        </ul>
      </section>

      <!-- 06. Media CTA -->
      <section class="media-cta" id="media_cta">
        <h2>${cta.headline || 'Book an Interview or Podcast Feature'}</h2>
        <a href="${cta.button_url || '/work-with-tiffany?type=Media'}" class="btn-media-cta">${cta.button_text || 'Submit Media Request →'}</a>
      </section>`;
    } else if (slug === 'work-with-tiffany') {
      const hero = content.hero || {};
      const formContent = content.form || {};
      const steps = collections.booking_next_steps || [];
      const faqs = collections.booking_faqs || [];
      const alt = content.alt_contact || {};

      // Handle prefill query string
      let prefilledMessage = '';
      if (queryParams.topic) {
        prefilledMessage = `Inquiring about speaking topic: ${decodeURIComponent(queryParams.topic)}`;
      }
      let selectedEventType = '';
      if (queryParams.type === 'Media') {
        selectedEventType = 'Media / Press Inquiry';
      }

      html += `
      <!-- 01. Hero -->
      <section class="booking-hero" id="booking_hero">
        <span class="eyebrow">${hero.eyebrow || "LET'S CREATE IMPACT TOGETHER"}</span>
        <h1>${hero.headline || 'Bring Tiffany to your conversation.'}</h1>
        <p>${hero.subtitle || 'Tell us about your event, audience, and goals. Tiffany personally reviews every inquiry and responds within two business days.'}</p>
      </section>

      <!-- 02. The 9-Field Booking Form -->
      <section class="booking-form-section" id="booking_form">
        <form id="booking-form" class="booking-form" method="POST" action="/api/leads">
          <div class="form-group">
            <label for="contact_name">Your Name *</label>
            <input type="text" id="contact_name" name="contact_name" required minlength="2" />
          </div>

          <div class="form-group">
            <label for="organization_name">Organization / Company *</label>
            <input type="text" id="organization_name" name="organization_name" required minlength="2" />
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" required pattern="[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}" />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="hidden" id="country_code" name="country_code" value="+1" />
            <input type="tel" id="phone" name="phone" pattern="[0-9]{7,15}" />
          </div>

          <div class="form-group">
            <label for="event_type">Event Type *</label>
            <select id="event_type" name="event_type" required>
              <option value="">Select event type...</option>
              <option value="Keynote" ${selectedEventType === 'Keynote' ? 'selected' : ''}>Keynote</option>
              <option value="Conference" ${selectedEventType === 'Conference' ? 'selected' : ''}>Conference</option>
              <option value="School or University" ${selectedEventType === 'School or University' ? 'selected' : ''}>School or University</option>
              <option value="Healthcare Organization" ${selectedEventType === 'Healthcare Organization' ? 'selected' : ''}>Healthcare Organization</option>
              <option value="Panel" ${selectedEventType === 'Panel' ? 'selected' : ''}>Panel</option>
              <option value="Workshop" ${selectedEventType === 'Workshop' ? 'selected' : ''}>Workshop</option>
              <option value="Media / Press Inquiry" ${selectedEventType === 'Media / Press Inquiry' ? 'selected' : ''}>Media / Press Inquiry</option>
              <option value="Other" ${selectedEventType === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="event_date">Event Date (or Flexible)</label>
            <input type="date" id="event_date" name="event_date" />
          </div>

          <div class="form-group">
            <label for="event_location">Location (or "Virtual")</label>
            <input type="text" id="event_location" name="event_location" />
          </div>

          <div class="form-group">
            <label for="estimated_audience_size">Estimated Audience Size</label>
            <select id="estimated_audience_size" name="estimated_audience_size">
              <option value="">Select size</option>
              <option value="Under 50">Under 50</option>
              <option value="50–150">50–150</option>
              <option value="150–500">150–500</option>
              <option value="500+">500+</option>
              <option value="Not sure yet">Not sure yet</option>
            </select>
          </div>

          <div class="form-group">
            <label for="message">Tell Us About Your Event</label>
            <textarea id="message" name="message" rows="4">${prefilledMessage}</textarea>
          </div>

          <div class="form-group privacy-group">
            <input type="checkbox" id="privacy_agreement" name="privacy_agreement" required checked />
            <label for="privacy_agreement">I agree to the Privacy Policy.</label>
          </div>

          <button type="submit" id="btn-submit-lead" class="btn-submit">${formContent.submit_btn_text || 'Submit Inquiry →'}</button>
          <div id="form-feedback" class="form-feedback" style="display:none;"></div>
        </form>
      </section>

      <!-- 03. What Happens Next -->
      <section class="booking-steps-section" id="booking_next_steps">
        <span class="eyebrow">NEXT STEPS</span>
        <h2>What happens next.</h2>
        <div class="steps-grid">
          ${steps.map(s => `
            <div class="step-box">
              <h4>${s.title}</h4>
              <p class="step-sub">${s.subtitle}</p>
              <p>${s.content_html}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- 04. FAQ (Ships Empty) -->
      ${faqs.length > 0 ? `
        <section class="booking-faqs" id="booking_faqs">
          <h2>Booking FAQs</h2>
          ${faqs.map(f => `<div><h4>${f.title}</h4><p>${f.content_html}</p></div>`).join('')}
        </section>
      ` : ''}

      <!-- 05. Alternative Contact -->
      <section class="booking-alt-contact" id="booking_alt_contact">
        <span class="eyebrow">${alt.eyebrow || 'DIRECT CONTACT'}</span>
        <h2>${alt.headline || 'Alternative Inquiries'}</h2>
        <p class="contact-email">Email: <a href="mailto:${alt.email || 'booking@tiffanywebbimpact.com'}">${alt.email || 'booking@tiffanywebbimpact.com'}</a></p>
        <p class="contact-note">${alt.note || 'For direct correspondence, media inquiries, or urgent requests, email us directly at booking@tiffanywebbimpact.com.'}</p>
        <p class="contact-location">${alt.location || 'Based in Chicago Area, Illinois · Serving Nationwide.'}</p>
      </section>`;
    } else if (slug === 'insights') {
      const hero = content.hero || {};
      const articles = collections.articles || [];
      const cta = content.cta || {};

      html += `
      <!-- 01. Hero -->
      <section class="insights-hero" id="insights_hero">
        <span class="eyebrow">${hero.eyebrow || 'INSIGHTS & ARTICLES'}</span>
        <h1>${hero.headline || 'Thinking out loud.'}</h1>
        <p>${hero.subtitle || 'Notes from the frontline of prevention — on gambling harm, public health, and the conversations that change communities.'}</p>
      </section>

      <!-- 02. Article Grid -->
      <section class="insights-grid-section" id="insights_grid">
        <div class="articles-grid">
          ${articles.map(art => `
            <article class="article-card" id="${art.item_slug || ''}">
              <img src="${art.image_url || '/assets/thumb_1.jpg'}" alt="${art.title}" class="article-img" />
              <div class="article-meta">
                <span class="category-tag">${art.category || 'Prevention'}</span>
                <span class="read-time">${art.badge || '5 min read'}</span>
                <span class="pub-date">${art.subtitle || ''}</span>
              </div>
              <h3 class="article-title">${art.title}</h3>
              <div class="article-excerpt">${art.content_html}</div>
              <a href="${art.link_url || '#'}" class="read-article-link">Read Full Essay &rarr;</a>
            </article>
          `).join('')}
        </div>
      </section>

      <!-- 03. Article Template Spec (Container max-width 68ch serif) -->
      <div class="article-template-container" style="max-width: 68ch; margin: 0 auto; font-family: Instrument Serif, Georgia, serif;"></div>

      <!-- CTA -->
      <section class="insights-cta" id="insights_cta">
        <h2>${cta.headline || 'Stay connected with new perspectives.'}</h2>
        <p>${cta.subtitle || ''}</p>
        <a href="${cta.button_url || '/work-with-tiffany'}" class="btn-primary">${cta.button_text || 'Work With Tiffany →'}</a>
      </section>`;
    }

    html += `
  </main>
  <footer class="footer">
    <p class="copyright">© 2026 Tiffany Webb. All rights reserved.</p>
    <p class="tagline">Chicago Heart — Louisiana Soul · Serving Nationally</p>
    <p class="email">booking@tiffanywebbimpact.com</p>
  </footer>
</body>
</html>`;

    return html;
  }
}

let harnessInstance = null;

function getHarness() {
  if (!harnessInstance) {
    harnessInstance = new AppHarness();
  }
  return harnessInstance;
}

module.exports = {
  AppHarness,
  getHarness
};
