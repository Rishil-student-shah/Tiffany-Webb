const fs = require('fs');
let text = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/BookingSection.astro', 'utf8');

text = text.replace(
  'hideJourney?: boolean;',
  'hideJourney?: boolean;\n  content?: Record<string, string>;'
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/BookingSection.astro', text, 'utf8');
