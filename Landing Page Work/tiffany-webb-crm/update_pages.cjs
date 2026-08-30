const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });
  
  try {
    // 1. Delete "Speaking" page (id = 7, or slug = speaking)
    const [speakingPage] = await pool.query("SELECT id FROM website_pages WHERE slug = 'speaking'");
    if (speakingPage.length > 0) {
      const pId = speakingPage[0].id;
      await pool.query("DELETE FROM website_content WHERE page_id = ?", [pId]);
      await pool.query("DELETE FROM website_collections WHERE page_id = ?", [pId]);
      await pool.query("DELETE FROM website_pages WHERE id = ?", [pId]);
      console.log('Deleted Speaking page and its content.');
    }

    // 2. Add Newsletter, Privacy, Terms
    const newPages = [
      { name: 'Newsletter', slug: 'newsletter' },
      { name: 'Privacy Policy', slug: 'privacy' },
      { name: 'Terms', slug: 'terms' }
    ];

    for (const page of newPages) {
      const [existing] = await pool.query("SELECT id FROM website_pages WHERE slug = ?", [page.slug]);
      let pageId;
      if (existing.length === 0) {
        const [result] = await pool.query("INSERT INTO website_pages (name, slug, is_active) VALUES (?, ?, 1)", [page.name, page.slug]);
        pageId = result.insertId;
        console.log(`Inserted page ${page.name}`);
      } else {
        pageId = existing[0].id;
      }

      // Add default content
      if (page.slug === 'newsletter') {
        await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'headline', 'Stay in the loop.', 'text')", [pageId]);
        await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'subtext', 'Join the community for updates and insights.', 'text')", [pageId]);
      } else if (page.slug === 'privacy') {
        await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'legal', 'title', 'Privacy Policy', 'text')", [pageId]);
        await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'legal', 'body_text', 'Your privacy is important to us...', 'textarea')", [pageId]);
      } else if (page.slug === 'terms') {
        await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'legal', 'title', 'Terms & Conditions', 'text')", [pageId]);
        await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'legal', 'body_text', 'By using this site, you agree...', 'textarea')", [pageId]);
      }
    }
    
    console.log('Done.');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
