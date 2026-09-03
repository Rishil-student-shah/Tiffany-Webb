-- ==============================================================================
-- Tiffany Webb Master Database Seeder: All 7 Inner Pages + Home Page
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- ==============================================================================

-- 1. Ensure Website Pages
INSERT INTO website_pages (slug, name, meta_title, meta_description, is_active) VALUES
('home', 'Home', 'Tiffany Webb | Community Impact Strategist & Public Health Educator', 'Chicago Heart — Louisiana Soul. 15+ years and 4,000+ hours of frontline behavioral health and gambling harm prevention.', 1),
('about', 'About Tiffany', 'About Tiffany Webb | Chicago Heart — Louisiana Soul', 'Community Impact Strategist, Public Health Educator & Speaker with 15+ years and 4,000+ hours preventing gambling harm.', 1),
('services', 'Services & Capabilities', 'Services & Capabilities | Tiffany Webb', 'Strategy with people at the center. Strategic Advisory, Program Architecture, Community Impact, and Speaking.', 1),
('speaking-topics', 'Speaking Topics', '21 Speaking Topics | Tiffany Webb', 'Explore 21 signature speaking topics across 4 tracks: Prevention & Awareness, Treatment & Recovery, Family & Community, and Creative Engagement.', 1),
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
DELETE FROM speaking_topics;

-- ==============================================================================
-- 3. Hydrate Speaking Topics Table (All 21 Topics Across 4 Tracks)
-- ==============================================================================
INSERT INTO speaking_topics (track_id, track_name, topic_number, title, subtitle, description, target_audience, learning_objectives, is_flagship, sort_order, is_active) VALUES
-- Track 1: Prevention & Awareness (5 Topics)
(1, 'Prevention & Awareness', 1, 'Gambling Prevention and Community Awareness', 'An accessible introduction to how gambling harm develops at community scale', 'Covers warning signs, risk factors, and practical steps an organization can take before harm becomes crisis.', 'General public, community organizations, prevention specialists', 'Identify risk factors early; implement community-level awareness campaigns; foster stigma-free language.', FALSE, 1, TRUE),
(1, 'Prevention & Awareness', 2, 'Don\'t Bet on Your Future (Youth Focus)', 'Built for students, educators, and parents navigating digital gambling', 'Addresses sports-betting apps, the crossover from gaming to gambling, and peer pressure without lecturing.', 'Students, youth groups, educators, parents', 'Deconstruct predatory game mechanics; establish parental and school guardrails; empower youth refusal skills.', FALSE, 2, TRUE),
(1, 'Prevention & Awareness', 3, 'Problem Gambling Awareness Month (March)', 'A ready-to-deliver signature session for national awareness moments', 'Equips organizations with tools for substantial community engagement beyond simple social media posts.', 'General public, community stakeholders, advocacy partners', 'Organize effective PGAM campaigns; engage local stakeholders; measure community reach.', FALSE, 3, TRUE),
(1, 'Prevention & Awareness', 4, 'National Screening Day', 'Practical guidance on adding gambling screening into health workflows', 'Why screening matters, how it works, and how to administer brief screens without making individuals feel accused.', 'Community health centers, prevention coalitions, clinics', 'Administer 3-question screens (NODS-CLiP); integrate screening into intake; build warm handoff pathways.', FALSE, 4, TRUE),
(1, 'Prevention & Awareness', 5, 'Outreach: Engaging Elected Officials & Resolutions', 'Moving prevention from community halls to municipal and state policy attention', 'How to build sustainable relationships with civic leaders, pursue municipal resolutions, and frame prevention as public health.', 'Policy makers, local government officials, advocacy groups', 'Craft actionable policy briefings; draft civic resolutions; secure sustained prevention resources.', FALSE, 5, TRUE),

