# Astro Frontend & UI Architecture Survey Report

**Project:** Tiffany Webb — Inner Pages & UI Architecture  
**Investigated Directory:** `Landing Page Work/tiffany-webb-astro`  
**Date:** 2026-08-30  
**Investigator:** Teamwork Explorer (`teamwork_preview_explorer`)  
**Authoritative Reference:** `D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md`

---

## Executive Summary

This report provides an exhaustive, multi-dimensional technical and architectural survey of the Astro frontend application (`Landing Page Work/tiffany-webb-astro`). It documents the build system, package dependencies, server-side rendering (SSR) configuration, routing map, brand design tokens, existing page states, legacy elements that must be deleted, database fetching architecture, and the required implementation blueprint for all 7 inner pages defined in `ORIGINAL_REQUEST.md`.

---

## 1. Technical Stack & Build Configuration

### 1.1 `package.json` Dependencies
- **Core Framework:** Astro `v7.2.0` (Node module ESM architecture)
- **Node Engine:** `>=22.12.0`
- **Adapter:** `@astrojs/node` (`^11.1.4`) running in `mode: 'middleware'`
- **Database Connector:** `mysql2` (`^3.24.1`) with promise-based connection pooling
- **Animation & Scrolling:** `gsap` (`^3.15.0`), `lenis` (`^1.3.26`), `@studio-freight/lenis` (`^1.0.42`)
- **Environment:** `dotenv` (`^17.4.2`)

### 1.2 `astro.config.mjs`
```javascript
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'middleware'
  }),
  devToolbar: {
    enabled: false
  },
  redirects: {
    '/speaking': {
      status: 301,
      destination: '/services'
    },
    '/book': {
      status: 301,
      destination: '/work-with-tiffany'
    }
  }
});
```
*Key Findings:*
- SSR mode is enabled (`output: 'server'`), allowing dynamic runtime database queries on page requests.
- Permanent 301 redirects are properly established:
  - `/speaking` $\rightarrow$ `/services`
  - `/book` $\rightarrow$ `/work-with-tiffany`

### 1.3 `src/middleware.js`
- Intercepts all incoming requests before page rendering.
- Connects to MySQL (`tiffany_crm`) and queries `SELECT is_active FROM website_pages WHERE slug = ?`.
- If a page has `is_active = 0`, it immediately redirects the visitor to `/404`.
- Skips static assets (`.png`, `.jpg`, `.svg`, `.css`, `.js`, etc.) and system routes (`/_`, `/api`, `/cms`).

---

## 2. Comprehensive Route & Page Catalog

| Route | Source File | Rendering Mode | Current Status / Content State |
|---|---|---|---|
| `/` | `src/pages/index.astro` | SSR (MySQL + Components) | Active Home Page with 12 modular sections |
| `/about` | `src/pages/about.astro` | SSR / Static | **Requires overhaul.** Contains legacy sections (`roots`, `journey`, `core`) and old hero. |
| `/services` | `src/pages/services.astro` | SSR (MySQL + Fallbacks) | **Requires overhaul.** Contains legacy old Hero & 'Why Tiffany' bento grid. Partial Capabilities & GEAR Method. |
| `/services/speaking-topics` | `src/pages/services/speaking-topics.astro` | SSR (MySQL) | **Incomplete.** Only shows 4 track summaries; missing client-side filter bar, 20 individual cards with form query links, and CTA. |
| `/impact` | `src/pages/impact.astro` | SSR (Components) | **Needs spec alignment.** Contains mock data in subcomponents instead of config-driven empty states. |
| `/media` | `src/pages/media.astro` | SSR / Static | **Incomplete.** Missing 3-tier third-person Bios, Introduction Script, What She Speaks To, and Media CTA. |
| `/work-with-tiffany` | `src/pages/work-with-tiffany.astro` | SSR / Static | **Requires update.** Old hero title, 6 process steps instead of 4, hardcoded FAQ instead of config array, local API POST endpoint. |
| `/insights` | `src/pages/insights.astro` | SSR (MySQL) | **Partial.** Grid exists; needs spec hero title, article excerpt/read-time metadata, and article template. Kept out of top nav. |
| `/newsletter` | `src/pages/newsletter.astro` | SSR (MySQL) | Standalone newsletter subscription page. |
| `/privacy` | `src/pages/privacy.astro` | SSR (MySQL) | Legal privacy policy (database-driven `website_content`). |
| `/terms` | `src/pages/terms.astro` | SSR (MySQL) | Legal terms of service (database-driven `website_content`). |
| `/404` | `src/pages/404.astro` | SSR / Static | Custom 404 page (contains link to `/speaking` that should be updated to `/services`). |

