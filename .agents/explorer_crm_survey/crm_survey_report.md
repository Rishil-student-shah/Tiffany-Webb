# Comprehensive CRM Backend Codebase & Database Architecture Survey Report

**Project**: Tiffany Webb Web Application & CRM System  
**Working Directory (Surveyor)**: `D:\FREELANCE\TIFFANY WEB\.agents\explorer_crm_survey`  
**CRM Directory**: `D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-crm`  
**Frontend Directory**: `D:\FREELANCE\TIFFANY WEB\Landing Page Work\tiffany-webb-astro`  
**Authoritative Reference**: `D:\FREELANCE\TIFFANY WEB\.agents\ORIGINAL_REQUEST.md`  
**Date**: August 30, 2026  

---

## 1. Executive Summary

This investigation delivers a complete architectural survey of the Tiffany Webb CRM backend and its integration with the Astro frontend. The goal is to establish a **100% database-driven content management and customer relationship management architecture** that powers all 7 inner pages (`/about`, `/services`, `/services/speaking-topics`, `/impact`, `/media`, `/work-with-tiffany`, `/insights`) in strict compliance with the authoritative brand system and content specification.

### Key Architectural Findings
1. **Unified Node.js / Express Server Architecture**: The CRM runs an Express 5 application on port `3000` with `mysql2/promise` connection pooling. It seamlessly combines:
   - Dedicated REST APIs (`/api/leads`, `/api/content/:slug`, etc.)
   - Authenticated Admin CMS & Leads Dashboard (Server-rendered EJS templates styled with Tailwind CSS and custom tokens)
   - Dynamic Astro SSR handler loaded via `import('../tiffany-webb-astro/dist/server/entry.mjs')`
2. **Current Database Architecture**: MySQL 8+ database `tiffany_crm` with established relational tables for users, leads, messages, bookings, activity logs, and a dynamic CMS Key-Value / Collection engine (`website_pages`, `website_content`, `website_collections`).
3. **Database-Driven Content Coverage**: To support all 7 inner pages, the database schema and seed data must be extended to hold:
   - **4 Capabilities** with deep-link anchors (`#strategic-advisor`, `#program-architect`, `#community-impact-strategist`, `#speaker-facilitator`)
   - **20 Speaking Topics** color-coded across 4 tracks with interactive filter tags and URL query pre-fills
   - **Structured Section Content & Configuration Arrays** (Story Vignettes, Credentials, Values, Engagement Formats, The GEAR Method™, Media Press Kits, Bios, Intro Scripts, Process Steps, FAQs, Testimonials, Impact Metrics, Outcome Stories, and Articles)
   - **Initial State Discipline**: All items defined as shipping empty (Affiliations, FAQs, Engagements, Testimonials, Metrics) are cleanly initialized in the database and hidden on the frontend until populated via the CRM.
   - **Pending Content Indicators**: All items specified as `[CONTENT-PENDING]` (Story paragraphs, Session lengths, Takeaways, Bios, Intro Script) are explicitly tagged in the database.

---

## 2. CRM Codebase Survey

### 2.1 File & Directory Map
```
Landing Page Work/tiffany-webb-crm/
├── .env                              # Environment configuration (DB, Port, Email, JWT)
├── .env.example                      # Template configuration
├── package.json                      # Dependencies and project metadata
├── server.js                         # Master Express application entry point (API + CMS + SSR)
├── setup-db.js                       # Database creation and core table initialization script
├── db/
│   └── schema.sql                    # Base MySQL schema DDL
├── views/                            # EJS Server-Side Rendering Templates
│   ├── dashboard.ejs                 # Kanban & Leads Pipeline Management UI
│   ├── lead.ejs                      # Single Lead detail, status management, & message log
│   ├── new-lead.ejs                  # Manual Lead creation & CSV batch ingestion
│   ├── users.ejs                     # Staff & Admin user management UI
│   ├── cms.ejs                       # Global CMS dashboard & page status toggles
│   ├── cms-page.ejs                  # Deep page content editor (KV sections & collections)
│   ├── cms-collection-edit.ejs       # Add / Edit collection item modal & form
│   ├── login.ejs                     # Admin authentication login view
│   ├── forgot-password.ejs           # Password reset request & OTP generation
│   └── reset-password.ejs            # OTP verification and password update view
```

### 2.2 Technology Stack & Dependencies (`package.json`)
- **Runtime**: Node.js (CommonJS module system)
- **Web Framework**: `express` (^5.2.1)
- **Database Driver**: `mysql2` (^3.23.4) with Promise API (`mysql2/promise`)
- **Template Engine**: `ejs` (^6.0.1)
- **Authentication & Security**: `bcrypt` (^6.0.0), `jsonwebtoken` (^9.0.3)
- **File Uploads**: `multer` (^2.2.0) saving directly to Astro's `public/uploads/`
- **Email Service**: `nodemailer` (^9.0.5) using Gmail SMTP with OTP support
- **CORS Support**: `cors` (^2.8.6)
- **Environment Management**: `dotenv` (^17.4.2)
- **Development Tooling**: `nodemon` (^3.1.14)

