USE tiffany_crm;
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'events', 'empty_text', 'Next dates announced soon.', 'text'),
(1, 'events', 'empty_btn', 'Book Tiffany', 'text'),
(1, 'events', 'link_text', 'See the full picture', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);
