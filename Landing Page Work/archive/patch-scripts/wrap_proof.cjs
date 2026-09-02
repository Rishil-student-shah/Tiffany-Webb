const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Proof.astro', 'utf8');

content = content.replace('<Eyebrow>{eyebrow}</Eyebrow>', '{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}');
content = content.replace('<h2 class="section-title works-title">{headline}</h2>', '{headline && <h2 class="section-title works-title">{headline}</h2>}');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Proof.astro', content, 'utf8');
