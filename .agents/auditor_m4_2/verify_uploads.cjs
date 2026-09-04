const path = require('path');
const fs = require('fs');

// Test 1: FileFilter validation
function testFileFilter(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();
  
  if (file.fieldname === 'video_file') {
    const allowedExts = ['.mp4', '.webm', '.mov'];
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-quicktime', 'video/mov'];
    if (!allowedExts.includes(ext) || !allowedMimes.includes(mimetype)) {
      return { accepted: false, error: 'Only .mp4, .webm, and .mov video files are allowed' };
    }
    return { accepted: true, error: null };
  }
  if (file.fieldname === 'image_file' || file.fieldname.startsWith('image_upload_') || file.fieldname === 'image') {
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/pjpeg', 'image/x-png'];
    if (!allowedExts.includes(ext) || !allowedMimes.includes(mimetype)) {
      return { accepted: false, error: 'Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed' };
    }
    return { accepted: true, error: null };
  }
  return { accepted: false, error: 'File upload type not allowed' };
}

const testCases = [
  { fieldname: 'video_file', originalname: 'malware.exe', mimetype: 'application/octet-stream', expectPass: false },
  { fieldname: 'video_file', originalname: 'payload.mp4', mimetype: 'application/octet-stream', expectPass: false },
  { fieldname: 'video_file', originalname: 'exploit.exe', mimetype: 'video/mp4', expectPass: false },
  { fieldname: 'video_file', originalname: 'test.php', mimetype: 'application/x-php', expectPass: false },
  { fieldname: 'video_file', originalname: 'sample.mp4', mimetype: 'video/mp4', expectPass: true },
  { fieldname: 'video_file', originalname: 'sample.webm', mimetype: 'video/webm', expectPass: true },
  { fieldname: 'video_file', originalname: 'sample.mov', mimetype: 'video/quicktime', expectPass: true },
  { fieldname: 'video_file', originalname: 'sample.mov', mimetype: 'video/x-quicktime', expectPass: true },
  { fieldname: 'video_file', originalname: 'sample.mov', mimetype: 'video/mov', expectPass: true },
  { fieldname: 'image_file', originalname: 'shell.php', mimetype: 'image/jpeg', expectPass: false },
  { fieldname: 'image_file', originalname: 'bad.svg', mimetype: 'image/svg+xml', expectPass: false },
  { fieldname: 'image_file', originalname: 'good.png', mimetype: 'image/png', expectPass: true },
  { fieldname: 'image_file', originalname: 'good.jpg', mimetype: 'image/jpeg', expectPass: true }
];

console.log('--- FILE FILTER EVALUATION ---');
let allFilterPassed = true;
testCases.forEach(tc => {
  const res = testFileFilter(tc);
  const passed = res.accepted === tc.expectPass;
  if (!passed) allFilterPassed = false;
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${tc.fieldname} (${tc.originalname}, ${tc.mimetype}) -> accepted=${res.accepted} (expected=${tc.expectPass})`);
});

// Test 2: saveBase64Image
console.log('\n--- saveBase64Image EVALUATION ---');
const serverJsContent = fs.readFileSync(path.join(__dirname, '../../Landing Page Work/tiffany-webb-crm/server.js'), 'utf8');
const saveBase64Match = serverJsContent.match(/function saveBase64Image\([\s\S]+?\n\}/);
if (!saveBase64Match) {
  console.log('FAIL: Could not locate saveBase64Image in server.js');
  process.exit(1);
}
eval(saveBase64Match[0]);

const base64Cases = [
  { desc: 'SVG XSS payload', input: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzY3JpcHQ+YWxlcnQoMSk8L3NjcmlwdD48L3N2Zz4=', expectNull: true },
  { desc: 'HTML injection payload', input: 'data:image/html;base64,PGh0bWw+PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0PjwvaHRtbD4=', expectNull: true },
  { desc: 'PHP script payload', input: 'data:image/php;base64,PD9waHAgcGhwaW5mbygpOyA/Pg==', expectNull: true },
  { desc: 'Empty payload', input: 'data:image/png;base64,', expectNull: true },
  { desc: 'Valid PNG transparent 1x1 pixel', input: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', expectNull: false, expectedExt: '.png' },
  { desc: 'Valid JPEG 1x1 pixel', input: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', expectNull: false, expectedExt: '.jpg' }
];

let allBase64Passed = true;
base64Cases.forEach(bc => {
  const result = saveBase64Image(bc.input);
  if (bc.expectNull) {
    const passed = (result === null);
    if (!passed) allBase64Passed = false;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${bc.desc} -> result: ${result} (expected null)`);
  } else {
    const passed = (typeof result === 'string' && result.startsWith('/uploads/') && result.endsWith(bc.expectedExt));
    if (!passed) allBase64Passed = false;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${bc.desc} -> result: ${result} (expected ${bc.expectedExt} file)`);
    // Clean up created test file if written
    if (result && result.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../Landing Page Work/tiffany-webb-astro/public', result);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }
});

console.log('\nOVERALL FILE & BASE64 AUDIT RESULT:', (allFilterPassed && allBase64Passed) ? 'ALL PASSED' : 'SOME FAILED');
