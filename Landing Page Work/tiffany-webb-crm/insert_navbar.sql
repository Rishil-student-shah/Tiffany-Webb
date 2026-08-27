USE tiffany_crm;
INSERT INTO website_pages (name, slug, is_active) VALUES ('Navbar', 'navbar', 1) ON DUPLICATE KEY UPDATE name=name;
