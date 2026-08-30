-- ==============================================================================
-- Tiffany Webb Master Database Seeder: All 7 Inner Pages + Home Page
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- ==============================================================================

-- 1. Ensure Website Pages
INSERT INTO website_pages (slug, name, meta_title, meta_description, is_active) VALUES
('home', 'Home', 'Tiffany Webb | Community Impact Strategist & Public Health Educator', 'Chicago Heart — Louisiana Soul. 15+ years and 4,000+ hours of frontline behavioral health and gambling harm prevention.', 1),
('about', 'About Tiffany', 'About Tiffany Webb | Chicago Heart — Louisiana Soul', 'Community Impact Strategist, Public Health Educator & Speaker with 15+ years and 4,000+ hours preventing gambling harm.', 1),
('services', 'Services & Capabilities', 'Services & Capabilities | Tiffany Webb', 'Strategy with people at the center. Strategic Advisory, Program Architecture, Community Impact, and Speaking.', 1),
('speaking-topics', 'Speaking Topics', '20 Speaking Topics | Tiffany Webb', 'Explore 20 signature speaking topics across 4 tracks: Prevention & Awareness, Treatment & Recovery, Family & Community, and Creative Engagement.', 1),
('impact', 'Impact & Engagements', 'Community Impact | Tiffany Webb', 'Where the work has taken me. Fifteen years of frontline public health education and community impact.', 1),
('media', 'Media & Press Kit', 'Media & Press Kit | Tiffany Webb', 'Official speaker assets, approved bios, emcee introduction script, and commentary topics.', 1),
('work-with-tiffany', 'Work With Tiffany', 'Work With Tiffany | Bookings & Inquiries', 'Invite Tiffany Webb for keynotes, workshops, and strategic advisory. Direct booking inquiries and discovery calls.', 1),
('insights', 'Insights & Articles', 'Insights & Articles | Tiffany Webb', 'Notes from the frontline of prevention — on gambling harm, public health, and the conversations that change communities.', 1),
('privacy', 'Privacy Policy', 'Privacy Policy | Tiffany Webb', 'Privacy policy for Tiffany Webb brand website and services.', 1),
('terms', 'Terms of Service', 'Terms of Service | Tiffany Webb', 'Terms of service for Tiffany Webb brand website and services.', 1),
('newsletter', 'Newsletter', 'Newsletter Signup | Tiffany Webb', 'Stay connected with frontline insights and prevention updates.', 1)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name), 
  meta_title = VALUES(meta_title), 
  meta_description = VALUES(meta_description), 
  is_active = VALUES(is_active);

-- ==============================================================================
-- 2. Clean Existing Content & Collections for Fresh Hydration
-- ==============================================================================
DELETE FROM website_content WHERE page_id IN (SELECT id FROM website_pages);
DELETE FROM website_collections WHERE page_id IN (SELECT id FROM website_pages);

-- ==============================================================================
-- 3. Hydrate Page 1: /about (9 Sections)
-- ==============================================================================
SET @page_about = (SELECT id FROM website_pages WHERE slug = 'about' LIMIT 1);

-- 01. Hero (about_hero / hero)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'hero', 'eyebrow', 'ABOUT TIFFANY WEBB', 'text'),
(@page_about, 'hero', 'headline', 'Chicago Heart &mdash; <span class="italic-accent text-gold">Louisiana Soul.</span>', 'html'),
(@page_about, 'hero', 'subtitle', 'Community Impact Strategist · Public Health Educator & Speaker', 'text'),
(@page_about, 'hero', 'hero_image', '/images/tiffany_about_new.jpg', 'image'),
(@page_about, 'hero', 'section_is_active', '1', 'boolean');

-- 02. The Story (about_story / story)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'story', 'eyebrow', 'THE STORY', 'text'),
(@page_about, 'story', 'headline', 'Where conviction meets the pavement.', 'text'),
(@page_about, 'story', 'pull_quote', 'When we rise, we rise together.', 'text'),
(@page_about, 'story', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_about, 'story_vignettes', 'The Foundation', 'Roots & Culture', '[CONTENT-PENDING] Chicago-born and raised, with deep Louisiana family roots, Tiffany grew up between two worlds that shaped how she works. A city that taught resilience and directness, and a family culture that taught hospitality — meeting people where they are and feeding them before asking them anything.', 1, 1),
(@page_about, 'story_vignettes', 'The Awakening', 'A Hidden Crisis', '[CONTENT-PENDING] She came to public health through behavioral health. She stayed because she kept meeting families who had never been given language for what was happening to them: a father unable to explain where savings went, a student who believed sports betting was harmless gaming, a spouse carrying debt in silence.', 2, 1),
(@page_about, 'story_vignettes', 'The Nature of Gambling Harm', 'Breaking the Silence', '[CONTENT-PENDING] Gambling harm hides better than almost any other addiction. It carries no smell and shows up on no standard screen. By the time families name it, they have often carried it alone for years. Breaking that silence requires conversations that remove shame without minimizing reality.', 3, 1),
(@page_about, 'story_vignettes', 'The Frontline Reality', 'Fifteen Years on the Ground', '[CONTENT-PENDING] Over fifteen years and four thousand hours of frontline outreach, Tiffany has delivered prevention where it actually happens: in school gymnasiums, community clinics, church basements, and coalition halls across Illinois and nationwide.', 4, 1),
(@page_about, 'story_vignettes', 'Culturally Rooted Prevention', 'Meeting People Where They Are', '[CONTENT-PENDING] Standard public health campaigns often wait for people to seek help. Tiffany\'s work flips the dynamic: entering trusted community spaces, working through existing cultural leadership, and equipping everyday people with practical intervention tools.', 5, 1),
(@page_about, 'story_vignettes', 'Empowerment & Enterprise', 'GambleFreeGear', '[CONTENT-PENDING] Her work bridges behavioral science and community enterprise — including founding GambleFreeGear, an awareness apparel initiative that turns prevention into something people wear and talk about before crisis strikes.', 6, 1);

-- 03. Credentials & Expertise (about_credentials / credentials)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'credentials', 'eyebrow', 'CREDENTIALS & EXPERTISE', 'text'),
(@page_about, 'credentials', 'headline', 'Expertise that <span class="italic-accent text-gold">moves people.</span>', 'html'),
(@page_about, 'credentials', 'credentials_badge', 'TIFFANY WEBB, BBA, MHP', 'text'),
(@page_about, 'credentials', 'experience_stat_1', '15+ Years in Behavioral Health & Public Health', 'text'),
(@page_about, 'credentials', 'experience_stat_2', '4,000+ Hours of Frontline Outreach', 'text'),
(@page_about, 'credentials', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_about, 'expertise_areas', 'Behavioral Health & Addiction Prevention', 'Clinical Depth', 'Clinical depth on co-occurring disorders, harm reduction, and stigma reduction across diverse populations.', 1, 1),
(@page_about, 'expertise_areas', 'Youth & Digital Gambling Prevention', 'Digital Fluency', 'Evidence-based programs on gaming-to-gambling crossover, sports-betting apps, and campus awareness campaigns.', 2, 1),
(@page_about, 'expertise_areas', 'Community Outreach & Coalition Navigation', 'Grassroots Trust', 'Building grassroots trust, engaging ROSC councils, and working alongside community leaders.', 3, 1),
(@page_about, 'expertise_areas', 'Screening, Brief Intervention & Referral Systems', 'Systems Integration', 'Integrating gambling screening into healthcare and social service intake workflows.', 4, 1);

