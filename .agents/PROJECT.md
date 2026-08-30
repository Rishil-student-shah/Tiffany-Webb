# Project: Tiffany Webb CRM Leads Dashboard Redesign

## Architecture
- **Target Application**: `D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm`
- **View File**: `views/dashboard.ejs` (EJS rendered via Express 5)
- **Backend API**: Express 5 in `server.js` (`GET /dashboard`, `POST /api/leads/bulk-delete`, `POST /lead/:id/delete`)
- **Styling Architecture**:
  - Tailwind CSS via Play CDN with customized luxury brand theme config
  - Master Brand Design System (`DESIGN_SYSTEM_Tiffany_Webb_v1.md`):
    - Background / Surfaces: Deep Forest Sage (`#1A2721`), Deep Ink (`#14130E`), Elevated Dark (`#23211B`), Card Ink (`#1B1A14`)
    - Accents: Regal Gold (`#C8A24C`), Mustard Gold (`#D9A23A`), Emerald (`#0E6B54`), Crimson/Burnt (`#C15427`)
    - Text: Warm Ivory (`#FBF6EA`), Ivory Muted (`rgba(251, 246, 234, 0.7)`), Ivory Dim (`rgba(251, 246, 234, 0.4)`)
    - Typography: Fraunces (Headlines/Display), Inter / Plus Jakarta Sans (Body/UI), Space Mono (Badges/Data/Meta)
    - Glassmorphism: Multi-layered backdrop blur, subtle borders (`rgba(251, 246, 234, 0.10)`), top specular highlight, smooth hover elevations
- **Modernized Analytics / Charts**:
  - Chart.js 4.4.7 via CDN
  - Lead Sources Doughnut Chart (72% inner cutout, palette-aligned doughnut slices, dark tooltips, ivory legend, center total counter overlay)
  - Pipeline Funnel Bar Chart (Gold-to-Emerald gradient rounded bars, styled dark gridlines, custom tooltips)
  - Sourced via safe JSON script tag `<script id="crm-chart-payload" type="application/json">` with `\u003c` escaping
  - Reactivity: `window.refreshAnalyticsFromDOM()` for real-time recalculation upon deletion
- **Zero-Reload Frontend UX & AJAX Architecture**:
  - Live Debounced Search: 200ms debounce, multi-token matching across `data-search`, visible card counter, empty state banner, keyboard `/` and `Esc` shortcuts
  - Smooth Status Tab Navigation: 8 pipeline stage tabs (`new`, `contacted`, `qualified`, `proposal_sent`, `booked`, `completed`, `declined`, `lost`) with active gold glow pill and `history.replaceState` URL sync
  - Smooth Card Deletion: Individual & Bulk delete via AJAX `fetch()`, 350ms CSS exit animations (`.card-exit-animation`), in-memory counter reconciliation (`recalculateAllCounters()`), and luxury toast alerts (`Toast.success` / `Toast.error`)

## Feature Inventory
| # | Feature | Description | Milestone | Status |
|---|---------|-------------|-----------|--------|
| 1 | Luxury Brand Theme & Fonts | Integrated Fraunces, Inter, and Space Mono fonts with Tailwind CDN theme configuration | M1 | DONE |
| 2 | Glassmorphic Navigation & Header | Polished top navbar, page header, and responsive metrics banner | M1 | DONE |
| 3 | Key Metrics Summary Cards | 4 KPI cards (Total Leads, New/Unread, Booked, Proposals Out) with luxury borders and gold accents | M1 | DONE |
| 4 | Modernized Analytics Charts | Chart.js 4.4.7 Lead Sources Doughnut and Pipeline Funnel bar charts | M1 | DONE |
| 5 | Unified Search & Action Bar | Integrated search bar, manual lead shortcut, and bulk delete actions | M1 | DONE |
| 6 | Dynamic Debounced Live Search | Client-side search across leads with instant matching, highlight, and empty-state messaging | M1 | DONE |
| 7 | Animated Status Filter Tabs | 8 pipeline stage tabs with active gold indicator, badge counters, and cross-fade pane switching | M1 | DONE |
| 8 | Enhanced Lead Cards | Rich lead cards with status chips, contact details, date formatting, value tags, and quick-action delete | M1 | DONE |
| 9 | Smooth AJAX Card Deletion | Individual lead delete via AJAX with 350ms exit animation, badge decrement, and toast | M1 | DONE |
| 10 | Smooth AJAX Bulk Deletion | Modal-confirmed bulk delete via `/api/leads/bulk-delete` with batch card removal animations | M1 | DONE |
| 11 | Toast Notification System | Elegant gold/sage toast alerts for AJAX success, errors, and network warnings | M1 | DONE |
| 12 | End-to-End Test Suite & Verification | Comprehensive test harness testing search, tab switching, AJAX deletion, and visual consistency | M2 | DONE |
| 13 | Forensic Integrity & Code Quality Audit | Independent verification of genuine implementation without dummy mockups or hacks | M3 | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Survey & Architecture | Codebase, Routes, Views & Design Survey | None | DONE |
| M1 | Full Dashboard UI/UX & AJAX Redesign | Complete overhaul of `views/dashboard.ejs` (Tailwind, charts, brand palette, AJAX search/tabs/delete) | M0 | DONE |
| M2 | Multi-Tier Verification & Test Suite | Multi-tier review, stress testing, and adversarial challenge | M1 | DONE |
| M3 | Forensic Integrity Audit & Final Signoff | Full codebase forensic audit verifying authentic implementation | M1, M2 | DONE |

## Interface Contracts
### `server.js` ↔ `views/dashboard.ejs`
- `GET /dashboard` passes `{ leads: Lead[], chartData: string, error?: string, success?: string }`
  - `leads`: Array of `{ id, contact_name, organization_name, email, phone, event_type, event_date, status, source, notes, created_at, ... }`
  - `chartData`: JSON string containing `{ sourceData: { labels: string[], counts: number[] }, funnelData: { labels: string[], counts: number[] } }`
- `POST /api/leads/bulk-delete` accepts `{ status: string }` where status is `'all'` or specific status name (e.g. `'new'`). Returns `{ success: true, message: string }`.
- `POST /lead/:id/delete` deletes a single lead.

## Code Layout
- `Landing Page Work/tiffany-webb-crm/views/dashboard.ejs` (Fully modernized and verified)
