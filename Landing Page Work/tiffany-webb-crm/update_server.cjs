const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', 'utf8');

content = content.replace(
  "definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'speaking_formats', 'impact', 'media', 'events', 'proof'];",
  "definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'speaking_formats', 'where_she_works'];"
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', content, 'utf8');
