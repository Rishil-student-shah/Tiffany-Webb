const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

content = content.replace(
  /const pageOrder = \[[\s\S]*?\];/,
  "const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit', 'media', 'events', 'proof', 'booking'];"
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', content, 'utf8');
