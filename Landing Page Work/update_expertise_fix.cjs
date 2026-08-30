const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Expertise.astro', 'utf8');

content = content.replace(/import Button from '\.\/Button\.astro';/, `import Button from './Button.astro';\nconst { content = {}, collections = {} } = Astro.props;\nconst eyebrow = content.eyebrow ?? "Speaking Tracks";\nconst headline = content.headline ?? 'What she <span class="italic-accent">speaks about.</span>';\nconst subtext = content.subtext ?? "Twenty topics across four tracks - practical enough to use on Monday, human enough that the room stays with her.";`);

content = content.replace(/<p class="expertise-sub">.*?<\/p>/s, '{subtext && <p class="expertise-sub">{subtext}</p>}');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Expertise.astro', content, 'utf8');