-- Track 2: Treatment, Recovery & Professional Training (8 Topics)
(2, 'Treatment, Recovery & Professional Training', 6, 'Gambling & Co-Occurring Disorders: SUD & Workplace', 'Clinical overlap between gambling harm, substance use, and workplace presentations', 'Examines co-occurring substance use disorder, workplace risk indicators, and employee assistance program interventions.', 'Behavioral health professionals, HR leaders, EAPs', 'Recognize co-occurring presentations; design workplace support policies; facilitate confidential referrals.', FALSE, 6, TRUE),
(2, 'Treatment, Recovery & Professional Training', 7, 'The Changing Face of Gambling Addiction', 'How digital access and sports betting altered addiction demographics', 'Examines how mobile sportsbook apps transformed onset speed, youth vulnerability, and clinical intake profiles.', 'Treatment providers, community leaders, healthcare staff', 'Analyze digital addiction mechanics; adapt treatment models for digital natives; evaluate emerging trends.', FALSE, 7, TRUE),
(2, 'Treatment, Recovery & Professional Training', 8, 'Gambling & Suicide: Clinical Interventions', 'Clinically grounded guidance on the elevated suicide risk in gambling disorder', 'Delivered with rigorous clinical sensitivity, highlighting research, warning signs, and critical crisis response protocols.', 'Mental health professionals, crisis intervention workers, prevention teams', 'Assess acute suicide risk; implement lethality screening; establish rapid crisis intervention protocols.', FALSE, 8, TRUE),
(2, 'Treatment, Recovery & Professional Training', 9, 'Resources: Self-Exclusion Systems', 'How self-exclusion programs work and where their limitations lie', 'A comprehensive review of state and venue self-exclusion frameworks and how to integrate them into holistic recovery.', 'Treatment providers, prevention specialists, public agencies', 'Navigate self-exclusion registration; counsel individuals on limits; integrate into comprehensive care plans.', FALSE, 9, TRUE),
(2, 'Treatment, Recovery & Professional Training', 10, 'Harm Reduction Strategies for Problem Gambling', 'Pragmatic harm-reduction approaches for those not yet ready for total abstinence', 'Practical tools for financial safeguards, time limits, and risk minimization while maintaining therapeutic engagement.', 'Treatment providers, harm reduction advocates, outreach staff', 'Apply harm reduction principles; establish financial safety nets; prevent crisis escalation.', FALSE, 10, TRUE),
(2, 'Treatment, Recovery & Professional Training', 11, 'Motivational Interviewing in Gambling Conversations', 'Hands-on practice applying MI specifically to gambling disclosures', 'Empowers frontline professionals to navigate resistance, elicit change talk, and facilitate readiness for treatment.', 'Counselors, peer specialists, social workers', 'Master OARS techniques in gambling contexts; resolve ambivalence; support client-led change.', FALSE, 11, TRUE),
(2, 'Treatment, Recovery & Professional Training', 12, 'Screening & Brief Intervention Integration in Healthcare', 'Embedding gambling screening into routine clinical and community workflows', 'Practical toolkits for implementing SBIRT-style gambling protocols in primary care, emergency rooms, and behavioral clinics.', 'Primary care providers, nurses, clinic administrators', 'Implement brief screening tools; conduct 5-minute interventions; streamline referral linkages.', FALSE, 12, TRUE),
(2, 'Treatment, Recovery & Professional Training', 13, 'Navigating the Continuum of Care: Assessment to Aftercare', 'Building seamless referral networks and sustainable aftercare ecosystems', 'Focuses on warm handoffs, peer recovery support, and long-term relapse prevention structures.', 'Behavioral health clinicians, case managers, recovery coaches', 'Map local treatment resources; establish reliable warm-handoff agreements; reinforce recovery capital.', FALSE, 13, TRUE),

