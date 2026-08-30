/**
 * Database Helper for E2E Test Suite
 * Provides clean connection management, schema verification, and fixture management
 */

const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '@rishil8124shah',
  database: process.env.DB_NAME || 'tiffany_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

async function getPageBySlug(slug) {
  const rows = await query('SELECT * FROM website_pages WHERE slug = ?', [slug]);
  return rows[0] || null;
}

async function getContentByPageSlug(slug) {
  const page = await getPageBySlug(slug);
  if (!page) return { page: null, content: {}, collections: {} };

  const contentRows = await query('SELECT * FROM website_content WHERE page_id = ? ORDER BY section, key_name', [page.id]);
  const collectionRows = await query('SELECT * FROM website_collections WHERE page_id = ? ORDER BY section_name, sort_order ASC', [page.id]);

  const content = {};
  contentRows.forEach(row => {
    if (!content[row.section]) content[row.section] = {};
    content[row.section][row.key_name] = row.content_value;
  });

  const collections = {};
  collectionRows.forEach(row => {
    if (!collections[row.section_name]) collections[row.section_name] = [];
    collections[row.section_name].push(row);
  });

  return {
    page,
    content,
    collections
  };
}

async function getLeads(criteria = {}) {
  let sql = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (criteria.email) {
    sql += ' AND email = ?';
    params.push(criteria.email);
  }
  if (criteria.source) {
    sql += ' AND source = ?';
    params.push(criteria.source);
  }
  if (criteria.status) {
    sql += ' AND status = ?';
    params.push(criteria.status);
  }
  if (criteria.id) {
    sql += ' AND id = ?';
    params.push(criteria.id);
  }

  sql += ' ORDER BY created_at DESC';
  return query(sql, params);
}

async function getActivityLog(leadId) {
  return query('SELECT * FROM activity_log WHERE lead_id = ? ORDER BY created_at DESC', [leadId]);
}

async function deleteLeadById(id) {
  await query('DELETE FROM activity_log WHERE lead_id = ?', [id]);
  await query('DELETE FROM messages WHERE lead_id = ?', [id]);
  await query('DELETE FROM leads WHERE id = ?', [id]);
}

async function deleteTestLeadsByEmail(emailPattern) {
  const leads = await query('SELECT id FROM leads WHERE email LIKE ?', [emailPattern]);
  for (const lead of leads) {
    await deleteLeadById(lead.id);
  }
}

module.exports = {
  getPool,
  closePool,
  query,
  getPageBySlug,
  getContentByPageSlug,
  getLeads,
  getActivityLog,
  deleteLeadById,
  deleteTestLeadsByEmail
};