---

## 3. Brand System & UI Tokens Implementation

### 3.1 Color Palette (`src/styles/tokens.css` & `src/styles/global.css`)
- **Primary Dark Background (Dark Ink):** `--ink: #14130E` (paired with elevated dark surface `--char: #23211B`, and deep ink `#0D1117`).
- **Primary Light Background & Dark Text (Warm Ivory):** `--ivory: #FBF6EA`, `--cream: #F3EAD6`.
- **Structural Brand Colors (Deep Forest Sage & Teals):**
  - `--emerald: #0E6B54` (Primary Brand Sage/Emerald)
  - `--teal: #0B5C63`
  - `--teal-blue: #1C6E7A`
  - `--royal: #223A82`
- **Accents:**
  - `--gold: #C8A24C` (Eyebrows, active tabs, CTA buttons, fine border rules)
  - `--mustard: #D9A23A` (Data points, numbers, statistics)
  - `--coral: #E17356` (Warmth, pull quotes)
  - `--berry: #6C2D5A` (Depth, storytelling accents)
  - `--burnt: #C15427` (Emphasis/alerts)

### 3.2 The Contrast Law
Strictly enforced across all styles:
- Dark background (`#14130E` / `#0D1117`) $\rightarrow$ Warm Ivory (`#FBF6EA`) text.
- Light background (`#FBF6EA` / `#F3EAD6`) $\rightarrow$ Soft Black (`#14130E`) text.
- Never use low-contrast combinations (e.g. Ivory text on light backgrounds or muted gray on dark without WCAG AA compliance).

### 3.3 Typography Architecture
- **Serif Display / Headings:** `Instrument Serif` / `Fraunces` (600 weight; italic accents for key emotional phrases).
- **Sans-Serif Body / UI:** `Plus Jakarta Sans` / `Inter` (400, 500, 600 weight; line height 1.6–1.8).
- **Monospace Eyebrows / Meta:** `Space Mono` (400/700, uppercase, letter-spacing `0.1em` – `0.15em`).

### 3.4 Glassmorphism, Micro-Interactions & Motion
- **Glass Surfaces:** `.glass-card`, `.ultra-glass-card`, and `.glass-panel` utilizing `backdrop-filter: blur(16px - 32px)`, subtle gold/white borders (`rgba(255,255,255,0.08)` to `rgba(200,162,76,0.2)`), and smooth hardware-accelerated transforms.
- **Ambient Lighting:** Fixed `.global-ambient-glows` with radial gradient glowing orbs (`.glow-green` and `.glow-gold`).
- **Physics Cursor:** Custom cursor with smooth GSAP `quickTo` tracking on fine-pointer devices.
- **Vanilla Motion:** Observer-based reveals (`.reveal-up`, `.stagger-group`, `.count-up`, `.scale-reveal`) in `src/scripts/motion.js` with complete `prefers-reduced-motion` safety overrides.

---

## 4. Legacy Code Analysis & Deletion Plan

Per `ORIGINAL_REQUEST.md` (R3):

### 4.1 `/about` (`src/pages/about.astro`)
1. **Remove Legacy Roots Section:** Lines 28–80 (`<section class="roots">`) containing "The Origin", "When we rise, we rise together", the 3 Foundation/Work/Mission cards, and standalone cinematic quote.
2. **Remove Legacy Journey Section:** Lines 82–150 (`<section class="journey">`) containing "The Path Here", "Where all paths meet", and the 6-phase alternating vertical timeline.
3. **Remove Legacy Core Section:** Lines 152–207 (`<section class="core">`) containing Mission, Vision, and Values masonry grid.
4. **Update Page Hero:** Replace current heading ("Chicago soul, Louisiana heart.") with spec title: `"Chicago Heart — Louisiana Soul"`.
5. **Update CTA Link:** Replace `/book` button link with `/work-with-tiffany`.

### 4.2 `/services` (`src/pages/services.astro`)
1. **Remove Legacy Old Hero:** Lines 58–84 (`<section class="spk-hero-v2">`) featuring "Bring Tiffany to your stage." video card and "Check Availability" link.
2. **Remove Legacy 'Why Tiffany' Bento:** Lines 86–114 (`<section class="spk-section">`) containing the 4 bento cards ("Frontline credibility", "Cultural fluency", "Evidence-based", "Practical takeaways").
3. **Refactor Remaining Sections** into the 8 required spec sections.

