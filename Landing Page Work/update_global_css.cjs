const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/styles/global.css', 'utf8');

// Find a good place to insert it.
const target = '/* Framed Page Layout */';
const newCSS = `/* Ensure the first section on any page clears the fixed Navbar */
#smooth-content > *:first-child {
  padding-top: 140px !important; 
}

/* Framed Page Layout */`;

content = content.replace(target, newCSS);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/styles/global.css', content, 'utf8');
