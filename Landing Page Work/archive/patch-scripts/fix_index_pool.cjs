const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/pages/index.astro', 'utf8');

content = content.replace(/dbCollections\[row\.section_name\]\.push\(row\);\n  \}\);\n\} catch \(e\)/, "dbCollections[row.section_name].push(row);\n  });\n  await pool.end();\n} catch (e)");

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/pages/index.astro', content, 'utf8');
