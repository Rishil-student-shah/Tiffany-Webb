## 2026-08-30T09:37:00Z
You are the Project Orchestrator for the Tiffany Webb web platform inner pages and CRM content management expansion.

Your working directory is: D:\FREELANCE\TIFFANY WEB\.agents\orchestrator_2
Authoritative user request: D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md (under section ## 2026-08-30T09:36:29Z)
Astro App Directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-astro
CRM App Directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm

Mission & Objectives:
1. Build and structure all inner pages strictly adhering to the specification in ORIGINAL_REQUEST.md:
   - /about (Page hero, The story [5-7 vignettes, CONTENT-PENDING], Credentials & Expertise, How she works signpost -> /services#gear, The specialism id="specialism", Values, Professional affiliations [ships empty], GambleFreeGear, CTA -> /work-with-tiffany)
   - /services (Redirect /speaking here; Page hero, Four Capabilities with deep-link IDs, The GEAR Method™ id="gear", Speaking & Facilitation, Engagement Formats [6 cards + long-tail line], What working together looks like [4 steps], FAQ [ships empty], CTA -> /work-with-tiffany)
   - /services/speaking-topics (Hero, Filter Bar client-side by audience & track, Topic Grid with exactly 20 cards grouped by 4 tracks color-coded with query string prefill to form, CTA)
   - /impact (Hero, Aggregate Band [ships empty], Upcoming Engagements [ships empty], Past Engagements [ships empty, filterable], Outcome Stories [3 slots, ships empty], Gambling Prevention Work [links -> /about#specialism], Testimonials [ships empty], CTA)
   - /media (Hero, Downloads asset cards, Bios in 3 lengths [CONTENT-PENDING, third-person], Introduction Script [CONTENT-PENDING, third-person], What she can speak to, Media inquiries CTA -> /work-with-tiffany?type=Media)
   - /work-with-tiffany (Redirect /book here; Hero, The Form with 9 fields POSTing to https://app.tiffanywebbimpact.com/api/leads with inline validation, What happens next [4 steps], FAQ [ships empty], Alternative contact)
   - /insights (Hero, Article Grid, Article Template max-width 68ch serif body, keep out of top nav until 6 articles exist)
2. CRITICAL DATA REQUIREMENT: Every single text string, paragraph, bullet point, list, and configuration array defined in the spec must be 100% database-driven. Expose every section (including 4 capabilities, 20 speaking topics, engagement formats, FAQ arrays, testimonials, upcoming engagements, etc.) in MySQL schema and CRM dashboard views/routes so the user has detailed editing access. Astro frontend must fetch and render this data dynamically.
3. Remove legacy code: Delete legacy sections from /about ('roots', 'journey', 'core') and /services ('Why Tiffany', old Hero).
4. Strictly enforce Tiffany Webb brand system (Dark Ink background, Deep Forest Sage accents, Gold/Ivory typography, Instrument Serif / Plus Jakarta Sans).

Maintain your plan.md, progress.md, and context.md in your working directory. Use subagents (explorers, workers, reviewers, challengers, auditors) to achieve high quality and verification. Report your progress and final handoff to the Sentinel when completed.
