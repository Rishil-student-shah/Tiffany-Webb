# Handoff Report — Leads Dashboard Frontend Survey

**Agent:** explorer_survey_1  
**Milestone:** leads_dashboard_survey  
**Date:** 2026-08-30  
**Handoff Type:** Hard  

---

## 1. Observation

1. **Self-Contained EJS View Structure:**
   - File inspected: `D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm\views\dashboard.ejs` (Total: 1,204 lines).
   - No EJS partials (`views/partials/` or `<%- include(...) %>`) exist across `views/`. Every template in `views/` (`dashboard.ejs`, `lead.ejs`, `new-lead.ejs`, `users.ejs`, `cms.ejs`, etc.) is an independent, complete HTML document.
   - The top navigation bar is hardcoded in `views/dashboard.ejs` (lines 868–879):
     ```html
     <nav class="top-nav">
         <div class="nav-brand">
             <h1 class="nav-logo">Tiffany Webb <span>CRM</span></h1>
         </div>
         <div class="nav-links">
             <a href="/dashboard" class="nav-link">Pipeline</a>
             <a href="/leads/new" class="nav-link">Add Lead</a>
             <a href="/cms" class="nav-link">Website</a>
             <a href="/users" class="nav-link">Staff</a>
             <a href="/login" class="nav-link">Logout</a>
         </div>
     </nav>
     ```

2. **Style Duplication and Clashes:**
   - Lines 10–514 define legacy CSS rules targeting `.stat-card`, `.action-bar`, `.column`, `.card`, etc.
   - Lines 539–839 contain an injected block (`<!-- INJECTED PREMIUM CRM THEME -->`) featuring heavy `!important` declarations, multi-colored gradients on cards (`#2b2212`, `#2d1616`, `#172433`, `#271a2b`), purple action bar (`#2e1045`), and glowing red delete buttons (`#ef4444` with `0 0 22px rgba(239, 68, 68, 0.9)` box shadow).

3. **DOM Structure of `views/dashboard.ejs`:**
   - **Header & Stats:** Page title (`.page-title`), error/success banners, and a 4-card statistics grid (`.stats-grid` in lines 898–915) calculating Total Leads (`leads.length`), New/Unread (`leads.filter(l => l.status === 'new').length`), Booked (`leads.filter(l => l.status === 'booked').length`), and Proposals Out (`leads.filter(l => l.status === 'proposal_sent').length`).
   - **Charts:** `.charts-row` with `<canvas id="sourceChart">` (Lead Sources doughnut) and `<canvas id="funnelChart">` (Pipeline Funnel bar) in lines 917–930.
   - **Action Bar:** `.action-bar` (lines 932–941) holding search input `#searchInput`, search button `#searchBtn`, "+ Add Manual Lead" link, and "Delete All Leads" button calling `bulkDelete('all')`.
   - **Search Results Container:** `#searchResultsContainer` (lines 944–952, hidden by default).
   - **Status Filter Tabs:** `.premium-nav` (lines 956–967) rendering 8 tabs: `new`, `contacted`, `qualified`, `proposal_sent`, `booked`, `completed`, `declined`, `lost` with counter badges.
   - **Leads Listing Grid:** `.tab-content-wrapper#kanban-wrapper` (lines 969–1015) rendering tab panes `#tab-pane-${status}` containing lead cards `.glass-card` with `data-search` attribute and click action navigating to `/lead/:id`.

4. **Broken Client-Side Search Selector:**
   - In `views/dashboard.ejs` lines 1127–1155:
     ```javascript
     const cards = document.querySelectorAll('.kanban-board .card');
     ...
     const kanbanWrapper = document.querySelector('.kanban-wrapper');
     ```
   - In the DOM markup (lines 969–993), the cards use class `.glass-card` and the container has `class="tab-content-wrapper" id="kanban-wrapper"`. Neither `.kanban-board` nor `.card` nor `.kanban-wrapper` class exists in the DOM. Consequently:
     - `performSearch()` searches 0 cards.
     - `clearSearch()` attempts `kanbanWrapper.style.display = 'block'` when `kanbanWrapper` is `null`, throwing an unhandled TypeError.

