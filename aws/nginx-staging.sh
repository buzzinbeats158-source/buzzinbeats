#!/bin/bash
# Upload and configure Nginx for staging
sudo tee /etc/nginx/sites-available/buzzinbeats-staging > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name staging.buzzinbeats.com;

    root /var/www/buzzinbeats-staging/public;
    index index.php index.html;

    # Block search engine indexing at server level
    add_header X-Robots-Tag "noindex, nofollow" always;
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # Cloudflare Real IP
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    # HTTP Basic Auth (password-protect staging from public)
    auth_basic "BuzzinBeats Staging — Authorized Only";
    auth_basic_user_file /etc/nginx/.htpasswd-staging;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    error_log  /var/log/nginx/buzzinbeats-staging-error.log;
    access_log /var/log/nginx/buzzinbeats-staging-access.log;
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/buzzinbeats-staging \
            /etc/nginx/sites-enabled/buzzinbeats-staging

sudo nginx -t && sudo systemctl reload nginx && echo "Nginx configured and reloaded OK"
