const mysql = require('mysql2/promise');

async function hydrate() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '@rishil8124shah',
    database: 'tiffany_crm',
    waitForConnections: true,
    connectionLimit: 10
  });

  console.log('--- Hydrating website_content and website_collections for inner pages ---');

  // Let's get page IDs
  const [pages] = await pool.query('SELECT id, slug FROM website_pages');
  const pageMap = {};
  pages.forEach(p => { pageMap[p.slug] = p.id; });

  const pagesData = {
    speaking: {
      content: {
        hero: {
          eyebrow: 'KEYNOTES · WORKSHOPS · MASTERCLASSES',
          headline: 'High-impact keynotes.<br/><span class="italic-accent">Grounded in frontline reality.</span>',
          subtitle: 'Tiffany Webb translates 15+ years of behavioral addiction and public health leadership into unforgettable keynote experiences, clinical masterclasses, and executive dialogues.',
          section_is_active: '1'
        },
        speaking_filter: {
          eyebrow: 'EXPLORE TOPICS',
          headline: 'Twenty-One Tailored <span class="italic-accent">Speaking Topics.</span>',
          subtitle: 'Filter by track or format to find the exact session for your audience.',
          section_is_active: '1'
        },
        proof: {
          eyebrow: 'PROVEN AUDIENCE IMPACT',
          headline: 'What Organizers & Audiences <span class="italic-accent">Say.</span>',
          section_is_active: '1'
        },
        cta: {
          eyebrow: 'BOOK TIFFANY WEBB',
          headline: 'Ready to elevate your <span class="italic-accent">next conference or event?</span>',
          subtitle: 'Submit an inquiry with your dates and audience profile. Tiffany personally reviews every engagement request.',
          button_text: 'Submit Inbound Booking Request →',
          button_url: '/work-with-tiffany',
          section_is_active: '1'
        }
      },
      collections: {
        testimonials: [
          {
            title: 'Dr. Marcus Vance',
            subtitle: 'State Behavioral Health Director',
            badge: 'Keynote Feedback',
            content_html: 'Tiffany delivered one of the most powerful and clinically accurate presentations on gambling harm our annual conference has ever hosted. The room was riveted from start to finish.',
            sort_order: 1
          },
          {
            title: 'Elena Rostova',
            subtitle: 'Dean of Student Affairs, Midwest University Network',
            badge: 'Campus Workshop Feedback',
            content_html: 'Her message to our athletic department and student body on digital gaming and sports wagering was compassionate, urgent, and completely free of judgment. Unforgettable impact.',
            sort_order: 2
          }
        ]
      }
    },
    consulting: {
      content: {
        hero: {
          eyebrow: 'STRATEGIC ADVISORY & CONSULTING',
          headline: 'Bridging institutional strategy <br/><span class="italic-accent">and frontline community reality.</span>',
          subtitle: 'Tiffany Webb works alongside healthcare executives, state agencies, and community coalitions to design human-centered prevention architectures, screening workflows, and sustainable impact frameworks.',
          section_is_active: '1'
        },
        gear_method: {
          eyebrow: 'PROPRIETARY METHODOLOGY',
          headline: 'The GEAR <span class="italic-accent">Method™</span>',
          subtitle: 'A four-phase operational model moving organizations from awareness to sustainable community resilience.',
          section_is_active: '1'
        },
        capabilities: {
          eyebrow: 'CORE PRACTICE AREAS',
          headline: 'Four Pillars of <span class="italic-accent">Practice.</span>',
          subtitle: 'Structured engagement scopes engineered for measurable organizational transformation.',
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

  for (const [slug, data] of Object.entries(pagesData)) {
    const pageId = pageMap[slug];
    if (!pageId) continue;

    // Hydrate KV content
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

    // Hydrate collections
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
    console.log(`✓ Hydrated page: ${slug}`);
  }

  console.log('Hydration complete!');
  await pool.end();
}

hydrate().catch(err => {
  console.error('Hydration error:', err);
  process.exit(1);
});
