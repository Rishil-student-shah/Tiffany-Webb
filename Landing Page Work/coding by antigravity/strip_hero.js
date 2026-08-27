const fs = require('fs');
const path = require('path');

const dir = 'd:\\FREELANCE\\TIFFANY WEB\\Landing Page Work\\coding by antigravity';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to strip data-reveal and data-delay ONLY from elements inside .hero-content
  // Since regex on HTML is brittle, we'll just do a global replace on the exact hero lines if possible, 
  // or a simple regex targeting the hero section area.
  // Actually, since we're in node, we can just use a simple regex that finds `<div class="container hero-content">` 
  // and replaces `data-reveal=".*?"`, `data-reveal`, and `data-delay="\d+"` until `</section>`.
  
  if (content.includes('hero-content')) {
    const parts = content.split(/<section class="hero-section"[^>]*>/);
    if (parts.length > 1) {
      let heroSection = parts[1].split('</section>')[0];
      let newHeroSection = heroSection
        .replace(/ data-reveal="[^"]*"/g, '')
        .replace(/ data-reveal/g, '')
        .replace(/ data-delay="[^"]*"/g, '');
      
      content = content.replace(heroSection, newHeroSection);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Stripped data-reveal from hero in ${file}`);
    }
  }
});
