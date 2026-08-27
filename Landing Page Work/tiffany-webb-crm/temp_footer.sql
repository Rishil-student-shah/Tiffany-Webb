USE tiffany_crm;

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'footer', 'quote', '"Every conversation is an opportunity to plant a seed of hope, strengthen a community, and inspire meaningful change."', 'text'),
(1, 'footer', 'values_line', 'FAITH. FAMILY. COMMUNITY. PURPOSE. IMPACT.', 'text'),
(1, 'footer', 'endorsement', 'I''m also the founder of GambleFreeGear - purpose-driven apparel raising awareness of gambling harm.', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);

DELETE FROM website_collections WHERE section_name = 'social_links';
INSERT INTO website_collections (page_id, section_name, title, subtitle, sort_order) VALUES 
(1, 'social_links', 'LinkedIn', 'https://linkedin.com/in/tiffanywebb', 1),
(1, 'social_links', 'Instagram', 'https://instagram.com/tiffanywebb', 2);
