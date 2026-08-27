USE tiffany_crm;

DELETE FROM website_collections WHERE section_name = 'proof_testimonials';

INSERT INTO website_collections (page_id, section_name, title, subtitle, content_html, sort_order) VALUES 
(1, 'proof_testimonials', 'Dr. Sarah Jenkins', 'Director of Public Health', 'Tiffany brought exactly what we needed: deep empathy matched with actionable strategy. She completely shifted how our team views community engagement.', 1),
(1, 'proof_testimonials', 'Marcus Thorne', 'Conference Chair', 'The room was captivated. Tiffany doesn''t just deliver a keynote; she creates a shared experience that leaves a lasting impact on everyone present.', 2),
(1, 'proof_testimonials', 'Elena Rodriguez', 'Nonprofit Executive', 'Her ability to break down complex behavioral health topics into practical, relatable insights is unmatched. We saw immediate results following her workshop.', 3);
