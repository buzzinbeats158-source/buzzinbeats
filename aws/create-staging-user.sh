#!/bin/bash
# Generate bcrypt hash for "Staging@123" and insert user directly into staging DB

HASHED=$(php -r "echo password_hash('Staging@123', PASSWORD_BCRYPT);")
echo "Hash generated."

sudo mysql buzzinbeats_staging <<SQLEOF
INSERT INTO users (name, email, password, email_verified_at, role, created_at, updated_at)
VALUES (
  'Staging Admin',
  'admin@staging.test',
  '$HASHED',
  NOW(),
  'admin',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  password = '$HASHED',
  email_verified_at = NOW(),
  role = 'admin',
  updated_at = NOW();
SELECT id, name, email, role FROM users WHERE email = 'admin@staging.test';
SQLEOF

echo ""
echo "Done! Login at: https://staging.buzzinbeats.com"
echo "Email:    admin@staging.test"
echo "Password: Staging@123"
