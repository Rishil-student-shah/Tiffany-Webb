USE tiffany_crm;
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'expertise', 'eyebrow', 'Speaking Tracks', 'text'),
(1, 'expertise', 'headline', 'What she <span class=\"italic-accent\">speaks about.</span>', 'text'),
(1, 'expertise', 'subtext', 'Twenty topics across four tracks - practical enough to use on Monday, human enough that the room stays with her.', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);
