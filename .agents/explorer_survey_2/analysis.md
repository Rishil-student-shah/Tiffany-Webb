# Backend Architecture & API Survey Report: Tiffany Webb CRM

## Executive Summary
This report details the backend architecture, database layer, route configurations, data handling, and API endpoints of the **Tiffany Webb CRM** (`Landing Page Work/tiffany-webb-crm`).

The application is built on **Node.js / Express 5 (`express@5.2.1`)** using **CommonJS**, templated server-side with **EJS (`ejs@6.0.1`)**, and backed by a **MySQL** database (`mysql2/promise` connection pool). The server also integrates Astro SSR via dynamic import when available (`../tiffany-webb-astro/dist/server/entry.mjs`) while isolating CRM routes (`/api`, `/cms`, `/dashboard`, `/login`, `/users`, `/lead`).

---

## 1. Application & Dependency Structure

### Package Metadata (`package.json`)
- **Package Name**: `tiffany-webb-crm` (v1.0.0, CommonJS)
- **Main Entry**: `server.js` (Note: `package.json` specifies `"main": "index.js"`, but server entry file is `server.js`)
- **Dependencies**:
  - `express`: `^5.2.1` (Web framework)
  - `ejs`: `^6.0.1` (Server-side templating engine)
  - `mysql2`: `^3.23.4` (MySQL promise-based pool)
  - `bcrypt`: `^6.0.0` (Password hashing)
  - `jsonwebtoken`: `^9.0.3` (JWT tokens)
  - `multer`: `^2.2.0` (Multipart file upload handling for CMS images)
  - `nodemailer`: `^9.0.5` (SMTP email transport for OTP password resets)
  - `cors`: `^2.8.6` (CORS support)
  - `dotenv`: `^17.4.2` (Environment variable configuration)
- **Dev Dependencies**:
  - `nodemon`: `^3.1.14`
- **Scripts**:
  - `"test": "echo \"Error: no test specified\" && exit 1"`

### Execution & Startup Flow
- Run command: `node server.js` or `npx nodemon server.js`
- Database init: `node setup-db.js` (creates DB, runs `db/schema.sql`, inserts default admin `admin@tiffanywebb.com` / `password123`)
- Port: `process.env.PORT || 3000`
- Astro fallback: If Astro SSR build is missing, the catch block launches standalone CRM server on port 3000.

---

## 2. Database & Data Storage Layer

- **Database Engine**: MySQL
- **Connection Management**: `mysql2/promise` connection pool (`server.js:33-41`)
  ```javascript
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tiffany_crm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  ```
- **Primary Schema Tables**:
  1. `leads`:
     - Columns: `id` (INT PK AI), `source` (ENUM: `website_form`, `whatsapp`, `instagram`, `email`, `referral`, `manual`, `csv_upload`), `status` (ENUM: `new`, `contacted`, `qualified`, `proposal_sent`, `booked`, `completed`, `declined`, `lost`), `contact_name` (VARCHAR), `organization_name` (VARCHAR), `email` (VARCHAR), `country_code` (VARCHAR), `phone` (VARCHAR), `event_type` (VARCHAR), `event_date` (DATE), `event_location` (VARCHAR), `estimated_audience_size` (VARCHAR), `message` (TEXT), `assigned_to` (INT FK -> users), `created_at` (DATETIME), `updated_at` (DATETIME), `last_contact_at` (DATETIME).
  2. `messages`:
     - Columns: `id`, `lead_id` (FK -> leads CASCADE), `channel` (ENUM: `whatsapp`, `email`, `note`, `sms`), `direction` (ENUM: `inbound`, `outbound`), `body` (TEXT), `sent_by` (FK -> users), `is_sensitive` (BOOLEAN), `created_at`.
  3. `bookings`:
     - Columns: `id`, `lead_id` (FK -> leads CASCADE UNIQUE), `event_name`, `event_format`, `confirmed_date`, `fee_amount`, `deposit_status`, `contract_status`, `outcome_notes`, `created_at`.
  4. `activity_log`:
     - Columns: `id`, `lead_id` (FK -> leads CASCADE), `user_id` (FK -> users), `action` (VARCHAR), `detail` (VARCHAR), `created_at`.
  5. `users`:
     - Columns: `id`, `name`, `email`, `password_hash`, `role` (ENUM: `admin`, `assistant`), `is_active`, `last_login_at`, `reset_token`, `reset_token_expires`, `created_at`.
  6. `website_pages`, `website_content`, `website_collections`:
     - Tables for CMS page management, content items, and repeating collection items.

---

## 3. Comprehensive Lead & Pipeline API Routes