-- 04. How She Works Signpost (about_how_she_works / how_she_works)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'how_she_works', 'eyebrow', 'HOW SHE WORKS', 'text'),
(@page_about, 'how_she_works', 'headline', 'Strategy with people at the center.', 'text'),
(@page_about, 'how_she_works', 'body_text', 'Every keynote, training, and strategic advisory engagement is powered by her proprietary methodology.', 'textarea'),
(@page_about, 'how_she_works', 'cta_text', 'Explore The GEAR Method™ →', 'text'),
(@page_about, 'how_she_works', 'cta_url', '/services#gear', 'text'),
(@page_about, 'how_she_works', 'section_is_active', '1', 'boolean');

-- 05. The Specialism id="specialism" (about_specialism / specialism)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'specialism', 'section_anchor', 'specialism', 'text'),
(@page_about, 'specialism', 'eyebrow', 'THE SPECIALISM', 'text'),
(@page_about, 'specialism', 'headline', 'Where this <span class="italic-accent text-gold">work began.</span>', 'html'),
(@page_about, 'specialism', 'lead_paragraph', 'While public health often treats gambling as an afterthought, Tiffany has spent fifteen years addressing it as a primary public health crisis.', 'textarea'),
(@page_about, 'specialism', 'body_paragraphs', 'Research demonstrates that problem gambling disproportionately impacts communities of color and underserved populations. Tiffany\'s specialized practice combines rigorous public health education with deep cultural fluency to deliver interventions that resonate.', 'html'),
(@page_about, 'specialism', 'section_is_active', '1', 'boolean');

-- 06. Values (about_values / values)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'values', 'eyebrow', 'CORE VALUES', 'text'),
(@page_about, 'values', 'headline', 'What she works from.', 'text'),
(@page_about, 'values', 'pull_quote', 'Every conversation is an opportunity to plant a seed of hope, strengthen a community, and inspire meaningful change.', 'textarea'),
(@page_about, 'values', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_about, 'values_list', 'Faith', 'Belief in Renewal', 'The unwavering belief that people can change, including those others have written off.', 1, 1),
(@page_about, 'values_list', 'Family', 'Where Prevention Starts', 'Where prevention starts, and where harm is felt first and longest.', 2, 1),
(@page_about, 'values_list', 'Community', 'Shared Resilience', 'Nobody recovers alone, and nobody prevents alone either.', 3, 1),
(@page_about, 'values_list', 'Purpose', 'Practical Service', 'Turning lived understanding and professional rigor into practical service.', 4, 1),
(@page_about, 'values_list', 'Impact', 'Lasting Change', 'Measured in conversations started and systems changed, not talks delivered.', 5, 1);

-- 07. Professional Affiliations (about_affiliations / affiliations) - Ships EMPTY
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'affiliations', 'eyebrow', 'PROFESSIONAL AFFILIATIONS', 'text'),
(@page_about, 'affiliations', 'headline', 'Professional Affiliations & Memberships', 'text'),
(@page_about, 'affiliations', 'section_is_active', '0', 'boolean');

-- 08. GambleFreeGear (about_gamblefreegear / gamblefreegear)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'gamblefreegear', 'eyebrow', 'GAMBLEFREEGEAR — BY TIFFANY WEBB', 'text'),
(@page_about, 'gamblefreegear', 'headline', 'Break the silence — literally.', 'text'),
(@page_about, 'gamblefreegear', 'body_text', 'GambleFreeGear turns prevention into something people can wear and talk about. Apparel that starts the conversation before Tiffany ever walks into the room.', 'textarea'),
(@page_about, 'gamblefreegear', 'cta_text', 'Explore GambleFreeGear →', 'text'),
(@page_about, 'gamblefreegear', 'cta_url', 'https://inpowerimports.com', 'text'),
(@page_about, 'gamblefreegear', 'section_is_active', '1', 'boolean');

-- 09. Closing CTA (about_cta / cta)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'cta', 'headline', 'Let\'s start a conversation.', 'text'),
(@page_about, 'cta', 'subtitle', 'Whether you are planning a conference, organizing a training, or designing a community strategy.', 'textarea'),
(@page_about, 'cta', 'button_text', 'Invite Tiffany to Speak →', 'text'),
(@page_about, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_about, 'cta', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 4. Hydrate Page 2: /services (8 Sections)
-- ==============================================================================
SET @page_services = (SELECT id FROM website_pages WHERE slug = 'services' LIMIT 1);

-- 01. Hero (services_hero / hero)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'hero', 'eyebrow', 'SERVICES & CAPABILITIES', 'text'),
(@page_services, 'hero', 'headline', 'Strategy with <span class="italic-accent text-gold">people at the center.</span>', 'html'),
(@page_services, 'hero', 'subtitle', 'From keynote stages to executive strategy, Tiffany Webb helps organizations bridge public health expertise, frontline reality, and actionable community impact.', 'textarea'),
(@page_services, 'hero', 'primary_cta_text', 'Work with Tiffany →', 'text'),
(@page_services, 'hero', 'primary_cta_url', '/work-with-tiffany', 'text'),
(@page_services, 'hero', 'section_is_active', '1', 'boolean');

-- 02. Four Capabilities (services_capabilities / capabilities)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'capabilities', 'eyebrow', 'FOUR SIGNATURE CAPABILITIES', 'text'),
(@page_services, 'capabilities', 'headline', 'How Tiffany Partners with Organizations', 'text'),
(@page_services, 'capabilities', 'closing_quote', 'I don\'t just tell you what to do next. I help you build how you get there.', 'text'),
(@page_services, 'capabilities', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_services, 'capabilities', 'strategic-advisor', 'Strategic Advisor', '01 // THINK', 'I challenge familiar thinking, uncover opportunities, and help leaders make clearer decisions around growth, engagement, innovation, and impact.<br/><br/><strong>Scope:</strong> Executive advisory, public health strategy, coalition alignment, prevention program roadmaps.', 1, 1),
(@page_services, 'capabilities', 'program-architect', 'Program Architect', '02 // BUILD', 'I turn ideas and community needs into structured programs, initiatives, experiences, partnerships, and implementation pathways.<br/><br/><strong>Scope:</strong> Curriculum design, screening workflow integration, campaign architecture, stakeholder coordination.', 2, 1),
(@page_services, 'capabilities', 'community-impact-strategist', 'Community Impact Strategist', '03 // CONNECT', 'Connects organizational goals with community realities, strengths, needs, and voices to create people-centered, outcome-focused strategies.<br/><br/><strong>Scope:</strong> Grassroots community engagement, health equity initiatives, ROSC council partnerships.', 3, 1),
(@page_services, 'capabilities', 'speaker-facilitator', 'Speaker & Facilitator', '04 // MOVE', 'I create conversations and learning experiences that challenge assumptions, elevate thinking, encourage dialogue, and move audiences toward action.<br/><br/><strong>Scope:</strong> Keynotes, breakout sessions, clinical trainings, interactive workshops.', 4, 1);

