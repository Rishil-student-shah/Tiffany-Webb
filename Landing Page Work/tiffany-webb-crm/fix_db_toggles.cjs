const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@rishil8124shah',
  database: 'tiffany_crm'
});

connection.query("DELETE FROM website_content WHERE key_name = 'section_is_active'", (err) => {
  if (err) throw err;
  
  const sections = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit', 'media', 'events', 'proof', 'proof_attributes', 'proof_testimonials', 'footer', 'social_links', 'navbar'];
  
  let values = sections.map(sec => `(1, '${sec}', 'section_is_active', '1', 'text')`).join(',\n');
  
  let sql = `INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES \n${values}`;
  
  connection.query(sql, (err) => {
    if (err) throw err;
    console.log("Fixed toggles in database");
    process.exit(0);
  });
});
