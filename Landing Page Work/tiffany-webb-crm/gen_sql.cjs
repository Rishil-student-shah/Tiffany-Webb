const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@rishil8124shah',
  database: 'tiffany_crm'
});

connection.query('SELECT DISTINCT page_id, section FROM website_content', (err, results) => {
  if (err) { console.error(err); process.exit(1); }
  let sql = 'USE tiffany_crm;\nINSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES \n';
  let values = [];
  results.forEach(row => {
    values.push(`(${row.page_id}, '${row.section}', 'section_is_active', '1', 'text')`);
  });
  sql += values.join(',\n') + '\nON DUPLICATE KEY UPDATE content_value = VALUES(content_value);';
  
  const fs = require('fs');
  fs.writeFileSync('insert_all_section_toggles.sql', sql, 'utf8');
  console.log('Generated SQL to insert section_is_active for all sections');
  process.exit(0);
});
