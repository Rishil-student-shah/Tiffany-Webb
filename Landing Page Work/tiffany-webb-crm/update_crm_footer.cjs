const fs = require('fs');

// 1. Update server.js
let serverContent = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', 'utf8');
serverContent = serverContent.replace(
  "definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'who_can_benefit', 'events', 'proof_attributes', 'proof_testimonials'];",
  "definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'who_can_benefit', 'events', 'proof_attributes', 'proof_testimonials', 'social_links'];"
);
fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', serverContent, 'utf8');

// 2. Update cms-page.ejs
let ejsContent = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');
ejsContent = ejsContent.replace(
  "const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit', 'media', 'events', 'proof', 'booking'];",
  "const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit', 'media', 'events', 'proof', 'booking', 'footer'];"
);
fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', ejsContent, 'utf8');
