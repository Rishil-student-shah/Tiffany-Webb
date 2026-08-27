const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

content = content.replace(
  "const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'speaking_formats', 'impact', 'media', 'events', 'proof', 'booking'];",
  "const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'speaking_formats', 'where_she_works', 'booking'];"
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', content, 'utf8');
