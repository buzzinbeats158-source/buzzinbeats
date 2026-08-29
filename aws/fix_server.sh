#!/bin/bash
sudo mysql -e "UPDATE buzzinbeats.users SET role = 'admin' WHERE email = 'buzzinbeats158@gmail.com';"
# Add URL normalization to Nginx if not already present
if ! grep -q "request_uri ~ //" /etc/nginx/sites-available/buzzinbeats; then
    sudo sed -i '/server_name/a \    if ($request_uri ~ \/\/ ) { return 301 $scheme://$host$request_uri; }' /etc/nginx/sites-available/buzzinbeats
fi
sudo nginx -t && sudo systemctl reload nginx
echo "Admin role and Nginx path fixes applied successfully."
