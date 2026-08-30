const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Footer.astro', 'utf8');

const regex = /<footer class="site-footer/;
const newHtml = `<% if (dbContent.section_is_active === '0') return; %>\n<footer class="site-footer`;
// Astro syntax for early return is just wrapping everything in {} or {dbContent.section_is_active !== '0' && ( ... )}
// Let's wrap the entire JSX!
const regexFull = /<footer[\s\S]*<\/footer>/;
const match = content.match(regexFull);
if (match) {
    const wrapped = `{dbContent.section_is_active !== '0' && (\n${match[0]}\n)}`;
    content = content.replace(regexFull, wrapped);
    fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Footer.astro', content, 'utf8');
}
