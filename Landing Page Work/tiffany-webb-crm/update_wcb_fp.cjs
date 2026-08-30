const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });
  const firstPersonText = "I work with leaders and organizations navigating growth, change, engagement, and community impact. I bring a human-centered perspective to complex challenges—helping organizations understand the people they serve, rethink familiar approaches, and build strategies designed for meaningful, sustainable impact.";
  await pool.query("UPDATE website_content SET content_value = ? WHERE section = 'who_can_benefit' AND key_name = 'body_1'", [firstPersonText]);
  console.log('Updated who_can_benefit body_1 to first person');
  process.exit(0);
})();