-- Track 3: Family, Community & Faith-Based Outreach (5 Topics)
(3, 'Family, Community & Faith-Based Outreach', 14, 'The Hidden Toll: Impact on Significant Others & Families', 'Addressing the financial, emotional, and relational trauma experienced by loved ones', 'Explores how gambling disorder destabilizes family systems and provides actionable pathways for family healing.', 'Families, spouses, support networks, therapists', 'Identify family impact patterns; establish healthy emotional boundaries; access specialized family support.', FALSE, 14, TRUE),
(3, 'Family, Community & Faith-Based Outreach', 15, 'Gambling, Domestic Violence & Complex Trauma', 'The documented intersection of financial desperation, intimate partner violence, and trauma', 'An evidence-informed session designed for crisis centers, shelters, and trauma-informed practitioners.', 'Domestic violence advocates, trauma specialists, social workers', 'Screen for gambling-related domestic violence; implement safety planning; deliver trauma-informed care.', FALSE, 15, TRUE),
(3, 'Family, Community & Faith-Based Outreach', 16, 'Faith Communities as Frontline Prevention Partners', 'Mobilizing faith leaders and pastoral counseling networks in prevention', 'How faith institutions can provide safe, stigma-free havens and early referral connections for impacted families.', 'Faith leaders, pastoral counselors, ministry teams', 'Equip faith leaders with prevention literacy; host community forums; connect congregants with professional help.', FALSE, 16, TRUE),
(3, 'Family, Community & Faith-Based Outreach', 17, 'Financial Boundary Setting & Family Asset Protection', 'Practical steps for financial safety, legal protections, and transparent conversations', 'Equips families and financial counselors with concrete strategies to safeguard household stability.', 'Financial counselors, families, legal aid advocates', 'Implement financial safeguards; freeze credit when necessary; conduct healthy financial discussions.', FALSE, 17, TRUE),
(3, 'Family, Community & Faith-Based Outreach', 18, 'Culturally Grounded Stigma Reduction in Communities of Color', 'Overcoming historical distrust and cultural barriers to prevention and care', 'Bridges public health science with cultural realities to deliver interventions that truly resonate.', 'Grassroots leaders, community health workers, public health advocates', 'Deconstruct cultural stigma; design culturally fluent outreach; build grassroots community trust.', FALSE, 18, TRUE),

-- Track 4: Creative & Non-Traditional Engagement (3 Topics)
(4, 'Creative & Non-Traditional Engagement', 19, 'Break the Silence: Prevention Begins with a Conversation', 'Tiffany\'s signature flagship keynote on transforming hidden harm into collective impact', 'A transformative keynote that reframes problem gambling as a shared community health priority and inspires action.', 'Keynote for conferences, summits, campus events, and civic gatherings', 'Understand the hidden scale of gambling harm; break culture of silence; lead community prevention conversations.', TRUE, 19, TRUE),
(4, 'Creative & Non-Traditional Engagement', 20, 'Creative Arts & Youth Prevention: Beyond the Brochure', 'Using creative arts and student contests to drive authentic youth participation', 'How to launch high-engagement youth prevention campaigns that tap into creative expression.', 'Schools, youth organizers, art educators, community coalitions', 'Design engaging youth arts contests; facilitate youth-led messaging; measure campaign impact.', FALSE, 20, TRUE),
(4, 'Creative & Non-Traditional Engagement', 21, 'GambleFreeGear: Turning Awareness into Daily Culture', 'Social enterprise and wearable advocacy that sparks conversations before crisis', 'The story and strategy behind GambleFreeGear, turning apparel into a catalyst for community health dialogue.', 'Social entrepreneurs, advocates, community organizers', 'Utilize wearable advocacy; mobilize grassroots ambassadors; create sustainable prevention initiatives.', FALSE, 21, TRUE);


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
(@page_home, 'who_can_benefit', 'body_1', 'Communities most affected by gambling harm can also be among the hardest for traditional prevention efforts to reach. Tiffany\'s work is built to help close that gap — with cultural fluency, frontline experience, creativity, and evidence-informed strategies that make prevention easier to understand, access, and act on.', 'textarea'),
(@page_home, 'who_can_benefit', 'section_is_active', '1', 'boolean'),

(@page_home, 'expertise', 'eyebrow', 'SPEAKING TRACKS', 'text'),
(@page_home, 'expertise', 'headline', 'What she <span class="italic-accent">speaks about.</span>', 'html'),
(@page_home, 'expertise', 'subtext', 'Twenty-one signature topics across four tracks — practical enough to use on Monday, human enough that the room stays with her.', 'textarea'),
(@page_home, 'expertise', 'flagship_title', 'Break the Silence: Prevention Begins with a Conversation', 'text'),
(@page_home, 'expertise', 'flagship_desc', 'Tiffany\'s signature opening keynote that sets the foundation for modern community health and problem gambling prevention. A high-impact, narrative-driven experience that deconstructs stigma, bridges lived understanding with clinical rigor, and equips every leader in the room to initiate transformative conversations.', 'textarea'),
(@page_home, 'expertise', 'section_is_active', '1', 'boolean'),

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
(@page_home, 'events', 'empty_btn', 'Book Tiffany', 'text'),
(@page_home, 'events', 'btn_link', '/work-with-tiffany', 'text'),
(@page_home, 'events', 'link_text', 'See the full picture', 'text'),
(@page_home, 'events', 'section_is_active', '1', 'boolean'),