-- 03. The GEAR Method™ id="gear" (services_gear / gear)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'gear', 'section_anchor', 'gear', 'text'),
(@page_services, 'gear', 'eyebrow', 'SIGNATURE METHODOLOGY', 'text'),
(@page_services, 'gear', 'headline', 'The GEAR Method™', 'text'),
(@page_services, 'gear', 'standfirst', 'From awareness to action. From ideas to impact.', 'text'),
(@page_services, 'gear', 'description', 'The GEAR Method™ is a human-centered approach to helping organizations create strategies that connect with people, activate participation, and build meaningful pathways forward.', 'textarea'),
(@page_services, 'gear', 'footer_flow', 'AWARENESS → CONNECTION → ACTION → IMPACT', 'text'),
(@page_services, 'gear', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_services, 'gear_steps', 'G — Generate', 'Build Awareness & Understanding', 'Clarify the challenge, understand the audience, and make the issue visible and relevant before trying to solve it.', 1, 1),
(@page_services, 'gear_steps', 'E — Engage', 'Build Trust & Connection', 'Listen, strengthen relationships, and create opportunities for meaningful participation across diverse community groups.', 2, 1),
(@page_services, 'gear_steps', 'A — Activate', 'Move Ideas into Action', 'Turn insight into strategies, programs, experiences, partnerships, and practical next steps that stick.', 3, 1),
(@page_services, 'gear_steps', 'R — Resource', 'Build the Path Forward', 'Connect people and organizations with information, relationships, services, tools, and opportunities for sustained impact.', 4, 1);

-- 04. Speaking & Facilitation Teaser (services_speaking_teaser / speaking_teaser)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'speaking_teaser', 'eyebrow', 'SPEAKING & FACILITATION', 'text'),
(@page_services, 'speaking_teaser', 'headline', 'Conversations that <span class="italic-accent text-gold">create change.</span>', 'html'),
(@page_services, 'speaking_teaser', 'body_text', 'Twenty topics organized across four signature tracks — built for clinicians, educators, students, and community coalitions.', 'textarea'),
(@page_services, 'speaking_teaser', 'cta_text', 'Explore All 20 Speaking Topics →', 'text'),
(@page_services, 'speaking_teaser', 'cta_url', '/services/speaking-topics', 'text'),
(@page_services, 'speaking_teaser', 'section_is_active', '1', 'boolean');

-- 05. Engagement Formats (services_formats / formats)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'formats', 'eyebrow', 'ENGAGEMENT FORMATS', 'text'),
(@page_services, 'formats', 'headline', 'Ways we can work together.', 'text'),
(@page_services, 'formats', 'long_tail_line', 'Same expertise, shaped to fit your event — from a main-stage keynote to a full-day training.', 'text'),
(@page_services, 'formats', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_services, 'engagement_formats', 'Keynote Address', '45–60 Minutes · Main Stage', 'High-energy, transformative keynote designed to reframe gambling prevention, shift perspectives, and inspire collective action across large audiences.', 1, 1),
(@page_services, 'engagement_formats', 'Conference Session', '60–90 Minutes · Breakout', 'Focused deep-dive tailored to specific conference tracks with evidence-based frameworks and interactive audience Q&A.', 2, 1),
(@page_services, 'engagement_formats', 'Panel & Roundtable', '60–75 Minutes · Panelist or Moderator', 'Dynamic panelist or skilled moderator bringing frontline public health specificity, equity lens, and collaborative dialogue to complex issues.', 3, 1),
(@page_services, 'engagement_formats', 'School & University Program', 'Half-Day / Full-Day · Campus-Wide', 'Two-part structured delivery: student-focused awareness session addressing sports betting and app mechanics, followed by faculty and counselor workshop.', 4, 1),
(@page_services, 'engagement_formats', 'Clinical & Frontline Workshop', 'Half-Day to Multi-Day · Intensive', 'Hands-on training for healthcare providers, counselors, and ROSC staff covering screening protocols, brief intervention, and referral pathways.', 5, 1),
(@page_services, 'engagement_formats', 'Custom Strategy & Advisory', 'Multi-Session · Bespoke', 'Tailored consulting series, curriculum development, coalition strategic planning, or community campaign architecture.', 6, 1);

-- 06. What Working Together Looks Like (services_process / working_process)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'working_process', 'eyebrow', 'THE PROCESS', 'text'),
(@page_services, 'working_process', 'headline', 'What working together looks like.', 'text'),
(@page_services, 'working_process', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_services, 'working_steps', '01 // Pre-Event Consultation', 'Deep Listening', 'We begin with an alignment conversation to understand your audience, organizational goals, sensitive topics, and success metrics.', 1, 1),
(@page_services, 'working_steps', '02 // Content Built for Your Room', 'Custom Tailoring', 'Sessions are never generic. Every presentation, case study, and interactive prompt is customized specifically for your attendees.', 2, 1),
(@page_services, 'working_steps', '03 // Promotional & Production Assets', 'Seamless Coordination', 'Approved headshots, high-impact session abstracts, speaker bio kits, and promotional copy provided ready to use for your marketing team.', 3, 1),
(@page_services, 'working_steps', '04 // Post-Event Resources & Debrief', 'Lasting Action', 'Attendees receive actionable toolkits and screening templates. A post-event debrief ensures long-term follow-through and measurable impact.', 4, 1);

-- 07. FAQ (services_faqs / faqs) - Ships EMPTY
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'faqs', 'eyebrow', 'FREQUENTLY ASKED QUESTIONS', 'text'),
(@page_services, 'faqs', 'headline', 'Everything you need to know.', 'text'),
(@page_services, 'faqs', 'section_is_active', '0', 'boolean');

