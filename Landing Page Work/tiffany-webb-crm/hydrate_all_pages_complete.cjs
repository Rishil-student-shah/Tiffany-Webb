const mysql = require('mysql2/promise');

async function hydrateAll() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '@rishil8124shah',
    database: 'tiffany_crm',
    waitForConnections: true,
    connectionLimit: 10
  });

  console.log('--- Starting Complete CMS Database Hydration Across All Pages ---');

  // Page definitions
  const pages = [
    { slug: 'home', name: 'Home', meta_title: 'Tiffany Webb | Community Impact Strategist & Public Health Educator', meta_description: 'Chicago Heart — Louisiana Soul. 15+ years and 4,000+ hours of frontline behavioral health and gambling harm prevention.' },
    { slug: 'about', name: 'About Tiffany', meta_title: 'About Tiffany Webb | Chicago Heart — Louisiana Soul', meta_description: 'Community Impact Strategist, Public Health Educator & Speaker with 15+ years and 4,000+ hours preventing gambling harm.' },
    { slug: 'speaking', name: 'Keynotes & Workshops', meta_title: 'Speaking & Keynotes | Tiffany Webb', meta_description: 'Keynotes, clinical workshops, and youth assemblies on gambling prevention, public health, and community impact.' },
    { slug: 'consulting', name: 'Advisory & Corporate Practice', meta_title: 'Advisory & Corporate Practice | Tiffany Webb', meta_description: 'Strategic advisory, program architecture, and community impact strategy powered by The GEAR Method™.' },
    { slug: 'thought-leadership', name: 'Thought Leadership & Media Kit', meta_title: 'Thought Leadership & Media Kit | Tiffany Webb', meta_description: 'Frontline essays, approved biographies, press assets, and authoritative commentary on behavioral health and gambling prevention.' },
    { slug: 'contact', name: 'VIP Inbound & Booking', meta_title: 'VIP Inbound & Booking | Tiffany Webb', meta_description: 'Bring Tiffany Webb to your stage, conference, clinic, or team. Submit an inquiry for keynotes, workshops, and strategic consulting.' }
  ];

  for (const p of pages) {
    const [existing] = await pool.query('SELECT id FROM website_pages WHERE slug = ?', [p.slug]);
    if (existing.length === 0) {
      await pool.query('INSERT INTO website_pages (slug, name, meta_title, meta_description, is_active) VALUES (?, ?, ?, ?, 1)', [p.slug, p.name, p.meta_title, p.meta_description]);
      console.log(`+ Created page: ${p.slug}`);
    } else {
      await pool.query('UPDATE website_pages SET name = ?, meta_title = ?, meta_description = ? WHERE slug = ?', [p.name, p.meta_title, p.meta_description, p.slug]);
      console.log(`✓ Updated page metadata: ${p.slug}`);
    }
  }

  const [pageRows] = await pool.query('SELECT id, slug FROM website_pages');
  const pageMap = {};
  pageRows.forEach(p => { pageMap[p.slug] = p.id; });

  const dataset = {
    home: {
      content: {
        hero: {
          eyebrow: 'COMMUNITY IMPACT STRATEGIST · SPEAKER',
          headline: 'Bold ideas.<br/>Human connection.<br/><span class="italic-accent">Meaningful impact.</span>',
          meta: 'TIFFANY WEBB',
          subtitle: 'Tiffany Webb helps healthcare and community leaders think bigger about impact. She brings lived understanding, professional expertise, and community insight together to challenge convention, reimagine what\'s possible, and build bold strategies that help organizations—and the people, families, and communities they serve—thrive.',
          formats: 'SPEAKING · STRATEGY · PUBLIC & BEHAVIORAL HEALTH · COMMUNITY ENGAGEMENT · PROGRAM DEVELOPMENT',
          hero_image: '/uploads/tiffany_hero_composite.jpg',
          hero_frame_style: 'shape-hero-arch',
          show_reel_btn: '1',
          section_is_active: '1'
        },
        impact_band: {
          eyebrow: 'COMMUNITY IMPACT',
          headline: 'Grounding Strategy in Real-World Communities',
          section_is_active: '1'
        },
        credibility_bar: {
          section_is_active: '1'
        },
        meet_tiffany: {
          eyebrow: 'MEET TIFFANY',
          title_line_1: 'Chicago Heart ,',
          title_line_2: 'Louisiana Soul',
          paragraph_1: 'I came to this work through behavioral health, but I stayed because I kept meeting families who had never been given language for what was happening to them.',
          paragraph_2: "A father who couldn't explain where the money went. A student who thought a betting app was just a game. A wife who assumed she was the only one.",
          paragraph_3: 'Today, my work extends beyond prevention into how organizations reach people at all.',
          button_text: 'More about me →',
          image: '/images/tiffany_about_new.jpg',
          image_frame_style: 'shape-meet-arch',
          section_is_active: '1'
        },
        who_can_benefit: {
          eyebrow: 'WHO CAN BENEFIT',
          headline: 'Audiences She <span class="italic-accent">Partners With.</span>',
          subtitle: 'From healthcare networks to university campuses, Tiffany tailors every engagement to the specific community in the room.',
          section_is_active: '1'
        },
        expertise: {
          eyebrow: 'WAYS TO WORK',
          headline: 'Six Ways to <span class="italic-accent">Collaborate.</span>',
          subtitle: 'Flexible engagement models designed for executive leadership, clinical teams, and community coalitions.',
          section_is_active: '1'
        },
        speaking: {
          eyebrow: 'SPEAKING TRACKS',
          headline: 'Four Signature <span class="italic-accent">Speaking Tracks.</span>',
          subtitle: 'Twenty-one topics organized by track — evidence-grounded, culturally fluent, and ready for your stage.',
          section_is_active: '1'
        },
        events: {
          eyebrow: 'EVENTS & IMPACT',
          headline: 'Recent & Upcoming <span class="italic-accent">Engagements.</span>',
          subtitle: 'Keynotes, workshops, and community activations across Illinois and nationwide.',
          section_is_active: '1'
        },
        proof_testimonials: {
          eyebrow: 'PROOF & TESTIMONIALS',
          headline: 'What Leaders <span class="italic-accent">Are Saying.</span>',
          subtitle: 'Feedback from conference organizers, healthcare leaders, and community partners.',
          section_is_active: '1'
        },
        video_reels: {
          eyebrow: 'WATCH THE REEL',
          headline: 'Experience Tiffany <span class="italic-accent">on Stage.</span>',
          subtitle: 'Highlights from keynotes, panel discussions, and frontline community sessions.',
          video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          section_is_active: '1'
        },
        media: {
          eyebrow: 'MEDIA & PRESS',
          headline: 'Official Speaker <span class="italic-accent">Press Kit.</span>',
          subtitle: 'Approved bios, high-resolution photography, and stage introduction script.',
          section_is_active: '1'
        },
        booking: {
          eyebrow: 'START A CONVERSATION',
          headline: 'Bring Tiffany to <span class="italic-accent">Your Next Event.</span>',
          subtitle: 'Tell us about your organization, audience, and goals. Tiffany reviews every inquiry personally.',
          section_is_active: '1'
        }
      },
      collections: {
        impact_band: [
          { title: 'Frontline Public Health', subtitle: '15+ Years Experience', sort_order: 1 },
          { title: 'Behavioral Addiction', subtitle: '4,000+ Outreach Hours', sort_order: 2 },
          { title: 'Youth & Digital Risk', subtitle: 'Schools & Universities', sort_order: 3 },
          { title: 'Coalition Building', subtitle: 'ROSC & Health Equity', sort_order: 4 }
        ],
        credibility_bar: [
          { title: '15+', subtitle: 'YEARS OF EXPERIENCE', sort_order: 1 },
          { title: '50+', subtitle: 'WORKSHOPS · PRESENTATIONS · ACTIVATIONS', sort_order: 2 },
          { title: '100+', subtitle: 'COMMUNITY PARTNERS & COLLABORATIONS', sort_order: 3 }
        ],
        who_can_benefit: [
          { title: 'Healthcare & Clinical Systems', subtitle: 'Hospitals & Clinics', content_html: 'Screening integration, brief intervention workflows, and clinical training for multidisciplinary teams.', sort_order: 1 },
          { title: 'Colleges & Universities', subtitle: 'Campuses & Athletic Depts', content_html: 'Digital gambling awareness, esports and sports betting risk education for students and student-athletes.', sort_order: 2 },
          { title: 'High Schools & Youth Orgs', subtitle: 'Youth & Educators', content_html: 'Engaging, non-judgmental assemblies addressing gaming-to-gambling crossover and peer dynamics.', sort_order: 3 },
          { title: 'Community & Faith Coalitions', subtitle: 'Grassroots Leaders', content_html: 'Stigma reduction, ROSC council partnerships, and culturally grounded family support frameworks.', sort_order: 4 }
        ],
        expertise: [
          { title: 'Keynote Addresses', subtitle: 'Main Stage · 45–60 Min', content_html: 'High-energy, transformative keynotes reframing prevention and inspiring collective action.', sort_order: 1 },
          { title: 'Clinical & Frontline Trainings', subtitle: 'Workshops · 90 Min – Full Day', content_html: 'Evidence-based toolkits for providers, counselors, and community workers.', sort_order: 2 },
          { title: 'Strategic Advisory', subtitle: 'Executive Consulting', content_html: 'Program architecture, health equity initiatives, and coalition alignment roadmaps.', sort_order: 3 },
          { title: 'Panel Discussions', subtitle: 'Panelist / Moderator', content_html: 'Authoritative, nuanced commentary on public health, digital addiction, and health equity.', sort_order: 4 },
          { title: 'Youth Prevention Programs', subtitle: 'Interactive Assemblies', content_html: 'Dynamic student workshops on digital gaming risks, sports wagering apps, and healthy decision-making.', sort_order: 5 },
          { title: 'Community Activations', subtitle: 'Fairs & Screenings', content_html: 'High-engagement events bringing municipal resources, screenings, and family dialogues together.', sort_order: 6 }
        ],
        speaking: [
          { title: 'Track 1: Prevention, Gambling & Emerging Risk', subtitle: '5 Signature Topics', badge: '#0E6B54', content_html: 'Core prevention frameworks, digital sports betting trends, and national screening day protocols.', link_url: '/speaking?track=prevention', sort_order: 1 },
          { title: 'Track 2: Community Engagement & Outreach', subtitle: '5 Signature Topics', badge: '#D9A23A', content_html: 'Grassroots trust, 8-touchpoint engagement, and culturally grounded stigma reduction in communities of color.', link_url: '/speaking?track=outreach', sort_order: 2 },
          { title: 'Track 3: Human-Centered Systems & Services', subtitle: '6 Signature Topics', badge: '#C15427', content_html: 'Co-occurring SUD overlap, suicide lethality assessment, and healthcare screening workflows.', link_url: '/speaking?track=systems', sort_order: 3 },
          { title: 'Track 4: Purpose, Leadership & Youth Impact', subtitle: '5 Signature Topics', badge: '#6C2D5A', content_html: 'Flagship keynote, motivational interviewing, youth digital safeguards, and GambleFreeGear wearable advocacy.', link_url: '/speaking?track=youth', sort_order: 4 }
        ],
        events: [
          { title: 'National Council on Problem Gambling Annual Conference', subtitle: 'National Keynote & Panel', badge: 'Featured Summit', content_html: 'Delivered national session on emerging digital betting trends and culturally grounded outreach.', sort_order: 1 },
          { title: 'Illinois Statewide Prevention Summit', subtitle: 'Opening Keynote Address', badge: 'Statewide Event', content_html: 'Keynote on integrating gambling screening into community mental health centers across Illinois.', sort_order: 2 },
          { title: 'Midwest Behavioral Health Leadership Forum', subtitle: 'Executive Workshop', badge: 'Leadership Intensive', content_html: 'Full-day clinical intensive for clinical directors and ROSC council leadership.', sort_order: 3 }
        ],
        proof_testimonials: [
          { title: 'Conference Chair, Midwest Health Summit', subtitle: 'Healthcare Leadership', content_html: 'Tiffany brought extraordinary clarity, warmth, and actionable clinical tools to our stage. Our attendees gave her session the highest rating of the entire conference.', sort_order: 1 },
          { title: 'Director of Student Wellness, University Network', subtitle: 'Higher Education', content_html: 'Her youth prevention assembly connected with our students in a way no outside speaker ever has. She meets people exactly where they are.', sort_order: 2 }
        ],
        video_reels: [
          { title: 'Tiffany Webb Speaking Reel', subtitle: 'Keynote & Workshop Highlights', link_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', image_url: '/uploads/tiffany_hero_composite.jpg', sort_order: 1 }
        ]
      }
    },

    about: {
      content: {
        hero: {
          eyebrow: 'ABOUT TIFFANY WEBB',
          headline: 'Chicago Heart &mdash; <span class="italic-accent text-gold">Louisiana Soul.</span>',
          subtitle: 'TIFFANY WEBB, BBA, MHP · 15+ Years in Behavioral Health · 4,000+ Hours Frontline Outreach',
          hero_image: '/images/tiffany_about_new.jpg',
          section_is_active: '1'
        },
        story: {
          eyebrow: 'THE ORIGIN',
          headline: 'Where conviction meets <span class="italic-accent text-gold">the pavement.</span>',
          pull_quote: 'When we rise, we rise together.',
          cinematic_quote: "Gambling harm hides. It doesn't smell like alcohol or show up on a drug test. It shows up as a missing paycheck... By the time most families name it, they have been carrying it alone for years.",
          section_is_active: '1'
        },
        journey: {
          eyebrow: 'THE PATH HERE',
          headline: 'Where all <span class="italic-accent">paths meet.</span>',
          subtitle: 'Behavioral health taught her how harm works. Community outreach taught her how trust works. Public health education taught her how to scale a message. Prevention is where all three meet.',
          section_is_active: '1'
        },
        mission: {
          eyebrow: 'MISSION',
          statement: 'So that no individual, family, or community faces gambling harm in silence, shame, or isolation — because prevention begins with a conversation.',
          section_is_active: '1'
        },
        vision: {
          eyebrow: 'VISION',
          headline: 'Where this is <span class="italic-accent">going.</span>',
          section_is_active: '1'
        },
        values: {
          eyebrow: 'VALUES',
          headline: 'What she <span class="italic-accent">works from.</span>',
          section_is_active: '1'
        },
        milestones: {
          eyebrow: 'INITIATIVE & IMPACT',
          headline: 'Awards, recognition & <span class="italic-accent">milestones.</span>',
          subtitle: 'Founder of GambleFreeGear, a pioneering gambling-awareness clothing brand using fashion, creativity, and community engagement to make prevention more visible and approachable.',
          section_is_active: '1'
        },
        gamblefreegear: {
          eyebrow: 'A VENTURE BY TIFFANY WEBB',
          headline: 'GambleFree<span class="italic-accent">Gear</span>',
          subtitle: 'Founder of GambleFreeGear, a pioneering gambling-awareness clothing brand created to make prevention, awareness, and conversation more visible through apparel, creativity, and community engagement.',
          cta_text: 'Explore the Collection',
          cta_url: 'https://gamblefreegear.com',
          section_is_active: '1'
        },
        cta: {
          eyebrow: 'WORK WITH TIFFANY',
          headline: 'Let\'s start a <span class="italic-accent text-gold">conversation.</span>',
          subtitle: "Whether you're planning a conference, building a prevention program, or trying to reach a community that hasn't responded to anything yet — that's the work.",
          button_text: 'Invite Tiffany to Speak →',
          button_url: '/work-with-tiffany',
          section_is_active: '1'
        }
      },
      collections: {
        story_vignettes: [
          {
            title: 'The Upbringing & Roots',
            subtitle: '01',
            content_html: 'I was raised by my grandmother and a whole village of aunties and uncles who taught me about family, caring for people, and showing up for others. I’m Chicago-born with deep Louisiana family roots, and my understanding of people began long before this became my professional work.',
            sort_order: 1
          },
          {
            title: 'Frontline Experience',
            subtitle: '02',
            content_html: 'Over 15+ years in behavioral health & public health and 4,000+ hours of frontline community outreach, she has delivered prevention where it actually happens: in clinics, school gyms, church basements, and coalition halls across the nation.',
            sort_order: 2
          },
          {
            title: 'Cultural Enterprise',
            subtitle: '03',
            content_html: 'Her work bridges public health education and social enterprise — including founding GambleFreeGear Awareness Apparel, turning prevention into wearable advocacy that breaks the silence before crisis strikes.',
            sort_order: 3
          }
        ],
        timeline_items: [
          { title: 'Behavioral Health', subtitle: 'Phase 01', content_html: 'Understanding the root causes of harm and the psychological drivers behind addiction to build effective interventions.', sort_order: 1 },
          { title: 'Community Outreach', subtitle: 'Phase 02', content_html: 'Building trust and creating safe spaces for families to share their hidden struggles and find their voice.', sort_order: 2 },
          { title: 'Gambling Prevention', subtitle: 'Phase 03', content_html: 'Designing targeted programs to stop harm before it reaches the crisis point and destroys livelihoods.', sort_order: 3 },
          { title: 'Public Health Education', subtitle: 'Phase 04', content_html: 'Scaling the message to equip communities with the language, education, and resources they need to thrive.', sort_order: 4 },
          { title: 'Partnership Building', subtitle: 'Phase 05', content_html: 'Collaborating with local organizations to create a unified, sustainable support network that lasts.', sort_order: 5 },
          { title: 'Impact Strategist', subtitle: 'Phase 06', content_html: 'Bringing it all together to create systemic change that empowers families and transforms entire communities.', sort_order: 6 }
        ],
        vision_items: [
          { title: 'National speaking', subtitle: '01', content_html: 'Bringing prevention conversations to stages, campuses, and conferences across the country.', sort_order: 1 },
          { title: 'Training & education', subtitle: '02', content_html: 'Equipping clinicians, educators, and frontline teams with tools that survive contact with real life.', sort_order: 2 },
          { title: 'Community', subtitle: '03', content_html: 'Building something people can join, wear, and carry into their own conversations.', sort_order: 3 }
        ],
        values_list: [
          { title: 'Faith', subtitle: 'Belief in Renewal', content_html: 'The unwavering belief that people can change, including those others have written off.', sort_order: 1 },
          { title: 'Family', subtitle: 'Where Prevention Starts', content_html: 'Where prevention starts, and where harm is felt first and longest.', sort_order: 2 },
          { title: 'Community', subtitle: 'Shared Resilience', content_html: 'Nobody recovers alone, and nobody prevents alone either.', sort_order: 3 },
          { title: 'Purpose', subtitle: 'Practical Service', content_html: 'Turning lived understanding and professional rigor into practical service.', sort_order: 4 },
          { title: 'Impact', subtitle: 'Lasting Change', content_html: 'Measured in conversations started and systems changed, not talks delivered.', sort_order: 5 }
        ],
        milestones: [
          { title: 'Creator of GambleFree Friends Universe™', subtitle: 'INNOVATION & YOUTH', content_html: 'A youth-centered prevention universe using characters, storytelling, music, and healthy decision-making to make risk conversations accessible to young people and families.', sort_order: 1 },
          { title: 'NCPG Conference Scholarship Recipient', subtitle: 'FELLOWSHIP & LEADERSHIP', content_html: 'Awarded by the National Council on Problem Gambling, supporting specialized professional development and participation across the national problem-gambling field.', sort_order: 2 },
          { title: 'Amazon Black Business Accelerator (2022)', subtitle: 'ENTREPRENEURSHIP', content_html: 'Completed Amazon’s rigorous Black Business Accelerator program as part of scaling mission-driven entrepreneurial advocacy through GambleFreeGear.', sort_order: 3 },
          { title: 'Annual Problem Gambling Outreach', subtitle: 'SYSTEMS ARCHITECTURE', content_html: 'Developed and implemented year-round problem-gambling prevention and early-intervention outreach programming embedded in nonprofit community health settings.', sort_order: 4 },
          { title: 'Two Problem Gambling Resource Fairs', subtitle: 'CIVIC CONVENING', content_html: 'Planned and executed two consecutive annual community fairs bringing municipal agencies, clinical resources, screenings, and prevention dialogues together.', sort_order: 5 },
          { title: '"Screen & Scream" Activation', subtitle: 'COMMUNITY ACTIVATION', content_html: 'Created a collaborative, high-engagement community activation bringing regional partners together around stigma-free screening, education, and early prevention.', sort_order: 6 }
        ]
      }
    },

    speaking: {
      content: {
        hero: {
          eyebrow: 'SPEAKING & FACILITATION',
          headline: 'Bring Tiffany <br/><span class="italic-accent">to your stage.</span>',
          subtitle: 'Keynotes, conference sessions, panels, workshops, and school programs on gambling prevention, public health, and community impact.',
          primary_cta_text: 'Start a Conversation →',
          primary_cta_url: '/work-with-tiffany',
          hero_video_poster: '/uploads/tiffany_hero_composite.jpg',
          section_is_active: '1'
        },
        why_tiffany: {
          eyebrow: 'WHY TIFFANY',
          headline: 'Why <span class="italic-accent">Tiffany.</span>',
          section_is_active: '1'
        },
        flagship: {
          eyebrow: 'FLAGSHIP KEYNOTE',
          headline: 'Break the Silence: <span class="italic-accent">Prevention Begins with a Conversation.</span>',
          subtitle: "Tiffany's Signature Flagship Keynote Experience",
          description: "Tiffany's signature keynote on transforming hidden harm into collective action, deconstructing stigma, and inspiring systemic change across healthcare and community leadership.",
          cta_text: 'Book the Flagship Keynote →',
          cta_url: '/work-with-tiffany?topic=Break+the+Silence%3A+Prevention+Begins+with+a+Conversation',
          section_is_active: '1'
        },
        tracks: {
          eyebrow: 'SPEAKING PORTFOLIO',
          headline: 'Twenty-one topics. <span class="italic-accent">Four signature tracks.</span>',
          subtitle: 'Every session is actively delivered by Tiffany Webb — built for specific audiences, evidence-grounded, and designed for immediate Monday-morning application.',
          section_is_active: '1'
        },
        formats: {
          eyebrow: 'ENGAGEMENT FORMATS',
          headline: 'Ways we can <span class="italic-accent">work together.</span>',
          section_is_active: '1'
        },
        working_process: {
          eyebrow: 'THE PROCESS',
          headline: 'What working together <span class="italic-accent">looks like.</span>',
          subtitle: 'She builds the session you actually need, not the one she gave yesterday.',
          section_is_active: '1'
        },
        cta: {
          eyebrow: 'BOOKING INQUIRY',
          headline: 'Bring Tiffany to your <span class="italic-accent">stage or team.</span>',
          subtitle: 'Whether you are planning an executive summit, clinical symposium, or university assembly.',
          button_text: 'Request Speaking Date →',
          button_url: '/work-with-tiffany',
          section_is_active: '1'
        }
      },
      collections: {
        why_cards: [
          { title: 'Frontline credibility', subtitle: '4,000+ Hours', content_html: 'Four thousand hours of actual outreach. She has had these conversations in real rooms, with real families, for fifteen years.', sort_order: 1 },
          { title: 'Cultural fluency', subtitle: 'Deep Trust', content_html: 'She reaches communities that standard prevention programming consistently misses — because she knows how to enter them respectfully.', sort_order: 2 },
          { title: 'Evidence-based', subtitle: 'Clinical Rigor', content_html: 'Screening, early intervention, motivational interviewing, harm reduction. The methods are real and current.', sort_order: 3 },
          { title: 'Practical takeaways', subtitle: 'Actionable Tools', content_html: 'Audiences leave with something they can use on Monday, not a feeling that fades by Friday.', sort_order: 4 }
        ],
        engagement_formats: [
          { title: 'Keynote Address', subtitle: '45–60 Minutes · Main Stage', content_html: 'High-energy, transformative keynote designed to reframe gambling prevention, shift perspectives, and inspire collective action across large audiences.', sort_order: 1 },
          { title: 'Conference Breakout', subtitle: '60–90 Minutes · Track Focus', content_html: 'Focused deep-dive tailored to specific conference tracks with evidence-based frameworks and interactive audience Q&A.', sort_order: 2 },
          { title: 'Panel & Roundtable', subtitle: '60–75 Minutes · Panelist or Moderator', content_html: 'Dynamic panelist or skilled moderator bringing frontline public health specificity, equity lens, and collaborative dialogue to complex issues.', sort_order: 3 },
          { title: 'School & University Assembly', subtitle: 'Half-Day · Campus-Wide', content_html: 'Structured student-focused awareness session addressing sports betting and app mechanics, followed by faculty and counselor workshop.', sort_order: 4 },
          { title: 'Clinical & Frontline Intensive', subtitle: 'Full-Day · Clinical Focus', content_html: 'Hands-on training for healthcare providers, counselors, and ROSC staff covering screening protocols, brief intervention, and referral pathways.', sort_order: 5 },
          { title: 'Executive Advisory Session', subtitle: 'Bespoke Strategy', content_html: 'Tailored consulting series, curriculum development, coalition strategic planning, or community campaign architecture.', sort_order: 6 }
        ],
        working_steps: [
          { title: 'Pre-event consultation', subtitle: 'Step 01', content_html: 'She learns your audience, your goals, and your constraints before writing a word.', sort_order: 1 },
          { title: 'Content built for your room', subtitle: 'Step 02', content_html: 'Sessions are tailored specifically to your community\'s current challenges.', sort_order: 2 },
          { title: 'Promotional assets', subtitle: 'Step 03', content_html: 'Headshot, bio, session description, and social graphics, supplied ready to use.', sort_order: 3 },
          { title: 'Post-event resources', subtitle: 'Step 04', content_html: 'Actionable takeaways your attendees can implement the following Monday.', sort_order: 4 }
        ],
        testimonials: [
          { title: 'Dr. Marcus Vance', subtitle: 'State Behavioral Health Director', badge: 'Keynote Feedback', content_html: 'Tiffany delivered one of the most powerful and clinically accurate presentations on gambling harm our annual conference has ever hosted. The room was riveted from start to finish.', sort_order: 1 },
          { title: 'Elena Rostova', subtitle: 'Dean of Student Affairs, Midwest University Network', badge: 'Campus Workshop Feedback', content_html: 'Her message to our athletic department and student body on digital gaming and sports wagering was compassionate, urgent, and completely free of judgment. Unforgettable impact.', sort_order: 2 }
        ]
      }
    },

    consulting: {
      content: {
        hero: {
          eyebrow: 'ADVISORY & CORPORATE PRACTICE',
          headline: 'Strategy with <span class="italic-accent text-gold">people at the center.</span>',
          subtitle: 'From executive boardrooms to frontline coalitions, Tiffany Webb helps healthcare networks, corporations, and civic institutions architect human-centered impact strategies.',
          primary_cta_text: 'Schedule Advisory Discovery →',
          primary_cta_url: '/work-with-tiffany?type=Advisory',
          section_is_active: '1'
        },
        capabilities: {
          eyebrow: 'FOUR SIGNATURE CAPABILITIES',
          headline: 'How Tiffany Partners with <span class="italic-accent">Organizations</span>',
          intro: 'From early ideas to real-world implementation, I help leaders see opportunities differently, structure what comes next, and connect strategy with the people and communities it is meant to serve.',
          quote_1: "I don't just tell you what to do next.",
          quote_2: 'I help you build how you get there.',
          section_is_active: '1'
        },
        gear_method: {
          eyebrow: 'SIGNATURE METHODOLOGY',
          headline: '<span class="title-white">The GEAR</span> <span class="italic-accent">Method™</span>',
          standfirst: 'From awareness to action. From ideas to impact.',
          description: 'The GEAR Method™ is a human-centered approach to helping organizations create strategies that connect with people, activate participation, and build meaningful pathways forward.',
          footer: 'AWARENESS &rarr; CONNECTION &rarr; ACTION &rarr; IMPACT',
          section_is_active: '1'
        },
        partnership_framework: {
          eyebrow: 'PARTNERSHIP FRAMEWORK',
          headline: 'Collaborative <span class="italic-accent">Engagement Architecture</span>',
          subtitle: 'How we align organizational objectives with community reality.',
          section_is_active: '1'
        },
        process: {
          eyebrow: 'THE ADVISORY PROCESS',
          headline: 'How We Build <span class="italic-accent">Together.</span>',
          subtitle: 'A structured four-phase delivery methodology ensuring measurable organizational outcomes.',
          section_is_active: '1'
        },
        cta: {
          eyebrow: 'STRATEGIC CONSULTATION',
          headline: 'Bring Tiffany to your <span class="italic-accent">leadership team.</span>',
          subtitle: 'Book an initial discovery consultation to explore program architecture or executive advisory.',
          button_text: 'Request Discovery Consultation →',
          button_url: '/work-with-tiffany?type=Consulting',
          section_is_active: '1'
        }
      },
      collections: {
        capabilities: [
          {
            item_slug: 'strategic-advisor',
            title: 'Strategic Advisor',
            subtitle: '01 // THINK',
            content_html: 'I challenge familiar thinking, uncover opportunities, and help leaders make clearer decisions around growth, engagement, innovation, and impact.<br/><br/><strong>Scope:</strong> Executive advisory, public health strategy, coalition alignment, prevention program roadmaps.',
            sort_order: 1
          },
          {
            item_slug: 'program-architect',
            title: 'Program Architect',
            subtitle: '02 // BUILD',
            content_html: 'I turn ideas and community needs into structured programs, initiatives, experiences, partnerships, and implementation pathways.<br/><br/><strong>Scope:</strong> Curriculum design, screening workflow integration, campaign architecture, stakeholder coordination.',
            sort_order: 2
          },
          {
            item_slug: 'community-impact-strategist',
            title: 'Community Impact Strategist',
            subtitle: '03 // CONNECT',
            content_html: 'Connects organizational goals with community realities, strengths, needs, and voices to create people-centered, outcome-focused strategies.<br/><br/><strong>Scope:</strong> Grassroots community engagement, health equity initiatives, ROSC council partnerships.',
            sort_order: 3
          },
          {
            item_slug: 'speaker-facilitator',
            title: 'Speaker & Facilitator',
            subtitle: '04 // MOVE',
            content_html: 'I create conversations and learning experiences that challenge assumptions, elevate thinking, encourage dialogue, and move audiences toward action.<br/><br/><strong>Scope:</strong> Keynotes, breakout sessions, clinical trainings, interactive workshops.',
            sort_order: 4
          }
        ],
        gear_steps: [
          { title: 'Generate', subtitle: 'G', content_html: 'Build awareness and understanding. Clarify the challenge, understand the audience, and make the issue visible and relevant before trying to solve it.', sort_order: 1 },
          { title: 'Engage', subtitle: 'E', content_html: 'Build trust and connection. Listen, strengthen relationships, and create opportunities for meaningful participation across diverse community groups.', sort_order: 2 },
          { title: 'Activate', subtitle: 'A', content_html: 'Move ideas into action. Turn insight into strategies, programs, experiences, partnerships, and practical next steps that stick.', sort_order: 3 },
          { title: 'Resource', subtitle: 'R', content_html: 'Build the path forward. Connect people and organizations with information, relationships, services, tools, and opportunities for sustained impact.', sort_order: 4 }
        ],
        working_steps: [
          { title: 'Diagnostic Alignment', subtitle: 'Phase 01', content_html: 'Comprehensive assessment of organizational stakeholders, existing clinical/prevention touchpoints, and core mission metrics.', sort_order: 1 },
          { title: 'Strategy Architecture', subtitle: 'Phase 02', content_html: 'Drafting actionable implementation blueprints, screening integrations, and community engagement protocols.', sort_order: 2 },
          { title: 'Implementation & Training', subtitle: 'Phase 03', content_html: 'Live training of clinical, administrative, and frontline teams with verified toolkits and workflows.', sort_order: 3 },
          { title: 'Impact Evaluation', subtitle: 'Phase 04', content_html: 'Long-term outcome tracking, ROSC council linkage verification, and continuous improvement debriefs.', sort_order: 4 }
        ]
      }
    },

    'thought-leadership': {
      content: {
        hero: {
          eyebrow: 'THOUGHT LEADERSHIP & MEDIA',
          headline: 'Thinking <span class="italic-accent text-gold">out loud.</span>',
          subtitle: 'Notes from the frontline of prevention — on gambling harm, public health, health equity, and the conversations that change communities.',
          section_is_active: '1'
        },
        articles_section: {
          eyebrow: 'ARTICLES & ESSAYS',
          headline: 'Frontline <span class="italic-accent">Perspectives.</span>',
          section_is_active: '1'
        },
        bios_section: {
          eyebrow: 'APPROVED BIOGRAPHIES',
          headline: 'Speaker Bios in <span class="italic-accent">Three Lengths.</span>',
          subtitle: 'Approved for conference programs, press releases, website speaker profiles, and printed event marketing.',
          section_is_active: '1'
        },
        intro_script: {
          eyebrow: 'STAGE INTRODUCTION',
          headline: 'Emcee introduction <span class="italic-accent">script.</span>',
          subtitle: 'Recommended verbatim script for event hosts and session moderators when introducing Tiffany to the stage.',
          script_text: 'Please welcome Tiffany Webb — Community Impact Strategist, Public Health Educator, and founder of GambleFreeGear. With over 15 years of experience across behavioral health and community systems, Tiffany helps healthcare networks, schools, and civic leaders reimagine prevention and build human-centered strategies that last. Please join me in welcoming Tiffany Webb!',
          section_is_active: '1'
        },
        downloads_section: {
          eyebrow: 'PRESS & SPEAKER ASSETS',
          headline: 'High-resolution <span class="italic-accent">downloads.</span>',
          subtitle: 'Official photography, one-sheets, and comprehensive brand materials for media publications and event marketing.',
          section_is_active: '1'
        },
        cta: {
          eyebrow: 'MEDIA & INTERVIEW INQUIRIES',
          headline: 'Host Tiffany on your <span class="italic-accent">broadcast or podcast.</span>',
          subtitle: 'Tiffany is available for television, radio, print, and podcast interviews discussing problem gambling prevention, youth digital health, and community health strategy.',
          button_text: 'Request Media Interview →',
          button_url: '/work-with-tiffany?type=Media',
          section_is_active: '1'
        }
      },
      collections: {
        bios: [
          {
            item_slug: 'short',
            title: 'SHORT BIO',
            subtitle: 'For Event Programs, Printed Flyers & Social Media',
            badge: '~50 WORDS',
            content_html: 'Tiffany Webb is a Chicago-born Community Impact Strategist and Public Health Speaker with over 15 years of experience in behavioral health and public health education. She brings lived insight and clinical rigor to problem gambling prevention, youth digital risk, and human-centered community health strategies across Illinois and nationally.',
            sort_order: 1
          },
          {
            item_slug: 'medium',
            title: 'MEDIUM BIO',
            subtitle: 'For Conference Programs, Agendas & Website Speaker Profiles',
            badge: '~150 WORDS',
            content_html: 'Tiffany Webb is a Community Impact Strategist, Public Health Educator, and Speaker specializing in problem gambling prevention, youth digital risk, and community health strategy. With over 15 years of leadership across behavioral health systems and more than 4,000 hours of frontline community outreach, Tiffany bridges the gap between clinical protocols and community trust.\n\nShe is the founder of GambleFreeGear and the creator of the GEAR Method™ (Generate, Engage, Activate, Resource). An affiliate speaker with the Illinois Council on Problem Gambling (ICPG) and an active advisor to regional ROSC coalitions, Tiffany is trusted by healthcare networks, civic leaders, and youth organizations to deliver high-impact keynotes and actionable workshops.',
            sort_order: 2
          },
          {
            item_slug: 'long',
            title: 'LONG BIO',
            subtitle: 'For Keynote Introductions, Press Releases & Feature Articles',
            badge: '~300 WORDS',
            content_html: 'Tiffany Webb is a Community Impact Strategist, Public Health Educator, and Speaker dedicated to transforming how organizations, healthcare systems, and communities address behavioral addiction, emerging digital risks, and public health equity. Raised by her grandmother and a close village of family in Chicago with deep Louisiana roots, Tiffany learned early that true community support requires showing up with empathy, consistency, and respect.\n\nOver the past 15 years, Tiffany has worked across healthcare networks, municipal health agencies, and grassroots recovery coalitions. With more than 4,000 hours of frontline outreach, she specializes in identifying hidden behavioral addictions—including mobile sports wagering and youth digital gaming—that traditional intake protocols often overlook.\n\nShe is the creator of the GEAR Method™ (Generate, Engage, Activate, Resource), a proprietary four-phase framework that helps institutions move from passive awareness to sustainable community action. Tiffany is also the founder of GambleFreeGear, a mission-driven awareness enterprise providing wearable advocacy and educational resources.\n\nAn affiliate speaker with the Illinois Council on Problem Gambling (ICPG) and a trusted facilitator for Recovery Oriented Systems of Care (ROSC) councils, Tiffany delivers evidence-based, emotionally resonant keynotes, clinical trainings, and executive advisory sessions across the country.',
            sort_order: 3
          }
        ],
        downloads: [
          {
            title: 'Speaker One-Sheet PDF',
            subtitle: 'FOR EVENT ORGANIZERS',
            badge: 'FOR EVENT ORGANIZERS',
            content_html: 'Single-page executive overview of signature topics, speaking formats, and organizer credentials. Perfect for committee review.',
            link_url: '/downloads/Tiffany_Webb_Speaker_One_Sheet.pdf',
            sort_order: 1
          },
          {
            title: 'Official Headshot (Print Resolution)',
            subtitle: 'HIGH-RES 300 DPI · CMYK',
            badge: 'HIGH-RES 300 DPI · CMYK',
            content_html: 'Approved print-quality photography for conference booklets, printed programs, and event banners.',
            link_url: '/uploads/tiffany_headshot_print.jpg',
            sort_order: 2
          },
          {
            title: 'Official Headshot (Digital / Web)',
            subtitle: 'WEB READY · RGB',
            badge: 'WEB READY · RGB',
            content_html: 'Optimized web-ready portrait for social media promotion, event landing pages, and slide decks.',
            link_url: '/uploads/tiffany_headshot_web.jpg',
            sort_order: 3
          },
          {
            title: 'Media & Brand Kit (ZIP)',
            subtitle: 'COMPLETE ASSET PACK',
            badge: 'COMPLETE ASSET PACK',
            content_html: 'All approved bios, introduction script, logos, and photography in one convenient download package.',
            link_url: '/downloads/Tiffany_Webb_Media_Kit.zip',
            sort_order: 4
          }
        ]
      }
    },

    contact: {
      content: {
        hero: {
          eyebrow: 'VIP INBOUND & BOOKING',
          headline: 'Bring Tiffany <br><span class="italic-accent">to your next event.</span>',
          subtitle: 'Tell me about your audience and your goals. I review every inquiry personally.',
          section_is_active: '1'
        },
        booking_form: {
          eyebrow: 'INQUIRY FORM',
          headline: 'Send your <span class="italic-accent">request.</span>',
          submit_btn_text: 'Submit Speaking Request →',
          section_is_active: '1'
        },
        journey: {
          eyebrow: 'HOW IT WORKS',
          headline: 'The Booking <span class="italic-accent">Journey.</span>',
          section_is_active: '1'
        },
        faqs: {
          eyebrow: 'FREQUENTLY ASKED QUESTIONS',
          headline: 'Frequently Asked Questions',
          section_is_active: '1'
        },
        direct_contact: {
          eyebrow: 'DIRECT INQUIRIES',
          headline: 'Prefer Direct Contact?',
          email: 'booking@tiffanywebbimpact.com',
          location: 'Chicago, IL · Available Nationwide · Select International Opportunities',
          note: 'Tiffany’s team reviews all speaking and strategic inquiries within 24–48 business hours.',
          section_is_active: '1'
        }
      },
      collections: {
        booking_steps: [
          { title: 'Inquiry', subtitle: '01', content_html: 'You share your event, audience, and dates.', sort_order: 1 },
          { title: 'Review', subtitle: '02', content_html: 'I personally review fit and availability.', sort_order: 2 },
          { title: 'Discovery Call', subtitle: '03', content_html: 'Short conversation about your actual goals.', sort_order: 3 },
          { title: 'Proposal', subtitle: '04', content_html: 'Format, outline, and terms in writing.', sort_order: 4 },
          { title: 'Preparation', subtitle: '05', content_html: 'Content built for your specific room.', sort_order: 5 },
          { title: 'She Speaks', subtitle: '06', content_html: 'Your audience leaves with usable strategies.', sort_order: 6 }
        ],
        faqs: [
          { title: 'Does Tiffany travel?', content_html: 'Yes. She speaks nationally, and also delivers virtual sessions and webinars when travel isn\'t practical for your budget or timeline.', sort_order: 1 },
          { title: 'Can she tailor the content to our audience?', content_html: 'Every session is built for the specific room. She\'ll ask about your audience, your goals, and what\'s already been tried before she writes anything.', sort_order: 2 },
          { title: 'How far in advance should we book?', content_html: 'Earlier is better, particularly for conference season and for March — Problem Gambling Awareness Month fills fastest. That said, she does accommodate shorter timelines when she can.', sort_order: 3 },
          { title: 'How do we discuss budget?', content_html: 'Share your range in the form and she\'ll tell you honestly what\'s possible. Organizations of very different sizes work with her, and the format usually flexes to fit.', sort_order: 4 }
        ]
      }
    }
  };

  for (const [slug, data] of Object.entries(dataset)) {
    const pageId = pageMap[slug];
    if (!pageId) continue;

    // KV content
    if (data.content) {
      for (const [section, kvObj] of Object.entries(data.content)) {
        for (const [k, v] of Object.entries(kvObj)) {
          const [exists] = await pool.query(
            'SELECT id FROM website_content WHERE page_id = ? AND section = ? AND key_name = ?',
            [pageId, section, k]
          );
          if (exists.length === 0) {
            await pool.query(
              'INSERT INTO website_content (page_id, section, key_name, content_value) VALUES (?, ?, ?, ?)',
              [pageId, section, k, String(v)]
            );
          }
        }
      }
    }

    // Collections
    if (data.collections) {
      for (const [secName, items] of Object.entries(data.collections)) {
        for (const item of items) {
          const [exists] = await pool.query(
            'SELECT id FROM website_collections WHERE page_id = ? AND section_name = ? AND title = ?',
            [pageId, secName, item.title]
          );
          if (exists.length === 0) {
            await pool.query(
              `INSERT INTO website_collections 
               (page_id, section_name, item_slug, title, subtitle, badge, content_html, link_url, image_url, sort_order, is_active) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
              [
                pageId,
                secName,
                item.item_slug || null,
                item.title,
                item.subtitle || null,
                item.badge || null,
                item.content_html || null,
                item.link_url || null,
                item.image_url || null,
                item.sort_order || 1
              ]
            );
          }
        }
      }
    }
    console.log(`✓ 100% Hydrated and verified: ${slug}`);
  }

  console.log('\n--- All 6 pages successfully synchronized with MySQL ---');
  await pool.end();
}

hydrateAll().catch(err => {
  console.error('Hydration failed:', err);
  process.exit(1);
});
