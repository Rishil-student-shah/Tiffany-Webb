# Handoff Report — explorer_m4_2_2 (Multer Upload Security & Extension Whitelisting)

**Agent**: `explorer_m4_2_2`  
**Working Directory**: `D:\FREELANCE\TIFFANY WEB\.agents\explorer_m4_2_2`  
**Parent Agent**: `parent` (ID: `47012479-2d4c-4107-bf59-7c0841797227`)  
**Milestone**: M4.2 Remediation Exploration  
**Status**: COMPLETE  

---

## 1. Observation

1. **Target File Audited:** `Landing Page Work/tiffany-webb-crm/server.js` (1,307 lines).
2. **Multer `fileFilter` Vulnerability (`server.js` Lines 40–61):**
   ```javascript
   40:   fileFilter: function (req, file, cb) {
   41:     const ext = path.extname(file.originalname).toLowerCase();
   42:     if (file.fieldname === 'video_file') {
   43:       const allowedExts = ['.mp4', '.webm', '.mov'];
   44:       if (allowedExts.includes(ext) || (file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream'))) {
   45:         return cb(null, true);
   46:       }
   47:       return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
   48:     }
   49:     if (file.fieldname === 'image_file' || file.fieldname.startsWith('image_upload_') || file.fieldname === 'image') {
   50:       const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
   51:       if (allowedExts.includes(ext) || (file.mimetype && file.mimetype.startsWith('image/'))) {
   52:         if (!allowedExts.includes(ext)) {
   53:           return cb(new Error('Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed'));
   54:         }
   55:         return cb(null, true);
   56:       }
   57:       return cb(new Error('Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed'));
   58:     }
   59:     cb(new Error('File upload type not allowed'));
   60:   }
   ```
   - Verbatim audit finding (`auditor_m4_1/handoff.md` line 91): *"Testing with `originalname: 'malware.exe'` and `mimetype: 'application/octet-stream'` resulted in `allowed: true`."*
   - Verbatim reviewer finding (`reviewer_m4_2/handoff.md` line 146): *"The logical OR (`||`) accepts any file if `file.mimetype === 'application/octet-stream'`. Because `application/octet-stream` is the default MIME type for raw binary data or curl uploads, an attacker can upload files like `exploit.php`, `backdoor.exe`, `payload.html`, or `xss.svg` directly into `public/uploads/videos/`."*
3. **`saveBase64Image` Vulnerability (`server.js` Lines 101–124):**
   ```javascript
   101: // Helper: Save base64 cropped image to uploads directory
   102: function saveBase64Image(dataUrl) {
   103:   if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
   104:     return dataUrl;
   105:   }
   106:   try {
   107:     const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
   108:     if (!matches || matches.length !== 3) {
   109:       return dataUrl;
   110:     }
   111:     const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
   112:     const buffer = Buffer.from(matches[2], 'base64');
   113:     const uploadDir = path.join(__dirname, '../tiffany-webb-astro/public/uploads');
   114:     if (!fs.existsSync(uploadDir)) {
   115:       fs.mkdirSync(uploadDir, { recursive: true });
   116:     }
   117:     const filename = `${Date.now()}-cropped-${Math.round(Math.random() * 1E9)}.${ext}`;
   118:     fs.writeFileSync(path.join(uploadDir, filename), buffer);
   119:     return `/uploads/${filename}`;
   120:   } catch (e) {
   121:     console.error('Error saving base64 image:', e);
   122:     return dataUrl;
   123:   }
   124: }
   ```
   - Verbatim reviewer finding (`reviewer_m4_2/handoff.md` line 187): *"Any value matching `[a-zA-Z0-9+]+` after `data:image/` is used directly as the file extension (e.g. `data:image/svg+xml;base64,...`, `data:image/html;base64,...`, `data:image/php;base64,...`)."*
4. **Client-Side Expectations & Database Invariants:**
   - In `Landing Page Work/tiffany-webb-crm/views/cms-collection-edit.ejs` line 166:
     `<input type="file" name="video_file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov">`
   - In `Landing Page Work/tiffany-webb-crm/views/cms-collection-edit.ejs` line 359:
     `const dataUrl = canvas.toDataURL('image/jpeg', 0.9);`
   - In `Landing Page Work/database/schema.sql` line 114:
     `image_url VARCHAR(255) NULL,`
   - In `Landing Page Work/tiffany-webb-crm/server.js` lines 1288–1295: Express error-handling middleware intercepts `cb(new Error(...))` and redirects back with `?error=` or responds with HTTP 400 JSON.

---

## 2. Logic Chain

1. **Premise 1 (Video Filter Bypass)**:
   - In `server.js` line 44, `allowedExts.includes(ext)` and `(file.mimetype && (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream'))` are connected with an `||` (OR) operator.
   - Any client sending `Content-Type: application/octet-stream` or `Content-Type: video/mp4` evaluates the right-hand operand to `true`, causing `cb(null, true)` to execute regardless of the file extension.
   - At line 33, `storage.filename` persists the file using `path.extname(file.originalname)`. Therefore, `.exe`, `.php`, `.html`, and `.svg` files are saved to `public/uploads/videos/`.
   - **Remediation**: The filter must require that `allowedVideoExts.includes(ext)` is true **AND** that `allowedVideoMimes.includes(mimetype)` is true, while explicitly rejecting `application/octet-stream`.

