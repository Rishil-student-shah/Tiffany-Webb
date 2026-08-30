## 2026-08-30T09:50:36Z
You are a teamwork_preview_worker implementing Milestone 2: Astro Inner Pages (/about, /services, /services/speaking-topics) and Legacy Code Removal.
Your working directory is: D:\FREELANCE\TIFFANY WEB\.agents\worker_m2_1
Authoritative request: D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md
Project plan: D:\FREELANCE\TIFFANY WEB\PROJECT.md
Spec Report: D:\FREELANCE\TIFFANY WEB\.agents\spec_miner_survey\spec_inventory_report.md
Astro Directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-astro
CRM Directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership: You have exclusive write ownership of files inside `Landing Page Work/tiffany-webb-astro/` (specifically `src/pages/about.astro`, `src/pages/services.astro`, `src/pages/services/speaking-topics.astro`, `src/lib/cms.js`, and associated components).

Your Objectives:
1. Delete legacy sections:
   - `/about`: Remove 'roots', 'journey', 'core' legacy sections.
   - `/services`: Remove 'Why Tiffany' bento grid and old Hero.
2. Build `/about.astro` with all 9 database-driven sections:
   - 01. Page hero — "Chicago Heart — Louisiana Soul" + subtitle + editorial portrait.
   - 02. The story — long form, first person, 5–7 paragraphs (vignettes). Mark CONTENT-PENDING.
   - 03. Credentials & Expertise — "Expertise that moves people." + BBA, MHP + 4 areas.
   - 04. How she works — Signpost linking to /services#gear
   - 05. The specialism — (id="specialism") "Where this work began."
   - 06. Values — 5 items + pull quote.
   - 07. Professional affiliations — Config array, ships EMPTY (hidden when empty).
   - 08. GambleFreeGear — Paragraph + link.
   - 09. CTA → /work-with-tiffany
3. Build `/services.astro` with all 8 database-driven sections:
   - 01. Page hero — "Strategy with people at the center."
   - 02. Four Capabilities — alternating blocks with deep-link IDs (#strategic-advisor, #program-architect, #community-impact-strategist, #speaker-facilitator).
   - 03. The GEAR Method™ (id="gear") — Expanded descriptions (G, E, A, R).
   - 04. Speaking & Facilitation — "Conversations that create change." + link to topics.
   - 05. Engagement Formats — 6 cards + long-tail line. Semantically appropriate icons.
   - 06. What working together looks like — 4 steps.
   - 07. FAQ — Config array, ships EMPTY (hidden when empty).
   - 08. CTA → /work-with-tiffany
4. Build `/services/speaking-topics.astro` with all 4 database-driven sections:
   - 01. Hero — "Conversations that create change."
   - 02. Filter Bar — By audience, By track (Client-side zero-reload filter with badge count).
   - 03. Topic Grid — Exactly 20 cards grouped by the 4 tracks, color-coded. Card link to form pre-fills the message field via query string (/work-with-tiffany?topic=URL_ENCODED_TITLE). Mark session lengths/takeaways CONTENT-PENDING.
   - 04. CTA
5. Implement dynamic data loading from MySQL (`website_content` and `website_collections`) in `src/lib/cms.js` or directly via `src/lib/db.js` with structured fallbacks matching the seed database.
6. Strictly enforce Tiffany Webb brand design system (Dark Ink background #14130E / #0D1117, Deep Forest Sage accents #0E6B54, Gold/Ivory typography #C8A24C / #FBF6EA, Instrument Serif / Fraunces, Plus Jakarta Sans, Space Mono).
7. Run build/tests (`npm run build` or node verification) to ensure clean build with 0 errors.

Write your report to `D:\FREELANCE\TIFFANY WEB\.agents\worker_m2_1\m2_worker_report.md` and deliver `handoff.md`. Notify the orchestrator when completed.
