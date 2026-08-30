# Tiffany Webb Inner Pages — Exhaustive Specification & Data Dictionary
**Document Version:** 1.0.0 (Production Mining)  
**Author:** Teamwork Preview Specification Miner (`spec_miner_survey`)  
**Target Applications:**
- Public Website: `Landing Page Work/tiffany-webb-astro` (Astro 5 SSG / SSR)
- CRM & Content Management System: `Landing Page Work/tiffany-webb-crm` (Express 5 + MySQL)

---

## 1. Executive Summary & Architecture Scope

This document provides the authoritative, field-by-field specification for all 7 inner pages of the Tiffany Webb brand website. Every section, title, subtitle, paragraph, repeater list, and form field is specified alongside its MySQL schema representation, client-side behaviors (filtering, prefill, URL routing, inline validation), initial seed copy, and empty-state handling rules.

### Inner Page Inventory
1. **`/about`** — 9 Sections (Hero, The Story [5–7 vignettes], Credentials & Expertise, How She Works Signpost, The Specialism [id="specialism"], Values [5 items + pull quote], Professional Affiliations [ships empty], GambleFreeGear, CTA)
2. **`/services`** — 8 Sections (Redirect `/speaking` here; Page Hero, Four Capabilities with deep-link IDs, The GEAR Method™ [id="gear"], Speaking & Facilitation, Engagement Formats [6 cards + long-tail line], What Working Together Looks Like [4 steps], FAQ [ships empty], CTA)
3. **`/services/speaking-topics`** — 4 Sections (Hero, Client-side Filter Bar, Topic Grid with exactly 20 cards across 4 tracks color-coded with query-prefill to booking, CTA)
4. **`/impact`** — 8 Sections (Hero, Aggregate Band [ships empty], Upcoming Engagements [ships empty], Past Engagements [ships empty, filterable], Outcome Stories [3 slots, ships empty], Gambling Prevention Work [link -> /about#specialism], Testimonials [ships empty], CTA)
5. **`/media`** — 6 Sections (Hero, Downloads Asset Cards, Bios in 3 lengths [third-person], Introduction Script [third-person], What She Can Speak To, Media Inquiries CTA -> `/work-with-tiffany?type=Media`)
6. **`/work-with-tiffany`** — 5 Sections (Redirect `/book` here; Hero, The Form with 9 fields POSTing to `/api/leads` with inline validation, What Happens Next [4 steps], FAQ [ships empty], Alternative Contact)
7. **`/insights`** — 3 Sections (Hero, Article Grid, Article Template max-width 68ch serif body; top-nav exclusion logic until ≥6 articles exist)

---

## 2. Global Brand Rules & Hard Constraints

| Rule # | Constraint | Implementation Enforcement |
|---|---|---|
| **C1** | **Brand Palette** | Deep Ink (`#0D1210` / `#14130E`), Deep Forest Sage (`#1A2721` / `#162E25`), Warm Ivory (`#FBF6EA` / `#F2EFE9`), Regal Gold (`#C8A24C` / `#C29545`), Coral Accent (`#C15427`). |
| **C2** | **Brand Typography** | Headlines / Display: Instrument Serif / Fraunces; Body / UI: Plus Jakarta Sans / Inter; Badges / Meta / Data: Space Mono. |
| **C3** | **Zero Speaking Fees** | Never print fees, prices, dollar numbers, or budget figures in visible frontend text. |
| **C4** | **Single Contact Email** | Only `booking@tiffanywebb.com`. Never expose her employer (HAS) email or personal accounts. |
| **C5** | **No Gambling Imagery** | Prohibit all slot machines, dice, cards, roulette wheels, and casino neon graphics. |
| **C6** | **20 Speaking Topics** | Exactly 20 topics across 4 tracks (not 21). Replace all legacy references to 21. |
| **C7** | **No Invented Proof** | Never invent fake summit names, awards, quotes, or fake partner logos. Config arrays ship empty or with marked placeholders. |
| **C8** | **National Positioning** | Never restrict her to Chicago; state "Chicago-born and raised, with deep Louisiana family roots — serving nationally." |
| **C9** | **Credentials Usage** | "Tiffany Webb, BBA, MHP". Never spell out MHP; post-nominal letters only. |
| **C10** | **Database Driven** | 100% of text strings, toggles, and collections are editable via MySQL / CRM dashboard. |

---

## 3. Page-by-Page Field Specifications

### 3.1 Page 1: `/about` (9 Sections)

#### 01. Page Hero
- **Purpose:** Establish personal identity, roots, and authority.
- **Section ID:** `about_hero`
- **Fields:**
  - `eyebrow` (text): `"ABOUT TIFFANY WEBB"`
  - `headline` (text/html): `"Chicago Heart &mdash; <span class=\"italic-accent text-gold\">Louisiana Soul.</span>"`
  - `subtitle` (text): `"Community Impact Strategist · Public Health Educator & Speaker"`
  - `hero_image` (image): Path to editorial portrait (4:5 aspect ratio).
- **Client Behavior:** Smooth stagger reveal on load.

#### 02. The Story (`about_story`)
- **Purpose:** First-person narrative divided into 5–7 thematic vignettes. Marked `CONTENT-PENDING`.
- **Fields:**
  - `eyebrow` (text): `"THE STORY"`
  - `headline` (text): `"Where conviction meets the pavement."`
  - `pull_quote` (text): `"When we rise, we rise together."`
  - `collection:story_vignettes` (repeater):
    1. **Vignette 1 (The Foundation):** `"Chicago-born and raised, with deep Louisiana family roots, Tiffany grew up between two worlds that shaped how she works. A city that taught resilience and directness, and a family culture that taught hospitality — meeting people where they are and feeding them before asking them anything."`
    2. **Vignette 2 (The Awakening):** `"She came to public health through behavioral health. She stayed because she kept meeting families who had never been given language for what was happening to them: a father unable to explain where savings went, a student who believed sports betting was harmless gaming, a spouse carrying debt in silence."`
    3. **Vignette 3 (The Nature of Gambling Harm):** `"Gambling harm hides better than almost any other addiction. It carries no smell and shows up on no standard screen. By the time families name it, they have often carried it alone for years. Breaking that silence requires conversations that remove shame without minimizing reality."`
    4. **Vignette 4 (The Frontline Reality):** `"Over fifteen years and four thousand hours of frontline outreach, Tiffany has delivered prevention where it actually happens: in school gymnasiums, community clinics, church basements, and coalition halls across Illinois and nationwide."`
    5. **Vignette 5 (Culturally Rooted Prevention):** `"Standard public health campaigns often wait for people to seek help. Tiffany's work flips the dynamic: entering trusted community spaces, working through existing cultural leadership, and equipping everyday people with practical intervention tools."`
    6. **Vignette 6 (Empowerment & Enterprise):** `"Her work bridges behavioral science and community enterprise — including founding GambleFreeGear, an awareness apparel initiative that turns prevention into something people wear and talk about before crisis strikes."`

#### 03. Credentials & Expertise (`about_credentials`)
- **Purpose:** Highlight academic degrees and 4 core domains.
- **Fields:**
  - `eyebrow` (text): `"CREDENTIALS & EXPERTISE"`
  - `headline` (text/html): `"Expertise that <span class=\"italic-accent text-gold\">moves people.</span>"`
  - `credentials_badge` (text): `"TIFFANY WEBB, BBA, MHP"`
  - `experience_stat_1` (text): `"15+ Years in Behavioral Health & Public Health"`
  - `experience_stat_2` (text): `"4,000+ Hours of Frontline Outreach"`
  - `collection:expertise_areas` (4 items):
    1. **Behavioral Health & Addiction Prevention:** Clinical depth on co-occurring disorders, harm reduction, and stigma reduction.
    2. **Youth & Digital Gambling Prevention:** Evidence-based programs on gaming-to-gambling crossover, sports-betting apps, and campus awareness.
    3. **Community Outreach & Coalition Navigation:** Building grassroots trust, engaging ROSC councils, and working with local leaders.
    4. **Screening, Brief Intervention & Referral Systems:** Integrating gambling screening into healthcare and social service intake workflows.

#### 04. How She Works Signpost (`about_how_she_works`)
- **Purpose:** Visual signpost directing visitors to the GEAR Method.
- **Fields:**
  - `eyebrow` (text): `"HOW SHE WORKS"`
  - `headline` (text): `"Strategy with people at the center."`
  - `body_text` (text): `"Every keynote, training, and strategic advisory engagement is powered by her proprietary methodology."`
  - `cta_text` (text): `"Explore The GEAR Method™ →"`
  - `cta_url` (text): `"/services#gear"`

#### 05. The Specialism (`about_specialism`, `id="specialism"`)
- **Purpose:** Detail her primary differentiator: culturally rooted gambling prevention.
- **Fields:**
  - `section_anchor` (text): `"specialism"`
  - `eyebrow` (text): `"THE SPECIALISM"`
  - `headline` (text/html): `"Where this <span class=\"italic-accent text-gold\">work began.</span>"`
  - `lead_paragraph` (text): `"While public health often treats gambling as an afterthought, Tiffany has spent fifteen years addressing it as a primary public health crisis."`
  - `body_paragraphs` (html): `"Research demonstrates that problem gambling disproportionately impacts communities of color and underserved populations. Tiffany's specialized practice combines rigorous public health education with deep cultural fluency to deliver interventions that resonate."`

#### 06. Values (`about_values`)
- **Purpose:** Core personal and operational principles.
- **Fields:**
  - `eyebrow` (text): `"CORE VALUES"`
  - `headline` (text): `"What she works from."`
  - `pull_quote` (text): `"Every conversation is an opportunity to plant a seed of hope, strengthen a community, and inspire meaningful change."`
  - `collection:values_list` (5 items):
    1. **Faith:** The unwavering belief that people can change, including those others have written off.
    2. **Family:** Where prevention starts, and where harm is felt first and longest.
    3. **Community:** Nobody recovers alone, and nobody prevents alone either.
    4. **Purpose:** Turning lived understanding and professional rigor into practical service.
    5. **Impact:** Measured in conversations started and systems changed, not talks delivered.

#### 07. Professional Affiliations (`about_affiliations`)
- **Purpose:** Display institutional affiliations and memberships.
- **Fields:**
  - `section_is_active` (boolean): `0` (Ships empty; hidden automatically if collection has 0 items).
  - `collection:affiliations_list` (repeater: `name`, `role`, `logo_url`, `url`).

#### 08. GambleFreeGear (`about_gamblefreegear`)
- **Purpose:** Introduce the apparel sub-brand.
- **Fields:**
  - `eyebrow` (text): `"GAMBLEFREEGEAR — BY TIFFANY WEBB"`
  - `headline` (text): `"Break the silence — literally."`
  - `body_text` (text): `"GambleFreeGear turns prevention into something people can wear and talk about. Apparel that starts the conversation before Tiffany ever walks into the room."`
  - `cta_text` (text): `"Explore GambleFreeGear →"`
  - `cta_url` (text): `"https://inpowerimports.com"` (or `/gamblefreegear`)

#### 09. Closing CTA (`about_cta`)
- **Purpose:** Conversion driver to booking page.
- **Fields:**
  - `headline` (text): `"Let's start a conversation."`
  - `subtitle` (text): `"Whether you are planning a conference, organizing a training, or designing a community strategy."`
  - `button_text` (text): `"Invite Tiffany to Speak →"`
  - `button_url` (text): `"/work-with-tiffany"`

---

### 3.2 Page 2: `/services` (Redirect `/speaking` here) (8 Sections)

#### 01. Page Hero
- **Section ID:** `services_hero`
- **Fields:**
  - `eyebrow` (text): `"SERVICES & CAPABILITIES"`
  - `headline` (text/html): `"Strategy with <span class=\"italic-accent text-gold\">people at the center.</span>"`
  - `subtitle` (text): `"From keynote stages to executive strategy, Tiffany Webb helps organizations bridge public health expertise, frontline reality, and actionable community impact."`
  - `primary_cta_text` (text): `"Work with Tiffany →"`
  - `primary_cta_url` (text): `"/work-with-tiffany"`

#### 02. Four Capabilities (`services_capabilities`)
- **Purpose:** Alternating feature blocks with deep-link IDs.
- **Collection: `services_capabilities` (4 items):**
  1. **Strategic Advisor** (`id="strategic-advisor"`, Subtitle: `"01 // THINK"`):
     - *Summary:* `"I challenge familiar thinking, uncover opportunities, and help leaders make clearer decisions around growth, engagement, innovation, and impact."`
     - *Scope:* Executive advisory, public health strategy, coalition alignment, prevention program roadmaps.
  2. **Program Architect** (`id="program-architect"`, Subtitle: `"02 // BUILD"`):
     - *Summary:* `"I turn ideas and community needs into structured programs, initiatives, experiences, partnerships, and implementation pathways."`
     - *Scope:* Curriculum design, screening workflow integration, campaign architecture, stakeholder coordination.
  3. **Community Impact Strategist** (`id="community-impact-strategist"`, Subtitle: `"03 // CONNECT"`):
     - *Summary:* `"Connects organizational goals with community realities, strengths, needs, and voices to create people-centered, outcome-focused strategies."`
     - *Scope:* Grassroots community engagement, health equity initiatives, ROSC council partnerships.
  4. **Speaker & Facilitator** (`id="speaker-facilitator"`, Subtitle: `"04 // MOVE"`):
     - *Summary:* `"I create conversations and learning experiences that challenge assumptions, elevate thinking, encourage dialogue, and move audiences toward action."`
     - *Scope:* Keynotes, breakout sessions, clinical trainings, interactive workshops.
  - *Closing Quote:* `"I don't just tell you what to do next. I help you build how you get there."`

#### 03. The GEAR Method™ (`services_gear`, `id="gear"`)
- **Purpose:** Proprietary human-centered methodology.
- **Fields:**
  - `eyebrow` (text): `"SIGNATURE METHODOLOGY"`
  - `headline` (text): `"The GEAR Method™"`
  - `standfirst` (text): `"From awareness to action. From ideas to impact."`
  - `description` (text): `"The GEAR Method™ is a human-centered approach to helping organizations create strategies that connect with people, activate participation, and build meaningful pathways forward."`
  - `collection:gear_steps` (4 items):
    - **G — Generate:** Build awareness and understanding. Clarify the challenge, understand the audience, and make the issue visible and relevant.
    - **E — Engage:** Build trust and connection. Listen, strengthen relationships, and create opportunities for meaningful participation.
    - **A — Activate:** Move ideas into action. Turn insight into strategies, programs, experiences, partnerships, and practical next steps.
    - **R — Resource:** Build the path forward. Connect people and organizations with information, relationships, services, tools, and opportunities.
  - `footer_flow` (text): `"AWARENESS → CONNECTION → ACTION → IMPACT"`

#### 04. Speaking & Facilitation (`services_speaking_teaser`)
- **Purpose:** Bridge to the 20 speaking topics.
- **Fields:**
  - `eyebrow` (text): `"SPEAKING & FACILITATION"`
  - `headline` (text/html): `"Conversations that <span class=\"italic-accent text-gold\">create change.</span>"`
  - `body_text` (text): `"Twenty topics organized across four signature tracks — built for clinicians, educators, students, and community coalitions."`
  - `cta_text` (text): `"Explore All 20 Speaking Topics →"`
  - `cta_url` (text): `"/services/speaking-topics"`

#### 05. Engagement Formats (`services_formats`)
- **Purpose:** 6 structured delivery format cards + long-tail support line.
- **Collection: `services_formats` (6 cards):**
  1. **Keynote:** Main-stage talk (45–60 min) that reframes prevention and inspires collective action.
  2. **Conference Session:** Focused breakout (60–90 min) tailored to event tracks with deep Q&A.
  3. **Panel:** Dynamic, generous contributor or moderator bringing frontline public health specificity.
  4. **School & University:** Two-part structure (students + faculty/parents) addressing sports betting and app mechanics.
  5. **Workshop:** Half-day or full-day practical training for clinicians and frontline teams.
  6. **Custom Program:** Multi-session series, coalition advisory, or bespoke community design.
- **Long-tail Line:** `"Same expertise, shaped to fit your event — from a main-stage keynote to a full-day training."`

#### 06. What Working Together Looks Like (`services_process`)
- **Purpose:** 4-step client engagement path.
- **Collection: `services_steps` (4 items):**
  - **Step 01 (Pre-event consultation):** She learns your audience, goals, and constraints before crafting content.
  - **Step 02 (Content built for your room):** Sessions are customized for your attendees, never generic.
  - **Step 03 (Promotional assets):** Headshots, approved bios, session abstracts, and marketing assets provided ready to use.
  - **Step 04 (Post-event resources):** Actionable takeaways and toolkits attendees can implement immediately.

#### 07. FAQ (`services_faqs`)
- **Fields:** `section_is_active` (0 = hidden). Ships empty.

#### 08. Closing CTA (`services_cta`)
- **Fields:** `headline`: `"Bring Tiffany to your stage or team."`, `button_text`: `"Invite Tiffany to Speak →"`, `button_url`: `"/work-with-tiffany"`.

---

### 3.3 Page 3: `/services/speaking-topics` (4 Sections)

#### 01. Hero (`speaking_topics_hero`)
- **Fields:**
  - `eyebrow` (text): `"SPEAKING PORTFOLIO"`
  - `headline` (text/html): `"Conversations that <span class=\"italic-accent text-gold\">create change.</span>"`
  - `subtitle` (text): `"Twenty topics across four tracks — practical enough to use on Monday, human enough that the room stays with her."`

#### 02. Client-Side Filter Bar
- **Filter Controls:**
  - **By Track:** All (20), Prevention & Awareness (5), Treatment & Recovery (8), Family & Community (4), Creative Engagement (3).
  - **By Audience:** All, General Public, Youth & Students, Clinicians & Providers, Policy & Government, Families.
- **Behavior:** Instant zero-reload filtering with CSS fade/slide transitions and visible count badge.

#### 03. The 20 Speaking Topics Grid (`speaking_topics_grid`)
- **Data Attributes & Cards:** Every card contains `data-track`, `data-audience`, track color border, session length (`CONTENT-PENDING`), and a direct prefill CTA button (`/work-with-tiffany?topic=URL_ENCODED_TITLE`).

| # | Track | Topic Title | Target Audience | Summary / Takeaways | Accent Palette |
|---|---|---|---|---|---|
| 1 | **Prevention & Awareness** | Gambling Prevention and Community Awareness | General public, community organizations, prevention specialists | Introduction to how gambling harm develops, risk factors, and proactive steps before crisis. | Emerald (`#0E6B54`) |
| 2 | **Prevention & Awareness** | Don't Bet on Your Future (Youth Focus) | Students, youth groups, educators, parents | Tackles sports-betting apps, gaming-to-gambling crossover, and peer dynamics without lecturing. | Emerald (`#0E6B54`) |
| 3 | **Prevention & Awareness** | Problem Gambling Awareness Month (March) | General public, community stakeholders, advocacy groups | Ready-to-deliver signature session for PGAM campaigns and community awareness moments. | Emerald (`#0E6B54`) |
| 4 | **Prevention & Awareness** | National Screening Day | Health centers, prevention coalitions, public health | How screening works and how to integrate it into health settings without stigmatizing patients. | Emerald (`#0E6B54`) |
| 5 | **Prevention & Awareness** | Outreach: Engaging Elected Officials & Resolutions | Policy makers, government officials, advocates | Moving prevention into policy attention, drafting resolutions, and engaging civic leaders. | Emerald (`#0E6B54`) |
| 6 | **Treatment & Recovery** | Gambling & Co-Occurring Disorders: SUD & Workplace | Behavioral health professionals, HR, EAPs | The overlap of gambling with substance use and how it presents in workplace/EAP settings. | Gold (`#C8A24C`) |
| 7 | **Treatment & Recovery** | The Changing Face of Gambling Addiction | Treatment providers, community leaders, advocates | How mobile apps and digital sports betting transformed addiction demographics and speed of onset. | Gold (`#C8A24C`) |
| 8 | **Treatment & Recovery** | Gambling and Suicide | Mental health clinicians, crisis intervention workers | Clinically grounded guidance on the high co-occurring suicide risks of gambling disorder. | Gold (`#C8A24C`) |
| 9 | **Treatment & Recovery** | Resources: Self-Exclusion | Treatment providers, prevention specialists, agencies | How self-exclusion programs work, their limitations, and how to integrate them into wider recovery. | Gold (`#C8A24C`) |
| 10 | **Treatment & Recovery** | Harm Reduction Strategies for Problem Gambling | Treatment providers, harm reduction advocates | Meeting individuals where they are who are not yet ready for total abstinence. | Gold (`#C8A24C`) |
| 11 | **Treatment & Recovery** | Motivational Interviewing Tools | Counselors, peer specialists, social workers | Hands-on skills practice applying motivational interviewing to gambling disclosures. | Gold (`#C8A24C`) |
| 12 | **Treatment & Recovery** | Screening and Prevention in Healthcare | Primary care providers, social service agencies | Practical toolkits for embedding gambling screening into routine health assessments. | Gold (`#C8A24C`) |
| 13 | **Treatment & Recovery** | Guidelines for Gambling Treatment & Linkage | Behavioral health staff, recovery coaches | Building warm-handoff referral pathways that patients actually follow through on. | Gold (`#C8A24C`) |
| 14 | **Family & Community** | Gambling, Significant Others, and Impact | Families, peer support groups, counselors | Addressing the financial, emotional, and relational trauma experienced by partners. | Coral (`#C15427`) |
| 15 | **Family & Community** | The Link Between Gambling, Domestic Violence & Trauma | DV advocates, trauma specialists, social workers | Evidence-informed exploration of intimate partner violence and trauma intersections. | Coral (`#C15427`) |
| 16 | **Family & Community** | Families Living with Problem Gambling: Coping & Help | Family members, therapists, support networks | Practical guidance: asset protection, boundary setting, and initiating help-seeking. | Coral (`#C15427`) |
| 17 | **Family & Community** | Gambling Harm in Family Systems | Marriage & family therapists, social workers | Systems-level look at how addiction alters family communication, finances, and child development. | Coral (`#C15427`) |
| 18 | **Creative Engagement** | Promotion: Youth Art Competition | Schools, art programs, youth organizations | Using creative arts contests to engage youth in prevention without standard lectures. | Deep Violet (`#4A3B69`) |
| 19 | **Creative Engagement** | Promotion: Responsible Gifting | Parents, educators, community retailers | Non-judgmental education on preventing lottery tickets and scratch-offs as gifts to minors. | Deep Violet (`#4A3B69`) |
| 20 | **Creative Engagement** | Gambling Prevention & ROSC Council Engagement | ROSC members, recovery coalition directors | Integrating gambling prevention directly into Recovery Oriented Systems of Care. | Deep Violet (`#4A3B69`) |

#### 04. Topic CTA (`speaking_topics_cta`)
- **Fields:** `headline`: `"Need a customized topic for your conference or team?"`, `button_text`: `"Request a Custom Session →"`, `button_url`: `"/work-with-tiffany"`.

---

### 3.4 Page 4: `/impact` (8 Sections)

#### 01. Hero (`impact_hero`)
- **Fields:**
  - `eyebrow` (text): `"COMMUNITY IMPACT"`
  - `headline` (text/html): `"Where the work <span class=\"italic-accent text-gold\">has taken me.</span>"`
  - `subtitle` (text): `"Fifteen years of prevention work, measured in conversations started, systems changed, and communities that stopped waiting for permission to talk about this."`

#### 02. Aggregate Band (`impact_stats`, ships empty / config-driven)
- **Config Items:** Ships empty unless numbers are populated in CMS. Verified fallbacks: `15+ Years`, `4,000+ Hours of Outreach`, `20 Speaking Topics`.

#### 03. Upcoming Engagements (`impact_upcoming`, ships empty)
- **State:** Ships empty.
- **Empty State Display:** `"Next speaking dates announced soon. In the meantime, get in touch to bring Tiffany to your event."` + CTA button to `/work-with-tiffany`.

#### 04. Past Engagements (`impact_past`, ships empty, filterable)
- **State:** Ships empty. Client-side filter controls (Year, Format, Audience) hide when items count is 0.
- **Empty State Display:** `"Past engagement archive is currently being updated with recent keynotes and summits."`

#### 05. Outcome Stories (`impact_stories`, 3 slots, ships empty)
- **State:** Ships empty (3 slot layout).
- **Structure per Story:** `Title`, `Community / Organization`, `Challenge`, `Approach (GEAR Method)`, `Result / Outcome`. Marked `CONTENT-PENDING`.

#### 06. Gambling Prevention Work (`impact_practice`)
- **Purpose:** Describe her public health practice without naming her employer.
- **Fields:**
  - `eyebrow` (text): `"PUBLIC HEALTH PRACTICE"`
  - `headline` (text): `"Prevention that meets people where they are."`
  - `body_text` (text): `"Tiffany has spent fifteen years working in school gyms, clinic waiting rooms, church basements, and coalition halls. Her work establishes prevention in spaces standard campaigns never reach."`
  - `link_text` (text): `"Read more about her specialism →"`
  - `link_url` (text): `"/about#specialism"`

#### 07. Testimonials (`impact_testimonials`, ships empty)
- **State:** Ships empty (Hidden automatically if collection length is 0, or shows designed placeholder: `"Partner feedback and attendee testimonials are currently being curated."`).

#### 08. Closing CTA (`impact_cta`)
- **Fields:** `headline`: `"Bring this work to your community."`, `button_text`: `"Invite Tiffany to Speak →"`, `button_url`: `"/work-with-tiffany"`.

---

### 3.5 Page 5: `/media` (6 Sections)

#### 01. Hero (`media_hero`)
- **Fields:**
  - `eyebrow` (text): `"MEDIA & PRESS"`
  - `headline` (text/html): `"Ready for the room &mdash; <span class=\"italic-accent text-gold\">and the story.</span>"`
  - `subtitle` (text): `"Everything event organizers, journalists, and podcast hosts need to feature, interview, or introduce Tiffany Webb."`

#### 02. Downloads Asset Cards (`media_downloads`)
- **Rule:** Only show available files; do not output broken dead links.
- **Items:**
  1. **Speaker One-Sheet (PDF):** Single-page overview of keynotes, topics, and credentials.
  2. **Media Kit (ZIP):** High-resolution approved headshots, bio files, and brand standards.
  3. **Capability Kit (PDF):** In-depth prospectus of consulting, clinical training, and advisory formats.

#### 03. Bios in 3 Lengths (`media_bios`, third-person, copy-to-clipboard)
- **Features:** Client-side 1-click clipboard copy button with visual checkmark feedback.
- **Copy:**
  - **Short Bio (≈40 words):** `"Tiffany Webb is a public-health educator and Community Impact Strategist with 15+ years and 4,000+ hours preventing gambling harm. She helps conferences, schools, and health systems turn hard conversations into action — with the cultural fluency to reach the people other programs miss."`
  - **Medium Bio (≈90 words):** `"Tiffany Webb, BBA, MHP, is a Chicago-born public-health educator, gambling-prevention leader, and Community Impact Strategist with deep Louisiana roots. Over 15+ years and 4,000+ hours of frontline outreach, she has built coalitions, trained professionals, and led community screenings across Illinois — partnering with health systems, schools, government, and recovery organizations. A dynamic keynote speaker, panelist, and workshop facilitator, she makes difficult topics approachable and leaves organizations with practical tools. She is also the founder of GambleFreeGear, an awareness apparel brand built to 'Break the Silence' on gambling addiction."`
  - **Long Bio (≈150 words):** `"Tiffany Webb, BBA, MHP, is a public-health educator, gambling-prevention leader, and Community Impact Strategist based in the Chicago area. Chicago-born and raised with deep Louisiana family roots, she blends behavioral-health expertise, bold community outreach, and entrepreneurial drive into a singular mission: no one should face gambling harm in silence. Across 15+ years and 4,000+ hours of prevention outreach, Tiffany has led community screenings, built coalitions, trained clinicians and frontline workers, and partnered with hospitals, schools, universities, government agencies, faith communities, and recovery organizations. As a keynote speaker, panelist, and workshop facilitator, she is known for making difficult topics approachable, leading with both heart and strategy, and equipping communities with practical tools. She is also the founder of GambleFreeGear, an awareness apparel brand on a mission to 'Break the Silence.'"`

#### 04. Introduction Script (`media_intro_script`, third-person)
- **Script Copy:** `"Our next speaker has spent more than fifteen years and four thousand hours doing prevention work in the places it's hardest to do — schools, clinics, and community rooms across Illinois. She's a public-health educator, a Community Impact Strategist, and the founder of GambleFreeGear. She believes prevention begins with a conversation, and she's here to start one with us. Please welcome Tiffany Webb."`

#### 05. What She Can Speak To (`media_talking_points`)
- **Talking Points List:**
  1. The hidden epidemic of sports-betting apps and gambling mechanics in youth gaming.
  2. Why standard prevention campaigns fail underserved communities and what culturally rooted outreach requires.
  3. The co-occurring overlap between problem gambling, substance use disorders, and suicide risk.
  4. Practical harm-reduction strategies and integrating screening into routine clinical workflows.
  5. The journey of building GambleFreeGear and turning personal conviction into visible community action.

#### 06. Media Inquiries CTA (`media_cta`)
- **Fields:** `headline`: `"Book an Interview or Podcast Feature"`, `button_text`: `"Submit Media Request →"`, `button_url`: `"/work-with-tiffany?type=Media"`.

---

### 3.6 Page 6: `/work-with-tiffany` (Redirect `/book` here) (5 Sections)

#### 01. Hero (`booking_hero`)
- **Fields:**
  - `eyebrow` (text): `"LET'S CREATE IMPACT TOGETHER"`
  - `headline` (text/html): `"Bring Tiffany <span class=\"italic-accent text-gold\">to your conversation.</span>"`
  - `subtitle` (text): `"Tell us about your event, audience, and goals. Tiffany personally reviews every inquiry and responds within two business days."`

#### 02. The 9-Field Booking Form (`booking_form`)
- **Submission Endpoint:** `POST https://app.tiffanywebbimpact.com/api/leads` (or `/api/leads` relative route).
- **Architecture:** Zero-reload AJAX fetch submission with inline field validation, error highlights, and luxury toast feedback.

| # | Field Name | Type | Required | Label | Validation & Client Behavior |
|---|---|---|---|---|---|
| 1 | `contact_name` | Text | Yes | Your Name | Min 2 chars. Trims whitespace. |
| 2 | `organization_name` | Text | Yes | Organization / Company | Min 2 chars. |
| 3 | `email` | Email | Yes | Email Address | RFC 5322 regex validation. |
| 4 | `phone` | Tel | No (Optional) | Phone Number | International country code selector + 7–15 digits. |
| 5 | `event_type` | Select | Yes | Event Type | Dropdown: Keynote, Conference, School/University, Healthcare, Panel, Workshop, Media/Press, Other. |
| 6 | `event_date` | Date | No | Event Date (or Flexible) | Datepicker or null string. |
| 7 | `event_location` | Text | No | Location (or "Virtual") | Text input. |
| 8 | `estimated_audience_size` | Select | No | Estimated Audience | Options: Under 50, 50–150, 150–500, 500+, Not sure yet. |
| 9 | `message` | Textarea | No | Tell Us About Your Event | Pre-populated via query string `?topic=...` or `?type=...`. |
| 10 | `privacy_agreement` | Checkbox | Yes | Privacy Agreement | `"I agree to the Privacy Policy."` Must be checked. |

#### 03. What Happens Next (`booking_next_steps`)
- **Collection: `booking_next_steps` (4 steps):**
  - **01 Review:** Tiffany personally evaluates fit, audience alignment, and schedule availability.
  - **02 Discovery:** A 15-minute alignment conversation to understand your room dynamics and core objectives.
  - **03 Proposal:** Clear written scope, logistics, and customized engagement agreement.
  - **04 Delivery:** A tailored, high-impact session that equips your room to take action.

#### 04. FAQ (`booking_faqs`, ships empty / config-driven)
- **State:** Config-driven array. If empty in CMS, rendered empty state hides gracefully.

#### 05. Alternative Contact (`booking_alt_contact`)
- **Fields:**
  - `email` (text): `"booking@tiffanywebb.com"`
  - `note` (text): `"For direct correspondence, media inquiries, or urgent requests, email us directly at booking@tiffanywebb.com."`
  - `location` (text): `"Based in Chicago Area, Illinois · Serving Nationwide."`

---

### 3.7 Page 7: `/insights` (3 Sections)

#### 01. Hero (`insights_hero`)
- **Fields:**
  - `eyebrow` (text): `"INSIGHTS & ARTICLES"`
  - `headline` (text/html): `"Thinking <span class=\"italic-accent text-gold\">out loud.</span>"`
  - `subtitle` (text): `"Notes from the frontline of prevention — on gambling harm, public health, and the conversations that change communities."`

#### 02. Article Grid (`insights_grid`)
- **Seed Articles (3 items):**
  1. **What Gambling Prevention Actually Looks Like:**
     - *Category:* Prevention | *Read Time:* 5 min | *Date:* August 2026
     - *Excerpt:* `"Most prevention campaigns are designed for people who are already looking. Here's what reaching everyone else requires."`
  2. **Don't Bet on Your Future: Why Youth Prevention Starts With a Conversation:**
     - *Category:* Youth Prevention | *Read Time:* 5 min | *Date:* July 2026
     - *Excerpt:* `"Sports betting reached young people faster than prevention did. Here's how schools and parents can catch up."`
  3. **The Communities Prevention Reaches Last:**
     - *Category:* Health Equity | *Read Time:* 4 min | *Date:* June 2026
     - *Excerpt:* `"Gambling harm doesn't fall evenly across communities. Neither does prevention. That gap is a design choice, not an accident."`

#### 03. Article Template & Navigation Rule
- **Template Spec:**
  - Article Container: `max-width: 68ch` centered column.
  - Typography: Serif body font (Instrument Serif headers, Plus Jakarta Sans / Georgia prose), 1.75 line-height, gold pull-quotes, author bio footer.
- **Top-Nav Visibility Rule:**
  - **Constraint:** Omit `/insights` from the main header navigation menu until at least **6 published articles** exist in the `website_collections` table (or if overridden by CRM toggle).

---

## 4. Client-Side Behaviors, Routing & Prefills Matrix

| Source Trigger | Target URL | Client-Side Interaction / State |
|---|---|---|
| Legacy `/speaking` URL | `/services` | 301 Permanent Redirect (via Astro middleware / `_redirects`). |
| Legacy `/book` URL | `/work-with-tiffany` | 301 Permanent Redirect (via Astro middleware / `_redirects`). |
| Signpost on `/about` ("How She Works") | `/services#gear` | Smooth scroll anchor targeting `#gear` section. |
| Deep Links on `/services` | `/services#strategic-advisor` | Deep links to individual capability blocks. |
| Speaking Topic Card Click | `/work-with-tiffany?topic=[Title]` | Sets form `message` textarea value to `"Inquiring about speaking topic: [Title]"` and selects event type. |
| Media Inquiries CTA | `/work-with-tiffany?type=Media` | Pre-selects `"Media / Press Inquiry"` in event type dropdown. |
| Topic Filter Bar on `/services/speaking-topics` | In-page client filter | Live DOM filter matching `data-track` and `data-audience` without page reload. |
| Bio Copy Buttons on `/media` | `navigator.clipboard.writeText()` | Copies exact bio text, displays "Copied to Clipboard!" toast for 2 seconds. |
| Lead Form on `/work-with-tiffany` | `POST /api/leads` | AJAX fetch, validates all fields, displays success message and one-sheet download link. |

---

## 5. Global Database Schema & Unified Data Dictionary

The content architecture utilizes four normalized MySQL tables:

```sql
-- 1. Website Pages
CREATE TABLE IF NOT EXISTS website_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Website Key-Value Section Content
CREATE TABLE IF NOT EXISTS website_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  section VARCHAR(100) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  content_value MEDIUMTEXT NULL,
  content_type ENUM('text','html','image','boolean','number') NOT NULL DEFAULT 'text',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES website_pages(id) ON DELETE CASCADE,
  UNIQUE KEY uq_page_section_key (page_id, section, key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Website Collections (Repeater / Structured Arrays)
CREATE TABLE IF NOT EXISTS website_collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NULL,
  subtitle VARCHAR(255) NULL,
  content_html MEDIUMTEXT NULL,
  image_url VARCHAR(255) NULL,
  icon_svg TEXT NULL,
  category VARCHAR(100) NULL,
  meta_json JSON NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES website_pages(id) ON DELETE CASCADE,
  INDEX idx_page_section (page_id, section_name, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Inbound Leads / Bookings
CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source ENUM('website_form','whatsapp','instagram','email','referral','manual') NOT NULL DEFAULT 'website_form',
  status ENUM('new','contacted','qualified','proposal_sent','booked','completed','declined','lost') NOT NULL DEFAULT 'new',
  contact_name VARCHAR(150) NOT NULL,
  organization_name VARCHAR(200) NOT NULL,
  email VARCHAR(190) NOT NULL,
  country_code VARCHAR(10) NULL DEFAULT '+1',
  phone VARCHAR(40) NULL,
  event_type VARCHAR(100) NOT NULL,
  event_date DATE NULL,
  event_location VARCHAR(200) NULL,
  estimated_audience_size VARCHAR(100) NULL,
  message TEXT NULL,
  assigned_to INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_contact_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. Discovered Features & Edge Cases

### Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Navigation | Dynamic Route Redirects | `/speaking` -> `/services` and `/book` -> `/work-with-tiffany` | Inbound URL request | HTTP 301 redirect | Fallback to next middleware | `ORIGINAL_REQUEST.md` |
| 2 | Navigation | Conditional Nav Inclusion | Keep `/insights` out of main header until ≥6 articles exist | Database count query | Render/Hide Nav Item | Default hidden if <6 | `ORIGINAL_REQUEST.md` §7 |
| 3 | Filter | Client-Side Topic Filtering | Instant filter by Track & Audience on `/services/speaking-topics` | User pill click | Visible card set | "No topics found" empty state | `ORIGINAL_REQUEST.md` §3 |
| 4 | Booking | Topic Query String Prefill | Pre-populate booking message and topic when arriving from topic card | `?topic=Title` | Prefilled textarea | Normal empty form | `ORIGINAL_REQUEST.md` §3 |
| 5 | Media | 1-Click Clipboard Copy | Instant bio copy for event organizers & press on `/media` | Click copy button | Bio copied to clipboard + toast | Clipboard API fallback | `FILE_4_COMPLETE_CONTENT.md` |
| 6 | Form UX | Inline Lead Validation | Real-time email/name validation on `/work-with-tiffany` | Keystroke / blur | Red field highlight / helper text | Prevents submission | `ORIGINAL_REQUEST.md` §6 |
| 7 | Empty State | Graceful Array Collapsing | Automatically hide empty sections (Affiliations, FAQs, Engagements) | Array length == 0 | CSS display: none / omitted | No broken UI or white gaps | `ORIGINAL_REQUEST.md` |
| 8 | CRM | Unified Collection Editor | Expose all 20 topics, capabilities, and bios in CRM dashboard | Admin EJS view | MySQL CRUD operations | Flash error toast | `ORIGINAL_REQUEST.md` R2 |

### Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---|---|---|
| 1 | Topic Prefill | `?topic=NonExistentTopic%20Name` | Form gracefully accepts any custom text in textarea without crashing. |
| 2 | Media Download | Missing PDF file on server | Asset card automatically hides download button and displays "Available upon request". |
| 3 | Lead Submission | Invalid email format (e.g. `user@`) | Frontend catches via regex; backend validates and returns HTTP 422 if bypassed. |
| 4 | Impact Page | 0 upcoming engagements in DB | Displays warm empty state banner: "Next speaking dates announced soon." |
| 5 | Top Navigation | Exactly 5 published insights articles | Insights remains hidden from top navbar until the 6th article is added. |
| 6 | MHP Credential | User edits bio in CRM | CRM enforces rule notice: "Post-nominal letters only; never expand MHP". |
