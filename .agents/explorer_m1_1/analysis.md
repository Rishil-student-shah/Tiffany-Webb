# Milestone M1 Analysis: Complete UI/UX & Tailwind Architecture for `views/dashboard.ejs`

**Author:** `explorer_m1_1`  
**Milestone:** M1 — Full Dashboard UI/UX & AJAX Redesign  
**Target File:** `Landing Page Work/tiffany-webb-crm/views/dashboard.ejs`  
**Date:** 2026-08-30  

---

## 1. Executive Summary & Design Rationale

The Tiffany Webb CRM Leads Dashboard (`views/dashboard.ejs`) is the central operational interface for managing high-value bespoke inquiries, proposal pipelines, and booking conversions. Previously, the view suffered from:
1. **Severe CSS Collisions:** Over 800 lines of conflicting legacy `<style>` blocks and brute-force `!important` injections featuring garish neon red delete buttons, out-of-brand purple action bars, and multi-color card gradients.
2. **Broken Search Execution:** The client-side search selector targeted obsolete classes (`.kanban-board .card` and `.kanban-wrapper`), resulting in 0 search matches and unhandled runtime `TypeError` exceptions.
3. **Disruptive Full-Page Reloads:** Bulk deletion invoked `window.location.reload()`, and single-lead deletion required navigating away to the detail page.

This document establishes the authoritative, end-to-end frontend blueprint for Milestone M1. The redesign implements:
- **Tailwind CSS Play CDN** configured with the master brand token palette (Deep Forest Sage `#1A2721`, Deep Ink `#14130E`, Elevated Dark `#23211B`, Warm Ivory `#FBF6EA`, Regal Gold `#C8A24C`, and Emerald `#0E6B54`).
- **Luxury Editorial Typography:** Google Fonts `Fraunces` (display serif), `Inter` (UI sans-serif), and `Space Mono` (technical metadata/badges).
- **Multi-Layered Glassmorphism:** Deep translucent backdrops, subtle specular borders (`rgba(251,246,234,0.10)`), and smooth hover elevations with gold ambient glows.
- **Modernized Responsive Charting:** Chart.js 4.x configured with a 72% cutout doughnut chart and a vertical gradient funnel bar chart.
- **Zero-Reload AJAX Interactions:** Real-time 200ms debounced live search, animated status tab switching, smooth scale/height CSS card exit animations, dynamic in-memory metric updates, and a glassmorphic toast notification system.

---

## 2. Brand Color Tokens, Typography & Design Tokens

### 2.1 Color Palette Matrix

| Token Name | Hex Code / Value | HSL | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Deep Forest Sage** | `#1A2721` | `hsl(153, 20%, 13%)` | Page canvas background, subtle radial glows, secondary accents. |
| **Deep Ink** | `#14130E` | `hsl(48, 17%, 6%)` | Dark base, navigation bar backdrop, deep contrast canvas. |
| **Elevated Dark (Char)** | `#23211B` | `hsl(43, 13%, 12%)` | Elevated surface layers, card backgrounds, input backdrops. |
| **Warm Ivory** | `#FBF6EA` | `hsl(43, 68%, 95%)` | Primary typography, active icons, crisp specular borders. |
| **Ivory Muted** | `rgba(251, 246, 234, 0.70)` | - | Secondary helper labels, table text, metadata descriptions. |
| **Ivory Dim** | `rgba(251, 246, 234, 0.40)` | - | Inactive icons, subtle gridlines, placeholder text. |
| **Regal Gold** | `#C8A24C` | `hsl(41, 53%, 54%)` | Primary CTAs, active status tabs, hover highlights, gold glow accents. |
| **Mustard Gold** | `#D9A23A` | `hsl(39, 69%, 54%)` | "New / Unread" status chips and alert accents. |
| **Emerald** | `#0E6B54` | `hsl(166, 77%, 24%)` | "Booked" & "Qualified" badges, success indicators, funnel chart gradient. |
| **Muted Crimson / Coral** | `#C15427` / `#E05353` | - | Destructive actions, delete buttons, declined lead status indicators. |
| **Glass Border** | `rgba(251, 246, 234, 0.10)` | - | Specular 1px outer borders for cards, modals, and panels. |
| **Glass Border Gold** | `rgba(200, 162, 76, 0.35)` | - | Hover border highlight on interactive cards. |

