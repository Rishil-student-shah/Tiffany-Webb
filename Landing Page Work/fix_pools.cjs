const fs = require('fs');

function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/const \[rows\] = await pool\.query\((.*?)\);([\s\S]*?)\} catch\(e\)/, "const [rows] = await pool.query($1);$2 await pool.end();\n} catch(e)");
    content = content.replace(/const \[contentRows\] = await pool\.query\((.*?)\);([\s\S]*?)const \[socialRows\] = await pool\.query\((.*?)\);([\s\S]*?)\} catch\(e\)/, "const [contentRows] = await pool.query($1);$2 const [socialRows] = await pool.query($3);$4 await pool.end();\n} catch(e)");
    fs.writeFileSync(path, content, 'utf8');
}

fixFile('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Nav.astro');
fixFile('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/layouts/Layout.astro');
fixFile('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Footer.astro');

console.log("Fixed Astro files");
