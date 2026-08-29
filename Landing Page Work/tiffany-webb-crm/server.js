const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../tiffany-webb-astro/public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Database pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tiffany_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4321' }));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth middleware for dashboard pages
const requireAuth = (req, res, next) => {
  // Simple cookie-based or query-based token check for EJS routes (for now we'll use a simple approach)
  // In a real app with EJS, you'd use a cookie-parser and session, but we can do JWT via cookies.
  // For simplicity, we'll set up a basic session or token check later.
  next(); 
};

// --- API Routes (Phase 1) ---

app.post('/api/leads', async (req, res) => {
  try {
    const { contact_name, organization_name, email, country_code, phone, event_type, event_date, event_location, estimated_audience_size, message, source, is_manual } = req.body;
    
    // MySQL DATE column requires YYYY-MM-DD or null. If we get a string that isn't a valid date, we set it to null.
    let validDate = null;
    if (event_date) {
        const d = new Date(event_date);
        if (!isNaN(d.getTime())) {
            validDate = d.toISOString().split('T')[0];
        }
    }

    const [result] = await pool.query(`
      INSERT INTO leads (source, contact_name, organization_name, email, country_code, phone, event_type, event_date, event_location, estimated_audience_size, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [source || 'website_form', contact_name, organization_name, email, country_code || null, phone, event_type, validDate, event_location, estimated_audience_size || null, message]);
    
    // Add activity log
    await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [result.insertId, 'lead_created', 'Lead created from website form']);
    
    if (is_manual) {
        res.redirect('/leads/new?success=Lead successfully added!');
    } else {
        res.status(201).json({ success: true, lead_id: result.insertId });
    }
  } catch (error) {
    console.error(error);
    if (req.body.is_manual) {
        res.redirect('/leads/new?error=Could not add lead to database');
    } else {
        res.status(500).json({ error: 'Server error creating lead' });
    }
  }
});

app.post('/webhooks/gupshup', async (req, res) => {
  try {
    // Basic Gupshup webhook handler logic
    // Expecting body to contain sender phone and message text
    const payload = req.body;
    
    // In a real implementation we would parse Gupshup's specific JSON structure.
    // Assuming simple payload for now: { phone: '...', text: '...' }
    const phone = payload.phone;
    const text = payload.text;
    
    if (!phone || !text) return res.status(400).send('Bad Request');

    // Find lead by phone
    const [leads] = await pool.query('SELECT id FROM leads WHERE phone = ? LIMIT 1', [phone]);
    let leadId;

    if (leads.length === 0) {
      const [newLead] = await pool.query("INSERT INTO leads (source, phone) VALUES ('whatsapp', ?)", [phone]);
      leadId = newLead.insertId;
      await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [leadId, 'lead_created', 'Lead created via WhatsApp inbound']);
    } else {
      leadId = leads[0].id;
    }

    // Insert message
    await pool.query("INSERT INTO messages (lead_id, channel, direction, body) VALUES (?, 'whatsapp', 'inbound', ?)", [leadId, text]);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing webhook');
  }
});

// --- Dashboard Routes (EJS) ---



app.get('/login', (req, res) => {
  const success = req.query.reset === 'success' ? 'Password reset successfully. You can now log in.' : null;
  res.render('login', { error: null, success });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.render('login', { error: 'Invalid credentials', success: null });
    }
    
    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (!match) {
      return res.render('login', { error: 'Invalid credentials', success: null });
    }
    
    // For Phase 1 EJS simplicity without full session store, we could set a cookie with JWT
    // Just redirect to dashboard for now
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Server error', success: null });
  }
});

// --- Forgot Password ---
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null, success: null });
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const isFetch = req.headers.accept && req.headers.accept.includes('application/json');
  
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      if (isFetch) return res.json({ success: false, message: 'No user found with that email address.' });
      return res.render('forgot-password', { error: 'No user found with that email address.', success: null });
    }

    const user = users[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expires = new Date(Date.now() + 15 * 60000); // 15 mins from now
    const sqlDatetime = expires.toISOString().slice(0, 19).replace('T', ' ');

    await pool.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [otp, sqlDatetime, user.id]);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD
      }
    });
    
    await transporter.sendMail({
      from: `"Tiffany Webb CRM" <${process.env.EMAIL_HOST_USER}>`,
      to: user.email,
      subject: 'Password Reset OTP',
      html: `<p>You requested a password reset.</p><p>Your 6-digit OTP is: <strong>${otp}</strong></p><p>This OTP is valid for 15 minutes. If you didn't request this, please ignore this email.</p>`
    });

    if (isFetch) {
      return res.json({ success: true, message: 'OTP sent successfully.' });
    }
    res.redirect(`/reset-password?email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    console.error(err);
    if (isFetch) return res.json({ success: false, message: 'Something went wrong.' });
    res.render('forgot-password', { error: 'Something went wrong. Please try again.', success: null });
  }
});

// --- Reset Password ---
app.get('/reset-password', async (req, res) => {
  const { email } = req.query;
  res.render('reset-password', { error: null, email: email || '' });
});

app.post('/reset-password', async (req, res) => {
  const { email, otp, password, confirm_password } = req.body;
  if (password !== confirm_password) {
    return res.render('reset-password', { error: 'Passwords do not match.', email });
  }
  
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()', [email, otp]);
    if (users.length === 0) {
      return res.render('reset-password', { error: 'Invalid or expired OTP.', email });
    }

    const user = users[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, user.id]);
    
    res.redirect('/login?reset=success');
  } catch (err) {
    console.error(err);
    res.render('reset-password', { error: 'Something went wrong. Please try again.', email });
  }
});

// --- Dashboard Routes (EJS) ---
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const [leads] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    
    // Aggregations for charts
    const sourceData = {};
    const funnelData = { new: 0, qualified: 0, proposal_sent: 0, booked: 0 };
    
    leads.forEach(lead => {
      // Aggregate sources
      sourceData[lead.source] = (sourceData[lead.source] || 0) + 1;
      
      // Aggregate funnel (only counting specific key steps)
      if (funnelData[lead.status] !== undefined) {
        funnelData[lead.status]++;
      }
    });

    res.render('dashboard', { 
        leads, 
        chartData: JSON.stringify({ sourceData, funnelData }),
        error: req.query.error,
        success: req.query.success
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

// User Management (Admin only ideally, but we'll use requireAuth for now)
app.get('/users', requireAuth, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, is_active, last_login_at FROM users ORDER BY created_at DESC');
    res.render('users', { 
      users,
      currentUser: { id: 1, role: 'admin' }, // Temporary dummy user until full session auth
      error: req.query.error,
      success: req.query.success
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading users');
  }
});

app.post('/users', requireAuth, async (req, res) => {
  const { name, email, role, password } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.redirect('/users?error=User with this email already exists');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)', [name, email, role, hashedPassword]);
    
    res.redirect('/users?success=User created successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/users?error=Failed to create user');
  }
});

app.post('/users/:id/change-password', requireAuth, async (req, res) => {
  const { new_password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.params.id]);
    res.redirect('/users?success=Password updated successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/users?error=Failed to update password');
  }
});

app.post('/users/:id/delete', requireAuth, async (req, res) => {
  try {
    const [userToDelete] = await pool.query('SELECT role FROM users WHERE id = ?', [req.params.id]);
    if (userToDelete.length > 0 && userToDelete[0].role === 'admin') {
       // Ideally check if currentUser is NOT the same admin. But per requirements: "one admin can not delete another admin"
       return res.redirect('/users?error=Cannot delete an Admin user');
    }
    
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.redirect('/users?success=User deleted successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/users?error=Failed to delete user');
  }
});

// --- CMS Routes ---
app.get('/cms', requireAuth, async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT * FROM website_pages');
    
    // Sort pages: Home first, About second, then others alphabetically
    pages.sort((a, b) => {
      if (a.slug === 'home') return -1;
      if (b.slug === 'home') return 1;
      if (a.slug === 'about') return -1;
      if (b.slug === 'about') return 1;
      return a.name.localeCompare(b.name);
    });

    res.render('cms', { pages, error: req.query.error, success: req.query.success });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading CMS dashboard');
  }
});

app.get('/cms/:slug', requireAuth, async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [req.params.slug]);
    if (pages.length === 0) return res.status(404).send('Page not found');
    
    const page = pages[0];
    const [content] = await pool.query('SELECT * FROM website_content WHERE page_id = ? ORDER BY section, key_name', [page.id]);
    const [collections] = await pool.query('SELECT * FROM website_collections WHERE page_id = ? ORDER BY section_name, sort_order ASC', [page.id]);
    
    // Group content by section
    const sections = content.reduce((acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section].push(item);
      return acc;
    }, {});

    const collectionSections = collections.reduce((acc, item) => {
      if (!acc[item.section_name]) acc[item.section_name] = [];
      acc[item.section_name].push(item);
      return acc;
    }, {});

    let definedCollections = [];
    if (page.slug === 'home') {
      definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'who_can_benefit', 'events', 'proof_attributes', 'proof_testimonials', 'social_links', 'video_reels'];
    } else if (page.slug === 'services') {
      definedCollections = ['how_tiffany_helps', 'gear_method'];
    }

    res.render('cms-page', { 
      page, 
      sections, 
      collectionSections,
      definedCollections,
      error: req.query.error, 
      success: req.query.success 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading CMS page editor');
  }
});

// Collection Items - NEW (GET)
app.get('/cms/:slug/collection/:section/new', requireAuth, async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [req.params.slug]);
    if (pages.length === 0) return res.status(404).send('Page not found');
    res.render('cms-collection-edit', { 
      page: pages[0], 
      section: req.params.section, 
      item: null,
      error: req.query.error 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading form');
  }
});

// Collection Items - NEW (POST)
app.post('/cms/:slug/collection/:section/new', requireAuth, upload.single('image_file'), async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [req.params.slug]);
    if (pages.length === 0) return res.status(404).send('Page not found');
    
    const { title, subtitle, content_html, image_url, icon_svg, sort_order } = req.body;
    let finalImageUrl = image_url || null;
    if (req.file) {
      finalImageUrl = '/uploads/' + req.file.filename;
    }
    
    await pool.query(
      'INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, image_url, icon_svg, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [pages[0].id, req.params.section, title || null, subtitle || null, content_html || null, finalImageUrl, icon_svg || null, sort_order || 0]
    );
    
    res.redirect(`/cms/${req.params.slug}?success=Item+added+successfully`);
  } catch (err) {
    console.error(err);
    res.redirect(`/cms/${req.params.slug}/collection/${req.params.section}/new?error=Failed+to+add+item`);
  }
});

// Collection Items - EDIT (GET)
app.get('/cms/:slug/collection/:section/:id/edit', requireAuth, async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [req.params.slug]);
    if (pages.length === 0) return res.status(404).send('Page not found');
    
    const [items] = await pool.query('SELECT * FROM website_collections WHERE id = ?', [req.params.id]);
    if (items.length === 0) return res.status(404).send('Item not found');

    res.render('cms-collection-edit', { 
      page: pages[0], 
      section: req.params.section, 
      item: items[0],
      error: req.query.error 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading form');
  }
});

// Collection Items - EDIT (POST)
app.post('/cms/:slug/collection/:section/:id/edit', requireAuth, upload.single('image_file'), async (req, res) => {
  try {
    const { title, subtitle, content_html, image_url, icon_svg, sort_order } = req.body;
    
    let finalImageUrl = image_url || null;
    if (req.file) {
      finalImageUrl = '/uploads/' + req.file.filename;
    }
    
    await pool.query(
      'UPDATE website_collections SET title=?, subtitle=?, content_html=?, image_url=?, icon_svg=?, sort_order=? WHERE id=?',
      [title || null, subtitle || null, content_html || null, finalImageUrl, icon_svg || null, sort_order || 0, req.params.id]
    );
    
    res.redirect(`/cms/${req.params.slug}?success=Item+updated+successfully`);
  } catch (err) {
    console.error(err);
    res.redirect(`/cms/${req.params.slug}/collection/${req.params.section}/${req.params.id}/edit?error=Failed+to+update`);
  }
});

// Collection Items - DELETE
app.get('/cms/collection/:id/delete', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM website_collections WHERE id = ?', [req.params.id]);
    const redirectUrl = req.query.redirect || '/cms';
    res.redirect(`${redirectUrl}?success=Item+deleted`);
  } catch (err) {
    console.error(err);
    const redirectUrl = req.query.redirect || '/cms';
    res.redirect(`${redirectUrl}?error=Failed+to+delete`);
  }
});


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

app.post('/cms/:slug', requireAuth, upload.any(), async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT id FROM website_pages WHERE slug = ?', [req.params.slug]);
    if (pages.length === 0) return res.status(404).send('Page not found');
    const pageId = pages[0].id;

    // Create a map of uploaded files
    const fileMap = {};
    if (req.files) {
      req.files.forEach(f => {
        const idMatch = f.fieldname.match(/image_upload_(\d+)/);
        if (idMatch) {
          fileMap[idMatch[1]] = `/uploads/${f.filename}`;
        }
      });
    }

    const updates = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (key.startsWith('content_')) {
        const contentId = key.replace('content_', '');
        
        let finalValue = value;
        // If a file was uploaded for this specific content ID, override the text input value
        if (fileMap[contentId]) {
          finalValue = fileMap[contentId];
        } else if (req.body[`delete_image_${contentId}`] === 'true') {
          finalValue = null;
        }

        updates.push(pool.query('UPDATE website_content SET content_value = ? WHERE id = ? AND page_id = ?', [finalValue, contentId, pageId]));
      }
    }
    
    await Promise.all(updates);
    res.redirect(`/cms/${req.params.slug}?success=Content updated successfully`);
  } catch (err) {
    console.error(err);
    res.redirect(`/cms/${req.params.slug}?error=Failed to update content`);
  }
});

app.get('/lead/:id', requireAuth, async (req, res) => {
  try {
    const [leads] = await pool.query('SELECT * FROM leads WHERE id = ?', [req.params.id]);
    if (leads.length === 0) return res.status(404).send('Lead not found');
    
    const [messages] = await pool.query('SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC', [req.params.id]);
    const [activity] = await pool.query('SELECT * FROM activity_log WHERE lead_id = ? ORDER BY created_at DESC', [req.params.id]);
    
    res.render('lead', { lead: leads[0], messages, activity });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading lead');
  }
});

app.post('/lead/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE leads SET status = ? WHERE id = ?', [status, req.params.id]);
    await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [req.params.id, 'status_changed', `Status updated to ${status}`]);
    res.redirect(`/lead/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating status');
  }
});