### 2.2 Typography Codex

1. **Display / Headlines (`font-serif`):** `Fraunces`, `Georgia`, `serif`
   - Weight: 400 (normal) for page titles and card numbers; 600 (semi-bold) for section headers.
   - Characterized by soft curves and high-end editorial luxury feel.
2. **Body & Interface (`font-sans`):** `Inter`, `system-ui`, `sans-serif`
   - Weight: 400 (regular), 500 (medium), 600 (semi-bold).
   - Clean, highly legible UI typography for tables, forms, labels, and descriptions.
3. **Metadata, Badges & Counters (`font-mono`):** `'Space Mono'`, `monospace`
   - Weight: 400 (regular), 700 (bold).
   - Used for status tags, timestamps, lead source pills, and count badges.

### 2.3 Status Chip Color Mapping

```javascript
const STATUS_THEMES = {
    new:           { bg: 'bg-amber-500/10',    border: 'border-amber-500/30',   text: 'text-amber-300',   dot: 'bg-amber-400',   borderLeft: 'border-l-amber-400' },
    contacted:     { bg: 'bg-sky-500/10',      border: 'border-sky-500/30',     text: 'text-sky-300',     dot: 'bg-sky-400',     borderLeft: 'border-l-sky-400' },
    qualified:     { bg: 'bg-teal-500/10',     border: 'border-teal-500/30',    text: 'text-teal-300',    dot: 'bg-teal-400',    borderLeft: 'border-l-teal-400' },
    proposal_sent: { bg: 'bg-purple-500/10',   border: 'border-purple-500/30',  text: 'text-purple-300',  dot: 'bg-purple-400',  borderLeft: 'border-l-purple-400' },
    booked:        { bg: 'bg-emerald-500/15',  border: 'border-gold/40',        text: 'text-emerald-300', dot: 'bg-gold',        borderLeft: 'border-l-gold' },
    completed:     { bg: 'bg-slate-500/10',    border: 'border-slate-500/30',   text: 'text-slate-300',   dot: 'bg-slate-400',   borderLeft: 'border-l-slate-400' },
    declined:      { bg: 'bg-rose-500/10',     border: 'border-rose-500/30',    text: 'text-rose-300',    dot: 'bg-rose-400',    borderLeft: 'border-l-rose-400' },
    lost:          { bg: 'bg-neutral-500/10',  border: 'border-neutral-500/30', text: 'text-neutral-400', dot: 'bg-neutral-500', borderLeft: 'border-l-neutral-600' }
};
```

---

## 3. Tailwind Script & Theme Configuration

The following script block replaces all legacy CSS inside the `<head>` of `views/dashboard.ejs`:

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

