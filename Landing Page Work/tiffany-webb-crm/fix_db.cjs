const mysql = require('mysql2/promise');

async function fixDB() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '@rishil8124shah',
    database: 'tiffany_crm',
  });

  const body1 = "Tiffany works with leaders and organizations navigating growth, change, engagement, and community impact. She brings a human-centered perspective to complex challenges—helping organizations understand the people they serve, rethink familiar approaches, and build strategies designed for meaningful, sustainable impact.";

  await pool.query(
    `UPDATE website_content SET content_value = ? WHERE section = 'where_she_works' AND key_name = 'body_1'`,
    [body1]
  );
  
  console.log("Fixed body_1 encoding.");
  process.exit(0);
}

fixDB();
