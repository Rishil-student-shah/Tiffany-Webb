const path = require('path');
module.paths.push(path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/node_modules'));

const http = require('http');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'tiffany-webb-crm-secret-key-2025';

async function testNotesSecurity() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@rishil8124shah',
    database: process.env.DB_NAME || 'tiffany_crm'
  });

  // Ensure test lead exists
  const [leads] = await pool.query('SELECT id FROM leads LIMIT 1');
  let testLeadId;
  if (leads.length > 0) {
    testLeadId = leads[0].id;
  } else {
    const [res] = await pool.query('INSERT INTO leads (contact_name, email, source) VALUES ("Test Lead", "test@lead.com", "manual")');
    testLeadId = res.insertId;
  }

  console.log('Testing with Lead ID:', testLeadId);

  // Test 3.1: Unauthenticated POST /api/leads/:id/notes
  const unauthPostData = JSON.stringify({ note: 'Malicious unauth note', author_name: 'Attacker' });
  const unauthRes = await new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/leads/${testLeadId}/notes`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(unauthPostData)
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, body }));
    });
    req.write(unauthPostData);
    req.end();
  });

  console.log('Test 3.1 Unauthenticated Request -> Status:', unauthRes.status, 'Location:', unauthRes.location);
  const unauthPassed = (unauthRes.status === 302 && unauthRes.location === '/login');
  console.log('Test 3.1 Result:', unauthPassed ? 'PASS (Properly redirected to /login)' : 'FAIL');

  // Verify that the unauthenticated note was NOT stored in the database
  const [badNotes] = await pool.query('SELECT * FROM lead_notes WHERE note = ?', ['Malicious unauth note']);
  console.log('Database check for unauth note:', badNotes.length === 0 ? 'PASS (0 notes stored)' : 'FAIL (Found unauth note)');

  // Test 3.2: Authenticated POST with spoofed body author_name
  const [users] = await pool.query('SELECT id, name, email, role, is_active FROM users WHERE is_active = 1 LIMIT 1');
  if (users.length === 0) {
    console.log('FAIL: No active user found for auth test');
    process.exit(1);
  }
  const realUser = users[0];
  const token = jwt.sign(
    { id: realUser.id, email: realUser.email, name: realUser.name, role: realUser.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const authPostData = JSON.stringify({ 
    note: 'Legitimate authenticated forensic test note', 
    author_name: 'Forged Hacker Name', // Attempted spoofing
    author_role: 'superadmin' // Attempted spoofing
  });

  const authRes = await new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/leads/${testLeadId}/notes`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(authPostData),
        'Cookie': `auth_token=${token}`
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.write(authPostData);
    req.end();
  });

  console.log('Test 3.2 Authenticated Request -> Status:', authRes.status);
  const authJson = JSON.parse(authRes.body);
  console.log('Response JSON:', JSON.stringify(authJson, null, 2));

  const authPassed = (authRes.status === 200 && authJson.success === true && authJson.note.author_name === realUser.name);
  console.log('Test 3.2 Result:', authPassed ? 'PASS (Resolved genuine identity, spoofing ignored)' : 'FAIL');

  // Verify in database
  const [dbNote] = await pool.query('SELECT * FROM lead_notes WHERE id = ?', [authJson.note.id]);
  const dbPassed = dbNote.length > 0 && dbNote[0].author_name === realUser.name && dbNote[0].author_role === realUser.role;
  console.log('Database record verification:', dbPassed ? 'PASS (DB matches genuine JWT identity)' : 'FAIL');

  // Verify activity_log
  const [dbLog] = await pool.query('SELECT * FROM activity_log WHERE lead_id = ? AND action = "note_added" ORDER BY id DESC LIMIT 1', [testLeadId]);
  const logPassed = dbLog.length > 0 && dbLog[0].detail.includes(realUser.name);
  console.log('Activity log record verification:', logPassed ? 'PASS (Activity log matches)' : 'FAIL');

  // Test 3.3: GET /api/leads/:id/notes reverse chronological order
  const getRes = await new Promise(resolve => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: `/api/leads/${testLeadId}/notes`,
      method: 'GET'
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.end();
  });

  const getJson = JSON.parse(getRes.body);
  console.log('GET /api/leads/:id/notes status:', getRes.status, 'Notes count:', getJson.notes ? getJson.notes.length : 0);
  let orderPassed = true;
  if (getJson.notes && getJson.notes.length > 1) {
    for (let i = 0; i < getJson.notes.length - 1; i++) {
      if (new Date(getJson.notes[i].created_at) < new Date(getJson.notes[i+1].created_at)) {
        orderPassed = false;
        break;
      }
    }
  }
  console.log('Reverse chronological order:', orderPassed ? 'PASS' : 'FAIL');

  // Cleanup test note and activity log
  if (authJson.note && authJson.note.id) {
    await pool.query('DELETE FROM lead_notes WHERE id = ?', [authJson.note.id]);
  }
  if (dbLog.length > 0 && dbLog[0].id) {
    await pool.query('DELETE FROM activity_log WHERE id = ?', [dbLog[0].id]);
  }

  await pool.end();

  const overallNotesPassed = unauthPassed && (badNotes.length === 0) && authPassed && dbPassed && logPassed && orderPassed;
  console.log('\nOVERALL NOTES SECURITY VERDICT:', overallNotesPassed ? 'PASS' : 'FAIL');
}

testNotesSecurity().catch(e => {
  console.error('Notes test failed with error:', e);
  process.exit(1);
});
