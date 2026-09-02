const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Hero.astro', 'utf8');

content = content.replace(
  '<div class="hero-eyebrow-wrap">\n        <span class="hero-eyebrow" set:html={eyebrow}></span>\n      </div>',
  '{eyebrow && (<div class="hero-eyebrow-wrap"><span class="hero-eyebrow" set:html={eyebrow}></span></div>)}'
);

content = content.replace(
  '<div class="hero-formats fade-in-delay">\n        <p set:html={formats}></p>\n      </div>',
  '{formats && (<div class="hero-formats fade-in-delay"><p set:html={formats}></p></div>)}'
);

content = content.replace(
  '<div class="hero-subtext fade-in-delay">\n        <p set:html={subtext}></p>\n      </div>',
  '{subtext && (<div class="hero-subtext fade-in-delay"><p set:html={subtext}></p></div>)}'
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Hero.astro', content, 'utf8');
