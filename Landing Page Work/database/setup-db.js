require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function executeSqlFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const lines = sql.split('\n');
  let currentStmt = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--') || trimmed.length === 0) {
      continue;
    }
    currentStmt += line + '\n';
    if (trimmed.endsWith(';')) {
      const stmtToRun = currentStmt.trim();
      if (stmtToRun.length > 0) {
        await connection.query(stmtToRun);
      }
      currentStmt = '';
    }
  }
  
  if (currentStmt.trim().length > 0) {
    await connection.query(currentStmt.trim());
  }
}

async function setup() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '@rishil8124shah',
      multipleStatements: true
    });

    console.log('Connected to MySQL. Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'tiffany_crm'}\``);
    await connection.query(`USE \`${process.env.DB_NAME || 'tiffany_crm'}\``);

    console.log('Running schema.sql...');
    const schemaPath = fs.existsSync(path.join(__dirname, 'schema.sql')) ? path.join(__dirname, 'schema.sql') : path.join(__dirname, 'db', 'schema.sql');
    await executeSqlFile(connection, schemaPath);
    console.log('Schema verified.');

    // Ensure schema migrations for existing columns
    try {
      await connection.query(`
        ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
        ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS meta_description TEXT;
        ALTER TABLE website_content MODIFY COLUMN content_type VARCHAR(50) DEFAULT 'text';
      `);
    } catch(err) {
      // Ignore if columns exist
    }

    // Create an admin user for testing
    const hash = await bcrypt.hash('password123', 10);
    try {
      await connection.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@tiffanywebb.com', hash, 'admin']
      );
      console.log('Created admin user: admin@tiffanywebb.com / password123');
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        console.log('Admin user already exists.');
      } else {
        throw e;
      }
    }

    // Run seed_inner_pages.sql
    console.log('Running seed_inner_pages.sql...');
    const seedPath = fs.existsSync(path.join(__dirname, 'seed_inner_pages.sql')) ? path.join(__dirname, 'seed_inner_pages.sql') : path.join(__dirname, 'db', 'seed_inner_pages.sql');
    await executeSqlFile(connection, seedPath);
    console.log('Seed completed successfully.');

    await connection.end();
    console.log('Database setup and hydration complete!');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setup();
