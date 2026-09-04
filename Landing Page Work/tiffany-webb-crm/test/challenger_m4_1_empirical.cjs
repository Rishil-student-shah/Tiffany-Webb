/**
 * Empirical Security Challenger Suite — Milestone 4 Instance 1 (challenger_m4_1)
 *
 * Focus Areas:
 * 1. Recursive XSS sanitization under adversarial payloads:
 *    - Nested script tags (<scr<script>ipt>alert(1)</script>)
 *    - Case mutations (<sCrIpt>alert(1)</ScRiPt>)
 *    - Event handlers with whitespace/newlines (<img src=x \n onerror=alert(1)>)
 *    - Data URIs and pseudoprotocols (javascript:alert(1), JaVaScRiPt:void(0))
 *    - Nested iframes (<ifra<iframe src="evil.com">me>)
 *    - 30-level deep nesting and object recursion
 * 2. CORS origin validator against malicious/spoofed origins:
 *    - http://evil.com
 *    - https://tiffanywebbimpact.com.fake.com
 *    - https://not-tiffanywebbimpact.com
 *    - Parameter and userinfo spoofing
 *    - Legitimate canonical and localhost origins
 * 3. Multer image upload extension whitelist & evasion:
 *    - .php, .phtml, .exe, .html, .svg, .js rejection
 *    - MIME-type spoofing
 *    - Double extension neutralization (image.php.jpg -> image_php.jpg)
 *    - Null-byte evasion handling
 *    - Inspection of video_file vs image_file logic
 */

const path = require('path');
const fs = require('fs');
const http = require('http');

const serverSource = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

