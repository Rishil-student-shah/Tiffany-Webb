const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/CredibilityBar.astro', 'utf8');

content = content.replace(/\s*\];\s*\}/, '');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/CredibilityBar.astro', content, 'utf8');
