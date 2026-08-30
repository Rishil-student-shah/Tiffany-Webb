# Tiffany Webb CRM Leads Dashboard — Frontend Structure & Technical Analysis

**Date:** 2026-08-30  
**Investigator:** `explorer_survey_1`  
**Target Repository:** `D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm`  
**Primary File Under Investigation:** `views/dashboard.ejs`  

---

## 1. Executive Summary

`views/dashboard.ejs` serves as the primary operational hub ("Booking Pipeline") for the Tiffany Webb CRM. The page renders lead statistics, analytics charts (Lead Sources & Pipeline Funnel), an action/search toolbar, status navigation tabs, and categorized lead cards.

The current implementation has significant architectural debt:
1. **Severe Style Bloat & Cascading Conflicts:** Over 800 lines of CSS in `<style>` blocks contain duplicate and competing rules (legacy light-theme rules from lines 10–514 clashing with injected dark-theme `!important` overrides in lines 539–839).
2. **Broken Client-Side Search:** The search script queries `document.querySelectorAll('.kanban-board .card')` and `document.querySelector('.kanban-wrapper')`, but the DOM markup was previously converted to `.tab-pane .glass-card` inside `.tab-content-wrapper#kanban-wrapper`. As a result, searching fails silently or throws JavaScript TypeErrors.
3. **Clunky Page Reloads for Deletions:** Bulk deletions trigger `window.location.reload()`, and individual card deletions are not directly available on the dashboard view (requiring navigation into `/lead/:id`).
4. **Visual Inconsistency with Master Design System:** Color usage mixes random purple gradients (`#2e1045`), multi-colored stat card gradients, and glowing red neon buttons (`#ef4444`), deviating from the refined brand palette specified in `DESIGN_SYSTEM_Tiffany_Webb_v1.md` (Deep Forest Sage, Ink, Ivory, Gold, Mustard, Emerald).

---

## 2. Directory & View Architecture

### 2.1 File Map
```
tiffany-webb-crm/
├── views/
│   ├── dashboard.ejs             # Primary Leads Pipeline & Analytics Dashboard (1,204 lines)
│   ├── lead.ejs                  # Individual Lead Detail, Message Thread & Status Manager
│   ├── new-lead.ejs              # Manual Lead Entry & Batch CSV Upload View
│   ├── users.ejs                 # Staff & User Management View
│   ├── cms.ejs                   # Website Pages & Sections CMS Hub
│   ├── cms-page.ejs              # Page-Specific CMS Editor
│   ├── cms-collection-edit.ejs   # Collection Item Editor
│   ├── login.ejs                 # Authentication Login
│   ├── forgot-password.ejs       # Password Recovery Request
│   └── reset-password.ejs        # Token-based Password Reset
├── db/
│   └── schema.sql                # MySQL Schema definition
├── server.js                     # Express 5 server & API endpoints
└── package.json                  # Dependencies (Express 5.2.1, EJS 6.0.1, MySQL2, etc.)
```

### 2.2 Template Architecture & Layouts
- **No Shared EJS Partials:** There is no `views/partials/` folder and no `<%- include(...) %>` statements for navbars or layouts.
- **Self-Contained Views:** Every EJS file is a standalone HTML5 document defining its own `<head>`, fonts, stylesheets, `<nav class="top-nav">`, main container, and `<script>` tags.
- **Top Navigation Bar:** Hardcoded across all views:
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

---

## 3. Detailed DOM Structure Analysis (`views/dashboard.ejs`)

The DOM hierarchy of `dashboard.ejs` is structured as follows:

```
html
└── body (background: #1A2721 / Deep Forest Sage)
    ├── nav.top-nav (Sticky navbar: Logo + Navigation Links)
    └── div.main-content (Max-width: 1600px, padding: 2rem)
        ├── div.page-header
        │   ├── h2.page-title ("Booking Pipeline")
        │   ├── Flash Messages (EJS conditional alerts for error & success)
        │   ├── div.stats-grid (4 Grid Columns)
        │   │   ├── div.stat-card (Total Leads count)
        │   │   ├── div.stat-card (New / Unread count)
        │   │   ├── div.stat-card (Booked count)
        │   │   └── div.stat-card (Proposals Out count)
        │   ├── div.charts-row (2-Column Grid: 1fr / 2fr)
        │   │   ├── div.chart-card (Lead Sources Doughnut: #sourceChart)
        │   │   └── div.chart-card (Pipeline Funnel Bar Chart: #funnelChart)
        │   ├── div.action-bar (Flex container: Search Box + Action Buttons)
        │   │   ├── Search Container (#searchInput + #searchBtn)
        │   │   └── Action Buttons ("Delete All Leads" + "+ Add Manual Lead")
        │   └── div#searchResultsContainer (Hidden search results container)
        │       ├── Header: h3 ("Search Results") + span#searchResultCount + button ("Clear Search")
        │       └── div#searchResultsGrid (Cards matching search query)
        ├── div.premium-nav (Horizontal tab button strip for statuses)
        │   └── button#tab-btn-[status].premium-tab.tab-btn (8 status tabs with count badges)
        └── div#kanban-wrapper.tab-content-wrapper (Container for tab panes)
            └── div#tab-pane-[status].tab-pane (One pane per status: new, contacted, qualified, etc.)
                ├── div.column-header
                │   ├── Title: h3 ("[Status] Leads") + Subtitle
                │   └── button.btn-ghost-danger ("Delete All" for current status)
                └── div.leads-grid (Auto-fill CSS grid: minmax 300px, 1fr)
                    └── div.glass-card (Individual lead card, links to /lead/:id)
                        ├── div.gc-header (Contact name + event date)
                        ├── p.gc-org (Organization name)
                        └── div.gc-footer (Source tag dot & label + hover arrow icon)
```

### Key Component Details:

| Component | Current Classes / IDs | Current Behavior & Deficiencies |
|---|---|---|
| **Top Navigation** | `.top-nav`, `.nav-logo`, `.nav-links`, `.nav-link` | Fixed sticky bar. Hardcoded across files. Lacks active tab highlight for `/dashboard`. |
| **Stats Row** | `.stats-grid`, `.stat-card`, `.stat-value`, `.stat-label` | 4 cards displaying counts. Uses mismatched gradient backgrounds (`#2b2212`, `#2d1616`, etc.) with inline `!important` rules. |
| **Charts** | `.charts-row`, `.chart-card`, `<canvas id="sourceChart">`, `<canvas id="funnelChart">` | Rendered via Chart.js. Colors in script do not match the Master Design System token definitions. |
| **Action Bar** | `.action-bar`, `#searchInput`, `#searchBtn`, `.btn-primary` | Injected purple gradient (`#2e1045`). Contains search input and buttons. Delete All button is hardcoded red `#dc3545`. |
| **Search Box** | `#searchInput`, `#searchBtn`, `#searchResultsContainer`, `#searchResultsGrid` | **Broken JS:** Attempts to query non-existent `.kanban-board .card`. Querying crashes or does not render. |
| **Status Tabs** | `.premium-nav`, `.premium-tab`, `.premium-badge`, `#tab-btn-[status]` | 8 tabs: `new`, `contacted`, `qualified`, `proposal_sent`, `booked`, `completed`, `declined`, `lost`. Simple DOM `display: block/none` toggle. |
| **Lead Listing** | `.tab-pane`, `.leads-grid`, `.glass-card`, `.gc-title`, `.gc-org`, `.gc-tag` | Cards styled with glassmorphism (`backdrop-filter: blur(12px)`). Cards are clickable (navigate to `/lead/:id`). No inline card deletion or quick status dropdown. |

---

## 4. Backend Data Passing & Template Variables

The EJS template is rendered in `server.js` (lines 246–274) at route `GET /dashboard`:

```javascript
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const [leads] = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    
    // Aggregations for charts
    const sourceData = {};
    const funnelData = { new: 0, qualified: 0, proposal_sent: 0, booked: 0 };
    
    leads.forEach(lead => {
      sourceData[lead.source] = (sourceData[lead.source] || 0) + 1;
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
  } catch (err) { ... }
});
```

### Template Variable Specifications:

1. **`leads` (Array of Objects):**
   - Direct output from MySQL `SELECT * FROM leads ORDER BY created_at DESC`.
   - Fields:
     - `id` (int, Primary Key)
     - `source` (`'website_form' | 'whatsapp' | 'instagram' | 'email' | 'referral' | 'manual'`)
     - `status` (`'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'booked' | 'completed' | 'declined' | 'lost'`)
     - `contact_name` (string | null)
     - `organization_name` (string | null)
     - `email` (string | null)
     - `phone` (string | null)
     - `event_type` (string | null)
     - `event_date` (Date string | null)
     - `event_location` (string | null)
     - `estimated_audience_size` (string | null)
     - `message` (text | null)
     - `assigned_to` (int | null)
     - `created_at` (datetime)
     - `updated_at` (datetime)
     - `last_contact_at` (datetime | null)

2. **`chartData` (JSON String):**
   - Unescaped raw string `<%- chartData %>` parsed on client.
   - Schema:
     ```json
     {
       "sourceData": { "website_form": 5, "whatsapp": 2, "referral": 1 },
       "funnelData": { "new": 5, "qualified": 2, "proposal_sent": 1, "booked": 3 }
     }
     ```

3. **`error` (String | undefined):**
   - Populated from `req.query.error` (e.g. `?error=Failed+to+delete`).

4. **`success` (String | undefined):**
   - Populated from `req.query.success` (e.g. `?success=Lead+deleted+successfully`).

---

## 5. Existing JavaScript & Interaction Analysis

### 5.1 Chart.js Logic (Lines 1019–1081)
- **Source Doughnut Chart (`#sourceChart`):**
  - Renders doughnut chart of sources using `chartData.sourceData`.
  - Palette: hardcoded array `['#a84747', '#c29545', '#885794', '#4a6b5c']`.
- **Pipeline Funnel Bar Chart (`#funnelChart`):**
  - Renders horizontal/vertical bar chart for `['New', 'Qualified', 'Proposal Sent', 'Booked']`.
  - Gradient: `#e58e73` to `#9a3b3b`.

### 5.2 Status Tab Switching (`showTab(status)` - Lines 1083–1101)
- Simple display toggling:
  ```javascript
  function showTab(status) {
      document.querySelectorAll('.tab-pane').forEach(pane => pane.style.display = 'none');
      document.getElementById('tab-pane-' + status).style.display = 'block';
      // updates active tab button classes and inline styles
  }
  ```
- **UX Issue:** Instant, abrupt swap with no smooth transition animation.

### 5.3 Search Filtering (`performSearch()`, `clearSearch()` - Lines 1113–1173)
- **Defects Identified:**
  - `document.querySelectorAll('.kanban-board .card')`: The selector is orphaned legacy code; `.kanban-board` does not exist in the HTML. Returns `0` elements on every search.
  - `const kanbanWrapper = document.querySelector('.kanban-wrapper');`: Element in HTML has `class="tab-content-wrapper" id="kanban-wrapper"`. `querySelector('.kanban-wrapper')` returns `null`.
  - `clearSearch()` throws a TypeError when accessing `.style.display` on `null`.
  - Input event only clears search when empty; typing does not perform real-time debounced search.

### 5.4 Bulk Deletion (`bulkDelete(status)` - Lines 1176–1200)
- **Workflow:**
  - `confirm()` browser popup.
  - `fetch('/api/leads/bulk-delete', { method: 'POST', body: JSON.stringify({ status }) })`.
  - On success: `window.location.reload()`.
