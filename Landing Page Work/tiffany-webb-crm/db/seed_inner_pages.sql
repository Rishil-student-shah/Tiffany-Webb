-- ==============================================================================
-- Tiffany Webb Master Database Seeder: All 7 Inner Pages + Home Page
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- ==============================================================================

-- 1. Ensure Website Pages
INSERT INTO website_pages (slug, name, meta_title, meta_description, is_active) VALUES
('home', 'Home', 'Tiffany Webb | Community Impact Strategist & Public Health Educator', 'Chicago Heart — Louisiana Soul. 15+ years and 4,000+ hours of frontline behavioral health and gambling harm prevention.', 1),
('about', 'About Tiffany', 'About Tiffany Webb | Chicago Heart — Louisiana Soul', 'Community Impact Strategist, Public Health Educator & Speaker with 15+ years and 4,000+ hours preventing gambling harm.', 1),
('services', 'Services & Capabilities', 'Services & Capabilities | Tiffany Webb', 'Strategy with people at the center. Strategic Advisory, Program Architecture, Community Impact, and Speaking.', 1),
('speaking-topics', 'Speaking Topics', '21 Speaking Topics | Tiffany Webb', 'Explore 21 signature speaking topics across 4 tracks: Prevention, Outreach, Systems, and Youth & Leadership.', 1),
('impact', 'Impact & Engagements', 'Community Impact | Tiffany Webb', 'Where frontline experience creates documented impact. Fifteen years of frontline public health education and community impact.', 1),
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
DELETE FROM speaking_topics;

-- ==============================================================================
-- 3. Hydrate Speaking Topics Table (All 21 Topics Across 4 Approved Tracks)
-- ==============================================================================
INSERT INTO speaking_topics (track_id, track_name, topic_number, title, subtitle, format_badge, description, target_audience, learning_objectives, is_flagship, sort_order, is_active) VALUES
-- Track 1: Prevention, Gambling & Emerging Risk (5 Topics)
(1, 'Prevention, Gambling & Emerging Risk', 1, 'Gambling Prevention & Community Awareness', 'Early Warning Signs & Proactive Frameworks', 'Keynote / Breakout', 'An accessible, evidence-based introduction to how gambling harm develops at community scale, identifying early warning signs before crisis.', 'General Public, Healthcare Systems, Prevention Coalitions', 'Identify early behavioral indicators; deploy community awareness models; reduce stigma in public dialogue.', FALSE, 1, TRUE),
(1, 'Prevention, Gambling & Emerging Risk', 2, 'From Fun to Crisis: Gambling Prevention & Education', 'Clinical Escalation & Healthcare Intervention', 'Keynote / Breakout', 'Understanding the rapid escalation from recreational gambling to severe disorder, equipping clinical and frontline teams with proactive prevention protocols.', 'Healthcare Systems & Clinical Teams', 'Map clinical escalation timelines; conduct rapid risk assessments; establish clear healthcare referral pathways.', FALSE, 2, TRUE),
(1, 'Prevention, Gambling & Emerging Risk', 3, 'Don\'t Bet on Your Future (Youth Focus)', 'Digital Gambling, Sports Betting & Esports', 'Workshop / Assembly', 'Addresses sports-betting apps, digital micro-transactions, gaming crossover, and peer dynamics without lecturing or judgment.', 'Students, Youth Groups, Educators & Coaches', 'Deconstruct predatory app mechanics; cultivate healthy digital boundaries; build youth refusal assertiveness.', FALSE, 3, TRUE),
(1, 'Prevention, Gambling & Emerging Risk', 4, 'Problem Gambling Awareness Month (PGAM)', 'Signature Campaigns for National Moments', 'Campaign Keynote', 'A ready-to-deliver signature session for national awareness campaigns, driving sustained civic engagement and stigma reduction.', 'Community Stakeholders & Advocacy Partners', 'Organize effective PGAM campaigns; engage civic partners; measure community reach and impact.', FALSE, 4, TRUE),
(1, 'Prevention, Gambling & Emerging Risk', 5, 'National Screening Day & Protocols', 'Integrating Validated Screens in Health Settings', 'Clinical Workshop', 'Practical toolkits for embedding 3-question screening (NODS-CLiP) into primary care workflows and electronic health records.', 'Community Health Centers, Clinics & Hospitals', 'Administer 3-minute validated screens; interpret risk scores; integrate into electronic intake forms.', FALSE, 5, TRUE),

-- Track 2: Community Engagement & Outreach (5 Topics)
(2, 'Community Engagement & Outreach', 6, 'The 8 Touchpoints to Engagement', 'Frontline Framework for Hard-to-Reach Communities', 'Strategy Workshop', 'A proprietary framework for activating hard-to-reach populations, building lasting grassroots trust, and moving community voice into action.', 'ROSC Councils, Coalitions & Community Organizers', 'Deploy the 8 Touchpoints methodology; foster multi-generational community trust; turn community voice into policy action.', FALSE, 6, TRUE),
(2, 'Community Engagement & Outreach', 7, 'Outreach: Engaging Elected Officials & Resolutions', 'Moving Prevention into Civic Policy Attention', 'Policy Workshop', 'How to build sustainable partnerships with civic leaders, draft impactful municipal resolutions, and secure dedicated public health resources.', 'Civic Leaders, Municipalities & Policy Makers', 'Draft municipal and county resolutions; craft executive policy briefings; secure sustainable prevention funding.', FALSE, 7, TRUE),
(2, 'Community Engagement & Outreach', 8, 'Faith Communities as Frontline Prevention Partners', 'Mobilizing Pastoral Networks & Stigma-Free Sanctuaries', 'Interactive Forum', 'Mobilizing faith institutions to provide safe, stigma-free havens and early referral connections for impacted families.', 'Faith Leaders, Pastoral Counselors & Ministry Teams', 'Equip spiritual leaders with prevention literacy; establish safe reporting spaces; link congregants to care.', FALSE, 8, TRUE),
(2, 'Community Engagement & Outreach', 9, 'Culturally Grounded Stigma Reduction in Communities of Color', 'Health Equity & Culturally Fluent Public Health', 'Keynote / Workshop', 'Overcoming historical healthcare distrust and cultural barriers to deliver interventions that authentically resonate with diverse populations.', 'Grassroots Leaders & Health Equity Advocates', 'Deconstruct cultural barriers to care; design culturally attuned outreach assets; build lasting neighborhood alliances.', FALSE, 9, TRUE),
(2, 'Community Engagement & Outreach', 10, 'Creative Arts & Youth Prevention: Beyond the Brochure', 'Creative Expression as a Preventive Shield', 'Interactive Workshop', 'Leveraging creative arts contests, storytelling, and digital media to engage youth in prevention without standard lectures.', 'Schools, Art Educators & Youth Organizations', 'Design youth arts prevention campaigns; empower student-led messaging; measure creative outreach engagement.', FALSE, 10, TRUE),