### 2.3 Server Architecture & Middleware Flow (`server.js`)
1. **Body Parsing**: `express.json()` and `express.urlencoded({ extended: true })`
2. **CORS Configuration**: Configured with `origin: process.env.FRONTEND_URL || 'http://localhost:4321'`
3. **Static File Serving**: Serves `../tiffany-webb-astro/dist/client` for frontend assets and `public/uploads` for CMS uploaded media.
4. **Route Isolation**: 
   - Express router handles `/api/*`, `/cms/*`, `/dashboard`, `/leads/*`, `/lead/*`, `/users`, `/login`, `/forgot-password`, `/reset-password`.
   - All other routes pass through to the dynamically imported Astro SSR middleware:
     ```javascript
     import('file://' + path.join(__dirname, '../tiffany-webb-astro/dist/server/entry.mjs'))
       .then(({ handler: astroHandler }) => {
         app.use(async (req, res, next) => {
           if (req.path.startsWith('/api') || req.path.startsWith('/cms') || 
               req.path.startsWith('/dashboard') || req.path.startsWith('/login') || 
               req.path.startsWith('/users') || req.path.startsWith('/lead')) {
               return next();
           }
           astroHandler(req, res, next);
         });
       });
     ```

---

## 3. Database Architecture & Setup

### 3.1 Database Connection Configuration
- **Engine**: MySQL 8.x
- **Host**: `127.0.0.1` / `localhost`
- **Database Name**: `tiffany_crm`
- **Connection Pool**: 
  - `waitForConnections: true`
  - `connectionLimit: 10`
  - `queueLimit: 0`

### 3.2 Existing Database Tables Schema

#### 1. `users` (Admin and Assistant Staff)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Unique user ID |
| `name` | VARCHAR(120) | NOT NULL | User full name |
| `email` | VARCHAR(190) | NOT NULL, UNIQUE | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `role` | ENUM('admin', 'assistant') | NOT NULL, DEFAULT 'assistant' | Role permissions |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Account active flag |
| `reset_token` | VARCHAR(10) | NULL | 6-digit OTP for password resets |
| `reset_token_expires` | DATETIME | NULL | OTP expiration timestamp |
| `last_login_at` | DATETIME | NULL | Timestamp of last login |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Created timestamp |

#### 2. `leads` (Client Inquiries & Booking Pipeline)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Unique lead ID |
| `source` | ENUM('website_form', 'whatsapp', 'instagram', 'email', 'referral', 'manual', 'csv_upload') | NOT NULL | Origin of lead |
| `status` | ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'booked', 'completed', 'declined', 'lost') | NOT NULL, DEFAULT 'new' | Pipeline status |
| `contact_name` | VARCHAR(150) | NULL | Full name of inquirer |
| `organization_name` | VARCHAR(200) | NULL | Inquiring company/organization |
| `email` | VARCHAR(190) | NULL | Email address |
| `country_code` | VARCHAR(10) | NULL | Dial code (e.g., `+1`) |
| `phone` | VARCHAR(40) | NULL | Phone number |
| `event_type` | VARCHAR(100) | NULL | Keynote, Workshop, Advisory, etc. |
| `event_date` | DATE | NULL | Date of proposed event |
| `event_location` | VARCHAR(200) | NULL | City, venue, or "Virtual" |
| `estimated_audience_size` | VARCHAR(100) | NULL | Audience size bracket |
| `message` | TEXT | NULL | Goals, topic interest, notes |
| `assigned_to` | INT | NULL, FK(`users.id`) | Assigned staff member |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Creation date |
| `updated_at` | DATETIME | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last update date |
| `last_contact_at` | DATETIME | NULL | Last outreach timestamp |

#### 3. `messages` (Threaded Communication)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Message ID |
| `lead_id` | INT | NOT NULL, FK(`leads.id`) ON DELETE CASCADE | Associated lead |
| `channel` | ENUM('whatsapp', 'email', 'note', 'sms') | NOT NULL | Communication channel |
| `direction` | ENUM('inbound', 'outbound') | NOT NULL | Inbound or outbound message |
| `body` | TEXT | NOT NULL | Message text |
| `sent_by` | INT | NULL, FK(`users.id`) | User author if outbound |
| `is_sensitive` | BOOLEAN | NOT NULL, DEFAULT FALSE | Privacy flag |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp |

#### 4. `bookings` (Confirmed Engagements)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Booking ID |
| `lead_id` | INT | NOT NULL, UNIQUE, FK(`leads.id`) ON DELETE CASCADE | Associated lead |
| `event_name` | VARCHAR(200) | NULL | Confirmed event name |
| `event_format` | VARCHAR(100) | NULL | Delivery format |
| `confirmed_date` | DATE | NULL | Confirmed date |
| `fee_amount` | DECIMAL(10,2) | NULL | Agreed fee |
| `deposit_status` | ENUM('not_required', 'pending', 'received') | DEFAULT 'not_required' | Deposit tracking |
| `contract_status` | ENUM('not_sent', 'sent', 'signed') | DEFAULT 'not_sent' | Contract status |
| `outcome_notes` | TEXT | NULL | Post-event notes |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp |

