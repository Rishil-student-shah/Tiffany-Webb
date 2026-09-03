-- Migration: Add attribution and metadata columns to leads table
USE tiffany_crm;

ALTER TABLE leads 
  ADD COLUMN IF NOT EXISTS source_section VARCHAR(150) NULL AFTER source,
  ADD COLUMN IF NOT EXISTS source_card VARCHAR(150) NULL AFTER source_section,
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) NULL AFTER email,
  ADD COLUMN IF NOT EXISTS topic_interest VARCHAR(255) NULL AFTER event_type,
  ADD COLUMN IF NOT EXISTS budget_range VARCHAR(100) NULL AFTER estimated_audience_size;
