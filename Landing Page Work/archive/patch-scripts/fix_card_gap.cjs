const fs = require('fs');
let text = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/EventsImpact.astro', 'utf8');

text = text.replace(
  'margin-bottom: 4rem;\n      width: 100%;\n      overflow-x: auto;\n      padding-bottom: 2rem;',
  'margin-bottom: 1.5rem;\n      width: 100%;\n      overflow-x: auto;\n      padding-bottom: 0.5rem;'
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/EventsImpact.astro', text, 'utf8');
