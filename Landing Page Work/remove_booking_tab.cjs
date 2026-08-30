const fs = require('fs');
let text = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

text = text.replace(
  'let allSections = Array.from(uniqueSections);',
  'let allSections = Array.from(uniqueSections).filter(s => s !== "booking");'
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', text, 'utf8');
