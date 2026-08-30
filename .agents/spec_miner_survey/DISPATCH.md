## 2026-08-30T09:37:29Z

You are a teamwork_preview_spec_miner mining all content specifications and data requirements.
Your working directory is: D:\FREELANCE\TIFFANY WEB\.agents\spec_miner_survey
Authoritative request: D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md

Tasks:
1. Read `D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md` (specifically under section ## 2026-08-30T09:36:29Z).
2. Extract an exhaustive, field-by-field specification for all 7 inner pages:
   - `/about`: 9 sections (Hero, The Story [5-7 vignettes, CONTENT-PENDING], Credentials & Expertise [BBA, MHP + 4 areas], How she works signpost -> /services#gear, The specialism id="specialism", Values [5 items + pull quote], Professional affiliations [ships empty], GambleFreeGear, CTA -> /work-with-tiffany)
   - `/services`: 8 sections (Redirect /speaking here; Page hero, Four Capabilities with deep-link IDs, The GEAR Method™ id="gear", Speaking & Facilitation, Engagement Formats [6 cards + long-tail line], What working together looks like [4 steps], FAQ [ships empty], CTA -> /work-with-tiffany)
   - `/services/speaking-topics`: 4 sections (Hero, Filter Bar client-side by audience & track, Topic Grid with exactly 20 cards grouped by 4 tracks color-coded with query string prefill to form, CTA)
   - `/impact`: 8 sections (Hero, Aggregate Band [ships empty], Upcoming Engagements [ships empty], Past Engagements [ships empty, filterable], Outcome Stories [3 slots, ships empty], Gambling Prevention Work [link -> /about#specialism], Testimonials [ships empty], CTA)
   - `/media`: 6 sections (Hero, Downloads asset cards, Bios in 3 lengths [CONTENT-PENDING, third-person], Introduction Script [CONTENT-PENDING, third-person], What she can speak to, Media inquiries CTA -> /work-with-tiffany?type=Media)
   - `/work-with-tiffany`: 5 sections (Redirect /book here; Hero, The Form with 9 fields POSTing to https://app.tiffanywebbimpact.com/api/leads with inline validation, What happens next [4 steps], FAQ [ships empty], Alternative contact)
   - `/insights`: 3 sections (Hero, Article Grid, Article Template max-width 68ch serif body, keep out of top nav until 6 articles exist)
3. For every single section and component, specify:
   - Required database fields and types (tables, JSON columns or relational rows).
   - Exact initial seed content (titles, subtitles, copy, vignettes, 4 capabilities, 20 speaking topics with tracks/audiences, 6 engagement formats, 5 values, 4 steps, etc.) and empty-state placeholders.
   - Exact client-side behaviors (filtering, query string prefill, deep links, inline validation, empty state hiding).
4. Produce a unified Data Dictionary & Content Specification.

Write your findings to `D:\FREELANCE\TIFFANY WEB\.agents\spec_miner_survey\spec_inventory_report.md` and deliver `handoff.md` in your working directory. Notify the orchestrator when finished.
