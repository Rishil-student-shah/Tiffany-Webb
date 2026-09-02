const fs = require('fs');
const path = require('path');

const dir = 'd:\\FREELANCE\\TIFFANY WEB\\Landing Page Work\\coding by antigravity';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix desktop nav: find the rogue mobile-nav-link Home that was inserted, and remove it.
  // The rogue link looks like: <li><a href="index.html" class="mobile-nav-link">Home</a>
  content = content.replace(/<li><a href="index\.html" class="mobile-nav-link">Home<\/a>\s*<a href="([^"]+)" class="nav-link(.*?)">([^<]+)<\/a><\/li>/g, 
    '<li><a href="$1" class="nav-link$2">$3</a></li>'
  );

  // Also make sure the mobile menu ACTUALLY has a Home link.
  if (content.includes('<div class="mobile-menu">')) {
    if (!content.includes('<a href="index.html" class="mobile-nav-link">Home</a>')) {
      content = content.replace(
        /<div class="mobile-menu">\s*<button class="mobile-close"[^>]*>✕<\/button>\s*<a href="([^"]+)" class="mobile-nav-link">/,
        '<div class="mobile-menu">\n    <button class="mobile-close" style="align-self:flex-end;background:none;border:none;font-size:2rem;cursor:pointer;color:var(--ivory);">✕</button>\n    <a href="index.html" class="mobile-nav-link">Home</a>\n    <a href="$1" class="mobile-nav-link">'
      );
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Deep fixed nav in ${file}`);
});
