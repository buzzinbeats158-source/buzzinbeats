#!/bin/bash
sudo mysql buzzinbeats_staging <<'SQL'
UPDATE users
SET
  email             = 'buzzinbeats158@gmail.com',
  name              = 'BuzzinBeats Admin',
  email_verified_at = NOW(),
  role              = 'admin',
  updated_at        = NOW()
WHERE id = 1;

SELECT id, name, email, role FROM users WHERE email = 'buzzinbeats158@gmail.com';
SQL
echo "Done."
