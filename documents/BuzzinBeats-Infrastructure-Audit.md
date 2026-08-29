# BuzzinBeats Complete Infrastructure Audit Report

**Date**: August 23, 2026
**Status**: READ-ONLY AUDIT - No modifications made
**Purpose**: Migration planning from AWS to Supabase

---

## 1. CURRENT ARCHITECTURE

```
                    +---------------------+
                    |   buzzinbeats.com    |
                    |   (Cloudflare DNS)   |
                    +----------+----------+
                               |
                    +----------v----------+
                    |   Cloudflare Proxy   |
                    |   (SSL/CDN/WAF)      |
                    +----------+----------+
                               |
                    +----------v----------+
                    |   AWS EC2 (Ubuntu)   |
                    |   /var/www/buzzinbeats|
                    +----------+----------+
                               |
              +----------------+----------------+
              |                |                |
    +---------v--------+  +---v------+  +------v------+
    |  Nginx (port 80)  |  |  PHP-FPM |  |  MariaDB    |
    |  (Cloudflare SSL) |  |  8.3     |  |  (local)    |
    +---------+--------+  +----------+  +-------------+
              |
    +---------v--------+
    |   Laravel 10      |
    |   PHP 8.3         |
    |   Vite + Tailwind |
    +---------+--------+
              |
    +---------v------------------------------+
    |                                        |
    |  +----------+ +--------+ +----------+ |
    |  | Local FS | | CF R2  | | AWS S3   | |
    |  | (uploads)| | (digi) | | (backups)| |
    |  +----------+ +--------+ +----------+ |
    |                                        |
    +----------------------------------------+
```

---

## 2. AWS INFRASTRUCTURE

### Services Used

| AWS Service | Region | Purpose | Required | Replaceable by Supabase | Must Stay on AWS |
|-------------|--------|---------|----------|------------------------|------------------|
| **EC2** | ap-south-1 (inferred) | Laravel app server (Nginx + PHP-FPM + MariaDB) | YES | NO (need alternative host) | NO |
| **S3** | ap-south-1 (inferred) | Backup storage (optional destination) | Optional | Partially (Supabase Storage) | NO |
| **IAM** | - | S3 access credentials | YES (if using S3) | NO | NO |

### Services NOT used:
- RDS (MariaDB runs locally on EC2)
- CloudFront (Cloudflare handles CDN/SSL)
- Route 53 (Cloudflare handles DNS)
- ELB (no load balancer)
- EBS (standard EC2 volume)
- Lightsail, Lambda, SES, CloudWatch, Secrets Manager, API Gateway, SQS (none used)

### Cloudflare (NOT AWS, but critical):
- DNS provider
- SSL termination (proxy mode)
- CDN/WAF/DDoS protection
- All traffic proxied through Cloudflare

---

## 3. APPLICATION

| Item | Detail |
|------|--------|
| **Framework** | Laravel 10.x (laravel/framework: ^10.10) |
| **PHP Version** | 8.3 (php8.3-fpm) |
| **Laravel Version** | 10.x |
| **Frontend** | Blade + Alpine.js + Tailwind CSS 3.4.13 |
| **Vite** | Yes |
| **Tailwind CSS** | Yes (v3.4.13, with @tailwindcss/forms) |
| **Application Path** | /var/www/buzzinbeats on EC2 |
| **GitHub Repo** | https://github.com/158bam/buzzinbeats.git |
| **Branch** | main |
| **Deployment** | Manual SSH + deploy-production.sh |
| **Production Domain** | buzzinbeats.com / www.buzzinbeats.com |
| **Staging Domain** | staging.buzzinbeats.com |

### Key Dependencies (composer.json)
- aws/aws-sdk-php - S3 backup integration
- doctrine/dbal - Database migrations
- guzzlehttp/guzzle - HTTP client
- intervention/image - Image processing
- laravel/sanctum - API authentication
- league/flysystem-aws-s3-v3 - S3 filesystem
- razorpay/razorpay - Payment processing
- simplesoftwareio/simple-qrcode - QR code generation

---

## 4. DATABASE

