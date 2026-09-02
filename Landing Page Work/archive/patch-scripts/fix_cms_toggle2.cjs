const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

const regex = /<% if \(item\.content_type === 'text'\) \{ %>/;
const newHtml = `<% if (item.key_name === 'section_is_active') { %>
    <div style="display: flex; align-items: center; gap: 1rem; padding: 0.5rem 1rem; background: rgba(217, 162, 58, 0.1); border-radius: 8px; border: 1px solid rgba(217, 162, 58, 0.3);">
        <label style="position: relative; display: inline-block; width: 50px; height: 26px;">
            <input type="checkbox" value="1" <%= item.content_value === '1' ? 'checked' : '' %> style="opacity: 0; width: 0; height: 0;" onchange="this.nextElementSibling.style.backgroundColor = this.checked ? '#16a34a' : '#cbd5e1'; this.nextElementSibling.firstElementChild.style.transform = this.checked ? 'translateX(24px)' : 'translateX(0)'; document.getElementById('hidden_<%= item.id %>').value = this.checked ? '1' : '0';">
            <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: <%= item.content_value === '1' ? '#16a34a' : '#cbd5e1' %>; transition: .4s; border-radius: 34px;">
                <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; transform: <%= item.content_value === '1' ? 'translateX(24px)' : 'translateX(0)' %>;"></span>
            </span>
        </label>
        <span style="font-size: 0.9rem; color: var(--color-gold); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Show this section on the live website</span>
        <input type="hidden" id="hidden_<%= item.id %>" name="content_<%= item.id %>" value="<%= item.content_value %>">
    </div>
<% } else if (item.content_type === 'text') { %>`;

content = content.replace(regex, newHtml);

// Hide the label for 'SECTION IS ACTIVE' since we now render a custom UI box that explains it
content = content.replace(/<label style="font-size: 0.8rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em;">\s*<%= item.key_name.replace\(\/_.*?\)\s*<\/label>/, `<% if (item.key_name !== 'section_is_active') { %><label style="font-size: 0.8rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em;"><%= item.key_name.replace(/_/g, ' ') %></label><% } %>`);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', content, 'utf8');
