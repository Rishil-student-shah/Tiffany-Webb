/**
 * Lightweight E2E Test Suite & Assertion Engine
 * Designed for self-contained, high-reliability opaque-box testing
 */

class TestFramework {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.currentTest = null;
    this.stats = {
      totalSuites: 0,
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0
    };
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEachHooks: [],
      afterEachHooks: [],
      beforeAllHooks: [],
      afterAllHooks: [],
      parent: this.currentSuite
    };

    if (this.currentSuite) {
      this.currentSuite.suites = this.currentSuite.suites || [];
      this.currentSuite.suites.push(suite);
    } else {
      this.suites.push(suite);
    }

    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    fn();
    this.currentSuite = prevSuite;
  }

  it(name, fn) {
    if (!this.currentSuite) {
      throw new Error(`Test "${name}" must be defined inside a describe block`);
    }
    this.currentSuite.tests.push({
      name,
      fn,
      status: 'pending',
      error: null,
      durationMs: 0
    });
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachHooks.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEachHooks.push(fn);
    }
  }

  beforeAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeAllHooks.push(fn);
    }
  }

  afterAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterAllHooks.push(fn);
    }
  }

  async runSuite(suite, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`\n${indent}\x1b[1m\x1b[36m▶ ${suite.name}\x1b[0m`);
    this.stats.totalSuites++;

    // Run beforeAll hooks
    for (const hook of suite.beforeAllHooks) {
      await hook();
    }

    for (const test of suite.tests) {
      this.stats.totalTests++;
      const testIndent = '  '.repeat(depth + 1);
      const startTime = Date.now();

      // Collect all beforeEach hooks from parent hierarchy
      const allBeforeEach = this.collectHooks(suite, 'beforeEachHooks');
      const allAfterEach = this.collectHooks(suite, 'afterEachHooks').reverse();

      try {
        for (const hook of allBeforeEach) {
          await hook();
        }

        await test.fn();
        test.status = 'passed';
        test.durationMs = Date.now() - startTime;
        this.stats.passed++;
        console.log(`${testIndent}\x1b[32m✔\x1b[0m ${test.name} \x1b[90m(${test.durationMs}ms)\x1b[0m`);
      } catch (err) {
        test.status = 'failed';
        test.error = err;
        test.durationMs = Date.now() - startTime;
        this.stats.failed++;
        console.log(`${testIndent}\x1b[31m✖\x1b[0m \x1b[31m${test.name}\x1b[0m \x1b[90m(${test.durationMs}ms)\x1b[0m`);
        console.log(`${testIndent}  \x1b[31mError: ${err.message}\x1b[0m`);
        if (err.stack) {
          const stackLines = err.stack.split('\n').slice(1, 4).join('\n');
          console.log(`${testIndent}  \x1b[90m${stackLines}\x1b[0m`);
        }
      } finally {
        for (const hook of allAfterEach) {
          try {
            await hook();
          } catch (hookErr) {
            console.error(`${testIndent}  \x1b[33mWarning: afterEach hook failed: ${hookErr.message}\x1b[0m`);
          }
        }
      }
    }

    if (suite.suites) {
      for (const nestedSuite of suite.suites) {
        await this.runSuite(nestedSuite, depth + 1);
      }
    }

    // Run afterAll hooks
    for (const hook of suite.afterAllHooks) {
      try {
        await hook();
      } catch (hookErr) {
        console.error(`${indent}  \x1b[33mWarning: afterAll hook failed: ${hookErr.message}\x1b[0m`);
      }
    }
  }

  collectHooks(suite, hookName) {
    const hooks = [];
    let current = suite;
    while (current) {
      if (current[hookName]) {
        hooks.unshift(...current[hookName]);
      }
      current = current.parent;
    }
    return hooks;
  }

  async run() {
    const totalStart = Date.now();
    console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');
    console.log('\x1b[1m\x1b[35m  TIFFANY WEBB OPAQUE-BOX E2E TEST RUNNER — 4-TIER AUTOMATED SUITE   \x1b[0m');
    console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');

    for (const suite of this.suites) {
      await this.runSuite(suite);
    }

    this.stats.durationMs = Date.now() - totalStart;

    console.log('\n\x1b[1m\x1b[35m======================================================================\x1b[0m');
    console.log('\x1b[1m\x1b[37m  TEST EXECUTION SUMMARY\x1b[0m');
    console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');
    console.log(`  Total Test Suites:  \x1b[1m${this.stats.totalSuites}\x1b[0m`);
    console.log(`  Total Test Cases:   \x1b[1m${this.stats.totalTests}\x1b[0m`);
    console.log(`  Passed:             \x1b[1m\x1b[32m${this.stats.passed} ✔\x1b[0m`);
    console.log(`  Failed:             \x1b[1m\x1b[31m${this.stats.failed} ✖\x1b[0m`);
    console.log(`  Duration:           \x1b[1m${this.stats.durationMs}ms\x1b[0m`);
    console.log('\x1b[1m\x1b[35m======================================================================\x1b[0m');

    if (this.stats.failed > 0) {
      console.log('\x1b[31m\x1b[1m✖ OVERALL STATUS: FAILURES DETECTED\x1b[0m\n');
    } else {
      console.log('\x1b[32m\x1b[1m✔ OVERALL STATUS: ALL TESTS PASSED\x1b[0m\n');
    }

    return this.stats;
  }
}

// Assertion Helpers
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} (type: ${typeof expected}) but got ${JSON.stringify(actual)} (type: ${typeof actual})`);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error(`Expected deep equality:\nExpected: ${b}\nReceived: ${a}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value but got ${JSON.stringify(actual)}`);
      }
    },
    toBeDefined() {
      if (typeof actual === 'undefined') {
        throw new Error('Expected value to be defined, but got undefined');
      }
    },
    toBeGreaterThan(expected) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toContain(substrOrItem) {
      if (typeof actual === 'string') {
        if (!actual.includes(substrOrItem)) {
          throw new Error(`Expected string "${actual.slice(0, 100)}..." to contain "${substrOrItem}"`);
        }
      } else if (Array.isArray(actual)) {
        if (!actual.includes(substrOrItem)) {
          throw new Error(`Expected array to contain item ${JSON.stringify(substrOrItem)}`);
        }
      } else {
        throw new Error(`toContain called on non-string/array type: ${typeof actual}`);
      }
    },
    toNotContain(substrOrItem) {
      if (typeof actual === 'string' && actual.includes(substrOrItem)) {
        throw new Error(`Expected string to NOT contain "${substrOrItem}"`);
      } else if (Array.isArray(actual) && actual.includes(substrOrItem)) {
        throw new Error(`Expected array to NOT contain item ${JSON.stringify(substrOrItem)}`);
      }
    },
    toMatch(regex) {
      if (!regex.test(String(actual))) {
        throw new Error(`Expected "${String(actual).slice(0, 100)}" to match pattern ${regex}`);
      }
    },
    toNotMatch(regex) {
      if (regex.test(String(actual))) {
        throw new Error(`Expected "${String(actual).slice(0, 100)}" to NOT match pattern ${regex}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
      }
    }
  };
}

const framework = new TestFramework();
const describe = framework.describe.bind(framework);
const it = framework.it.bind(framework);
const beforeEach = framework.beforeEach.bind(framework);
const afterEach = framework.afterEach.bind(framework);
const beforeAll = framework.beforeAll.bind(framework);
const afterAll = framework.afterAll.bind(framework);

module.exports = {
  framework,
  describe,
  it,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  expect
};