-- 08. Closing CTA (services_cta / cta)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'cta', 'headline', 'Bring Tiffany to your stage or team.', 'text'),
(@page_services, 'cta', 'button_text', 'Invite Tiffany to Speak →', 'text'),
(@page_services, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_services, 'cta', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 5. Hydrate Page 3: /services/speaking-topics (4 Sections, 20 Topics)
-- ==============================================================================
SET @page_topics = (SELECT id FROM website_pages WHERE slug = 'speaking-topics' LIMIT 1);

-- 01. Hero (speaking_topics_hero / hero)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_topics, 'hero', 'eyebrow', 'SPEAKING PORTFOLIO', 'text'),
(@page_topics, 'hero', 'headline', 'Conversations that <span class="italic-accent text-gold">create change.</span>', 'html'),
(@page_topics, 'hero', 'subtitle', 'Twenty topics across four tracks — practical enough to use on Monday, human enough that the room stays with her.', 'textarea'),
(@page_topics, 'hero', 'section_is_active', '1', 'boolean');

-- 02. Filter Bar (speaking_topics_filter / filter_bar)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_topics, 'filter_bar', 'eyebrow', 'TOPIC EXPLORER', 'text'),
(@page_topics, 'filter_bar', 'headline', 'Filter by Track & Target Audience', 'text'),
(@page_topics, 'filter_bar', 'section_is_active', '1', 'boolean');

-- 03. Speaking Topics Grid (speaking_topics_grid / grid)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_topics, 'grid', 'eyebrow', 'SIGNATURE TOPICS', 'text'),
(@page_topics, 'grid', 'headline', 'All 20 Speaking Topics', 'text'),
(@page_topics, 'grid', 'section_is_active', '1', 'boolean');

-- Exactly 20 Speaking Topics Across 4 Tracks
INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, category, link_url, content_html, sort_order, is_active) VALUES
-- Track 1: Prevention & Awareness (5 Topics) - Emerald #0E6B54
(@page_topics, 'topics_list', 'gambling-prevention-and-community-awareness', 'Gambling Prevention and Community Awareness', 'Track: Prevention & Awareness', '#0E6B54', 'Prevention & Awareness', '/work-with-tiffany?topic=Gambling+Prevention+and+Community+Awareness', '<strong>Audience:</strong> General public, community organizations, prevention specialists<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Introduction to how gambling harm develops, risk factors, and proactive steps before crisis. Ready-to-use community intervention tools.', 1, 1),
(@page_topics, 'topics_list', 'dont-bet-on-your-future-youth-focus', 'Don\'t Bet on Your Future (Youth Focus)', 'Track: Prevention & Awareness', '#0E6B54', 'Prevention & Awareness', '/work-with-tiffany?topic=Don%27t+Bet+on+Your+Future+%28Youth+Focus%29', '<strong>Audience:</strong> Students, youth groups, educators, parents<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Tackles sports-betting apps, gaming-to-gambling crossover, and peer dynamics without lecturing. Meets youth where they are.', 2, 1),
(@page_topics, 'topics_list', 'problem-gambling-awareness-month', 'Problem Gambling Awareness Month (March)', 'Track: Prevention & Awareness', '#0E6B54', 'Prevention & Awareness', '/work-with-tiffany?topic=Problem+Gambling+Awareness+Month+%28March%29', '<strong>Audience:</strong> General public, community stakeholders, advocacy groups<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Ready-to-deliver signature session for PGAM campaigns and community awareness moments. Shifts community perspective.', 3, 1),
(@page_topics, 'topics_list', 'national-screening-day', 'National Screening Day', 'Track: Prevention & Awareness', '#0E6B54', 'Prevention & Awareness', '/work-with-tiffany?topic=National+Screening+Day', '<strong>Audience:</strong> Health centers, prevention coalitions, public health<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> How screening works and how to integrate it into health settings without stigmatizing patients. Practical assessment tools.', 4, 1),
(@page_topics, 'topics_list', 'outreach-engaging-elected-officials-and-resolutions', 'Outreach: Engaging Elected Officials & Resolutions', 'Track: Prevention & Awareness', '#0E6B54', 'Prevention & Awareness', '/work-with-tiffany?topic=Outreach%3A+Engaging+Elected+Officials+%26+Resolutions', '<strong>Audience:</strong> Policy makers, government officials, advocates<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Moving prevention into policy attention, drafting resolutions, and engaging civic leaders to secure community resources.', 5, 1),

-- Track 2: Treatment & Recovery (8 Topics) - Gold #C8A24C
(@page_topics, 'topics_list', 'gambling-co-occurring-disorders-sud-workplace', 'Gambling & Co-Occurring Disorders: SUD & Workplace', 'Track: Treatment & Recovery', '#C8A24C', 'Treatment & Recovery', '/work-with-tiffany?topic=Gambling+%26+Co-Occurring+Disorders%3A+SUD+%26+Workplace', '<strong>Audience:</strong> Behavioral health professionals, HR, EAPs<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> The overlap of gambling with substance use and how it presents in workplace/EAP settings. Early identification protocols.', 6, 1),
(@page_topics, 'topics_list', 'the-changing-face-of-gambling-addiction', 'The Changing Face of Gambling Addiction', 'Track: Treatment & Recovery', '#C8A24C', 'Treatment & Recovery', '/work-with-tiffany?topic=The+Changing+Face+of+Gambling+Addiction', '<strong>Audience:</strong> Treatment providers, community leaders, advocates<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> How mobile apps and digital sports betting transformed addiction demographics and speed of onset across demographics.', 7, 1),
(@page_topics, 'topics_list', 'gambling-and-suicide', 'Gambling and Suicide', 'Track: Treatment & Recovery', '#C8A24C', 'Treatment & Recovery', '/work-with-tiffany?topic=Gambling+and+Suicide', '<strong>Audience:</strong> Mental health clinicians, crisis intervention workers<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Clinically grounded guidance on the high co-occurring suicide risks of gambling disorder and critical crisis intervention points.', 8, 1),
(@page_topics, 'topics_list', 'resources-self-exclusion', 'Resources: Self-Exclusion', 'Track: Treatment & Recovery', '#C8A24C', 'Treatment & Recovery', '/work-with-tiffany?topic=Resources%3A+Self-Exclusion', '<strong>Audience:</strong> Treatment providers, prevention specialists, agencies<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> How self-exclusion programs work, their limitations, and how to integrate them into wider recovery planning and family support.', 9, 1),
(@page_topics, 'topics_list', 'harm-reduction-strategies-for-problem-gambling', 'Harm Reduction Strategies for Problem Gambling', 'Track: Treatment & Recovery', '#C8A24C', 'Treatment & Recovery', '/work-with-tiffany?topic=Harm+Reduction+Strategies+for+Problem+Gambling', '<strong>Audience:</strong> Treatment providers, harm reduction advocates<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Meeting individuals where they are who are not yet ready for total abstinence. Pragmatic steps to reduce immediate financial and emotional harm.', 10, 1),
(@page_topics, 'topics_list', 'motivational-interviewing-tools', 'Motivational Interviewing Tools', 'Track: Treatment & Recovery', '#C8A24C', 'Treatment & Recovery', '/work-with-tiffany?topic=Motivational+Interviewing+Tools', '<strong>Audience:</strong> Counselors, peer specialists, social workers<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Hands-on skills practice applying motivational interviewing techniques to gambling disclosures and resistance.', 11, 1),
(@page_topics, 'topics_list', 'screening-and-prevention-in-healthcare', 'Screening and Prevention in Healthcare', 'Track: Treatment & Recovery', '#C8A24C', 'Treatment & Recovery', '/work-with-tiffany?topic=Screening+and+Prevention+in+Healthcare', '<strong>Audience:</strong> Primary care providers, social service agencies<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Practical toolkits for embedding gambling screening into routine health assessments and electronic medical records.', 12, 1),
(@page_topics, 'topics_list', 'guidelines-for-gambling-treatment-and-linkage', 'Guidelines for Gambling Treatment & Linkage', 'Track: Treatment & Recovery', '#C8A24C', 'Treatment & Recovery', '/work-with-tiffany?topic=Guidelines+for+Gambling+Treatment+%26+Linkage', '<strong>Audience:</strong> Behavioral health staff, recovery coaches<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Building warm-handoff referral pathways that patients actually follow through on. Overcoming stigma and systemic barriers.', 13, 1),

