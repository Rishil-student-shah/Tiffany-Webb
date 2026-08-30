const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms.ejs', 'utf8');

const oldButtonRegex = /<button onclick="togglePageStatus\([^)]+\)" id="status-btn-[^"]+" style="[^"]+" onmouseover="this\.style\.opacity='0\.8'" onmouseout="this\.style\.opacity='1'">\s*<%= \(typeof page\.is_active === 'undefined' \|\| page\.is_active\) \? 'Active' : 'Inactive' %>\s*<\/button>/g;

const newButton = `<button onclick="togglePageStatus(<%= page.id %>, <%= typeof page.is_active !== 'undefined' ? page.is_active : 1 %>)" id="status-btn-<%= page.id %>" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; border: 1px solid <%= (typeof page.is_active === 'undefined' || page.is_active) ? '#166534' : '#991b1b' %>; cursor: pointer; background: <%= (typeof page.is_active === 'undefined' || page.is_active) ? '#dcfce3' : '#fce3e3' %>; color: <%= (typeof page.is_active === 'undefined' || page.is_active) ? '#166534' : '#991b1b' %>; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
    <div style="width: 8px; height: 8px; border-radius: 50%; background: <%= (typeof page.is_active === 'undefined' || page.is_active) ? '#166534' : '#991b1b' %>;"></div>
    <%= (typeof page.is_active === 'undefined' || page.is_active) ? 'ACTIVE' : 'INACTIVE' %>
</button>`;

content = content.replace(oldButtonRegex, newButton);
fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms.ejs', content, 'utf8');