5. **Data Flow & Server Route:**
   - Server route `GET /dashboard` in `server.js` lines 246–274 passes:
     - `leads`: Array of lead records from database query `SELECT * FROM leads ORDER BY created_at DESC`.
     - `chartData`: Stringified JSON `{ sourceData, funnelData }`.
     - `error`: `req.query.error`.
     - `success`: `req.query.success`.
   - Backend API `POST /api/leads/bulk-delete` is implemented in `server.js` lines 630–657. It accepts `{ status }` where status is `'all'` or a specific status name, deletes matching rows from `activity_log`, `messages`, and `leads`, and returns `{ success: true, message: "..." }`.
   - Lead single deletion endpoint exists at `POST /lead/:id/delete` in `server.js` lines 617–627.

6. **Brand Design System Reference:**
   - Master Design System at `D:\FREELANCE\TIFFANY WEB\Landing Page Work\DESIGN_SYSTEM_Tiffany_Webb_v1.md` establishes:
     - Fonts: Fraunces (Headlines, 600 weight), Inter (Body/UI), Space Mono (Eyebrows/Data/Meta).
     - Palette: Ink `#14130E`, Elevated Dark `#23211B`, Forest Sage `#1A2721`, Warm Ivory `#FBF6EA`, Gold `#C8A24C`, Mustard `#D9A23A`, Emerald `#0E6B54`, Burnt `#C15427`.
     - Card aesthetics: 12px radius, subtle border `rgba(251,246,234,0.13)`, signature colored left border, no glowing neon shadows.

---

## 2. Logic Chain

1. **From Observations 1 & 2:** `views/dashboard.ejs` is an isolated, standalone view with heavy internal CSS style conflicts. Because no other view depends on `views/dashboard.ejs` via partial imports, redesigning `views/dashboard.ejs` to use modern Tailwind CSS via CDN and clean scoped styling will not break other CRM pages (`/cms`, `/users`, `/lead/:id`).
2. **From Observation 4:** The existing search functionality is completely broken due to outdated CSS class selectors (`.kanban-board .card`). A complete rewrite of the client-side JavaScript is required to enable live, debounced search and filtering across the active tab or across all leads.
3. **From Observation 5:** The backend already supports AJAX bulk deletion (`POST /api/leads/bulk-delete`) returning JSON `{ success: true }`. Currently, the frontend reloads the page (`window.location.reload()`). Replacing this reload with dynamic DOM card removal (fade/slide out) and metric counter decrements will satisfy Requirement R2 with zero backend changes.
4. **From Observation 3 & 6:** Replacing the legacy gradient backgrounds, glowing neon buttons, and mixed fonts with Tailwind CSS utility classes and Master Design System tokens (Fraunces, Inter, Space Mono, Forest Sage, Ink, Ivory, Gold) will bring the dashboard into complete brand alignment and satisfy Requirement R1.

---

## 3. Caveats

1. **Single-Lead Deletion on Dashboard:** Single lead delete is currently handled by form POST at `/lead/:id/delete` which redirects to `/dashboard`. If single-lead quick-delete buttons are added to individual dashboard cards, the frontend can either invoke `POST /api/leads/bulk-delete` with custom logic or invoke `POST /lead/:id/delete` via fetch.
2. **Shared Navbar:** Although top-nav styling is currently replicated across all views, this redesign is specifically focused on `views/dashboard.ejs`. Other views (`lead.ejs`, `cms.ejs`, etc.) retain their current standalone navbars.
3. **No External Backend Changes Required:** The data contract passed by `server.js` (`leads`, `chartData`, `error`, `success`) remains 100% compatible with any frontend UI redesign.

---

## 4. Conclusion

- `views/dashboard.ejs` is ready for a complete frontend redesign.
- The redesign can safely replace all legacy `<style>` blocks with Tailwind CSS (via CDN) and Google Fonts (`Fraunces`, `Inter`, `Space Mono`).
- The frontend JavaScript must be rewritten to fix the broken search selector, provide instant live filtering, implement smooth tab transitions, and handle deletions via AJAX with smooth DOM exit animations instead of full page reloads.

---

## 5. Verification Method

1. **View File Content Verification:**
   - Inspect `views/dashboard.ejs` and confirm structure:
     ```powershell
     # Check line count and search selector mismatch
     Select-String -Path "views\dashboard.ejs" -Pattern "kanban-board", "glass-card", "bulkDelete"
     ```
2. **Backend Route Verification:**
   - Inspect `server.js` lines 246–274 and lines 630–657 to confirm `leads`, `chartData`, and `POST /api/leads/bulk-delete` contracts.
3. **Design Token Verification:**
   - Inspect `DESIGN_SYSTEM_Tiffany_Webb_v1.md` Section 2 (Color System) and Section 3 (Typography).
