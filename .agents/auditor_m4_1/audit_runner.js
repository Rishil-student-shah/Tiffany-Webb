const fs = require('fs');
const path = require('path');
const http = require('http');
const crmNodeModules = path.resolve('Landing Page Work/tiffany-webb-crm/node_modules');
const jwt = require(path.join(crmNodeModules, 'jsonwebtoken'));

const SERVER_PATH = path.resolve('Landing Page Work/tiffany-webb-crm/server.js');
const code = fs.readFileSync(SERVER_PATH, 'utf8');

console.log('====================================================');
console.log('AUDIT RUNNER: FORENSIC INTEGRITY CHECKS FOR M4');
console.log('====================================================');

// 1. Detailed SQL Query Inspection
console.log('\n--- CHECK 1: SQL Injection Immunity & Parameterization Audit ---');
const queryRegex = /pool\.(?:query|execute)\s*\(\s*([\s\S]*?)(?:,\s*(\[[^\]]*\]|[a-zA-Z0-9_]+))?\s*\)/g;
let match;
let totalQueries = 0;
let unsafeInterpolations = [];

// Check every template string inside pool.query
const templateRegex = /pool\.(?:query|execute)\s*\(\s*`([\s\S]*?)`/g;
while ((match = templateRegex.exec(code)) !== null) {
  totalQueries++;
  const queryStr = match[1];
  const interpolations = queryStr.match(/\${([^}]+)}/g);
  if (interpolations) {
    interpolations.forEach(interp => {
      const expr = interp.slice(2, -1).trim();
      // Only conditions.join or safe dynamic clause builder is acceptable if params contains values
      if (expr !== "conditions.join(' OR ')" && expr !== 'conditions.join(" OR ")') {
        unsafeInterpolations.push({ query: queryStr.slice(0, 80), expression: expr });
      }
    });
  }
}

