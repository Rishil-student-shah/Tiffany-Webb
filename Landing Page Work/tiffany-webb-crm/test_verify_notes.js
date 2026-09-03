const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/.env' });

async function runVerification() {
  console.log('--- Starting Verification Script ---');
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '@rishil8124shah',
      database: process.env.DB_NAME || 'tiffany_crm',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });

    // 1. Check database connection
    const [dbCheck] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✓ Database connected successfully. Result:', dbCheck[0].result);

    // 2. Create lead_notes table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lead_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        user_id INT NULL,
        author_name VARCHAR(150) NOT NULL,
        author_role VARCHAR(50) NOT NULL DEFAULT 'staff',
        note TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✓ lead_notes table verified/created in MySQL.');

    // 3. Check table columns
    const [columns] = await pool.query('DESCRIBE lead_notes');
    console.log('✓ lead_notes schema columns:', columns.map(c => c.Field).join(', '));

    // 4. Check if leads exist
    const [leads] = await pool.query('SELECT id, contact_name FROM leads LIMIT 1');
    let testLeadId;
    if (leads.length === 0) {
      const [insertLead] = await pool.query(`
        INSERT INTO leads (source, contact_name, email, topic_interest, status)
        VALUES ('manual', 'Test Verification Lead', 'test@verification.com', 'Gambling Prevention & Community Awareness', 'new')
      `);
      testLeadId = insertLead.insertId;
      console.log('✓ Created temporary test lead ID:', testLeadId);
    } else {
      testLeadId = leads[0].id;
      console.log('✓ Found existing lead ID:', testLeadId, `(${leads[0].contact_name})`);
    }

    // 5. Test inserting a note into lead_notes
    const testNoteText = 'Automated Verification Note: Testing multi-user team notes system ' + Date.now();
    const [noteInsert] = await pool.query(`
      INSERT INTO lead_notes (lead_id, user_id, author_name, author_role, note)
      VALUES (?, NULL, 'Tiffany Webb (Admin)', 'admin', ?)
    `, [testLeadId, testNoteText]);
    console.log('✓ Note inserted successfully. Note ID:', noteInsert.insertId);

    // 6. Test activity log entry
    const summary = testNoteText.length > 60 ? testNoteText.substring(0, 60) + '...' : testNoteText;
    await pool.query(`
      INSERT INTO activity_log (lead_id, user_id, action, detail)
      VALUES (?, NULL, 'note_added', ?)
    `, [testLeadId, `Internal note by Tiffany Webb (Admin) (admin): "${summary}"`]);
    console.log('✓ Activity log entry created.');

    // 7. Test fetching notes for the lead
    const [fetchedNotes] = await pool.query(`
      SELECT id, author_name, author_role, note, created_at 
      FROM lead_notes 
      WHERE lead_id = ? 
      ORDER BY created_at DESC
    `, [testLeadId]);
    console.log(`✓ Fetched ${fetchedNotes.length} notes for lead ID ${testLeadId}. Latest note:`, fetchedNotes[0].note);

    console.log('--- ALL VERIFICATION TESTS PASSED ---');
  } catch (err) {
    console.error('✗ Verification Error:', err);
  } finally {
    if (pool) await pool.end();
  }
}

runVerification();
