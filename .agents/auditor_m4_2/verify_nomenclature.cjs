const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/views');
const ejsFiles = fs.readdirSync(viewsDir).filter(f => f.endsWith('.ejs'));

console.log('--- CHECKING <title> IN EJS FILES ---');
let allTitlesValid = true;
ejsFiles.forEach(f => {
  const content = fs.readFileSync(path.join(viewsDir, f), 'utf8');
  const titleMatch = content.match(/<title>(.*?)<\/title>/);
  if (titleMatch) {
    const title = titleMatch[1];
    const valid = title.includes('Tiffany Webb Impact OS');
    if (!valid) allTitlesValid = false;
    console.log(`[${valid ? 'PASS' : 'FAIL'}] ${f}: ${title}`);
  } else {
    console.log(`[SKIP] ${f}: No <title> tag`);
  }
});

console.log('\n--- CHECKING ZERO OCCURRENCES OF "Tiffany Webb CRM" ---');
let zeroMatches = true;
ejsFiles.forEach(f => {
  const content = fs.readFileSync(path.join(viewsDir, f), 'utf8');
  if (content.includes('Tiffany Webb CRM')) {
    console.log(`FAIL: ${f} contains "Tiffany Webb CRM"`);
    zeroMatches = false;
  }
});

const serverContent = fs.readFileSync(path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/server.js'), 'utf8');
const serverLines = serverContent.split('\n');
serverLines.forEach((l, i) => {
  // Exclude internal default JWT secret fallback string and internal database name if any
  if (l.includes('Tiffany Webb CRM') && !l.includes('JWT_SECRET') && !l.includes('database:') && !l.trim().startsWith('//')) {
    console.log(`FAIL: server.js:${i+1} contains "Tiffany Webb CRM": ${l.trim()}`);
    zeroMatches = false;
  }
});

if (zeroMatches) console.log('PASS: Zero user-facing occurrences of "Tiffany Webb CRM" in views and server.js');
console.log('\nOVERALL NOMENCLATURE RESULT:', (allTitlesValid && zeroMatches) ? 'PASS' : 'FAIL');
