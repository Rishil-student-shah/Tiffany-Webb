# Project: Tiffany Webb Web Platform & CRM Content Expansion

## Architecture
The platform is composed of two closely integrated applications sharing a unified MySQL 8 database (`tiffany_crm`):

1. **CRM Application (`Landing Page Work/tiffany-webb-crm`)**:
   - **Backend Engine**: Express 5 on Node.js with `mysql2/promise` connection pool.
   - **REST APIs**: Public content delivery (`GET /api/content/:page`, `GET /api/collections/:page/:section`), lead ingestion (`POST /api/leads`), and administrative APIs.
   - **Admin CMS Dashboard**: Server-rendered EJS templates styled with Tailwind CSS and brand tokens. Provides granular CRUD interfaces for:
     - Page metadata & active toggles (`website_pages`)
     - Key-value section content (`website_content`)
     - Structured repeater arrays (`website_collections`): 4 Capabilities, 20 Speaking Topics, 6 Engagement Formats, 5 Values, 6 Vignettes, 3 Bios, 4 Process Steps, FAQs, Testimonials, Engagements, and Articles.
     - Inbound Leads pipeline management (`leads`, `messages`).

2. **Public Web Platform (`Landing Page Work/tiffany-webb-astro`)**:
   - **Frontend Engine**: Astro 5 configured with `@astrojs/node` SSR middleware mode.
   - **Data Fetching Layer**: Server-side queries connecting to MySQL database (`website_pages`, `website_content`, `website_collections`) with robust fallback defaults.
   - **Brand System**: Dark Ink background (`#14130E` / `#0D1117`), Deep Forest Sage accents (`#0E6B54`), Warm Ivory typography (`#FBF6EA`), Regal Gold highlights (`#C8A24C`), Instrument Serif / Fraunces headers, Plus Jakarta Sans body, Space Mono metadata.
   - **Client-Side Interactions**: Vanilla JS with GSAP/Lenis, live topic filtering by track/audience, URL query string prefill for booking form, 1-click clipboard copy for press bios, and AJAX lead submission with inline validation.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | DB Schema & Content Engine | Relational tables (`website_pages`, `website_content`, `website_collections`, `leads`) | M1 | Survey |
| 2 | Complete Seed Data | Full database hydration for all 7 inner pages (4 capabilities, 20 speaking topics, etc.) | M1 | Survey |
| 3 | Public Content REST APIs | Endpoints for pages, collections, topics, and capabilities in `server.js` | M1 | Survey |
| 4 | CRM CMS Dashboard Expansion | EJS views & routes for editing all key-values and collection repeaters | M1 | Survey |
| 5 | Legacy Code Removal | Delete legacy sections on `/about` (roots, journey, core) and `/services` (Why Tiffany, old hero) | M2 | Survey |
| 6 | `/about` Page | 9 database-driven sections (Hero, 6 Vignettes, Credentials, Signpost, Specialism, Values, Affiliations, GambleFreeGear, CTA) | M2 | Survey |
| 7 | `/services` Page | 8 database-driven sections (301 redirect, Hero, 4 Capabilities with deep links, GEAR Method, Teaser, 6 Formats, 4 Steps, FAQ, CTA) | M2 | Survey |
| 8 | `/services/speaking-topics` Page | 4 database-driven sections (Hero, Client filter bar, 20 Topic cards across 4 tracks color-coded with prefill links, CTA) | M2 | Survey |
| 9 | `/impact` Page | 8 database-driven sections (Hero, Aggregate band, Upcoming/Past engagements, 3 Stories, Practice, Testimonials, CTA) | M3 | Survey |
| 10 | `/media` Page | 6 database-driven sections (Hero, Downloads cards, 3 Bios with copy buttons, Intro script, Speaking points, Media CTA) | M3 | Survey |
| 11 | `/work-with-tiffany` Page | 5 database-driven sections (301 redirect, Hero, 9-field AJAX Lead form with inline validation, 4 Steps, FAQ, Alt contact) | M3 | Survey |
| 12 | `/insights` Page & Article Template | 3 database-driven sections (Hero, Article grid, max-width 68ch serif template, top-nav rule <6 articles) | M3 | Survey |
| 13 | Global Navigation & 301 Redirects | Permanent redirects (`/speaking` -> `/services`, `/book` -> `/work-with-tiffany`) and nav link synchronization | M3 | Survey |
| 14 | Opaque-Box E2E Testing Suite | Multi-tier test suite (Tiers 1-4) covering all pages, forms, filters, and CRM CRUD | M4 | Survey |
| 15 | Adversarial Hardening & Audit | White-box stress testing (Tier 5) and Forensic Integrity Audit verification | M5 | Survey |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | CRM Backend & Database Content Engine | MySQL schema, seed data script with all 7 pages data, REST APIs, and CMS EJS management views | None | DONE |
| M2 | Astro Inner Pages: `/about`, `/services`, `/services/speaking-topics` | Legacy code deletion, 3 major pages implementation, 4 capabilities deep links, 20 speaking topics with filtering & prefill | M1 | IN_PROGRESS |
| M3 | Astro Inner Pages: `/impact`, `/media`, `/work-with-tiffany`, `/insights` & Redirects | 4 remaining pages implementation, 9-field lead AJAX form, bio clipboard copy, 301 redirects, and article templates | M1 | PLANNED |
| M4 | Dual Track E2E Testing Suite (Tiers 1–4) | Automated E2E verification across all pages, APIs, forms, filtering, and CRM workflows | M2, M3 | PLANNED |
| M5 | Adversarial Hardening (Tier 5) & Forensic Audit | Edge-case stress testing, security validation, and forensic integrity audit verification | M4 | PLANNED |