### 4.3 Redirect Verification
- `/speaking` $\rightarrow$ 301 $\rightarrow$ `/services` (Verified in `astro.config.mjs`).
- `/book` $\rightarrow$ 301 $\rightarrow$ `/work-with-tiffany` (Verified in `astro.config.mjs`).
- Update internal anchor tags across components (`Nav.astro`, `Footer.astro`, `404.astro`, `about.astro`, `services.astro`, `impact.astro`) so they link directly to `/services` and `/work-with-tiffany` without relying on redirects.

---

## 5. Data Fetching & CRM Integration Architecture

### 5.1 Current Data Model
The Astro frontend connects directly to MySQL (`tiffany_crm`) at request time (SSR) using `mysql2/promise`.

Three core tables drive website content:
1. `website_pages`: Holds page metadata and publication state (`id`, `slug`, `name`, `is_active`, `created_at`).
2. `website_content`: Key-Value table for individual string fields, headers, eyebrows, subtitles, and section toggles (`id`, `page_id`, `section`, `key_name`, `content_value`, `content_type`).
3. `website_collections`: Array/Collection table for repeatable items such as capability cards, speaking tracks/topics, testimonials, timeline steps, FAQs, partners, and media bios (`id`, `page_id`, `section_name`, `title`, `subtitle`, `content_html`, `image_url`, `icon_svg`, `sort_order`).

### 5.2 Required Data Schema & CRM Visibility
Every single text string, paragraph, bullet point, list, and configuration array defined in the spec must be database-driven and manageable through the CRM dashboard (`/cms/:slug`).

**Collections to expose in CRM & Astro:**
- `/about`: `professional_affiliations` (ships empty), `values_list` (5 items), `credentials_list` (4 areas).
- `/services`: `four_capabilities` (4 items with deep-link IDs), `gear_method` (4 letters G-E-A-R), `engagement_formats` (6 cards), `working_steps` (4 steps), `faqs` (ships empty).
- `/services/speaking-topics`: `speaking_topics` (20 cards across 4 tracks with track IDs, audience tags, and query link parameters).
- `/impact`: `aggregate_stats` (ships empty), `upcoming_engagements` (ships empty), `past_engagements` (ships empty), `outcome_stories` (3 empty slots), `testimonials` (ships empty).
- `/media`: `downloadable_assets` (3 kits), `bios` (Short ~50w, Medium ~100w, Long ~250w in 3rd person), `intro_script` (3rd person), `speaking_focus_areas`.
- `/work-with-tiffany`: `faqs` (ships empty), `process_steps` (4 steps), `contact_info`.
- `/insights`: `articles` (title, date, reading time, excerpt, slug, image_url, content_html).

### 5.3 Lead Ingestion Form API
- In `src/pages/work-with-tiffany.astro`, the booking form must submit asynchronously via AJAX (Fetch API) to:
  `POST https://app.tiffanywebbimpact.com/api/leads` (or `http://localhost:3000/api/leads` via environment configuration).
- Includes all 9 fields with instant client-side validation and inline animated success messaging without a page reload.

---

## 6. Detailed Architectural Blueprint for the 7 Inner Pages

### 6.1 Page 1: `/about`
- **01. Page Hero:** Headline: `"Chicago Heart — Louisiana Soul"`. Subtitle: `Community Impact Strategist · Public Health Educator`. Portrait image with subtle organic border geometry.
- **02. The Story:** Long-form first-person narrative, 5–7 structured paragraphs (vignettes covering Chicago upbringing, Louisiana roots, frontline discovery, the hidden nature of gambling harm, and the mission to break silence). Marked with `data-content="CONTENT-PENDING"` where final client proofing is pending.
- **03. Credentials & Expertise:** Section title: `"Expertise that moves people."` Displays formal credentials (BBA, MHP) and 4 core domain areas (Prevention & Harm Reduction, Behavioral Health Integration, Community Engagement & Outreach, Strategic Coalition Building).
- **04. How She Works:** Interactive signpost / bridge linking to `/services#gear` ("Built on The GEAR Method™...").
- **05. The Specialism:** Section anchor `id="specialism"`. Headline: `"Where this work began."` Details frontline behavioral health and gambling harm prevention foundation.
- **06. Values:** 5 pillars (Faith, Family, Community, Purpose, Impact) plus featured pull quote: *"When we rise, we rise together."*
- **07. Professional Affiliations:** Database-driven configuration array (`section_name = 'affiliations'`). Ships EMPTY and dynamically hides its container when 0 items exist.
- **08. GambleFreeGear:** Feature card highlighting the apparel brand venture with outbound link to `https://gamblefreegear.com`.
- **09. CTA:** Magnetic button linking to `/work-with-tiffany`.