#### 5. `activity_log` (Audit Trail)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Log ID |
| `lead_id` | INT | NOT NULL, FK(`leads.id`) ON DELETE CASCADE | Associated lead |
| `user_id` | INT | NULL, FK(`users.id`) | Acting user |
| `action` | VARCHAR(100) | NOT NULL | Action key |
| `detail` | VARCHAR(255) | NULL | Description |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Timestamp |

#### 6. `website_pages` (Managed Website Pages)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Page ID |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | URL identifier (e.g. `about`, `services`, `speaking-topics`) |
| `name` | VARCHAR(150) | NOT NULL | Human-readable page title |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 | Live toggle switch |

#### 7. `website_content` (Key-Value Section Texts & Toggles)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Content entry ID |
| `page_id` | INT | NOT NULL, FK(`website_pages.id`) ON DELETE CASCADE | Associated page |
| `section` | VARCHAR(100) | NOT NULL | Section name (e.g., `hero`, `story`, `gear_method`) |
| `key_name` | VARCHAR(100) | NOT NULL | Field key (e.g., `headline`, `section_is_active`) |
| `content_value` | LONGTEXT | NULL | String, markdown, or HTML content |
| `content_type` | ENUM('text', 'textarea', 'html', 'image', 'number', 'boolean', 'json') | NOT NULL, DEFAULT 'text' | Form input rendering hint |

#### 8. `website_collections` (Dynamic Card Lists, FAQs, Grid Items)
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | INT | AUTO_INCREMENT, PRIMARY KEY | Item ID |
| `page_id` | INT | NOT NULL, FK(`website_pages.id`) ON DELETE CASCADE | Associated page |
| `section_name` | VARCHAR(100) | NOT NULL | Section identifier |
| `title` | VARCHAR(255) | NULL | Item title / headline / question |
| `subtitle` | VARCHAR(255) | NULL | Subtitle / track / tag / metadata |
| `content_html` | LONGTEXT | NULL | Long description, body text, bullet points |
| `image_url` | VARCHAR(255) | NULL | Featured image or uploaded asset |
| `icon_svg` | TEXT | NULL | Semantic SVG code for cards |
| `sort_order` | INT | NOT NULL, DEFAULT 0 | Ordering index |

---

## 4. Comprehensive 7-Page Content Specification & Database Model

Every inner page requires a dedicated entry in `website_pages` and a structured set of `website_content` key-value pairs and `website_collections` records.

### 4.1 Page 1: `/about`
- **Database Slug**: `about`
- **Name**: `About Tiffany`
- **Sections & Fields**:
  1. **Page Hero (`hero`)**:
     - `eyebrow` (text): `"About Tiffany Webb"`
     - `headline` (text): `"Chicago Heart & Louisiana Soul"`
     - `subtitle` (text): `"Community Impact Strategist · Public Health Educator"`
     - `hero_image` (image): `"/images/tiffany_about_new.jpg"`
     - `section_is_active` (boolean toggle): `"1"`
  2. **The Story (`story_vignettes`)**:
     - `eyebrow` (text): `"The Journey"`
     - `headline` (text): `"Where Frontline Reality Meets Strategic Impact"`
     - Collection items (`story_vignettes`): 5–7 vignette paragraphs marked `[CONTENT-PENDING]` as specified.
  3. **Credentials & Expertise (`credentials`)**:
     - `eyebrow` (text): `"Background & Authority"`
     - `headline` (text): `"Expertise that moves people."`
     - `degrees` (text): `"BBA, MHP"`
     - `intro_text` (text): `"Blending business acumen with public health mastery."`
     - Collection items (`credentials_areas`): 4 core areas (Behavioral Health, Systems Design, Community Outreach, Public Health Education).
  4. **How She Works (`how_she_works`)**:
     - `eyebrow` (text): `"Methodology"`
     - `headline` (text): `"Built for real rooms, not lecture halls."`
     - `body_text` (textarea): `"Tiffany utilizes a signature framework designed to move organizations from passive listening to active prevention."`
     - `button_text` (text): `"Explore the GEAR Method™"`
     - `button_url` (text): `"/services#gear"`
  5. **The Specialism (`specialism`)** — *Anchor: `id="specialism"`*:
     - `eyebrow` (text): `"The Specialism"`
     - `headline` (text): `"Where this work began."`
     - `body_text` (textarea): `"Over fifteen years specializing in gambling harm prevention and community behavioral health."`
     - `quote` (text): `"Gambling harm is the invisible crisis in our communities."`
  6. **Values (`values`)**:
     - `eyebrow` (text): `"Guiding Principles"`
     - `headline` (text): `"What guides every engagement."`
     - `pull_quote` (text): `"When we rise, we rise together."`
     - Collection items (`values_list`): 5 values (Integrity, Community-First, Frontline Truth, Strategic Clarity, Sustainable Impact).
  7. **Professional Affiliations (`affiliations`)**:
     - `eyebrow` (text): `"Affiliations"`
     - `headline` (text): `"Professional Affiliations & Memberships"`
     - Collection items (`affiliations_list`): **Ships EMPTY** (Frontend hides section when collection count is 0).
  8. **GambleFreeGear (`gamble_free_gear`)**:
     - `eyebrow` (text): `"Initiatives"`
     - `headline` (text): `"GambleFreeGear™"`
     - `body_text` (textarea): `"An awareness merchandise initiative empowering communities to spark vital conversations."`
     - `link_text` (text): `"Learn More &rarr;"`
     - `link_url` (text): `"https://gamblefreegear.com"`
  9. **CTA (`cta`)**:
     - `headline` (text): `"Ready to create impact together?"`
     - `subtitle` (text): `"Let's discuss how we can partner for your next event or initiative."`
     - `button_text` (text): `"Work With Tiffany"`
     - `button_url` (text): `"/work-with-tiffany"`

