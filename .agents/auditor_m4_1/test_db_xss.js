const http = require('http');
const path = require('path');
const crmDir = path.resolve('Landing Page Work/tiffany-webb-crm');
const mysql = require(path.join(crmDir, 'node_modules/mysql2/promise'));
require(path.join(crmDir, 'node_modules/dotenv')).config({ path: path.join(crmDir, '.env') });

async function testXssDbInsertion() {
  const postData = JSON.stringify({
    contact_name: 'XSS Tester <script>alert(1)</script>',
    email: 'xss_test_' + Date.now() + '@example.com',
    phone: '555-0199',
    event_type: 'Keynote <script>alert(2)</script>',
    event_location: 'Chicago',
    message: 'Hello <script>alert("xss")</script> world'
  });

  const res = await new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, resolve);
    req.write(postData);
    req.end();
  });

  let body = '';
  res.on('data', c => body += c);
  res.on('end', async () => {
    try {
      const json = JSON.parse(body);
      console.log('API Response:', json);
      if (json.lead_id) {
        const conn = await mysql.createConnection({
          host: process.env.DB_HOST || '127.0.0.1',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME || 'tiffany_crm'
        });
        const [rows] = await conn.query('SELECT contact_name, event_type, message FROM leads WHERE id = ?', [json.lead_id]);
        console.log('Database row stored:', rows[0]);
        const containsRawScript = JSON.stringify(rows[0]).includes('<script>') || JSON.stringify(rows[0]).includes('</script>');
        console.log('Contains raw <script> or </script> tags:', containsRawScript);
        console.log('Cleaned Contact Name:', rows[0].contact_name);
        console.log('Cleaned Event Type:', rows[0].event_type);
        console.log('Cleaned Message:', rows[0].message);
        
        await conn.query('DELETE FROM activity_log WHERE lead_id = ?', [json.lead_id]);
        await conn.query('DELETE FROM leads WHERE id = ?', [json.lead_id]);
        await conn.end();
      }
    } catch (e) {
      console.error('Error:', e);
    }
  });
}
testXssDbInsertion();
