const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Nav.astro', 'utf8');

const regex = /import \{ navLinks, navCta \} from '\.\.\/config\/navigation\.js';/;
const newImport = `import { navLinks, navCta } from '../config/navigation.js';
import mysql from 'mysql2/promise';

let activePages = [];
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
  const [rows] = await pool.query('SELECT slug FROM website_pages WHERE is_active = 1');
  activePages = rows.map(r => r.slug === 'home' ? '/' : \`/\${r.slug}\`);
} catch(e) {
  console.error(e);
}

const filteredNavLinks = navLinks.filter(link => activePages.includes(link.href) || link.href.startsWith('http'));
const isNavActive = activePages.includes('navbar'); // We can use a pseudo-slug for navbar if needed, but let's assume Navbar is always active unless explicitly hidden. Actually user said "every page, navbar and all section".
`;

content = content.replace(regex, newImport);
content = content.replace(/navLinks\.map/g, 'filteredNavLinks.map');

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Nav.astro', content, 'utf8');