-- Track 3: Family & Community (4 Topics) - Coral #C15427
(@page_topics, 'topics_list', 'gambling-significant-others-and-impact', 'Gambling, Significant Others, and Impact', 'Track: Family & Community', '#C15427', 'Family & Community', '/work-with-tiffany?topic=Gambling%2C+Significant+Others%2C+and+Impact', '<strong>Audience:</strong> Families, peer support groups, counselors<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Addressing the financial, emotional, and relational trauma experienced by partners and immediate loved ones.', 14, 1),
(@page_topics, 'topics_list', 'the-link-between-gambling-domestic-violence-and-trauma', 'The Link Between Gambling, Domestic Violence & Trauma', 'Track: Family & Community', '#C15427', 'Family & Community', '/work-with-tiffany?topic=The+Link+Between+Gambling%2C+Domestic+Violence+%26+Trauma', '<strong>Audience:</strong> DV advocates, trauma specialists, social workers<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Evidence-informed exploration of intimate partner violence, chronic stress, and trauma intersections in problem gambling families.', 15, 1),
(@page_topics, 'topics_list', 'families-living-with-problem-gambling-coping-and-help', 'Families Living with Problem Gambling: Coping & Help', 'Track: Family & Community', '#C15427', 'Family & Community', '/work-with-tiffany?topic=Families+Living+with+Problem+Gambling%3A+Coping+%26+Help', '<strong>Audience:</strong> Family members, therapists, support networks<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Practical guidance: asset protection, boundary setting, and initiating healthy, constructive help-seeking conversations.', 16, 1),
(@page_topics, 'topics_list', 'gambling-harm-in-family-systems', 'Gambling Harm in Family Systems', 'Track: Family & Community', '#C15427', 'Family & Community', '/work-with-tiffany?topic=Gambling+Harm+in+Family+Systems', '<strong>Audience:</strong> Marriage & family therapists, social workers<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Systems-level look at how addiction alters family communication, financial stability, and long-term child development.', 17, 1),

-- Track 4: Creative Engagement (3 Topics) - Deep Violet #4A3B69
(@page_topics, 'topics_list', 'promotion-youth-art-competition', 'Promotion: Youth Art Competition', 'Track: Creative Engagement', '#4A3B69', 'Creative Engagement', '/work-with-tiffany?topic=Promotion%3A+Youth+Art+Competition', '<strong>Audience:</strong> Schools, art programs, youth organizations<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Using creative arts contests to engage youth in prevention without standard lectures. Fostering authentic youth voice.', 18, 1),
(@page_topics, 'topics_list', 'promotion-responsible-gifting', 'Promotion: Responsible Gifting', 'Track: Creative Engagement', '#4A3B69', 'Creative Engagement', '/work-with-tiffany?topic=Promotion%3A+Responsible+Gifting', '<strong>Audience:</strong> Parents, educators, community retailers<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Non-judgmental education on preventing lottery tickets and scratch-offs as gifts to minors during holiday seasons.', 19, 1),
(@page_topics, 'topics_list', 'gambling-prevention-and-rosc-council-engagement', 'Gambling Prevention & ROSC Council Engagement', 'Track: Creative Engagement', '#4A3B69', 'Creative Engagement', '/work-with-tiffany?topic=Gambling+Prevention+%26+ROSC+Council+Engagement', '<strong>Audience:</strong> ROSC members, recovery coalition directors<br/><strong>Session Length:</strong> [CONTENT-PENDING]<br/><strong>Summary:</strong> Integrating gambling prevention directly into Recovery Oriented Systems of Care. Expanding coalition capacity.', 20, 1);

-- 04. Topic CTA (speaking_topics_cta / cta)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_topics, 'cta', 'headline', 'Need a customized topic for your conference or team?', 'text'),
(@page_topics, 'cta', 'button_text', 'Request a Custom Session →', 'text'),
(@page_topics, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_topics, 'cta', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 6. Hydrate Page 4: /impact (8 Sections)
-- ==============================================================================
SET @page_impact = (SELECT id FROM website_pages WHERE slug = 'impact' LIMIT 1);

-- 01. Hero (impact_hero / hero)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'hero', 'eyebrow', 'COMMUNITY IMPACT', 'text'),
(@page_impact, 'hero', 'headline', 'Where the work <span class="italic-accent text-gold">has taken me.</span>', 'html'),
(@page_impact, 'hero', 'subtitle', 'Fifteen years of prevention work, measured in conversations started, systems changed, and communities that stopped waiting for permission to talk about this.', 'textarea'),
(@page_impact, 'hero', 'section_is_active', '1', 'boolean');

-- 02. Aggregate Band (impact_stats / stats) - Config-driven fallbacks
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'stats', 'eyebrow', 'AGGREGATE IMPACT', 'text'),
(@page_impact, 'stats', 'headline', 'By the Numbers', 'text'),
(@page_impact, 'stats', 'stat_1_value', '15+', 'text'),
(@page_impact, 'stats', 'stat_1_label', 'Years in Public Health', 'text'),
(@page_impact, 'stats', 'stat_2_value', '4,000+', 'text'),
(@page_impact, 'stats', 'stat_2_label', 'Hours of Frontline Outreach', 'text'),
(@page_impact, 'stats', 'stat_3_value', '20', 'text'),
(@page_impact, 'stats', 'stat_3_label', 'Signature Speaking Topics', 'text'),
(@page_impact, 'stats', 'section_is_active', '1', 'boolean');

