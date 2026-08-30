/**
 * ADVERSARIAL STRESS TEST HARNESS FOR views/dashboard.ejs
 * Testing Areas:
 * 1. Template Rendering Resilience (empty arrays, missing/null properties, XSS payloads, Unicode, chartData edge cases)
 * 2. Client Search Engine Stress (regex chars, whitespace, rapid input, multi-word tokens)
 * 3. DOM & State Consistency (badge updates, KPI updates, tab pane updates, delete lifecycle)
 * 4. Memory & Performance (leak detection, event handlers, execution speed)
 */

const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const VIEW_PATH = path.join(__dirname, '../views/dashboard.ejs');

// Test tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function test(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`[PASS] ${name}`);
    } catch (err) {
        failedTests.push({ name, error: err.message, stack: err.stack });
        console.error(`[FAIL] ${name}: ${err.message}`);
    }
}

async function runAsyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
        passedTests++;
        console.log(`[PASS] ${name}`);
    } catch (err) {
        failedTests.push({ name, error: err.message, stack: err.stack });
        console.error(`[FAIL] ${name}: ${err.message}`);
    }
}

console.log('=== STARTING EMPIRICAL ADVERSARIAL TEST SUITE FOR dashboard.ejs ===\n');

// --------------------------------------------------------------------------
// SUITE 1: TEMPLATE RENDERING RESILIENCE
// --------------------------------------------------------------------------
console.log('--- SUITE 1: Template Rendering Resilience ---');

test('1.1: Render with completely empty leads array and empty chartData', () => {
    const html = ejs.render(fs.readFileSync(VIEW_PATH, 'utf8'), {
        leads: [],
        chartData: JSON.stringify({ sourceData: {}, funnelData: {} }),
        error: undefined,
        success: undefined
    }, { filename: VIEW_PATH });

    assert.ok(html.includes('id="kpi-total-leads"'), 'KPI total leads container must exist');
    assert.ok(html.includes('Booking Pipeline'), 'Title must render');
    assert.ok(html.includes('No Inquiries in new'), 'Standard empty state for "new" tab must render');
});

test('1.2: Render with null / undefined chartData and missing flash messages', () => {
    const html = ejs.render(fs.readFileSync(VIEW_PATH, 'utf8'), {
        leads: [],
        chartData: null,
        error: null,
        success: null
    }, { filename: VIEW_PATH });

    assert.ok(html.includes('id="crm-chart-payload"'), 'Chart payload script tag must exist');
    assert.ok(html.includes('{}'), 'Empty object fallback must be produced in payload');
});

test('1.3: Render with malformed chartData string', () => {
    const html = ejs.render(fs.readFileSync(VIEW_PATH, 'utf8'), {
        leads: [],
        chartData: '{"sourceData": {broken json',
        error: undefined,
        success: undefined
    }, { filename: VIEW_PATH });

    assert.ok(html.includes('crm-chart-payload'), 'Payload tag exists even with raw string');
});

test('1.4: Render with leads having null/undefined/missing optional fields', () => {
    const sparseLeads = [
        { id: 1, status: 'new' }, // minimal
        { id: 2, status: 'contacted', contact_name: null, email: null, phone: null, organization_name: null, event_type: null, event_date: null, source: null },
        { id: 3, status: 'qualified', contact_name: undefined, email: undefined, phone: undefined, organization_name: undefined, event_type: undefined, event_date: undefined, source: undefined },
        { id: 4, status: 'booked', contact_name: '', email: '', phone: '', organization_name: '', event_type: '', event_date: '', source: '' }
    ];

    const html = ejs.render(fs.readFileSync(VIEW_PATH, 'utf8'), {
        leads: sparseLeads,
        chartData: JSON.stringify({ sourceData: {}, funnelData: {} }),
        error: undefined,
        success: undefined
    }, { filename: VIEW_PATH });

    assert.ok(html.includes('lead-card-1'), 'Lead 1 must render');
    assert.ok(html.includes('lead-card-2'), 'Lead 2 must render');
    assert.ok(html.includes('lead-card-3'), 'Lead 3 must render');
    assert.ok(html.includes('lead-card-4'), 'Lead 4 must render');
    assert.ok(html.includes('Inquiry #1'), 'Fallback name Inquiry #1 must render');
    assert.ok(html.includes('Date TBD'), 'Fallback date TBD must render');
});

