const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });
  await pool.query("INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (1, 'proof_testimonials', 'eyebrow', 'CLIENT LOVE', 'text'), (1, 'proof_testimonials', 'headline', 'Words from the room.', 'text'), (1, 'proof_testimonials', 'description', 'Hear directly from the leaders and organizations who have partnered with Tiffany to create meaningful change.', 'text') ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);");
  console.log('Inserted testimonials header content into DB.');
  process.exit(0);
})();