- **UX Issue:** Harsh full-page reload instead of animated DOM removal and live metric/counter updates.

### 5.5 Available Backend API Endpoints for AJAX:
- `POST /api/leads/bulk-delete`:
  - Body: `{ "status": "all" | "<status_name>" }`
  - Returns: `{ "success": true, "message": "..." }`
- `POST /lead/:id/delete`:
  - Currently triggers redirect `res.redirect('/dashboard?success=...')`.
  - Can be easily updated or wrapped with fetch / JSON response to delete single leads via AJAX.

---

## 6. Visual Design Gap Analysis vs. Master Design System v1.0

| Design Token / Area | Master Design System (`DESIGN_SYSTEM_Tiffany_Webb_v1.md`) | Current Implementation in `dashboard.ejs` |
|---|---|---|
| **Background** | `--bg-dark`: `#14130E` (Ink) or Deep Forest Sage `#1A2721` | Injected `#1A2721 !important` (Good base, but conflicting with original light styles). |
| **Card Surfaces** | `--bg-dark-elevated`: `#23211B`, 1px `rgba(251,246,234,0.13)` border, 12px radius | Multi-colored garish gradients (`#2b2212`, `#2d1616`, `#172433`, `#271a2b`) on stat cards; deep purple `#2e1045` on action bar. |
| **Typography** | Headlines: **Fraunces** (600 weight); Body: **Inter**; Eyebrows/Data: **Space Mono** | Inter, Plus Jakarta Sans, and Instrument Serif mixed haphazardly. Space Mono is missing. |
| **Brand Accents** | Gold (`#C8A24C`), Mustard (`#D9A23A`), Emerald (`#0E6B54`), Warm Ivory (`#FBF6EA`), Coral (`#E17356`) | Inconsistent gold (`#c29545`), bright red neon delete buttons (`#ef4444` with 22px glow), purple action bar. |
| **Delete Buttons** | Refined alert accent: Burnt/Ruby (`#C15427` / `#991B1B`), subtle ghost-danger style | Oversaturated glowing neon red (`#ef4444` with box-shadow `0 0 22px rgba(239,68,68,0.9)`). |
| **Action Bar** | Unified dark elevated card with subtle border and cohesive input styling | Deep purple gradient box with conflicting button styles. |

---

## 7. Recommended Redesign Plan for Implementer

1. **Clean Slate View Architecture:**
   - Remove the ~800 lines of conflicting CSS.
   - Load **Tailwind CSS via CDN**, **Google Fonts** (Fraunces, Inter, Space Mono), and **Lucide/Heroicons CDN**.
2. **Cohesive Design Language:**
   - Implement the Master Design System tokens (Deep Forest Sage `#1A2721`, Ink `#14130E`, Card `#23211B`, Ivory `#FBF6EA`, Gold `#C8A24C`, Mustard `#D9A23A`, Emerald `#0E6B54`).
   - Standardize glassmorphism / card elevation with `backdrop-blur-md`, subtle `border-white/10`, and rounded-xl/2xl cards.
3. **Interactive & Animated Frontend (Vanilla JS + AJAX):**
   - **Real-time Live Search:** Debounced instant search filtering across name, organization, email, phone, and source. Highlight matches or smooth fade-in search results grid.
   - **Smooth Tab Transitions:** Animate tab indicator underline (Framer-motion style / smooth CSS transition) and fade-in/slide-up transition for lead card grid.
   - **AJAX Single & Bulk Deletions:**
     - Add inline card delete / quick actions.
     - Execute `fetch('/api/leads/bulk-delete')` and animate deleted cards out of the DOM (e.g. `scale-95 opacity-0` with height collapse).
     - Dynamically update stat counters without a full page reload.
   - **Modernized Chart.js:**
     - Refined Doughnut and Funnel charts with brand color palette, rounded bar corners, customized tooltips, and responsive container resizing.