-- Track 3: Human-Centered Systems & Services (6 Topics)
(3, 'Human-Centered Systems & Services', 11, 'Gambling & Co-Occurring Disorders: SUD & Workplace', 'Clinical Overlap & Workplace Risk Management', 'Professional Training', 'Clinical overlap between gambling harm, substance use disorders, and workplace risk indicators, facilitating early EAP interventions.', 'Behavioral Health Professionals & HR/EAPs', 'Identify co-occurring SUD presentations; structure EAP referral pipelines; establish workplace protective policies.', FALSE, 11, TRUE),
(3, 'Human-Centered Systems & Services', 12, 'The G.E.A.R. Model: From Awareness to Referral', 'System Architecture & Implementation Pathways', 'Executive Advisory / Training', 'Operationalizing Tiffany\'s GEAR Method™ (Generate, Engage, Activate, Resource) to build seamless screening-to-referral ecosystems.', 'System Architects, Health Networks & Agencies', 'Implement the GEAR framework across departments; streamline warm handoffs; eliminate systemic care drop-offs.', FALSE, 12, TRUE),
(3, 'Human-Centered Systems & Services', 13, 'The Changing Face of Gambling Addiction', 'Mobile Apps, Micro-Betting & Demographic Shifts', 'Keynote / Training', 'Analyzing how mobile sportsbook apps and algorithmic gambling transformed addiction onset speed, demographics, and clinical presentation.', 'Treatment Providers & Healthcare Leadership', 'Examine algorithmic betting mechanics; adapt treatment models for digital natives; address surging young adult intake.', FALSE, 13, TRUE),
(3, 'Human-Centered Systems & Services', 14, 'Gambling & Suicide: Clinical Interventions', 'Lethality Assessment & Acute Crisis Management', 'Clinical Intensive', 'Clinically grounded guidance on the elevated suicide risk in gambling disorder, lethality screening, and emergency crisis protocols.', 'Mental Health Clinicians & Crisis Intervention Teams', 'Recognize acute gambling-induced crisis markers; apply specialized safety plans; coordinate rapid multi-disciplinary crisis care.', FALSE, 14, TRUE),
(3, 'Human-Centered Systems & Services', 15, 'Resources & Self-Exclusion Systems', 'Voluntary Exclusions, Regulatory Toolkits & Limitations', 'Professional Seminar', 'Navigating state and venue self-exclusion frameworks, analyzing their limitations, and embedding them into holistic family recovery plans.', 'Treatment Providers & Regulatory Agencies', 'Guide clients through self-exclusion enrollment; counsel families on realistic safety boundaries; integrate with aftercare.', FALSE, 15, TRUE),
(3, 'Human-Centered Systems & Services', 16, 'Harm Reduction Strategies for Problem Gambling', 'Pragmatic Steps for Financial & Emotional Safeguards', 'Clinical Workshop', 'Pragmatic harm-reduction approaches: financial safeguards, limit-setting tools, and risk mitigation when individuals are not ready for total abstinence.', 'Harm Reduction Advocates & Outreach Specialists', 'Implement financial safety nets; coach individuals on harm-minimization tools; sustain therapeutic rapport without shaming.', FALSE, 16, TRUE),

-- Track 4: Purpose, Leadership & Youth Impact (5 Topics)
(4, 'Purpose, Leadership & Youth Impact', 17, 'Motivational Interviewing in Gambling Conversations', 'Frontline Dialogue Tools for Overcoming Resistance', 'Skills Lab', 'Hands-on practice applying motivational interviewing to gambling disclosures, resolving ambivalence, and guiding client-led change.', 'Counselors, Case Managers & Social Workers', 'Master OARS conversational tools for gambling; de-escalate defensiveness; elicit authentic internal motivation.', FALSE, 17, TRUE),
(4, 'Purpose, Leadership & Youth Impact', 18, 'The Hidden Toll: Impact on Significant Others & Families', 'Family Systems, Secondary Trauma & Boundary Setting', 'Keynote / Workshop', 'Addressing the emotional, financial, and relational trauma carried by spouses and loved ones living with hidden addiction.', 'Families, Support Groups & Marriage Therapists', 'Identify secondary trauma symptoms in family units; implement legal and financial safety walls; rebuild emotional resilience.', FALSE, 18, TRUE),
(4, 'Purpose, Leadership & Youth Impact', 19, 'Break the Silence: Prevention Begins with a Conversation', 'Tiffany\'s Signature Flagship Keynote Experience', 'Flagship Keynote', 'Tiffany\'s signature flagship keynote on transforming hidden harm into collective action, deconstructing stigma, and inspiring systemic change.', 'Conferences, All Audiences & Leadership', 'Break the silence surrounding hidden behavioral addiction; foster cultures of open dialogue; mobilize collective prevention.', TRUE, 19, TRUE),
(4, 'Purpose, Leadership & Youth Impact', 20, 'Healthy Gaming & Sports: Youth Digital Safeguards', 'Resilience, Digital Well-being & Athletic Leadership', 'Youth Program / Workshop', 'Empowering students and young athletes to navigate modern digital gaming, sports betting advertisements, and peer pressures with resilience.', 'Schools & Youth Organizations', 'Differentiate recreational gaming from gambling traps; cultivate digital boundary skills; champion positive peer leadership.', FALSE, 20, TRUE),
(4, 'Purpose, Leadership & Youth Impact', 21, 'GambleFreeGear: Turning Awareness into Daily Culture', 'Wearable Advocacy & Cultural Normalization', 'Keynote / Innovation Talk', 'The story and strategy behind wearable advocacy: how apparel turns prevention into an everyday cultural conversation before crisis strikes.', 'Social Entrepreneurs, Coalitions & Advocates', 'Leverage physical products as conversational catalysts; build grassroots community ambassadors; scale social enterprise impact.', FALSE, 21, TRUE);


-- ==============================================================================
-- 4. Hydrate Page 1: / (Home Page)
-- ==============================================================================
SET @page_home = (SELECT id FROM website_pages WHERE slug = 'home' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_home, 'hero', 'eyebrow', 'COMMUNITY IMPACT STRATEGIST · SPEAKER', 'text'),
(@page_home, 'hero', 'headline', 'Bold ideas.<br/>Human connection.<br/><span class="italic-accent">Meaningful impact.</span>', 'html'),
(@page_home, 'hero', 'subtitle', 'Tiffany Webb helps healthcare and community leaders think bigger about impact. She brings lived understanding, professional expertise, and community insight together to challenge convention, reimagine what\'s possible, and build bold strategies that help organizations—and the people, families, and communities they serve—thrive.', 'textarea'),
(@page_home, 'hero', 'meta', 'TIFFANY WEBB', 'text'),
(@page_home, 'hero', 'formats', 'SPEAKING · STRATEGY · PUBLIC & BEHAVIORAL HEALTH · COMMUNITY ENGAGEMENT · PROGRAM DEVELOPMENT', 'text'),
(@page_home, 'hero', 'hero_image', '/uploads/1788292745245-402206905-tiffany-crop-1788292742938.png', 'image'),
(@page_home, 'hero', 'hero_frame_style', 'shape-hero-arch', 'text'),
(@page_home, 'hero', 'show_reel_btn', '1', 'text'),
(@page_home, 'hero', 'section_is_active', '1', 'boolean'),

(@page_home, 'meet_tiffany', 'eyebrow', 'MEET TIFFANY WEBB', 'text'),
(@page_home, 'meet_tiffany', 'headline', 'Expertise that <span class="italic-accent">moves people.</span>', 'html'),
(@page_home, 'meet_tiffany', 'quote', 'When we rise, we rise together.', 'text'),
(@page_home, 'meet_tiffany', 'body_p1', 'Chicago-born and raised with deep Louisiana family roots, Tiffany brings authentic warmth, unwavering directness, and 15+ years of frontline expertise to national stages and executive advisory rooms.', 'textarea'),
(@page_home, 'meet_tiffany', 'body_p2', 'She has led community screenings, built multi-agency coalitions, and trained healthcare professionals across the nation — transforming complex public health challenges into actionable community impact.', 'textarea'),
(@page_home, 'meet_tiffany', 'cta_text', 'Read Her Full Story →', 'text'),
(@page_home, 'meet_tiffany', 'cta_url', '/about', 'text'),
(@page_home, 'meet_tiffany', 'section_is_active', '1', 'boolean'),

