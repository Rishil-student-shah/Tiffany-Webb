const mysql = require('mysql2/promise');

async function fixDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@rishil8124shah',
    database: 'tiffany_crm'
  });
  try {
    await connection.execute(`UPDATE website_content SET content_value = 'Media resources' WHERE section = 'media' AND key_name = 'link_2'`);
    console.log('Fixed DB link_2');
  } catch (error) {
    console.error(error);
  } finally {
    await connection.end();
  }
}
fixDb();