---

## Interface Contracts

### 1. Database Schema Contracts
- `website_pages`: `(id INT PK, slug VARCHAR(100) UNIQUE, name VARCHAR(150), meta_title VARCHAR(255), meta_description TEXT, is_active TINYINT(1))`
- `website_content`: `(id INT PK, page_id INT FK, section VARCHAR(100), key_name VARCHAR(100), content_value MEDIUMTEXT, content_type VARCHAR(50), UNIQUE(page_id, section, key_name))`
- `website_collections`: `(id INT PK, page_id INT FK, section_name VARCHAR(100), title VARCHAR(255), subtitle VARCHAR(255), content_html MEDIUMTEXT, image_url VARCHAR(255), icon_svg TEXT, category VARCHAR(100), meta_json JSON, sort_order INT, is_active TINYINT(1))`
- `leads`: `(id INT PK, source VARCHAR(50), status VARCHAR(50), contact_name VARCHAR(150), organization_name VARCHAR(200), email VARCHAR(190), country_code VARCHAR(10), phone VARCHAR(40), event_type VARCHAR(100), event_date DATE, event_location VARCHAR(200), estimated_audience_size VARCHAR(100), message TEXT, created_at DATETIME)`

### 2. CRM API Contracts
- `GET /api/content/:page` $\rightarrow$ `{ success: true, page: {...}, content: { section: { key: value } }, collections: { section_name: [...] } }`
- `POST /api/leads` $\rightarrow$ Request: `{ contact_name, organization_name, email, phone, country_code, event_type, event_date, event_location, estimated_audience_size, message, privacy_agreement }` $\rightarrow$ Response `{ success: true, message: "Lead submitted successfully", leadId: 123 }`

### 3. URL Routing & Redirects
- `/speaking` $\rightarrow$ `HTTP 301` $\rightarrow$ `/services`
- `/book` $\rightarrow$ `HTTP 301` $\rightarrow$ `/work-with-tiffany`
- `/work-with-tiffany?topic=Title` $\rightarrow$ Prefills textarea `Inquiring about speaking topic: Title` and selects event type.
- `/work-with-tiffany?type=Media` $\rightarrow$ Selects `Media / Press Inquiry`.

---

## Code Layout

- `Landing Page Work/tiffany-webb-crm/`
  - `server.js` (Express entry point, REST APIs, CMS routes, SSR bridge)
  - `db/schema.sql` (Base DDL)
  - `db/seed_inner_pages.sql` & `setup-db.js` (Database hydration & seed runner)
  - `views/cms.ejs`, `views/cms-page.ejs`, `views/cms-collection-edit.ejs` (Admin CMS UI)
  - `views/dashboard.ejs`, `views/lead.ejs` (Leads Pipeline UI)
- `Landing Page Work/tiffany-webb-astro/`
  - `astro.config.mjs`, `src/middleware.js` (Routing & redirects)
  - `src/lib/db.js` (Direct MySQL pool for Astro SSR)
  - `src/lib/cms.js` (Content & collection query helpers)
  - `src/pages/about.astro`
  - `src/pages/services.astro`
  - `src/pages/services/speaking-topics.astro`
  - `src/pages/impact.astro`
  - `src/pages/media.astro`
  - `src/pages/work-with-tiffany.astro`
  - `src/pages/insights.astro` & `src/pages/insights/[slug].astro`
  - `src/components/` (Reusable UI components)
