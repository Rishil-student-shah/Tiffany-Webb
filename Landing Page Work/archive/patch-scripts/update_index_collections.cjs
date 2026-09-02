const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/pages/index.astro', 'utf8');

content = content.replace(/await pool\.end\(\);\n  \} catch \(e\)/, `  if (dbContent.proof_attributes && dbContent.proof_attributes.section_is_active === '0') {
    dbCollections.proof_attributes = [];
  }
  if (dbContent.proof_testimonials && dbContent.proof_testimonials.section_is_active === '0') {
    dbCollections.proof_testimonials = [];
  }
  await pool.end();
} catch (e)`);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/pages/index.astro', content, 'utf8');