(@page_home, 'booking', 'eyebrow', 'START A CONVERSATION', 'text'),
(@page_home, 'booking', 'headline', 'Let\'s create <span class="italic-accent">impact together.</span>', 'html'),
(@page_home, 'booking', 'subtext', 'Tell me about your organization and what you\'re trying to change. I read every inquiry myself.', 'textarea'),
(@page_home, 'booking', 'section_is_active', '1', 'boolean'),

(@page_home, 'media', 'headline', 'Ready for the room <span class="italic-accent">and the story.</span>', 'html'),
(@page_home, 'media', 'link_1', 'Download the speaker sheet', 'text'),
(@page_home, 'media', 'link_2', 'Media resources', 'text'),
(@page_home, 'media', 'section_is_active', '1', 'boolean'),

(@page_home, 'booking', 'eyebrow', 'WORK WITH TIFFANY', 'text'),
(@page_home, 'booking', 'headline', 'Let\'s create <span class="italic-accent">impact together.</span>', 'html'),
(@page_home, 'booking', 'subtext', 'Tell me about your organization and what you\'re trying to change. I read every inquiry myself.', 'textarea'),
(@page_home, 'booking', 'section_is_active', '1', 'boolean'),

(@page_home, 'footer', 'copyright', '© 2026 Tiffany Webb. All rights reserved.', 'text'),
(@page_home, 'footer', 'tagline', 'Chicago Heart — Louisiana Soul · Serving Nationally', 'text'),
(@page_home, 'footer', 'email', 'booking@tiffanywebb.com', 'text'),
(@page_home, 'footer', 'location', 'Chicago, IL · Available Nationally', 'text'),
(@page_home, 'footer', 'section_is_active', '1', 'boolean');