---

### 4.2 Page 2: `/services` (Redirect `/speaking` here)
- **Database Slug**: `services`
- **Name**: `Services & Strategy`
- **Sections & Fields**:
  1. **Page Hero (`hero`)**:
     - `eyebrow` (text): `"Capabilities & Services"`
     - `headline` (text): `"Strategy with people at the center."`
     - `subtitle` (text): `"Four signature capabilities designed to turn complex public health challenges into actionable community outcomes."`
  2. **Four Capabilities (`capabilities`)** — *Alternating Blocks with Deep Links*:
     - Collection items (`capabilities`):
       1. ID: `strategic-advisor` — Strategic Advisory & Organizational Consulting
       2. ID: `program-architect` — Program Architecture & Curriculum Design
       3. ID: `community-impact-strategist` — Community Impact Strategy & Coalition Building
       4. ID: `speaker-facilitator` — Keynote Speaking & Executive Facilitation
  3. **The GEAR Method™ (`gear_method`)** — *Anchor: `id="gear"`*:
     - `eyebrow` (text): `"Signature Framework"`
     - `headline` (text): `"The GEAR Method™"`
     - `subtitle` (text): `"Ground. Examine. Architect. Reinforce."`
     - Collection items (`gear_steps`): 4 expanded steps (G, E, A, R).
  4. **Speaking & Facilitation (`speaking_signpost`)**:
     - `eyebrow` (text): `"Keynotes & Workshops"`
     - `headline` (text): `"Conversations that create change."`
     - `body_text` (textarea): `"Explore 20 signature speaking topics spanning prevention, clinical treatment, family impact, and campaign design."`
     - `link_text` (text): `"Explore All 20 Speaking Topics"`
     - `link_url` (text): `"/services/speaking-topics"`
  5. **Engagement Formats (`engagement_formats`)**:
     - `eyebrow` (text): `"Delivery Formats"`
     - `headline` (text): `"Ways we can work together."`
     - `long_tail_text` (text): `"Custom formats, multi-day intensives, and hybrid delivery available upon request."`
     - Collection items (`engagement_formats`): 6 cards (Keynote Addresses, Interactive Workshops, Executive Advisory, Coalition Facilitation, Panel Moderation, School & Youth Programs).
  6. **What Working Together Looks Like (`working_process`)**:
     - `eyebrow` (text): `"The Process"`
     - `headline` (text): `"What working together looks like."`
     - Collection items (`working_steps`): 4 steps (01 Discovery & Alignment, 02 Strategy & Customization, 03 Delivery & Facilitation, 04 Measurement & Debrief).
  7. **FAQ (`faqs`)**:
     - `eyebrow` (text): `"Frequently Asked Questions"`
     - `headline` (text): `"Everything you need to know."`
     - Collection items (`services_faqs`): **Ships EMPTY** (Frontend hides when empty).
  8. **CTA (`cta`)**:
     - `headline` (text): `"Let's design your next strategic initiative."`
     - `button_text` (text): `"Work With Tiffany"`
     - `button_url` (text): `"/work-with-tiffany"`

---

