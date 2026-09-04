/**
 * MASTER E2E TEST RUNNER FOR TIFFANY WEBB IMPACT OS™
 * Executes all 4 Test Tiers across R1, R2, R3, and R4:
 * - Tier 1: Feature Coverage
 * - Tier 2: Boundary & Corner Cases
 * - Tier 3: Cross-Feature Interactions
 * - Tier 4: Real-World Scenarios
 */

const path = require('path');
const db = require('./helpers/db_helper.cjs');
const http = require('./helpers/http_helper.cjs');

async function runMasterSuite() {
  console.log('\x1b[1m\x1b[33m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[33m  TIFFANY WEBB IMPACT OS™ — 4-TIER E2E AUTOMATED TEST SUITE          \x1b[0m');
  console.log('\x1b[1m\x1b[33m  Covers: R1 (Rebrand), R2 (Ledger Layout), R3 (Notes), R4 (Security) \x1b[0m');
  console.log('\x1b[1m\x1b[33m======================================================================\x1b[0m\n');

  const suiteStartTime = Date.now();
  const tierReports = [];

  // Ensure test preconditions: check db connectivity & clean old artifacts
  try {
    const p = db.getPool();
    await p.query('SELECT 1');
    await db.cleanupTestLeadsByPattern('e2e_test_%');
    console.log('  \x1b[32m✔\x1b[0m MySQL Database connection verified: tiffany_crm');
  } catch (err) {
    console.error('  \x1b[31m✖\x1b[0m Database connection failure:', err.message);
    process.exit(1);
  }

  // Precondition check: verify server is listening on port 3000
  try {
    const probe = await http.get('/login');
    if (probe.status !== 200 && probe.status !== 302) {
      console.warn(`  \x1b[33m⚠\x1b[0m Warning: Server probe returned status ${probe.status}`);
    } else {
      console.log(`  \x1b[32m✔\x1b[0m Impact OS Express server active on port ${http.TEST_PORT}\n`);
    }
  } catch (err) {
    console.error(`  \x1b[31m✖\x1b[0m Could not connect to Express server on port ${http.TEST_PORT}:`, err.message);
    process.exit(1);
  }

  // List of test modules to run
  const testSuites = [
    { tier: 'Tier 1', title: 'Feature Coverage (R1-R4)', file: './tier1_feature_coverage.test.cjs' },
    { tier: 'Tier 2', title: 'Boundary & Corner Cases', file: './tier2_boundary_corner_cases.test.cjs' },
    { tier: 'Tier 3', title: 'Cross-Feature Interactions', file: './tier3_cross_feature_interactions.test.cjs' },
    { tier: 'Tier 4', title: 'Real-World Scenarios', file: './tier4_real_world_scenarios.test.cjs' }
  ];

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const allFailures = [];

  for (const suiteInfo of testSuites) {
    console.log(`\x1b[1m\x1b[35m>>> RUNNING ${suiteInfo.tier.toUpperCase()}: ${suiteInfo.title}\x1b[0m`);
    const { TestFramework } = require('./helpers/test_runner.cjs');
    // Clear require cache for runner DSL
    delete require.cache[require.resolve('./helpers/test_runner.cjs')];
    delete require.cache[require.resolve(suiteInfo.file)];

    const suiteModule = require(suiteInfo.file);
    const { run } = require('./helpers/test_runner.cjs');

    const result = await run();
    totalTests += result.total;
    totalPassed += result.passed;
    totalFailed += result.failed;
    if (result.failures && result.failures.length > 0) {
      allFailures.push(...result.failures);
    }

    tierReports.push({
      tier: suiteInfo.tier,
      title: suiteInfo.title,
      total: result.total,
      passed: result.passed,
      failed: result.failed,
      duration: result.duration
    });
    console.log('');
  }

  // Teardown
  await db.cleanupTestLeadsByPattern('e2e_test_%');
  await db.closePool();

  const grandDuration = Date.now() - suiteStartTime;

  console.log('\x1b[1m\x1b[33m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[33m  E2E TEST SUITE EXECUTION SCORECARD                                  \x1b[0m');
  console.log('\x1b[1m\x1b[33m======================================================================\x1b[0m');
  console.log('  Tier     | Focus Area                    | Tests | Passed | Failed | Duration');
  console.log('  ---------+-------------------------------+-------+--------+--------+---------');

  for (const rep of tierReports) {
    const passedStr = rep.failed === 0 ? `\x1b[32m${rep.passed}\x1b[0m` : rep.passed;
    const failedStr = rep.failed > 0 ? `\x1b[31m${rep.failed}\x1b[0m` : '0';
    console.log(`  ${rep.tier.padEnd(8)} | ${rep.title.padEnd(29)} | ${String(rep.total).padStart(5)} | ${String(passedStr).padStart(6)} | ${String(failedStr).padStart(6)} | ${rep.duration}ms`);
  }

  console.log('  ---------+-------------------------------+-------+--------+--------+---------');
  console.log(`  \x1b[1mTOTAL    | All 4 Tiers                   | ${String(totalTests).padStart(5)} | ${String(totalPassed).padStart(6)} | ${String(totalFailed).padStart(6)} | ${grandDuration}ms\x1b[0m\n`);

  if (totalFailed > 0) {
    console.log(`\x1b[31m✖ TEST SUITE FAILED: ${totalFailed} failure(s) detected.\x1b[0m\n`);
    allFailures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. [${f.suite}] ${f.test}`);
      console.log(`     Error: ${f.error}`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log(`\x1b[1m\x1b[32m✔ 100% ALL TESTS PASSED! (${totalPassed}/${totalTests} across 4 Tiers)\x1b[0m`);
    console.log(`\x1b[32m  Platform: Tiffany Webb Impact OS™ fully validated.\x1b[0m\n`);
    process.exit(0);
  }
}

if (require.main === module) {
  runMasterSuite().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}

module.exports = { runMasterSuite };
