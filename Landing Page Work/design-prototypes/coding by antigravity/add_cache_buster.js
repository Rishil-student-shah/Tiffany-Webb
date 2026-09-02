const fs = require('fs');
const path = require('path');

const dir = 'd:\\FREELANCE\\TIFFANY WEB\\Landing Page Work\\coding by antigravity';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const cacheBuster = `?v=${Date.now()}`;

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace styles.css with styles.css?v=...
  content = content.replace(/href="styles\.css(\?v=[^"]*)?"/g, `href="styles.css${cacheBuster}"`);
  
  // Replace main.js with main.js?v=...
  content = content.replace(/src="main\.js(\?v=[^"]*)?"/g, `src="main.js${cacheBuster}"`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated cache busters in ${file}`);
});
