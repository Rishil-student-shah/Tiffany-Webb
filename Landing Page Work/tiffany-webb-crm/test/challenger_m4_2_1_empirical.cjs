/**
 * Empirical Adversarial Challenger Test Suite — Milestone 4 Remediation (challenger_m4_2_1)
 *
 * Requirements Tested:
 * 1. Rate Limiting on POST /login:
 *    - 6 rapid wrong credential attempts: 1-5 return 401, 6th returns 429 Too Many Requests.
 *    - Valid login redirects with HTTP 302 and is not blocked.
 *    - Valid login does not increment failed counter (skipSuccessfulRequests: true).
 * 2. Multer upload filter:
 *    - .exe, .php, .html, .svg with application/octet-stream under video_file are rejected.
 *    - Disguised MIME / extension attacks rejected.
 *    - Valid .mp4, .webm, .mov with proper MIME types allowed.
 * 3. Base64 upload filter:
 *    - saveBase64Image rejects SVG, HTML, PHP, and non-raster formats (returns null).
 *    - Valid PNG, JPEG, WebP, GIF accepted.
 *    - End-to-end CMS route submission of Base64 SVG verified to store null in DB.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = 'http://127.0.0.1:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'tiffany-webb-crm-secret-key-2025';

// Database pool for verification and cleanup
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '@rishil8124shah',
  database: process.env.DB_NAME || 'tiffany_crm',
  waitForConnections: true,
  connectionLimit: 5
});

// Helper: HTTP request wrapper
function sendRequest({ method = 'GET', urlPath = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? (Buffer.isBuffer(body) ? body : Buffer.from(body)) : null;
    const reqHeaders = { ...headers };
    if (postData && !reqHeaders['Content-Length']) {
      reqHeaders['Content-Length'] = postData.length;
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: urlPath,
      method,
      headers: reqHeaders
    }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const rawBody = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try {
          json = JSON.parse(rawBody);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: rawBody,
          json
        });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Multipart builder helper
function buildMultipart({ fields = {}, files = [] }) {
  const boundary = '----ChallengerM421Boundary' + Math.random().toString(16).substring(2);
  const crlf = '\r\n';
  const parts = [];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(Buffer.from(
      `--${boundary}${crlf}Content-Disposition: form-data; name="${key}"${crlf}${crlf}${value}${crlf}`
    ));
  }

  for (const file of files) {
    const content = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content);
    parts.push(Buffer.from(
      `--${boundary}${crlf}Content-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"${crlf}` +
      `Content-Type: ${file.mimetype}${crlf}${crlf}`
    ));
    parts.push(content);
    parts.push(Buffer.from(crlf));
  }

  parts.push(Buffer.from(`--${boundary}--${crlf}`));
  const body = Buffer.concat(parts);

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body
  };
}

// Extract saveBase64Image from server.js for component testing
const serverSource = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
const saveBase64Match = serverSource.match(/function saveBase64Image\s*\([\s\S]*?\n\}/);
if (!saveBase64Match) {
  throw new Error('Could not extract saveBase64Image function from server.js');
}
// Create an isolated runner for saveBase64Image with local __dirname context
const saveBase64Function = new Function('dataUrl', 'fs', 'path', '__dirname', `
  ${saveBase64Match[0]}
  return saveBase64Image(dataUrl);
`);

function testSaveBase64Image(dataUrl) {
  return saveBase64Function(dataUrl, fs, path, path.join(__dirname, '..'));
}

// Test Runner and Assertions
const results = [];
function recordTest(suite, id, description, passed, details = {}) {
  results.push({ suite, id, description, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  [${mark}] ${id}: ${description}`);
  if (!passed || process.env.VERBOSE) {
    console.log('         Details:', JSON.stringify(details, null, 2));
  }
}

async function runAllTests() {
  console.log('========================================================================');
  console.log('   CHALLENGER M4.2.1 EMPIRICAL ADVERSARIAL VERIFICATION HARNESS');
  console.log('========================================================================\n');

  // Authenticated token for CMS tests
  const adminToken = jwt.sign(
    { id: 1, email: 'admin@tiffanywebb.com', name: 'Admin User', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // ---------------------------------------------------------------------------
  // SUITE 1: RATE LIMITING ON POST /login
  // ---------------------------------------------------------------------------
  console.log('▶ SUITE 1: Rate Limiting on POST /login');

  const subnet = Math.floor(Math.random() * 200) + 10;
  const bruteIp1 = `198.51.${subnet}.1`;
  const validIp = `198.51.${subnet}.2`;
  const mixedIp = `198.51.${subnet}.3`;
  const boundaryIp = `198.51.${subnet}.4`;
  const freshIp = `198.51.${subnet}.5`;

  // Test 1.1 - 1.3: 6 rapid wrong credential attempts from IP bruteIp1
  const attempts1 = [];

  for (let i = 1; i <= 7; i++) {
    const postBody = `email=wrong_${i}@test.com&password=BadPassword_${i}!`;
    const res = await sendRequest({
      method: 'POST',
      urlPath: '/login',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Forwarded-For': bruteIp1
      },
      body: postBody
    });
    attempts1.push({ attempt: i, status: res.statusCode, bodySnippet: res.body.substring(0, 50) });
  }

  // Verify attempts 1 through 5 return 401
  const first5All401 = attempts1.slice(0, 5).every(a => a.status === 401);
  recordTest(
    'RateLimiting',
    'RL-1.1',
    'Attempts 1 through 5 with wrong credentials return HTTP 401',
    first5All401,
    { attempts: attempts1.slice(0, 5) }
  );

  // Verify attempt 6 returns 429 Too Many Requests
  const attempt6Is429 = attempts1[5].status === 429;
  recordTest(
    'RateLimiting',
    'RL-1.2',
    'Attempt 6 returns HTTP 429 Too Many Requests',
    attempt6Is429,
    { attempt6: attempts1[5] }
  );

  // Verify attempt 7 returns 429 Too Many Requests
  const attempt7Is429 = attempts1[6].status === 429;
  recordTest(
    'RateLimiting',
    'RL-1.3',
    'Subsequent attempt 7 continues returning HTTP 429',
    attempt7Is429,
    { attempt7: attempts1[6] }
  );

  // Test 1.4: Valid login from fresh IP returns HTTP 302 and is not blocked
  const validPostBody = `email=${encodeURIComponent('admin@tiffanywebb.com')}&password=${encodeURIComponent('password123')}`;
  const validRes = await sendRequest({
    method: 'POST',
    urlPath: '/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-For': validIp
    },
    body: validPostBody
  });

  const validSuccess = validRes.statusCode === 302 &&
                       validRes.headers.location === '/dashboard' &&
                       Array.isArray(validRes.headers['set-cookie']) &&
                       validRes.headers['set-cookie'].some(c => c.includes('auth_token'));

  recordTest(
    'RateLimiting',
    'RL-1.4',
    'Valid login redirects with HTTP 302 to /dashboard and sets auth_token cookie',
    validSuccess,
    {
      statusCode: validRes.statusCode,
      location: validRes.headers.location,
      cookies: validRes.headers['set-cookie']
    }
  );

  // Test 1.5: Valid login does not increment failed counter (skipSuccessfulRequests: true)
  const mixedAttempts = [];

  // Send 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    const res = await sendRequest({
      method: 'POST',
      urlPath: '/login',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Forwarded-For': mixedIp
      },
      body: `email=mixed_${i}@test.com&password=wrong`
    });
    mixedAttempts.push({ step: `failed_${i}`, status: res.statusCode });
  }

  // Send 1 valid login
  const mixedValidRes = await sendRequest({
    method: 'POST',
    urlPath: '/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-For': mixedIp
    },
    body: validPostBody
  });
  mixedAttempts.push({ step: 'valid_login', status: mixedValidRes.statusCode });

  // Send 5th failed attempt (should still be 401 because valid login was exempted)
  const failed5Res = await sendRequest({
    method: 'POST',
    urlPath: '/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-For': mixedIp
    },
    body: 'email=mixed_5@test.com&password=wrong'
  });
  mixedAttempts.push({ step: 'failed_5th_after_valid', status: failed5Res.statusCode });

  // Send 6th failed attempt (should trigger 429)
  const failed6Res = await sendRequest({
    method: 'POST',
    urlPath: '/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-For': mixedIp
    },
    body: 'email=mixed_6@test.com&password=wrong'
  });
  mixedAttempts.push({ step: 'failed_6th_after_valid', status: failed6Res.statusCode });

  const skipSuccessfulWorks = mixedAttempts[4].status === 302 &&
                              mixedAttempts[5].status === 401 &&
                              mixedAttempts[6].status === 429;

  recordTest(
    'RateLimiting',
    'RL-1.5',
    'skipSuccessfulRequests: true works correctly (valid login is not counted toward 5-attempt limit)',
    skipSuccessfulWorks,
    { mixedAttempts }
  );

  // Test 1.6: Boundary test: empty credentials return 400 and count towards rate limit
  const emptyRes = await sendRequest({
    method: 'POST',
    urlPath: '/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-For': boundaryIp
    },
    body: 'email=&password='
  });
  recordTest(
    'RateLimiting',
    'RL-1.6',
    'Empty credentials return HTTP 400 Bad Request',
    emptyRes.statusCode === 400,
    { statusCode: emptyRes.statusCode }
  );

  // Test 1.7: IP Isolation: while bruteIp1 is blocked (429), an untargeted IP is not blocked
  const freshRes = await sendRequest({
    method: 'POST',
    urlPath: '/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-For': freshIp
    },
    body: 'email=someone@test.com&password=wrong'
  });
  const blockedCheckRes = await sendRequest({
    method: 'POST',
    urlPath: '/login',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Forwarded-For': bruteIp1
    },
    body: 'email=someone@test.com&password=wrong'
  });

  const ipIsolationPass = freshRes.statusCode === 401 && blockedCheckRes.statusCode === 429;
  recordTest(
    'RateLimiting',
    'RL-1.7',
    'IP isolation: Throttling strictly isolates the offending IP without blocking other clients',
    ipIsolationPass,
    { freshIpStatus: freshRes.statusCode, blockedIpStatus: blockedCheckRes.statusCode }
  );

  console.log('\n▶ SUITE 2: Multer Video File Filter');

  // ---------------------------------------------------------------------------
  // SUITE 2: MULTER VIDEO FILE FILTER
  // ---------------------------------------------------------------------------

  // Test 2.1: Upload .exe with application/octet-stream under video_file
  const exeMultipart = buildMultipart({
    fields: { title: 'Adversarial Exe Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'exploit.exe',
      mimetype: 'application/octet-stream',
      content: Buffer.from('MZ\x90\x00\x03\x00\x00\x00FAKE_WINDOWS_PE_EXECUTABLE')
    }]
  });
  const exeRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': exeMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`,
      'Accept': 'application/json'
    },
    body: exeMultipart.body
  });
  const exeBlocked = exeRes.statusCode === 400 &&
                     exeRes.json &&
                     exeRes.json.error &&
                     exeRes.json.error.includes('Only .mp4, .webm, and .mov video files are allowed');
  recordTest(
    'MulterFilter',
    'MUL-2.1',
    'Reject .exe with application/octet-stream under video_file (HTTP 400)',
    exeBlocked,
    { statusCode: exeRes.statusCode, response: exeRes.json }
  );

  // Test 2.2: Upload .php with application/octet-stream under video_file
  const phpMultipart = buildMultipart({
    fields: { title: 'Adversarial PHP Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'shell.php',
      mimetype: 'application/octet-stream',
      content: '<?php system($_GET["c"]); ?>'
    }]
  });
  const phpRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': phpMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`,
      'Accept': 'application/json'
    },
    body: phpMultipart.body
  });
  const phpBlocked = phpRes.statusCode === 400 &&
                     phpRes.json &&
                     phpRes.json.error &&
                     phpRes.json.error.includes('Only .mp4, .webm, and .mov video files are allowed');
  recordTest(
    'MulterFilter',
    'MUL-2.2',
    'Reject .php with application/octet-stream under video_file (HTTP 400)',
    phpBlocked,
    { statusCode: phpRes.statusCode, response: phpRes.json }
  );

  // Test 2.3: Upload .html with application/octet-stream under video_file
  const htmlMultipart = buildMultipart({
    fields: { title: 'Adversarial HTML Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'phishing.html',
      mimetype: 'application/octet-stream',
      content: '<script>alert("XSS")</script>'
    }]
  });
  const htmlRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': htmlMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`,
      'Accept': 'application/json'
    },
    body: htmlMultipart.body
  });
  const htmlBlocked = htmlRes.statusCode === 400 &&
                      htmlRes.json &&
                      htmlRes.json.error &&
                      htmlRes.json.error.includes('Only .mp4, .webm, and .mov video files are allowed');
  recordTest(
    'MulterFilter',
    'MUL-2.3',
    'Reject .html with application/octet-stream under video_file (HTTP 400)',
    htmlBlocked,
    { statusCode: htmlRes.statusCode, response: htmlRes.json }
  );

  // Test 2.4: Upload .svg with application/octet-stream under video_file
  const svgMultipart = buildMultipart({
    fields: { title: 'Adversarial SVG Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'vector.svg',
      mimetype: 'application/octet-stream',
      content: '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    }]
  });
  const svgRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': svgMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`,
      'Accept': 'application/json'
    },
    body: svgMultipart.body
  });
  const svgBlocked = svgRes.statusCode === 400 &&
                     svgRes.json &&
                     svgRes.json.error &&
                     svgRes.json.error.includes('Only .mp4, .webm, and .mov video files are allowed');
  recordTest(
    'MulterFilter',
    'MUL-2.4',
    'Reject .svg with application/octet-stream under video_file (HTTP 400)',
    svgBlocked,
    { statusCode: svgRes.statusCode, response: svgRes.json }
  );

  // Test 2.5: Disguised MIME: .exe with video/mp4 MIME type
  const disguisedMimeMultipart = buildMultipart({
    fields: { title: 'Disguised MIME Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'trojan.exe',
      mimetype: 'video/mp4',
      content: 'MZ_FAKE_PE'
    }]
  });
  const disguisedMimeRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': disguisedMimeMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`,
      'Accept': 'application/json'
    },
    body: disguisedMimeMultipart.body
  });
  const disguisedMimeBlocked = disguisedMimeRes.statusCode === 400 &&
                               disguisedMimeRes.json &&
                               disguisedMimeRes.json.error &&
                               disguisedMimeRes.json.error.includes('Only .mp4, .webm, and .mov video files are allowed');
  recordTest(
    'MulterFilter',
    'MUL-2.5',
    'Reject disguised MIME: .exe with spoofed video/mp4 MIME type (HTTP 400)',
    disguisedMimeBlocked,
    { statusCode: disguisedMimeRes.statusCode, response: disguisedMimeRes.json }
  );

  // Test 2.6: Disguised Extension: .mp4 with application/octet-stream MIME type
  const disguisedExtMultipart = buildMultipart({
    fields: { title: 'Disguised Ext Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'sample.mp4',
      mimetype: 'application/octet-stream',
      content: 'FAKE_VIDEO_PAYLOAD'
    }]
  });
  const disguisedExtRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': disguisedExtMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`,
      'Accept': 'application/json'
    },
    body: disguisedExtMultipart.body
  });
  const disguisedExtBlocked = disguisedExtRes.statusCode === 400 &&
                              disguisedExtRes.json &&
                              disguisedExtRes.json.error &&
                              disguisedExtRes.json.error.includes('Only .mp4, .webm, and .mov video files are allowed');
  recordTest(
    'MulterFilter',
    'MUL-2.6',
    'Reject disguised Extension: .mp4 with disallowed application/octet-stream MIME (HTTP 400)',
    disguisedExtBlocked,
    { statusCode: disguisedExtRes.statusCode, response: disguisedExtRes.json }
  );

  // Test 2.7: Double extension exploit: sample.php.mp4 with application/x-php MIME
  const doubleExtMultipart = buildMultipart({
    fields: { title: 'Double Ext Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'sample.php.mp4',
      mimetype: 'application/x-php',
      content: '<?php echo "hi"; ?>'
    }]
  });
  const doubleExtRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': doubleExtMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`,
      'Accept': 'application/json'
    },
    body: doubleExtMultipart.body
  });
  const doubleExtBlocked = doubleExtRes.statusCode === 400;
  recordTest(
    'MulterFilter',
    'MUL-2.7',
    'Reject double-extension exploit: sample.php.mp4 with invalid MIME (HTTP 400)',
    doubleExtBlocked,
    { statusCode: doubleExtRes.statusCode }
  );

  // Test 2.8: Upload valid .mp4 with video/mp4 MIME type
  const validMp4Multipart = buildMultipart({
    fields: { title: 'Valid MP4 Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'test_clip.mp4',
      mimetype: 'video/mp4',
      content: Buffer.from('FAKE_VALID_MP4_BINARY_DATA_FOR_CHALLENGER')
    }]
  });
  const validMp4Res = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': validMp4Multipart.contentType,
      'Cookie': `auth_token=${adminToken}`
    },
    body: validMp4Multipart.body
  });
  // Valid submission should succeed and redirect (302) to /cms/home?success=Item+added+successfully
  const validMp4Allowed = validMp4Res.statusCode === 302 &&
                          validMp4Res.headers.location &&
                          validMp4Res.headers.location.includes('success=Item+added+successfully');
  recordTest(
    'MulterFilter',
    'MUL-2.8',
    'Accept valid .mp4 with video/mp4 MIME type (redirect 302 on success)',
    validMp4Allowed,
    { statusCode: validMp4Res.statusCode, location: validMp4Res.headers.location }
  );

  // Cleanup inserted test record and uploaded video file
  try {
    const [rows] = await pool.query("SELECT id, link_url FROM website_collections WHERE title = 'Valid MP4 Test'");
    for (const r of rows) {
      if (r.link_url) {
        const filePath = path.join(__dirname, '../../tiffany-webb-astro/public', r.link_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await pool.query('DELETE FROM website_collections WHERE id = ?', [r.id]);
    }
  } catch (cleanErr) {
    console.warn('Cleanup warning for test 2.8:', cleanErr.message);
  }

  // Test 2.9: Upload valid .webm with video/webm MIME type
  const validWebmMultipart = buildMultipart({
    fields: { title: 'Valid WebM Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'test_clip.webm',
      mimetype: 'video/webm',
      content: Buffer.from('FAKE_VALID_WEBM_DATA')
    }]
  });
  const validWebmRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': validWebmMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`
    },
    body: validWebmMultipart.body
  });
  const validWebmAllowed = validWebmRes.statusCode === 302 &&
                           validWebmRes.headers.location &&
                           validWebmRes.headers.location.includes('success=Item+added+successfully');
  recordTest(
    'MulterFilter',
    'MUL-2.9',
    'Accept valid .webm with video/webm MIME type',
    validWebmAllowed,
    { statusCode: validWebmRes.statusCode, location: validWebmRes.headers.location }
  );

  // Cleanup inserted test record and uploaded video file
  try {
    const [rows] = await pool.query("SELECT id, link_url FROM website_collections WHERE title = 'Valid WebM Test'");
    for (const r of rows) {
      if (r.link_url) {
        const filePath = path.join(__dirname, '../../tiffany-webb-astro/public', r.link_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await pool.query('DELETE FROM website_collections WHERE id = ?', [r.id]);
    }
  } catch (cleanErr) {
    console.warn('Cleanup warning for test 2.9:', cleanErr.message);
  }

  // Test 2.10: Upload valid .mov with video/quicktime MIME type
  const validMovMultipart = buildMultipart({
    fields: { title: 'Valid MOV Test' },
    files: [{
      fieldname: 'video_file',
      filename: 'test_clip.mov',
      mimetype: 'video/quicktime',
      content: Buffer.from('FAKE_VALID_MOV_DATA')
    }]
  });
  const validMovRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': validMovMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`
    },
    body: validMovMultipart.body
  });
  const validMovAllowed = validMovRes.statusCode === 302 &&
                          validMovRes.headers.location &&
                          validMovRes.headers.location.includes('success=Item+added+successfully');
  recordTest(
    'MulterFilter',
    'MUL-2.10',
    'Accept valid .mov with video/quicktime MIME type',
    validMovAllowed,
    { statusCode: validMovRes.statusCode, location: validMovRes.headers.location }
  );

  // Cleanup inserted test record and uploaded video file
  try {
    const [rows] = await pool.query("SELECT id, link_url FROM website_collections WHERE title = 'Valid MOV Test'");
    for (const r of rows) {
      if (r.link_url) {
        const filePath = path.join(__dirname, '../../tiffany-webb-astro/public', r.link_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await pool.query('DELETE FROM website_collections WHERE id = ?', [r.id]);
    }
  } catch (cleanErr) {
    console.warn('Cleanup warning for test 2.10:', cleanErr.message);
  }

  console.log('\n▶ SUITE 3: Base64 Upload Security');

  // ---------------------------------------------------------------------------
  // SUITE 3: BASE64 UPLOAD SECURITY
  // ---------------------------------------------------------------------------

  // Test 3.1: SVG payload -> rejected (null)
  const svgPayload = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzY3JpcHQ+YWxlcnQoMSk8L3NjcmlwdD48L3N2Zz4=';
  const svgResult = testSaveBase64Image(svgPayload);
  recordTest(
    'Base64Filter',
    'B64-3.1',
    'Reject Base64 image/svg+xml payload (returns null)',
    svgResult === null,
    { result: svgResult }
  );

  // Test 3.2: HTML payload -> rejected (null)
  const htmlPayload = 'data:image/html;base64,PGh0bWw+PGJvZHk+PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0PjwvYm9keT48L2h0bWw+';
  const htmlResult = testSaveBase64Image(htmlPayload);
  recordTest(
    'Base64Filter',
    'B64-3.2',
    'Reject Base64 image/html payload (returns null)',
    htmlResult === null,
    { result: htmlResult }
  );

  // Test 3.3: PHP payload -> rejected (null)
  const phpPayload = 'data:image/php;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbcmdKTsgPz4=';
  const phpResult = testSaveBase64Image(phpPayload);
  recordTest(
    'Base64Filter',
    'B64-3.3',
    'Reject Base64 image/php payload (returns null)',
    phpResult === null,
    { result: phpResult }
  );

  // Test 3.4: Disallowed subtype image/x-msdos-program -> rejected (null)
  const exePayload = 'data:image/x-msdos-program;base64,TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAA=';
  const exeResult = testSaveBase64Image(exePayload);
  recordTest(
    'Base64Filter',
    'B64-3.4',
    'Reject Base64 image/x-msdos-program payload (returns null)',
    exeResult === null,
    { result: exeResult }
  );

  // Test 3.5: Empty buffer payload -> rejected (null)
  const emptyPayload = 'data:image/png;base64,';
  const emptyResult = testSaveBase64Image(emptyPayload);
  recordTest(
    'Base64Filter',
    'B64-3.5',
    'Reject Base64 empty image payload (returns null)',
    emptyResult === null,
    { result: emptyResult }
  );

  // Test 3.6: Oversized payload (> 10MB) -> rejected (null)
  const bigBuffer = Buffer.alloc(11 * 1024 * 1024, 65); // 11MB
  const bigPayload = `data:image/png;base64,${bigBuffer.toString('base64')}`;
  const bigResult = testSaveBase64Image(bigPayload);
  recordTest(
    'Base64Filter',
    'B64-3.6',
    'Reject oversized Base64 image payload > 10MB (returns null)',
    bigResult === null,
    { result: bigResult }
  );

  // Test 3.7: Malformed base64 header -> rejected (null)
  const malformedPayload = 'data:image/png;notbase64,@@@@';
  const malformedResult = testSaveBase64Image(malformedPayload);
  recordTest(
    'Base64Filter',
    'B64-3.7',
    'Reject malformed Base64 header (returns null)',
    malformedResult === null,
    { result: malformedResult }
  );

  // Test 3.8: Valid PNG payload -> returns /uploads/[...].png
  const validPngPayload = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const pngResult = testSaveBase64Image(validPngPayload);
  let pngFileCreated = false;
  if (pngResult && pngResult.startsWith('/uploads/') && pngResult.endsWith('.png')) {
    const filePath = path.join(__dirname, '../../tiffany-webb-astro/public', pngResult);
    if (fs.existsSync(filePath)) {
      pngFileCreated = true;
      fs.unlinkSync(filePath); // clean up
    }
  }
  recordTest(
    'Base64Filter',
    'B64-3.8',
    'Allow valid PNG Base64 and write .png file',
    pngFileCreated,
    { result: pngResult, fileCreated: pngFileCreated }
  );

  // Test 3.9: Valid JPEG payload -> returns /uploads/[...].jpg
  // Minimal valid 1x1 JPEG in Base64
  const validJpegPayload = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  const jpegResult = testSaveBase64Image(validJpegPayload);
  let jpegFileCreated = false;
  if (jpegResult && jpegResult.startsWith('/uploads/') && jpegResult.endsWith('.jpg')) {
    const filePath = path.join(__dirname, '../../tiffany-webb-astro/public', jpegResult);
    if (fs.existsSync(filePath)) {
      jpegFileCreated = true;
      fs.unlinkSync(filePath); // clean up
    }
  }
  recordTest(
    'Base64Filter',
    'B64-3.9',
    'Allow valid JPEG Base64 and write .jpg file',
    jpegFileCreated,
    { result: jpegResult, fileCreated: jpegFileCreated }
  );

  // Test 3.10: Valid WebP payload -> returns /uploads/[...].webp
  const validWebpPayload = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  const webpResult = testSaveBase64Image(validWebpPayload);
  let webpFileCreated = false;
  if (webpResult && webpResult.startsWith('/uploads/') && webpResult.endsWith('.webp')) {
    const filePath = path.join(__dirname, '../../tiffany-webb-astro/public', webpResult);
    if (fs.existsSync(filePath)) {
      webpFileCreated = true;
      fs.unlinkSync(filePath); // clean up
    }
  }
  recordTest(
    'Base64Filter',
    'B64-3.10',
    'Allow valid WebP Base64 and write .webp file',
    webpFileCreated,
    { result: webpResult, fileCreated: webpFileCreated }
  );

  // Test 3.11: Valid GIF payload -> returns /uploads/[...].gif
  const validGifPayload = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const gifResult = testSaveBase64Image(validGifPayload);
  let gifFileCreated = false;
  if (gifResult && gifResult.startsWith('/uploads/') && gifResult.endsWith('.gif')) {
    const filePath = path.join(__dirname, '../../tiffany-webb-astro/public', gifResult);
    if (fs.existsSync(filePath)) {
      gifFileCreated = true;
      fs.unlinkSync(filePath); // clean up
    }
  }
  recordTest(
    'Base64Filter',
    'B64-3.11',
    'Allow valid GIF Base64 and write .gif file',
    gifFileCreated,
    { result: gifResult, fileCreated: gifFileCreated }
  );

  // Test 3.12: End-to-end CMS route submission with Base64 SVG in image_url
  const e2eSvgMultipart = buildMultipart({
    fields: {
      title: 'E2E Base64 SVG Test',
      image_url: svgPayload
    }
  });
  const e2eSvgRes = await sendRequest({
    method: 'POST',
    urlPath: '/cms/home/collection/video_reels/new',
    headers: {
      'Content-Type': e2eSvgMultipart.contentType,
      'Cookie': `auth_token=${adminToken}`
    },
    body: e2eSvgMultipart.body
  });

  // Query database to verify what was stored in image_url
  const [e2eRows] = await pool.query("SELECT id, image_url FROM website_collections WHERE title = 'E2E Base64 SVG Test'");
  let e2ePass = false;
  let storedImageUrl = null;
  if (e2eRows.length > 0) {
    storedImageUrl = e2eRows[0].image_url;
    // Because saveBase64Image returned null for SVG, storedImageUrl must be NULL
    e2ePass = storedImageUrl === null;
    await pool.query('DELETE FROM website_collections WHERE id = ?', [e2eRows[0].id]);
  }

  recordTest(
    'Base64Filter',
    'B64-3.12',
    'End-to-end CMS submission: Base64 SVG in image_url is neutralized to NULL in database',
    e2ePass,
    { storedImageUrl, statusCode: e2eSvgRes.statusCode }
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('                          TEST RESULTS SUMMARY');
  console.log('========================================================================');

  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log(`Total Tests Run  : ${total}`);
  console.log(`Passed           : ${passed}`);
  console.log(`Failed           : ${failed}`);
  console.log(`Overall Verdict  : ${failed === 0 ? 'CONFIRMED' : 'DISPROVEN'}`);
  console.log('========================================================================\n');

  await pool.end();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(async (err) => {
  console.error('Fatal test runner error:', err);
  try { await pool.end(); } catch (_) {}
  process.exit(1);
});
