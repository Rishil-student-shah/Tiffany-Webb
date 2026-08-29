const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });
  await pool.query("UPDATE website_content SET content_value = 'Watch Tiffany <span class=\"italic-accent\">in action.</span>' WHERE section = 'video_reels' AND key_name = 'headline';");
  console.log('Fixed DB headline.');
  process.exit(0);
})();
