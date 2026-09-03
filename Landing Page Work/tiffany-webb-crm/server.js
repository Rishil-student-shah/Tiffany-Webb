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

// Configure Multer for image and video uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir = path.join(__dirname, '../tiffany-webb-astro/public/uploads');
    if (file.fieldname === 'video_file' || (file.mimetype && file.mimetype.startsWith('video/'))) {
      uploadDir = path.join(__dirname, '../tiffany-webb-astro/public/uploads/videos');
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${uniqueSuffix}-${baseName}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 60 * 1024 * 1024 }, // 60MB max
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'video_file') {
      const allowedExts = ['.mp4', '.webm', '.mov'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext) || (file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream'))) {
        return cb(null, true);
      }
      return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
    }
    cb(null, true);
  }
});

const collectionUpload = upload.fields([
  { name: 'image_file', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
]);

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

// Helper: Save base64 cropped image to uploads directory
function saveBase64Image(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataUrl;
    }
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const uploadDir = path.join(__dirname, '../tiffany-webb-astro/public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `${Date.now()}-cropped-${Math.round(Math.random() * 1E9)}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    return `/uploads/${filename}`;
  } catch (e) {
    console.error('Error saving base64 image:', e);
    return dataUrl;
  }
}

// Helper: Cookie parser
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;
  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

const JWT_SECRET = process.env.JWT_SECRET || 'tiffany-webb-crm-secret-key-2025';

// --- 8-Layer Cyber-Attack Security Suite ---

// Layer 1: Helmet HTTP Headers & Clickjacking Defense
let helmet;
try {
  helmet = require('helmet');
} catch (e) {}

if (helmet) {
  app.use(helmet({
    contentSecurityPolicy: false, // Allows inline EJS script tags
    frameguard: { action: 'deny' } // Prevents Clickjacking
  }));
} else {
  // Comprehensive native security headers fallback
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.removeHeader('X-Powered-By');
    next();
  });
}
app.disable('x-powered-by');

// Layer 2: CORS Hardening
const allowedOrigins = [
  'http://localhost:4321',
  'http://127.0.0.1:4321',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS access denied: origin not allowed'));
    }
  },
  credentials: true
}));

// Layer 3: Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Layer 4: XSS Input Sanitization
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onload=/gi, '')
      .replace(/onerror=/gi, '')
      .replace(/onclick=/gi, '')
      .replace(/onmouseover=/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const cleanObj = {};
    for (const [k, v] of Object.entries(value)) {
      cleanObj[k] = sanitizeValue(v);
    }
    return cleanObj;
  }
  return value;
}

let xss;
try {
  xss = require('xss-clean');
} catch (e) {}

if (xss) {
  try {
    app.use(xss());
  } catch (e) {
    app.use((req, res, next) => {
      if (req.body) req.body = sanitizeValue(req.body);
      next();
    });
  }
} else {
  app.use((req, res, next) => {
    if (req.body) req.body = sanitizeValue(req.body);
    next();
  });
}

// Layer 5: Rate Limiting Suite (Brute Force & DoS Defense)
let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {}

function createLimiter(windowMs, max, message) {
  if (rateLimit) {
    return rateLimit({
      windowMs,
      max,
      message: typeof message === 'object' ? message : { error: message },
      standardHeaders: true,
      legacyHeaders: false
    });
  }
  // Native high-performance sliding window fallback
  const hitMap = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of hitMap.entries()) {
      if (now > data.resetTime) hitMap.delete(ip);
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
    const now = Date.now();
    const data = hitMap.get(ip) || { count: 0, resetTime: now + windowMs };
    if (now > data.resetTime) {
      data.count = 0;
      data.resetTime = now + windowMs;
    }
    data.count++;
    hitMap.set(ip, data);
    if (data.count > max) {
      if (typeof message === 'object') {
        return res.status(429).json(message);
      }
      return res.status(429).send(message);
    }
    next();
  };
}

const loginLimiter = createLimiter(15 * 60 * 1000, 5, 'Too many failed login attempts. Please try again in 15 minutes.');
const leadApiLimiter = createLimiter(60 * 60 * 1000, 30, { error: 'Inquiry limit reached from this IP. Please try again later.' });

app.use('/login', (req, res, next) => {
  if (req.method === 'POST') {
    return loginLimiter(req, res, next);
  }
  next();
});

