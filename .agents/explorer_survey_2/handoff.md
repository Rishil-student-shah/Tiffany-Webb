# Handoff Report: Backend Architecture & API Routes Investigation

## 1. Observation

- **Application Directory & Core Files**:
  - `package.json` (`Landing Page Work/tiffany-webb-crm/package.json`):
    - Lines 13–26: Express `^5.2.1`, EJS `^6.0.1`, MySQL2 `^3.23.4`, bcrypt `^6.0.0`, jsonwebtoken `^9.0.3`, multer `^2.2.0`, nodemailer `^9.0.5`, cors `^2.8.6`, dotenv `^17.4.2`. Dev dependency: nodemon `^3.1.14`.
    - Line 12: `"type": "commonjs"`.
    - Lines 6–8: `"scripts": { "test": "echo \"Error: no test specified\" && exit 1" }`.
  - `server.js` (`Landing Page Work/tiffany-webb-crm/server.js`):
    - Lines 33–41: MySQL connection pool with `mysql2/promise` using `process.env.DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
    - Lines 49–50: `app.set('view engine', 'ejs'); app.set('views', path.join(__dirname, 'views'));`
    - Lines 53–58: `requireAuth` middleware currently passes through via `next()`.
    - Lines 62–96: `POST /api/leads` handles lead insertion; returns JSON `{ success: true, lead_id: ... }` with status 201 when `is_manual` is falsy, or redirects to `/leads/new` when `is_manual: true`.
    - Lines 98–131: `POST /webhooks/gupshup` handles inbound WhatsApp messages and auto-creates leads.
    - Lines 246–274: `GET /dashboard` executes `SELECT * FROM leads ORDER BY created_at DESC`, aggregates `sourceData` and `funnelData`, and calls `res.render('dashboard', { leads, chartData: JSON.stringify({ sourceData, funnelData }), error, success })`.
    - Lines 562–575: `GET /lead/:id` loads lead, messages, activity log and renders `views/lead.ejs`.
    - Lines 577–587: `POST /lead/:id/status` updates lead status and redirects to `/lead/:id`.
    - Lines 589–614: `POST /lead/:id/edit` updates lead contact/event fields and redirects to `/lead/:id`.
    - Lines 616–627: `POST /lead/:id/delete` deletes `activity_log`, `messages`, `leads` records and redirects to `/dashboard?success=Lead deleted successfully`.
    - Lines 629–657: `POST /api/leads/bulk-delete` deletes all leads or leads matching a specific `status`, deleting cascaded logs and messages, returning JSON `{ success: true, message: ... }`.
    - Lines 660–673: `GET /leads/new` renders `views/new-lead.ejs` with distinct lead sources.
    - Lines 675–715: `POST /api/leads/batch` accepts `{ leads: [...] }` JSON array and batch inserts into `leads` table, returning `{ success: true, count: inserted }`.
    - Lines 717–742: Serves static client assets from `../tiffany-webb-astro/dist/client` and dynamically imports SSR entry `../tiffany-webb-astro/dist/server/entry.mjs` with fallback to standalone CRM on port 3000.
  - `views/dashboard.ejs` (`Landing Page Work/tiffany-webb-crm/views/dashboard.ejs`):
    - Lines 540–839: Heavy injected CSS block overriding colors with `!important`.
    - Lines 887–1016: Renders stat cards, Chart.js canvas elements (`#sourceChart`, `#funnelChart`), search bar (`#searchInput`, `#searchBtn`), status tabs (`#tab-btn-${status}`), and lead card grids (`#tab-pane-${status} .leads-grid .glass-card`).
    - Lines 1020–1081: Initializes Chart.js doughnut (`sourceChart`) and bar (`funnelChart`) using `<%- chartData %>`.
    - Lines 1083–1101: `showTab(status)` toggles `style.display = 'none'` / `'block'`.
    - Lines 1120–1150: `performSearch()` references obsolete selector `.kanban-board .card` and `.kanban-wrapper`, causing client search errors/breakages.
    - Lines 1176–1200: `bulkDelete(status)` calls `fetch('/api/leads/bulk-delete', ...)` then forces full page reload via `window.location.reload()`.
  - Database schema (`Landing Page Work/tiffany-webb-crm/db/schema.sql`):
    - Lines 12–30: Table `leads` with ENUM source, ENUM status, contact details, event details, and foreign key `assigned_to` -> `users(id)`.
    - Lines 32–43: Table `messages` (ON DELETE CASCADE).
    - Lines 45–57: Table `bookings` (ON DELETE CASCADE).
    - Lines 59–68: Table `activity_log` (ON DELETE CASCADE).

