const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

content = content.replace(
  "'hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'speaking_formats',\n                  'impact', 'media', 'events', 'proof', 'booking'",
  "'hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit',\n                  'media', 'proof', 'booking'"
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', content, 'utf8');
