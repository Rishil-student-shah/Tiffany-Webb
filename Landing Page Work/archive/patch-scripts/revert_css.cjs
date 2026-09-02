const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/styles/global.css', 'utf8');

content = content.replace(/\/\* Ensure the first section on any page clears the fixed Navbar \*\/\r?\n#smooth-content > \*:first-child \{\r?\n  padding-top: 140px !important; \r?\n\}\r?\n\r?\n/g, '');
content = content.replace(/\/\* Ensure the first section on any page clears the fixed Navbar \*\/\n#smooth-content > \*:first-child \{\n  padding-top: 140px !important; \n\}\n\n/g, '');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/styles/global.css', content, 'utf8');
