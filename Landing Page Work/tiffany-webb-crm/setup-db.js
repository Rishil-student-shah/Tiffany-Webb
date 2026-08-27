require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function setup() {
  try {
    // Connect without database first to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('Connected to MySQL. Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'tiffany_crm'}\``);
    await connection.query(`USE \`${process.env.DB_NAME || 'tiffany_crm'}\``);

    console.log('Running schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    
    // Split by semicolons for multiple statements
    const statements = schemaSql.split(';').filter(stmt => stmt.trim() !== '');
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    
    console.log('Schema created successfully.');

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

    await connection.end();
    console.log('Setup complete!');
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
}

setup();