### 4.3 Page 3: `/services/speaking-topics`
- **Database Slug**: `speaking-topics`
- **Name**: `Speaking Topics`
- **Sections & Fields**:
  1. **Page Hero (`hero`)**:
     - `eyebrow` (text): `"Signature Keynotes & Topics"`
     - `headline` (text): `"Conversations that create change."`
     - `subtitle` (text): `"Twenty topics across four specialized tracks. Built for specific audiences and actionable outcomes."`
  2. **Filter Configuration**: Client-side filtering by:
     - **Track**: `All`, `Prevention & Awareness`, `Treatment & Recovery`, `Family Impact`, `Creative Engagement`
     - **Audience**: `All Audiences`, `General & Community`, `Clinicians & Healthcare`, `Schools & Youth`, `Leadership & Policy`
  3. **Exactly 20 Speaking Topics (`topics_list`)**:
     - Collection items (`topics_list`): 20 cards distributed across 4 tracks:
       - **Track 1: Prevention & Awareness (5 Topics)**:
         1. *Gambling Harm 101: The Hidden Public Health Crisis*
         2. *Don't Bet On Your Future: Youth & Campus Prevention*
         3. *Engaging Elected Officials: Turning Awareness into Policy*
         4. *Digital Gaming vs. Gambling: Where the Lines Blur*
         5. *Building Community-Level Prevention Coalitions*
       - **Track 2: Treatment & Recovery (5 Topics)**:
         6. *Co-Occurring Disorders: Gambling & Substance Use Intersection*
         7. *Harm Reduction Strategies in Behavioral Health*
         8. *Motivational Interviewing in Frontline Gambling Conversations*
         9. *Clinical Screening Protocols for Healthcare Providers*
         10. *Sustaining Long-Term Recovery in Gambling Addiction*
       - **Track 3: Family Impact (5 Topics)**:
         11. *The Forgotten Victims: Financial & Emotional Impact on Partners*
         12. *Gambling Harm, Interpersonal Violence & Trauma Overlap*
         13. *Practical Coping & Boundary Strategies for Families*
         14. *Children in the Crossfire: Generational Cycles of Harm*
         15. *Navigating Financial Restoration After Crisis*
       - **Track 4: Creative Engagement (5 Topics)**:
         16. *Youth Art Competitions as Prevention Mobilization Tools*
         17. *Responsible Gifting: Youth Lottery Prevention for Parents*
         18. *Integrating Prevention into Recovery-Oriented Systems of Care (ROSC)*
         19. *Cultural Fluency in Public Health Messaging*
         20. *Grassroots Storytelling that Drives Measurable Action*
     - *All card details include session lengths and key takeaways tagged `[CONTENT-PENDING]`.*
     - *Each card link pre-fills `/work-with-tiffany?topic={encoded_title}`.*
  4. **CTA (`cta`)**:
     - `headline` (text): `"Interested in booking a specific topic?"`
     - `button_text` (text): `"Check Availability"`
     - `button_url` (text): `"/work-with-tiffany"`

---

### 4.4 Page 4: `/impact`
- **Database Slug**: `impact`
- **Name**: `Impact & Engagements`
- **Sections & Fields**:
  1. **Page Hero (`hero`)**:
     - `eyebrow` (text): `"Community Track Record"`
     - `headline` (text): `"Where the work has taken me."`
     - `subtitle` (text): `"Fifteen years on the frontlines of public health, education, and community advocacy."`
  2. **Aggregate Metrics Band (`impact_metrics`)**:
     - Collection items (`impact_metrics`): **Ships EMPTY** (Dynamic grid rendered only when metrics exist).
  3. **Upcoming Engagements (`upcoming_engagements`)**:
     - `empty_notice` (text): `"Next dates announced soon"`
     - Collection items (`upcoming_engagements`): **Ships EMPTY**.
  4. **Past Engagements Archive (`past_engagements`)**:
     - `empty_notice` (text): `"Archive updating soon"`
     - Collection items (`past_engagements`): **Ships EMPTY** (Configured for filtering by year/format/audience when populated).
  5. **Outcome Stories (`outcome_stories`)**:
     - `empty_notice` (text): `"Case studies updating soon"`
     - Collection items (`outcome_stories`): **3 Slots, Ships EMPTY**.
  6. **Gambling Prevention Practice (`prevention_practice`)**:
     - `eyebrow` (text): `"Frontline Specialism"`
     - `headline` (text): `"A dedicated focus on harm reduction."`
     - `body_text` (textarea): `"Tiffany's work focuses on grassroots public health education, community coalition building, and clinical training across Illinois and nationwide."` (Strictly avoids naming any confidential employer).
     - `button_text` (text): `"Learn About Her Specialism"`
     - `button_url` (text): `"/about#specialism"`
  7. **Testimonials (`testimonials`)**:
     - `empty_notice` (text): `"Testimonials coming soon"`
     - Collection items (`testimonials`): **Ships EMPTY**.
  8. **CTA (`cta`)**:
     - `headline` (text): `"Bring proven impact to your community."`
     - `button_text` (text): `"Partner With Tiffany"`
     - `button_url` (text): `"/work-with-tiffany"`

---

