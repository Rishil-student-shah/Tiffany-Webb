const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

content = content.replace(
  "'where_she_works'",
  "'who_can_benefit'"
);

// We also need to fix the hardcoded label formatting in EJS if it exists, or the EJS loop formatSectionName handles it.
fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', content, 'utf8');
