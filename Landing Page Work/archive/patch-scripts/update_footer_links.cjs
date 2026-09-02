const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Footer.astro', 'utf8');

// Inject activePages fetch logic
const fetchLogicRegex = /const \[socialRows\] = await pool\.query\(`SELECT title, subtitle FROM website_collections WHERE section_name = 'social_links' ORDER BY sort_order ASC`\);\n\s*activeSocials = socialRows\.map\(row => \(\{ platform: row\.title, url: row\.subtitle \}\)\)\.filter\(link => link\.url\);/;

const newFetchLogic = `const [socialRows] = await pool.query(\`SELECT title, subtitle FROM website_collections WHERE section_name = 'social_links' ORDER BY sort_order ASC\`);
  activeSocials = socialRows.map(row => ({ platform: row.title, url: row.subtitle })).filter(link => link.url);
  
  const [pageRows] = await pool.query('SELECT slug FROM website_pages WHERE is_active = 1');
  activePages = pageRows.map(r => r.slug === 'home' ? '/' : \`/\${r.slug}\`);`;

content = content.replace(fetchLogicRegex, newFetchLogic);

content = content.replace('let activeSocials = [];', 'let activeSocials = [];\nlet activePages = [];');

// Replace hardcoded HTML with conditionally rendered links including Home
const hardcodedLinksRegex = /<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0\.75rem;">\s*<li><a href="\/about" class="footer-link">About<\/a><\/li>\s*<li><a href="\/services" class="footer-link">Services<\/a><\/li>\s*<li><a href="\/impact" class="footer-link">Impact<\/a><\/li>\s*<li><a href="\/media" class="footer-link">Media<\/a><\/li>\s*<li><a href="\/insights" class="footer-link">Insights<\/a><\/li>\s*<\/ul>/;

const newLinks = `<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
            {activePages.includes('/') && <li><a href="/" class="footer-link">Home</a></li>}
            {activePages.includes('/about') && <li><a href="/about" class="footer-link">About</a></li>}
            {activePages.includes('/services') && <li><a href="/services" class="footer-link">Services</a></li>}
            {activePages.includes('/impact') && <li><a href="/impact" class="footer-link">Impact</a></li>}
            {activePages.includes('/media') && <li><a href="/media" class="footer-link">Media</a></li>}
            {activePages.includes('/insights') && <li><a href="/insights" class="footer-link">Insights</a></li>}
          </ul>`;

content = content.replace(hardcodedLinksRegex, newLinks);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Footer.astro', content, 'utf8');