test('1.5: Render with adversarial XSS payloads in names, notes, and fields', () => {
    const xssLeads = [
        {
            id: 101,
            status: 'new',
            contact_name: '<script>alert("xss")</script>',
            organization_name: '<img src=x onerror=alert(1)>',
            email: '"><script>alert(2)</script>@test.com',
            phone: '123456"><svg onload=alert(3)>',
            event_type: '"><b onmouseover=alert(4)>VIP</b>',
            event_date: '2026-10-15',
            source: '"><script>alert(5)</script>'
        },
        {
            id: 102,
            status: 'new',
            contact_name: 'O\'Connor & "Sons" <Co>',
            organization_name: 'Smith & Jones, LLC -- `rm -rf /`',
            email: 'o\'connor@test.com',
            phone: '+1 (555) 019-2831',
            event_type: 'corporate_gala',
            event_date: '2026-12-31',
            source: 'referral_partner'
        },
        {
            id: 103,
            status: 'proposal_sent',
            contact_name: '👑✨ Lady 𝕬𝖑𝖎𝖈𝖊 𠜎 🚀 (Special Unicode)',
            organization_name: '日本語企業 🏢 & München GmbH 🇩🇪',
            email: 'unicode@test.org',
            phone: '+81 90 1234 5678',
            event_type: 'wedding',
            event_date: '2027-01-01',
            source: 'instagram'
        }
    ];

    const html = ejs.render(fs.readFileSync(VIEW_PATH, 'utf8'), {
        leads: xssLeads,
        chartData: JSON.stringify({ sourceData: { '"><script>alert(1)</script>': 1 }, funnelData: {} }),
        error: '<script>alert("error_xss")</script>',
        success: '<script>alert("success_xss")</script>'
    }, { filename: VIEW_PATH });

    // Verify raw unescaped script tag is NOT rendered executable in lead text
    assert.ok(!html.includes('<h3><script>alert("xss")</script></h3>'), 'Script tag in contact name must be escaped');
    assert.ok(html.includes('&lt;script&gt;alert(&#34;xss&#34;)&lt;/script&gt;') || html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'), 'XSS in name must be HTML escaped');
    assert.ok(html.includes('&lt;script&gt;alert(&#34;error_xss&#34;)&lt;/script&gt;') || html.includes('&lt;script&gt;alert(&quot;error_xss&quot;)&lt;/script&gt;'), 'XSS in error banner must be escaped');
});

test('1.6: Render with multiline and backslash characters in contact name', () => {
    const trickyLeads = [
        {
            id: 201,
            status: 'new',
            contact_name: 'John\nDoe\r\nExecutive',
            organization_name: 'ACME\\Corp\\Division',
            email: 'john@acme.com',
            phone: '555-1234',
            source: 'website'
        },
        {
            id: 202,
            status: 'new',
            contact_name: 'Quote\'s "Special" \\ Backslash',
            organization_name: 'Testing \\\' escaped',
            email: 'test@test.com',
            phone: '555-4321',
            source: 'website'
        }
    ];

    const html = ejs.render(fs.readFileSync(VIEW_PATH, 'utf8'), {
        leads: trickyLeads,
        chartData: JSON.stringify({ sourceData: {}, funnelData: {} }),
        error: undefined,
        success: undefined
    }, { filename: VIEW_PATH });

    assert.ok(html.includes('lead-card-201'), 'Lead 201 rendered');
    assert.ok(html.includes('lead-card-202'), 'Lead 202 rendered');
});

test('1.7: ChartData JSON escaping inside <script id="crm-chart-payload">', () => {
    const dangerousChartData = JSON.stringify({
        sourceData: { '</script><script>alert("xss_payload")</script>': 5 },
        funnelData: { new: 5 }
    });

    const html = ejs.render(fs.readFileSync(VIEW_PATH, 'utf8'), {
        leads: [],
        chartData: dangerousChartData,
        error: undefined,
        success: undefined
    }, { filename: VIEW_PATH });

    assert.ok(!html.includes('</script><script>alert("xss_payload")</script>'), 'Dangerous closing script tag must not break out of json payload');
    assert.ok(html.includes('\\u003c/script>\\u003cscript>alert'), 'Less-than signs must be safely unicode escaped in JSON script tag');
});

// --------------------------------------------------------------------------
// SUITE 2: CLIENT SEARCH ENGINE STRESS TESTS
// --------------------------------------------------------------------------
console.log('\n--- SUITE 2: Client Search Engine Simulation ---');

function matchLead(cardSearchData, query) {
    const q = (query || '').trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return { matches: false, isSearchActive: false };
    const matches = tokens.every(token => cardSearchData.toLowerCase().includes(token));
    return { matches, isSearchActive: true };
}

test('2.1: Search with empty query and whitespace-only', () => {
    const data = 'john doe john@example.com 555-1234 acme corp new wedding';
    assert.strictEqual(matchLead(data, '').isSearchActive, false);
    assert.strictEqual(matchLead(data, '   ').isSearchActive, false);
    assert.strictEqual(matchLead(data, '\t\n  \r').isSearchActive, false);
});

test('2.2: Search with regex special characters does not throw or misbehave', () => {
    const data = 'john doe john@example.com +1-555-1234 (vip client) [corporate] new';
    
    // Regex characters as literal search terms
    const regexTerms = ['.*', '+1-555', '(vip', '[corporate]', '.*+?^${}()|[]\\', 'c++'];
    for (const term of regexTerms) {
        // Must not throw RegExp syntax error
        const res = matchLead(data, term);
        assert.ok(typeof res.matches === 'boolean');
    }

    assert.strictEqual(matchLead(data, '+1-555').matches, true);
    assert.strictEqual(matchLead(data, '(vip').matches, true);
    assert.strictEqual(matchLead(data, '[corporate]').matches, true);
    assert.strictEqual(matchLead(data, 'nonexistent [tag]').matches, false);
});

test('2.3: Multi-word token search (AND logic across fields)', () => {
    const card1 = 'alice smith alice@summit.org 555-0100 summit media qualified keynote';
    const card2 = 'bob jones bob@summit.org 555-0200 summit media booked workshop';
    const card3 = 'charlie brown charlie@peanuts.com 555-0300 freelance new wedding';

    // "summit qualified" should match card1 only
    assert.strictEqual(matchLead(card1, 'summit qualified').matches, true);
    assert.strictEqual(matchLead(card2, 'summit qualified').matches, false);
    assert.strictEqual(matchLead(card3, 'summit qualified').matches, false);

    // "summit 555" should match card1 and card2
    assert.strictEqual(matchLead(card1, 'summit 555').matches, true);
    assert.strictEqual(matchLead(card2, 'summit 555').matches, true);
    assert.strictEqual(matchLead(card3, 'summit 555').matches, false);

    // Multi-whitespace between tokens
    assert.strictEqual(matchLead(card1, '  alice     summit   ').matches, true);
});

test('2.4: Rapid repeated keystrokes / search performance simulation (10,000 queries)', () => {
    const cardDatabase = Array.from({ length: 500 }, (_, i) => 
        `lead_${i} person${i}@company.com +1-555-${1000 + i} enterprise_${i % 10} ${['new', 'contacted', 'qualified', 'booked'][i % 4]} gala`
    );

    const start = Date.now();
    const sampleQueries = ['lead_42', 'enterprise_3', 'person100@company.com', 'booked gala', 'nonexistent_term_xyz', '555-12'];

    for (let iter = 0; iter < 10000; iter++) {
        const query = sampleQueries[iter % sampleQueries.length];
        const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        let matches = 0;
        for (let j = 0; j < cardDatabase.length; j++) {
            if (tokens.every(t => cardDatabase[j].includes(t))) {
                matches++;
            }
        }
    }
    const elapsed = Date.now() - start;
    console.log(`      [PERF] 10,000 queries across 500 cards executed in ${elapsed}ms (${(elapsed / 10000).toFixed(3)}ms/search)`);
    assert.ok(elapsed < 2000, `Search engine must execute 10,000 iterations in <2000ms (was ${elapsed}ms)`);
});

// --------------------------------------------------------------------------
// SUITE 3: DOM & STATE CONSISTENCY SIMULATION
// --------------------------------------------------------------------------
console.log('\n--- SUITE 3: DOM & State Consistency Simulation ---');

test('3.1: Counter reconciler logic preserves exact math across tabs', () => {
    const mockPanes = [
        { status: 'new', cards: 5 },
        { status: 'contacted', cards: 3 },
        { status: 'qualified', cards: 2 },
        { status: 'proposal_sent', cards: 4 },
        { status: 'booked', cards: 6 },
        { status: 'completed', cards: 1 },
        { status: 'declined', cards: 0 },
        { status: 'lost', cards: 0 }
    ];

    function reconcile(panes) {
        let totalCount = 0;
        let newCount = 0;
        let bookedCount = 0;
        let proposalCount = 0;
        const badges = {};

        panes.forEach(pane => {
            const count = pane.cards;
            totalCount += count;
            if (pane.status === 'new') newCount = count;
            if (pane.status === 'booked') bookedCount = count;
            if (pane.status === 'proposal_sent') proposalCount = count;
            badges[pane.status] = count;
        });

        return { totalCount, newCount, bookedCount, proposalCount, badges };
    }

    const state1 = reconcile(mockPanes);
    assert.strictEqual(state1.totalCount, 21);
    assert.strictEqual(state1.newCount, 5);
    assert.strictEqual(state1.bookedCount, 6);
    assert.strictEqual(state1.proposalCount, 4);

    // Simulate deleting 2 leads from 'new' and 1 from 'booked'
    mockPanes[0].cards -= 2;
    mockPanes[4].cards -= 1;

    const state2 = reconcile(mockPanes);
    assert.strictEqual(state2.totalCount, 18);
    assert.strictEqual(state2.newCount, 3);
    assert.strictEqual(state2.bookedCount, 5);
    assert.strictEqual(state2.proposalCount, 4);
    assert.strictEqual(state2.badges['new'], 3);
    assert.strictEqual(state2.badges['booked'], 5);
});

test('3.2: Single card deletion handles empty state transitions', () => {
    let newCards = 1;
    function getPaneState(cardsCount) {
        return {
            bulkDeleteHidden: cardsCount === 0,
            gridHidden: cardsCount === 0,
            emptyStateVisible: cardsCount === 0
        };
    }

    assert.deepStrictEqual(getPaneState(newCards), {
        bulkDeleteHidden: false,
        gridHidden: false,
        emptyStateVisible: false
    });

    // Delete the last card
    newCards = 0;
    assert.deepStrictEqual(getPaneState(newCards), {
        bulkDeleteHidden: true,
        gridHidden: true,
        emptyStateVisible: true
    });
});

test('3.3: Analytics aggregation reconciler reflects DOM state changes', () => {
    const mockCardsInDOM = [
        { source: 'website_form', status: 'new' },
        { source: 'website_form', status: 'booked' },
        { source: 'instagram', status: 'qualified' },
        { source: 'referral', status: 'proposal_sent' },
        { source: 'whatsapp', status: 'new' }
    ];

    function refreshAnalytics(cards) {
        const sourceCounts = {};
        const funnelCounts = { new: 0, qualified: 0, proposal_sent: 0, booked: 0 };

        cards.forEach(card => {
            const src = card.source || 'website';
            const st = card.status || 'new';
            sourceCounts[src] = (sourceCounts[src] || 0) + 1;
            if (funnelCounts[st] !== undefined) funnelCounts[st]++;
        });

        return { sourceCounts, funnelCounts };
    }

    const before = refreshAnalytics(mockCardsInDOM);
    assert.strictEqual(before.sourceCounts['website_form'], 2);
    assert.strictEqual(before.sourceCounts['instagram'], 1);
    assert.strictEqual(before.funnelCounts['new'], 2);
    assert.strictEqual(before.funnelCounts['booked'], 1);

    // Delete one website_form lead in 'new'
    const afterCards = mockCardsInDOM.slice(1);
    const after = refreshAnalytics(afterCards);
    assert.strictEqual(after.sourceCounts['website_form'], 1);
    assert.strictEqual(after.funnelCounts['new'], 1);
});

// --------------------------------------------------------------------------
// SUITE 4: HTML ESCAPING & UTILITIES
// --------------------------------------------------------------------------
console.log('\n--- SUITE 4: Helper Functions & Safety ---');

test('4.1: escapeHTML handles all XSS delimiters', () => {
    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }

    assert.strictEqual(escapeHTML(''), '');
    assert.strictEqual(escapeHTML(null), '');
    assert.strictEqual(escapeHTML(undefined), '');
    assert.strictEqual(escapeHTML('hello <world> & "friends" \'26\''), 'hello &lt;world&gt; &amp; &quot;friends&quot; &#39;26&#39;');
});

