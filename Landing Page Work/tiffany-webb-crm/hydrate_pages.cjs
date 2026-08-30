const mysql = require('mysql2/promise');

const privacyContent = `
<p class="intro">This Privacy Policy governs the manner in which Tiffany Webb ("we", "us", "our") collects, uses, maintains, and discloses information collected from users (each, a "User") of the tiffanywebb.com website ("Site"). This privacy policy applies to the Site and all products and services offered by Tiffany Webb.</p>

<div class="prose-block mt-8">
  <h3>Personal Identification Information</h3>
  <p>We may collect personal identification information from Users in a variety of ways, including, but not limited to, when Users visit our site, fill out a form, subscribe to the newsletter, and in connection with other activities, services, features or resources we make available on our Site. Users may be asked for, as appropriate, name, email address, mailing address, phone number, and organization details. Users may, however, visit our Site anonymously. We will collect personal identification information from Users only if they voluntarily submit such information to us.</p>
</div>

<div class="prose-block mt-8">
  <h3>Non-Personal Identification Information</h3>
  <p>We may collect non-personal identification information about Users whenever they interact with our Site. Non-personal identification information may include the browser name, the type of computer and technical information about Users means of connection to our Site, such as the operating system and the Internet service providers utilized and other similar information.</p>
</div>

<div class="prose-block mt-8">
  <h3>Web Browser Cookies</h3>
  <p>Our Site may use "cookies" to enhance User experience. User's web browser places cookies on their hard drive for record-keeping purposes and sometimes to track information about them. User may choose to set their web browser to refuse cookies, or to alert you when cookies are being sent. If they do so, note that some parts of the Site may not function properly.</p>
</div>

<div class="prose-block mt-8">
  <h3>How We Use Collected Information</h3>
  <p>Tiffany Webb may collect and use Users personal information for the following purposes:</p>
  <ul>
    <li><strong>To improve customer service:</strong> Information you provide helps us respond to your customer service requests and support needs more efficiently.</li>
    <li><strong>To personalize user experience:</strong> We may use information in the aggregate to understand how our Users as a group use the services and resources provided on our Site.</li>
    <li><strong>To process speaking inquiries and bookings:</strong> We may use the information Users provide about themselves when placing an inquiry only to provide service to that order. We do not share this information with outside parties except to the extent necessary to provide the service.</li>
    <li><strong>To send periodic emails:</strong> If User decides to opt-in to our mailing list, they will receive emails that may include company news, updates, related product or service information, etc. If at any time the User would like to unsubscribe from receiving future emails, we include detailed unsubscribe instructions at the bottom of each email.</li>
  </ul>
</div>
`;

