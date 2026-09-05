/**
 * Tier 1: Comprehensive Feature Coverage Test Suite
 * Minimum >= 5 independent test assertions per feature across all 7 pages, REST APIs, and CRM CMS.
 */

const { describe, it, beforeAll, afterAll, expect } = require('./helpers/test_framework');
const { getHarness } = require('./helpers/app_harness');
const { parseHTML } = require('./helpers/dom_parser');
const { query, getContentByPageSlug, deleteTestLeadsByEmail } = require('./helpers/db_helper');

describe('Tier 1: Feature Coverage (>=5 tests per feature)', () => {
  let harness;

  beforeAll(async () => {
    harness = getHarness();
    await harness.start();
  });

  afterAll(async () => {
    await deleteTestLeadsByEmail('%tier1%');
    await harness.stop();
  });

  // ============================================================================
  // Feature 1: Page /about (9 Sections)
  // ============================================================================
  describe('Feature 1: Page /about (9 Database-Driven Sections)', () => {
    let res;
    let doc;
    let dbData;

    beforeAll(async () => {
      res = await harness.request('/about');
      doc = parseHTML(res.text);
      dbData = await getContentByPageSlug('about');
    });

    it('1.1: renders Hero section with correct eyebrow, headline, and subtitle', () => {
      expect(res.status).toBe(200);
      const hero = doc.getElementById('about_hero');
      expect(hero).toBeTruthy();
      expect(hero.textContent).toContain('ABOUT TIFFANY WEBB');
      expect(hero.textContent).toContain('Chicago Heart');
      expect(hero.textContent).toContain('Louisiana Soul');
      expect(hero.textContent).toContain('Community Impact Strategist');
    });

    it('1.2: renders The Story section with headline, pull quote, and exactly 6 thematic vignettes', () => {
      const story = doc.getElementById('about_story');
      expect(story).toBeTruthy();
      expect(story.textContent).toContain('Where conviction meets the pavement');
      expect(story.textContent).toContain('When we rise, we rise together');
      
      const vignettes = doc.getElementsByClassName('vignette-card');
      expect(vignettes.length).toBe(6);
      
      // Verify specific vignette titles
      const titles = vignettes.map(v => v.textContent);
      expect(titles.some(t => t.includes('The Foundation'))).toBe(true);
      expect(titles.some(t => t.includes('The Awakening'))).toBe(true);
      expect(titles.some(t => t.includes('The Nature of Gambling Harm'))).toBe(true);
      expect(titles.some(t => t.includes('The Frontline Reality'))).toBe(true);
      expect(titles.some(t => t.includes('Culturally Rooted Prevention'))).toBe(true);
      expect(titles.some(t => t.includes('Empowerment & Enterprise'))).toBe(true);
    });

    it('1.3: renders Credentials & Expertise section with BBA, MHP post-nominals and 4 core domains', () => {
      const creds = doc.getElementById('about_credentials');
      expect(creds).toBeTruthy();
      expect(creds.textContent).toContain('TIFFANY WEBB, BBA, MHP');
      expect(creds.textContent).toContain('15+ Years in Behavioral Health');
      expect(creds.textContent).toContain('4,000+ Hours of Frontline Outreach');
      
      const expertiseCards = doc.getElementsByClassName('expertise-card');
      expect(expertiseCards.length).toBe(4);
      expect(creds.textContent).toContain('Behavioral Health & Addiction Prevention');
      expect(creds.textContent).toContain('Youth & Digital Gambling Prevention');
      expect(creds.textContent).toContain('Community Outreach & Coalition Navigation');
      expect(creds.textContent).toContain('Screening, Brief Intervention & Referral Systems');
    });

    it('1.4: renders How She Works signpost linking to /services#gear and Specialism anchor id="specialism"', () => {
      const howWorks = doc.getElementById('about_how_she_works');
      expect(howWorks).toBeTruthy();
      expect(howWorks.textContent).toContain('HOW SHE WORKS');
      expect(howWorks.textContent).toContain('Explore The GEAR Method™ →');
      
      const links = doc.getLinks();
      const gearLink = links.find(l => l.href === '/services#gear');
      expect(gearLink).toBeTruthy();

      const spec = doc.getElementById('specialism');
      expect(spec).toBeTruthy();
      expect(spec.textContent).toContain('THE SPECIALISM');
      expect(spec.textContent).toContain('Where this work began');
      expect(spec.textContent).toContain('fifteen years addressing it as a primary public health crisis');
    });

    it('1.5: renders Core Values (5 items + quote), GambleFreeGear CTA, Closing CTA, and hides empty Affiliations', () => {
      const values = doc.getElementById('about_values');
      expect(values).toBeTruthy();
      expect(values.textContent).toContain('CORE VALUES');
      expect(values.textContent).toContain('Every conversation is an opportunity');
      
      const valueItems = doc.getElementsByClassName('value-item');
      expect(valueItems.length).toBe(5);
      expect(values.textContent).toContain('Faith');
      expect(values.textContent).toContain('Family');
      expect(values.textContent).toContain('Community');
      expect(values.textContent).toContain('Purpose');
      expect(values.textContent).toContain('Impact');

      // Affiliations should be hidden when empty
      const affiliations = doc.getElementById('about_affiliations');
      expect(affiliations).toBeNull();

      // GambleFreeGear
      const gear = doc.getElementById('about_gamblefreegear');
      expect(gear).toBeTruthy();
      expect(gear.textContent).toContain('GAMBLEFREEGEAR — BY TIFFANY WEBB');
      expect(gear.textContent).toContain('Break the silence — literally');

      // Closing CTA
      const cta = doc.getElementById('about_cta');
      expect(cta).toBeTruthy();
      expect(cta.textContent).toContain("Let's start a conversation");
      const ctaLink = doc.getLinks().find(l => l.href === '/work-with-tiffany');
      expect(ctaLink).toBeTruthy();
    });
  });

  // ============================================================================
  // Feature 2: Page /services (8 Sections)
  // ============================================================================
  describe('Feature 2: Page /services (8 Database-Driven Sections)', () => {
    let res;
    let doc;

    beforeAll(async () => {
      res = await harness.request('/services');
      doc = parseHTML(res.text);
    });

    it('2.1: renders Services Hero with headline and primary CTA to /work-with-tiffany', () => {
      expect(res.status).toBe(200);
      const hero = doc.getElementById('services_hero');
      expect(hero).toBeTruthy();
      expect(hero.textContent).toContain('SERVICES & CAPABILITIES');
      expect(hero.textContent).toContain('Strategy with people at the center');
      expect(hero.textContent).toContain('From keynote stages to executive strategy');
      
      const links = doc.getLinks();
      const heroCta = links.find(l => l.href === '/work-with-tiffany' && l.text.includes('Work with Tiffany'));
      expect(heroCta).toBeTruthy();
    });

    it('2.2: renders Four Capabilities with deep-link IDs (#strategic-advisor, #program-architect, #community-impact-strategist, #speaker-facilitator)', () => {
      const capSection = doc.getElementById('services_capabilities');
      expect(capSection).toBeTruthy();

      const cap1 = doc.getElementById('strategic-advisor');
      const cap2 = doc.getElementById('program-architect');
      const cap3 = doc.getElementById('community-impact-strategist');
      const cap4 = doc.getElementById('speaker-facilitator');

      expect(cap1).toBeTruthy();
      expect(cap1.textContent).toContain('Strategic Advisor');
      expect(cap1.textContent).toContain('01 // THINK');

      expect(cap2).toBeTruthy();
      expect(cap2.textContent).toContain('Program Architect');
      expect(cap2.textContent).toContain('02 // BUILD');

      expect(cap3).toBeTruthy();
      expect(cap3.textContent).toContain('Community Impact Strategist');
      expect(cap3.textContent).toContain('03 // CONNECT');

      expect(cap4).toBeTruthy();
      expect(cap4.textContent).toContain('Speaker & Facilitator');
      expect(cap4.textContent).toContain('04 // MOVE');
    });

    it('2.3: renders The GEAR Method™ (id="gear") with 4 steps (Generate, Engage, Activate, Resource) and footer flow', () => {
      const gear = doc.getElementById('gear');
      expect(gear).toBeTruthy();
      expect(gear.textContent).toContain('SIGNATURE METHODOLOGY');
      expect(gear.textContent).toContain('The GEAR Method™');
      expect(gear.textContent).toContain('From awareness to action. From ideas to impact');
      
      const steps = doc.getElementsByClassName('gear-step-card');
      expect(steps.length).toBe(4);
      expect(gear.textContent).toContain('G — Generate');
      expect(gear.textContent).toContain('E — Engage');
      expect(gear.textContent).toContain('A — Activate');
      expect(gear.textContent).toContain('R — Resource');
      expect(gear.textContent).toContain('AWARENESS → CONNECTION → ACTION → IMPACT');
    });

    it('2.4: renders Speaking & Facilitation Teaser with direct link to /services/speaking-topics', () => {
      const teaser = doc.getElementById('services_speaking_teaser');
      expect(teaser).toBeTruthy();
      expect(teaser.textContent).toContain('SPEAKING & FACILITATION');
      expect(teaser.textContent).toContain('Conversations that create change');
      expect(teaser.textContent).toContain('Twenty topics organized across four signature tracks');
      
      const topicLink = doc.getLinks().find(l => l.href === '/services/speaking-topics');
      expect(topicLink).toBeTruthy();
      expect(topicLink.text).toContain('Explore All 20 Speaking Topics');
    });

    it('2.5: renders 6 Engagement Formats, 4 Working Steps, Closing CTA, and hides empty FAQs', () => {
      const formats = doc.getElementById('services_formats');
      expect(formats).toBeTruthy();
      expect(formats.textContent).toContain('Ways we can work together');
      expect(formats.textContent).toContain('Same expertise, shaped to fit your event');
      
      const formatCards = doc.getElementsByClassName('format-card');
      expect(formatCards.length).toBe(6);
      expect(formats.textContent).toContain('Keynote Address');
      expect(formats.textContent).toContain('Conference Session');
      expect(formats.textContent).toContain('Panel & Roundtable');
      expect(formats.textContent).toContain('School & University Program');
      expect(formats.textContent).toContain('Clinical & Frontline Workshop');
      expect(formats.textContent).toContain('Custom Strategy & Advisory');

      // 4 Working Steps
      const process = doc.getElementById('services_process');
      expect(process).toBeTruthy();
      const processSteps = doc.getElementsByClassName('process-step');
      expect(processSteps.length).toBe(4);

      // Empty FAQ is hidden
      const faqs = doc.getElementById('services_faqs');
      expect(faqs).toBeNull();

      // Closing CTA
      const cta = doc.getElementById('services_cta');
      expect(cta).toBeTruthy();
      expect(cta.textContent).toContain('Bring Tiffany to your stage or team');
    });
  });

  // ============================================================================
  // Feature 3: Page /services/speaking-topics (4 Sections, Exactly 20 Topics)
  // ============================================================================
  describe('Feature 3: Page /services/speaking-topics (4 Sections & 20 Topics)', () => {
    let res;
    let doc;

    beforeAll(async () => {
      res = await harness.request('/services/speaking-topics');
      doc = parseHTML(res.text);
    });

    it('3.1: renders Hero with portfolio title and subtitle describing 20 topics across 4 tracks', () => {
      expect(res.status).toBe(200);
      const hero = doc.getElementById('speaking_topics_hero');
      expect(hero).toBeTruthy();
      expect(hero.textContent).toContain('SPEAKING PORTFOLIO');
      expect(hero.textContent).toContain('Conversations that create change');
      expect(hero.textContent).toContain('Twenty topics across four tracks');
    });

    it('3.2: renders Client-Side Filter Bar with Track and Target Audience pill controls', () => {
      const filterBar = doc.getElementById('speaking_topics_filter');
      expect(filterBar).toBeTruthy();
      
      const trackPills = doc.getElementsByClassName('filter-pill');
      expect(trackPills.length).toBeGreaterThanOrEqual(10);
      expect(filterBar.textContent).toContain('All (20)');
      expect(filterBar.textContent).toContain('Prevention & Awareness (5)');
      expect(filterBar.textContent).toContain('Treatment & Recovery (8)');
      expect(filterBar.textContent).toContain('Family & Community (4)');
      expect(filterBar.textContent).toContain('Creative Engagement (3)');
      expect(filterBar.textContent).toContain('General Public');
      expect(filterBar.textContent).toContain('Youth & Students');
      expect(filterBar.textContent).toContain('Clinicians & Providers');
    });

    it('3.3: renders exactly 20 Topic cards in database collection', () => {
      const grid = doc.getElementById('speaking_topics_grid');
      expect(grid).toBeTruthy();
      const topicCards = doc.getElementsByClassName('topic-card');
      expect(topicCards.length).toBe(20);
    });

    it('3.4: validates all 4 tracks are properly color-coded and categorized across the 20 cards', () => {
      const topicCards = doc.getElementsByClassName('topic-card');
      
      const preventionCards = topicCards.filter(c => c.innerHTML.includes('Prevention & Awareness'));
      const treatmentCards = topicCards.filter(c => c.innerHTML.includes('Treatment & Recovery'));
      const familyCards = topicCards.filter(c => c.innerHTML.includes('Family & Community'));
      const creativeCards = topicCards.filter(c => c.innerHTML.includes('Creative Engagement'));

      expect(preventionCards.length).toBe(5);
      expect(treatmentCards.length).toBe(8);
      expect(familyCards.length).toBe(4);
      expect(creativeCards.length).toBe(3);
    });

    it('3.5: validates every topic card has a prefill button linking to /work-with-tiffany?topic=...', () => {
      const links = doc.getLinks();
      const prefillLinks = links.filter(l => l.href.startsWith('/work-with-tiffany?topic='));
      expect(prefillLinks.length).toBe(20);

      // Verify specific topic prefill URLs
      const youthTopicLink = prefillLinks.find(l => l.href.includes('Don%27t+Bet+on+Your+Future') || l.href.includes("Don't"));
      expect(youthTopicLink).toBeTruthy();

      const cta = doc.getElementById('speaking_topics_cta');
      expect(cta).toBeTruthy();
      expect(cta.textContent).toContain('Need a customized topic for your conference or team?');
    });
  });

  // ============================================================================
  // Feature 4: Page /impact (8 Sections)
  // ============================================================================
  describe('Feature 4: Page /impact (8 Sections & Graceful Empty States)', () => {
    let res;
    let doc;

    beforeAll(async () => {
      res = await harness.request('/impact');
      doc = parseHTML(res.text);
    });

    it('4.1: renders Impact Hero with title and frontline positioning subtitle', () => {
      expect(res.status).toBe(200);
      const hero = doc.getElementById('impact_hero');
      expect(hero).toBeTruthy();
      expect(hero.textContent).toContain('COMMUNITY IMPACT');
      expect(hero.textContent).toContain('Where the work has taken me');
      expect(hero.textContent).toContain('Fifteen years of prevention work');
    });

    it('4.2: renders Aggregate Stats Band with 15+ Years, 4,000+ Hours, and 20 Topics', () => {
      const stats = doc.getElementById('impact_stats');
      expect(stats).toBeTruthy();
      expect(stats.textContent).toContain('15+');
      expect(stats.textContent).toContain('Years in Public Health');
      expect(stats.textContent).toContain('4,000+');
      expect(stats.textContent).toContain('Hours of Frontline Outreach');
      expect(stats.textContent).toContain('20');
      expect(stats.textContent).toContain('Signature Speaking Topics');
    });

    it('4.3: renders Upcoming Engagements and Past Engagements with graceful empty state notices', () => {
      const upcoming = doc.getElementById('impact_upcoming');
      expect(upcoming).toBeTruthy();
      expect(upcoming.textContent).toContain('Where Tiffany is Speaking Next');
      expect(upcoming.textContent).toContain('Next speaking dates announced soon');

      const past = doc.getElementById('impact_past');
      expect(past).toBeTruthy();
      expect(past.textContent).toContain('Selected Keynotes & Presentations');
      expect(past.textContent).toContain('Past engagement archive is currently being updated');
    });

    it('4.4: renders Outcome Stories (3 slots placeholder) and Public Health Practice linking to /about#specialism', () => {
      const stories = doc.getElementById('impact_stories');
      expect(stories).toBeTruthy();
      expect(stories.textContent).toContain('Frontline Transformation');
      expect(stories.textContent).toContain('Outcome stories and case studies are currently being curated');

      const practice = doc.getElementById('impact_practice');
      expect(practice).toBeTruthy();
      expect(practice.textContent).toContain('PUBLIC HEALTH PRACTICE');
      expect(practice.textContent).toContain('Prevention that meets people where they are');
      expect(practice.textContent).toContain('fifteen years working in school gyms');

      const specLink = doc.getLinks().find(l => l.href === '/about#specialism');
      expect(specLink).toBeTruthy();
      expect(specLink.text).toContain('Read more about her specialism →');
    });

    it('4.5: verifies Testimonials empty handling and Closing CTA to /work-with-tiffany', () => {
      const testimonials = doc.getElementById('impact_testimonials');
      // When empty in DB, section is omitted from DOM
      expect(testimonials).toBeNull();

      const cta = doc.getElementById('impact_cta');
      expect(cta).toBeTruthy();
      expect(cta.textContent).toContain('Bring this work to your community');
      const ctaLink = doc.getLinks().find(l => l.href === '/work-with-tiffany' && l.text.includes('Invite Tiffany to Speak'));
      expect(ctaLink).toBeTruthy();
    });
  });

  // ============================================================================
  // Feature 5: Page /media (6 Sections)
  // ============================================================================
  describe('Feature 5: Page /media (6 Sections & Media Assets)', () => {
    let res;
    let doc;

    beforeAll(async () => {
      res = await harness.request('/media');
      doc = parseHTML(res.text);
    });

    it('5.1: renders Media Hero with eyebrow and introductory subtitle', () => {
      expect(res.status).toBe(200);
      const hero = doc.getElementById('media_hero');
      expect(hero).toBeTruthy();
      expect(hero.textContent).toContain('MEDIA & PRESS');
      expect(hero.textContent).toContain('Ready for the room');
      expect(hero.textContent).toContain('Everything event organizers, journalists, and podcast hosts need');
    });

    it('5.2: renders 3 Download Asset Cards (Speaker One-Sheet, Media Kit, Capability Prospectus)', () => {
      const downloads = doc.getElementById('media_downloads');
      expect(downloads).toBeTruthy();
      const downloadCards = doc.getElementsByClassName('download-card');
      expect(downloadCards.length).toBe(3);
      expect(downloads.textContent).toContain('Speaker One-Sheet');
      expect(downloads.textContent).toContain('Media Kit & Approved Headshots');
      expect(downloads.textContent).toContain('Capability Prospectus');
    });

    it('5.3: renders Approved Bios in exactly 3 Lengths in third-person voice with clipboard copy triggers', () => {
      const bios = doc.getElementById('media_bios');
      expect(bios).toBeTruthy();
      expect(bios.textContent).toContain('APPROVED BIOGRAPHIES');
      expect(bios.textContent).toContain('Bios in 3 Lengths (Third-Person)');

      const bioCards = doc.getElementsByClassName('bio-card');
      expect(bioCards.length).toBe(3);
      expect(bios.textContent).toContain('Short Bio (≈40 Words)');
      expect(bios.textContent).toContain('Medium Bio (≈90 Words)');
      expect(bios.textContent).toContain('Long Bio (≈150 Words)');

      // Verify third-person pronouns (She, Tiffany Webb, Her)
      expect(bios.textContent).toContain('Tiffany Webb is a public-health educator');
      expect(bios.textContent).toContain('She helps conferences');
      expect(bios.textContent).toContain('She is also the founder of GambleFreeGear');

      // Verify copy buttons
      const copyBtns = doc.getElementsByClassName('btn-copy-bio');
      expect(copyBtns.length).toBe(3);
    });

    it('5.4: renders Stage Introduction Script in third-person (~60 seconds)', () => {
      const intro = doc.getElementById('media_intro_script');
      expect(intro).toBeTruthy();
      expect(intro.textContent).toContain('STAGE INTRODUCTION');
      expect(intro.textContent).toContain('Official Stage Emcee Script');
      expect(intro.textContent).toContain('~60 Seconds');
      expect(intro.textContent).toContain('Our next speaker has spent more than fifteen years');
      expect(intro.textContent).toContain('Please welcome Tiffany Webb');
    });

    it('5.5: renders 5 Speaking Points and Media Inquiries CTA targeting /work-with-tiffany?type=Media', () => {
      const points = doc.getElementById('media_talking_points');
      expect(points).toBeTruthy();
      expect(points.textContent).toContain('What Tiffany Can Speak To');
      
      const pointItems = doc.getElementsByClassName('talking-point-item');
      expect(pointItems.length).toBe(5);
      expect(points.textContent).toContain('Sports-Betting Proliferation & Youth Gaming');
      expect(points.textContent).toContain('Culturally Rooted Outreach & Health Equity');
      expect(points.textContent).toContain('Co-Occurring Disorders & Crisis Prevention');
      expect(points.textContent).toContain('Harm-Reduction Protocols in Routine Care');
      expect(points.textContent).toContain('The Journey of GambleFreeGear');

      // Media CTA
      const cta = doc.getElementById('media_cta');
      expect(cta).toBeTruthy();
      expect(cta.textContent).toContain('Book an Interview or Podcast Feature');
      const ctaLink = doc.getLinks().find(l => l.href === '/work-with-tiffany?type=Media');
      expect(ctaLink).toBeTruthy();
      expect(ctaLink.text).toContain('Submit Media Request →');
    });
  });

  // ============================================================================
  // Feature 6: Page /work-with-tiffany (5 Sections & 9-Field Form)
  // ============================================================================
  describe('Feature 6: Page /work-with-tiffany (5 Sections & Lead Form)', () => {
    let res;
    let doc;

    beforeAll(async () => {
      res = await harness.request('/work-with-tiffany');
      doc = parseHTML(res.text);
    });

    it('6.1: renders Booking Hero with title and 48-hour response assurance', () => {
      expect(res.status).toBe(200);
      const hero = doc.getElementById('booking_hero');
      expect(hero).toBeTruthy();
      expect(hero.textContent).toContain("LET'S CREATE IMPACT TOGETHER");
      expect(hero.textContent).toContain('Bring Tiffany to your conversation');
      expect(hero.textContent).toContain('Tiffany personally reviews every inquiry and responds within two business days');
    });

    it('6.2: renders complete 9-field lead booking form with proper input types and validation attributes', () => {
      const formSection = doc.getElementById('booking_form');
      expect(formSection).toBeTruthy();
      
      const forms = doc.getForms();
      expect(forms.length).toBeGreaterThanOrEqual(1);
      const bookingForm = forms[0];
      expect(bookingForm.method).toBe('POST');
      expect(bookingForm.action).toBe('/api/leads');

      // Check required input fields
      const inputNames = bookingForm.inputs.map(i => i.name || i.id);
      expect(inputNames).toContain('contact_name');
      expect(inputNames).toContain('organization_name');
      expect(inputNames).toContain('email');
      expect(inputNames).toContain('phone');
      expect(inputNames).toContain('event_date');
      expect(inputNames).toContain('event_location');
      expect(inputNames).toContain('privacy_agreement');

      // Check select fields
      const selectNames = bookingForm.selects.map(s => s.name);
      expect(selectNames).toContain('event_type');
      expect(selectNames).toContain('estimated_audience_size');

      // Check textarea
      const textareaNames = bookingForm.textareas.map(t => t.name);
      expect(textareaNames).toContain('message');
    });

    it('6.3: validates event_type options include Keynote, Conference, School, Healthcare, Panel, Workshop, Media, Other', () => {
      const forms = doc.getForms();
      const eventTypeSelect = forms[0].selects.find(s => s.name === 'event_type');
      expect(eventTypeSelect).toBeTruthy();

      const optionValues = eventTypeSelect.options.map(o => o.value);
      expect(optionValues).toContain('Keynote');
      expect(optionValues).toContain('Conference');
      expect(optionValues).toContain('School or University');
      expect(optionValues).toContain('Healthcare Organization');
      expect(optionValues).toContain('Panel');
      expect(optionValues).toContain('Workshop');
      expect(optionValues).toContain('Media / Press Inquiry');
      expect(optionValues).toContain('Other');
    });

    it('6.4: renders What Happens Next 4-step workflow (Review, Discovery, Proposal, Delivery)', () => {
      const nextSteps = doc.getElementById('booking_next_steps');
      expect(nextSteps).toBeTruthy();
      expect(nextSteps.textContent).toContain('NEXT STEPS');
      expect(nextSteps.textContent).toContain('What happens next');

      const stepBoxes = doc.getElementsByClassName('step-box');
      expect(stepBoxes.length).toBe(4);
      expect(nextSteps.textContent).toContain('01 Review');
      expect(nextSteps.textContent).toContain('02 Discovery');
      expect(nextSteps.textContent).toContain('03 Proposal');
      expect(nextSteps.textContent).toContain('04 Delivery');
    });

    it('6.5: renders Alternative Contact with direct booking email booking@tiffanywebbimpact.com and nationwide positioning', () => {
      const altContact = doc.getElementById('booking_alt_contact');
      expect(altContact).toBeTruthy();
      expect(altContact.textContent).toContain('Alternative Inquiries');
      expect(altContact.textContent).toContain('booking@tiffanywebbimpact.com');
      expect(altContact.textContent).toContain('Based in Chicago Area, Illinois · Serving Nationwide');

      // Verify empty FAQ collapses
      const faqs = doc.getElementById('booking_faqs');
      expect(faqs).toBeNull();
    });
  });

  // ============================================================================
  // Feature 7: Page /insights & Article Template (3 Sections & Nav Logic)
  // ============================================================================
  describe('Feature 7: Page /insights & Article Template', () => {
    let res;
    let doc;

    beforeAll(async () => {
      res = await harness.request('/insights');
      doc = parseHTML(res.text);
    });

    it('7.1: renders Insights Hero with title and tagline', () => {
      expect(res.status).toBe(200);
      const hero = doc.getElementById('insights_hero');
      expect(hero).toBeTruthy();
      expect(hero.textContent).toContain('INSIGHTS & ARTICLES');
      expect(hero.textContent).toContain('Thinking out loud');
      expect(hero.textContent).toContain('Notes from the frontline of prevention');
    });

    it('7.2: renders Article Grid containing seed published essays', () => {
      const grid = doc.getElementById('insights_grid');
      expect(grid).toBeTruthy();
      const articles = doc.getElementsByClassName('article-card');
      expect(articles.length).toBe(3);

      expect(grid.textContent).toContain('What Gambling Prevention Actually Looks Like');
      expect(grid.textContent).toContain("Don't Bet on Your Future: Why Youth Prevention Starts With a Conversation");
      expect(grid.textContent).toContain('The Communities Prevention Reaches Last');
    });

    it('7.3: validates article card metadata (Category, Reading time badge, and excerpt)', () => {
      const grid = doc.getElementById('insights_grid');
      expect(grid.textContent).toContain('Prevention');
      expect(grid.textContent).toContain('Youth Prevention');
      expect(grid.textContent).toContain('Health Equity');
      expect(grid.textContent).toContain('5 min read');
      expect(grid.textContent).toContain('4 min read');
      expect(grid.textContent).toContain('Most prevention campaigns are designed for people who are already looking');
    });

    it('7.4: verifies Article Template container max-width 68ch and serif typography specification', () => {
      const templateContainers = doc.getElementsByClassName('article-template-container');
      expect(templateContainers.length).toBeGreaterThanOrEqual(1);
      expect(doc.html).toContain('max-width: 68ch');
      expect(doc.html).toContain('Instrument Serif');
    });

    it('7.5: verifies top navigation excludes /insights when published article count is < 6', () => {
      const links = doc.getLinks();
      const desktopNavLinks = links.filter(l => l.attributes && l.attributes.class && l.attributes.class.includes('nav-link'));
      const insightsNavLink = desktopNavLinks.find(l => l.href === '/insights');
      // With 3 seed articles (<6), Insights must NOT appear in main nav
      expect(insightsNavLink).toBeFalsy();
    });
  });

  // ============================================================================
  // Feature 8: Public REST APIs
  // ============================================================================
  describe('Feature 8: Public REST APIs', () => {
    it('8.1: GET /api/content/:slug returns structured JSON with page, content, and collections', async () => {
      const res = await harness.request('/api/content/about');
      expect(res.status).toBe(200);
      expect(res.json).toBeTruthy();
      expect(res.json.success).toBe(true);
      expect(res.json.page.slug).toBe('about');
      expect(res.json.content.hero).toBeTruthy();
      expect(res.json.content.hero.eyebrow).toBe('ABOUT TIFFANY WEBB');
      expect(res.json.collections.story_vignettes.length).toBe(6);
    });

    it('8.2: POST /api/leads creates new lead record, logs activity, and returns 201 with leadId', async () => {
      const leadPayload = {
        contact_name: 'Tier1 Test Organizer',
        organization_name: 'Illinois Health Alliance',
        email: 'tier1_lead@test.org',
        phone: '3125550199',
        event_type: 'Keynote',
        event_date: '2026-11-15',
        event_location: 'Chicago, IL',
        estimated_audience_size: '150–500',
        message: 'Tier 1 Automated Verification Lead',
        privacy_agreement: true
      };

      const res = await harness.request('/api/leads', {
        method: 'POST',
        body: leadPayload
      });

      expect(res.status).toBe(201);
      expect(res.json).toBeTruthy();
      expect(res.json.success).toBe(true);
      expect(res.json.leadId).toBeGreaterThan(0);

      // Verify in Database
      const leads = await query('SELECT * FROM leads WHERE id = ?', [res.json.leadId]);
      expect(leads.length).toBe(1);
      expect(leads[0].contact_name).toBe(leadPayload.contact_name);
      expect(leads[0].email).toBe(leadPayload.email);
      expect(leads[0].source).toBe('website_form');
      expect(leads[0].status).toBe('new');

      // Verify Activity Log
      const activity = await query('SELECT * FROM activity_log WHERE lead_id = ?', [res.json.leadId]);
      expect(activity.length).toBeGreaterThanOrEqual(1);
      expect(activity[0].action).toBe('lead_created');
    });

    it('8.3: POST /api/leads/batch ingests multiple leads from CSV array', async () => {
      const batchPayload = {
        leads: [
          { contact_name: 'Tier1 Batch 1', organization_name: 'Org 1', email: 'tier1_batch1@test.com', event_type: 'Workshop', event_date: '2026-12-01' },
          { contact_name: 'Tier1 Batch 2', organization_name: 'Org 2', email: 'tier1_batch2@test.com', event_type: 'Conference', event_date: '2026-12-05' }
        ]
      };

      const res = await harness.request('/api/leads/batch', {
        method: 'POST',
        body: batchPayload
      });

      expect(res.status).toBe(200);
      expect(res.json.success).toBe(true);
      expect(res.json.count).toBe(2);

      const inserted = await query('SELECT * FROM leads WHERE email IN (?, ?)', ['tier1_batch1@test.com', 'tier1_batch2@test.com']);
      expect(inserted.length).toBe(2);
    });

    it('8.4: POST /api/pages/:id/toggle updates page active status in database', async () => {
      const [page] = await query('SELECT id, is_active FROM website_pages WHERE slug = "terms"');
      expect(page).toBeTruthy();

      const res = await harness.request(`/api/pages/${page.id}/toggle`, {
        method: 'POST',
        body: { is_active: 0 }
      });
      expect(res.status).toBe(200);
      expect(res.json.success).toBe(true);

      const [updated] = await query('SELECT is_active FROM website_pages WHERE id = ?', [page.id]);
      expect(updated.is_active).toBe(0);

      // Revert back
      await harness.request(`/api/pages/${page.id}/toggle`, {
        method: 'POST',
        body: { is_active: 1 }
      });
    });

    it('8.5: POST /api/leads/bulk-delete deletes leads by status', async () => {
      // Insert temporary lead with status 'declined'
      const [resInsert] = await query('INSERT INTO leads (contact_name, organization_name, email, event_type, status) VALUES ("Tier1 Temp", "Temp", "tier1_declined@test.com", "Panel", "declined")');
      const tempId = resInsert.insertId;

      const res = await harness.request('/api/leads/bulk-delete', {
        method: 'POST',
        body: { status: 'declined' }
      });

      expect(res.status).toBe(200);
      expect(res.json.success).toBe(true);

      const check = await query('SELECT * FROM leads WHERE id = ?', [tempId]);
      expect(check.length).toBe(0);
    });
  });

  // ============================================================================
  // Feature 9: CRM CMS Admin Editing & Lead Management
  // ============================================================================
  describe('Feature 9: CRM CMS Admin Editing & Lead Management', () => {
    it('9.1: GET /cms renders list of all website pages with active status toggles', async () => {
      const res = await harness.request('/cms');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Content Management System');
      expect(res.text).toContain('About Tiffany');
      expect(res.text).toContain('Services &amp; Capabilities');
      expect(res.text).toContain('Speaking Topics');
      expect(res.text).toContain('Impact &amp; Engagements');
      expect(res.text).toContain('Media &amp; Press Kit');
      expect(res.text).toContain('Work With Tiffany');
      expect(res.text).toContain('Insights &amp; Articles');
    });

    it('9.2: GET /cms/:slug renders page editor with all editable sections and collections', async () => {
      const res = await harness.request('/cms/services');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Services &amp; Capabilities');
      expect(res.text).toContain('hero');
      expect(res.text).toContain('capabilities');
      expect(res.text).toContain('gear');
    });

    it('9.3: POST /cms/:slug/collection/:section/new creates new collection item', async () => {
      const res = await harness.request('/cms/about/collection/values_list/new', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: {
          title: 'Tier1 Test Value',
          subtitle: 'Tier 1 Subtitle',
          content_html: 'Description of test value',
          sort_order: 99
        }
      });

      // Express redirects to /cms/about?success=...
      expect(res.status).toBe(302);
      expect(res.redirectUrl).toContain('/cms/about');

      const items = await query('SELECT * FROM website_collections WHERE title = "Tier1 Test Value"');
      expect(items.length).toBe(1);

      // Clean up
      await query('DELETE FROM website_collections WHERE id = ?', [items[0].id]);
    });

    it('9.4: POST /lead/:id/status updates lead status and adds audit record in activity_log', async () => {
      const [newLead] = await query('INSERT INTO leads (contact_name, organization_name, email, event_type, status) VALUES ("Tier1 Status Lead", "Test Org", "tier1_status@test.com", "Keynote", "new")');
      const leadId = newLead.insertId;

      const res = await harness.request(`/lead/${leadId}/status`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: { status: 'qualified' }
      });

      expect(res.status).toBe(302);
      expect(res.redirectUrl).toContain(`/lead/${leadId}`);

      const [updated] = await query('SELECT status FROM leads WHERE id = ?', [leadId]);
      expect(updated.status).toBe('qualified');

      const logs = await query('SELECT * FROM activity_log WHERE lead_id = ? AND action = "status_changed"', [leadId]);
      expect(logs.length).toBe(1);
      expect(logs[0].detail).toContain('Status updated to qualified');

      // Clean up
      await deleteTestLeadsByEmail('tier1_status@test.com');
    });

    it('9.5: GET /dashboard renders Leads Dashboard with metrics, lead cards, and chart aggregations', async () => {
      const res = await harness.request('/dashboard');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Leads');
      expect(res.text).toContain('chartData');
    });
  });
});
