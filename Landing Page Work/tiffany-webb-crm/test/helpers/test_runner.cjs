/**
 * Lightweight Zero-Dependency BDD Test Framework
 * Provides describe(), it(), beforeAll(), afterAll(), and expect() matchers.
 */

const assert = require('assert');

class TestFramework {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.totalTests = 0;
    this.passedCount = 0;
    this.failedCount = 0;
    this.failures = [];
    this.startTime = 0;
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeAllFns: [],
      afterAllFns: [],
      beforeEachFns: [],
      afterEachFns: []
    };
    this.suites.push(suite);
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    fn();
    this.currentSuite = prevSuite;
  }

  it(name, fn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {
        this.it(name, fn);
      });
      return;
    }
    this.currentSuite.tests.push({ name, fn });
  }

  beforeAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeAllFns.push(fn);
    }
  }

  afterAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterAllFns.push(fn);
    }
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachFns.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEachFns.push(fn);
    }
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
        }
      },
      toEqual: (expected) => {
        try {
          assert.deepStrictEqual(actual, expected);
        } catch (e) {
          throw new Error(`Expected deep equality:\nActual: ${JSON.stringify(actual)}\nExpected: ${JSON.stringify(expected)}`);
        }
      },
      toContain: (expected) => {
        if (typeof actual === 'string') {
          if (!actual.includes(expected)) {
            throw new Error(`Expected string to contain "${expected}", but got:\n${actual.substring(0, 300)}...`);
          }
        } else if (Array.isArray(actual)) {
          if (!actual.includes(expected)) {
            throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
          }
        } else {
          throw new Error(`toContain called on unsupported type: ${typeof actual}`);
        }
      },
      toNotContain: (expected) => {
        if (typeof actual === 'string') {
          if (actual.includes(expected)) {
            throw new Error(`Expected string NOT to contain "${expected}", but it was found!`);
          }
        } else if (Array.isArray(actual)) {
          if (actual.includes(expected)) {
            throw new Error(`Expected array NOT to contain ${JSON.stringify(expected)}, but it was found!`);
          }
        } else {
          throw new Error(`toNotContain called on unsupported type: ${typeof actual}`);
        }
      },
      toMatch: (regex) => {
        if (!regex.test(String(actual))) {
          throw new Error(`Expected "${actual}" to match regex ${regex}`);
        }
      },
      toNotMatch: (regex) => {
        if (regex.test(String(actual))) {
          throw new Error(`Expected "${actual}" NOT to match regex ${regex}`);
        }
      },
      toBeDefined: () => {
        if (actual === undefined) {
          throw new Error(`Expected value to be defined, but got undefined`);
        }
      },
      toBeNull: () => {
        if (actual !== null) {
          throw new Error(`Expected value to be null, but got ${JSON.stringify(actual)}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected value to be truthy, but got ${JSON.stringify(actual)}`);
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected value to be falsy, but got ${JSON.stringify(actual)}`);
        }
      },
      toBeGreaterThan: (n) => {
        if (!(actual > n)) {
          throw new Error(`Expected ${actual} to be greater than ${n}`);
        }
      },
      toBeGreaterThanOrEqual: (n) => {
        if (!(actual >= n)) {
          throw new Error(`Expected ${actual} to be greater than or equal to ${n}`);
        }
      },
      toBeLessThan: (n) => {
        if (!(actual < n)) {
          throw new Error(`Expected ${actual} to be less than ${n}`);
        }
      },
      toBeLessThanOrEqual: (n) => {
        if (!(actual <= n)) {
          throw new Error(`Expected ${actual} to be less than or equal to ${n}`);
        }
      }
    };
  }

  async run() {
    this.startTime = Date.now();
    this.totalTests = 0;
    this.passedCount = 0;
    this.failedCount = 0;
    this.failures = [];

    for (const suite of this.suites) {
      console.log(`\n  \x1b[1m\x1b[36m▼ ${suite.name}\x1b[0m`);

      for (const fn of suite.beforeAllFns) {
        await fn();
      }

      for (const test of suite.tests) {
        this.totalTests++;
        for (const fn of suite.beforeEachFns) {
          await fn();
        }

        const testStart = Date.now();
        try {
          await test.fn();
          const duration = Date.now() - testStart;
          this.passedCount++;
          console.log(`    \x1b[32m✓\x1b[0m ${test.name} \x1b[2m(${duration}ms)\x1b[0m`);
        } catch (err) {
          const duration = Date.now() - testStart;
          this.failedCount++;
          const failureRecord = {
            suite: suite.name,
            test: test.name,
            error: err.message,
            stack: err.stack,
            duration
          };
          this.failures.push(failureRecord);
          console.log(`    \x1b[31m✗\x1b[0m \x1b[31m${test.name}\x1b[0m \x1b[2m(${duration}ms)\x1b[0m`);
          console.log(`      \x1b[33mError:\x1b[0m ${err.message}`);
        }

        for (const fn of suite.afterEachFns) {
          await fn();
        }
      }

      for (const fn of suite.afterAllFns) {
        await fn();
      }
    }

    const totalDuration = Date.now() - this.startTime;
    console.log(`\n  --------------------------------------------------`);
    console.log(`  Tests: \x1b[32m${this.passedCount} passed\x1b[0m, ${this.failedCount > 0 ? `\x1b[31m${this.failedCount} failed\x1b[0m, ` : ''}${this.totalTests} total (${totalDuration}ms)`);

    return {
      total: this.totalTests,
      passed: this.passedCount,
      failed: this.failedCount,
      failures: this.failures,
      duration: totalDuration
    };
  }
}

// Create singleton instance and export DSL functions
const framework = new TestFramework();

module.exports = {
  framework,
  describe: framework.describe.bind(framework),
  it: framework.it.bind(framework),
  beforeAll: framework.beforeAll.bind(framework),
  afterAll: framework.afterAll.bind(framework),
  beforeEach: framework.beforeEach.bind(framework),
  afterEach: framework.afterEach.bind(framework),
  expect: framework.expect.bind(framework),
  run: framework.run.bind(framework),
  TestFramework
};