### Configuration
| Item | Detail |
|------|--------|
| **Engine** | MariaDB (MySQL-compatible) |
| **Host** | 127.0.0.1 (local on EC2) |
| **Port** | 3306 |
| **Socket** | /var/run/mysqld/mysqld.sock |
| **Database Name** | buzzinbeats |
| **Charset** | utf8mb4 / utf8mb4_unicode_ci |
| **Connection** | mysql (via .env) |

### CRITICAL FINDING: Dual Database System
1. .env uses DB_CONNECTION=mysql (MariaDB on EC2)
2. config/database.php.production has hardcoded MySQL credentials
3. BackupService uses SQLite (database.sqlite) for backup operations

### Database Tables (33+ tables total)

| Table | Purpose | Approx Rows | Critical |
|-------|---------|-------------|----------|
| users | User accounts, profiles | ~10-100+ | YES |
| pages | QR code/link pages | ~20-200+ | YES |
| products | Products on pages | ~20-200+ | YES |
| links | Social/external links | ~10-100+ | YES |
| subscriptions | Subscription records | ~5-50+ | YES |
| payments | Payment transactions | ~5-50+ | YES |
| subscription_plans | Plan definitions | 3-10 | YES |
| subscription_plan_features | Plan feature limits | 3-10 | YES |
| digital_products | Digital product listings | ~5-50+ | YES |
| digital_product_sales | Purchase records | ~5-50+ | YES |
| redirect_links | Redirect/tracking links | ~10-100+ | YES |
| content_page_sections | Section builder | ~20-200+ | YES |
| analytics_events | Views, clicks, devices | 100-10000+ | YES |
| coupons | Coupon definitions | ~5-20 | YES |
| coupon_redemptions | Coupon usage | ~5-50+ | YES |
| user_stores | Store configurations | ~10-100+ | YES |
| countries | Country/currency data | ~200+ | YES |
| otp_codes | OTP verification | transient | YES |
| trusted_devices | Remembered devices | ~10-100+ | YES |
| system_settings | Global settings | ~10-30 | YES |
| error_logs | Error logs | variable | NO |
| backups | Backup metadata | ~10-50+ | NO |
| backup_logs | Backup activity | ~50-200+ | NO |

### Query Patterns
- Primary: Eloquent ORM
- Secondary: Query Builder
- Raw SQL: Minimal (SQLite PRAGMA in BackupService)
- No ENUM columns, no stored procedures/triggers
- JSON columns: store_platform in products (TEXT)

---

## 5. FILE STORAGE

| Content | Location | Provider |
|---------|----------|----------|
| Product Images | storage/app/public/uploads/ | Local (EC2 disk) |
| Profile Photos | storage/app/public/profile-photos/ | Local (EC2 disk) |
| Page Banners | storage/app/public/ | Local (EC2 disk) |
| QR Codes | Generated on-the-fly | N/A |
| Digital Products | Cloudflare R2 | CF R2 (S3-compatible) |
| Backups | storage/app/backups/ + optional S3 | Local + AWS S3 |
| Build Assets | public/build/ | Local (EC2 disk) |

Storage Architecture: StorageServiceInterface -> R2StorageService for digital products. Regular uploads use Storage::disk('public').

---

## 6. DOMAIN & DNS

Domain: buzzinbeats.com
DNS Provider: Cloudflare
SSL: Cloudflare Universal SSL
Proxy: Proxied (orange cloud - CDN + WAF)

Subdomains:
- www.buzzinbeats.com
- staging.buzzinbeats.com

---

## 7. EMAIL

Provider: Brevo (formerly Sendinblue)
Transport: SMTP (smtp-relay.brevo.com:587) + API (api.brevo.com/v3/smtp/email)
From: verify@buzzinbeats.com

Email Types:
- OTP (signup/login/reset) - Brevo API
- Digital product purchase OTP - Brevo API
- Deletion warnings (10d, 5d, 1d) - Laravel Mail SMTP
- Purchase confirmations - Laravel Mail
- Support notifications - Laravel Mail

---

## 8. PAYMENTS

Provider: Razorpay
Currency: INR
SDK: razorpay/razorpay ^2.9

Payment Flows:
1. Subscription: One-time payments via Razorpay orders (upgrades, downgrades, extensions)
2. Digital Products: Guest checkout (OTP verify -> order -> payment -> access token)
3. Webhooks: /webhooks/razorpay (payment.captured, payment.failed)

