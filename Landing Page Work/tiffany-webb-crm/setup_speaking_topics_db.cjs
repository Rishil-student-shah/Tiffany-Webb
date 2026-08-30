const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });

  try {
    // 1. Insert the page into website_pages
    const [result] = await pool.query(`
      INSERT INTO website_pages (slug, name, is_active) 
      VALUES ('speaking-topics', 'Speaking Topics', 1)
    `);
    const newPageId = result.insertId;

    // 2. Insert Hero / Intro KV text
    await pool.query(`INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'eyebrow', 'Services', 'text')`, [newPageId]);
    await pool.query(`INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'headline', 'Speaking <span class=\"italic-accent\">Topics.</span>', 'text')`, [newPageId]);
    await pool.query(`INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'subtitle', 'Twenty topics across four tracks.', 'text')`, [newPageId]);

    // Tracks Header
    await pool.query(`INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'tracks', 'headline', 'Twenty topics. <br/><span class=\"italic-accent\">Four tracks.</span>', 'text')`, [newPageId]);
    await pool.query(`INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'tracks', 'subtitle', 'Every topic below is one I actively deliver. Built for specific audiences and actionable outcomes.', 'text')`, [newPageId]);

    // 3. Insert Tracks into website_collections
    
    // Track 1
    const track1Html = `<ul>
      <li><strong>Gambling Prevention:</strong> An accessible introduction to how gambling harm develops and what prevention looks like at community scale.</li>
      <li><strong>Don't Bet on Your Future:</strong> Built for students. Addresses sports-betting apps and peer pressure. Non-preachy.</li>
      <li><strong>Engaging Elected Officials:</strong> How to move prevention into policy attention.</li>
    </ul>`;
    await pool.query(`INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order) VALUES (?, 'tracks_list', 'Prevention & Awareness', 'For general audiences & communities', ?, 1)`, [newPageId, track1Html]);

    // Track 2
    const track2Html = `<ul>
      <li><strong>Co-Occurring Disorders:</strong> Overlap with substance use and what HR/EAP teams should watch for.</li>
      <li><strong>Harm Reduction Strategies:</strong> Meeting people where they are when they aren't ready to stop entirely.</li>
      <li><strong>Motivational Interviewing:</strong> Hands-on training applied specifically to gambling conversations.</li>
    </ul>`;
    await pool.query(`INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order) VALUES (?, 'tracks_list', 'Treatment & Recovery', 'For clinicians & frontline professionals', ?, 2)`, [newPageId, track2Html]);

    // Track 3
    const track3Html = `<ul>
      <li><strong>Significant Others:</strong> Examines the financial, emotional, and relational impact on partners.</li>
      <li><strong>Gambling, Violence & Trauma:</strong> The documented overlap between gambling harm, IPV, and trauma.</li>
      <li><strong>Coping Strategies:</strong> Guidance for families—financial protection and how to have the conversation.</li>
    </ul>`;
    await pool.query(`INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order) VALUES (?, 'tracks_list', 'Family Impact', 'For those living with the impact', ?, 3)`, [newPageId, track3Html]);

    // Track 4
    const track4Html = `<ul>
      <li><strong>Art Competitions:</strong> How to run a youth art competition as a prevention tool to drive participation.</li>
      <li><strong>Responsible Gifting:</strong> A practical session on responsible gifting for parents regarding lottery tickets.</li>
      <li><strong>ROSC Council Engagement:</strong> Integrating gambling prevention into a Recovery Oriented System of Care.</li>
    </ul>`;
    await pool.query(`INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order) VALUES (?, 'tracks_list', 'Creative Engagement', 'For organizations building campaigns', ?, 4)`, [newPageId, track4Html]);

    console.log("Database successfully populated for speaking-topics page!");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
