USE tiffany_crm;

-- Delete from content
DELETE FROM website_content WHERE section IN ('speaking_formats', 'impact');

-- Delete from collections
DELETE FROM website_collections WHERE section_name IN ('speaking_formats', 'impact', 'media', 'proof');
