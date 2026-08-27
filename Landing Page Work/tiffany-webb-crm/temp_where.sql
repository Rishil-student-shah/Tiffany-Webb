USE tiffany_crm;

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'where_she_works', 'eyebrow', 'WHO CAN BENEFIT FROM THIS WORK?', 'text'),
(1, 'where_she_works', 'headline', 'For leaders ready to rethink what''s possible.', 'text'),
(1, 'where_she_works', 'body_1', 'I help healthcare, behavioral health, public health, nonprofit, education, and community leaders think differently about how they reach people and create impact.', 'text'),
(1, 'where_she_works', 'body_2', 'My work combines lived understanding, professional expertise, and community insight to help leaders challenge familiar approaches, uncover opportunities, design stronger programs, and build strategies that connect organizational goals with the people, families, and communities they serve.', 'text'),
(1, 'where_she_works', 'button_text', 'How I help →', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);

DELETE FROM website_collections WHERE section_name = 'where_she_works';

INSERT INTO website_collections (page_id, section_name, item_title, item_order) VALUES 
(1, 'where_she_works', 'Healthcare Leaders', 1),
(1, 'where_she_works', 'Public Health Teams', 2),
(1, 'where_she_works', 'Behavioral Health Organizations', 3),
(1, 'where_she_works', 'Nonprofit Leaders', 4),
(1, 'where_she_works', 'Community Organizations', 5),
(1, 'where_she_works', 'Schools & Universities', 6),
(1, 'where_she_works', 'Government & Community Initiatives', 7),
(1, 'where_she_works', 'Conferences & Professional Associations', 8);
