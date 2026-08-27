USE tiffany_crm;

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'where_she_works', 'eyebrow', 'WHO CAN BENEFIT FROM TIFFANY''S WORK?', 'text'),
(1, 'where_she_works', 'headline', 'For leaders ready to rethink what''s possible.', 'text'),
(1, 'where_she_works', 'body_1', 'Tiffany works with leaders and organizations navigating growth, change, engagement, and community impact. She brings a human-centered perspective to complex challenges—helping organizations understand the people they serve, rethink familiar approaches, and build strategies designed for meaningful, sustainable impact.', 'text'),
(1, 'where_she_works', 'body_2', '', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);
