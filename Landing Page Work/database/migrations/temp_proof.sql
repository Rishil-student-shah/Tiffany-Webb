USE tiffany_crm;

-- Insert Proof Content
INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'proof', 'eyebrow', 'WHY ORGANIZATIONS BRING ME IN', 'text'),
(1, 'proof', 'headline', 'Credibility you can feel.', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);

-- Clean up any old proof attributes if they exist
DELETE FROM website_collections WHERE section_name = 'proof_attributes';

-- Insert the 6 attributes
INSERT INTO website_collections (page_id, section_name, title, sort_order) VALUES 
(1, 'proof_attributes', 'Authentic connection & trust building', 1),
(1, 'proof_attributes', 'Deep community insight & cultural competence', 2),
(1, 'proof_attributes', 'Expert knowledge with practical solutions', 3),
(1, 'proof_attributes', 'Warm, engaging & confident delivery', 4),
(1, 'proof_attributes', 'Evidence-based', 5),
(1, 'proof_attributes', 'Community-centered', 6);

-- Ensure testimonials are clean (empty)
DELETE FROM website_collections WHERE section_name = 'proof_testimonials';
