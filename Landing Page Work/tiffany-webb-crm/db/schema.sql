CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','assistant') NOT NULL DEFAULT 'assistant',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source ENUM('website_form','whatsapp','instagram','email','referral','manual') NOT NULL,
  status ENUM('new','contacted','qualified','proposal_sent','booked','completed','declined','lost') NOT NULL DEFAULT 'new',
  contact_name VARCHAR(150),
  organization_name VARCHAR(200),
  email VARCHAR(190),
  phone VARCHAR(40),
  event_type VARCHAR(100),
  event_date DATE NULL,
  event_location VARCHAR(200),
  estimated_audience_size VARCHAR(100) NULL,
  message TEXT,
  assigned_to INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_contact_at DATETIME NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE messages (
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

CREATE TABLE bookings (
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

CREATE TABLE activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  detail VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