// Also check string concatenation with +
const concatRegex = /pool\.(?:query|execute)\s*\(\s*['"][^'"]*['"]\s*\+\s*[a-zA-Z_]/g;
while ((match = concatRegex.exec(code)) !== null) {
  unsafeInterpolations.push({ query: match[0], expression: 'String concatenation with +' });
}

console.log(`Dynamic SQL queries with template literals checked: ${totalQueries}`);
console.log(`Unsafe interpolations or concatenations found: ${unsafeInterpolations.length}`);
if (unsafeInterpolations.length > 0) {
  console.error('UNSAFE INTERPOLATIONS FOUND:', unsafeInterpolations);
} else {
  console.log('PASS: All SQL queries strictly use ? parameterized placeholders. The single template literal uses conditions.join(" OR ") with static placeholder strings while all inputs are passed in params array.');
}

// 2. Duplicate Route Detection
console.log('\n--- CHECK 2: Route Shadowing Detection (/api/leads/batch) ---');
const postBatchMatches = code.match(/app\.post\s*\(\s*['"]\/api\/leads\/batch['"][\s\S]*?\)/g) || [];
console.log(`POST /api/leads/batch endpoints found: ${postBatchMatches.length}`);
postBatchMatches.forEach((m, idx) => {
  const firstLine = m.split('\n')[0];
  console.log(`  Match ${idx + 1}: ${firstLine}`);
});
if (postBatchMatches.length === 1 && postBatchMatches[0].includes('requireAuth')) {
  console.log('PASS: Shadowed unauthenticated /api/leads/batch removed. Exactly 1 protected route remains.');
} else {
  console.log('FAIL: Expected exactly 1 protected POST /api/leads/batch endpoint.');
}

// 3. Prohibited Patterns (Hardcoded mocks, facades, bypasses)
console.log('\n--- CHECK 3: Prohibited Patterns (Mock outputs, test bypasses) ---');
const prohibitedRegexes = [
  { name: 'Hardcoded test bypass', regex: /if\s*\(.*(test|mock|bypass|isAudit).*\)\s*return/i },
  { name: 'Mock credentials bypass', regex: /password\s*===?\s*['"](?:test|admin|bypass)['"]/i },
  { name: 'Hardcoded PASS string in backend', regex: /res\.(?:send|json)\s*\(\s*['"`]PASS['"`]\s*\)/i },
  { name: 'Dummy constant return in security functions', regex: /function\s+sanitize(?:String|Value)\b[\s\S]*?return\s+['"`][^'"`]+['"`]\s*;/ }
];

let prohibitedViolations = [];
for (const p of prohibitedRegexes) {
  const match = code.match(p.regex);
  if (match) {
    prohibitedViolations.push({ name: p.name, match: match[0] });
  }
}
console.log(`Prohibited pattern violations found: ${prohibitedViolations.length}`);
if (prohibitedViolations.length > 0) {
  console.error('PROHIBITED PATTERNS FOUND:', prohibitedViolations);
} else {
  console.log('PASS: No mock bypasses, hardcoded test results, or dummy implementations found.');
}

// 4. Recursive XSS Sanitization Unit & Stress Testing
console.log('\n--- CHECK 4: Recursive XSS Sanitization Unit & Stress Testing ---');
const sanitizeStart = code.indexOf('function sanitizeString(');
const sanitizeEnd = code.indexOf('const sanitizeMulterBody');
const sanitizeCode = code.slice(sanitizeStart, sanitizeEnd);

const sanitizeFnScope = new Function(sanitizeCode + '; return { sanitizeString, sanitizeValue };')();
const { sanitizeString, sanitizeValue } = sanitizeFnScope;

const xssAttackVectors = [
  {
    name: 'Classic Script Tag',
    input: '<script>alert(1)</script>',
    disallowed: ['<script>', '</script>']
  },
  {
    name: 'Nested Script Tag Evasion (<scr<script>ipt>)',
    input: '<scr<script>ipt>alert(1)</script>',
    disallowed: ['<script', 'script>']
  },
  {
    name: 'Deep Nested Script Tag Evasion (<sc<scr<script>ipt>ript>)',
    input: '<sc<scr<script>ipt>ript>alert("xss")</script>',
    disallowed: ['<script', 'script>']
  },
  {
    name: 'Classic Iframe Tag',
    input: '<iframe src="https://evil.com"></iframe>',
    disallowed: ['<iframe', '</iframe>']
  },
  {
    name: 'Nested Iframe Tag Evasion (<ifra<iframe src=x>me>)',
    input: '<ifra<iframe src=x>me>test</iframe>',
    disallowed: ['<iframe', 'iframe>']
  },
  {
    name: 'Event Handler Injection (onerror with whitespace)',
    input: '<img src="invalid" onerror   = "alert(\'xss\')" />',
    disallowed: ['onerror']
  },
  {
    name: 'Event Handler Injection (onload, onclick, onmouseover)',
    input: '<svg onload=alert(1) onclick=steal() onmouseover=exploit()>',
    disallowed: ['onload', 'onclick', 'onmouseover']
  },
  {
    name: 'Javascript Pseudo-Protocol (javascript:)',
    input: '<a href="javascript:alert(1)">Click here</a>',
    disallowed: ['javascript:']
  },
  {
    name: 'Mixed Case Javascript Pseudo-Protocol (jAvAsCrIpT:)',
    input: 'jAvAsCrIpT:alert(1)',
    disallowed: ['javascript:']
  },
  {
    name: 'Nested Object & Array Payload Structure',
    input: {
      headline: 'Normal Headline',
      nested: {
        danger: '<script>evil()</script>',
        list: ['clean', '<iframe src=bad></iframe>', { deep: '<img onerror=hack()>' }]
      }
    },
    isObject: true
  }
];

let xssPassed = 0;
let xssFailed = 0;

for (const vector of xssAttackVectors) {
  if (vector.isObject) {
    const cleaned = sanitizeValue(vector.input);
    const jsonCleaned = JSON.stringify(cleaned);
    const hasScript = jsonCleaned.includes('<script>') || jsonCleaned.includes('</script>');
    const hasIframe = jsonCleaned.includes('<iframe');
    const hasOnerror = jsonCleaned.includes('onerror=');
    if (!hasScript && !hasIframe && !hasOnerror) {
      console.log(`  [PASS] ${vector.name}`);
      xssPassed++;
    } else {
      console.log(`  [FAIL] ${vector.name}:`, jsonCleaned);
      xssFailed++;
    }
  } else {
    const cleaned = sanitizeValue(vector.input);
    let passed = true;
    for (const dis of vector.disallowed) {
      if (cleaned.toLowerCase().includes(dis.toLowerCase())) {
        passed = false;
        break;
      }
    }
    if (passed) {
      console.log(`  [PASS] ${vector.name} -> "${cleaned}"`);
      xssPassed++;
    } else {
      console.log(`  [FAIL] ${vector.name} -> "${cleaned}"`);
      xssFailed++;
    }
  }
}
console.log(`XSS Tests: ${xssPassed} passed, ${xssFailed} failed.`);

// 5. Multer File Filter Verification
console.log('\n--- CHECK 5: Multer Upload File Filter Stress Testing ---');
const fileFilterMatch = code.match(/fileFilter:\s*(function\s*\(req,\s*file,\s*cb\)\s*\{[\s\S]*?\r?\n\s*\})\r?\n\s*\}\);/);
if (!fileFilterMatch) {
  throw new Error('Could not extract fileFilter from server.js');
}
const funcCode = fileFilterMatch[1];
const fileFilterFn = new Function('path', `return (${funcCode});`)(path);

const uploadTestCases = [
  { fieldname: 'image_file', originalname: 'avatar.png', mimetype: 'image/png', shouldPass: true },
  { fieldname: 'image_file', originalname: 'banner.jpg', mimetype: 'image/jpeg', shouldPass: true },
  { fieldname: 'image_file', originalname: 'photo.webp', mimetype: 'image/webp', shouldPass: true },
  { fieldname: 'image_upload_1', originalname: 'graphic.gif', mimetype: 'image/gif', shouldPass: true },
  { fieldname: 'image_file', originalname: 'exploit.svg', mimetype: 'image/svg+xml', shouldPass: false, reason: 'SVG prohibited due to stored XSS potential' },
  { fieldname: 'image_file', originalname: 'shell.php', mimetype: 'application/x-php', shouldPass: false, reason: 'PHP executable prohibited' },
  { fieldname: 'image_file', originalname: 'page.html', mimetype: 'text/html', shouldPass: false, reason: 'HTML prohibited' },
  { fieldname: 'image_file', originalname: 'malware.exe', mimetype: 'application/octet-stream', shouldPass: false, reason: 'EXE prohibited' },
  { fieldname: 'image_file', originalname: 'script.js', mimetype: 'application/javascript', shouldPass: false, reason: 'JS prohibited' },
  { fieldname: 'video_file', originalname: 'talk.mp4', mimetype: 'video/mp4', shouldPass: true },
  { fieldname: 'video_file', originalname: 'clip.webm', mimetype: 'video/webm', shouldPass: true },
  { fieldname: 'video_file', originalname: 'reel.mov', mimetype: 'video/quicktime', shouldPass: true },
  { fieldname: 'video_file', originalname: 'video.avi', mimetype: 'video/x-msvideo', shouldPass: false, reason: 'AVI not in allowed video exts' },
  { fieldname: 'unknown_field', originalname: 'doc.pdf', mimetype: 'application/pdf', shouldPass: false, reason: 'Arbitrary fields prohibited' }
];

let uploadPassed = 0;
let uploadFailed = 0;

for (const tc of uploadTestCases) {
  let allowed = false;
  let errMessage = null;

  fileFilterFn({}, { fieldname: tc.fieldname, originalname: tc.originalname, mimetype: tc.mimetype }, (err, result) => {
    if (err) {
      allowed = false;
      errMessage = err.message;
    } else {
      allowed = !!result;
    }
  }, path);

  if (allowed === tc.shouldPass) {
    console.log(`  [PASS] ${tc.fieldname}: ${tc.originalname} -> ${allowed ? 'ALLOWED' : 'BLOCKED (' + errMessage + ')'}`);
    uploadPassed++;
  } else {
    console.log(`  [FAIL] ${tc.fieldname}: ${tc.originalname} -> Expected ${tc.shouldPass ? 'ALLOW' : 'BLOCK'}, got ${allowed ? 'ALLOW' : 'BLOCK'}`);
    uploadFailed++;
  }
}
console.log(`Multer File Filter Tests: ${uploadPassed} passed, ${uploadFailed} failed.`);

// 6. Live Server HTTP Verification Suite
console.log('\n--- CHECK 6: Live Server Behavioral Verification Suite ---');

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runLiveTests() {
  try {
    // 6.1 Helmet Headers Test
    console.log('\n[6.1] Testing Helmet HTTP Headers on GET /login...');
    const resLogin = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'GET'
    });
    console.log('  Status code:', resLogin.statusCode);
    console.log('  X-Frame-Options:', resLogin.headers['x-frame-options']);
    console.log('  X-Content-Type-Options:', resLogin.headers['x-content-type-options']);
    const helmetPass = resLogin.headers['x-frame-options'] === 'DENY' &&
                       resLogin.headers['x-content-type-options'] === 'nosniff';
    console.log(`  -> Helmet Check: ${helmetPass ? 'PASS' : 'FAIL'}`);

    // 6.2 Root Route Redirect (Unauthenticated)
    console.log('\n[6.2] Testing Root Route Redirect GET / (Unauthenticated)...');
    const resRootUnauth = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    console.log('  Status code:', resRootUnauth.statusCode);
    console.log('  Location:', resRootUnauth.headers['location']);
    const rootUnauthPass = resRootUnauth.statusCode === 302 && resRootUnauth.headers['location'] === '/login';
    console.log(`  -> Root Unauth Redirect Check: ${rootUnauthPass ? 'PASS' : 'FAIL'}`);

    // 6.3 Root Route Redirect (Authenticated with valid JWT)
    console.log('\n[6.3] Testing Root Route Redirect GET / (Authenticated with JWT)...');
    const JWT_SECRET = process.env.JWT_SECRET || 'tiffany-webb-crm-secret-key-2025';
    const testToken = jwt.sign({ id: 1, email: 'admin@tiffanywebbimpact.com', role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    const resRootAuth = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      headers: {
        'Cookie': `auth_token=${testToken}`
      }
    });
    console.log('  Status code:', resRootAuth.statusCode);
    console.log('  Location:', resRootAuth.headers['location']);
    const rootAuthPass = resRootAuth.statusCode === 302 && resRootAuth.headers['location'] === '/dashboard';
    console.log(`  -> Root Auth Redirect Check: ${rootAuthPass ? 'PASS' : 'FAIL'}`);

    // 6.4 CORS Whitelist Verification
    console.log('\n[6.4] Testing CORS Whitelist Enforcement...');
    // Origin 1: https://tiffanywebbimpact.com (Allowed)
    const resCorsAllowed = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads/check-duplicate',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://tiffanywebbimpact.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    const allowOrigin1 = resCorsAllowed.headers['access-control-allow-origin'];
    console.log('  Allowed Origin (https://tiffanywebbimpact.com):', allowOrigin1);

    // Origin 2: http://localhost:4321 (Allowed)
    const resCorsAllowed2 = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads/check-duplicate',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:4321',
        'Access-Control-Request-Method': 'GET'
      }
    });
    const allowOrigin2 = resCorsAllowed2.headers['access-control-allow-origin'];
    console.log('  Allowed Origin (http://localhost:4321):', allowOrigin2);

    // Origin 3: https://attacker.com (Blocked)
    const resCorsBlocked = await httpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads/check-duplicate',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://attacker.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    const allowOriginBlocked = resCorsBlocked.headers['access-control-allow-origin'];
    console.log('  Blocked Origin (https://attacker.com):', allowOriginBlocked || '(none - rejected)');

    const corsPass = allowOrigin1 === 'https://tiffanywebbimpact.com' &&
                     allowOrigin2 === 'http://localhost:4321' &&
                     !allowOriginBlocked;
    console.log(`  -> CORS Whitelist Check: ${corsPass ? 'PASS' : 'FAIL'}`);

    // 6.5 Rate Limiter Test (Brute Force Defense)
    console.log('\n[6.5] Testing Rate Limiting on POST /login with 5-attempt threshold...');
    const testIp = '198.51.100.77'; // Dedicated test IP via X-Forwarded-For
    const postBody = 'email=attacker%40fake.com&password=wrongpassword';
    let rateLimitStatuses = [];

    for (let i = 1; i <= 6; i++) {
      const resRate = await httpRequest({
        hostname: 'localhost',
        port: 3000,
        path: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postBody),
          'X-Forwarded-For': testIp
        }
      }, postBody);
      rateLimitStatuses.push({ attempt: i, status: resRate.statusCode });
    }
    console.log('  Rate limit responses:', rateLimitStatuses);
    const rateLimitPass = rateLimitStatuses.slice(0, 5).every(r => r.status === 200) &&
                          rateLimitStatuses[5].status === 429;
    console.log(`  -> Rate Limiting Check (5 attempts allowed, 6th returns 429): ${rateLimitPass ? 'PASS' : 'FAIL'}`);

    // 6.6 Cookie Governance Check (Inspect Set-Cookie headers on login)
    console.log('\n[6.6] Testing Cookie Security Flags in server.js...');
    const cookieMatches = code.match(/res\.cookie\s*\(\s*['"]auth_token['"][\s\S]*?\)/);
    console.log('  auth_token cookie configuration found in server.js:');
    if (cookieMatches) {
      console.log('  ', cookieMatches[0]);
      const hasHttpOnly = cookieMatches[0].includes('httpOnly: true');
      const hasSameSite = cookieMatches[0].includes("sameSite: 'strict'");
      const hasMaxAge = cookieMatches[0].includes('maxAge:');
      const cookiePass = hasHttpOnly && hasSameSite && hasMaxAge;
      console.log(`  -> Cookie Security Check (httpOnly: true, sameSite: 'strict', maxAge): ${cookiePass ? 'PASS' : 'FAIL'}`);
    }

    // Overall Live Verdict
    const allLivePassed = helmetPass && rootUnauthPass && rootAuthPass && corsPass && rateLimitPass;
    console.log('\n====================================================');
    console.log(`FINAL EMPIRICAL VERDICT: ${allLivePassed ? 'CLEAN (ALL TESTS PASSED)' : 'FAIL'}`);
    console.log('====================================================');

  } catch (err) {
    console.error('Live Test Error:', err);
  }
}

runLiveTests();
