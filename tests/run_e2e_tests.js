#!/usr/bin/env node
/**
 * Master E2E Test Runner
 * Executes all 4 tiers of automated E2E tests for Tiffany Webb Web Platform & CRM.
 * 
 * Usage:
 *   node tests/run_e2e_tests.js
 */

const path = require('path');
const { framework } = require('./helpers/test_framework');
const { getPool, closePool } = require('./helpers/db_helper');

// Import all test suites to register them with the framework
require('./tier1_feature_coverage.test.js');
require('./tier2_boundary_corner_cases.test.js');
require('./tier3_cross_feature_integrations.test.js');
require('./tier4_real_world_lifecycle.test.js');

async function main() {
  console.log('\nStarting Tiffany Webb Opaque-Box E2E Automated Verification...\n');

  try {
    // 1. Verify MySQL connection
    const pool = getPool();
    const [pageCountRes] = await pool.query('SELECT COUNT(*) as count FROM website_pages');
    const [topicCountRes] = await pool.query("SELECT COUNT(*) as count FROM website_collections WHERE section_name = 'topics_list'");
    
    console.log(`[DB Health Check] Connected to MySQL: ${pageCountRes[0].count} pages, ${topicCountRes[0].count} speaking topics detected.\n`);
    
    // 2. Execute all registered test suites
    const stats = await framework.run();

    // 3. Clean up database pool
    await closePool();

    if (stats.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('\n\x1b[31mFatal Error during test execution:\x1b[0m', err);
    await closePool().catch(() => {});
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