Tables: subscriptions, payments, coupon_redemptions, digital_product_sales

Coupon System: percent/fixed discounts, audience targeting, usage limits, date ranges

---

## 9. AUTHENTICATION

Primary Auth: Laravel session-based (Eloquent)
API Auth: Laravel Sanctum
Password Hashing: Bcrypt
OTP System: Custom email-based 6-digit OTP
Device Trust: Cookie-based (skips OTP on known devices)
Brute Force: 3 attempts/day lockout
Admin Panel: /manage-56buzzinbeats-qr-master-admin-page
Social Login: None

Tables: users, otp_codes, trusted_devices, login_attempts, personal_access_tokens

---

## 10. CRON / QUEUES / BACKGROUND JOBS

Laravel Scheduler:
| Command | Frequency | Purpose |
|---------|-----------|---------|
| users:process-deletions | Every 6 hours | Deletion warnings + auto-delete |
| backup:auto | Hourly | Auto-backup if enabled |
| links:check-health | Every 6 hours | Link health monitoring |
| subscriptions:activate-scheduled | Daily 00:05 | Activate scheduled downgrades |

Queue: sync (no queue workers)
No Supervisor/systemd beyond nginx, php-fpm, mariadb.

---

## 11. EXTERNAL APIs

| Service | Purpose | AWS Dependent | Risk |
|---------|---------|---------------|------|
| Amazon PA-API 5.0 | Product search (affiliate) | NO | LOW |
| Cloudflare R2 | Digital product storage | NO | LOW |
| Brevo | Email delivery | NO | LOW |
| Razorpay | Payment processing | NO | LOW |
| Cloudflare | DNS/CDN/SSL/WAF | NO | LOW |
| GitHub | Source code | NO | NONE |

---

## 12. ENVIRONMENT VARIABLES

### Variables that MUST CHANGE during migration:

| Variable | Change |
|----------|--------|
| DB_CONNECTION | mysql -> pgsql |
| DB_HOST | 127.0.0.1 -> Supabase host |
| DB_PORT | 3306 -> 5432 |
| DB_DATABASE | buzzinbeats -> Supabase DB name |
| DB_USERNAME | buzzinuser -> Supabase user |
| DB_PASSWORD | (current) -> Supabase password |
| DB_SOCKET | Remove entirely |

### Variables that stay the same:
APP_NAME, APP_ENV, APP_KEY, APP_DEBUG, APP_URL, LOG_CHANNEL, LOG_LEVEL,
MAIL_*, AMAZON_*, RAZORPAY_*, R2_*, CACHE_DRIVER, FILESYSTEM_DISK,
QUEUE_CONNECTION, SESSION_DRIVER, SESSION_LIFETIME

---

## 13. AWS DEPENDENCIES

### MUST MOVE:
- EC2 Instance (entire Laravel app)
- MariaDB on EC2 (database)

### CAN STAY on AWS:
- S3 Backup Bucket (optional)

### CAN BE REPLACED BY SUPABASE:
- MariaDB -> Supabase PostgreSQL
- S3 backup -> Supabase Storage
- File storage (partially) -> Supabase Storage

---

## 14. MIGRATION RISKS

### MySQL -> PostgreSQL

| Risk | Level |
|------|-------|
| SQL Syntax Differences | MEDIUM |
| Data Type Changes (TINYINT->BOOLEAN) | MEDIUM |
| Auto-Increment differences | MEDIUM |
| Raw Queries in AnalyticsController | MEDIUM |
| SQLite PRAGMA in BackupService | HIGH |
| ENUM columns | LOW (none found) |
| JSON columns | LOW |
| Soft Deletes | LOW |
| Foreign Keys | LOW |

### Component Risks

| Component | Risk | Reason |
|-----------|------|--------|
| Authentication | LOW | DB-agnostic |
| Payments | LOW | External service |
| File Storage | LOW | R2 is S3-compatible |
| Email | LOW | External service |
| Cron Jobs | LOW | DB-agnostic |
| Analytics | MEDIUM | Group-by queries differ |
| Backups | HIGH | SQLite-specific code |
| DNS/SSL | NONE | Cloudflare stays |

