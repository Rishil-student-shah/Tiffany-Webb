USE tiffany_crm;

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'media', 'headline', 'Ready for the room — and the story.', 'text'),
(1, 'media', 'link_1', 'Download the speaker sheet', 'text'),
(1, 'media', 'link_2', 'Media resources →', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);

-- Clean up any old keys that are no longer used
DELETE FROM website_content WHERE section = 'media' AND key_name NOT IN ('headline', 'link_1', 'link_2');
