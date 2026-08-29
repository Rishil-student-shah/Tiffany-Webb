const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });
  await pool.query("UPDATE website_content SET content_value = 'For leaders ready<br/>to <span class=\"italic-accent\">rethink what\\'s</span><br/><span class=\"italic-accent\">possible.</span>' WHERE section = 'who_can_benefit' AND key_name = 'headline'");
  console.log('Updated DB who_can_benefit headline');
  process.exit(0);
})();
