const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/styles/global.css', 'utf8');

const target = '/* Framed Page Layout */';
const newCSS = `/* If Hero is missing, push the first section down to clear the fixed Navbar */
main > section:first-child:not(.hero) {
  padding-top: 140px !important; 
}

/* Framed Page Layout */`;

content = content.replace(target, newCSS);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/styles/global.css', content, 'utf8');
