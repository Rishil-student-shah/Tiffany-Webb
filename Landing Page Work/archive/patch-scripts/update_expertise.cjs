const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Expertise.astro', 'utf8');

const frontmatterRegex = /---\nimport Waveform from '\.\/Waveform\.astro';/;
content = content.replace(frontmatterRegex, `---
import Waveform from './Waveform.astro';
const { content = {}, collections = {} } = Astro.props;
const eyebrow = content.eyebrow ?? "Speaking Tracks";
const headline = content.headline ?? 'What she <span class="italic-accent">speaks about.</span>';
const subtext = content.subtext ?? "Twenty topics across four tracks - practical enough to use on Monday, human enough that the room stays with her.";
`);

content = content.replace('<Eyebrow>Speaking Tracks</Eyebrow>', '{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}');
content = content.replace('<h2 class="section-title">What she <span class="italic-accent">speaks about.</span></h2>', '{headline && <h2 class="section-title" set:html={headline}></h2>}');
content = content.replace('<p class="expertise-sub">Twenty topics across four tracks ?" practical enough to use on Monday, human enough that the room stays with her.</p>', '{subtext && <p class="expertise-sub">{subtext}</p>}');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Expertise.astro', content, 'utf8');
