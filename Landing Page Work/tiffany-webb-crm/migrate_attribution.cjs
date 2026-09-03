const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '@rishil8124shah',
    database: process.env.DB_NAME || 'tiffany_crm'
  });

  try {
    console.log('Connecting to database...');
    
    // Check existing columns
    const [columns] = await pool.query('SHOW COLUMNS FROM leads');
    const existingCols = columns.map(c => c.Field);
    console.log('Existing columns in leads:', existingCols);

    if (!existingCols.includes('source_section')) {
      console.log('Adding source_section column...');
      await pool.query('ALTER TABLE leads ADD COLUMN source_section VARCHAR(150) NULL AFTER source');
    }
    if (!existingCols.includes('source_card')) {
      console.log('Adding source_card column...');
      await pool.query('ALTER TABLE leads ADD COLUMN source_card VARCHAR(150) NULL AFTER source_section');
    }
    if (!existingCols.includes('country_code')) {
      console.log('Adding country_code column...');
      await pool.query('ALTER TABLE leads ADD COLUMN country_code VARCHAR(10) NULL AFTER email');
    }
    if (!existingCols.includes('topic_interest')) {
      console.log('Adding topic_interest column...');
      await pool.query('ALTER TABLE leads ADD COLUMN topic_interest VARCHAR(255) NULL AFTER event_type');
    }
    if (!existingCols.includes('budget_range')) {
      console.log('Adding budget_range column...');
      await pool.query('ALTER TABLE leads ADD COLUMN budget_range VARCHAR(100) NULL AFTER estimated_audience_size');
    }

    console.log('Migration completed successfully!');
    const [updatedCols] = await pool.query('SHOW COLUMNS FROM leads');
    console.log('Updated columns in leads:', updatedCols.map(c => c.Field));
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
