USE tiffany_crm;
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'events', 'btn_text', 'BOOK TIFFANY', 'text'),
(1, 'events', 'btn_link', '/work-with-tiffany', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);