const termsContent = `
<p class="intro">These Terms of Service govern your use of the website located at tiffanywebb.com and any related services provided by Tiffany Webb. By accessing our website or booking our services, you agree to abide by these Terms.</p>

<div class="prose-block mt-8">
  <h3>1. Services and Bookings</h3>
  <p>Tiffany Webb provides professional speaking, consulting, and training services focusing on public health and gambling prevention. All bookings initiated through this website are considered inquiries and do not constitute a binding contract until a formal Speaker Agreement or Consulting Contract is signed by both parties. We reserve the right to decline any speaking or consulting inquiry at our sole discretion.</p>
</div>

<div class="prose-block mt-8">
  <h3>2. Intellectual Property Rights</h3>
  <p>All content, materials, keynote presentations, slide decks, frameworks, methodologies, and written articles provided by Tiffany Webb (collectively, "Materials") are the exclusive intellectual property of Tiffany Webb and are protected by applicable copyright and trademark law.</p>
  <ul>
    <li><strong>Presentations:</strong> Recording, broadcasting, or distributing Tiffany Webb's keynote or workshop presentations without explicit prior written consent is strictly prohibited.</li>
    <li><strong>Website Content:</strong> You may not modify, publish, transmit, participate in the transfer or sale of, reproduce, create derivative works from, distribute, or in any way exploit any of the content on this website, in whole or in part, without our written permission.</li>
  </ul>
</div>

<div class="prose-block mt-8">
  <h3>3. User Conduct</h3>
  <p>As a condition of your use of the website, you warrant that you will not use the website for any purpose that is unlawful or prohibited by these Terms. You may not use the website in any manner which could damage, disable, overburden, or impair the website or interfere with any other party's use and enjoyment of the website.</p>
</div>

<div class="prose-block mt-8">
  <h3>4. Cancellation and Rescheduling</h3>
  <p>Specific terms regarding the cancellation, rescheduling, or modification of booked speaking engagements or consulting services will be governed strictly by the individual Speaker Agreement or Consulting Contract signed between the Client and Tiffany Webb. This website does not supersede those individual contractual terms.</p>
</div>
`;

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '@rishil8124shah', database: 'tiffany_crm' });

  try {
    // 1. Get Page IDs
    const [pages] = await pool.query("SELECT id, slug FROM website_pages");
    const pageMap = {};
    pages.forEach(p => pageMap[p.slug] = p.id);

    // 2. Update Privacy
    if(pageMap['privacy']) {
      await pool.query("UPDATE website_content SET content_value = 'Legal' WHERE page_id = ? AND key_name = 'eyebrow'", [pageMap['privacy']]);
      await pool.query("UPDATE website_content SET content_value = 'Privacy <span class=\"italic-accent\">Policy.</span>' WHERE page_id = ? AND key_name = 'headline'", [pageMap['privacy']]);
      await pool.query("UPDATE website_content SET content_value = 'Last updated: August 2026' WHERE page_id = ? AND key_name = 'subtitle'", [pageMap['privacy']]);
      await pool.query("UPDATE website_content SET content_value = ? WHERE page_id = ? AND section = 'legal' AND key_name = 'body_text'", [privacyContent, pageMap['privacy']]);
      
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'eyebrow', 'Legal', 'text')", [pageMap['privacy']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'headline', 'Privacy <span class=\"italic-accent\">Policy.</span>', 'text')", [pageMap['privacy']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'subtitle', 'Last updated: August 2026', 'text')", [pageMap['privacy']]);
    }

    // 3. Update Terms
    if(pageMap['terms']) {
      await pool.query("UPDATE website_content SET content_value = ? WHERE page_id = ? AND section = 'legal' AND key_name = 'body_text'", [termsContent, pageMap['terms']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'eyebrow', 'Legal', 'text')", [pageMap['terms']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'headline', 'Terms of <span class=\"italic-accent\">Service.</span>', 'text')", [pageMap['terms']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'subtitle', 'Last updated: August 2026', 'text')", [pageMap['terms']]);
    }

    // 4. Update Newsletter
    if(pageMap['newsletter']) {
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'eyebrow', 'Newsletter', 'text')", [pageMap['newsletter']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'headline', 'Stay in <span class=\"italic-accent\">the loop.</span>', 'text')", [pageMap['newsletter']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'subtitle', 'Join the community for updates on prevention, impact strategies, and upcoming events.', 'text')", [pageMap['newsletter']]);
      
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'form', 'placeholder', 'Email address', 'text')", [pageMap['newsletter']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'form', 'btn_text', 'Subscribe Now', 'text')", [pageMap['newsletter']]);
    }

    // 5. Update Insights
    if(pageMap['insights']) {
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'eyebrow', 'Articles & Writing', 'text')", [pageMap['insights']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'headline', 'Latest <span class=\"italic-accent\">Insights.</span>', 'text')", [pageMap['insights']]);
      await pool.query("INSERT IGNORE INTO website_content (page_id, section, key_name, content_value, content_type) VALUES (?, 'hero', 'subtitle', 'Perspectives on gambling harm prevention, public health, and community impact.', 'text')", [pageMap['insights']]);
      
      // Clear existing articles just in case
      await pool.query("DELETE FROM website_collections WHERE page_id = ? AND section_name = 'articles'", [pageMap['insights']]);
      
      // Insert articles
      await pool.query("INSERT INTO website_collections (page_id, section_name, title, subtitle, image_url, sort_order) VALUES (?, 'articles', 'The Hidden Cost of Sports Betting on College Campuses', 'Prevention | August 12, 2026', '/assets/thumb_3.jpg', 1)", [pageMap['insights']]);
      await pool.query("INSERT INTO website_collections (page_id, section_name, title, subtitle, image_url, sort_order) VALUES (?, 'articles', 'Why Community Insight Matters More Than Data', 'Family Impact | July 28, 2026', '/assets/thumb_1.jpg', 2)", [pageMap['insights']]);
      await pool.query("INSERT INTO website_collections (page_id, section_name, title, subtitle, image_url, sort_order) VALUES (?, 'articles', 'Building Interventions That Actually Reach People', 'Strategy | June 15, 2026', '/assets/thumb_2.jpg', 3)", [pageMap['insights']]);
    }

    console.log("Successfully hydrated DB with Astro page contents!");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
