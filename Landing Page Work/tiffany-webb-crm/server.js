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
app.set('trust proxy', 1);
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
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = (file.mimetype || '').toLowerCase();
    if (file.fieldname === 'video_file') {
      const allowedExts = ['.mp4', '.webm', '.mov'];
      const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-quicktime', 'video/mov'];
      if (!allowedExts.includes(ext) || !allowedMimes.includes(mimetype)) {
        return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
      }
      return cb(null, true);
    }
    if (file.fieldname === 'image_file' || file.fieldname.startsWith('image_upload_') || file.fieldname === 'image') {
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/pjpeg', 'image/x-png'];
      if (!allowedExts.includes(ext) || !allowedMimes.includes(mimetype)) {
        return cb(new Error('Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed'));
      }
      return cb(null, true);
    }
    cb(new Error('File upload type not allowed'));
  }
});

const collectionUpload = upload.fields([
  { name: 'image_file', maxCount: 1 },
  { name: 'video_file', maxCount: 1 }
]);

// Database pool strictly configured from environment variables with SSL support
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tiffany_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = { rejectUnauthorized: false };
}
const pool = mysql.createPool(dbConfig);

// Ensure database tables and schema migrations (Follow-up Engine Task 05)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lead_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        user_id INT NULL,
        author_name VARCHAR(150) NOT NULL,
        author_role VARCHAR(50) NOT NULL DEFAULT 'staff',
        note TEXT NOT NULL,
        followup_date DATE NULL,
        followup_time TIME NULL,
        followup_at DATETIME NULL,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        alert_sent BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Verify and add missing columns dynamically on existing databases
    const [cols] = await pool.query('SHOW COLUMNS FROM lead_notes');
    const colNames = cols.map(c => c.Field);
    if (!colNames.includes('followup_date')) {
      await pool.query('ALTER TABLE lead_notes ADD COLUMN followup_date DATE NULL');
    }
    if (!colNames.includes('followup_time')) {
      await pool.query('ALTER TABLE lead_notes ADD COLUMN followup_time TIME NULL');
    }
    if (!colNames.includes('followup_at')) {
      await pool.query('ALTER TABLE lead_notes ADD COLUMN followup_at DATETIME NULL');
    }
    if (!colNames.includes('is_completed')) {
      await pool.query('ALTER TABLE lead_notes ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT FALSE');
    }
    if (!colNames.includes('alert_sent')) {
      await pool.query('ALTER TABLE lead_notes ADD COLUMN alert_sent BOOLEAN NOT NULL DEFAULT FALSE');
    }
    console.log('[Database] lead_notes table and follow-up engine schema verified.');
  } catch (err) {
    console.error('[Database Migration Warning]:', err.message);
  }
})();

// Reusable Mail Transporter Helper
function createMailTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.EMAIL_SECURE === 'true' || port === 465;
  const user = process.env.EMAIL_HOST_USER || '';
  const pass = process.env.EMAIL_HOST_PASSWORD || process.env.EMAIL_HOST_PASS || '';

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