(@page_home, 'who_can_benefit', 'eyebrow', 'WHO CAN BENEFIT FROM TIFFANY\'S WORK?', 'text'),
(@page_home, 'who_can_benefit', 'headline', 'For leaders ready to <span class="italic-accent">rethink what\'s possible.</span>', 'html'),
(@page_home, 'who_can_benefit', 'body_1', 'Tiffany works with leaders and organizations navigating growth, change, engagement, and community impact. She brings a human-centered perspective to complex challenges—helping organizations understand the people they serve, rethink familiar approaches, and build strategies designed for meaningful, sustainable impact.', 'textarea'),
(@page_home, 'who_can_benefit', 'section_is_active', '1', 'boolean'),

(@page_home, 'expertise', 'eyebrow', 'HOW TO WORK WITH HER', 'text'),
(@page_home, 'expertise', 'headline', 'Six ways to <span class="italic-accent">bring her in.</span>', 'html'),
(@page_home, 'expertise', 'subtext', 'Same expertise, shaped to fit your event — from a main-stage keynote to a full-day training.', 'textarea'),
(@page_home, 'expertise', 'section_is_active', '1', 'boolean'),

(@page_home, 'speaking', 'eyebrow', 'SPEAKING TRACKS', 'text'),
(@page_home, 'speaking', 'headline', 'What she <span class="italic-accent">speaks about.</span>', 'html'),
(@page_home, 'speaking', 'subtext', 'Twenty topics across four tracks — practical enough to use on Monday, human enough that the room stays with her.', 'textarea'),
(@page_home, 'speaking', 'section_is_active', '1', 'boolean'),

(@page_home, 'video_reels', 'eyebrow', 'IN THE ROOM', 'text'),
(@page_home, 'video_reels', 'headline', 'Watch Tiffany <span class="italic-accent">in action.</span>', 'html'),
(@page_home, 'video_reels', 'description', 'See how she commands the room, breaks down complex topics, and connects with audiences of all sizes. From intimate workshops to national keynotes, the message remains clear and the impact remains real.', 'textarea'),
(@page_home, 'video_reels', 'section_is_active', '1', 'boolean'),

(@page_home, 'proof', 'eyebrow', 'PROOF OF IMPACT', 'text'),
(@page_home, 'proof', 'headline', 'Credibility <span class="italic-accent">you can feel.</span>', 'html'),
(@page_home, 'proof', 'section_is_active', '1', 'boolean'),

(@page_home, 'events', 'eyebrow', 'STAGES & IMPACT', 'text'),
(@page_home, 'events', 'headline', 'Where the work <span class="italic-accent">has taken me.</span>', 'html'),
(@page_home, 'events', 'btn_text', 'START A CONVERSATION', 'text'),
(@page_home, 'events', 'btn_link', '/work-with-tiffany', 'text'),
(@page_home, 'events', 'link_text', 'See the full picture', 'text'),
(@page_home, 'events', 'section_is_active', '1', 'boolean'),

(@page_home, 'media', 'headline', 'Ready for the room <span class="italic-accent">and the story.</span>', 'html'),
(@page_home, 'media', 'link_1', 'Download the speaker sheet', 'text'),
(@page_home, 'media', 'link_2', 'Media resources', 'text'),
(@page_home, 'media', 'section_is_active', '1', 'boolean'),

(@page_home, 'proof_testimonials', 'eyebrow', 'TESTIMONIALS & FEEDBACK', 'text'),
(@page_home, 'proof_testimonials', 'headline', 'Words from the <span class="italic-accent">people in the room.</span>', 'html'),
(@page_home, 'proof_testimonials', 'description', 'What conference organizers, coalition leaders, and clinical directors say about working with Tiffany.', 'textarea'),
(@page_home, 'proof_testimonials', 'section_is_active', '0', 'boolean'),

(@page_home, 'booking', 'eyebrow', 'START A CONVERSATION', 'text'),
(@page_home, 'booking', 'headline', 'Let\'s create <span class="italic-accent">impact together.</span>', 'html'),
(@page_home, 'booking', 'subtext', 'Tell me about your organization and what you\'re trying to change. I read every inquiry myself.', 'textarea'),
(@page_home, 'booking', 'section_is_active', '1', 'boolean');

