USE tiffany_crm;
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'footer', 'col1_title', 'EXPLORE', 'text'),
(1, 'footer', 'col2_title', 'CONNECT', 'text'),
(1, 'footer', 'col3_title', 'CONTACT', 'text'),
(1, 'footer', 'col4_title', 'NEWSLETTER', 'text'),
(1, 'footer', 'contact_email', 'booking@tiffanywebbimpact.com', 'text'),
(1, 'footer', 'contact_location', 'Chicago, IL &middot; Available nationally', 'text'),
(1, 'footer', 'newsletter_placeholder', 'Email address', 'text'),
(1, 'footer', 'newsletter_btn', 'JOIN', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);
