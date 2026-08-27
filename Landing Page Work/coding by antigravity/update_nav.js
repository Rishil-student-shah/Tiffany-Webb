const fs = require('fs');
const path = require('path');

const dir = 'd:\\FREELANCE\\TIFFANY WEB\\Landing Page Work\\coding by antigravity';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add Home link to Desktop Navbar
  if (content.includes('<ul class="nav-links">')) {
    const navLinksRegex = /<ul class="nav-links">([\s\S]*?)<\/ul>/;
    const match = content.match(navLinksRegex);
    if (match && !match[1].includes('>Home<')) {
      const isHomeActive = file === 'index.html' ? ' active' : '';
      const homeLink = `\n          <li><a href="index.html" class="nav-link${isHomeActive}">Home</a></li>`;
      content = content.replace('<ul class="nav-links">', `<ul class="nav-links">${homeLink}`);
    }
  }

  // Add Home link to Mobile Navbar
  if (content.includes('<div class="mobile-menu">')) {
    const mobileMenuRegex = /<div class="mobile-menu">([\s\S]*?)<a href="about.html"/;
    const match = content.match(mobileMenuRegex);
    if (match && !match[1].includes('>Home<')) {
      const homeLinkMobile = `<a href="index.html" class="mobile-nav-link">Home</a>\n    `;
      content = content.replace('<a href="about.html"', `${homeLinkMobile}<a href="about.html"`);
    }
  }

  // Remove photo animations
  // Replace data-reveal="left" or data-reveal="right" on images specifically if needed, 
  // or generally since the user didn't want the left/right slide on her photos.
  if (file === 'index.html' || file === 'about.html') {
    // index.html meet tiffany section image
    content = content.replace(/<div data-reveal="left">\s*<img src="assets\/images\/about-portrait\.jpg"/g, '<div data-reveal>\n            <img src="assets/images/about-portrait.jpg"');
    content = content.replace(/<div data-reveal="right">\s*<span class="eyebrow">/g, '<div data-reveal>\n            <span class="eyebrow">');
    // about.html sections
    content = content.replace(/<div data-reveal="left">\s*<h2 class="section-title"/g, '<div data-reveal>\n            <h2 class="section-title"');
    content = content.replace(/<div data-reveal="right" style="text-align:center;">/g, '<div data-reveal style="text-align:center;">');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
