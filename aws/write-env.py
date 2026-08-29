#!/usr/bin/env python3
env_content = '''APP_NAME="BuzzinBeats Staging"
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
'''

with open('/var/www/buzzinbeats-staging/.env', 'w') as f:
    f.write(env_content)

print("OK: .env written")
