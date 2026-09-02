const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/styles/global.css', 'utf8');

content = content.replace(/main > section:first-child:not\(\.hero\)/g, 'main > section:first-of-type:not(.hero)');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/styles/global.css', content, 'utf8');
