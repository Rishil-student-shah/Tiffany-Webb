const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/MeetTiffany.astro', 'utf8');

content = content.replace('<Eyebrow>{eyebrow}</Eyebrow>', '{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}');
content = content.replace('<p>{p1}</p>', '{p1 && <p>{p1}</p>}');
content = content.replace('<p>{p2}</p>', '{p2 && <p>{p2}</p>}');
content = content.replace('<p>{p3}</p>', '{p3 && <p>{p3}</p>}');
content = content.replace('<div class="meet-cta">\n          <Button href="/about" variant="secondary" className="magnetic-btn">{btn}</Button>\n        </div>', '{btn && <div class="meet-cta"><Button href="/about" variant="secondary" className="magnetic-btn">{btn}</Button></div>}');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/MeetTiffany.astro', content, 'utf8');
