#!/bin/bash
set -e
echo "=== Step 1: Install Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version

echo ""
echo "=== Step 2: Create Staging Database ==="
sudo mysql <<'SQLEOF'
CREATE DATABASE IF NOT EXISTS buzzinbeats_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bb_staging'@'localhost' IDENTIFIED BY 'Stg@Buzz2024!Xk9';
GRANT ALL PRIVILEGES ON buzzinbeats_staging.* TO 'bb_staging'@'localhost';
FLUSH PRIVILEGES;
SELECT CONCAT('Database user created: ', User, '@', Host) AS result FROM mysql.user WHERE User='bb_staging';
SQLEOF

echo ""
echo "=== Step 3: Clone staging repo ==="
sudo mkdir -p /var/www/buzzinbeats-staging
sudo chown ubuntu:ubuntu /var/www/buzzinbeats-staging
cd /var/www/buzzinbeats-staging
git clone -b staging https://github.com/158bam/buzzinbeats.git .

echo ""
echo "=== Step 4: Install PHP deps ==="
composer install --no-dev --optimize-autoloader --no-interaction

echo ""
echo "=== Step 5: Install Node deps and build assets ==="
npm ci
npm run build

echo ""
echo "=== Step 6: Create .env ==="
cat > /var/www/buzzinbeats-staging/.env <<'ENVEOF'
APP_NAME="BuzzinBeats Staging"
APP_ENV=staging
APP_KEY=
APP_DEBUG=true
APP_URL=https://staging.buzzinbeats.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=buzzinbeats_staging
DB_USERNAME=bb_staging
DB_PASSWORD=Stg@Buzz2024!Xk9

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MAIL_MAILER=log
MAIL_FROM_ADDRESS=staging@buzzinbeats.com
MAIL_FROM_NAME="${APP_NAME}"

RAZORPAY_KEY=
RAZORPAY_SECRET=

AMAZON_ACCESS_KEY=AKPA3MG4NK1775057876
AMAZON_SECRET_KEY=OxKPoHad2S2nnbsQFph9wFRNkryvk2gFdhm2tr7P
AMAZON_REGION=eu-west-1
AMAZON_HOST=webservices.amazon.in
ENVEOF

echo ""
echo "=== Step 7: Generate app key and migrate ==="
cd /var/www/buzzinbeats-staging
php artisan key:generate
php artisan migrate --force
php artisan storage:link || true

echo ""
echo "=== Step 8: Fix permissions ==="
sudo chown -R www-data:www-data /var/www/buzzinbeats-staging/storage
sudo chown -R www-data:www-data /var/www/buzzinbeats-staging/bootstrap/cache
sudo chmod -R 775 /var/www/buzzinbeats-staging/storage
sudo chmod -R 775 /var/www/buzzinbeats-staging/bootstrap/cache

echo ""
echo "=== Step 9: Copy staging robots.txt ==="
cp /var/www/buzzinbeats-staging/scripts/robots-staging.txt \
   /var/www/buzzinbeats-staging/public/robots.txt

echo ""
echo "=== Step 10: Install HTTP Basic Auth tools ==="
sudo apt-get install -y apache2-utils
echo "staging123" | sudo htpasswd -c -i /etc/nginx/.htpasswd-staging stagingadmin
echo "HTTP auth file created."

echo ""
echo "=== Step 11: Create Nginx vhost ==="
sudo tee /etc/nginx/sites-available/buzzinbeats-staging > /dev/null <<'NGINXEOF'
server {
    listen 80;
    server_name staging.buzzinbeats.com;

    root /var/www/buzzinbeats-staging/public;
    index index.php index.html;

    add_header X-Robots-Tag "noindex, nofollow" always;

    auth_basic "BuzzinBeats Staging";
    auth_basic_user_file /etc/nginx/.htpasswd-staging;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.env { deny all; }
    location ~ /\.git { deny all; }
    location ~ /\.(?!well-known).* { deny all; }
    location = /favicon.ico { access_log off; log_not_found off; }

    error_log  /var/log/nginx/buzzinbeats-staging-error.log;
    access_log /var/log/nginx/buzzinbeats-staging-access.log;
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/buzzinbeats-staging \
            /etc/nginx/sites-enabled/buzzinbeats-staging

echo ""
echo "=== Step 12: Test and reload Nginx ==="
sudo nginx -t
sudo systemctl reload nginx

echo ""
echo "========================================"
echo "✅ Staging setup complete!"
echo "========================================"
echo ""
echo "NEXT STEPS:"
echo "1. Add DNS record in Cloudflare:"
echo "   Type: A | Name: staging | IPv4: 54.252.98.109 | Proxy: DNS only"
echo ""
echo "2. After DNS propagates (2-5 min), run SSL:"
echo "   sudo certbot --nginx -d staging.buzzinbeats.com"
echo ""
echo "3. Staging login credentials:"
echo "   Username: stagingadmin"
echo "   Password: staging123"
echo "   (Change with: sudo htpasswd /etc/nginx/.htpasswd-staging stagingadmin)"
echo ""
