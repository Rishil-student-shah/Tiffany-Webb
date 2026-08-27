const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', 'utf8');

content = content.replace(
  "definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'speaking_formats', 'who_can_benefit', 'proof_attributes', 'proof_testimonials'];",
  "definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'who_can_benefit', 'proof_attributes', 'proof_testimonials'];"
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', content, 'utf8');
