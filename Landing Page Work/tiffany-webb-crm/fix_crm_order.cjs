const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

const oldPageOrder = `const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit', 'media', 'events', 'proof', 'booking', 'footer'];`;

const newPageOrder = `const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit', 'media', 'events', 'proof', 'proof_attributes', 'proof_testimonials', 'booking', 'footer', 'social_links'];`;

content = content.replace(oldPageOrder, newPageOrder);
fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', content, 'utf8');