-- 03. Upcoming Engagements (impact_upcoming / upcoming) - Ships EMPTY
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'upcoming', 'eyebrow', 'UPCOMING ENGAGEMENTS', 'text'),
(@page_impact, 'upcoming', 'headline', 'Where Tiffany is Speaking Next', 'text'),
(@page_impact, 'upcoming', 'empty_notice', 'Next speaking dates announced soon. In the meantime, get in touch to bring Tiffany to your event.', 'textarea'),
(@page_impact, 'upcoming', 'section_is_active', '0', 'boolean');

-- 04. Past Engagements Archive (impact_past / past) - Ships EMPTY
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'past', 'eyebrow', 'PAST ENGAGEMENTS', 'text'),
(@page_impact, 'past', 'headline', 'Selected Keynotes & Presentations', 'text'),
(@page_impact, 'past', 'empty_notice', 'Past engagement archive is currently being updated with recent keynotes and summits.', 'textarea'),
(@page_impact, 'past', 'section_is_active', '0', 'boolean');

-- 05. Outcome Stories (impact_stories / stories) - Ships EMPTY (3 slots)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'stories', 'eyebrow', 'OUTCOME STORIES', 'text'),
(@page_impact, 'stories', 'headline', 'Frontline Transformation', 'text'),
(@page_impact, 'stories', 'empty_notice', 'Outcome stories and case studies are currently being curated.', 'textarea'),
(@page_impact, 'stories', 'section_is_active', '0', 'boolean');

-- 06. Gambling Prevention Practice (impact_practice / practice)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'practice', 'eyebrow', 'PUBLIC HEALTH PRACTICE', 'text'),
(@page_impact, 'practice', 'headline', 'Prevention that meets people where they are.', 'text'),
(@page_impact, 'practice', 'body_text', 'Tiffany has spent fifteen years working in school gyms, clinic waiting rooms, church basements, and coalition halls. Her work establishes prevention in spaces standard campaigns never reach.', 'textarea'),
(@page_impact, 'practice', 'link_text', 'Read more about her specialism →', 'text'),
(@page_impact, 'practice', 'link_url', '/about#specialism', 'text'),
(@page_impact, 'practice', 'section_is_active', '1', 'boolean');

-- 07. Testimonials (impact_testimonials / testimonials) - Ships EMPTY
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'testimonials', 'eyebrow', 'WHAT LEADERS SAY', 'text'),
(@page_impact, 'testimonials', 'headline', 'Attendee & Organizer Feedback', 'text'),
(@page_impact, 'testimonials', 'empty_notice', 'Partner feedback and attendee testimonials are currently being curated.', 'textarea'),
(@page_impact, 'testimonials', 'section_is_active', '0', 'boolean');

-- 08. Closing CTA (impact_cta / cta)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'cta', 'headline', 'Bring this work to your community.', 'text'),
(@page_impact, 'cta', 'button_text', 'Invite Tiffany to Speak →', 'text'),
(@page_impact, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_impact, 'cta', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 7. Hydrate Page 5: /media (6 Sections)
-- ==============================================================================
SET @page_media = (SELECT id FROM website_pages WHERE slug = 'media' LIMIT 1);

-- 01. Hero (media_hero / hero)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_media, 'hero', 'eyebrow', 'MEDIA & PRESS', 'text'),
(@page_media, 'hero', 'headline', 'Ready for the room &mdash; <span class="italic-accent text-gold">and the story.</span>', 'html'),
(@page_media, 'hero', 'subtitle', 'Everything event organizers, journalists, and podcast hosts need to feature, interview, or introduce Tiffany Webb.', 'textarea'),
(@page_media, 'hero', 'section_is_active', '1', 'boolean');

-- 02. Downloads Asset Cards (media_downloads / downloads)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_media, 'downloads', 'eyebrow', 'PRESS DOWNLOADS', 'text'),
(@page_media, 'downloads', 'headline', 'Official Speaker Assets', 'text'),
(@page_media, 'downloads', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, link_url, sort_order, is_active) VALUES
(@page_media, 'media_downloads', 'Speaker One-Sheet', 'PDF Format · 1 Page', 'Single-page summary of keynotes, speaking topics, credentials, and booking details for event committees.', '/downloads/Tiffany_Webb_Speaker_One_Sheet.pdf', 1, 1),
(@page_media, 'media_downloads', 'Media Kit & Approved Headshots', 'ZIP Package · High Resolution', 'Print and digital resolution portraits, logo files, approved biography texts, and brand standards.', '/downloads/Tiffany_Webb_Media_Kit.zip', 2, 1),
(@page_media, 'media_downloads', 'Capability Prospectus', 'PDF Format · Multi-Page', 'In-depth overview of executive consulting formats, clinical training curricula, and community campaign architecture.', '/downloads/Tiffany_Webb_Capability_Prospectus.pdf', 3, 1);

-- 03. Bios in 3 Lengths (media_bios / bios) - Third-Person
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_media, 'bios', 'eyebrow', 'APPROVED BIOGRAPHIES', 'text'),
(@page_media, 'bios', 'headline', 'Bios in 3 Lengths (Third-Person)', 'text'),
(@page_media, 'bios', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, badge, content_html, sort_order, is_active) VALUES
(@page_media, 'media_bios', 'Short Bio (≈40 Words)', 'Program & Event App Listing', '40 Words', 'Tiffany Webb is a public-health educator and Community Impact Strategist with 15+ years and 4,000+ hours preventing gambling harm. She helps conferences, schools, and health systems turn hard conversations into action — with the cultural fluency to reach the people other programs miss.', 1, 1),
(@page_media, 'media_bios', 'Medium Bio (≈90 Words)', 'Introductions & Conference Programs', '90 Words', 'Tiffany Webb, BBA, MHP, is a Chicago-born public-health educator, gambling-prevention leader, and Community Impact Strategist with deep Louisiana roots. Over 15+ years and 4,000+ hours of frontline outreach, she has built coalitions, trained professionals, and led community screenings across Illinois — partnering with health systems, schools, government, and recovery organizations. A dynamic keynote speaker, panelist, and workshop facilitator, she makes difficult topics approachable and leaves organizations with practical tools. She is also the founder of GambleFreeGear, an awareness apparel brand built to \'Break the Silence\' on gambling addiction.', 2, 1),
(@page_media, 'media_bios', 'Long Bio (≈150 Words)', 'Press Releases & Full Keynote Introductions', '150 Words', 'Tiffany Webb, BBA, MHP, is a public-health educator, gambling-prevention leader, and Community Impact Strategist based in the Chicago area. Chicago-born and raised with deep Louisiana family roots, she blends behavioral-health expertise, bold community outreach, and entrepreneurial drive into a singular mission: no one should face gambling harm in silence. Across 15+ years and 4,000+ hours of prevention outreach, Tiffany has led community screenings, built coalitions, trained clinicians and frontline workers, and partnered with hospitals, schools, universities, government agencies, faith communities, and recovery organizations. As a keynote speaker, panelist, and workshop facilitator, she is known for making difficult topics approachable, leading with both heart and strategy, and equipping communities with practical tools. She is also the founder of GambleFreeGear, an awareness apparel brand on a mission to \'Break the Silence.\'', 3, 1);

