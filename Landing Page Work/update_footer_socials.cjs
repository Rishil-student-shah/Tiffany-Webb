const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Footer.astro', 'utf8');

const oldRegex = /const \[socialRows\] = await pool\.query\(`SELECT title, subtitle FROM website_collections WHERE section_name = 'social_links' ORDER BY sort_order ASC`\);\n\s*activeSocials = socialRows\.map\(row => \(\{ platform: row\.title, url: row\.subtitle \}\)\)\.filter\(link => link\.url\);/;

const newLogic = `
  const [socialToggleRows] = await pool.query("SELECT content_value FROM website_content WHERE section = 'social_links' AND key_name = 'section_is_active'");
  let isSocialActive = true;
  if (socialToggleRows.length > 0) {
    isSocialActive = socialToggleRows[0].content_value !== '0';
  }

  if (isSocialActive) {
    const [socialRows] = await pool.query(\`SELECT title, subtitle FROM website_collections WHERE section_name = 'social_links' ORDER BY sort_order ASC\`);
    activeSocials = socialRows.map(row => ({ platform: row.title, url: row.subtitle })).filter(link => link.url);
  }
`;

content = content.replace(oldRegex, newLogic);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/Footer.astro', content, 'utf8');
