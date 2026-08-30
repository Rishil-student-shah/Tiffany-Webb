## 2026-08-30T09:42:00Z

You are a teamwork_preview_worker implementing Milestone 1: CRM Backend & Database Content Engine.
Your working directory is: D:\FREELANCE\TIFFANY WEB\.agents\worker_m1_1
Authoritative request: D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md
Project plan: D:\FREELANCE\TIFFANY WEB\PROJECT.md
Spec Report: D:\FREELANCE\TIFFANY WEB\.agents\spec_miner_survey\spec_inventory_report.md
CRM Survey Report: D:\FREELANCE\TIFFANY WEB\.agents\explorer_crm_survey\crm_survey_report.md
CRM Directory: D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write Ownership: You have exclusive write ownership of files inside `Landing Page Work/tiffany-webb-crm/`.

Your Objectives:
1. Ensure the MySQL schema in `db/schema.sql` and `setup-db.js` fully defines `website_pages`, `website_content`, `website_collections`, `leads`, `users`, `messages`.
2. Build a complete, exhaustive seed script `db/seed_inner_pages.sql` and update `setup-db.js` to seed 100% of all content required by the specification for all 7 inner pages:
   - `/about`: 9 sections (Hero, 6 Story Vignettes marked CONTENT-PENDING, Credentials & Expertise, How She Works signpost -> /services#gear, The Specialism id="specialism", 5 Values + pull quote, Affiliations array [active=0, empty], GambleFreeGear paragraph+link, CTA -> /work-with-tiffany).
   - `/services`: 8 sections (Hero, 4 Capabilities with deep-link IDs: strategic-advisor, program-architect, community-impact-strategist, speaker-facilitator, The GEAR Method™ id="gear", Speaking teaser, 6 Engagement Formats + long-tail line, 4 Working Steps, FAQ array [active=0, empty], CTA).
   - `/services/speaking-topics`: 4 sections (Hero, Filter Bar config, exactly 20 Topic Cards across 4 tracks: Prevention & Awareness, Treatment & Recovery, Family & Community, Creative Engagement with target audiences and color codes, CTA).
   - `/impact`: 8 sections (Hero, Aggregate stats band [ships empty], Upcoming engagements [ships empty], Past engagements [ships empty], 3 Outcome Stories [ships empty], Gambling Prevention practice description with link -> /about#specialism, Testimonials [ships empty], CTA).
   - `/media`: 6 sections (Hero, 3 Asset Downloads cards, 3 Bios [short ~40w, medium ~90w, long ~150w in third-person], Introduction Script [third-person], What She Can Speak To list, Media Inquiries CTA -> /work-with-tiffany?type=Media).
   - `/work-with-tiffany`: 5 sections (Hero, 9-field Lead Form configuration, 4 What Happens Next steps, FAQ array [ships empty], Alternative contact info: booking@tiffanywebb.com, location).
   - `/insights`: 3 sections (Hero, 3 seed articles with slug, title, category, read_time, excerpt, full body text, CTA, nav rule).
3. Run the database setup/seeding script (`node setup-db.js` or custom runner) to hydrate the MySQL database (`tiffany_crm`). Verify all records are inserted and queryable.
4. Verify/implement Express REST API endpoints in `server.js`:
   - `GET /api/content/:slug` (returns page metadata, KV section content object, and active collection arrays)
   - `GET /api/collections/:slug/:section` (returns active collection items for a page/section)
   - `POST /api/leads` (handles inbound lead submission with complete field validation, stores lead in DB, returns JSON `{ success: true, leadId }`)
5. Update/expand CRM admin CMS EJS views (`views/cms.ejs`, `views/cms-page.ejs`, `views/cms-collection-edit.ejs`) and Express routes so the admin user can view and edit every page's key-values and collection items (including all 4 capabilities, 20 speaking topics, bios, FAQs, formats, etc.) with add, edit, toggle, and delete functionality.
6. Verify and test the API endpoints and server routes (e.g. running a test script or node verification) to confirm responses match the contract.

Write your execution details to `D:\FREELANCE\TIFFANY WEB\.agents\worker_m1_1\m1_worker_report.md` and deliver `handoff.md`. Notify the orchestrator when completed.