-- Home Collections
INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, icon_svg, link_url, image_url, content_html, sort_order, is_active) VALUES
-- Impact Band (4 Value Pillars)
(@page_home, 'impact_band', 'people-center', 'PEOPLE AT THE CENTER', '', 'VALUE PILLAR', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', NULL, NULL, NULL, 1, 1),
(@page_home, 'impact_band', 'families-strengthened', 'FAMILIES STRENGTHENED', '', 'VALUE PILLAR', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>', NULL, NULL, NULL, 2, 1),
(@page_home, 'impact_band', 'communities-empowered', 'COMMUNITIES EMPOWERED', '', 'VALUE PILLAR', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>', NULL, NULL, NULL, 3, 1),
(@page_home, 'impact_band', 'impact-lasts', 'IMPACT THAT LASTS', '', 'VALUE PILLAR', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>', NULL, NULL, NULL, 4, 1),

-- Credibility Bar (3 Stat Numbers)
(@page_home, 'credibility_bar', 'stat-1', '15+', 'YEARS OF EXPERIENCE', 'EXPERIENCE', NULL, NULL, NULL, NULL, 1, 1),
(@page_home, 'credibility_bar', 'stat-2', '50+', 'WORKSHOPS · PRESENTATIONS · ACTIVATIONS', 'ENGAGEMENTS', NULL, NULL, NULL, NULL, 2, 1),
(@page_home, 'credibility_bar', 'stat-3', '100+', 'COMMUNITY PARTNERS & COLLABORATIONS', 'PARTNERS', NULL, NULL, NULL, NULL, 3, 1),

-- Expertise (6 Format Cards)
(@page_home, 'expertise', 'keynote', 'Keynote', 'Main Stage · 45–60 Mins', '01 // SIGNATURE', NULL, '/work-with-tiffany?format=Keynote', NULL, 'High-energy opening or closing address setting the vision for prevention, health equity, and human-centered community impact.', 1, 1),
(@page_home, 'expertise', 'conference-session', 'Conference Session', 'Breakout & Deep Dive · 60–90 Mins', '02 // BREAKOUT', NULL, '/work-with-tiffany?format=Conference+Session', NULL, 'Focused technical session equipping clinicians, counselors, and educators with actionable Monday-morning tools.', 2, 1),
(@page_home, 'expertise', 'panel', 'Panel', 'Panelist or Moderator · 45–75 Mins', '03 // DIALOGUE', NULL, '/work-with-tiffany?format=Panel', NULL, 'Facilitating deep, authentic conversations that elevate community voice, resolve complex tensions, and bridge stakeholder perspectives.', 3, 1),
(@page_home, 'expertise', 'school-university', 'School & University', 'Campus-Wide · Half-Day / Full-Day', '04 // YOUTH & CAMPUS', NULL, '/work-with-tiffany?format=School+or+University+Event', NULL, 'Engaging assemblies, student-athlete workshops, and staff trainings addressing mobile sports betting and digital well-being.', 4, 1),
(@page_home, 'expertise', 'workshops-training', 'Workshops & Training', 'Clinical & Frontline · Half-Day to Multi-Day', '05 // INTENSIVE', NULL, '/work-with-tiffany?format=Workshop+or+Training', NULL, 'Intensive clinical toolkits and continuing education on screening protocols (NODS-CLiP) and operationalizing the GEAR Method™.', 5, 1),
(@page_home, 'expertise', 'strategic-advisory', 'Strategic Advisory', 'Executive Consulting · Multi-Session', '06 // EXECUTIVE', NULL, '/work-with-tiffany?format=Strategic+Consulting+or+Advisory', NULL, 'Advising healthcare executives, municipal health agencies, and ROSC coalitions on sustainable community prevention architecture.', 6, 1),

-- Who Can Benefit (8 Audience Cards)
(@page_home, 'who_can_benefit', 'healthcare-leaders', 'Healthcare Leaders & Clinical Networks', 'Clinical Teams', '01 // HEALTHCARE', NULL, '/work-with-tiffany?audience=Healthcare', NULL, 'Hospital systems, primary care networks, behavioral health clinics, and treatment providers integrating validated screening protocols.', 1, 1),
(@page_home, 'who_can_benefit', 'municipal-agencies', 'Municipal Agencies & Public Health Departments', 'Public Health', '02 // CIVIC', NULL, '/work-with-tiffany?audience=Municipal', NULL, 'City and county health agencies seeking data-driven, culturally grounded community wellness initiatives.', 2, 1),
(@page_home, 'who_can_benefit', 'rosc-councils', 'ROSC Councils & Recovery Coalitions', 'Community Recovery', '03 // RECOVERY', NULL, '/work-with-tiffany?audience=ROSC', NULL, 'Recovery Oriented Systems of Care councils connecting prevention to grassroots harm reduction and care linkage.', 3, 1),
(@page_home, 'who_can_benefit', 'colleges-universities', 'Colleges, Universities & Athletic Programs', 'Higher Education', '04 // CAMPUS', NULL, '/work-with-tiffany?audience=Higher+Ed', NULL, 'Campus wellness centers, athletic departments, and student organizations addressing digital gaming and betting pressures.', 4, 1),
(@page_home, 'who_can_benefit', 'faith-based-networks', 'Faith-Based Networks & Community Nonprofits', 'Grassroots Coalitions', '05 // FAITH & CIVIC', NULL, '/work-with-tiffany?audience=Faith-Based', NULL, 'Churches, community coalitions, and grassroots nonprofits creating safe, stigma-free support environments.', 5, 1),
(@page_home, 'who_can_benefit', 'corporate-eap', 'Corporate HR & Employee Assistance Programs (EAPs)', 'Workplace Wellness', '06 // CORPORATE', NULL, '/work-with-tiffany?audience=Corporate', NULL, 'Enterprise HR leaders and EAP providers addressing hidden behavioral addictions impacting workplace productivity.', 6, 1),
(@page_home, 'who_can_benefit', 'youth-organizations', 'Youth Organizations, Schools & District Leadership', 'Youth & Education', '07 // YOUTH', NULL, '/work-with-tiffany?audience=Youth', NULL, 'School districts, youth programs, and athletic leagues fostering resilience and positive peer leadership.', 7, 1),
(@page_home, 'who_can_benefit', 'prevention-coalitions', 'Policy Makers & Prevention Coalitions', 'Civic Policy', '08 // POLICY', NULL, '/work-with-tiffany?audience=Policy', NULL, 'Statewide prevention alliances, task forces, and legislative bodies advancing health equity and sustainable funding.', 8, 1),

-- Speaking Tracks (4 Track Cards)
(@page_home, 'speaking', 'track-prevention', 'Prevention, Gambling & Emerging Risk', '5 Signature Topics · Clinical & Community', 'TRACK 01', NULL, '/services/speaking-topics?track=prevention', NULL, 'Early warning signs, clinical escalation timelines, youth digital gaming apps, PGAM campaigns, and validated NODS-CLiP screening protocols.', 1, 1),
(@page_home, 'speaking', 'track-outreach', 'Community Engagement & Outreach', '5 Signature Topics · Grassroots & Policy', 'TRACK 02', NULL, '/services/speaking-topics?track=outreach', NULL, 'The 8 Touchpoints framework, municipal leader resolutions, faith-based sanctuaries, and culturally grounded stigma reduction.', 2, 1),
(@page_home, 'speaking', 'track-systems', 'Human-Centered Systems & Services', '6 Signature Topics · Healthcare & Systems', 'TRACK 03', NULL, '/services/speaking-topics?track=systems', NULL, 'Co-occurring SUD integration, operationalizing the GEAR Method™, mobile betting demographics, lethality screening, and harm reduction.', 3, 1),
(@page_home, 'speaking', 'track-youth', 'Purpose, Leadership & Youth Impact', '4 Signature Topics · Youth & Enterprise', 'TRACK 04', NULL, '/services/speaking-topics?track=youth', NULL, 'Motivational interviewing labs, family secondary trauma, signature flagship keynote, and GambleFreeGear wearable advocacy.', 4, 1),

-- Video Reels (3 items)
(@page_home, 'video_reels', 'video-1', 'National Problem Gambling Conference', 'Keynote Address', 'KEYNOTE', NULL, NULL, 'thumb_1', NULL, 1, 1),
(@page_home, 'video_reels', 'video-2', 'Youth Prevention Summit', 'Student Workshop', 'WORKSHOP', NULL, NULL, 'thumb_2', NULL, 2, 1),
(@page_home, 'video_reels', 'video-3', 'Behavioral Health Alliance', 'Professional Training', 'TRAINING', NULL, NULL, 'thumb_3', NULL, 3, 1),

-- Real Events from Master Tracker (4 items)
(@page_home, 'events', 'event-youth-fair', 'Youth Creative Arts Prevention & Resource Fair', 'Chicago, IL · Aug 2026 · 67 Reach', 'Community Expo', NULL, '/impact#past-engagements', '67 Reach', 'Youth creative arts exhibition, vision board activation, and signature Prevention Passport screening journey.', 1, 1),
(@page_home, 'events', 'event-icpg', 'ICPG Statewide Conference: Outreach Best Practices', 'Springfield, IL · 2026 · Statewide Prevention Professionals', 'Breakout', NULL, '/impact#past-engagements', '350+ Attendees', 'Master breakout session on grassroots outreach strategy and health equity in problem gambling prevention.', 2, 1),
(@page_home, 'events', 'event-women-summit', 'Women Connection Summit', 'Chicago, IL · 2026 · Community Activation', 'Summit', NULL, '/impact#past-engagements', '600+ Attendees', 'Empowering women leaders and educators to address hidden behavioral addictions in family systems.', 3, 1),
(@page_home, 'events', 'event-rosc', 'TEEH Foundation ROSC Council', 'South Suburban Chicago, IL · 2026 · ROSC & Care Linkage', 'Facilitation', NULL, '/impact#past-engagements', '250+ Attendees', 'Strategic council facilitation integrating problem gambling prevention directly into Recovery Oriented Systems of Care.', 4, 1),

-- Proof Testimonials (3 items - hidden until activated in CRM)
(@page_home, 'proof_testimonials', 'testimonial-1', 'Director of Clinical Services', 'Midwest Behavioral Health Network', 'CLINICAL', NULL, NULL, NULL, 'Tiffany brought an unprecedented level of clarity, compassion, and practical rigor to our annual conference. Our clinical team walked away with screening protocols they implemented the very next morning.', 1, 1),
(@page_home, 'proof_testimonials', 'testimonial-2', 'ROSC Council Coordinator', 'Community Prevention Coalition', 'COALITION', NULL, NULL, NULL, 'Working with Tiffany transformed how our coalition approaches youth digital gaming and problem gambling prevention. Her ability to authentically connect with diverse community leaders is unmatched.', 2, 1),
(@page_home, 'proof_testimonials', 'testimonial-3', 'Executive Director', 'Public Health Advocacy Initiative', 'ADVOCACY', NULL, NULL, NULL, 'More than just an inspiring keynote speaker — Tiffany is a true strategic partner who helped us structure community outreach programs designed for sustainable, long-term impact.', 3, 1);


-- ==============================================================================
-- 5. Hydrate Page 2: /about (About Tiffany)
-- ==============================================================================
SET @page_about = (SELECT id FROM website_pages WHERE slug = 'about' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_about, 'hero', 'eyebrow', 'ABOUT TIFFANY WEBB', 'text'),
(@page_about, 'hero', 'headline', 'Personal Perspective. <span class="italic-accent">Professional Experience.</span>', 'html'),
(@page_about, 'hero', 'subtitle', 'Community Impact Strategist · Public Health Educator & Speaker', 'text'),
(@page_about, 'hero', 'hero_image', '/uploads/1788292745245-402206905-tiffany-crop-1788292742938.png', 'image'),
(@page_about, 'hero', 'section_is_active', '1', 'boolean'),

(@page_about, 'story', 'eyebrow', 'THE STORY', 'text'),
(@page_about, 'story', 'headline', 'Where conviction meets the pavement.', 'text'),
(@page_about, 'story', 'pull_quote', 'When we rise, we rise together.', 'text'),
(@page_about, 'story', 'section_is_active', '1', 'boolean'),

(@page_about, 'credentials', 'eyebrow', 'CREDENTIALS & EXPERTISE', 'text'),
(@page_about, 'credentials', 'headline', 'Expertise that <span class="italic-accent">moves people.</span>', 'html'),
(@page_about, 'credentials', 'credentials_badge', 'TIFFANY WEBB, BBA, MHP', 'text'),
(@page_about, 'credentials', 'experience_stat_1', '15+ Years in Behavioral Health & Public Health', 'text'),
(@page_about, 'credentials', 'experience_stat_2', '4,000+ Hours of Frontline Community Outreach', 'text'),
(@page_about, 'credentials', 'section_is_active', '1', 'boolean'),

(@page_about, 'how_she_works', 'eyebrow', 'HOW SHE WORKS', 'text'),
(@page_about, 'how_she_works', 'headline', 'Strategy with people at the center.', 'text'),
(@page_about, 'how_she_works', 'body_text', 'Every keynote, training, and strategic advisory engagement is powered by her proprietary methodology.', 'textarea'),
(@page_about, 'how_she_works', 'cta_text', 'Explore The GEAR Method™ →', 'text'),
(@page_about, 'how_she_works', 'cta_url', '/services#gear', 'text'),
(@page_about, 'how_she_works', 'section_is_active', '1', 'boolean'),

(@page_about, 'specialism', 'section_anchor', 'specialism', 'text'),
(@page_about, 'specialism', 'eyebrow', 'THE SPECIALISM', 'text'),
(@page_about, 'specialism', 'headline', 'Where this <span class="italic-accent">work began.</span>', 'html'),
(@page_about, 'specialism', 'lead_paragraph', 'While public health often treats gambling as an afterthought, Tiffany has spent fifteen years addressing it as a primary public health crisis.', 'textarea'),
(@page_about, 'specialism', 'body_paragraphs', 'Research demonstrates that problem gambling disproportionately impacts communities of color and underserved populations. Tiffany\'s specialized practice combines rigorous public health education with deep cultural fluency to deliver interventions that resonate.', 'html'),
(@page_about, 'specialism', 'section_is_active', '1', 'boolean'),

(@page_about, 'values', 'eyebrow', 'CORE VALUES', 'text'),
(@page_about, 'values', 'headline', 'What she works from.', 'text'),
(@page_about, 'values', 'pull_quote', 'Every conversation is an opportunity to plant a seed of hope, strengthen a community, and inspire meaningful change.', 'textarea'),
(@page_about, 'values', 'section_is_active', '1', 'boolean'),

(@page_about, 'gamblefreegear', 'eyebrow', 'GAMBLEFREEGEAR — BY TIFFANY WEBB', 'text'),
(@page_about, 'gamblefreegear', 'headline', 'Break the silence — literally.', 'text'),
(@page_about, 'gamblefreegear', 'body_text', 'GambleFreeGear turns prevention into something people can wear and talk about. Awareness apparel that starts the conversation before Tiffany ever walks into the room.', 'textarea'),
(@page_about, 'gamblefreegear', 'cta_text', 'Explore GambleFreeGear →', 'text'),
(@page_about, 'gamblefreegear', 'cta_url', 'https://inpowerimports.com', 'text'),
(@page_about, 'gamblefreegear', 'section_is_active', '1', 'boolean'),

(@page_about, 'cta', 'headline', 'Let\'s start a conversation.', 'text'),
(@page_about, 'cta', 'subtitle', 'Whether you are planning a conference, organizing a training, or designing a community strategy.', 'textarea'),
(@page_about, 'cta', 'button_text', 'Invite Tiffany to Speak →', 'text'),
(@page_about, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_about, 'cta', 'section_is_active', '1', 'boolean');

-- About Story Vignettes
INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_about, 'story_vignettes', 'The Upbringing & Roots', 'Village & Family Heritage', 'I was raised by my grandmother and a whole village of aunties and uncles who taught me about family, caring for people, and showing up for others. I’m Chicago-born with deep Louisiana family roots, and my understanding of people began long before this became my professional work. That dual heritage taught me resilience, directness, and genuine hospitality — meeting people where they are and caring for them before asking anything in return.', 1, 1),
(@page_about, 'story_vignettes', 'Personal Perspective + Professional Depth', 'Lived Insight & Clinical Rigor', 'My entry into public health was driven by a clear realization: gambling harm is one of the most hidden, under-addressed crises in modern healthcare. By bridging personal perspective and 15+ years of clinical and community expertise, I give organizations and families the language, tools, and courage to address problem gambling before devastation strikes.', 2, 1),
(@page_about, 'story_vignettes', 'Frontline Reality', '4,000+ Hours On The Ground', 'Over fifteen years and four thousand hours of frontline outreach, Tiffany has delivered prevention where it actually happens: in school gymnasiums, community clinics, church basements, and coalition halls across Illinois and nationwide.', 3, 1),
(@page_about, 'story_vignettes', 'Enterprise & Cultural Advocacy', 'GambleFreeGear Awareness Apparel', 'Her work bridges behavioral science and community enterprise — including founding GambleFreeGear, an awareness apparel initiative that turns prevention into something people wear and talk about before crisis strikes.', 4, 1);


-- ==============================================================================
-- 6. Hydrate Page 3: /services (Services & Capabilities)
-- ==============================================================================
SET @page_services = (SELECT id FROM website_pages WHERE slug = 'services' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_services, 'hero', 'eyebrow', 'SERVICES & CAPABILITIES', 'text'),
(@page_services, 'hero', 'headline', 'Strategy with <span class="italic-accent">people at the center.</span>', 'html'),
(@page_services, 'hero', 'subtitle', 'From keynote stages to executive strategy, Tiffany Webb helps organizations bridge public health expertise, frontline reality, and actionable community impact.', 'textarea'),
(@page_services, 'hero', 'primary_cta_text', 'Start a Conversation →', 'text'),
(@page_services, 'hero', 'primary_cta_url', '/work-with-tiffany', 'text'),
(@page_services, 'hero', 'section_is_active', '1', 'boolean'),

(@page_services, 'capabilities', 'eyebrow', 'FOUR SIGNATURE CAPABILITIES', 'text'),
(@page_services, 'capabilities', 'headline', 'How Tiffany Partners with Organizations', 'text'),
(@page_services, 'capabilities', 'closing_quote', 'I don\'t just tell you what to do next. I help you build how you get there.', 'text'),
(@page_services, 'capabilities', 'section_is_active', '1', 'boolean'),

(@page_services, 'gear', 'section_anchor', 'gear', 'text'),
(@page_services, 'gear', 'eyebrow', 'SIGNATURE METHODOLOGY', 'text'),
(@page_services, 'gear', 'headline', 'The GEAR Method™', 'text'),
(@page_services, 'gear', 'standfirst', 'From awareness to action. From ideas to impact.', 'text'),
(@page_services, 'gear', 'description', 'The GEAR Method™ is a human-centered approach to helping organizations create strategies that connect with people, activate participation, and build meaningful pathways forward.', 'textarea'),
(@page_services, 'gear', 'footer_flow', 'AWARENESS → CONNECTION → ACTION → IMPACT', 'text'),
(@page_services, 'gear', 'section_is_active', '1', 'boolean'),

(@page_services, 'partnership_framework', 'eyebrow', 'COLLABORATIVE PARTNERSHIP', 'text'),
(@page_services, 'partnership_framework', 'headline', 'More Than a Speaker. <span class="italic-accent">A Collaborative Partner.</span>', 'html'),
(@page_services, 'partnership_framework', 'subtitle', 'From one conversation to long-term strategy, Tiffany works alongside organizations to create stronger prevention, engagement, and community impact.', 'textarea'),
(@page_services, 'partnership_framework', 'section_is_active', '1', 'boolean'),

(@page_services, 'speaking_teaser', 'eyebrow', 'SPEAKING & FACILITATION', 'text'),
(@page_services, 'speaking_teaser', 'headline', 'Conversations that <span class="italic-accent">create change.</span>', 'html'),
(@page_services, 'speaking_teaser', 'body_text', 'Twenty topics organized across four signature tracks — built for clinicians, educators, students, and community coalitions.', 'textarea'),
(@page_services, 'speaking_teaser', 'cta_text', 'Explore All 20 Speaking Topics →', 'text'),
(@page_services, 'speaking_teaser', 'cta_url', '/services/speaking-topics', 'text'),
(@page_services, 'speaking_teaser', 'section_is_active', '1', 'boolean'),

(@page_services, 'working_process', 'eyebrow', 'THE PROCESS', 'text'),
(@page_services, 'working_process', 'headline', 'What working together looks like.', 'text'),
(@page_services, 'working_process', 'section_is_active', '1', 'boolean'),

(@page_services, 'cta', 'headline', 'Bring Tiffany to your stage or team.', 'text'),
(@page_services, 'cta', 'button_text', 'Invite Tiffany to Speak →', 'text'),
(@page_services, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_services, 'cta', 'section_is_active', '1', 'boolean');

-- 4 Capabilities
INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_services, 'capabilities', 'strategic-advisor', 'Strategic Advisor', '01 // THINK', 'I challenge familiar thinking, uncover opportunities, and help leaders make clearer decisions around growth, engagement, innovation, and impact.<br/><br/><strong>Scope:</strong> Executive advisory, public health strategy, coalition alignment, prevention program roadmaps.', 1, 1),
(@page_services, 'capabilities', 'program-architect', 'Program Architect', '02 // BUILD', 'I turn ideas and community needs into structured programs, initiatives, experiences, partnerships, and implementation pathways.<br/><br/><strong>Scope:</strong> Curriculum design, screening workflow integration, campaign architecture, stakeholder coordination.', 2, 1),
(@page_services, 'capabilities', 'community-impact-strategist', 'Community Impact Strategist', '03 // CONNECT', 'Connects organizational goals with community realities, strengths, needs, and voices to create people-centered, outcome-focused strategies.<br/><br/><strong>Scope:</strong> Grassroots community engagement, health equity initiatives, ROSC council partnerships.', 3, 1),
(@page_services, 'capabilities', 'speaker-facilitator', 'Speaker & Facilitator', '04 // MOVE', 'I create conversations and learning experiences that challenge assumptions, elevate thinking, encourage dialogue, and move audiences toward action.<br/><br/><strong>Scope:</strong> Keynotes, breakout sessions, clinical trainings, interactive workshops.', 4, 1);

-- GEAR Method Steps
INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order, is_active) VALUES
(@page_services, 'gear_steps', 'G — Generate', 'Build Awareness & Understanding', 'Clarify the challenge, understand the audience, and make the issue visible and relevant before trying to solve it.', 1, 1),
(@page_services, 'gear_steps', 'E — Engage', 'Build Trust & Connection', 'Listen, strengthen relationships, and create opportunities for meaningful participation across diverse community groups.', 2, 1),
(@page_services, 'gear_steps', 'A — Activate', 'Move Ideas into Action', 'Turn insight into strategies, programs, experiences, partnerships, and practical next steps that stick.', 3, 1),
(@page_services, 'gear_steps', 'R — Resource', 'Build the Path Forward', 'Connect people and organizations with information, relationships, services, tools, and opportunities for sustained impact.', 4, 1);

-- 0.7 Partnership Framework (4 Pillars)
INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, content_html, sort_order, is_active) VALUES
(@page_services, 'partnership_framework', 'speak', 'SPEAK', 'Engage & Educate', '01 // SPEAK', 'Keynotes, Conference Sessions, Workshops, Panels, and Session Moderation designed to shift mindset and spark vital community conversations.', 1, 1),
(@page_services, 'partnership_framework', 'partner', 'PARTNER', 'Connect & Activate', '02 // PARTNER', 'Resource Tables, Health & Resource Fairs, ROSC Coalition Engagement, and Community Prevention Events establishing trust on the ground.', 2, 1),
(@page_services, 'partnership_framework', 'strategize', 'STRATEGIZE', 'Plan & Build', '03 // STRATEGIZE', 'Strategic Planning, Community Engagement Strategy, Program Architecture, and Public Health Campaign Design for measurable impact.', 3, 1),
(@page_services, 'partnership_framework', 'strengthen', 'STRENGTHEN', 'Sustain & Expand', '04 // STRENGTHEN', 'Outreach Touchpoint Optimization, System Architecture Advisory, and Coalition Capacity Building ensuring initiatives last.', 4, 1);