### 6.2 Page 2: `/services` (Redirect `/speaking` here)
- **01. Page Hero:** Headline: `"Strategy with people at the center."` Lead paragraph introducing human-centered strategy from early ideas to execution.
- **02. Four Capabilities:** Alternating visual blocks with deep-link IDs:
  1. `id="strategic-advisor"` — **Strategic Advisor** (`01 // THINK`)
  2. `id="program-architect"` — **Program Architect** (`02 // BUILD`)
  3. `id="community-impact-strategist"` — **Community Impact Strategist** (`03 // CONNECT`)
  4. `id="speaker-facilitator"` — **Speaker & Facilitator** (`04 // MOVE`)
- **03. The GEAR Method™:** Section anchor `id="gear"`. Expanded 4-part methodology:
  - **G** — *Generate*: Build awareness and understanding.
  - **E** — *Engage*: Build trust and connection.
  - **A** — *Activate*: Move ideas into action.
  - **R** — *Resource*: Build the path forward.
- **04. Speaking & Facilitation:** Section title: `"Conversations that create change."` Overview of speaking offerings with direct CTA button linking to `/services/speaking-topics`.
- **05. Engagement Formats:** 6 distinct format cards (Keynote, Conference Session, Panel, School & University, Workshop / Training, Custom Program) + long-tail description with semantically appropriate SVG icons (no gambling iconography!).
- **06. What Working Together Looks Like:** 4 chronological steps:
  1. *Discovery & Alignment*
  2. *Customization*
  3. *Delivery*
  4. *Follow-up & Integration*
- **07. FAQ:** Config-driven accordion array (`section_name = 'faqs'`). Ships EMPTY and hides container when 0 items exist.
- **08. CTA:** Closing invitation card linking to `/work-with-tiffany`.

### 6.3 Page 3: `/services/speaking-topics`
- **01. Page Hero:** Headline: `"Conversations that create change."` Subhead: `Twenty topics across four tracks.`
- **02. Client-Side Filter Bar:**
  - **By Track:** All, Prevention & Awareness, Treatment & Recovery, Family Impact, Creative Engagement.
  - **By Audience:** All, Communities & General Public, Clinicians & Healthcare, Families & Affected Others, Organizations & Coalitions.
  - Operates dynamically in browser DOM without page reloads.
- **03. Topic Grid:** Exactly 20 topic cards categorized under 4 tracks (5 topics each):
  - *Track 1 (Prevention & Awareness):* Gambling Prevention & Community Awareness, Don't Bet on Your Future (Youth), Engaging Elected Officials, Cultural Fluency in Outreach, The Cost of Mobile Betting.
  - *Track 2 (Treatment & Recovery):* Co-Occurring Disorders & Screening, Harm Reduction Strategies, Motivational Interviewing in Practice, Clinical Protocols for Hidden Addictions, Reintegration Pathways.
  - *Track 3 (Family Impact):* Significant Others & Family Harm, Gambling, Violence & Trauma, Financial Protection & Coping Strategies, Rebuilding Trust at Home, Supporting Children in Affected Households.
  - *Track 4 (Creative Engagement):* Youth Art Competitions as Prevention, Responsible Gifting Campaigns, ROSC Council Integration, Faith-Based Coalition Activation, Community Awareness Events.
  - Color-coded badges per track (Emerald, Burnt Amber, Amethyst, Gold).
  - Each card features an "Inquire About This Topic" link pre-filling the booking inquiry: `/work-with-tiffany?topic=Topic+Name`. Session lengths and specific takeaways marked `CONTENT-PENDING`.
- **04. CTA:** Closing consultation prompt linking to `/work-with-tiffany`.

### 6.4 Page 4: `/impact`
- **01. Page Hero:** Headline: `"Where the work has taken me."` Subtitle explaining geographic and community reach.
- **02. Aggregate Band:** Config-driven statistics counter (e.g. Hours, Engagements, States). Ships EMPTY (hidden if no stats configured).
- **03. Upcoming Engagements:** Database-driven list. Ships EMPTY with elegant fallback message: *"Next dates announced soon."*
- **04. Past Engagements:** Database-driven directory filterable by Year, Format, and Audience. Ships EMPTY with designed placeholder state.
- **05. Outcome Stories:** 3 curated case-study slots (Situation, Action, Outcome). Ships EMPTY / CONTENT-PENDING.
- **06. Gambling Prevention Practice:** Detailed description of her practice and methodology, maintaining neutrality without naming proprietary employers. Includes anchor link: `Read about her specialism → /about#specialism`.
- **07. Testimonials:** Config-driven review cards. Ships EMPTY with feedback notice.
- **08. CTA:** Closing booking button linking to `/work-with-tiffany`.