-- Home Collections (Impact Band, Credibility Bar, Audiences, Events)
INSERT INTO website_collections (page_id, section_name, title, subtitle, icon_svg, link_url, image_url, content_html, sort_order, is_active) VALUES
-- Impact Band (4 items)
(@page_home, 'impact_band', 'PEOPLE AT THE CENTER', '', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', NULL, NULL, NULL, 1, 1),
(@page_home, 'impact_band', 'FAMILIES STRENGTHENED', '', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>', NULL, NULL, NULL, 2, 1),
(@page_home, 'impact_band', 'COMMUNITIES EMPOWERED', '', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>', NULL, NULL, NULL, 3, 1),
(@page_home, 'impact_band', 'IMPACT THAT LASTS', '', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>', NULL, NULL, NULL, 4, 1),

-- Credibility Bar (4 items)
(@page_home, 'credibility_bar', 'Healthcare Systems', 'Clinical Partnerships', NULL, NULL, NULL, NULL, 1, 1),
(@page_home, 'credibility_bar', 'Colleges & Universities', 'Campus Prevention', NULL, NULL, NULL, NULL, 2, 1),
(@page_home, 'credibility_bar', 'ROSC Councils', 'Recovery Coalitions', NULL, NULL, NULL, NULL, 3, 1),
(@page_home, 'credibility_bar', 'Municipal Agencies', 'Policy & Health Depts', NULL, NULL, NULL, NULL, 4, 1),

-- Who Can Benefit (10 items)
(@page_home, 'who_can_benefit', 'Conferences & Professional Associations', 'Keynotes & Summits', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Conferences+%26+Professional+Associations&audience=Conferences+%26+Professional+Associations', NULL, 'Keynotes, breakout sessions, and expert panels for national summits, annual conferences, and professional associations.', 1, 1),
(@page_home, 'who_can_benefit', 'Schools & Youth Organizations', 'Youth & Schools', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Schools+%26+Youth+Organizations&audience=Schools+%26+Youth+Organizations', NULL, 'Age-appropriate youth prevention, interactive workshops, and family engagement around digital risk and healthy choices.', 2, 1),
(@page_home, 'who_can_benefit', 'Colleges & Universities', 'Higher Education', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Colleges+%26+Universities&audience=Colleges+%26+Universities', NULL, 'Campus-wide wellness activations, athletic department sessions, student affairs programming, and Greek life dialogues.', 3, 1),
(@page_home, 'who_can_benefit', 'Healthcare & Hospital Systems', 'Clinical Networks', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Healthcare+%26+Hospital+Systems&audience=Healthcare+%26+Hospital+Systems', NULL, 'Hospitals, primary care networks, clinical teams, and health systems integrating validated gambling screening protocols.', 4, 1),
(@page_home, 'who_can_benefit', 'Government & Public Health', 'Municipal & County', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Government+%26+Public+Health&audience=Government+%26+Public+Health', NULL, 'Municipal health agencies, public health departments, county boards, and prevention policy task forces.', 5, 1),
(@page_home, 'who_can_benefit', 'Behavioral Health Providers', 'Clinicians & Counselors', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Behavioral+Health+Providers&audience=Behavioral+Health+Providers', NULL, 'Clinicians, addiction counselors, social workers, and mental health frontline teams managing co-occurring risks.', 6, 1),
(@page_home, 'who_can_benefit', 'Recovery Networks', 'Peer Support & RCOs', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Recovery+Networks&audience=Recovery+Networks', NULL, 'Peer-support organizations, recovery community organizations (RCOs), and grassroots harm-reduction initiatives.', 7, 1),
(@page_home, 'who_can_benefit', 'Community Coalitions & ROSC Councils', 'ROSC & Prevention', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Community+Coalitions+%26+ROSC+Councils&audience=Community+Coalitions+%26+ROSC+Councils', NULL, 'Recovery Oriented Systems of Care (ROSC) councils, prevention coalitions, and regional cross-sector partnerships.', 8, 1),
(@page_home, 'who_can_benefit', 'Community Organizations & Nonprofits', 'Nonprofits & Health Centers', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Community+Organizations+%26+Nonprofits&audience=Community+Organizations+%26+Nonprofits', NULL, 'Mission-driven neighborhood groups, civic organizations, and community health centers serving local families.', 9, 1),
(@page_home, 'who_can_benefit', 'Faith Communities', 'Churches & Ministries', NULL, '/work-with-tiffany?ref_section=Homepage+-+Audience+Groups&ref_card=Faith+Communities&audience=Faith+Communities', NULL, 'Churches, ministries, faith networks, and faith-based community outreach programs offering compassionate support.', 10, 1),

-- Video Reels (3 items)
(@page_home, 'video_reels', 'National Problem Gambling Conference', 'Keynote Address', NULL, NULL, 'thumb_1', NULL, 1, 1),
(@page_home, 'video_reels', 'Youth Prevention Summit', 'Student Workshop', NULL, NULL, 'thumb_2', NULL, 2, 1),
(@page_home, 'video_reels', 'Behavioral Health Alliance', 'Professional Training', NULL, NULL, 'thumb_3', NULL, 3, 1),

-- Real Events (4 items)
(@page_home, 'events', 'Youth Creative Arts Prevention & Resource Fair', 'Community Expo', 'Upcoming', '/impact#events', '500+', 'Chicago, IL', 1, 1),
(@page_home, 'events', 'ICPG Conference', 'Keynote (Affiliate / Speaker)', 'Past', '/impact#events', '350+', 'Springfield, IL', 2, 1),
(@page_home, 'events', 'Women Connection Summit', 'Workshop', 'Past', '/impact#events', '600+', 'New Orleans, LA', 3, 1),
(@page_home, 'events', 'TEEH Foundation ROSC Council', 'Facilitation', 'Past', '/impact#events', '250+', 'South Suburban Chicago, IL', 4, 1);


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

(@page_services, 'speaking_teaser', 'eyebrow', 'SPEAKING & FACILITATION', 'text'),
(@page_services, 'speaking_teaser', 'headline', 'Conversations that <span class="italic-accent">create change.</span>', 'html'),
(@page_services, 'speaking_teaser', 'body_text', 'Twenty-one topics organized across four signature tracks — built for clinicians, educators, students, and community coalitions.', 'textarea'),
(@page_services, 'speaking_teaser', 'cta_text', 'Explore All 21 Speaking Topics →', 'text'),
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


-- ==============================================================================
-- 7. Hydrate Page 4: /impact (Impact & Engagements)
-- ==============================================================================
SET @page_impact = (SELECT id FROM website_pages WHERE slug = 'impact' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_impact, 'hero', 'eyebrow', 'COMMUNITY IMPACT', 'text'),
(@page_impact, 'hero', 'headline', 'Where the work <span class="italic-accent">has taken me.</span>', 'html'),
(@page_impact, 'hero', 'subtitle', 'Fifteen years of prevention work, measured in conversations started, systems changed, and communities that stopped waiting for permission to talk about this.', 'textarea'),
(@page_impact, 'hero', 'section_is_active', '1', 'boolean'),

(@page_impact, 'stats', 'eyebrow', 'AGGREGATE IMPACT', 'text'),
(@page_impact, 'stats', 'headline', 'By the Numbers', 'text'),
(@page_impact, 'stats', 'stat_1_value', '15+', 'text'),
(@page_impact, 'stats', 'stat_1_label', 'Years in Public Health', 'text'),
(@page_impact, 'stats', 'stat_2_value', '4,000+', 'text'),
(@page_impact, 'stats', 'stat_2_label', 'Hours of Frontline Outreach', 'text'),
(@page_impact, 'stats', 'stat_3_value', '21', 'text'),
(@page_impact, 'stats', 'stat_3_label', 'Signature Speaking Topics', 'text'),
(@page_impact, 'stats', 'section_is_active', '1', 'boolean'),

(@page_impact, 'practice', 'eyebrow', 'PUBLIC HEALTH PRACTICE', 'text'),
(@page_impact, 'practice', 'headline', 'Prevention that meets people where they are.', 'text'),
(@page_impact, 'practice', 'body_text', 'Tiffany has spent fifteen years working in school gyms, clinic waiting rooms, church basements, and coalition halls. Her work establishes prevention in spaces standard campaigns never reach.', 'textarea'),
(@page_impact, 'practice', 'link_text', 'Read more about her specialism →', 'text'),
(@page_impact, 'practice', 'link_url', '/about#specialism', 'text'),
(@page_impact, 'practice', 'section_is_active', '1', 'boolean'),

(@page_impact, 'cta', 'headline', 'Bring this work to your community.', 'text'),
(@page_impact, 'cta', 'button_text', 'Invite Tiffany to Speak →', 'text'),
(@page_impact, 'cta', 'button_url', '/work-with-tiffany', 'text'),
(@page_impact, 'cta', 'section_is_active', '1', 'boolean');


-- ==============================================================================
-- 8. Hydrate Page 5: /media (Media & Press Kit)
-- ==============================================================================
SET @page_media = (SELECT id FROM website_pages WHERE slug = 'media' LIMIT 1);

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES
(@page_media, 'hero', 'eyebrow', 'MEDIA & PRESS', 'text'),
(@page_media, 'hero', 'headline', 'Ready for the room <span class="italic-accent">and the story.</span>', 'html'),
(@page_media, 'hero', 'subtitle', 'Everything event organizers, journalists, and podcast hosts need to feature, interview, or introduce Tiffany Webb.', 'textarea'),
(@page_media, 'hero', 'section_is_active', '1', 'boolean'),

(@page_media, 'downloads', 'eyebrow', 'PRESS DOWNLOADS', 'text'),
(@page_media, 'downloads', 'headline', 'Official Speaker Assets', 'text'),
(@page_media, 'downloads', 'section_is_active', '1', 'boolean'),

(@page_media, 'bios', 'eyebrow', 'APPROVED BIOGRAPHIES', 'text'),
(@page_media, 'bios', 'headline', 'Bios in 3 Lengths (Third-Person)', 'text'),
(@page_media, 'bios', 'section_is_active', '1', 'boolean'),

(@page_media, 'intro_script', 'eyebrow', 'STAGE INTRODUCTION', 'text'),
(@page_media, 'intro_script', 'headline', 'Official Stage Emcee Script', 'text'),
(@page_media, 'intro_script', 'read_time', '~60 Seconds', 'text'),
(@page_media, 'intro_script', 'script_text', 'Our next speaker has spent more than fifteen years and four thousand hours doing prevention work in the places it\'s hardest to do — schools, clinics, and community rooms across Illinois. She\'s a public-health educator, a Community Impact Strategist, and the founder of GambleFreeGear. She believes prevention begins with a conversation, and she\'s here to start one with us. Please welcome Tiffany Webb.', 'textarea'),
(@page_media, 'intro_script', 'section_is_active', '1', 'boolean'),

(@page_media, 'cta', 'headline', 'Book an Interview or Podcast Feature', 'text'),
(@page_media, 'cta', 'button_text', 'Submit Media Request →', 'text'),
(@page_media, 'cta', 'button_url', '/work-with-tiffany?type=Media', 'text'),
(@page_media, 'cta', 'section_is_active', '1', 'boolean');


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