-- ==============================================================================
-- 7. Hydrate Page 4: /impact (Impact & Engagements)
-- ==============================================================================
SET @page_impact = (SELECT id FROM website_pages WHERE slug = 'impact' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'hero', 'eyebrow', 'EVENTS & IMPACT', 'text'),
(@page_impact, 'hero', 'headline', 'Where frontline experience <span class="italic-accent">creates documented impact.</span>', 'html'),
(@page_impact, 'hero', 'subtitle', 'From conference rooms to community spaces, this page documents where Tiffany has brought the conversation, who the work was designed to reach, and the impact that followed.', 'textarea'),
(@page_impact, 'hero', 'section_is_active', '1', 'boolean'),

(@page_impact, 'stats', 'eyebrow', 'AGGREGATE IMPACT', 'text'),
(@page_impact, 'stats', 'headline', 'By the Numbers', 'text'),
(@page_impact, 'stats', 'stat_1_value', '15+', 'text'),
(@page_impact, 'stats', 'stat_1_label', 'Years in Public Health', 'text'),
(@page_impact, 'stats', 'stat_2_value', '4,000+', 'text'),
(@page_impact, 'stats', 'stat_2_label', 'Hours of Frontline Outreach', 'text'),
(@page_impact, 'stats', 'stat_3_value', '20', 'text'),
(@page_impact, 'stats', 'stat_3_label', 'Signature Speaking Topics', 'text'),
(@page_impact, 'stats', 'section_is_active', '1', 'boolean'),