// Layer 6: Static Assets Serving
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../tiffany-webb-astro/public/uploads')));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Auth middleware for dashboard pages (Secure Cookie + JWT Verification)
const requireAuth = async (req, res, next) => {
  const cookies = parseCookies(req);
  const token = cookies.auth_token;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.query('SELECT id, name, email, role, is_active FROM users WHERE id = ?', [decoded.id]);
    if (users.length === 0 || !users[0].is_active) {
      res.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict' });
      return res.redirect('/login?error=' + encodeURIComponent('Session expired or account deactivated'));
    }
    req.user = users[0];
    res.locals.currentUser = users[0];
    next();
  } catch (err) {
    res.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict' });
    return res.redirect('/login');
  }
};

// --- API Routes (Phase 1) ---

// Public Lead API Limiter applied to external inquiries
app.post('/api/leads', (req, res, next) => {
  if (req.body && req.body.is_manual) {
    return next();
  }
  return leadApiLimiter(req, res, next);
}, async (req, res) => {
  try {
    const { 
      contact_name, organization_name, email, country_code, phone, 
      event_type, event_date, event_location, estimated_audience_size, 
      message, source, source_section, source_card, topic_interest, budget_range, is_manual 
    } = req.body;
    
    // MySQL DATE column requires YYYY-MM-DD or null. If we get a string that isn't a valid date, we set it to null.
    let validDate = null;
    if (event_date) {
        const d = new Date(event_date);
        if (!isNaN(d.getTime())) {
            validDate = d.toISOString().split('T')[0];
        }
    }

    const [result] = await pool.query(`
      INSERT INTO leads (
        source, source_section, source_card, contact_name, organization_name, 
        email, country_code, phone, event_type, topic_interest, event_date, 
        event_location, estimated_audience_size, budget_range, message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      source || 'website_form',
      source_section || 'Direct / General Inquiry',
      source_card || null,
      contact_name,
      organization_name,
      email,
      country_code || null,
      phone,
      event_type,
      topic_interest || null,
      validDate,
      event_location,
      estimated_audience_size || null,
      budget_range || null,
      message
    ]);
    
    // Log detailed activity with origin card
    const originDetail = source_card ? `Inquiry via ${source_section || 'Website'} (${source_card})` : `Inquiry via ${source_section || 'Website'}`;
    await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [result.insertId, 'lead_created', originDetail]);
    
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

// Check Duplicate Lead API
app.get('/api/leads/check-duplicate', requireAuth, async (req, res) => {
  try {
    const { email, phone } = req.query;
    if (!email && !phone) {
      return res.json({ isDuplicate: false });
    }
    const conditions = [];
    const params = [];
    if (email && email.trim()) {
      conditions.push('LOWER(email) = LOWER(?)');
      params.push(email.trim());
    }
    if (phone && phone.trim()) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length >= 7) {
        conditions.push("REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ?");
        params.push(`%${cleanPhone.slice(-7)}%`);
      } else {
        conditions.push('phone = ?');
        params.push(phone.trim());
      }
    }
    if (conditions.length === 0) {
      return res.json({ isDuplicate: false });
    }
    const [matches] = await pool.query(
      `SELECT id, contact_name, email, phone, status, organization_name, created_at FROM leads WHERE ${conditions.join(' OR ')} ORDER BY created_at DESC LIMIT 1`,
      params
    );
    if (matches.length > 0) {
      return res.json({ isDuplicate: true, lead: matches[0] });
    }
    res.json({ isDuplicate: false });
  } catch (err) {
    console.error('Duplicate check error:', err);
    res.status(500).json({ error: 'Duplicate check failed' });
  }
});

app.post('/webhooks/gupshup', async (req, res) => {
  try {
    // Basic Gupshup webhook handler logic
    const payload = req.body;
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
  const error = req.query.error || null;
  res.render('login', { error, success });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.render('login', { error: 'Invalid email or password', success: null });
    }
    
    const user = users[0];
    if (user.is_active === 0) {
      return res.render('login', { error: 'Your account has been deactivated. Please contact an administrator.', success: null });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('login', { error: 'Invalid email or password', success: null });
    }
    
    // Sign JWT token and set secure HTTP-only cookie
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Server error during authentication', success: null });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('auth_token', { httpOnly: true, sameSite: 'strict' });
  res.redirect('/login');
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

// User Management
app.get('/users', requireAuth, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, is_active, last_login_at FROM users ORDER BY created_at DESC');
    res.render('users', { 
      users,
      currentUser: res.locals.currentUser || req.user || { id: 1, role: 'admin' },
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
    await pool.query('INSERT INTO users (name, email, role, password_hash, is_active) VALUES (?, ?, ?, ?, 1)', [name, email, role, hashedPassword]);
    
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

app.post('/users/:id/revoke-session', requireAuth, async (req, res) => {
  try {
    const [userToRevoke] = await pool.query('SELECT role FROM users WHERE id = ?', [req.params.id]);
    if (userToRevoke.length === 0) return res.redirect('/users?error=User not found');
    
    // Revoke access by deactivating account
    await pool.query('UPDATE users SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.redirect('/users?success=User session and access revoked successfully');
  } catch (err) {
    console.error(err);
    res.redirect('/users?error=Failed to revoke user session');
  }
});

app.post('/users/:id/toggle-status', requireAuth, async (req, res) => {
  try {
    const [userToToggle] = await pool.query('SELECT is_active, role FROM users WHERE id = ?', [req.params.id]);
    if (userToToggle.length === 0) return res.redirect('/users?error=User not found');
    
    const newStatus = userToToggle[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.redirect(`/users?success=User account ${newStatus ? 'activated' : 'deactivated'} successfully`);
  } catch (err) {
    console.error(err);
    res.redirect('/users?error=Failed to toggle user status');
  }
});

app.post('/users/:id/delete', requireAuth, async (req, res) => {
  try {
    const [userToDelete] = await pool.query('SELECT role FROM users WHERE id = ?', [req.params.id]);
    if (userToDelete.length > 0 && userToDelete[0].role === 'admin') {
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
      definedCollections = ['impact_band', 'credibility_bar', 'expertise', 'who_can_benefit', 'speaking', 'events', 'proof_attributes', 'proof_testimonials', 'social_links', 'video_reels'];
    } else if (page.slug === 'services') {
      definedCollections = ['capabilities', 'gear_method', 'gear_steps', 'partnership_framework', 'how_tiffany_helps'];
    } else if (page.slug === 'speaking-topics') {
      definedCollections = ['tracks_list'];
    } else if (page.slug === 'insights') {
      definedCollections = ['articles'];
    } else if (page.slug === 'impact') {
      definedCollections = ['outcome_stories', 'past_engagements', 'events', 'testimonials'];
    } else if (page.slug === 'media') {
      definedCollections = ['bios', 'downloads', 'press_kit'];
    } else if (page.slug === 'about') {
      definedCollections = ['story_vignettes'];
    }

    const allCollectionSectionNames = Object.keys(collectionSections);
    definedCollections = Array.from(new Set([...definedCollections, ...allCollectionSectionNames]));

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
app.post('/cms/:slug/collection/:section/new', requireAuth, collectionUpload, async (req, res) => {
  try {
    const [pages] = await pool.query('SELECT * FROM website_pages WHERE slug = ?', [req.params.slug]);
    if (pages.length === 0) return res.status(404).send('Page not found');
    
    if (req.params.section === 'events') {
      const [existing] = await pool.query('SELECT COUNT(*) as count FROM website_collections WHERE page_id = ? AND section_name = ?', [pages[0].id, req.params.section]);
      if (existing[0].count >= 3) {
        return res.redirect(`/cms/${req.params.slug}?error=Maximum+of+3+events+allowed+on+the+showcase`);
      }
    }

    const { title, subtitle, badge, content_html, link_url, existing_video_url, image_url, icon_svg, sort_order } = req.body;
    let finalImageUrl = image_url || null;
    if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
      finalImageUrl = '/uploads/' + req.files['image_file'][0].filename;
    } else if (req.file && req.file.fieldname === 'image_file') {
      finalImageUrl = '/uploads/' + req.file.filename;
    } else if (finalImageUrl) {
      finalImageUrl = saveBase64Image(finalImageUrl);
    }

    let finalLinkUrl = link_url || existing_video_url || null;
    if (req.files && req.files['video_file'] && req.files['video_file'][0]) {
      finalLinkUrl = '/uploads/videos/' + req.files['video_file'][0].filename;
    } else if (req.file && req.file.fieldname === 'video_file') {
      finalLinkUrl = '/uploads/videos/' + req.file.filename;
    }
    
    await pool.query(
      'INSERT INTO website_collections (page_id, section_name, title, subtitle, badge, link_url, content_html, image_url, icon_svg, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [pages[0].id, req.params.section, title || null, subtitle || null, badge || null, finalLinkUrl, content_html || null, finalImageUrl, icon_svg || null, sort_order || 0]
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
app.post('/cms/:slug/collection/:section/:id/edit', requireAuth, collectionUpload, async (req, res) => {
  try {
    const { title, subtitle, badge, content_html, link_url, existing_video_url, image_url, icon_svg, sort_order } = req.body;
    
    let finalImageUrl = image_url || null;
    if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
      finalImageUrl = '/uploads/' + req.files['image_file'][0].filename;
    } else if (req.file && req.file.fieldname === 'image_file') {
      finalImageUrl = '/uploads/' + req.file.filename;
    } else if (finalImageUrl) {
      finalImageUrl = saveBase64Image(finalImageUrl);
    }

    let finalLinkUrl = link_url || existing_video_url || null;
    if (req.files && req.files['video_file'] && req.files['video_file'][0]) {
      finalLinkUrl = '/uploads/videos/' + req.files['video_file'][0].filename;
    } else if (req.file && req.file.fieldname === 'video_file') {
      finalLinkUrl = '/uploads/videos/' + req.file.filename;
    }
    
    await pool.query(
      'UPDATE website_collections SET title=?, subtitle=?, badge=?, link_url=?, content_html=?, image_url=?, icon_svg=?, sort_order=? WHERE id=?',
      [title || null, subtitle || null, badge || null, finalLinkUrl, content_html || null, finalImageUrl, icon_svg || null, sort_order || 0, req.params.id]
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
    if (req.xhr || req.headers.accept?.includes('application/json') || req.is('json') || req.headers['content-type']?.includes('application/json')) {
      return res.json({ success: true, status });
    }
    res.redirect(`/lead/${req.params.id}`);
  } catch (err) {
    console.error(err);
    if (req.xhr || req.headers.accept?.includes('application/json') || req.is('json') || req.headers['content-type']?.includes('application/json')) {
      return res.status(500).json({ error: 'Error updating status' });
    }
    res.status(500).send('Error updating status');
  }
});

// Edit Lead Details
app.post('/lead/:id/edit', requireAuth, async (req, res) => {
  try {
    const { contact_name, organization_name, email, country_code, phone, event_type, topic_interest, event_date, event_location, estimated_audience_size, budget_range, message } = req.body;
    
    let validDate = null;
    if (event_date) {
        const d = new Date(event_date);
        if (!isNaN(d.getTime())) {
            validDate = d.toISOString().split('T')[0];
        }
    }

    await pool.query(`
      UPDATE leads 
      SET contact_name = ?, organization_name = ?, email = ?, country_code = ?, phone = ?, event_type = ?, topic_interest = ?, event_date = ?, event_location = ?, estimated_audience_size = ?, budget_range = ?, message = ?
      WHERE id = ?
    `, [contact_name, organization_name, email, country_code || null, phone, event_type, topic_interest || null, validDate, event_location, estimated_audience_size || null, budget_range || null, message || null, req.params.id]);
    
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
        if (req.xhr || req.headers.accept?.includes('application/json') || req.is('json') || req.headers['content-type']?.includes('application/json')) {
            return res.json({ success: true, message: 'Lead deleted successfully' });
        }
        res.redirect('/dashboard?success=Lead deleted successfully');
    } catch (err) {
        console.error('Delete error:', err);
        if (req.xhr || req.headers.accept?.includes('application/json') || req.is('json') || req.headers['content-type']?.includes('application/json')) {
            return res.status(500).json({ error: 'Cannot delete lead due to database constraint' });
        }
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
          INSERT INTO leads (
            source, source_section, source_card, contact_name, organization_name, 
            email, country_code, phone, event_type, topic_interest, event_date, 
            event_location, estimated_audience_size, budget_range, message
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          lead.source || 'csv_upload', 
          lead.source_section || 'Batch CSV Import',
          lead.source_card || null,
          lead.contact_name || lead.name || 'Unknown', 
          lead.organization_name || lead.org || null, 
          lead.email || null, 
          lead.country_code || null,
          lead.phone || null, 
          lead.event_type || null, 
          lead.topic_interest || lead.topic || null,
          validDate, 
          lead.event_location || lead.location || null, 
          lead.estimated_audience_size || lead.size || null, 
          lead.budget_range || lead.budget || null,
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
      // Skip API, CRM, and static uploads routes so they are handled by Express
      if (req.path.startsWith('/api') || req.path.startsWith('/cms') || 
          req.path.startsWith('/dashboard') || req.path.startsWith('/login') || 
          req.path.startsWith('/users') || req.path.startsWith('/lead') ||
          req.path.startsWith('/uploads')) {
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
