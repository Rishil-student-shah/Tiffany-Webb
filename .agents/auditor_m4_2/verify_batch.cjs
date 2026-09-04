const path = require('path');
module.paths.push(path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/node_modules'));

const http = require('http');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'tiffany-webb-crm-secret-key-2025';

async function testBatchImport() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@rishil8124shah',
    database: process.env.DB_NAME || 'tiffany_crm'
  });

  const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE is_active = 1 LIMIT 1');
  const token = jwt.sign(
    { id: users[0].id, email: users[0].email, name: users[0].name, role: users[0].role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const testBatch = [
    { name: 'Forensic Batch Lead 1 (Default)', email: 'batch1@forensic.com' }, // No source
    { name: 'Forensic Batch Lead 2 (Invalid ENUM)', email: 'batch2@forensic.com', source: 'csv_upload' }, // Invalid enum
    { name: 'Forensic Batch Lead 3 (Valid ENUM)', email: 'batch3@forensic.com', source: 'referral' } // Valid enum
  ];

  const postData = JSON.stringify({ leads: testBatch });

  const res = await new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads/batch',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': `auth_token=${token}`
      }
    }, r => {
      let body = '';
      r.on('data', c => body += c);
      r.on('end', () => resolve({ status: r.statusCode, body }));
    });
    req.write(postData);
    req.end();
  });

  console.log('Batch import HTTP status:', res.status);
  const json = JSON.parse(res.body);
  console.log('Batch response JSON:', json);

  // Query DB for the inserted leads
  const [rows] = await pool.query(`
    SELECT id, contact_name, email, source 
    FROM leads 
    WHERE email IN ('batch1@forensic.com', 'batch2@forensic.com', 'batch3@forensic.com')
    ORDER BY email ASC
  `);

  console.log('Inserted rows in MySQL:');
  console.log(rows);

  const row1 = rows.find(r => r.email === 'batch1@forensic.com');
  const row2 = rows.find(r => r.email === 'batch2@forensic.com');
  const row3 = rows.find(r => r.email === 'batch3@forensic.com');

  const passed1 = row1 && row1.source === 'manual';
  const passed2 = row2 && row2.source === 'manual'; // 'csv_upload' fell back to 'manual'
  const passed3 = row3 && row3.source === 'referral'; // 'referral' preserved

  console.log('Lead 1 (missing source) -> source:', row1?.source, passed1 ? 'PASS' : 'FAIL');
  console.log('Lead 2 (invalid source) -> source:', row2?.source, passed2 ? 'PASS' : 'FAIL');
  console.log('Lead 3 (valid source)   -> source:', row3?.source, passed3 ? 'PASS' : 'FAIL');

  // Clean up
  await pool.query("DELETE FROM leads WHERE email IN ('batch1@forensic.com', 'batch2@forensic.com', 'batch3@forensic.com')");
  await pool.end();

  const allPassed = res.status === 200 && json.count === 3 && passed1 && passed2 && passed3;
  console.log('\nOVERALL BATCH IMPORT VERDICT:', allPassed ? 'PASS' : 'FAIL');
}

testBatchImport().catch(e => {
  console.error('Batch import test error:', e);
  process.exit(1);
});