(@page_impact, 'upcoming', 'eyebrow', 'UPCOMING SCHEDULE', 'text'),
(@page_impact, 'upcoming', 'headline', 'New engagement dates will be announced <span class="italic-accent">as they are confirmed.</span>', 'html'),
(@page_impact, 'upcoming', 'subtext', 'Tiffany is currently accepting invitations for keynotes, workshops, and coalition engagements for 2026 / 2027.', 'textarea'),
(@page_impact, 'upcoming', 'section_is_active', '1', 'boolean'),

(@page_impact, 'cta', 'eyebrow', 'BRING TIFFANY IN', 'text'),
(@page_impact, 'cta', 'headline', 'Bring documented impact to your <span class="italic-accent">organization.</span>', 'html'),
(@page_impact, 'cta', 'subtitle', 'Check availability and request a custom keynote, training session, or strategic community engagement tailored to your specific goals.', 'textarea'),
(@page_impact, 'cta', 'button_text', 'Start a Conversation →', 'text'),
(@page_impact, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_impact, 'cta', 'section_is_active', '1', 'boolean');

-- Impact Page Collections: Outcome Stories (2 Verified Case Studies)
INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, link_url, image_url, content_html, sort_order, is_active) VALUES
(@page_impact, 'outcome_stories', 'story-youth-fair', 'Youth Creative Arts Prevention & Resource Fair', 'Blocks 2 Cities + GambleFreeGear · August 2026 · Chicago, IL', 'EVENT SPOTLIGHT', '/impact#past-engagements', '/assets/thumb_1.jpg', 'Grassroots youth and community families navigating emerging digital risks and sports wagering exposure without structured screening.<br/><br/>Tiffany co-led a high-engagement prevention activation featuring the signature Prevention Passport, youth-led panel discussion, creative arts vision board session, and direct linkage to local care partners.<br/><br/><strong>Documented Outcome:</strong> 67 youth, parents, and community members completed the interactive screening journey, connecting families to care resources.', 1, 1),
(@page_impact, 'outcome_stories', 'story-icpg-conference', 'ICPG Statewide Conference: Outreach Best Practices', 'Illinois Council on Problem Gambling · June 2026 · Springfield, IL', 'CONFERENCE BREAKOUT', '/impact#past-engagements', '/assets/thumb_2.jpg', 'Clinical providers and public health educators across Illinois needed evidence-based, culturally grounded frameworks to reach historically underserved communities.<br/><br/>Tiffany delivered an intensive master breakout session on multicultural outreach strategy, actionable touchpoint architecture, and operationalizing the GEAR Method™ in clinical and community settings.<br/><br/><strong>Documented Outcome:</strong> Equipped 350+ statewide prevention leaders with practical engagement playbooks and NODS-CLiP brief intervention protocols.', 2, 1);

