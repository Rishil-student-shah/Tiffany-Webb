USE tiffany_crm;

DELETE FROM website_collections WHERE section_name = 'events';

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, icon_svg, image_url, sort_order) VALUES 
(1, 'events', 'Community Impact Summit', 'Keynote', 'Chicago, IL', 'Past', '500+', 1),
(1, 'events', 'Leadership & Prevention Forum', 'Panel', 'New York, NY', 'Past', '1,200+', 2),
(1, 'events', 'Global Health Symposium', 'Workshop', 'London, UK', 'Upcoming', '300+', 3);