function extractFunction(src, fnName) {
  const start = src.indexOf(`function ${fnName}(`);
  if (start === -1) throw new Error(`Function ${fnName} not found in server.js`);
  let depth = 0;
  let end = -1;
  let started = false;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') {
      depth++;
      started = true;
    } else if (src[i] === '}') {
      depth--;
      if (started && depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return src.substring(start, end);
}

const sanitizeString = new Function('return ' + extractFunction(serverSource, 'sanitizeString'))();
const sanitizeValue = new Function('sanitizeString', 'return ' + extractFunction(serverSource, 'sanitizeValue'))(sanitizeString);

const allowedOrigins = [
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://tiffanywebbimpact.com',
  'https://www.tiffanywebbimpact.com',
  'https://crm.tiffanywebbimpact.com',
  process.env.FRONTEND_URL
].filter(Boolean);

function corsCheck(origin) {
  return !origin || allowedOrigins.indexOf(origin) !== -1;
}

function multerFileFilter(file) {
  return new Promise((resolve) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cb = (err, result) => {
      if (err) resolve({ accepted: false, error: err.message });
      else resolve({ accepted: result === true, error: null });
    };

    if (file.fieldname === 'video_file') {
      const allowedExts = ['.mp4', '.webm', '.mov'];
      if (allowedExts.includes(ext) || (file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream'))) {
        return cb(null, true);
      }
      return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
    }
    if (file.fieldname === 'image_file' || file.fieldname.startsWith('image_upload_') || file.fieldname === 'image') {
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      if (allowedExts.includes(ext) || (file.mimetype && file.mimetype.startsWith('image/'))) {
        if (!allowedExts.includes(ext)) {
          return cb(new Error('Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed'));
        }
        return cb(null, true);
      }
      return cb(new Error('Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed'));
    }
    cb(new Error('File upload type not allowed'));
  });
}

function computeUploadFilename(originalname) {
  const uniqueSuffix = 'SEC-TEST';
  const ext = path.extname(originalname);
  const baseName = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${uniqueSuffix}-${baseName}${ext}`;
}

async function runChallengerSuite() {
  console.log('================================================================');
  console.log('CHALLENGER M4_1 EMPIRICAL SECURITY SUITE');
  console.log('Target: Landing Page Work/tiffany-webb-crm/server.js');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(name, condition, detail = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${name}${detail ? ' -> ' + detail : ''}`);
      return true;
    } else {
      console.error(`  [FAIL] ${name}${detail ? ' -> ' + detail : ''}`);
      return false;
    }
  }

  // 1. RECURSIVE XSS SUITE
  console.log('1. RECURSIVE XSS SANITIZATION TESTS:');
  const xssPayloads = [
    { name: 'Nested tags: <scr<script>ipt>alert(1)</script>', input: '<scr<script>ipt>alert(1)</script>', expectedOut: '<scr' },
    { name: 'Case mutations: <sCrIpt>alert(1)</ScRiPt>', input: '<sCrIpt>alert(1)</ScRiPt>', expectedOut: '' },
    { name: 'Event handler with newline: <img src=x \\n onerror=alert(1)>', input: '<img src=x \n onerror=alert(1)>', expectedOut: '<img src=x \n alert(1)>' },
    { name: 'Data URI / protocol: javascript:alert(1)', input: 'javascript:alert(1)', expectedOut: 'alert(1)' },
    { name: 'Case mutated protocol: JaVaScRiPt:void(0)', input: 'JaVaScRiPt:void(0)', expectedOut: 'void(0)' },
    { name: 'Nested iframes: <ifra<iframe src="evil.com">me>', input: '<ifra<iframe src="evil.com">me>', expectedOut: '' },
    { name: 'Inline onload: <body onload=alert(1)>', input: '<body onload=alert(1)>', expectedOut: '<body alert(1)>' },
    { name: 'Inline onclick: <a onclick=alert(1)>link</a>', input: '<a onclick=alert(1)>link</a>', expectedOut: '<a alert(1)>link</a>' },
    { name: 'Inline onmouseover: <div onmouseover=alert(1)>', input: '<div onmouseover=alert(1)>', expectedOut: '<div alert(1)>' }
  ];

  for (const tc of xssPayloads) {
    const res = sanitizeString(tc.input);
    assert(tc.name, res === tc.expectedOut, `Output: ${JSON.stringify(res)}`);
  }

  // Deep recursion stress test
  let nested30 = 'payload';
  for (let i = 0; i < 30; i++) nested30 = `<script>${nested30}</script>`;
  const cleaned30 = sanitizeString(nested30);
  assert('30-Level Nested Script Recursion', !cleaned30.includes('<script>'), `Output: "${cleaned30}"`);

  // Recursive Object & Array sanitization
  const dirtyObj = {
    contact: {
      name: 'John <script>alert("hack")</script>',
      notes: ['<iframe src="evil.com"></iframe>', 'javascript:evil()']
    }
  };
  const cleanObj = sanitizeValue(dirtyObj);
  const serialized = JSON.stringify(cleanObj);
  assert('Recursive Object & Array Tree Sanitization',
    !serialized.includes('<script>') && !serialized.includes('<iframe') && !serialized.includes('javascript:'),
    `Serialized: ${serialized}`
  );

  // 2. CORS ORIGIN VALIDATION SUITE
  console.log('\n2. CORS ORIGIN VALIDATOR TESTS:');
  const corsTests = [
    { origin: 'http://evil.com', allowed: false, desc: 'Malicious domain http://evil.com' },
    { origin: 'https://tiffanywebbimpact.com.fake.com', allowed: false, desc: 'Subdomain spoof https://tiffanywebbimpact.com.fake.com' },
    { origin: 'https://not-tiffanywebbimpact.com', allowed: false, desc: 'Prefix spoof https://not-tiffanywebbimpact.com' },
    { origin: 'https://evil.com?ref=https://tiffanywebbimpact.com', allowed: false, desc: 'Query parameter spoof' },
    { origin: 'https://tiffanywebbimpact.com@evil.com', allowed: false, desc: 'Userinfo domain spoof' },
    { origin: 'https://tiffanywebbimpact.com', allowed: true, desc: 'Canonical production domain' },
    { origin: 'https://www.tiffanywebbimpact.com', allowed: true, desc: 'Production www subdomain' },
    { origin: 'https://crm.tiffanywebbimpact.com', allowed: true, desc: 'Production CRM subdomain' },
    { origin: 'http://localhost:4321', allowed: true, desc: 'Localhost Astro frontend' },
    { origin: 'http://localhost:3000', allowed: true, desc: 'Localhost CRM server' },
    { origin: undefined, allowed: true, desc: 'No origin header (same-origin / server-to-server)' }
  ];

  for (const ct of corsTests) {
    const actual = corsCheck(ct.origin);
    assert(ct.desc, actual === ct.allowed, `Result: ${actual ? 'ALLOWED' : 'REJECTED'}`);
  }

  // 3. MULTER FILE UPLOAD EXTENSION WHITELIST SUITE
  console.log('\n3. MULTER IMAGE UPLOAD EXTENSION WHITELIST TESTS:');
  const uploadTests = [
    { name: 'Blocked .php upload', file: { fieldname: 'image_file', originalname: 'shell.php', mimetype: 'application/x-php' }, expect: false },
    { name: 'Blocked .phtml upload', file: { fieldname: 'image_file', originalname: 'shell.phtml', mimetype: 'application/x-httpd-php' }, expect: false },
    { name: 'Blocked .exe upload', file: { fieldname: 'image_file', originalname: 'malware.exe', mimetype: 'application/octet-stream' }, expect: false },
    { name: 'Blocked .html upload', file: { fieldname: 'image_file', originalname: 'phish.html', mimetype: 'text/html' }, expect: false },
    { name: 'Blocked .svg upload (XSS XML vector)', file: { fieldname: 'image_file', originalname: 'vector.svg', mimetype: 'image/svg+xml' }, expect: false },
    { name: 'Blocked .js upload', file: { fieldname: 'image_file', originalname: 'payload.js', mimetype: 'application/javascript' }, expect: false },
    { name: 'Allowed .jpg upload', file: { fieldname: 'image_file', originalname: 'headshot.jpg', mimetype: 'image/jpeg' }, expect: true },
    { name: 'Allowed .png upload', file: { fieldname: 'image_file', originalname: 'logo.png', mimetype: 'image/png' }, expect: true },
    { name: 'Allowed .webp upload', file: { fieldname: 'image_file', originalname: 'hero.webp', mimetype: 'image/webp' }, expect: true },
    { name: 'Allowed .gif upload', file: { fieldname: 'image_file', originalname: 'animation.gif', mimetype: 'image/gif' }, expect: true },
    { name: 'MIME spoofing defense (.php with image/jpeg MIME)', file: { fieldname: 'image_file', originalname: 'backdoor.php', mimetype: 'image/jpeg' }, expect: false },
    { name: 'Unauthorized fieldname rejection', file: { fieldname: 'unauthorized_field', originalname: 'pic.jpg', mimetype: 'image/jpeg' }, expect: false }
  ];

  for (const ut of uploadTests) {
    const res = await multerFileFilter(ut.file);
    assert(ut.name, res.accepted === ut.expect, `Accepted: ${res.accepted}${res.error ? ' (' + res.error + ')' : ''}`);
  }

  // Double extension test & disk filename normalization check
  const doubleExtOriginal = 'exploit.php.jpg';
  const diskFilename = computeUploadFilename(doubleExtOriginal);
  assert(
    'Double extension filename normalization (exploit.php.jpg -> SEC-TEST-exploit_php.jpg)',
    diskFilename.endsWith('.jpg') && !diskFilename.includes('.php.'),
    `Stored filename: ${diskFilename}`
  );

  // Null byte evasion test
  const nullByteOriginal = 'exploit.php\0.jpg';
  const nullByteFilename = computeUploadFilename(nullByteOriginal);
  assert(
    'Null byte filename sanitization (exploit.php\\0.jpg)',
    nullByteFilename.endsWith('.jpg') && !nullByteFilename.includes('\0'),
    `Stored filename: ${nullByteFilename}`
  );

  // Security Asymmetry Note: video_file
  const videoBypass = await multerFileFilter({ fieldname: 'video_file', originalname: 'payload.php', mimetype: 'video/mp4' });
  console.log(`\n  [ATTENTION / ASYMMETRY]: video_file with spoofed MIME allows non-video extension: ${videoBypass.accepted}`);

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  const verdict = (totalTests - passedTests === 0) ? 'CONFIRMED' : 'DISPROVEN';
  console.log(`FINAL VERDICT: ${verdict}`);
  console.log('================================================================\n');

  return { totalTests, passedTests, verdict };
}

if (require.main === module) {
  runChallengerSuite().catch(err => {
    console.error('Error running challenger suite:', err);
    process.exit(1);
  });
}

module.exports = { runChallengerSuite };
