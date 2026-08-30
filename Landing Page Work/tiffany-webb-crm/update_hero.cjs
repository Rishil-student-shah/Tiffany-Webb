const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });
  await pool.query("UPDATE website_content SET content_value = 'Bold ideas, human connection, and ' WHERE section = 'hero' AND key_name = 'title_line_1'");
  await pool.query("UPDATE website_content SET content_value = 'meaningful impact.' WHERE section = 'hero' AND key_name = 'title_line_2'");
  console.log('Updated DB hero title to one line');
  process.exit(0);
})();
