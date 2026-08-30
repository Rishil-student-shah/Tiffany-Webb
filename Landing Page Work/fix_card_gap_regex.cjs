const fs = require('fs');
let text = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/EventsImpact.astro', 'utf8');

text = text.replace(
  /\.events-carousel-wrapper\s*\{[\s\S]*?padding-bottom:\s*2rem;/,
  `.events-carousel-wrapper {
    margin-bottom: 1.5rem;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;`
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/EventsImpact.astro', text, 'utf8');
