USE tiffany_crm;
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'hero', 'section_is_active', '1', 'text'),
(1, 'meet_tiffany', 'section_is_active', '1', 'text'),
(1, 'expertise', 'section_is_active', '1', 'text'),
(1, 'events', 'section_is_active', '1', 'text'),
(1, 'proof', 'section_is_active', '1', 'text'),
(1, 'booking', 'section_is_active', '1', 'text'),
(1, 'who_can_benefit', 'section_is_active', '1', 'text'),
(1, 'media', 'section_is_active', '1', 'text'),
(1, 'footer', 'section_is_active', '1', 'text'),
(1, 'navbar', 'section_is_active', '1', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);