-- Impact Page Collections: Past Engagements (4 Verified Events)
INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, link_url, image_url, content_html, sort_order, is_active) VALUES
(@page_impact, 'past_engagements', 'past-youth-fair', 'Youth Creative Arts Prevention & Resource Fair', 'Blocks 2 Cities + GambleFreeGear · Chicago, IL', 'Community Expo', NULL, '67 Total Reach', 'Youth creative arts exhibition, vision board activation, and signature Prevention Passport screening journey connecting youth and parents with care partners.', 1, 1),
(@page_impact, 'past_engagements', 'past-icpg', 'ICPG Statewide Conference: Outreach Best Practices', 'Illinois Council on Problem Gambling · Springfield, IL', 'Conference Breakout', NULL, '350+ Attendees', 'Master breakout session on grassroots outreach strategy, health equity frameworks in problem gambling prevention, and cross-system linkage.', 2, 1),
(@page_impact, 'past_engagements', 'past-women-summit', 'Women Connection Summit', 'Women Connection Network · Chicago, IL', 'Community Activation', NULL, '600+ Attendees', 'Empowering women leaders, educators, and families to address hidden behavioral addictions and build resilient community support structures.', 3, 1),
(@page_impact, 'past_engagements', 'past-rosc-council', 'TEEH Foundation ROSC Council', 'TEEH Foundation · South Suburban Chicago, IL', 'Coalition Facilitation', NULL, '250+ Attendees', 'Strategic council facilitation embedding problem gambling prevention and screening workflows directly into local Recovery Oriented Systems of Care.', 4, 1);


-- ==============================================================================
-- 8. Hydrate Page 5: /media (Media & Press Kit)
-- ==============================================================================
SET @page_media = (SELECT id FROM website_pages WHERE slug = 'media' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_media, 'hero', 'eyebrow', 'PRESS KIT & MEDIA ASSETS', 'text'),
(@page_media, 'hero', 'headline', 'Official speaker <span class="italic-accent">press kit.</span>', 'html'),
(@page_media, 'hero', 'subtitle', 'Approved bios, high-resolution photography, stage introduction script, and promotional assets for conference chairs, event organizers, and journalists.', 'textarea'),
(@page_media, 'hero', 'section_is_active', '1', 'boolean'),

(@page_media, 'downloads', 'eyebrow', 'MEDIA ASSETS & DOWNLOADS', 'text'),
(@page_media, 'downloads', 'headline', 'High-resolution <span class="italic-accent">downloads.</span>', 'html'),
(@page_media, 'downloads', 'section_is_active', '1', 'boolean'),

(@page_media, 'bios', 'eyebrow', 'OFFICIAL BIOGRAPHIES', 'text'),
(@page_media, 'bios', 'headline', 'Approved <span class="italic-accent">biographies.</span>', 'html'),
(@page_media, 'bios', 'section_is_active', '1', 'boolean'),

(@page_media, 'intro_script', 'eyebrow', 'STAGE INTRODUCTION', 'text'),
(@page_media, 'intro_script', 'headline', 'Emcee introduction <span class="italic-accent">script.</span>', 'html'),
(@page_media, 'intro_script', 'read_time', '~30 Seconds', 'text'),
(@page_media, 'intro_script', 'script_text', 'Please welcome Tiffany Webb — Community Impact Strategist, Public Health Educator, and founder of GambleFreeGear. With over 15 years of experience across behavioral health and community systems, Tiffany helps healthcare networks, schools, and civic leaders reimagine prevention and build human-centered strategies that last. Please join me in welcoming Tiffany Webb!', 'textarea'),
(@page_media, 'intro_script', 'section_is_active', '1', 'boolean'),

(@page_media, 'cta', 'eyebrow', 'MEDIA & PODCAST APPEARANCES', 'text'),
(@page_media, 'cta', 'headline', 'Host Tiffany on your <span class="italic-accent">broadcast or podcast.</span>', 'html'),
(@page_media, 'cta', 'subtitle', 'Tiffany is available for television, radio, print, and podcast interviews discussing problem gambling prevention, youth digital health, and community health strategy.', 'textarea'),
(@page_media, 'cta', 'button_text', 'Request a Media Interview or Podcast Appearance →', 'text'),
(@page_media, 'cta', 'button_url', '/work-with-tiffany?inquiry=media', 'text'),
(@page_media, 'cta', 'section_is_active', '1', 'boolean');

