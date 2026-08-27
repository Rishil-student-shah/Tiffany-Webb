const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', 'utf8');

content = content.replace(
  "'where_she_works'",
  "'who_can_benefit'"
);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', content, 'utf8');
