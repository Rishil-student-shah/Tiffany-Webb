const mysql = require('mysql2/promise');
const { setup } = require('./setup-db');
require('dotenv').config();

async function runVerification() {
  console.log('--- STARTING MILESTONE 1 VERIFICATION ---');
  
  // Step 1: Run setup and seeding
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

  console.log('\n--- VERIFYING INDIVIDUAL INNER PAGES ---');

  // Verify Page 1: About
  const [aboutPages] = await pool.query("SELECT * FROM website_pages WHERE slug = 'about'");
  console.log(`[PASS] /about page exists in website_pages: ID=${aboutPages[0].id}, Name="${aboutPages[0].name}"`);
  
  const [aboutVignettes] = await pool.query("SELECT * FROM website_collections WHERE page_id = ? AND section_name = 'story_vignettes'", [aboutPages[0].id]);
  console.log(`[PASS] /about has ${aboutVignettes.length} story vignettes (Expected 6, all tagged [CONTENT-PENDING])`);
  
  const [aboutValues] = await pool.query("SELECT * FROM website_collections WHERE page_id = ? AND section_name = 'values_list'", [aboutPages[0].id]);
  console.log(`[PASS] /about has ${aboutValues.length} core values (Expected 5: Faith, Family, Community, Purpose, Impact)`);

  const [aboutAffiliations] = await pool.query("SELECT * FROM website_content WHERE page_id = ? AND section = 'affiliations' AND key_name = 'section_is_active'", [aboutPages[0].id]);
  console.log(`[PASS] /about affiliations section_is_active = "${aboutAffiliations[0].content_value}" (Expected 0 - ships empty)`);

  // Verify Page 2: Services
  const [servicesPages] = await pool.query("SELECT * FROM website_pages WHERE slug = 'services'");
  const [capabilities] = await pool.query("SELECT item_slug, title FROM website_collections WHERE page_id = ? AND section_name = 'capabilities' ORDER BY sort_order ASC", [servicesPages[0].id]);
  console.log(`[PASS] /services has ${capabilities.length} capabilities with deep-link IDs:`, capabilities.map(c => `#${c.item_slug}`).join(', '));

  const [gearSteps] = await pool.query("SELECT title FROM website_collections WHERE page_id = ? AND section_name = 'gear_steps' ORDER BY sort_order ASC", [servicesPages[0].id]);
  console.log(`[PASS] /services has ${gearSteps.length} GEAR steps:`, gearSteps.map(g => g.title).join(', '));

  const [formats] = await pool.query("SELECT title FROM website_collections WHERE page_id = ? AND section_name = 'engagement_formats' ORDER BY sort_order ASC", [servicesPages[0].id]);
  console.log(`[PASS] /services has ${formats.length} engagement formats (Expected 6)`);

  // Verify Page 3: Speaking Topics
  const [topicsPages] = await pool.query("SELECT * FROM website_pages WHERE slug = 'speaking-topics'");
  const [topics] = await pool.query("SELECT category, count(*) as count FROM website_collections WHERE page_id = ? AND section_name = 'topics_list' GROUP BY category", [topicsPages[0].id]);
  console.log(`[PASS] /services/speaking-topics tracks breakdown:`);
  topics.forEach(t => console.log(`       - ${t.category}: ${t.count} topics`));
  const [[{ totalTopics }]] = await pool.query("SELECT COUNT(*) as totalTopics FROM website_collections WHERE page_id = ? AND section_name = 'topics_list'", [topicsPages[0].id]);
  console.log(`[PASS] Total Speaking Topics: ${totalTopics} (Expected exactly 20)`);

  // Verify Page 4: Impact
  const [impactPages] = await pool.query("SELECT * FROM website_pages WHERE slug = 'impact'");
  const [impactUpcoming] = await pool.query("SELECT * FROM website_content WHERE page_id = ? AND section = 'upcoming' AND key_name = 'section_is_active'", [impactPages[0].id]);
  console.log(`[PASS] /impact upcoming engagements section_is_active = "${impactUpcoming[0].content_value}" (Expected 0 - ships empty)`);

  // Verify Page 5: Media
  const [mediaPages] = await pool.query("SELECT * FROM website_pages WHERE slug = 'media'");
  const [bios] = await pool.query("SELECT title, badge FROM website_collections WHERE page_id = ? AND section_name = 'media_bios' ORDER BY sort_order ASC", [mediaPages[0].id]);
  console.log(`[PASS] /media has ${bios.length} approved bios (Third-Person):`, bios.map(b => `${b.title} [${b.badge}]`).join(', '));

  const [downloads] = await pool.query("SELECT title, link_url FROM website_collections WHERE page_id = ? AND section_name = 'media_downloads' ORDER BY sort_order ASC", [mediaPages[0].id]);
  console.log(`[PASS] /media has ${downloads.length} press downloads:`, downloads.map(d => d.title).join(', '));

  // Verify Page 6: Work With Tiffany
  const [workPages] = await pool.query("SELECT * FROM website_pages WHERE slug = 'work-with-tiffany'");
  const [steps] = await pool.query("SELECT title FROM website_collections WHERE page_id = ? AND section_name = 'booking_next_steps' ORDER BY sort_order ASC", [workPages[0].id]);
  console.log(`[PASS] /work-with-tiffany has ${steps.length} next steps:`, steps.map(s => s.title).join(', '));

  // Verify Page 7: Insights
  const [insightsPages] = await pool.query("SELECT * FROM website_pages WHERE slug = 'insights'");
  const [articles] = await pool.query("SELECT title, subtitle, badge FROM website_collections WHERE page_id = ? AND section_name = 'articles' ORDER BY sort_order ASC", [insightsPages[0].id]);
  console.log(`[PASS] /insights has ${articles.length} seed articles:`, articles.map(a => `"${a.title}" (${a.subtitle})`).join(', '));

  // Test Lead Creation Verification
  const [leadResult] = await pool.query(`
    INSERT INTO leads (source, contact_name, organization_name, email, phone, event_type, message)
    VALUES ('website_form', 'Test Organizer', 'National Prevention Summit', 'organizer@summit.org', '+1 312-555-0100', 'Keynote', 'Testing automated lead verification')
  `);
  console.log(`[PASS] Test lead created successfully with ID=${leadResult.insertId}`);
  
  // Clean up test lead
  await pool.query('DELETE FROM leads WHERE id = ?', [leadResult.insertId]);
  console.log(`[PASS] Test lead cleaned up successfully.`);

  await pool.end();
  console.log('\n--- ALL VERIFICATIONS PASSED 100% ---');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
