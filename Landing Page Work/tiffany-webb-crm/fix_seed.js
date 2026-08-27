const mysql = require('mysql2/promise');

async function fixSeed() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '@rishil8124shah',
    database: 'tiffany_crm'
  });

  try {
    const [pages] = await pool.query("SELECT id FROM website_pages WHERE slug = 'home'");
    const homeId = pages[0].id;

    await pool.query("DELETE FROM website_content WHERE page_id = ?", [homeId]);
    await pool.query("DELETE FROM website_collections WHERE page_id = ?", [homeId]);

    const kvData = [
      // Hero
      ['hero', 'eyebrow', 'COMMUNITY IMPACT STRATEGIST · PUBLIC HEALTH EDUCATOR & SPEAKER', 'text'],
      ['hero', 'title_line_1', 'Break the', 'text'],
      ['hero', 'title_line_2', 'Silence.', 'text'],
      ['hero', 'meta', 'TIFFANY WEBB, BBA, MHP', 'text'],
      ['hero', 'subtext', '15+ years turning the hardest conversations about gambling harm into prevention communities can actually use.', 'text'],
      ['hero', 'formats', 'Keynotes · Conference sessions · Panels · Workshops · School programs', 'text'],
      ['hero', 'hero_image', '/images/tiffany_hero_new.jpg', 'image'],
      
      // Meet Tiffany
      ['meet_tiffany', 'eyebrow', 'Meet Tiffany', 'text'],
      ['meet_tiffany', 'title_line_1', 'Chicago soul,', 'text'],
      ['meet_tiffany', 'title_line_2', 'Louisiana heart.', 'text'],
      ['meet_tiffany', 'paragraph_1', 'Chicago-born and raised, with deep Louisiana family roots, Tiffany Webb has spent more than fifteen years doing prevention work where it actually happens — in school gyms, clinic waiting rooms, church basements, and community centres across Illinois.', 'text'],
      ['meet_tiffany', 'paragraph_2', 'She brings a rare combination of behavioral health expertise and frontline community outreach, allowing her to design interventions that are culturally fluent and scientifically sound.', 'text'],
      ['meet_tiffany', 'paragraph_3', 'Her approach bridges the gap between public health systems and the people they serve, turning the hardest conversations about gambling harm into practical, sustainable prevention.', 'text'],
      ['meet_tiffany', 'button_text', 'READ HER FULL STORY →', 'text'],
      ['meet_tiffany', 'image', '/images/tiffany_about_new.jpg', 'image'],

      // Expertise
      ['expertise', 'eyebrow', 'Speaking Tracks', 'text'],
      ['expertise', 'title_line_1', 'What she', 'text'],
      ['expertise', 'title_line_2', 'speaks about.', 'text'],
      ['expertise', 'subtitle', 'Twenty topics across four tracks — practical enough to use on Monday, human enough that the room stays with her.', 'text'],

      // Speaking Formats
      ['speaking_formats', 'heading', 'Ways to work together.', 'text'],

      // Impact
      ['impact', 'heading', 'The Impact', 'text'],
      ['impact', 'subtitle', 'Numbers that matter.', 'text'],

      // Media Band
      ['media', 'heading', 'As Featured In', 'text'],

      // Events
      ['events', 'heading', 'Upcoming Events', 'text'],

      // Proof
      ['proof', 'heading', 'What people say', 'text'],

      // Booking Section
      ['booking', 'heading', 'Ready to start a conversation?', 'text'],
      ['booking', 'button_text', 'Book Tiffany', 'text']
    ];

    for (const item of kvData) {
      await pool.query(
        "INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, ?, ?, ?, ?)",
        [homeId, item[0], item[1], item[2], item[3]]
      );
    }

    const colData = [
      // Meet Tiffany Vignettes (The three cards)
      ['meet_tiffany', 'The Foundation', '01', 'Chicago-born with deep Louisiana roots. She learned resilience from the city and true hospitality from her family—always meet people exactly where they are.', '', '', 1],
      ['meet_tiffany', 'The Work', '02', 'Over 15 years and 4,000+ hours of outreach. She operates in clinics, schools, and community centers, reaching the rooms most prevention programs never find.', '', '', 2],
      ['meet_tiffany', 'The Mission', '03', 'Blending behavioral health expertise with grassroots outreach. She exists to give families language for their pain, turning that pain into power for the overlooked.', '', '', 3],
      
      // Expertise Tracks
      ['expertise', 'Prevention & Awareness', 'Community awareness, youth focus...', '<p>Content here</p>', '', '', 1],
      ['expertise', 'Industry & Operators', 'Training for staff...', '<p>Content here</p>', '', '', 2],
      
      // Speaking Formats
      ['speaking_formats', 'Keynote', '45-60 minute impactful sessions', '', '', '', 1],
      ['speaking_formats', 'Workshop', 'Interactive deep dives', '', '', '', 2],
      
      // Impact Metrics
      ['impact', '50K+', 'People Reached', '', '', '', 1],
      ['impact', '100+', 'Organizations Trained', '', '', '', 2],
      
      // Media Logos
      ['media', 'NYT', '', '', '/images/nyt-logo.png', '', 1],
      
      // Proof (Testimonials)
      ['proof', 'John Doe', 'Event Organizer', 'Tiffany was amazing!', '', '', 1]
    ];

    for (const item of colData) {
      await pool.query(
        "INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, image_url, icon_svg, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [homeId, item[0], item[1], item[2], item[3], item[4], item[5], item[6]]
      );
    }

    console.log("Database seeded exactly with correct fields!");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixSeed();
