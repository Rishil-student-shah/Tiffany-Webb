const fs = require('fs');
let text = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/BookingSection.astro', 'utf8');

text = text.replace(
  'const { hideJourney = false } = Astro.props;',
  'const { hideJourney = false, content = {} } = Astro.props;'
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/BookingSection.astro', text, 'utf8');

// Now remove 'booking' from cms-page.ejs pageOrder
let crmText = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');
crmText = crmText.replace(
  `const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit', 'media', 'events', 'proof', 'proof_attributes', 'proof_testimonials', 'booking', 'footer', 'social_links'];`,
  `const pageOrder = ['hero', 'impact_band', 'credibility_bar', 'meet_tiffany', 'expertise', 'who_can_benefit', 'media', 'events', 'proof', 'proof_attributes', 'proof_testimonials', 'footer', 'social_links'];`
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', crmText, 'utf8');
