const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', 'utf8');

const regex = /<label style="font-size: 0\.8rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0\.05em;">\s*<%= item\.key_name\.replace\(\/_.*?\s*<\/label>/;
// Let's just use string replace.

const target = `<label style="font-size: 0.8rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em;">
                                                        <%= item.key_name.replace(/_/g, ' ') %>
                                                    </label>`;

const replacement = `<% if (item.key_name !== 'section_is_active') { %>
                                                    <label style="font-size: 0.8rem; font-weight: 700; color: var(--color-ivory); text-transform: uppercase; letter-spacing: 0.05em;">
                                                        <%= item.key_name.replace(/_/g, ' ') %>
                                                    </label>
                                                    <% } %>`;

content = content.replace(target, replacement);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms-page.ejs', content, 'utf8');
