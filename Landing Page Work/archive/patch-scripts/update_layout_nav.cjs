const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/layouts/Layout.astro', 'utf8');

const regex = /import Nav from '\.\.\/components\/Nav\.astro';/;
const newImport = `import Nav from '../components/Nav.astro';
import mysql from 'mysql2/promise';

let isNavActive = true;
try {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '@rishil8124shah',
    database: 'tiffany_crm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  const [rows] = await pool.query('SELECT is_active FROM website_pages WHERE slug = "navbar"');
  if (rows.length > 0) {
    isNavActive = rows[0].is_active === 1;
  }
} catch(e) {
  console.error(e);
}
`;

content = content.replace(regex, newImport);
content = content.replace(/<Nav \/>/, '{isNavActive && <Nav />}');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/layouts/Layout.astro', content, 'utf8');