---

## 15. RECOMMENDED NEW ARCHITECTURE

```
                    +---------------------+
                    |   buzzinbeats.com    |
                    |   (Cloudflare DNS)   |
                    +----------+----------+
                               |
                    +----------v----------+
                    |   Cloudflare Proxy   |
                    +----------+----------+
                               |
                    +----------v----------+
                    |  New App Host        |
                    |  (Railway/Forge/VPS) |
                    +----------+----------+
                               |
              +----------------+----------------+
    +---------v--------+  +---v------+  +------v------+
    |  Nginx            |  |  PHP-FPM |  | Supabase    |
    |  (port 80/443)    |  |  8.3     |  | PostgreSQL  |
    +---------+--------+  +----------+  +-------------+
              |
    +---------v---------------------------+
    |  +----------+ +----------+ +------+ |
    |  | Local FS | | Supabase | | CF R2| |
    |  | (uploads)| | Storage  | |(digi)| |
    |  +----------+ +----------+ +------+ |
    +--------------------------------------+
```

---

## 16. MIGRATION PLAN

### Phase 1: Preparation
1. Full backup of EC2 (disk image + database dump)
2. Test locally with PostgreSQL (Laravel Sail/Docker)
3. Fix all MySQL-specific queries
4. Rewrite BackupService for PostgreSQL
5. Set up Supabase project

### Phase 2: Database Migration
1. Export MariaDB (mysqldump)
2. Convert MySQL -> PostgreSQL schema
3. Import into Supabase
4. Update .env
5. Test all queries

### Phase 3: Application Host Migration
1. Set up new host (Railway/Forge/VPS)
2. Deploy Laravel app
3. Configure Nginx + PHP-FPM
4. Update Cloudflare DNS
5. Test all functionality

### Phase 4: Storage Migration (Optional)
1. Migrate uploads to Supabase Storage
2. Update StorageServiceInterface
3. Test uploads/downloads

### Phase 5: Cleanup
1. Terminate EC2 (after verification)
2. Remove AWS S3 bucket (if unused)
3. Update deployment scripts

---

## 17. THINGS THAT MUST NOT BE CHANGED

| Item | Reason |
|------|--------|
| Cloudflare DNS | DNS/SSL/CDN/WAF |
| Cloudflare R2 | Digital product downloads |
| Razorpay credentials | Active subscriptions |
| Amazon PA-API credentials | Affiliate links |
| Brevo email config | OTP + notifications |
| APP_KEY | Session/token encryption |
| buzzinbeats.com domain | Brand identity |
| GitHub repository | Source code |
| All user data | Production-critical |
| Subscription/payment records | Financial data |
| Digital product records + R2 | Paid content |

---

## 18. SECURITY FINDINGS

### Issues Detected:
1. Hardcoded credentials in config/database.php.production
2. AWS keys in write-env.py
3. Brevo API key exposed in .env.production
4. Database password in aws/.env.production
5. APP_KEY visible in .env.production files
6. .env.production files tracked in git (not in .gitignore)

### Recommendations:
1. Remove .env.production from git history
2. Never hardcode credentials in config files
3. Use environment variable injection
4. Add .env.production to .gitignore
5. Rotate all exposed credentials after migration

---

## 19. FINAL DIFFICULTY ASSESSMENT

**Estimated Difficulty: MODERATE**

### Why Moderate:
- Laravel 10 is DB-agnostic (Eloquent works with PostgreSQL)
- No complex MySQL-specific features
- External services (email, payments, storage) stay as-is
- Cloudflare stays as-is
- Small database (likely < 1000 rows in most tables)

### Key Challenges:
1. BackupService rewrite (SQLite-specific code)
2. MySQL -> PostgreSQL data type conversion
3. AnalyticsController raw query adjustments
4. Credential rotation
5. Full testing pass

### What Makes It Easier:
- No queue workers or complex background processing
- File storage already on Cloudflare R2
- Standard Laravel auth (DB-agnostic)
- No real-time features
- Simple deployment pipeline
- Small team, small dataset

---

*Report generated by read-only infrastructure audit. No files were modified.*
