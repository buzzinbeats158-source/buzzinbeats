#!/bin/bash
set -e

echo "Starting Ubuntu 24.04 Server Setup..."

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install PHP 8.3 and extensions
sudo apt-get install -y nginx mariadb-server php-fpm php-mysql php-gd php-xml php-mbstring php-zip php-curl php-bcmath unzip git

# Start Services
sudo systemctl enable --now nginx mariadb php8.3-fpm

# Database Setup
DB_PASS=$(openssl rand -base64 12)
sudo mysql -e "CREATE DATABASE IF NOT EXISTS buzzinbeats;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'buzzinuser'@'localhost' IDENTIFIED BY '$DB_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON buzzinbeats.* TO 'buzzinuser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Save credentials
echo "DB_NAME=buzzinbeats" > /home/ubuntu/db_credentials.txt
echo "DB_USER=buzzinuser" >> /home/ubuntu/db_credentials.txt
echo "DB_PASS=$DB_PASS" >> /home/ubuntu/db_credentials.txt

# Create directory
sudo mkdir -p /var/www/buzzinbeats
sudo chown ubuntu:ubuntu /var/www/buzzinbeats

echo "Setup Complete!"