-- Media Page Collections: 3 Approved Bios
INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, content_html, sort_order, is_active) VALUES
(@page_media, 'bios', 'short-bio', 'SHORT BIO', 'For Event Programs & Social Media', '~50 WORDS', 'Tiffany Webb is a Chicago-born Community Impact Strategist and Public Health Speaker with over 15 years of experience in behavioral health and public health education. She brings lived insight and clinical rigor to problem gambling prevention, youth digital risk, and human-centered community health strategies across Illinois and nationally.', 1, 1),
(@page_media, 'bios', 'medium-bio', 'MEDIUM BIO', 'For Conference Agendas & Website Speaker Profiles', '~150 WORDS', 'Tiffany Webb is a Community Impact Strategist, Public Health Educator, and Speaker specializing in problem gambling prevention, youth digital risk, and community health strategy. With over 15 years of leadership across behavioral health systems and more than 4,000 hours of frontline community outreach, Tiffany bridges the gap between clinical protocols and community trust. She is the founder of GambleFreeGear and the creator of the GEAR Method™ (Generate, Engage, Activate, Resource). An affiliate speaker with the Illinois Council on Problem Gambling (ICPG) and an active advisor to regional ROSC coalitions, Tiffany is trusted by healthcare networks, civic leaders, and youth organizations to deliver high-impact keynotes and actionable workshops.', 2, 1),
(@page_media, 'bios', 'long-bio', 'LONG BIO', 'For Keynote Introductions, Press Releases & Feature Articles', '~300 WORDS', 'Tiffany Webb is a Community Impact Strategist, Public Health Educator, and Speaker dedicated to transforming how organizations, healthcare systems, and communities address behavioral addiction, emerging digital risks, and public health equity. Raised by her grandmother and a close village of family in Chicago with deep Louisiana roots, Tiffany learned early that true community support requires showing up with empathy, consistency, and respect.\n\nOver the past 15 years, Tiffany has worked across healthcare networks, municipal health agencies, and grassroots recovery coalitions. With more than 4,000 hours of frontline outreach, she specializes in identifying hidden behavioral addictions—including mobile sports wagering and youth digital gaming—that traditional intake protocols often overlook.\n\nShe is the creator of the GEAR Method™ (Generate, Engage, Activate, Resource), a proprietary four-phase framework that helps institutions move from passive awareness to sustainable community action. Tiffany is also the founder of GambleFreeGear, a mission-driven awareness enterprise providing wearable advocacy and educational resources.\n\nAn affiliate speaker with the Illinois Council on Problem Gambling (ICPG) and a trusted facilitator for Recovery Oriented Systems of Care (ROSC) councils, Tiffany delivers evidence-based, emotionally resonant keynotes, clinical trainings, and executive advisory sessions across the country.', 3, 1);

-- Media Page Collections: Downloads & Press Kits
INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, link_url, content_html, sort_order, is_active) VALUES
(@page_media, 'downloads', 'speaker-one-sheet', 'Speaker One-Sheet PDF', 'For Event Organizers', 'FOR EVENT ORGANIZERS', '/downloads/Tiffany_Webb_Speaker_One_Sheet.pdf', 'Single-page executive overview of signature topics, speaking formats, and organizer credentials. Perfect for committee review.', 1, 1),
(@page_media, 'downloads', 'headshot-print', 'Official Headshot (Print Resolution)', 'High-Res 300 DPI · CMYK', 'PRINT READY', '/uploads/tiffany_headshot_print.jpg', 'Approved print-quality photography for conference booklets, printed programs, and event banners.', 2, 1),
(@page_media, 'downloads', 'headshot-web', 'Official Headshot (Digital / Web)', 'Web Ready · RGB', 'WEB READY', '/uploads/tiffany_headshot_web.jpg', 'Optimized web-ready portrait for social media promotion, event landing pages, and slide decks.', 3, 1),
(@page_media, 'downloads', 'media-kit-zip', 'Media & Brand Kit (ZIP)', 'Complete Asset Pack', 'COMPLETE PACK', '/downloads/Tiffany_Webb_Media_Kit.zip', 'All approved bios, introduction script, logos, and photography in one convenient download package.', 4, 1);


-- ==============================================================================
-- 9. Hydrate Page 6: /work-with-tiffany (Bookings & Inquiries)
-- ==============================================================================
SET @page_work = (SELECT id FROM website_pages WHERE slug = 'work-with-tiffany' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_work, 'hero', 'eyebrow', 'LET\'S CREATE IMPACT TOGETHER', 'text'),
(@page_work, 'hero', 'headline', 'Bring Tiffany <span class="italic-accent">to your conversation.</span>', 'html'),
(@page_work, 'hero', 'subtitle', 'Tell us about your event, audience, and goals. Tiffany personally reviews every inquiry and responds within two business days.', 'textarea'),
(@page_work, 'hero', 'section_is_active', '1', 'boolean'),

(@page_work, 'form', 'eyebrow', 'INQUIRY FORM', 'text'),
(@page_work, 'form', 'headline', 'Tell Us About Your Event', 'text'),
(@page_work, 'form', 'submit_btn_text', 'Submit Inquiry →', 'text'),
(@page_work, 'form', 'success_message', 'Thank you. Your inquiry has been received and Tiffany will review it personally.', 'textarea'),
(@page_work, 'form', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 10. Hydrate Page 7: /insights (Insights & Articles)
-- ==============================================================================
SET @page_insights = (SELECT id FROM website_pages WHERE slug = 'insights' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_insights, 'hero', 'eyebrow', 'INSIGHTS & ARTICLES', 'text'),
(@page_insights, 'hero', 'headline', 'Thinking <span class="italic-accent">out loud.</span>', 'html'),
(@page_insights, 'hero', 'subtitle', 'Notes from the frontline of prevention — on gambling harm, public health, and the conversations that change communities.', 'textarea'),
(@page_insights, 'hero', 'section_is_active', '1', 'boolean'),

(@page_insights, 'grid', 'eyebrow', 'RECENT ESSAYS', 'text'),
(@page_insights, 'grid', 'headline', 'Perspectives on Prevention & Equity', 'text'),
(@page_insights, 'grid', 'section_is_active', '1', 'boolean');

INSERT INTO website_collections (page_id, section_name, item_slug, title, subtitle, badge, category, link_url, image_url, content_html, sort_order, is_active) VALUES
(@page_insights, 'articles', 'what-gambling-prevention-actually-looks-like', 'What Gambling Prevention Actually Looks Like', 'Prevention · August 2026', '5 min read', 'Prevention', '/insights/what-gambling-prevention-actually-looks-like', '/assets/thumb_3.jpg', '<p class="lead">Most prevention campaigns are designed for people who are already looking. Here\'s what reaching everyone else requires.</p><p>When we treat prevention as a billboard or a compliance pamphlet, we miss the people who need it most before a crisis unfolds. Over fifteen years of frontline outreach in Chicago and across the country have taught me that prevention is not an information campaign — it is a relationship of trust.</p>', 1, 1),
(@page_insights, 'articles', 'dont-bet-on-your-future-youth-prevention', 'Don\'t Bet on Your Future: Why Youth Prevention Starts With a Conversation', 'Youth Prevention · July 2026', '5 min read', 'Youth Prevention', '/insights/dont-bet-on-your-future-youth-prevention', '/assets/thumb_1.jpg', '<p class="lead">Sports betting reached young people faster than prevention did. Here\'s how schools and parents can catch up.</p><p>Today\'s youth are exposed to micro-betting mechanics in video games and seamless mobile sportsbooks directly in their pockets. By the time many reach college campuses, betting has been normalized as simple fandom.</p>', 2, 1),
(@page_insights, 'articles', 'the-communities-prevention-reaches-last', 'The Communities Prevention Reaches Last', 'Health Equity · June 2026', '4 min read', 'Health Equity', '/insights/the-communities-prevention-reaches-last', '/assets/thumb_2.jpg', '<p class="lead">Gambling harm doesn\'t fall evenly across communities. Neither does prevention. That gap is a design choice, not an accident.</p><p>Research repeatedly shows that underserved and marginalized communities bear the brunt of predatory gambling expansion, yet public health resources and treatment beds are consistently placed out of reach.</p>', 3, 1);

-- ==============================================================================
-- Seeder Finished Successfully
-- ==============================================================================