### 4.5 Page 5: `/media`
- **Database Slug**: `media`
- **Name**: `Media & Press Kit`
- **Sections & Fields**:
  1. **Page Hero (`hero`)**:
     - `eyebrow` (text): `"Press & Media Resources"`
     - `headline` (text): `"Ready for the room — and the story."`
     - `subtitle` (text): `"Official press kits, approved biographies, stage introduction scripts, and commentary topics for journalists, event organizers, and media producers."`
  2. **Official Press Downloads (`press_downloads`)**:
     - Collection items (`media_downloads`):
       1. *Speaker One-Sheet (PDF)*
       2. *Media Kit & High-Res Headshots (ZIP)*
       3. *Organizational Capabilities Deck (PDF)*
     - *Frontend verifies file availability before rendering active download links.*
  3. **Approved Biographies (`media_bios`)** — *Written in THIRD PERSON*:
     - Collection items (`media_bios`):
       1. *Short Bio (50 words)*: `"[CONTENT-PENDING]"`
       2. *Medium Bio (150 words)*: `"[CONTENT-PENDING]"`
       3. *Long Bio (300 words)*: `"[CONTENT-PENDING]"`
  4. **Stage Introduction Script (`intro_script`)** — *Written in THIRD PERSON*:
     - `eyebrow` (text): `"Stage Introduction"`
     - `headline` (text): `"Official Stage Emcee Script"`
     - `read_time` (text): `"~60 Seconds"`
     - `script_text` (textarea): `"[CONTENT-PENDING - Official 60-second stage introduction script for event hosts and emcees]"`
  5. **Topics for Commentary & Interviews (`media_speaking_topics`)**:
     - `eyebrow` (text): `"Expertise"`
     - `headline` (text): `"What she can speak to."`
     - Collection items (`media_speaking_topics`): 5 commentary areas (Sports Betting Proliferation, Public Health Equity, Youth Gambling Interventions, Family Trauma & Recovery, Behavioral Health Systems).
  6. **Media Inquiries CTA (`cta`)**:
     - `headline` (text): `"Need expert commentary or an interview?"`
     - `button_text` (text): `"Submit Media Inquiry"`
     - `button_url` (text): `"/work-with-tiffany?type=Media"`

---

### 4.6 Page 6: `/work-with-tiffany` (Redirect `/book` here)
- **Database Slug**: `work-with-tiffany`
- **Name**: `Work With Tiffany`
- **Sections & Fields**:
  1. **Page Hero (`hero`)**:
     - `eyebrow` (text): `"Inquiries & Bookings"`
     - `headline` (text): `"Let's create impact together."`
     - `subtitle` (text): `"Whether you are organizing a national conference, designing a community prevention campaign, or seeking executive advisory."`
  2. **The 9-Field Booking Form (`booking_form`)**:
     - Ingestion Target: `POST /api/leads` (or `https://app.tiffanywebbimpact.com/api/leads`)
     - Form Fields:
       1. `contact_name` (Full Name) *[Required]*
       2. `organization_name` (Organization) *[Required]*
       3. `email` (Email Address) *[Required, validated format]*
       4. `country_code` + `phone` (Phone Number with interactive country selector) *[Required, 7-15 digits]*
       5. `event_type` (Keynote, Workshop, Advisory, Media, Other) *[Required]*
       6. `event_date` (Date of Event) *[Required, YYYY-MM-DD]*
       7. `event_location` (Venue, City, or Virtual) *[Required]*
       8. `estimated_audience_size` (Under 50, 50-150, 150-500, 500+) *[Required]*
       9. `message` (Goals, details, pre-filled topic interest) *[Optional/Contextual]*
  3. **What Happens Next (`what_happens_next`)**:
     - `eyebrow` (text): `"Next Steps"`
     - `headline` (text): `"What happens next."`
     - Collection items (`process_steps`): 4 steps (1. Inquiry Review within 24–48 hours, 2. Discovery & Alignment Call, 3. Custom Proposal & Agreement, 4. Pre-Event Briefing & Execution).
  4. **Booking FAQs (`faqs`)**:
     - `eyebrow` (text): `"Questions & Answers"`
     - `headline` (text): `"Booking FAQs"`
     - Collection items (`booking_faqs`): **Ships EMPTY**.
  5. **Alternative Contact & Operations (`direct_contact`)**:
     - `direct_email` (text): `"inquiries@tiffanywebbimpact.com"`
     - `location_note` (text): `"Based in Chicago, IL · Available for national & international travel"`
     - `response_time` (text): `"Average response time: 24–48 business hours"`

---

### 4.7 Page 7: `/insights`
- **Database Slug**: `insights`
- **Name**: `Insights & Articles`
- **Sections & Fields**:
  1. **Page Hero (`hero`)**:
     - `eyebrow` (text): `"Articles & Perspectives"`
     - `headline` (text): `"Thinking out loud."`
     - `subtitle` (text): `"Perspectives on public health education, gambling prevention, and community impact."`
  2. **Articles Collection (`articles`)**:
     - Collection items (`articles`):
       - `title`: Article Headline
       - `subtitle`: Category & Date (e.g. `Prevention | August 2026`)
       - `content_html`: Excerpt and article body
       - `image_url`: Thumbnail image
       - `sort_order`: Display sequence
  3. **Nav Visibility Rule**: Nav item `/insights` remains hidden in the main website navigation bar until at least 6 published articles exist in the database.
  4. **Article Reading Template Requirements**: `max-width: 68ch`, serif body text (`Instrument Serif` / `Fraunces`), large line height (`1.7–1.8`), high editorial contrast.

---

## 5. Database Schema Extensions & Migration Strategy

### 5.1 Extended Collection Schema
To ensure seamless editing of specialized fields (such as deep link IDs, file URLs, and custom tags) without breaking backwards compatibility, we enhance `website_collections` and `website_content` as follows:

