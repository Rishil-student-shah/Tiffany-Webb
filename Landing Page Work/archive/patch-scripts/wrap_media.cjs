const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/MediaBand.astro', 'utf8');

content = content.replace(
  '<h3 class="media-headline" style="background: linear-gradient(92deg, var(--color-gold), var(--color-coral)); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline-block;">{headline}</h3>',
  '{headline && <h3 class="media-headline" style="background: linear-gradient(92deg, var(--color-gold), var(--color-coral)); -webkit-background-clip: text; background-clip: text; color: transparent; display: inline-block;">{headline}</h3>}'
);
content = content.replace(
  '<a href="/media" class="media-link">{link1} <span class="arrow">&rarr;</span></a>',
  '{link1 && <a href="/media" class="media-link">{link1} <span class="arrow">&rarr;</span></a>}'
);
content = content.replace(
  '<a href="/media#resources" class="media-link">{link2} <span class="arrow">&rarr;</span></a>',
  '{link2 && <a href="/media#resources" class="media-link">{link2} <span class="arrow">&rarr;</span></a>}'
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/MediaBand.astro', content, 'utf8');
