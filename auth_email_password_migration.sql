-- VRIKSHA auth migration: OTP-only -> email/password compatible
-- Compatible with PostgreSQL
-- Safe to run once in a migration pipeline.

BEGIN;

-- 1) Add email and password hash fields if missing.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2) Normalize any existing email data.
UPDATE users
SET email = LOWER(TRIM(email))
WHERE email IS NOT NULL;

-- 3) Ensure email uniqueness (case-insensitive) for non-null emails.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON users (LOWER(email))
  WHERE email IS NOT NULL;

-- 4) Optional: keep phone uniqueness if your current app depends on it.
-- CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique_idx
--   ON users (phone)
--   WHERE phone IS NOT NULL;

-- 5) Keep legacy OTP users valid:
--    Existing users without password_hash can still exist,
--    but must set password before email login.

COMMIT;
