const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/layouts/Layout.astro', 'utf8');

content = content.replace(/<div class="page-wrapper">\s*<div class="page-card">/, '');
content = content.replace(/<\/div>\s*<\/main>\s*<\/div>\s*<\/div>/, '</div>\n        </main>');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/layouts/Layout.astro', content, 'utf8');
