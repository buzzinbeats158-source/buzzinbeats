AWS:



http://buzzinbeats.com/manage-56buzzinbeats-qr-master-admin-page/login



Email: buzzinbeats158@gmail.com

Password: 65Logitech65%







AWS\_SERVER\_IP: 54.252.98.109

buzzinbeats- 733202871039









connect server:

ssh -i "C:\\GitHub\\buzzinbeats\\aws\\buzzinkey.pem" ubuntu@54.252.98.109



**manual update site from git**

cd /var/www/buzzinbeats

sudo -u www-data git pull origin main

sudo -u www-data php artisan migrate --force

sudo -u www-data php artisan optimize:clear



**staging removed (2026-08-12)** — local now deploys straight to production. The `staging` server, DB, nginx vhost, and SSL cert were torn down; the git `staging` branch was deleted. One unmerged feature (resource pages) was preserved at branch `archive/staging-resource-page` before deletion — merge it into `main` when ready.













\- Credentials :

\- Email : admin@buzzinbeats.com

databasename:  u557878258\_db\_buzzinbeats

username: u557878258\_balram158

\- Password : 65Logitech65%





suggested custom email

verify@buzzinbeats.com   → OTP and login verification

buzz@buzzinbeats.com  → system notifications

support@buzzinbeats.com  → customer support







**Local host:**



cd "C:\\GitHub\\buzzinbeats\\buzzin deploy"

php artisan serve



Testing

buzzinglocal8000@buzzinbeats.com

10Logitech158





http://127.0.0.1:8000/



http://localhost:8000/manage-56buzzinbeats-qr-master-admin-page/login









**antigravity**

/graphify . --watch

