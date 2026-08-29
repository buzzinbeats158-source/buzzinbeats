#!/bin/bash
# Trust the staging admin device + verify the admin user exists

# Step 1: Get the admin user ID
ADMIN_ID=$(sudo mysql -sN buzzinbeats_staging -e "SELECT id FROM users WHERE email='admin@staging.test' LIMIT 1;")

if [ -z "$ADMIN_ID" ]; then
    echo "ERROR: admin@staging.test not found. Creating..."
    HASHED=$(php -r "echo password_hash('Staging@123', PASSWORD_BCRYPT);")
    sudo mysql buzzinbeats_staging -e "
        INSERT INTO users (name, email, password, email_verified_at, role, created_at, updated_at)
        VALUES ('Staging Admin', 'admin@staging.test', '$HASHED', NOW(), 'admin', NOW(), NOW());
    "
    ADMIN_ID=$(sudo mysql -sN buzzinbeats_staging -e "SELECT id FROM users WHERE email='admin@staging.test' LIMIT 1;")
    echo "Created admin user with ID: $ADMIN_ID"
else
    echo "Admin user found with ID: $ADMIN_ID"
fi

# Step 2: Insert a permanent trusted device so OTP is skipped
sudo mysql buzzinbeats_staging -e "
DELETE FROM trusted_devices WHERE user_id = $ADMIN_ID;
INSERT INTO trusted_devices (user_id, device_token, user_agent, ip_address, trusted_at, expires_at, created_at, updated_at)
VALUES (
    $ADMIN_ID,
    'staging-bypass-token-do-not-use-in-production',
    'StagingBypass/1.0',
    '127.0.0.1',
    NOW(),
    DATE_ADD(NOW(), INTERVAL 10 YEAR),
    NOW(),
    NOW()
);
SELECT 'Trusted device inserted for user ID: $ADMIN_ID' as result;
"

echo ""
echo "=========================================="
echo "Admin login ready (OTP bypassed for staging)"
echo ""
echo "URL:      https://staging.buzzinbeats.com/manage-56buzzinbeats-qr-master-admin-page/login"
echo "Email:    admin@staging.test"
echo "Password: Staging@123"
echo "=========================================="