// Helper: Save base64 cropped image to uploads directory with strict MIME whitelist
function saveBase64Image(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  try {
    const trimmed = dataUrl.trim();
    const matches = trimmed.match(/^data:image\/([a-zA-Z0-9_\-\+]+);base64,([\s\S]+)$/);
    if (!matches || matches.length !== 3) {
      console.warn('[Impact OS Security] Rejected malformed base64 image data URL');
      return null;
    }

    const rawSubtype = matches[1].toLowerCase();
    const safeImageSubtypes = {
      'jpeg': 'jpg',
      'jpg': 'jpg',
      'png': 'png',
      'webp': 'webp',
      'gif': 'gif'
    };

    const ext = safeImageSubtypes[rawSubtype];
    if (!ext) {
      console.warn(`[Impact OS Security] Blocked base64 image upload with disallowed MIME subtype: "${rawSubtype}"`);
      return null;
    }

    const base64Data = matches[2].replace(/\s+/g, '');
    const buffer = Buffer.from(base64Data, 'base64');
    if (buffer.length === 0 || buffer.length > 10 * 1024 * 1024) {
      console.warn(`[Impact OS Security] Blocked base64 image upload with invalid payload size (${buffer.length} bytes)`);
      return null;
    }

    const uploadDir = path.join(__dirname, '../tiffany-webb-astro/public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `${Date.now()}-cropped-${Math.round(Math.random() * 1E9)}.${ext}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);
    return `/uploads/${filename}`;
  } catch (e) {
    console.error('[Impact OS Security] Error saving base64 image:', e);
    return null;
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

// Security: Strict JWT secret validation
if (!process.env.JWT_SECRET) {
  console.error('[FATAL SECURITY ERROR] process.env.JWT_SECRET is missing. Server aborted.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// --- 8-Layer Cyber-Attack Security Suite ---

// Layer 1: Helmet HTTP Headers & Clickjacking Defense
let helmet;
try {
  helmet = require('helmet');
} catch (e) {}

if (helmet) {
  app.use(helmet({
    contentSecurityPolicy: false, // Allows inline EJS script tags
    frameguard: { action: 'deny' }, // Prevents Clickjacking
    noSniff: true
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
  'https://tiffanywebbimpact.com',
  'https://www.tiffanywebbimpact.com',
  'https://crm.tiffanywebbimpact.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Layer 3: Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Layer 4: Recursive XSS Input Sanitization
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  let prev;
  let clean = str;
  let iterations = 0;
  do {
    prev = clean;
    clean = clean
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<script\b[^>]*>/gi, '')
      .replace(/<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<iframe\b[^>]*>/gi, '')
      .replace(/<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/onload\s*=/gi, '')
      .replace(/onerror\s*=/gi, '')
      .replace(/onclick\s*=/gi, '')
      .replace(/onmouseover\s*=/gi, '');
    iterations++;
  } while (clean !== prev && iterations < 25);
  return clean;
}

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return sanitizeString(value);
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

const sanitizeMulterBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  next();
};

let xss;
try {
  xss = require('xss-clean');
} catch (e) {}

if (xss) {
  try {
    app.use(xss());
  } catch (e) {}
}

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  next();
});

// Layer 5: Rate Limiting Suite (Brute Force & DoS Defense)
let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {}

function createLimiter(windowMs, max, message, options = {}) {
  if (rateLimit) {
    return rateLimit({
      windowMs,
      max,
      message: typeof message === 'object' ? message : { error: message },
      standardHeaders: true,
      legacyHeaders: false,
      ...options
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
    if (data.count >= max) {
      if (typeof message === 'object') {
        return res.status(429).json(message);
      }
      return res.status(429).send(message);
    }
    if (options.skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          data.count++;
          hitMap.set(ip, data);
        }
      });
    } else {
      data.count++;
      hitMap.set(ip, data);
    }
    next();
  };
}

const loginLimiter = createLimiter(
  15 * 60 * 1000,
  5,
  'Too many failed login attempts. Please try again in 15 minutes.',
  { skipSuccessfulRequests: true }
);
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
      event_type: raw_event_type, event_type_other,
      topic_interest: raw_topic_interest, topic_interest_other,
      event_date, event_location, estimated_audience_size, 
      message, source, source_section, source_card, budget_range, is_manual 
    } = req.body;
    
    // Validate "At Least One Identifier" rule
    const hasIdentifier = (contact_name && String(contact_name).trim().length > 0) ||
                          (phone && String(phone).trim().length > 0) ||
                          (email && String(email).trim().length > 0);
    if (!hasIdentifier) {
      if (is_manual) {
        return res.redirect('/leads/new?error=' + encodeURIComponent('Please provide at least one contact method: Name, Phone Number, or Email Address.'));
      }
      return res.status(400).json({ error: 'Please provide at least one contact method: Name, Phone Number, or Email Address.' });
    }

    // Handle "Other" custom text override if provided
    let event_type = raw_event_type || null;
    if (event_type === 'Other' && event_type_other && String(event_type_other).trim().length > 0) {
      event_type = `Other: ${String(event_type_other).trim()}`;
    }
    let topic_interest = raw_topic_interest || null;
    if (topic_interest === 'Other' && topic_interest_other && String(topic_interest_other).trim().length > 0) {
      topic_interest = `Other: ${String(topic_interest_other).trim()}`;
    }

    // MySQL DATE column requires YYYY-MM-DD or null. If we get a string that isn't a valid date, we set it to null.
    let validDate = null;
    if (event_date) {
        const d = new Date(event_date);
        if (!isNaN(d.getTime())) {
            validDate = d.toISOString().split('T')[0];
        }
    }

    const safeSource = (source && ['website_form', 'whatsapp', 'instagram', 'email', 'referral', 'manual'].includes(source)) ? source : (is_manual ? 'manual' : 'website_form');

    const [result] = await pool.query(`
      INSERT INTO leads (
        source, source_section, source_card, contact_name, organization_name, 
        email, country_code, phone, event_type, topic_interest, event_date, 
        event_location, estimated_audience_size, budget_range, message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      safeSource,
      source_section || 'Direct / General Inquiry',
      source_card || null,
      contact_name ? String(contact_name).trim() : null,
      organization_name ? String(organization_name).trim() : null,
      email ? String(email).trim() : null,
      country_code || null,
      phone ? String(phone).trim() : null,
      event_type,
      topic_interest,
      validDate,
      event_location ? String(event_location).trim() : null,
      estimated_audience_size || null,
      budget_range || null,
      message ? String(message).trim() : null
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
    if (req.body && req.body.is_manual) {
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

// --- Persistent Multi-User Client Notes & Follow-Up Scheduler Endpoints ---

// POST /api/leads/:id/notes (Add Persistent Note & Schedule Follow-Up)
app.post('/api/leads/:id/notes', requireAuth, async (req, res) => {
  try {
    const leadId = req.params.id;
    const { note, followup_date: raw_date, followup_time: raw_time } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Note content cannot be empty' });
    }

    // Author identity is strictly resolved from verified JWT session
    const authorName = req.user.name;
    const authorRole = req.user.role || 'staff';
    const userId = req.user.id;

    // Follow-up scheduling calculation
    let followup_date = null;
    let followup_time = null;
    let followup_at = null;

    if (raw_date && String(raw_date).trim().length > 0) {
      followup_date = String(raw_date).trim();
      followup_time = (raw_time && String(raw_time).trim().length > 0) 
        ? String(raw_time).trim() 
        : '09:00:00';
      if (followup_time.length === 5) followup_time += ':00';
      followup_at = `${followup_date} ${followup_time}`;
    }

    const [result] = await pool.query(`
      INSERT INTO lead_notes (lead_id, user_id, author_name, author_role, note, followup_date, followup_time, followup_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [leadId, userId, authorName, authorRole, note.trim(), followup_date, followup_time, followup_at]);

    // Record note in Activity Log so all users see it
    const summary = note.trim().length > 60 ? note.trim().substring(0, 60) + '...' : note.trim();
    const actionDetail = followup_at 
      ? `Internal note & follow-up scheduled for ${followup_date} by ${authorName} (${authorRole}): "${summary}"`
      : `Internal note by ${authorName} (${authorRole}): "${summary}"`;

    await pool.query(`
      INSERT INTO activity_log (lead_id, user_id, action, detail)
      VALUES (?, ?, 'note_added', ?)
    `, [leadId, userId, actionDetail]);

    res.json({
      success: true,
      note: {
        id: result.insertId,
        author_name: authorName,
        author_role: authorRole,
        note: note.trim(),
        followup_date,
        followup_time,
        followup_at,
        is_completed: false,
        created_at: new Date()
      }
    });
  } catch (err) {
    console.error('[Add Note Error]:', err.message);
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// GET /api/leads/:id/notes (Retrieve Lead Notes & Follow-ups)
app.get('/api/leads/:id/notes', requireAuth, async (req, res) => {
  try {
    const [notes] = await pool.query(`
      SELECT id, author_name, author_role, note, followup_date, followup_time, followup_at, is_completed, created_at 
      FROM lead_notes 
      WHERE lead_id = ? 
      ORDER BY created_at DESC
    `, [req.params.id]);
    res.json({ success: true, notes });
  } catch (err) {
    console.error('[Get Notes Error]:', err.message);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});


// POST /api/leads/notes/:noteId/toggle-complete
app.post('/api/leads/notes/:noteId/toggle-complete', requireAuth, async (req, res) => {
  try {
    const { noteId } = req.params;
    const [notes] = await pool.query('SELECT is_completed, lead_id FROM lead_notes WHERE id = ?', [noteId]);
    if (notes.length === 0) return res.status(404).json({ error: 'Note not found' });
    const newStatus = notes[0].is_completed ? 0 : 1;
    await pool.query('UPDATE lead_notes SET is_completed = ? WHERE id = ?', [newStatus, noteId]);
    res.json({ success: true, is_completed: newStatus });
  } catch (err) {
    console.error('[Toggle Note Complete Error]:', err.message);
    res.status(500).json({ error: 'Failed to update note status' });
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

// --- Impact OS Routes (EJS) ---

// Root Entry Point: Redirect to Login (if unauthenticated) or Dashboard (if authenticated)
app.get('/', (req, res) => {
  const cookies = parseCookies(req);
  const token = cookies.auth_token;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    jwt.verify(token, JWT_SECRET);
    return res.redirect('/dashboard');
  } catch (err) {
    return res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  const success = req.query.reset === 'success' ? 'Password reset successfully. You can now log in.' : null;
  const error = req.query.error || null;
  res.render('login', { error, success });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || !String(email).trim() || !String(password).trim()) {
    return res.status(400).render('login', { error: 'Email and password are required', success: null });
  }
  try {
    const cleanEmail = String(email).trim();
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (users.length === 0) {
      return res.status(401).render('login', { error: 'Invalid email or password', success: null });
    }
    
    const user = users[0];
    if (user.is_active === 0) {
      return res.status(403).render('login', { error: 'Your account has been deactivated. Please contact an administrator.', success: null });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).render('login', { error: 'Invalid email or password', success: null });
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
    console.error('Login authentication error:', err);
    res.status(500).render('login', { error: 'Server error during authentication', success: null });
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

    const transporter = createMailTransporter();
    if (transporter) {
      await transporter.sendMail({
        from: `"Tiffany Webb Impact OS" <${process.env.EMAIL_HOST_USER || 'booking@tiffanywebbimpact.com'}>`,
        to: user.email,
        subject: 'Password Reset OTP — Tiffany Webb Impact OS',
        html: `<p>You requested a password reset for Tiffany Webb Impact OS™.</p><p>Your 6-digit OTP is: <strong>${otp}</strong></p><p>This OTP is valid for 15 minutes. If you didn't request this, please ignore this email.</p>`
      });
    } else {
      console.warn(`[Impact OS Auth Warning] Mail transporter not configured. OTP generated for ${user.email}: ${otp}`);
    }

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
    // Join bookings to get confirmed revenue & event dates + active follow-up subquery
    const [leads] = await pool.query(`
      SELECT l.*, b.fee_amount, b.confirmed_date, b.deposit_status,
        (SELECT CONCAT(DATE_FORMAT(ln.followup_at, '%e %b, %l:%i %p'), ' · "', SUBSTRING(ln.note, 1, 30), (CASE WHEN LENGTH(ln.note) > 30 THEN '..."' ELSE '"' END))
         FROM lead_notes ln 
         WHERE ln.lead_id = l.id AND ln.followup_at IS NOT NULL AND ln.is_completed = 0
         ORDER BY ln.followup_at ASC LIMIT 1) AS active_followup
      FROM leads l 
      LEFT JOIN bookings b ON l.id = b.lead_id 
      ORDER BY l.created_at DESC
    `);
    
    // Aggregations for charts
    const sourceData = {};
    const funnelData = { new: 0, qualified: 0, proposal_sent: 0, booked: 0, completed: 0 };
    
    let totalConfirmedRevenue = 0;
    leads.forEach(lead => {
      // Aggregate sources
      sourceData[lead.source] = (sourceData[lead.source] || 0) + 1;
      
      // Aggregate funnel
      if (funnelData[lead.status] !== undefined) {
        funnelData[lead.status]++;
      }
      // Calculate confirmed revenue for booked / completed deals
      if ((lead.status === 'booked' || lead.status === 'completed') && lead.fee_amount) {
        totalConfirmedRevenue += Number(lead.fee_amount) || 0;
      }
    });
    res.render('dashboard', { 
        leads, 
        totalConfirmedRevenue,
        chartData: JSON.stringify({ sourceData, funnelData }),
        error: req.query.error,
        success: req.query.success
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
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
app.post('/cms/:slug/collection/:section/new', requireAuth, collectionUpload, sanitizeMulterBody, async (req, res) => {
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
app.post('/cms/:slug/collection/:section/:id/edit', requireAuth, collectionUpload, sanitizeMulterBody, async (req, res) => {
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

app.post('/cms/:slug', requireAuth, upload.any(), sanitizeMulterBody, async (req, res) => {
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
    const [notes] = await pool.query(`
      SELECT id, author_name, author_role, note, followup_date, followup_time, followup_at, is_completed, created_at 
      FROM lead_notes 
      WHERE lead_id = ? 
      ORDER BY created_at DESC
    `, [req.params.id]);
    
    res.render('lead', { lead: leads[0], messages, activity, notes });
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

// POST Batch Leads (CSV / XLSX Upload)
app.post('/api/leads/batch', requireAuth, async (req, res) => {
  try {
    const leads = req.body.leads; // Expecting JSON array from PapaParse / SheetJS
    if (!Array.isArray(leads) || leads.length === 0) {
        return res.status(400).json({ error: 'No leads provided' });
    }

    let inserted = 0;
    for (const lead of leads) {
        const contactName = (lead.contact_name || lead.name || '').trim();
        const phone = (lead.phone || '').trim();
        const email = (lead.email || '').trim();

        // Require at least one contact identifier per row
        const hasIdentifier = contactName.length > 0 || phone.length > 0 || email.length > 0;
        if (!hasIdentifier) {
            continue; // Gracefully skip empty/non-identified row without failing batch
        }

        let validDate = null;
        const rawDate = lead.event_date || lead.date;
        if (rawDate) {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
                validDate = d.toISOString().split('T')[0];
            }
        }

        let event_type = (lead.event_type || lead.type || '').trim() || null;
        if (event_type === 'Other' && (lead.event_type_other || lead.custom_event)) {
          const otherVal = (lead.event_type_other || lead.custom_event).trim();
          if (otherVal) event_type = `Other: ${otherVal}`;
        }

        let topic_interest = (lead.topic_interest || lead.topic || '').trim() || null;
        if (topic_interest === 'Other' && (lead.topic_interest_other || lead.custom_topic)) {
          const otherVal = (lead.topic_interest_other || lead.custom_topic).trim();
          if (otherVal) topic_interest = `Other: ${otherVal}`;
        }
        
        const [result] = await pool.query(`
          INSERT INTO leads (
            source, source_section, source_card, contact_name, organization_name, 
            email, country_code, phone, event_type, topic_interest, event_date, 
            event_location, estimated_audience_size, budget_range, message
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          (lead.source && ['website_form', 'whatsapp', 'instagram', 'email', 'referral', 'manual'].includes(lead.source)) ? lead.source : 'manual', 
          lead.source_section || 'Batch CSV Import',
          lead.source_card || null,
          contactName || null, 
          (lead.organization_name || lead.org || '').trim() || null, 
          email || null, 
          lead.country_code || null, 
          phone || null, 
          event_type, 
          topic_interest,
          validDate, 
          (lead.event_location || lead.location || '').trim() || null, 
          (lead.estimated_audience_size || lead.size || '').trim() || null, 
          (lead.budget_range || lead.budget || '').trim() || null,
          (lead.message || lead.notes || '').trim() || null
        ]);
        if (result && result.insertId) {
          await pool.query('INSERT INTO activity_log (lead_id, action, detail) VALUES (?, ?, ?)', [
            result.insertId,
            'lead_created',
            `Lead imported via Batch Spreadsheet (${contactName || email || phone || 'New Lead'})`
          ]);
        }
        inserted++;
    }
    
    res.json({ success: true, count: inserted });
  } catch (err) {
    console.error('Batch import error:', err);
    res.status(500).json({ error: 'Database error processing batch' });
  }
});

// ==============================================================================
// AUTONOMOUS EMAIL ENGINE: 8:00 AM Daily Briefing & 1-Hour Action Alerts (Task 05)
// ==============================================================================

let lastMorningBriefingDate = null;

async function checkAndSendMorningBriefing() {
  try {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Trigger daily at 8:00 AM local time (once per calendar day)
    if (now.getHours() === 8 && lastMorningBriefingDate !== todayStr) {
      const transporter = createMailTransporter();
      const targetEmail = process.env.BRIEFING_EMAIL || process.env.EMAIL_HOST_USER || 'booking@tiffanywebbimpact.com';

      if (!transporter) {
        console.log('[Morning Briefing] Mailer credentials not configured in .env. Skipping briefing delivery.');
        lastMorningBriefingDate = todayStr;
        return;
      }

      // 1. Follow-ups due today
      const [dueToday] = await pool.query(`
        SELECT ln.*, l.contact_name, l.organization_name, l.phone, l.email, l.status, l.source_section 
        FROM lead_notes ln
        JOIN leads l ON ln.lead_id = l.id
        WHERE DATE(ln.followup_at) = CURDATE() AND ln.is_completed = 0
        ORDER BY ln.followup_at ASC
      `);

      // 2. Overdue deals / follow-ups
      const [overdue] = await pool.query(`
        SELECT ln.*, l.contact_name, l.organization_name, l.phone, l.email, l.status, l.source_section 
        FROM lead_notes ln
        JOIN leads l ON ln.lead_id = l.id
        WHERE ln.followup_at < NOW() AND DATE(ln.followup_at) < CURDATE() AND ln.is_completed = 0
        ORDER BY ln.followup_at ASC
      `);

      // 3. New overnight inquiries in last 24 hours
      const [overnightLeads] = await pool.query(`
        SELECT * FROM leads 
        WHERE created_at >= NOW() - INTERVAL 24 HOUR AND status = 'new'
        ORDER BY created_at DESC
      `);

      const crmUrl = process.env.CRM_URL || 'https://crm.tiffanywebbimpact.com';

      const briefingHtml = `
        <div style="background: #0D0C08; color: #FBF6EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid rgba(217,162,58,0.25);">
          <div style="border-bottom: 1px solid rgba(217,162,58,0.2); padding-bottom: 1rem; margin-bottom: 1.5rem;">
            <span style="color: #D9A23A; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">Tiffany Webb Impact OS™</span>
            <h1 style="color: #FBF6EA; font-size: 1.6rem; margin: 0.5rem 0 0;">🌅 Daily Morning Executive Briefing</h1>
            <p style="color: rgba(251,246,234,0.6); font-size: 0.85rem; margin-top: 0.25rem;">Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <!-- Summary KPI Strip -->
          <div style="display: flex; gap: 10px; margin-bottom: 1.5rem;">
            <div style="flex: 1; background: #1C1A14; border: 1px solid rgba(217,162,58,0.2); border-radius: 8px; padding: 12px; text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 700; color: #D9A23A;">${dueToday.length}</div>
              <div style="font-size: 0.72rem; color: rgba(251,246,234,0.6); text-transform: uppercase;">Due Today</div>
            </div>
            <div style="flex: 1; background: #1C1A14; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 12px; text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 700; color: #ef4444;">${overdue.length}</div>
              <div style="font-size: 0.72rem; color: rgba(251,246,234,0.6); text-transform: uppercase;">Overdue</div>
            </div>
            <div style="flex: 1; background: #1C1A14; border: 1px solid rgba(56,189,248,0.3); border-radius: 8px; padding: 12px; text-align: center;">
              <div style="font-size: 1.4rem; font-weight: 700; color: #38bdf8;">${overnightLeads.length}</div>
              <div style="font-size: 0.72rem; color: rgba(251,246,234,0.6); text-transform: uppercase;">New Inquiries</div>
            </div>
          </div>

          <!-- Follow-ups Due Today -->
          <div style="margin-bottom: 1.5rem;">
            <h3 style="color: #D9A23A; font-size: 1rem; border-bottom: 1px solid rgba(217,162,58,0.15); padding-bottom: 6px; margin-bottom: 10px;">⏰ Follow-ups Due Today</h3>
            ${dueToday.length === 0 ? '<p style="color: rgba(251,246,234,0.5); font-size: 0.85rem; font-style: italic;">No follow-ups scheduled for today.</p>' : dueToday.map(f => {
              const timeStr = f.followup_at ? new Date(f.followup_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today';
              return `
                <div style="background: #1C1A14; border-left: 3px solid #D9A23A; border-radius: 4px; padding: 10px 12px; margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 0.9rem;">
                    <span>${f.organization_name || f.contact_name || 'Lead #' + f.lead_id}</span>
                    <span style="color: #D9A23A; font-size: 0.8rem;">${timeStr}</span>
                  </div>
                  <div style="color: rgba(251,246,234,0.85); font-size: 0.82rem; margin-top: 4px;">"${f.note}"</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Overnight Inquiries -->
          <div style="margin-bottom: 1.5rem;">
            <h3 style="color: #38bdf8; font-size: 1rem; border-bottom: 1px solid rgba(56,189,248,0.15); padding-bottom: 6px; margin-bottom: 10px;">📥 New Overnight Inquiries (Last 24h)</h3>
            ${overnightLeads.length === 0 ? '<p style="color: rgba(251,246,234,0.5); font-size: 0.85rem; font-style: italic;">No new inquiries received overnight.</p>' : overnightLeads.map(l => `
              <div style="background: #1C1A14; border-left: 3px solid #38bdf8; border-radius: 4px; padding: 10px 12px; margin-bottom: 8px;">
                <div style="font-weight: 700; font-size: 0.9rem;">${l.contact_name || 'Inquiry #' + l.id} ${l.organization_name ? `(${l.organization_name})` : ''}</div>
                <div style="color: rgba(251,246,234,0.7); font-size: 0.8rem;">Topic: ${l.topic_interest || l.event_type || 'General'} · Budget: ${l.budget_range || 'Not specified'}</div>
              </div>
            `).join('')}
          </div>

          <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(217,162,58,0.2);">
            <a href="${crmUrl}/dashboard" style="display: inline-block; background: #D9A23A; color: #0D0C08; text-decoration: none; font-weight: 700; padding: 10px 22px; border-radius: 6px; font-size: 0.88rem;">Open Impact OS Pipeline Ledger &rarr;</a>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Tiffany Webb Impact OS" <${process.env.EMAIL_HOST_USER || 'booking@tiffanywebbimpact.com'}>`,
        to: targetEmail,
        subject: `[Impact OS] Daily Morning Executive Briefing — ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        html: briefingHtml
      });

      console.log(`[Morning Briefing] 8:00 AM Executive Briefing email sent to ${targetEmail}`);
      lastMorningBriefingDate = todayStr;
    }
  } catch (err) {
    console.error('[Morning Briefing Error]:', err.message);
  }
}

async function checkAndSendFollowupAlerts() {
  try {
    const transporter = createMailTransporter();
    if (!transporter) return;

    // Find follow-ups due in the next 60 minutes (with 15 min retrospective grace) that have not been alerted yet
    const [upcoming] = await pool.query(`
      SELECT ln.*, l.contact_name, l.organization_name, l.phone, l.country_code, l.email, l.status, l.source_section
      FROM lead_notes ln
      JOIN leads l ON ln.lead_id = l.id
      WHERE ln.followup_at BETWEEN NOW() - INTERVAL 15 MINUTE AND NOW() + INTERVAL 60 MINUTE
        AND ln.is_completed = 0
        AND ln.alert_sent = 0
    `);

    for (const item of upcoming) {
      try {
        const targetEmail = process.env.BRIEFING_EMAIL || process.env.EMAIL_HOST_USER || 'booking@tiffanywebbimpact.com';
        const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
        let waPhone = cleanPhone;
        if (item.country_code) {
          const cleanCC = item.country_code.replace(/[^0-9]/g, '');
          if (cleanCC && !cleanPhone.startsWith(cleanCC)) {
            waPhone = cleanCC + cleanPhone;
          }
        }
        const crmUrl = process.env.CRM_URL || 'https://crm.tiffanywebbimpact.com';
        const timeFormatted = item.followup_at ? new Date(item.followup_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon';

        const alertHtml = `
          <div style="background: #0D0C08; color: #FBF6EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 550px; margin: 0 auto; border-radius: 12px; border: 1px solid #D9A23A;">
            <div style="border-bottom: 1px solid rgba(217,162,58,0.2); padding-bottom: 1rem; margin-bottom: 1.25rem;">
              <span style="color: #D9A23A; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">Tiffany Webb Impact OS™ · Action Alert</span>
              <h1 style="color: #FBF6EA; font-size: 1.4rem; margin: 0.35rem 0 0;">⚡ Follow-Up Due in 60 Minutes (${timeFormatted})</h1>
            </div>

            <div style="background: #1C1A14; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; border: 1px solid rgba(217,162,58,0.2);">
              <div style="font-size: 1.1rem; font-weight: 700; color: #FBF6EA;">${item.contact_name || 'Client'} ${item.organization_name ? `(${item.organization_name})` : ''}</div>
              <div style="color: #D9A23A; font-size: 0.85rem; margin-top: 2px;">Stage: ${(item.status || 'new').toUpperCase()}</div>
              <div style="background: rgba(217,162,58,0.08); border-left: 3px solid #D9A23A; padding: 8px 12px; border-radius: 4px; margin-top: 10px; color: #FBF6EA; font-size: 0.88rem;">
                <strong>Scheduled Note:</strong> "${item.note}"
              </div>
            </div>

            <!-- 1-Click Action Buttons -->
            <div style="display: flex; gap: 10px; margin-bottom: 1.5rem; flex-wrap: wrap;">
              ${waPhone ? `<a href="https://wa.me/${waPhone}" style="flex: 1; min-width: 130px; text-align: center; background: #25D366; color: #fff; text-decoration: none; font-weight: 700; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem;">💬 WhatsApp (+${waPhone})</a>` : ''}
              ${item.phone ? `<a href="tel:${item.phone}" style="flex: 1; min-width: 130px; text-align: center; background: #38bdf8; color: #0D0C08; text-decoration: none; font-weight: 700; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem;">📞 Call Client</a>` : ''}
              ${item.email ? `<a href="mailto:${item.email}" style="flex: 1; min-width: 130px; text-align: center; background: rgba(251,246,234,0.15); color: #FBF6EA; text-decoration: none; font-weight: 700; padding: 10px 14px; border-radius: 6px; font-size: 0.85rem;">✉️ Send Email</a>` : ''}
            </div>

            <div style="text-align: center; border-top: 1px solid rgba(217,162,58,0.15); padding-top: 1rem;">
              <a href="${crmUrl}/lead/${item.lead_id}" style="color: #D9A23A; font-size: 0.85rem; text-decoration: underline;">View Full Lead Dossier on Impact OS &rarr;</a>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Tiffany Webb Impact OS" <${process.env.EMAIL_HOST_USER || 'booking@tiffanywebbimpact.com'}>`,
          to: targetEmail,
          subject: `[Impact OS Alert] ⏰ Upcoming Follow-Up: ${item.contact_name || item.organization_name || 'Client'} at ${timeFormatted}`,
          html: alertHtml
        });

        // Mark alert_sent = 1 in database
        await pool.query('UPDATE lead_notes SET alert_sent = 1 WHERE id = ?', [item.id]);
        console.log(`[Follow-Up Alert] Sent 1-hour action alert for note #${item.id} (Lead #${item.lead_id}) to ${targetEmail}`);
      } catch (itemErr) {
        console.error(`[Follow-Up Alert Error for Note #${item.id}]:`, itemErr.message);
      }
    }
  } catch (err) {
    console.error('[Follow-Up Alert Scheduler Error]:', err.message);
  }
}


// Background Cron Scheduler (Runs every 60 seconds)
setInterval(() => {
  checkAndSendMorningBriefing();
  checkAndSendFollowupAlerts();
}, 60 * 1000);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Impact OS Error]:', err.message);
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(err.status || 400).json({ error: err.message || 'An error occurred' });
  }
  const referer = req.header('Referer') || '/dashboard';
  res.redirect(`${referer.split('?')[0]}?error=${encodeURIComponent(err.message || 'An error occurred')}`);
});

// 404 Fallback: Redirect unknown routes back to Impact OS Dashboard
app.use((req, res) => {
  res.status(404).redirect('/dashboard');
});

// Start Tiffany Webb Impact OS Server
app.listen(port, () => {
  console.log(`🛡️ Tiffany Webb Impact OS™ active on http://localhost:${port}`);
});