```sql
-- Ensure UTF-8 MB4 encoding for emoji and rich quotes
ALTER DATABASE tiffany_crm CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Ensure is_active flag exists on website_pages
ALTER TABLE website_pages ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1;

-- Add optional custom metadata support to website_collections
ALTER TABLE website_collections 
  ADD COLUMN IF NOT EXISTS item_slug VARCHAR(100) NULL AFTER section_name,
  ADD COLUMN IF NOT EXISTS link_url VARCHAR(255) NULL AFTER image_url,
  ADD COLUMN IF NOT EXISTS badge VARCHAR(100) NULL AFTER subtitle,
  ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER sort_order;
```

### 5.2 Complete Database Hydration Script (`seed_inner_pages.sql`)
A complete hydration script sets up all 7 inner pages in `website_pages`, populates every section in `website_content`, and populates the 20 speaking topics, 4 capabilities, 6 engagement formats, GEAR method steps, process steps, and media bios in `website_collections`.

---

## 6. REST API Design & Integration Specifications

### 6.1 Public REST API Endpoints (For Astro Frontend)

#### 1. `GET /api/content/:slug`
Fetches all key-value content and grouped collections for a specific page slug.
- **Parameters**: `:slug` (e.g., `about`, `services`, `speaking-topics`, `impact`, `media`, `work-with-tiffany`, `insights`)
- **Response Format**:
```json
{
  "success": true,
  "page": {
    "id": 2,
    "slug": "about",
    "name": "About Tiffany",
    "is_active": 1
  },
  "content": {
    "hero": {
      "eyebrow": "About Tiffany Webb",
      "headline": "Chicago Heart & Louisiana Soul",
      "subtitle": "Community Impact Strategist · Public Health Educator",
      "hero_image": "/images/tiffany_about_new.jpg",
      "section_is_active": "1"
    },
    "credentials": {
      "headline": "Expertise that moves people.",
      "degrees": "BBA, MHP"
    },
    "specialism": {
      "headline": "Where this work began.",
      "body_text": "Over fifteen years specializing in gambling harm prevention..."
    }
  },
  "collections": {
    "story_vignettes": [
      {
        "id": 101,
        "title": "The Foundation",
        "subtitle": "Chicago Roots",
        "content_html": "[CONTENT-PENDING]",
        "sort_order": 1
      }
    ],
    "values_list": [
      {
        "id": 105,
        "title": "Integrity",
        "subtitle": "Frontline Honesty",
        "content_html": "Speaking truth about community realities.",
        "sort_order": 1
      }
    ],
    "affiliations_list": []
  }
}
```

#### 2. `GET /api/speaking-topics`
Returns the complete list of 20 speaking topics structured for interactive client-side filtering.
- **Response Format**:
```json
{
  "success": true,
  "count": 20,
  "tracks": [
    "Prevention & Awareness",
    "Treatment & Recovery",
    "Family Impact",
    "Creative Engagement"
  ],
  "topics": [
    {
      "id": 1,
      "track": "Prevention & Awareness",
      "track_slug": "prevention-awareness",
      "title": "Gambling Harm 101: The Hidden Public Health Crisis",
      "audience": "General & Community",
      "session_length": "[CONTENT-PENDING]",
      "takeaways": "[CONTENT-PENDING]",
      "description": "An accessible, high-impact overview of how gambling harm manifests in communities.",
      "booking_url": "/work-with-tiffany?topic=Gambling+Harm+101"
    }
  ]
}
```

#### 3. `GET /api/capabilities`
Returns the 4 core capabilities with deep-link anchors.
- **Response Format**:
```json
{
  "success": true,
  "capabilities": [
    {
      "slug": "strategic-advisor",
      "title": "Strategic Advisory",
      "subtitle": "Organizational & Systems Consulting",
      "description": "Helping organizations assess harm risks, refine policies, and design community-first solutions.",
      "sort_order": 1
    },
    {
      "slug": "program-architect",
      "title": "Program Architecture",
      "subtitle": "Curriculum & Campaign Design",
      "description": "Designing culturally fluent prevention curricula and educational programs.",
      "sort_order": 2
    },
    {
      "slug": "community-impact-strategist",
      "title": "Community Impact Strategy",
      "subtitle": "Coalition Building & Outreach",
      "description": "Building sustainable coalitions between public health departments, clinics, and grassroots advocates.",
      "sort_order": 3
    },
    {
      "slug": "speaker-facilitator",
      "title": "Speaking & Facilitation",
      "subtitle": "Keynotes & Executive Workshops",
      "description": "Compelling keynotes and interactive workshops tailored to professional and community audiences.",
      "sort_order": 4
    }
  ]
}
```

#### 4. `GET /api/articles`
Returns published insights with full metadata.
- **Response Format**:
```json
{
  "success": true,
  "total": 3,
  "articles": [
    {
      "id": 1,
      "title": "The Hidden Cost of Sports Betting on College Campuses",
      "category": "Prevention",
      "published_date": "August 12, 2026",
      "read_time": "5 min read",
      "image_url": "/assets/thumb_3.jpg",
      "excerpt": "How mobile sportsbook apps are transforming college campus culture and what student affairs must do."
    }
  ]
}
```