### 6.5 Page 5: `/media`
- **01. Page Hero:** Headline: `"Ready for the room — and the story."` Subtitle for event organizers, media producers, and journalists.
- **02. Downloadable Press Assets:** Asset cards for:
  - *Speaker One-Sheet (PDF)*
  - *Media Kit (ZIP with high-res headshots)*
  - *Capability Kit (PDF)*
  - Hides unavailable downloads; never displays dead/broken links (`href="#"`).
- **03. Professional Bios (3 Lengths):** Written strictly in **THIRD PERSON**:
  - *Short Bio (~50 words)* for event programs.
  - *Medium Bio (~100 words)* for speaker introductions.
  - *Long Bio (~250 words)* for press features.
  - Marked `CONTENT-PENDING` with copy-to-clipboard functionality.
- **04. Introduction Script:** Official stage introduction script for emcees and moderators, written in **THIRD PERSON**. Marked `CONTENT-PENDING`.
- **05. What She Can Speak To:** Bulleted editorial list of commentary focus areas (Youth sports betting, Public health intervention, Frontline stigma, Policy & community coalitions).
- **06. Media Inquiries CTA:** Dedicated media card linking to `/work-with-tiffany?type=Media`.

### 6.6 Page 6: `/work-with-tiffany` (Redirect `/book` here)
- **01. Page Hero:** Headline: `"Let's create impact together."` Reassurance that Tiffany personally reviews all inquiries.
- **02. Interactive Booking Form:**
  - 9 structured fields: Contact Name, Organization, Email, Phone (with international country-code picker), Event Type, Event Date, Location / Virtual, Estimated Audience Size / Budget, Message / Topic of Interest.
  - Submits asynchronously to `https://app.tiffanywebbimpact.com/api/leads`.
  - Accessible inline validation, real-time error announcements, and smooth DOM transition to success state without page reload.
- **03. What Happens Next:** 4 clear onboarding steps:
  1. *Inquiry Review* (within 2 business days)
  2. *Discovery Conversation* (understanding room dynamics & goals)
  3. *Tailored Proposal* (outline, format, terms)
  4. *Execution & Impact* (delivery & post-event resources)
- **04. FAQ:** Config-driven array (`section_name = 'faqs'`). Ships EMPTY.
- **05. Alternative Contact:** Direct booking email (`booking@tiffanywebbimpact.com`) and location note (`Chicago, IL · Available nationally`).

### 6.7 Page 7: `/insights`
- **01. Page Hero:** Headline: `"Thinking out loud."` Subtitle on frontline perspectives and prevention thought leadership.
- **02. Article Grid:** Cards featuring article title, published date, estimated reading time, excerpt, category tag, and thumbnail.
- **03. Article Template (`/insights/[slug]` or modal reader):**
  - Editorial reading column constrained to `max-width: 68ch`.
  - Serif body typography (`Instrument Serif` / `Fraunces`), generous line height (`1.75`), and styled blockquotes.
  - Kept out of the primary top navigation until at least 6 published articles exist in the CRM (managed via `src/config/navigation.js`).

---

## 7. Quality Checklist & Verification Criteria

| Checkpoint | Target State | Verification Method |
|---|---|---|
| **Route Integrity** | All 7 inner pages + legal/utility pages resolve with HTTP 200 / SSR render. | Check Astro routes & SSR endpoints. |
| **Redirect Rules** | `/speaking` $\rightarrow$ 301 $\rightarrow$ `/services`; `/book` $\rightarrow$ 301 $\rightarrow$ `/work-with-tiffany`. | Verify in `astro.config.mjs` and middleware. |
| **Legacy Code Removal** | No traces of `roots`, `journey`, or `core` in `/about`; no old hero or 'Why Tiffany' in `/services`. | Grep & code inspection of `about.astro` and `services.astro`. |
| **Brand Tokens** | Dark Ink (`#0D1117` / `#14130E`), Emerald (`#0E6B54`), Gold (`#C8A24C`), Ivory (`#FBF6EA`). | CSS token verification in `tokens.css` and layout files. |
| **Typography Codex** | Instrument Serif / Fraunces Display, Plus Jakarta Sans / Inter Body, Space Mono Eyebrows. | Font loading and typography scale inspection. |
| **Empty State Fidelity** | All unconfirmed / pending lists (Affiliations, FAQs, Engagements, Outcome Stories) ship EMPTY without dummy organizations. | Verify database collections queries and conditional rendering. |
| **Database Dynamic Control** | Every content section and collection item editable via CRM dashboard. | Verify `website_content` and `website_collections` queries. |
