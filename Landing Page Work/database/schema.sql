-- ==============================================================================
-- Tiffany Webb Master Database Schema
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','assistant') NOT NULL DEFAULT 'assistant',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source ENUM('website_form','whatsapp','instagram','email','referral','manual') NOT NULL,
  source_section VARCHAR(150) NULL,
  source_card VARCHAR(150) NULL,
  status ENUM('new','contacted','qualified','proposal_sent','booked','completed','declined','lost') NOT NULL DEFAULT 'new',
  contact_name VARCHAR(150),
  organization_name VARCHAR(200),
  email VARCHAR(190),
  country_code VARCHAR(10) NULL,
  phone VARCHAR(40),
  event_type VARCHAR(100),
  topic_interest VARCHAR(255) NULL,
  event_date DATE NULL,
  event_location VARCHAR(200),
  estimated_audience_size VARCHAR(100) NULL,
  budget_range VARCHAR(100) NULL,
  message TEXT,
  assigned_to INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_contact_at DATETIME NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  channel ENUM('whatsapp','email','note','sms') NOT NULL,
  direction ENUM('inbound','outbound') NOT NULL,
  body TEXT NOT NULL,
  sent_by INT NULL,
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (sent_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL UNIQUE,
  event_name VARCHAR(200),
  event_format VARCHAR(100),
  confirmed_date DATE,
  fee_amount DECIMAL(10,2) NULL,
  deposit_status ENUM('not_required','pending','received') DEFAULT 'not_required',
  contract_status ENUM('not_sent','sent','signed') DEFAULT 'not_sent',
  outcome_notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  detail VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS website_pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS website_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  section VARCHAR(100) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  content_value LONGTEXT,
  content_type VARCHAR(50) DEFAULT 'text',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES website_pages(id) ON DELETE CASCADE,
  UNIQUE KEY unique_content_key (page_id, section, key_name)
);

CREATE TABLE IF NOT EXISTS website_collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_id INT NOT NULL,
  section_name VARCHAR(100) NOT NULL,
  item_slug VARCHAR(150) NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) NULL,
  badge VARCHAR(100) NULL,
  category VARCHAR(100) NULL,
  link_url VARCHAR(255) NULL,
  image_url VARCHAR(255) NULL,
  icon_svg TEXT NULL,
  content_html LONGTEXT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (page_id) REFERENCES website_pages(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS speaking_topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  track_id INT NOT NULL,
  track_name VARCHAR(100) NOT NULL,
  topic_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  target_audience VARCHAR(255),
  learning_objectives TEXT,
  is_flagship BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  user_id INT NULL,
  author_name VARCHAR(150) NOT NULL,
  author_role VARCHAR(50) NOT NULL DEFAULT 'staff',
  note TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

