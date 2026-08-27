USE tiffany_crm;

DELETE FROM website_collections WHERE section_name = 'where_she_works';

INSERT INTO website_collections (page_id, section_name, title, sort_order) VALUES 
(1, 'where_she_works', 'Healthcare Leaders', 1),
(1, 'where_she_works', 'Public Health Teams', 2),
(1, 'where_she_works', 'Behavioral Health Organizations', 3),
(1, 'where_she_works', 'Nonprofit Leaders', 4),
(1, 'where_she_works', 'Community Organizations', 5),
(1, 'where_she_works', 'Schools & Universities', 6),
(1, 'where_she_works', 'Government & Community Initiatives', 7),
(1, 'where_she_works', 'Conferences & Professional Associations', 8);
