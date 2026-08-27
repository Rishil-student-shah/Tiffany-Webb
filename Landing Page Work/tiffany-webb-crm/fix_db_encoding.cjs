const mysql = require('mysql2/promise');

async function fixEncoding() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@rishil8124shah',
    database: 'tiffany_crm'
  });

  try {
    const query = `
      UPDATE website_content 
      SET content_value = 'Ready for the room — and the story.' 
      WHERE section = 'media' AND key_name = 'headline'
    `;
    await connection.execute(query);
    console.log('Successfully updated the headline with proper UTF-8 encoding!');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await connection.end();
  }
}

fixEncoding();
