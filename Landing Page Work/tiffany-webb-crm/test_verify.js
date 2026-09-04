// Quick verification test for security headers and notes API
const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body, location: res.headers.location }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    // Test 1: Root redirect
    const root = await get('/');
    console.log('✅ Root redirect:', root.status === 302 ? 'PASS' : 'FAIL', '→', root.location);
    
    // Test 2: Security headers
    const login = await get('/login');
    console.log('✅ X-Frame-Options:', login.headers['x-frame-options'] || 'MISSING');
    console.log('✅ X-Content-Type-Options:', login.headers['x-content-type-options'] || 'MISSING');
    console.log('✅ X-Powered-By:', login.headers['x-powered-by'] || 'REMOVED (good)');
    
    // Test 3: Notes GET API (should work without auth, returning data)
    const notes = await get('/api/leads/1/notes');
    console.log('✅ GET /api/leads/1/notes status:', notes.status);
    
    // Test 4: Title tag check
    console.log('✅ Login page contains Impact OS:', login.body.includes('Tiffany Webb Impact OS') ? 'PASS' : 'FAIL');
    console.log('✅ Login page has no CRM branding:', !login.body.includes('Tiffany Webb CRM') ? 'PASS' : 'FAIL');
    
    console.log('\n--- All basic checks complete ---');
  } catch (e) {
    console.error('Test error:', e.message);
  }
})();
