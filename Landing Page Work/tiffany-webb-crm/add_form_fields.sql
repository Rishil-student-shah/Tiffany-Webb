USE tiffany_crm;

INSERT INTO website_content (page_id, section, key_name, content_value, content_type) VALUES 
(1, 'booking', 'label_name', 'YOUR NAME', 'text'),
(1, 'booking', 'label_org', 'ORGANIZATION', 'text'),
(1, 'booking', 'label_email', 'EMAIL ADDRESS', 'text'),
(1, 'booking', 'label_phone', 'PHONE NUMBER', 'text'),
(1, 'booking', 'label_type', 'EVENT TYPE', 'text'),
(1, 'booking', 'label_date', 'EVENT DATE', 'text'),
(1, 'booking', 'label_location', 'LOCATION (OR "VIRTUAL")', 'text'),
(1, 'booking', 'label_size', 'AUDIENCE SIZE', 'text'),
(1, 'booking', 'label_details', 'TELL US ABOUT YOUR AUDIENCE AND GOALS', 'text'),
(1, 'booking', 'btn_submit', 'Submit Request →', 'text')
ON DUPLICATE KEY UPDATE content_value = VALUES(content_value);
