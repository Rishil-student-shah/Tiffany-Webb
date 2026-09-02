USE tiffany_crm;

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'events', 'eyebrow', 'STAGES & IMPACT', 'text'),
(1, 'events', 'headline', 'Where the work has taken me.', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);

DELETE FROM website_collections WHERE section_name = 'events';
