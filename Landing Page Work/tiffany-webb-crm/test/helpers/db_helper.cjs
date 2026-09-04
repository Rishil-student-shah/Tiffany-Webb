/**
 * MySQL Database Helper for E2E Test Suites
 * Manages connection pooling, test lead fixtures, note inspections, and teardown.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '@rishil8124shah',
      database: process.env.DB_NAME || 'tiffany_crm',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4'
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const p = getPool();
  return await p.query(sql, params);
}

/**
 * Creates an isolated test lead with deterministic prefix
 */
async function createTestLead(overrides = {}) {
  const p = getPool();
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);
  const leadData = {
    contact_name: overrides.contact_name || `Test Lead ${timestamp}`,
    organization_name: overrides.organization_name || 'E2E Testing Corp',
    email: overrides.email || `e2e_test_${timestamp}_${randomSuffix}@tiffanywebbimpact.com`,
    phone: overrides.phone || '+1 555-019-2834',
    event_type: overrides.event_type || 'Keynote',
    topic_interest: overrides.topic_interest || 'Leadership and Community Impact',
    event_date: overrides.event_date || '2026-11-15',
    budget_range: overrides.budget_range || '$15,000',
    status: overrides.status || 'new',
    message: overrides.message || 'Automated test inquiry created by E2E test harness.'
  };

  const [res] = await p.query(`
    INSERT INTO leads (contact_name, organization_name, email, phone, event_type, topic_interest, event_date, budget_range, status, message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    leadData.contact_name,
    leadData.organization_name,
    leadData.email,
    leadData.phone,
    leadData.event_type,
    leadData.topic_interest,
    leadData.event_date,
    leadData.budget_range,
    leadData.status,
    leadData.message
  ]);

  return { id: res.insertId, ...leadData };
}

/**
 * Clean up test leads by email pattern or id
 */
async function deleteTestLead(leadId) {
  const p = getPool();
  await p.query('DELETE FROM leads WHERE id = ?', [leadId]);
}

async function cleanupTestLeadsByPattern(pattern = 'e2e_test_%') {
  const p = getPool();
  await p.query('DELETE FROM leads WHERE email LIKE ?', [pattern]);
}

/**
 * Retrieve notes for a specific lead
 */
async function getLeadNotes(leadId) {
  const p = getPool();
  const [rows] = await p.query('SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC', [leadId]);
  return rows;
}

/**
 * Retrieve activity logs for a specific lead
 */
async function getActivityLogs(leadId) {
  const p = getPool();
  const [rows] = await p.query('SELECT * FROM activity_log WHERE lead_id = ? ORDER BY created_at DESC', [leadId]);
  return rows;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  query,
  createTestLead,
  deleteTestLead,
  cleanupTestLeadsByPattern,
  getLeadNotes,
  getActivityLogs,
  closePool
};