#### 5. `POST /api/leads`
Ingests booking inquiries from `/work-with-tiffany`.
- **Request Body**:
```json
{
  "contact_name": "Marcus Vance",
  "organization_name": "Midwest Public Health Alliance",
  "email": "marcus.vance@mpha.org",
  "country_code": "+1",
  "phone": "3125550198",
  "event_type": "Conference Keynote",
  "event_date": "2026-11-15",
  "event_location": "Chicago, IL",
  "estimated_audience_size": "150–500",
  "message": "Inquiring about Tiffany speaking on 'Gambling Harm 101' for our annual winter summit.",
  "source": "website_form"
}
```
- **Validation Rules**:
  - `contact_name`, `email`, `phone`, `event_type`, `event_date`, `event_location` are required.
  - Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Phone sanitization & validation: 7–15 digits.
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "lead_id": 42,
  "message": "Thank you. Your inquiry has been received and Tiffany will review it personally."
}
```

---

## 7. Admin CRM Dashboard Architecture & UI Plan

### 7.1 Routes & Views Breakdown
| URL Path | HTTP Method | EJS View Template | Description |
|---|---|---|---|
| `/dashboard` | GET | `views/dashboard.ejs` | High-level KPI cards, funnel metrics, interactive lead cards with AJAX status update & search |
| `/leads/new` | GET / POST | `views/new-lead.ejs` | Manual lead intake and CSV batch upload interface |
| `/lead/:id` | GET | `views/lead.ejs` | Single lead detail view, status switcher, notes log, and message timeline |
| `/lead/:id/edit` | POST | `views/lead.ejs` | Edit lead contact and event details |
| `/lead/:id/delete` | POST | N/A | Delete lead with associated activity log entries |
| `/api/leads/bulk-delete` | POST | N/A | Bulk delete leads by status tab |
| `/users` | GET / POST | `views/users.ejs` | Admin and staff user management with role controls |
| `/cms` | GET | `views/cms.ejs` | List of all 7+ website pages with live status toggle buttons and content edit links |
| `/cms/:slug` | GET | `views/cms-page.ejs` | Page-level content editor with sidebar navigation tabs for all page sections |
| `/cms/:slug` | POST | `views/cms-page.ejs` | Saves updated key-value fields and uploads new image assets |
| `/cms/:slug/collection/:section/new` | GET / POST | `views/cms-collection-edit.ejs` | Add new card, FAQ, speaking topic, capability, or testimonial to a collection |
| `/cms/:slug/collection/:section/:id/edit` | GET / POST | `views/cms-collection-edit.ejs` | Edit existing collection item |
| `/cms/collection/:id/delete` | GET | N/A | Delete collection item |
| `/api/pages/:id/toggle` | POST | N/A | Toggle page live/inactive status via AJAX |

### 7.2 CMS Dashboard Editor Workflow (`cms-page.ejs`)
1. **Dynamic Section Tabs**: The left sidebar automatically lists all sections for the active page (both Key-Value groups and Dynamic Collections).
2. **Key-Value Form Controls**:
   - Short text fields (`input[type="text"]`) for eyebrows, headlines, degree suffixes.
   - Long text fields (`textarea`) for multi-line paragraphs and descriptions.
   - HTML fields (`textarea` with monospace font) for formatted copy.
   - Image upload controls (`input[type="file"]`) with instant preview and file upload processing via Multer.
   - Section visibility toggle (`input[type="checkbox"]` bound to `section_is_active`).
3. **Collection Management Table**:
   - Renders a clean table of all cards/items in the section with sort order.
   - "Add New Item" button opens `cms-collection-edit.ejs`.
   - "Edit" and "Del" buttons provide full granular control over all 20 speaking topics, 4 capabilities, 6 engagement formats, bios, FAQs, and testimonials.

---

## 8. Operational & Environment Configuration

### 8.1 Environment Variables (`.env`)
```ini
PORT=3000
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=@rishil8124shah
DB_NAME=tiffany_crm
JWT_SECRET=super_secret_jwt_key_change_me_in_prod
FRONTEND_URL=http://localhost:4321
SESSION_SECRET=super_secret_session_key
EMAIL_HOST_USER=prishvafintech@gmail.com
EMAIL_HOST_PASSWORD=zicmwiowmavztoqu
```

### 8.2 Recommended Package Scripts (`package.json`)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "setup-db": "node setup-db.js",
    "seed-inner-pages": "node seed-inner-pages.cjs"
  }
}
```

---

## 9. Conclusion & Actionable Next Steps

The Tiffany Webb CRM backend and database are architecturally primed to power all 7 Astro inner pages dynamically. By executing the proposed database hydration and exposing the REST API endpoints, the frontend team can seamlessly consume 100% database-driven content, while the admin user gains total editing autonomy across every single text string, card, speaking topic, and configuration array defined in the spec.
