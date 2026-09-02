const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms.ejs', 'utf8');

const oldHtml = `<span style="display: inline-block; padding: 0.25rem 0.75rem; background: #dcfce3; color: #166534; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">Active</span>`;

const newHtml = `<button onclick="togglePageStatus(<%= page.id %>, <%= typeof page.is_active !== 'undefined' ? page.is_active : 1 %>)" id="status-btn-<%= page.id %>" style="display: inline-block; padding: 0.25rem 0.75rem; border: none; cursor: pointer; background: <%= (typeof page.is_active === 'undefined' || page.is_active) ? '#dcfce3' : '#fce3e3' %>; color: <%= (typeof page.is_active === 'undefined' || page.is_active) ? '#166534' : '#991b1b' %>; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
    <%= (typeof page.is_active === 'undefined' || page.is_active) ? 'Active' : 'Inactive' %>
</button>`;

content = content.replace(oldHtml, newHtml);

const scriptToAdd = `
<script>
    async function togglePageStatus(pageId, currentStatus) {
        const newStatus = currentStatus ? 0 : 1;
        try {
            const res = await fetch(\`/api/pages/\${pageId}/toggle\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus })
            });
            if (res.ok) {
                window.location.reload();
            } else {
                alert('Failed to update status');
            }
        } catch (e) {
            alert('Error updating status');
        }
    }
</script>
</body>
`;

content = content.replace('</body>', scriptToAdd);

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/views/cms.ejs', content, 'utf8');
