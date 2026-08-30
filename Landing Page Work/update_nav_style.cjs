const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Nav.astro', 'utf8');

// Add Waveform import if missing
if (!content.includes("import Waveform")) {
  content = content.replace(/import \{ navLinks, navCta \} from '\.\.\/config\/navigation\.js';/, "import { navLinks, navCta } from '../config/navigation.js';\nimport Waveform from './Waveform.astro';");
}

// Inject Waveform into header
content = content.replace(/<header class="header js-header" role="banner" aria-label="Main Navigation">/, `<header class="header js-header" role="banner" aria-label="Main Navigation" style="background-color: var(--color-ink); overflow: hidden;">
    <div style="position: absolute; inset: 0; z-index: -1; pointer-events: none;">
      <Waveform opacity={0.06} variant="A" />
    </div>`);

// Give text proper contrast on dark background
content = content.replace(/\.header \{/, `.header {\n    background-color: var(--color-ink);\n    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);`);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Nav.astro', content, 'utf8');
