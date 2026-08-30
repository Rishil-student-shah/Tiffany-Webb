const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Nav.astro', 'utf8');

content = content.replace(/const isNavActive = activePages\.includes\('navbar'\);.*?\n/, '');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Nav.astro', content, 'utf8');