-- 04. Introduction Script (media_intro_script / intro_script) - Third-Person
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_media, 'intro_script', 'eyebrow', 'STAGE INTRODUCTION', 'text'),
(@page_media, 'intro_script', 'headline', 'Official Stage Emcee Script', 'text'),
(@page_media, 'intro_script', 'read_time', '~60 Seconds', 'text'),
(@page_media, 'intro_script', 'script_text', 'Our next speaker has spent more than fifteen years and four thousand hours doing prevention work in the places it\'s hardest to do — schools, clinics, and community rooms across Illinois. She\'s a public-health educator, a Community Impact Strategist, and the founder of GambleFreeGear. She believes prevention begins with a conversation, and she\'s here to start one with us. Please welcome Tiffany Webb.', 'textarea'),
(@page_media, 'intro_script', 'section_is_active', '1', 'boolean');

-- 05. What She Can Speak To (media_talking_points / talking_points)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_media, 'talking_points', 'eyebrow', 'EXPERT COMMENTARY', 'text'),
(@page_media, 'talking_points', 'headline', 'What Tiffany Can Speak To', 'text'),
(@page_media, 'talking_points', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_media, 'media_talking_points', 'Sports-Betting Proliferation & Youth Gaming', 'Digital Mechanics', 'The hidden epidemic of sports-betting apps and gambling mechanics in youth video games and collegiate esports.', 1, 1),
(@page_media, 'media_talking_points', 'Culturally Rooted Outreach & Health Equity', 'Frontline Engagement', 'Why standard prevention campaigns fail underserved communities and what culturally rooted outreach requires.', 2, 1),
(@page_media, 'media_talking_points', 'Co-Occurring Disorders & Crisis Prevention', 'Clinical Overlap', 'The co-occurring overlap between problem gambling, substance use disorders, and acute suicide risk.', 3, 1),
(@page_media, 'media_talking_points', 'Harm-Reduction Protocols in Routine Care', 'Systems Integration', 'Practical harm-reduction strategies and integrating screening into routine clinical and social service workflows.', 4, 1),
(@page_media, 'media_talking_points', 'The Journey of GambleFreeGear', 'Social Enterprise', 'Building GambleFreeGear and turning personal conviction into visible, conversation-starting community action.', 5, 1);

-- 06. Media Inquiries CTA (media_cta / cta)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_media, 'cta', 'headline', 'Book an Interview or Podcast Feature', 'text'),
(@page_media, 'cta', 'button_text', 'Submit Media Request →', 'text'),
(@page_media, 'cta', 'button_url', '/work-with-tiffany?type=Media', 'text'),
(@page_media, 'cta', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 8. Hydrate Page 6: /work-with-tiffany (5 Sections)
-- ==============================================================================
SET @page_work = (SELECT id FROM website_pages WHERE slug = 'work-with-tiffany' LIMIT 1);

-- 01. Hero (booking_hero / hero)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_work, 'hero', 'eyebrow', 'LET\'S CREATE IMPACT TOGETHER', 'text'),
(@page_work, 'hero', 'headline', 'Bring Tiffany <span class="italic-accent text-gold">to your conversation.</span>', 'html'),
(@page_work, 'hero', 'subtitle', 'Tell us about your event, audience, and goals. Tiffany personally reviews every inquiry and responds within two business days.', 'textarea'),
(@page_work, 'hero', 'section_is_active', '1', 'boolean');

-- 02. The 9-Field Booking Form (booking_form / form)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_work, 'form', 'eyebrow', 'INQUIRY FORM', 'text'),
(@page_work, 'form', 'headline', 'Tell Us About Your Event', 'text'),
(@page_work, 'form', 'submit_btn_text', 'Submit Inquiry →', 'text'),
(@page_work, 'form', 'success_message', 'Thank you. Your inquiry has been received and Tiffany will review it personally.', 'textarea'),
(@page_work, 'form', 'section_is_active', '1', 'boolean');

-- 03. What Happens Next (booking_next_steps / what_happens_next)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_work, 'what_happens_next', 'eyebrow', 'NEXT STEPS', 'text'),
(@page_work, 'what_happens_next', 'headline', 'What happens next.', 'text'),
(@page_work, 'what_happens_next', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_work, 'booking_next_steps', '01 Review', 'Personal Evaluation', 'Tiffany personally evaluates fit, audience alignment, and schedule availability within 48 business hours.', 1, 1),
(@page_work, 'booking_next_steps', '02 Discovery', '15-Min Alignment Call', 'A 15-minute alignment conversation to understand your room dynamics, core objectives, and theme.', 2, 1),
(@page_work, 'booking_next_steps', '03 Proposal', 'Scope & Agreement', 'Clear written scope, presentation outline, logistics, and customized engagement agreement.', 3, 1),
(@page_work, 'booking_next_steps', '04 Delivery', 'Transformational Impact', 'A tailored, high-impact session that equips your room to take immediate, meaningful action.', 4, 1);

-- 04. FAQ (booking_faqs / faqs) - Ships EMPTY
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_work, 'faqs', 'eyebrow', 'QUESTIONS & ANSWERS', 'text'),
(@page_work, 'faqs', 'headline', 'Booking FAQs', 'text'),
(@page_work, 'faqs', 'section_is_active', '0', 'boolean');

-- 05. Alternative Contact (booking_alt_contact / alt_contact)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_work, 'alt_contact', 'eyebrow', 'DIRECT CONTACT', 'text'),
(@page_work, 'alt_contact', 'headline', 'Alternative Inquiries', 'text'),
(@page_work, 'alt_contact', 'email', 'booking@tiffanywebb.com', 'text'),
(@page_work, 'alt_contact', 'note', 'For direct correspondence, media inquiries, or urgent requests, email us directly at booking@tiffanywebb.com.', 'textarea'),
(@page_work, 'alt_contact', 'location', 'Based in Chicago Area, Illinois · Serving Nationwide.', 'text'),
(@page_work, 'alt_contact', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 9. Hydrate Page 7: /insights (3 Sections, 3 Seed Articles)
-- ==============================================================================
SET @page_insights = (SELECT id FROM website_pages WHERE slug = 'insights' LIMIT 1);

-- 01. Hero (insights_hero / hero)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_insights, 'hero', 'eyebrow', 'INSIGHTS & ARTICLES', 'text'),
(@page_insights, 'hero', 'headline', 'Thinking <span class="italic-accent text-gold">out loud.</span>', 'html'),
(@page_insights, 'hero', 'subtitle', 'Notes from the frontline of prevention — on gambling harm, public health, and the conversations that change communities.', 'textarea'),
(@page_insights, 'hero', 'section_is_active', '1', 'boolean');

