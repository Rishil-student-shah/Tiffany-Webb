const fs = require('fs');

const files = [
    'Hero.astro', 'MeetTiffany.astro', 'EventsImpact.astro', 
    'Expertise.astro', 'Proof.astro', 'MediaBand.astro', 'WhereSheWorks.astro'
];

files.forEach(file => {
    const path = `D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-astro/src/components/${file}`;
    let content = fs.readFileSync(path, 'utf8');
    
    // Replace || with ?? for content properties
    content = content.replace(/= content\.([a-zA-Z0-9_]+) \|\|/g, '= content.$1 ??');
    
    fs.writeFileSync(path, content, 'utf8');
});
