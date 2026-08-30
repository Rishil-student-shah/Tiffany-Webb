const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/EventsImpact.astro', 'utf8');

content = content.replace('<Eyebrow>{eyebrow}</Eyebrow>', '{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}');
content = content.replace('<h2 class="section-title text-gradient">{headline}</h2>', '{headline && <h2 class="section-title text-gradient">{headline}</h2>}');
content = content.replace('<p class="empty-text">{emptyText}</p>', '{emptyText && <p class="empty-text">{emptyText}</p>}');
content = content.replace(
    '<a href={btnLink} id="populated-book-btn" class="btn" style="display: inline-flex; align-items: center; justify-content: center; padding: 0.95rem 2.2rem; background: var(--color-gold); color: var(--color-ink); border: 1.5px solid var(--color-gold); border-radius: 100px; font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.3s ease;">\n          {btnText}\n        </a>',
    '{btnText && <a href={btnLink} id="populated-book-btn" class="btn" style="display: inline-flex; align-items: center; justify-content: center; padding: 0.95rem 2.2rem; background: var(--color-gold); color: var(--color-ink); border: 1.5px solid var(--color-gold); border-radius: 100px; font-family: var(--font-mono); font-size: 0.85rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all 0.3s ease;">{btnText}</a>}'
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/EventsImpact.astro', content, 'utf8');
