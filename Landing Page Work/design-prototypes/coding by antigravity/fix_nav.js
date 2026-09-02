const fs = require('fs');
const path = require('path');

const dir = 'd:\\FREELANCE\\TIFFANY WEB\\Landing Page Work\\coding by antigravity';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove the incorrectly injected mobile link from the desktop nav
  content = content.replace(
    /<li><a href="index\.html" class="mobile-nav-link">Home<\/a>\s*<a href="about\.html" class="nav-link">About<\/a><\/li>/g,
    '<li><a href="about.html" class="nav-link">About</a></li>'
  );

  // 2. Add the mobile home link to the mobile menu properly
  if (content.includes('<div class="mobile-menu">')) {
    // Only add if it's not already there
    if (!content.includes('<a href="index.html" class="mobile-nav-link">Home</a>')) {
      content = content.replace(
        /<div class="mobile-menu">([\s\S]*?)<a href="about\.html" class="mobile-nav-link">About<\/a>/,
        '<div class="mobile-menu">$1<a href="index.html" class="mobile-nav-link">Home</a>\n    <a href="about.html" class="mobile-nav-link">About</a>'
      );
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed nav in ${file}`);
});
