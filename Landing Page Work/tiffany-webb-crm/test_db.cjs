const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@rishil8124shah',
  database: 'tiffany_crm'
});

connection.query('SELECT * FROM website_pages', (err, results) => {
  if (err) { console.error(err); process.exit(1); }
  console.log(results);
  process.exit(0);
});