// Edit Lead Details
app.post('/lead/:id/edit', requireAuth, async (req, res) => {
  try {
    const { contact_name, organization_name, email, country_code, phone, event_type, event_date, event_location, estimated_audience_size, message } = req.body;
    
    let validDate = null;
    if (event_date) {
        const d = new Date(event_date);
        if (!isNaN(d.getTime())) {
            validDate = d.toISOString().split('T')[0];
        }
    }

    await pool.query(`
      UPDATE leads 
      SET contact_name = ?, organization_name = ?, email = ?, country_code = ?, phone = ?, event_type = ?, event_date = ?, event_location = ?, estimated_audience_size = ?, message = ?
      WHERE id = ?
    `, [contact_name, organization_name, email, country_code || null, phone, event_type, validDate, event_location, estimated_audience_size, message || null, req.params.id]);
    
    await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [req.params.id, 'lead_updated', 'Lead details and message thread manually updated']);
    res.redirect(`/lead/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating lead');
  }
});

// Delete Lead
app.post('/lead/:id/delete', requireAuth, async (req, res) => {
    try {
        await pool.query('DELETE FROM activity_log WHERE lead_id = ?', [req.params.id]);
        await pool.query('DELETE FROM messages WHERE lead_id = ?', [req.params.id]);
        await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
        res.redirect('/dashboard?success=Lead deleted successfully');
    } catch (err) {
        console.error('Delete error:', err);
        res.redirect(`/lead/${req.params.id}?error=Cannot delete lead due to database constraint`);
    }
});

// Bulk Delete Leads
app.post('/api/leads/bulk-delete', requireAuth, async (req, res) => {
    const { status } = req.body;
    try {
        if (status === 'all') {
            await pool.query('DELETE FROM activity_log');
            await pool.query('DELETE FROM messages');
            await pool.query('DELETE FROM leads');
            res.json({ success: true, message: 'All leads deleted successfully' });
        } else if (status) {
            // First get IDs of leads with this status
            const [leads] = await pool.query('SELECT id FROM leads WHERE status = ?', [status]);
            if (leads.length > 0) {
                const leadIds = leads.map(l => l.id);
                // Delete dependencies
                await pool.query('DELETE FROM activity_log WHERE lead_id IN (?)', [leadIds]);
                await pool.query('DELETE FROM messages WHERE lead_id IN (?)', [leadIds]);
                // Delete leads
                await pool.query('DELETE FROM leads WHERE id IN (?)', [leadIds]);
            }
            res.json({ success: true, message: `All ${status} leads deleted successfully` });
        } else {
            res.status(400).json({ error: 'Status is required' });
        }
    } catch (err) {
        console.error('Bulk delete error:', err);
        res.status(500).json({ error: 'Failed to delete leads' });
    }
});

// Create Lead (Manual/Upload) Page
app.get('/leads/new', requireAuth, async (req, res) => {
  try {
    const [sources] = await pool.query('SELECT DISTINCT source FROM leads WHERE source IS NOT NULL');
    res.render('new-lead', { 
        sources: sources.map(s => s.source),
        error: req.query.error,
        success: req.query.success
    });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard?error=Cannot load manual lead page');
  }
});

// POST Batch Leads (CSV Upload)
app.post('/api/leads/batch', requireAuth, async (req, res) => {
  try {
    const leads = req.body.leads; // Expecting JSON array from PapaParse
    if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ error: 'No leads provided' });
    }

    let inserted = 0;
    for (const lead of leads) {
        let validDate = null;
        if (lead.event_date) {
            const d = new Date(lead.event_date);
            if (!isNaN(d.getTime())) {
                validDate = d.toISOString().split('T')[0];
            }
        }
        
        await pool.query(`
          INSERT INTO leads (source, contact_name, organization_name, email, phone, event_type, event_date, event_location, estimated_audience_size, message)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          lead.source || 'csv_upload', 
          lead.contact_name || lead.name || 'Unknown', 
          lead.organization_name || lead.org || null, 
          lead.email || null, 
          lead.phone || null, 
          lead.event_type || null, 
          validDate, 
          lead.event_location || lead.location || null, 
          lead.estimated_audience_size || lead.size || null, 
          lead.message || null
        ]);
        inserted++;
    }
    
    res.json({ success: true, count: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error processing batch' });
  }
});

// Serve Astro static assets
app.use(express.static(path.join(__dirname, '../tiffany-webb-astro/dist/client')));

// Mount Astro SSR handler for all other routes
import('file://' + path.join(__dirname, '../tiffany-webb-astro/dist/server/entry.mjs'))
  .then(({ handler: astroHandler }) => {
    app.use(async (req, res, next) => {
      // Skip API and CRM routes so they are handled by Express
      if (req.path.startsWith('/api') || req.path.startsWith('/cms') || 
          req.path.startsWith('/dashboard') || req.path.startsWith('/login') || 
          req.path.startsWith('/users') || req.path.startsWith('/lead')) {
          return next();
      }
      astroHandler(req, res, next);
    });

    app.listen(port, () => {
      console.log(`Unified Server running on port ${port} (CRM + Website)`);
    });
  })
  .catch(err => {
    console.error('Failed to load Astro middleware:', err);
    app.listen(port, () => {
      console.log(`CRM Server running on port ${port} (Astro integration failed)`);
    });
  });