<!-- Chart.js 4.x CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Tailwind CSS Play CDN -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
    tailwind.config = {
        darkMode: 'class',
        theme: {
            extend: {
                colors: {
                    sage: {
                        deep: '#1A2721',
                        dark: '#121C18',
                        DEFAULT: '#0E6B54',
                        light: '#23372E',
                        border: 'rgba(251, 246, 234, 0.10)'
                    },
                    ink: {
                        deep: '#0D1210',
                        DEFAULT: '#14130E',
                        card: '#1B1A14',
                        elevated: '#23211B',
                        border: 'rgba(251, 246, 234, 0.12)'
                    },
                    ivory: {
                        DEFAULT: '#FBF6EA',
                        cream: '#F3EAD6',
                        muted: 'rgba(251, 246, 234, 0.70)',
                        dim: 'rgba(251, 246, 234, 0.40)',
                        subtle: 'rgba(251, 246, 234, 0.05)'
                    },
                    gold: {
                        DEFAULT: '#C8A24C',
                        hover: '#DBB55F',
                        mustard: '#D9A23A',
                        subtle: 'rgba(200, 162, 76, 0.15)',
                        glow: 'rgba(200, 162, 76, 0.35)'
                    },
                    emerald: {
                        DEFAULT: '#0E6B54',
                        hover: '#13876B',
                        subtle: 'rgba(14, 107, 84, 0.18)'
                    },
                    crimson: {
                        DEFAULT: '#C15427',
                        hover: '#D96536',
                        muted: '#E05353',
                        subtle: 'rgba(193, 84, 39, 0.15)'
                    }
                },
                fontFamily: {
                    serif: ['Fraunces', 'Georgia', 'serif'],
                    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                    mono: ['"Space Mono"', 'monospace']
                },
                boxShadow: {
                    'glass': 'inset 0 1px 0 rgba(255, 255, 255, 0.10), 0 10px 30px rgba(0, 0, 0, 0.35)',
                    'glass-hover': 'inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(200, 162, 76, 0.10)',
                    'gold-glow': '0 0 15px rgba(200, 162, 76, 0.30)',
                    'emerald-glow': '0 0 15px rgba(14, 107, 84, 0.30)'
                },
                keyframes: {
                    fadeIn: {
                        '0%': { opacity: '0', transform: 'translateY(6px)' },
                        '100%': { opacity: '1', transform: 'translateY(0)' }
                    },
                    slideDown: {
                        '0%': { opacity: '0', transform: 'translateY(-10px)' },
                        '100%': { opacity: '1', transform: 'translateY(0)' }
                    },
                    cardExit: {
                        '0%': { opacity: '1', transform: 'scale(1)', maxHeight: '250px' },
                        '100%': { opacity: '0', transform: 'scale(0.92)', maxHeight: '0px', margin: '0', padding: '0' }
                    }
                },
                animation: {
                    fadeIn: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    slideDown: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                    cardExit: 'cardExit 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }
            }
        }
    }
</script>

<style>
    /* Custom Scrollbar for smooth luxury experience */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #14130E;
    }
    ::-webkit-scrollbar-thumb {
        background: #23211B;
        border-radius: 4px;
        border: 1px solid rgba(251, 246, 234, 0.1);
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #C8A24C;
    }
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
```

---

## 4. Complete DOM Hierarchy Blueprint

The redesigned `dashboard.ejs` DOM tree is structured cleanly into 8 semantic glassmorphism layers:

```
<body> (bg-ink text-ivory min-h-screen antialiased bg-[radial-gradient(ellipse_at_top,_#1A2721_0%,_#14130E_65%)])
│
├── 1. STICKY TOP NAVIGATION (<nav class="sticky top-0 z-40 backdrop-blur-md bg-ink/85 border-b border-ivory/10 px-6 py-4">)
│   ├── Logo & Brand (<div class="flex items-center gap-3">): "Tiffany Webb" + italic gold "CRM" badge
│   └── Navigation Links (<div class="flex items-center gap-6">):
│       ├── Pipeline (Active link with gold bottom border)
│       ├── Add Lead (/leads/new)
│       ├── Website (/cms)
│       ├── Staff (/users)
│       └── Logout (/login)
│
├── 2. MAIN CONTAINER (<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">)
│   │
│   ├── 2.1 PAGE HEADER & NOTIFICATION BANNERS
│   │   ├── Title Section: "Booking Pipeline" (`font-serif text-3xl md:text-4xl text-ivory`) + subtitle
│   │   ├── Error Alert (EJS conditional `error`: muted crimson glass banner with alert icon)
│   │   └── Success Alert (EJS conditional `success`: emerald glass banner with checkmark icon)
│   │
│   ├── 2.2 KPI METRIC SUMMARY CARDS (<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">)
│   │   ├── Card 1: Total Leads (`leads.length`) — Gold accent
│   │   ├── Card 2: New / Unread (`leads.filter(status === 'new').length`) — Amber accent with pulse dot
│   │   ├── Card 3: Booked Clients (`leads.filter(status === 'booked').length`) — Emerald accent
│   │   └── Card 4: Proposals Out (`leads.filter(status === 'proposal_sent').length`) — Purple/Ivory accent
│   │
│   ├── 2.3 ANALYTICS CHARTS ROW (<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">)
│   │   ├── Chart Card 1: Lead Sources (Doughnut chart with 72% cutout & custom legend)
│   │   └── Chart Card 2: Pipeline Funnel (Bar chart with Gold-to-Emerald vertical gradient)
│   │
│   ├── 2.4 UNIFIED SEARCH & ACTION BAR (<div class="bg-ink-card/85 backdrop-blur-md border border-ivory/10 rounded-2xl p-4 ...">)
│   │   ├── Left: Live Search Input with search SVG icon, debounced listener & instant clear (ESC/click) button
│   │   └── Right: Bulk Delete All Leads (Muted Crimson) & "+ Add Manual Lead" CTA (Regal Gold button)
│   │
│   ├── 2.5 LIVE SEARCH RESULTS CONTAINER (`#searchResultsContainer` — Hidden by default)
│   │   ├── Search Results Header with match counter (`#searchResultCount`) and "Clear Search" button
│   │   └── Search Results Grid (`#searchResultsGrid` — Dynamic responsive 3-column lead card grid)
│   │
│   ├── 2.6 STATUS FILTER TABS BAR (`#statusTabsNav` — Horizontal scrollable navigation)
│   │   └── 8 Status Tabs: `new`, `contacted`, `qualified`, `proposal_sent`, `booked`, `completed`, `declined`, `lost`
│   │       ├── Active State: Gold glass pill (`bg-gold/15 border-gold/40 text-gold shadow-gold-glow`)
│   │       └── Tab Count Badge: Space Mono counter pill
│   │
│   └── 2.7 TAB CONTENT PANES & LEADS GRID (`#kanban-wrapper`)
│       └── For each status in `statuses`:
│           └── Tab Pane (`#tab-pane-${status}`)
│               ├── Pane Header: Status Name (`font-serif text-2xl text-ivory`) + "Delete All ${status}" button
│               ├── Empty State (Visible when 0 leads in status: editorial dashed container with luxury icon & message)
│               └── Leads Grid (`.leads-grid` — Responsive 3-column grid containing `.lead-card` components)
│                   └── Individual Lead Cards (`#lead-card-${lead.id}`):
│                       ├── Status Left Border (Color matched to stage)
│                       ├── Card Header: Contact Name, Event Date Badge, In-Place Delete Button
│                       ├── Card Body: Organization, Email & Phone with micro-icons, Notes snippet
│                       └── Card Footer: Source Badge & "View Inquiry →" CTA
│
└── 3. TOAST NOTIFICATION CONTAINER (`#toast-container` — Fixed bottom-right alert manager)
```

---

## 5. Component Markup Specifications

### 5.1 Sticky Glass Navigation Bar
```html
<nav class="sticky top-0 z-40 backdrop-blur-md bg-ink/85 border-b border-ivory/10 px-6 py-3.5 transition-all">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-serif font-bold text-lg">
                T
            </div>
            <h1 class="font-serif text-xl md:text-2xl text-ivory tracking-tight">
                Tiffany Webb <span class="text-gold italic font-light text-lg">CRM</span>
            </h1>
        </div>
        <div class="flex items-center gap-1 sm:gap-2">
            <a href="/dashboard" class="px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider text-gold bg-gold/10 border border-gold/30 transition-colors">
                Pipeline
            </a>
            <a href="/leads/new" class="px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider text-ivory-muted hover:text-ivory hover:bg-ivory/5 transition-colors">
                + Add Lead
            </a>
            <a href="/cms" class="px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider text-ivory-muted hover:text-ivory hover:bg-ivory/5 transition-colors">
                Website
            </a>
            <a href="/users" class="px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider text-ivory-muted hover:text-ivory hover:bg-ivory/5 transition-colors">
                Staff
            </a>
            <a href="/login" class="ml-2 px-3 py-1.5 rounded-xl text-xs font-mono text-crimson-muted hover:text-crimson hover:bg-crimson/10 border border-transparent hover:border-crimson/20 transition-colors flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Logout
            </a>
        </div>
    </div>
</nav>
```

### 5.2 KPI Statistics Cards Grid
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <!-- Card 1: Total Leads -->
    <div class="bg-gradient-to-br from-ink-card/95 to-ink-elevated/80 backdrop-blur-md border border-ivory/10 rounded-2xl p-5 shadow-glass hover:border-gold/30 hover:shadow-glass-hover transition-all duration-300 relative overflow-hidden group">
        <div class="flex items-center justify-between">
            <span class="font-mono text-xs uppercase tracking-wider text-ivory-muted">Total Inquiries</span>
            <div class="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
        </div>
        <div id="stat-total-leads" class="font-serif text-3xl sm:text-4xl text-ivory font-normal tracking-tight mt-3 mb-1">
            <%= leads.length %>
        </div>
        <p class="text-xs text-ivory-dim font-sans">Active database pipeline records</p>
    </div>

    <!-- Card 2: New / Unread -->
    <div class="bg-gradient-to-br from-ink-card/95 to-ink-elevated/80 backdrop-blur-md border border-amber-500/20 rounded-2xl p-5 shadow-glass hover:border-amber-400/40 hover:shadow-glass-hover transition-all duration-300 relative overflow-hidden group">
        <div class="flex items-center justify-between">
            <span class="font-mono text-xs uppercase tracking-wider text-amber-300/80">New / Unread</span>
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
            </div>
        </div>
        <div id="stat-new-leads" class="font-serif text-3xl sm:text-4xl text-amber-300 font-normal tracking-tight mt-3 mb-1">
            <%= leads.filter(l => l.status === 'new').length %>
        </div>
        <p class="text-xs text-amber-200/50 font-sans">Requires initial client outreach</p>
    </div>

    <!-- Card 3: Booked -->
    <div class="bg-gradient-to-br from-ink-card/95 to-ink-elevated/80 backdrop-blur-md border border-emerald/30 rounded-2xl p-5 shadow-glass hover:border-emerald hover:shadow-glass-hover transition-all duration-300 relative overflow-hidden group">
        <div class="flex items-center justify-between">
            <span class="font-mono text-xs uppercase tracking-wider text-emerald-300/80">Booked Clients</span>
            <div class="w-8 h-8 rounded-lg bg-emerald/15 border border-emerald/30 flex items-center justify-center text-emerald-300">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
        </div>
        <div id="stat-booked-leads" class="font-serif text-3xl sm:text-4xl text-emerald-300 font-normal tracking-tight mt-3 mb-1">
            <%= leads.filter(l => l.status === 'booked').length %>
        </div>
        <p class="text-xs text-emerald-200/50 font-sans">Confirmed contracts & retainers</p>
    </div>

    <!-- Card 4: Proposals Out -->
    <div class="bg-gradient-to-br from-ink-card/95 to-ink-elevated/80 backdrop-blur-md border border-purple-500/20 rounded-2xl p-5 shadow-glass hover:border-purple-400/40 hover:shadow-glass-hover transition-all duration-300 relative overflow-hidden group">
        <div class="flex items-center justify-between">
            <span class="font-mono text-xs uppercase tracking-wider text-purple-300/80">Proposals Out</span>
            <div class="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
        </div>
        <div id="stat-proposal-leads" class="font-serif text-3xl sm:text-4xl text-purple-200 font-normal tracking-tight mt-3 mb-1">
            <%= leads.filter(l => l.status === 'proposal_sent').length %>
        </div>
        <p class="text-xs text-purple-200/50 font-sans">Awaiting decision or payment</p>
    </div>
</div>
```

### 5.3 Unified Action & Search Bar
```html
<div class="bg-ink-card/85 backdrop-blur-md border border-ivory/10 rounded-2xl p-4 shadow-glass flex flex-col md:flex-row gap-4 items-center justify-between">
    <!-- Debounced Live Search Input -->
    <div class="relative w-full md:max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ivory-dim">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <input 
            type="text" 
            id="searchInput" 
            class="w-full bg-ink-elevated/80 border border-ivory/15 rounded-xl pl-10 pr-10 py-2.5 text-sm text-ivory placeholder-ivory-dim focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-sans"
            placeholder="Search leads by name, email, phone, org..."
            autocomplete="off"
        >
        <button 
            id="searchClearBtn" 
            type="button" 
            class="hidden absolute inset-y-0 right-0 pr-3.5 flex items-center text-ivory-dim hover:text-ivory transition-colors cursor-pointer"
            onclick="clearSearch()"
            title="Clear search"
        >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <button 
            type="button" 
            onclick="bulkDelete('all')" 
            class="px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase text-rose-300 bg-crimson/15 border border-crimson/30 hover:bg-crimson/25 hover:border-crimson/50 transition-all flex items-center gap-2"
        >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            Delete All Leads
        </button>
        <a 
            href="/leads/new" 
            class="px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase bg-gradient-to-r from-gold to-gold-hover text-ink-deep shadow-gold-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
        >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            + Add Manual Lead
        </a>
    </div>
</div>
```

### 5.4 High-Fidelity Lead Card Component
```html
<div 
    id="lead-card-<%= lead.id %>"
    class="lead-card group bg-gradient-to-br from-ink-card/95 to-ink-elevated/85 backdrop-blur-md border border-ivory/10 hover:border-gold/40 rounded-2xl p-5 shadow-glass hover:shadow-glass-hover transition-all duration-300 relative flex flex-col justify-between overflow-hidden cursor-pointer"
    data-lead-id="<%= lead.id %>"
    data-status="<%= lead.status %>"
    data-search="<%= [lead.contact_name, lead.email, lead.phone, lead.organization_name, lead.source, lead.status].filter(Boolean).join(' ').toLowerCase() %>"
    onclick="window.location.href='/lead/<%= lead.id %>'"
>
    <!-- Left Accent Line -->
    <div class="absolute left-0 top-0 bottom-0 w-1.5 <%= statusTheme.borderLeft %> rounded-l-2xl"></div>

    <div>
        <!-- Card Top Bar: Title & In-Place Delete -->
        <div class="flex items-start justify-between gap-2 mb-2 pl-2">
            <div class="flex-1 min-w-0">
                <h3 class="font-serif text-lg text-ivory group-hover:text-gold transition-colors font-medium truncate">
                    <%= lead.contact_name || lead.phone || 'Inquiry #' + lead.id %>
                </h3>
                <p class="text-xs text-ivory-muted font-sans truncate">
                    <%= lead.organization_name || 'Individual / Private Client' %>
                </p>
            </div>
            <div class="flex items-center gap-1.5">
                <span class="font-mono text-[11px] text-ivory-dim bg-ivory/5 px-2 py-0.5 rounded-md border border-ivory/5 whitespace-nowrap">
                    <%= lead.event_date ? new Date(lead.event_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'Date TBD' %>
                </span>
                <button 
                    type="button" 
                    class="p-1 rounded-lg text-ivory-dim hover:text-rose-400 hover:bg-crimson/15 transition-colors"
                    title="Delete lead"
                    onclick="deleteLeadCard(<%= lead.id %>, '<%= (lead.contact_name || 'Inquiry #' + lead.id).replace(/'/g, "\\'") %>', event)"
                >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
            </div>
        </div>

        <!-- Contact Micro-Details -->
        <div class="space-y-1 my-3 pl-2 text-xs text-ivory-dim">
            <% if (lead.email) { %>
                <div class="flex items-center gap-2 truncate">
                    <svg class="w-3.5 h-3.5 text-ivory-dim flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <span class="truncate"><%= lead.email %></span>
                </div>
            <% } %>
            <% if (lead.phone) { %>
                <div class="flex items-center gap-2 truncate">
                    <svg class="w-3.5 h-3.5 text-ivory-dim flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    <span class="truncate font-mono"><%= lead.phone %></span>
                </div>
            <% } %>
        </div>
    </div>

    <!-- Card Footer -->
    <div class="pt-3 border-t border-ivory/5 flex items-center justify-between pl-2 mt-2">
        <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full <%= statusTheme.dot %>"></span>
            <span class="font-mono text-[10px] uppercase tracking-wider text-ivory-muted">
                <%= (lead.source || 'website').replace(/_/g, ' ') %>
            </span>
        </div>
        <div class="text-xs font-mono text-ivory-dim group-hover:text-gold flex items-center gap-1 transition-colors">
            <span>Details</span>
            <svg class="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </div>
    </div>
</div>
```

---

## 6. Client-Side AJAX Architecture & Interaction Scripts

The frontend script in `views/dashboard.ejs` executes 4 asynchronous, zero-reload flows:

### 6.1 Debounced Live Search Engine (200ms)
- Attached to `#searchInput` `input` event.
- Queries `document.querySelectorAll('.lead-card')` without destroying DOM nodes.
- Highlights match count in `#searchResultCount`.
- Instantly resets to active tab pane on pressing `Escape` or clicking clear button.

### 6.2 Animated Status Filter Tabs
- Click handler `showTab(status)`.
- Smoothly hides inactive `#tab-pane-*` sections and reveals active pane with `animate-fadeIn`.
- Updates active tab styling with gold glow pill (`border-gold/40 text-gold bg-gold/15 shadow-gold-glow`).

### 6.3 Smooth In-Place AJAX Single & Bulk Deletion
- Calls `fetch('/lead/:id/delete', { method: 'POST' })` or `fetch('/api/leads/bulk-delete', { method: 'POST', body: JSON.stringify({ status }) })`.
- Transitions affected cards with CSS exit animation (`transform: scale(0.92)`, `opacity: 0`, `max-height: 0px`, `padding: 0px`).
- In-memory updates to KPI summary stats (`#stat-total-leads`, `#stat-new-leads`, etc.) and tab badge counters.
- Automatically reveals empty-state container if all leads in the tab pane are deleted.

### 6.4 Toast Notification Component
- Lightweight `showToast(message, type = 'success')` helper displaying gold/emerald or crimson feedback alerts with 3500ms auto-dismissal.

---

## 7. Legacy CSS Elimination Matrix

| Legacy Element / Selector | Old Malformed CSS | New Tailwind / Luxury Implementation |
| :--- | :--- | :--- |
| **Delete All Button** | `#ef4444` with `box-shadow: 0 0 22px rgba(239,68,68,0.9)` | `bg-crimson/15 text-rose-300 border-crimson/30 hover:bg-crimson/25` |
| **Action Bar** | `#2e1045` purple gradient with `#d8b4e2` border | `bg-ink-card/85 backdrop-blur-md border-ivory/10 rounded-2xl` |
| **Search Query Selector** | `document.querySelectorAll('.kanban-board .card')` (BROKEN) | `document.querySelectorAll('.lead-card')` (FUNCTIONAL) |
| **Search Clear Reset** | `document.querySelector('.kanban-wrapper')` (BROKEN NULL) | `document.getElementById('kanban-wrapper')` (SAFE) |
| **Card Gradients** | Injected amber/blue/purple multi-color cards | Unified luxury `bg-gradient-to-br from-ink-card to-ink-elevated` |
| **Bulk Delete Reload** | `window.location.reload()` | Dynamic card removal animation + in-memory counter decrements |

---

## 8. Verification & Next Steps

1. **Independent Verification Method:**
   - Syntax validation of EJS templates and Tailwind configuration.
   - Live browser testing for debounce search, tab switching, and AJAX card deletion.
   - Verification of zero inline conflicting `<style>` blocks.
2. **Handoff to Implementer:**
   - Detailed specification packaged into `handoff.md` for immediate drop-in implementation into `Landing Page Work/tiffany-webb-crm/views/dashboard.ejs`.
