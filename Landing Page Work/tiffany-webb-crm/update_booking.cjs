const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });
  await pool.query("INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (1, 'booking', 'eyebrow', 'WORK WITH TIFFANY', 'text'), (1, 'booking', 'heading', 'Let\\'s create impact together.', 'text'), (1, 'booking', 'subtext', 'Tell me about your organization and what you\\'re trying to change. I read every inquiry myself.', 'text') ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);");
  console.log('Updated DB booking header');
  process.exit(0);
})();