-- 02. Article Grid (insights_grid / grid)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_insights, 'grid', 'eyebrow', 'RECENT ESSAYS', 'text'),
(@page_insights, 'grid', 'headline', 'Perspectives on Prevention & Equity', 'text'),
(@page_insights, 'grid', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, category, link_url, image_url, content_html, sort_order, is_active) VALUES
(@page_insights, 'articles', 'what-gambling-prevention-actually-looks-like', 'What Gambling Prevention Actually Looks Like', 'Prevention · August 2026', '5 min read', 'Prevention', '/insights/what-gambling-prevention-actually-looks-like', '/assets/thumb_3.jpg', '<p class="lead">Most prevention campaigns are designed for people who are already looking. Here\'s what reaching everyone else requires.</p><p>When we treat prevention as a billboard or a compliance pamphlet, we miss the people who need it most before a crisis unfolds. Over fifteen years of frontline outreach in Chicago and across the country have taught me that prevention is not an information campaign — it is a relationship of trust.</p><p>True public health prevention meets people in gymnasiums, community clinics, church basements, and barbershops. It gives families language for what they are experiencing before debt or despair takes over.</p>', 1, 1),
(@page_insights, 'articles', 'dont-bet-on-your-future-youth-prevention', 'Don\'t Bet on Your Future: Why Youth Prevention Starts With a Conversation', 'Youth Prevention · July 2026', '5 min read', 'Youth Prevention', '/insights/dont-bet-on-your-future-youth-prevention', '/assets/thumb_1.jpg', '<p class="lead">Sports betting reached young people faster than prevention did. Here\'s how schools and parents can catch up.</p><p>Today\'s youth are exposed to micro-betting mechanics in video games and seamless mobile sportsbooks directly in their pockets. By the time many reach college campuses, betting has been normalized as simple fandom.</p><p>To protect the next generation, we cannot rely on outdated lectures. We must facilitate open, culturally resonant conversations that deconstruct the algorithms and marketing designed to capture their attention.</p>', 2, 1),
(@page_insights, 'articles', 'the-communities-prevention-reaches-last', 'The Communities Prevention Reaches Last', 'Health Equity · June 2026', '4 min read', 'Health Equity', '/insights/the-communities-prevention-reaches-last', '/assets/thumb_2.jpg', '<p class="lead">Gambling harm doesn\'t fall evenly across communities. Neither does prevention. That gap is a design choice, not an accident.</p><p>Research repeatedly shows that underserved and marginalized communities bear the brunt of predatory gambling expansion, yet public health resources and treatment beds are consistently placed out of reach.</p><p>Bridging this divide requires equipping local ROSC councils, faith institutions, and grassroots leaders with culturally fluent screening tools and sustainable community funding.</p>', 3, 1);

-- 03. CTA (insights_cta / cta)
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_insights, 'cta', 'headline', 'Stay connected with new perspectives.', 'text'),
(@page_insights, 'cta', 'subtitle', 'Join leaders and advocates receiving frontline insights on prevention and community impact.', 'textarea'),
(@page_insights, 'cta', 'button_text', 'Work With Tiffany →', 'text'),
(@page_insights, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_insights, 'cta', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 10. Hydrate Home Page & Core Global Elements
-- ==============================================================================
SET @page_home = (SELECT id FROM website_pages WHERE slug = 'home' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_home, 'hero', 'eyebrow', 'CHICAGO HEART — LOUISIANA SOUL', 'text'),
(@page_home, 'hero', 'headline', 'Where Frontline Reality Meets <span class="italic-accent text-gold">Strategic Impact.</span>', 'html'),
(@page_home, 'hero', 'subtitle', 'Tiffany Webb, BBA, MHP, bridges 15+ years of behavioral health expertise and frontline community outreach to transform how organizations approach gambling prevention and public health equity.', 'textarea'),
(@page_home, 'hero', 'hero_image', '/images/tiffany_about_new.jpg', 'image'),
(@page_home, 'hero', 'cta_text', 'Invite Tiffany to Speak →', 'text'),
(@page_home, 'hero', 'cta_url', '/work-with-tiffany', 'text'),
(@page_home, 'hero', 'secondary_cta_text', 'Explore Services →', 'text'),
(@page_home, 'hero', 'secondary_cta_url', '/services', 'text'),
(@page_home, 'hero', 'section_is_active', '1', 'boolean'),

(@page_home, 'meet_tiffany', 'eyebrow', 'MEET TIFFANY WEBB', 'text'),
(@page_home, 'meet_tiffany', 'headline', 'Expertise that <span class="italic-accent text-gold">moves people.</span>', 'html'),
(@page_home, 'meet_tiffany', 'quote', 'When we rise, we rise together.', 'text'),
(@page_home, 'meet_tiffany', 'body_p1', 'Chicago-born and raised with deep Louisiana family roots, Tiffany brings authentic warmth, unwavering directness, and 15+ years of frontline expertise to national stages and executive advisory rooms.', 'textarea'),
(@page_home, 'meet_tiffany', 'body_p2', 'She has led community screenings, built multi-agency coalitions, and trained healthcare professionals across the nation — transforming complex public health challenges into actionable community impact.', 'textarea'),
(@page_home, 'meet_tiffany', 'cta_text', 'Read Her Full Story →', 'text'),
(@page_home, 'meet_tiffany', 'cta_url', '/about', 'text'),
(@page_home, 'meet_tiffany', 'section_is_active', '1', 'boolean'),

(@page_home, 'footer', 'copyright', '© 2026 Tiffany Webb. All rights reserved.', 'text'),
(@page_home, 'footer', 'tagline', 'Chicago Heart — Louisiana Soul · Serving Nationally', 'text'),
(@page_home, 'footer', 'email', 'booking@tiffanywebb.com', 'text'),
(@page_home, 'footer', 'location', 'Chicago, IL · Available Nationally', 'text'),
(@page_home, 'footer', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, title, subtitle, sort_order, is_active) VALUES
(@page_home, 'impact_band', '15+ Years', 'Public Health Leadership', 1, 1),
(@page_home, 'impact_band', '4,000+ Hours', 'Frontline Outreach', 2, 1),
(@page_home, 'impact_band', '20 Topics', 'Signature Speaking Portfolio', 3, 1),
(@page_home, 'credibility_bar', 'Healthcare Systems', 'Clinical Partnerships', 1, 1),
(@page_home, 'credibility_bar', 'Colleges & Universities', 'Campus Prevention', 2, 1),
(@page_home, 'credibility_bar', 'ROSC Councils', 'Recovery Coalitions', 3, 1),
(@page_home, 'credibility_bar', 'Municipal Agencies', 'Policy & Health Depts', 4, 1);
