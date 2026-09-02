const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/CredibilityBar.astro', 'utf8');

const regex = /if \(items\.length === 0\) \{[\s\S]*?\}/;
content = content.replace(regex, '');
content = content.replace(/<section class="credibility-bar theme-gold">/, '<% if (items.length === 0) return; %>\n<section class="credibility-bar theme-gold">');

// Fix Astro syntax: The best way is to wrap the whole JSX in {items.length > 0 && ( ... )}
const jsxRegex = /<section class="credibility-bar theme-gold">[\s\S]*<\/section>/;
const match = content.match(jsxRegex);
if (match) {
    content = content.replace(jsxRegex, `{items.length > 0 && (\n${match[0]}\n)}`);
    // Remove the bad ejs tag I just added above in case it matched
    content = content.replace(/<% if \(items\.length === 0\) return; %>\n/, '');
}

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/CredibilityBar.astro', content, 'utf8');
