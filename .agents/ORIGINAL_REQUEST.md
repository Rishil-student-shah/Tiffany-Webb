# Original User Request

## 2026-08-30T08:58:12Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Completely redesign the UI and UX of the Tiffany Webb CRM Leads Dashboard (`views/dashboard.ejs`). The redesign must include a cohesive premium color palette (Deep Forest Sage, Ink, Ivory, Gold), elegant typography, modernized charts, a unified action/search bar, and polished animations. You are authorized to pull in external UI libraries (like Tailwind via CDN) and rebuild the frontend logic for a smoother experience.

Working directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm
Integrity mode: benchmark

## Requirements

### R1. Complete Visual Overhaul
Redesign the entire `dashboard.ejs` page to feel like a premium, modern web application. Unify the design language so that charts, action bars, search inputs, and lead cards share the same aesthetic (glassmorphism, cohesive padding, elegant typography). You may introduce Tailwind CSS via CDN or external charting libraries to achieve this.

### R2. Smooth UX and AJAX Interactions
Rewrite the frontend JavaScript in `dashboard.ejs` to eliminate clunky page reloads. Searching for leads, filtering by status tabs, and bulk-deleting leads must happen via AJAX fetches with smooth DOM transition animations (fade-ins, sliding lists). 

## Acceptance Criteria

### Visual Quality (Agent-as-Judge)
- [ ] The design utilizes the defined brand colors (Deep Forest Sage, Gold, Ivory, Ink) consistently across all components.
- [ ] There are no unstyled or clashing legacy elements remaining (e.g., bright red default buttons, misaligned charts).
- [ ] Hover states and transitions are smooth and implemented on all interactive elements.

### Functional UX (Programmatic / Agent-as-Judge)
- [ ] Typing in the search bar updates the lead list dynamically without a full page refresh.
- [ ] Clicking a status tab seamlessly hides/shows the relevant leads with an animation, without a page reload.
- [ ] Deleting a lead successfully calls the backend and removes the card from the DOM smoothly.

## 2026-08-30T09:36:29Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full team

Build and structure all inner pages (`/about`, `/services`, `/services/speaking-topics`, `/impact`, `/media`, `/work-with-tiffany`, `/insights`) strictly adhering to the provided content specification. The design must aggressively enforce the Tiffany Webb brand system (Dark Ink background, Deep Forest Sage accents, Gold/Ivory typography, Instrument Serif / Plus Jakarta Sans).

**CRITICAL DATA REQUIREMENT:** Every single text string, paragraph, bullet point, list, and configuration array defined in the spec must be 100% database-driven. You must expose every section (including the 4 capabilities, 20 speaking topics, engagement formats, FAQ arrays, etc.) in the CRM dashboard so the user has detailed editing access to all of them.

Working directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-astro
CRM directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm
Integrity mode: development

## Requirements

### R1. Strictly Implement the Page Specifications
You must build the following pages exactly in this order with these sections:

**1. /about**
01. Page hero — "Chicago Heart A- Louisiana Soul"
02. The story — long form, first person, 5–7 paragraphs (vignettes). Mark CONTENT-PENDING.
03. Credentials & Expertise — "Expertise that moves people." + BBA, MHP + 4 areas.
04. How she works — Signpost linking to /services#gear
05. The specialism — (id="specialism") "Where this work began."
06. Values — 5 items + pull quote.
07. Professional affiliations — Config array, ships EMPTY (hidden when empty).
08. GambleFreeGear — Paragraph + link.
09. CTA → /work-with-tiffany

**2. /services (Redirect /speaking here)**
01. Page hero — "Strategy with people at the center."
02. Four Capabilities — alternating blocks with deep-link IDs (strategic-advisor, program-architect, community-impact-strategist, speaker-facilitator).
03. The GEAR Method™ (id="gear") — Expanded descriptions.
04. Speaking & Facilitation — "Conversations that create change." + link to topics.
05. Engagement Formats — 6 cards + long-tail line. Semantically appropriate icons.
06. What working together looks like — 4 steps.
07. FAQ — Config array, ships EMPTY (hidden when empty).
08. CTA → /work-with-tiffany

**3. /services/speaking-topics**
01. Hero — "Conversations that create change."
02. Filter Bar — By audience, By track (Client-side, no reload).
03. Topic Grid — Exactly 20 cards grouped by the 4 tracks, color-coded. Card link to form pre-fills the message field via query string. Mark session lengths/takeaways CONTENT-PENDING.
04. CTA

**4. /impact**
01. Hero — "Where the work has taken me."
02. Aggregate Band — Config-driven, ships empty.
03. Upcoming Engagements — Ships empty ("Next dates announced soon").
04. Past Engagements — Ships empty, filterable by year/format/audience.
05. Outcome Stories — 3 slots. Ships empty.
06. Gambling Prevention Work — Describe practice, do not name employer. Link -> /about#specialism.
07. Testimonials — Ships empty.
08. CTA

**5. /media**
01. Hero — "Ready for the room — and the story."
02. Downloads — Asset cards (hide unavailable ones, don't show dead links).
03. Bios — 3 lengths. THIRD PERSON voice. Mark CONTENT-PENDING.
04. Introduction Script — THIRD PERSON. Mark CONTENT-PENDING.
05. What she can speak to — short list.
06. Media inquiries CTA → /work-with-tiffany?type=Media.

**6. /work-with-tiffany (Redirect /book here)**
01. Hero — "Let's create impact together."
02. The Form — 9 fields, POSTs to https://app.tiffanywebbimpact.com/api/leads. Inline validation, no reload.
03. What happens next — 4 steps.
04. FAQ — Config-driven, ships empty.
05. Alternative contact — Email and location.

**7. /insights**
01. Hero — "Thinking out loud."
02. Article Grid — Cards with title/date/time/excerpt.
03. Article Template — max-width 68ch, serif body, large line height. Keep out of top nav until 6 articles exist.

### R2. Global Database & CRM Integration
You must modify the MySQL database schema and the CRM `server.js` / `.ejs` templates to expose all content arrays (FAQs, Testimonials, Speaking Topics, Capabilities, Media Bios, etc.) as editable collections. The Astro pages must fetch and render this data dynamically.

### R3. Remove Legacy Code
Delete the legacy sections from `/about` (`roots`, `journey`, `core`) and `/services` (`Why Tiffany`, old Hero) as they are no longer in the spec.

## Acceptance Criteria

### CRM Visibility (Programmatic)
- [ ] Every configuration array (e.g., Professional Affiliations, FAQs, Upcoming Engagements, Media Bios) is visible and editable in the CRM interface.
- [ ] The 20 Speaking Topics and 4 Capabilities have dedicated CRM editing fields.

### Architecture & Fidelity (Agent-as-Judge)
- [ ] All specified pages route correctly and render without errors.
- [ ] No placeholder organizations or dummy text are visible unless explicitly marked CONTENT-PENDING or EMPTY per the spec.
- [ ] The design strictly obeys the brand typography and color palette guidelines.