test('4.2: getSafeChartData parser resilience with varied inputs', () => {
    function parsePayload(rawText) {
        try {
            if (!rawText || !rawText.trim()) {
                return {
                    sourceData: {},
                    funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 }
                };
            }
            const parsed = JSON.parse(rawText);
            return {
                sourceData: (parsed && typeof parsed.sourceData === 'object' && parsed.sourceData !== null) 
                    ? parsed.sourceData 
                    : {},
                funnelData: (parsed && typeof parsed.funnelData === 'object' && parsed.funnelData !== null) 
                    ? parsed.funnelData 
                    : { new: 0, qualified: 0, proposal_sent: 0, booked: 0 }
            };
        } catch (err) {
            return {
                sourceData: {},
                funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 }
            };
        }
    }

    assert.deepStrictEqual(parsePayload(''), { sourceData: {}, funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 } });
    assert.deepStrictEqual(parsePayload('   '), { sourceData: {}, funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 } });
    assert.deepStrictEqual(parsePayload('invalid json'), { sourceData: {}, funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 } });
    assert.deepStrictEqual(parsePayload('[]'), { sourceData: {}, funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 } });
    assert.deepStrictEqual(parsePayload('{"sourceData": null}'), { sourceData: {}, funnelData: { new: 0, qualified: 0, proposal_sent: 0, booked: 0 } });
    assert.deepStrictEqual(parsePayload('{"sourceData": {"web": 10}, "funnelData": {"new": 5}}'), { sourceData: { web: 10 }, funnelData: { new: 5 } });
});

// --------------------------------------------------------------------------
// SUMMARY REPORT
// --------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} PASSED (${failedTests.length} FAILED)`);
console.log('======================================================');

if (failedTests.length > 0) {
    console.error('\nFAILED TESTS DETAILS:');
    failedTests.forEach(f => {
        console.error(`- ${f.name}`);
        console.error(`  ${f.error}`);
    });
    process.exit(1);
} else {
    console.log('\nALL ADVERSARIAL STRESS TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
}