## 2. Logic Chain

1. **Architecture Model** (supported by `server.js:1-58, 246-274` and `package.json:1-27`):
   - The backend is a monolithic Express 5 application serving server-rendered EJS templates for the CRM while supporting JSON endpoints for specific API tasks (`/api/leads`, `/api/leads/batch`, `/api/leads/bulk-delete`).
   - The database layer directly executes SQL queries through a connection pool without an ORM.

2. **Lead Dashboard Rendering & Data Flow** (supported by `server.js:246-274` and `views/dashboard.ejs:887-1081`):
   - The initial visit to `/dashboard` fetches all leads in descending order of creation.
   - All status groups (`new`, `contacted`, `qualified`, `proposal_sent`, `booked`, `completed`, `declined`, `lost`) are rendered in separate tab panes within the same EJS template.
   - Lead counts per status and chart distributions (`sourceData`, `funnelData`) are calculated server-side and injected into the template.

3. **UX & AJAX Deficiencies** (supported by `views/dashboard.ejs:1120-1200` and `server.js:616-657`):
   - Search functionality in `dashboard.ejs` fails because it queries `.kanban-board .card`, which does not match the actual `.glass-card` elements in the DOM.
   - Bulk deletion calls the JSON endpoint `/api/leads/bulk-delete` but triggers a crude `window.location.reload()` instead of animating the removal of cards.
   - Single lead deletion from `POST /lead/:id/delete` issues a 302 redirect to `/dashboard`, causing full page reload.

4. **Implementation Strategy for Requirements R1 & R2**:
   - For Visual Overhaul (R1): Redesign `dashboard.ejs` with unified brand tokens (Deep Forest Sage `#1A2721`, Ink `#0a0a0a`, Ivory `#f2efe9`, Gold `#c29545`), clean up redundant CSS blocks, modernize Chart.js palettes and glassmorphic card styles.
   - For Smooth UX & AJAX (R2): Rewrite the client-side JavaScript in `dashboard.ejs` to provide instant debounced filtering with fade/slide animations, animated tab switching, and seamless DOM card deletion upon confirming deletions against `/api/leads/bulk-delete` and single delete endpoints without page reloads.

## 3. Caveats

- Auth middleware `requireAuth` currently calls `next()` without enforcing active sessions or tokens, allowing development and testing without authentication barriers.
- Database access relies on a live MySQL instance running per the `.env` settings (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

## 4. Conclusion

- The backend architecture is fully identified: Express 5 + CommonJS + EJS + MySQL (`mysql2/promise`).
- The backend already provides JSON support for bulk deletion (`POST /api/leads/bulk-delete`), batch creation (`POST /api/leads/batch`), and lead creation (`POST /api/leads`).
- The redesign for `dashboard.ejs` can be achieved cleanly on the frontend template by correcting DOM selectors, implementing modern animated tab switching, debounced search filtering, unified brand styling (Deep Forest Sage / Ink / Ivory / Gold), and smooth AJAX deletion handling.

## 5. Verification Method

To verify the backend and routes:
1. Verify `server.js` route definitions and syntax:
   `node -c server.js`
2. Start server (if MySQL is running):
   `node server.js`
3. Inspect `views/dashboard.ejs` lines 880–1200 to verify DOM selectors, Chart.js configuration, and event listeners.
4. Test endpoints:
   - `GET http://localhost:3000/dashboard` (returns HTML dashboard)
   - `POST http://localhost:3000/api/leads/bulk-delete` with body `{"status":"test"}` (returns JSON)
