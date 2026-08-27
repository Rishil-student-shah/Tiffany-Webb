const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

const oldSuccessClose = `<button onclick="this.parentElement.style.display='none'" style="background: none; border: none; color: #166534; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;">&times;</button>`;
const newSuccessClose = `<span onclick="this.parentElement.style.display='none'" style="color: #166534; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">&times;</span>`;

const oldErrorClose = `<button onclick="this.parentElement.style.display='none'" style="background: none; border: none; color: #991b1b; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;">&times;</button>`;
const newErrorClose = `<span onclick="this.parentElement.style.display='none'" style="color: #991b1b; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">&times;</span>`;

content = content.replace(oldSuccessClose, newSuccessClose);
content = content.replace(oldErrorClose, newErrorClose);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', content, 'utf8');