2. **Premise 2 (Base64 MIME Subtype Injection)**:
   - In `saveBase64Image` (line 107), `matches[1]` captures arbitrary alphanumeric strings after `data:image/`.
   - Line 111 assigns `ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]`. If the client submits `data:image/svg+xml;base64,...` or `data:image/html;base64,...`, `ext` becomes `'svg+xml'` or `'html'`.
   - Line 118 calls `fs.writeFileSync` using this unsanitized extension, writing arbitrary files directly to `public/uploads/`.
   - If an invalid string is passed, returning `dataUrl` produces strings >100KB, causing MySQL query failure on `VARCHAR(255)`.
   - **Remediation**: `saveBase64Image` must check `matches[1]` against a strict whitelist of safe raster image formats (`jpeg`, `jpg`, `png`, `webp`, `gif`), map them to canonical extensions (`jpg`, `png`, `webp`, `gif`), reject any non-whitelisted subtype by returning `null`, and enforce payload size limits (<10MB).

3. **Conclusion**:
   Applying the dual-check extension/MIME filter to Multer and the whitelist subtype mapping to `saveBase64Image` completely eliminates both upload bypasses without disrupting legitimate CMS uploads or cropper operations.

---

## 3. Caveats

- **No Caveats.**
- The remediation does not require database schema modifications or migrations.
- The remediation does not require modifying frontend Astro components or client scripts.
- Only `Landing Page Work/tiffany-webb-crm/server.js` needs to be patched by the implementing worker.

---

## 4. Conclusion

The exact code changes required in `Landing Page Work/tiffany-webb-crm/server.js` are defined below:

### 4.1 Replacement for Multer `fileFilter` (`server.js` lines 40–61):

```javascript
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = (file.mimetype || '').toLowerCase();

    // 1. Strict Video Upload Validation
    if (file.fieldname === 'video_file') {
      const allowedVideoExts = ['.mp4', '.webm', '.mov'];
      const allowedVideoMimes = [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-quicktime',
        'video/mov'
      ];

      if (!allowedVideoExts.includes(ext)) {
        return cb(new Error('Only .mp4, .webm, and .mov video files are allowed'));
      }

      if (!mimetype || mimetype === 'application/octet-stream' || !allowedVideoMimes.includes(mimetype) || !mimetype.startsWith('video/')) {
        return cb(new Error('Invalid video MIME type. Only MP4, WebM, and QuickTime videos are allowed'));
      }

      return cb(null, true);
    }

    // 2. Strict Image Upload Validation
    if (file.fieldname === 'image_file' || file.fieldname.startsWith('image_upload_') || file.fieldname === 'image') {
      const allowedImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const allowedImageMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/pjpeg',
        'image/x-png'
      ];

      if (!allowedImageExts.includes(ext)) {
        return cb(new Error('Only .jpg, .jpeg, .png, .webp, and .gif image files are allowed'));
      }

      if (!mimetype || mimetype === 'application/octet-stream' || !allowedImageMimes.includes(mimetype) || !mimetype.startsWith('image/')) {
        return cb(new Error('Invalid image MIME type. Only JPEG, PNG, WebP, and GIF images are allowed'));
      }

      return cb(null, true);
    }

    // 3. Reject any unexpected field names
    cb(new Error('File upload type not allowed'));
  }
```

### 4.2 Replacement for `saveBase64Image` (`server.js` lines 101–125):

```javascript
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
```

---

## 5. Verification Method

Once Worker M4 applies these changes to `server.js`, the verification can be performed as follows:

### 1. Verify Multer Video Filter Rejection of `application/octet-stream` and Executables:
Inspect `server.js` or execute in Node:
```javascript
const path = require('path');
const ext = path.extname('malware.exe').toLowerCase();
const mimetype = 'application/octet-stream';
const allowedVideoExts = ['.mp4', '.webm', '.mov'];
const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-quicktime', 'video/mov'];

const isAllowed = allowedVideoExts.includes(ext) &&
  mimetype &&
  mimetype !== 'application/octet-stream' &&
  allowedVideoMimes.includes(mimetype);

console.log('malware.exe allowed:', isAllowed); // MUST be false
```

### 2. Verify `saveBase64Image` Rejection of SVG and HTML:
```javascript
// Test safe image
const safeRes = saveBase64Image('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
console.log('JPEG result:', safeRes ? 'SAVED' : 'BLOCKED'); // MUST be SAVED

// Test SVG rejection
const svgRes = saveBase64Image('data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+PC9zdmc+');
console.log('SVG result:', svgRes ? 'SAVED' : 'BLOCKED'); // MUST be BLOCKED (null)

// Test HTML rejection
const htmlRes = saveBase64Image('data:image/html;base64,PGgxPkhhY2tlZDwvaDE+');
console.log('HTML result:', htmlRes ? 'SAVED' : 'BLOCKED'); // MUST be BLOCKED (null)

// Test passthrough
const urlRes = saveBase64Image('/uploads/avatar.jpg');
console.log('URL passthrough:', urlRes === '/uploads/avatar.jpg' ? 'PASS' : 'FAIL'); // MUST be PASS
```

### 3. Syntax Verification:
```bash
node --check "Landing Page Work/tiffany-webb-crm/server.js"
```
*Expected result:* Exits with status code 0.
