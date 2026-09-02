const fs = require('fs');
let content = fs.readFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', 'utf8');

const routeToAdd = `
// Toggle Page Status
app.post('/api/pages/:id/toggle', requireAuth, async (req, res) => {
    try {
        const { is_active } = req.body;
        await pool.query('UPDATE website_pages SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update page status' });
    }
});
`;

// Insert it right before "app.post('/cms/:slug',"
content = content.replace("app.post('/cms/:slug', requireAuth, upload.any(), async (req, res) => {", routeToAdd + "\napp.post('/cms/:slug', requireAuth, upload.any(), async (req, res) => {");

fs.writeFileSync('D:/FREELANCE/TIFFANY WEB/Landing Page Work/tiffany-webb-crm/server.js', content, 'utf8');