| HTTP Method | Route | Description | Auth Required | Response Type | Request Body / Query Params |
|---|---|---|---|---|---|
| `GET` | `/dashboard` | Main CRM leads dashboard & charts | `requireAuth` | HTML (`dashboard.ejs`) | Query: `error`, `success`. Provides `leads` array and `chartData` JSON string `{ sourceData, funnelData }`. |
| `POST` | `/api/leads` | Create single lead (Website / Form / Inbound API) | No | JSON or 302 Redirect | Body: `{ contact_name, organization_name, email, country_code, phone, event_type, event_date, event_location, estimated_audience_size, message, source, is_manual }`. Returns JSON `{ success: true, lead_id }` with status 201 (or 302 redirect if `is_manual: true`). |
| `POST` | `/webhooks/gupshup` | WhatsApp inbound message webhook | No | Plaintext `OK` (200) | Body: `{ phone, text }`. Creates lead if not exists, records inbound message. |
| `GET` | `/leads/new` | Manual lead creation & CSV upload page | `requireAuth` | HTML (`new-lead.ejs`) | Query: `error`, `success`. Provides distinct `sources` array. |
| `POST` | `/api/leads/batch` | Batch CSV lead import | `requireAuth` | JSON | Body: `{ leads: [ { contact_name, organization_name, email, phone, event_type, event_date, event_location, estimated_audience_size, message, source } ] }`. Returns JSON `{ success: true, count }`. |
| `GET` | `/lead/:id` | Detailed lead view with thread & activity history | `requireAuth` | HTML (`lead.ejs`) | Route Param: `:id`. Passes `{ lead, messages, activity }`. |
| `POST` | `/lead/:id/status` | Update lead status | `requireAuth` | 302 Redirect (`/lead/:id`) | Body: `{ status }`. Adds activity log entry. |
| `POST` | `/lead/:id/edit` | Update lead details & message | `requireAuth` | 302 Redirect (`/lead/:id`) | Body: `{ contact_name, organization_name, email, country_code, phone, event_type, event_date, event_location, estimated_audience_size, message }`. |
| `POST` | `/lead/:id/delete` | Delete a single lead and cascade logs | `requireAuth` | 302 Redirect (`/dashboard?success=...`) | Route Param: `:id`. Deletes `activity_log`, `messages`, and `leads`. |
| `POST` | `/api/leads/bulk-delete` | Bulk delete leads | `requireAuth` | JSON | Body: `{ status: 'all' \| 'new' \| 'booked' \| ... }`. Deletes matching leads + logs/messages. Returns JSON `{ success: true, message }`. |

---

## 4. Current Request/Response Patterns & AJAX Analysis

### Current Dashboard Rendering Model
1. In `server.js` (lines 246–274):
   - `GET /dashboard` executes `SELECT * FROM leads ORDER BY created_at DESC`.
   - In-memory aggregations create `sourceData` (count per source) and `funnelData` (counts for `new`, `qualified`, `proposal_sent`, `booked`).
   - Renders `dashboard.ejs` with:
     ```javascript
     res.render('dashboard', { 
         leads, 
         chartData: JSON.stringify({ sourceData, funnelData }),
         error: req.query.error,
         success: req.query.success
     });
     ```
2. In `views/dashboard.ejs`:
   - All leads are pre-rendered into status columns / tab panes (`#tab-pane-new`, `#tab-pane-contacted`, etc.).
   - Card data attributes: `data-search="<%= lead.contact_name + ' ' + lead.email + ... %>"`.
   - Chart.js parses `<%- chartData %>` to render the Source doughnut chart and Pipeline Funnel bar chart.

### Existing Deficiencies in Frontend UX (`dashboard.ejs`):
1. **Broken Search Selectors**:
   - `performSearch()` searches for `document.querySelectorAll('.kanban-board .card')`, but the cards are rendered as `.glass-card` inside `.tab-content-wrapper` (no `.kanban-board` class exists in current HTML).
   - `clearSearch()` targets `.kanban-wrapper`, but the wrapper element has `id="kanban-wrapper"` and class `tab-content-wrapper`.
   - Searching copies DOM nodes into `#searchResultsGrid` rather than filtering smoothly.
2. **Tab Switching**:
   - Tab switching uses `showTab(status)` toggling `display: none` / `display: block` with no transition animations.
3. **Delete Behavior**:
   - Bulk deletion calls `/api/leads/bulk-delete` (JSON API) but executes a full page reload `window.location.reload()`.
   - Single lead deletion from `/lead/:id` uses `POST /lead/:id/delete` which redirects with 302 to `/dashboard`.
4. **CSS Bloat & Clashing Styles**:
   - Multiple conflicting stylesheets and injected style blocks (`apply-theme.js` injection) exist in `dashboard.ejs`, causing excessive specificity overrides (`!important`).

---

## 5. Architectural Recommendations for Dashboard Redesign

1. **AJAX Lead Search & Filtering**:
   - Since the full lead dataset or pre-rendered cards are available in the DOM / template on initial load, client-side real-time fuzzy/substring search with debounce and smooth CSS fade/slide animations is immediately viable without server round-trips.
   - Alternatively, or in combination, an optional JSON API endpoint `GET /api/leads` (or `GET /dashboard?format=json`) can be provided if lazy-fetching or dynamic reload is desired.
2. **Smooth Tab Transitions**:
   - Replace abrupt `display: block/none` with animated transitions (e.g. CSS opacity/transform transitions with Tailwind CSS classes or glassmorphism keyframes).
3. **AJAX Single & Bulk Delete**:
   - Enable JSON response support for single lead deletion (e.g., in `POST /lead/:id/delete` or `DELETE /api/leads/:id`) so cards can animate out (e.g., shrink & fade-out) and update the status tab badge count and stat counters in real time without refreshing the page.
   - For bulk delete, call `POST /api/leads/bulk-delete` and smoothly empty the active tab pane / update counts dynamically.
4. **Unified Styling & Modern UI**:
   - Clean up duplicate/conflicting inline styles and injected `<style>` blocks in `dashboard.ejs`.
   - Use standard brand tokens (Deep Forest Sage `#1A2721`, Ink `#0a0a0a`, Ivory `#f2efe9` / `#ffffff`, Gold `#c29545`) consistently across headers, search bars, stat cards, Chart.js canvas styling, and lead cards.
