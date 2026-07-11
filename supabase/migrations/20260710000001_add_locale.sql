-- 20260710000001_add_locale.sql
-- Add locale preference to users table for i18n support

ALTER TABLE users ADD COLUMN locale TEXT NOT NULL DEFAULT 'ar' CHECK (locale IN ('ar', 'fr'));
