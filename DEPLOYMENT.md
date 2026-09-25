# StayHive Hospitality Platform — Production Deployment Guide

This guide provides end-to-end instructions for deploying StayHive to a production Linux server (Ubuntu 22.04/24.04 LTS) using **Nginx**, **Gunicorn**, **Django REST Framework**, and **MySQL 8.x**.

---

## 1. Production Architecture Overview

```
Internet (Clients / Browsers)
            ↓ (HTTPS : 443 / TLS 1.3)
      [ Nginx Reverse Proxy ]
      ├── /              → React SPA static build (/var/www/stayhive/frontend/dist)
      ├── /static/       → Django static files (/var/www/stayhive/backend/staticfiles)
      ├── /media/        → User uploads (/var/www/stayhive/backend/media)
      └── /api/          → Proxy Pass to Gunicorn WSGI Socket (127.0.0.1:8000)
                              ↓
                      [ Gunicorn Workers ]
                              ↓
                      [ Django 5 Application ]
                              ↓ (PyMySQL / TCP 3306)
                      [ MySQL 8.x Database ]
```

---

## 2. Server Prerequisites

- **Operating System**: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS
- **Hardware Minimum**: 2 vCPU, 4 GB RAM, 25 GB SSD storage
- **Network**: Public IPv4 address, Domain DNS pointing to server (`stayhive.com`, `api.stayhive.com`)
- **Firewall**: Ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open

---

## 3. System Packages Installation

```bash
# Update package repositories
sudo apt update && sudo apt upgrade -y

# Install Python, pip, virtualenv, and build dependencies
sudo apt install -y python3 python3-pip python3-venv python3-dev build-essential \
    libssl-dev libffi-dev default-libmysqlclient-dev pkg-config

# Install Node.js 20.x LTS and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx and Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Install and start MySQL Server
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
```

---

## 4. MySQL Production Configuration

Secure the MySQL instance and initialize the StayHive database:

```bash
# Run MySQL secure installation
sudo mysql_secure_installation

# Create StayHive database, dedicated user, and grant privileges
sudo mysql -u root -p
```

```sql
CREATE DATABASE stayhive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'stayhive_user'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_RANDOM_PASSWORD';
GRANT ALL PRIVILEGES ON stayhive.* TO 'stayhive_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Load the initial schema and seed data:

```bash
mysql -u stayhive_user -p stayhive < /var/www/stayhive/backend/database/schema.sql
mysql -u stayhive_user -p stayhive < /var/www/stayhive/backend/database/seed_data.sql
```

---

## 5. Clone Repository & Setup Permissions

```bash
# Create application root directory
sudo mkdir -p /var/www/stayhive
sudo chown -R $USER:$USER /var/www/stayhive

# Clone repository
git clone https://github.com/poshiyaharsh/StayHive.git /var/www/stayhive
cd /var/www/stayhive
```

---

## 6. Backend Configuration

### Create Python Virtual Environment & Install Dependencies

```bash
cd /var/www/stayhive/backend
python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### Configure Environment Variables

Create `/var/www/stayhive/backend/.env`:

```ini
DJANGO_SECRET_KEY=generate-a-strong-random-50-character-key-here
DJANGO_DEBUG=False
ALLOWED_HOSTS=stayhive.com,api.stayhive.com,127.0.0.1

CORS_ALLOWED_ORIGINS=https://stayhive.com
CSRF_TRUSTED_ORIGINS=https://stayhive.com,https://api.stayhive.com

DB_NAME=stayhive
DB_USER=stayhive_user
DB_PASSWORD=YOUR_STRONG_DATABASE_PASSWORD
DB_HOST=127.0.0.1
DB_PORT=3306

SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

THROTTLE_ANON_RATE=100/min
THROTTLE_USER_RATE=1000/min
THROTTLE_AUTH_RATE=20/min
THROTTLE_BURST_RATE=60/min
```

### Apply Migrations, Indexes, and Collect Static Files

```bash
# Run migrations
python manage.py migrate --noinput

# Apply CP11 composite performance indexes
python database/migration_cp11.py

# Collect static files for Nginx to serve directly
python manage.py collectstatic --noinput

# Run deployment check
python manage.py check --deploy
```

---

## 7. Frontend Production Build

```bash
cd /var/www/stayhive/frontend

# Create production environment
cat <<EOF > .env
VITE_API_BASE_URL=https://stayhive.com/api
EOF

# Install dependencies and build optimized bundle
npm ci
npm run build
```

The production assets will be built in `/var/www/stayhive/frontend/dist`.

---

## 8. Configure Gunicorn Systemd Service

Create `/etc/systemd/system/stayhive.service`:

```ini
[Unit]
Description=StayHive Django Gunicorn WSGI Daemon
After=network.target mysql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/stayhive/backend
ExecStart=/var/www/stayhive/backend/venv/bin/gunicorn \
    --config /var/www/stayhive/backend/gunicorn.conf.py \
    config.wsgi:application

Restart=always
RestartSec=5
StandardOutput=append:/var/log/stayhive/gunicorn_access.log
StandardError=append:/var/log/stayhive/gunicorn_error.log

EnvironmentFile=/var/www/stayhive/backend/.env

# Security sandbox
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
```

Create log directory and set permissions:

```bash
sudo mkdir -p /var/log/stayhive
sudo chown -R www-data:www-data /var/log/stayhive
sudo chown -R www-data:www-data /var/www/stayhive/backend/media
sudo chown -R www-data:www-data /var/www/stayhive/backend/staticfiles

sudo systemctl daemon-reload
sudo systemctl enable --now stayhive
sudo systemctl status stayhive
```

---

## 9. Configure Nginx

Copy the production Nginx config:

```bash
sudo cp /var/www/stayhive/deployment/nginx.conf /etc/nginx/sites-available/stayhive
sudo ln -s /etc/nginx/sites-available/stayhive /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration syntax
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 10. SSL / HTTPS Configuration (Let's Encrypt)

Obtain free, automated SSL certificates via Certbot:

```bash
sudo certbot --nginx -d stayhive.com -d www.stayhive.com -d api.stayhive.com
```

Certbot automatically configures automatic certificate renewal via a systemd timer. Test renewal with:

```bash
sudo certbot renew --dry-run
```

---

## 11. Health & Readiness Verification

Verify that all services are operational:

```bash
# 1. API Health Check
curl -I https://stayhive.com/api/health/
# Expected: HTTP/2 200, {"status": "ok", "service": "StayHive Hospitality Core"}

# 2. Database Readiness Check
curl -s https://stayhive.com/api/health/readiness/
# Expected: {"status": "ready", "database": "connected"}

# 3. Test Full Suite on Server
cd /var/www/stayhive/backend
source venv/bin/activate
python test_checkpoint11.py
# Expected: 79 PASSED, 0 FAILED
```

---

## 12. Automated Database Backup & Disaster Recovery Plan

### Daily Backup Script

Create `/usr/local/bin/backup_stayhive.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/var/backups/stayhive"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/stayhive_backup_$TIMESTAMP.sql.gz"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Perform consistent online backup using InnoDB single transaction
mysqldump --defaults-extra-file=/etc/mysql/stayhive_backup.cnf \
    --single-transaction \
    --quick \
    --routines \
    --triggers \
    stayhive | gzip -9 > "$FILENAME"

chmod 600 "$FILENAME"

# Delete backups older than retention window
find "$BACKUP_DIR" -type f -name "stayhive_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$TIMESTAMP] Backup successfully created: $FILENAME" >> /var/log/stayhive/backup.log
```

Create secure credentials file `/etc/mysql/stayhive_backup.cnf`:

```ini
[client]
user=stayhive_user
password=YOUR_STRONG_DATABASE_PASSWORD
host=127.0.0.1
```

Set permissions:

```bash
sudo chmod 600 /etc/mysql/stayhive_backup.cnf
sudo chmod 700 /usr/local/bin/backup_stayhive.sh
```

### Automated Cron Schedule

Add to root cron (`sudo crontab -e`):

```cron
# Run daily database backup at 2:00 AM
0 2 * * * /usr/local/bin/backup_stayhive.sh >> /var/log/stayhive/cron_backup.log 2>&1
```

### Database Restore Procedure

To restore from a backup:

```bash
# Decompress and restore into MySQL
gunzip < /var/backups/stayhive/stayhive_backup_20260925_020000.sql.gz | mysql -u stayhive_user -p stayhive
```

---

## 13. Security Hardening Checklist

- [x] `DEBUG=False` in production environment.
- [x] High-entropy `SECRET_KEY` loaded from environment variables.
- [x] HTTPS enforced with HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`).
- [x] Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- [x] Secure session and CSRF cookies (`SESSION_COOKIE_SECURE=True`, `CSRF_COOKIE_SECURE=True`).
- [x] Django Admin and DRF exceptions masked to prevent stack trace leaks.
- [x] Rate limiting active via DRF throttling (`anon: 100/min`, `user: 1000/min`, `auth: 20/min`).
- [x] Decimal arithmetic enforced on all financial transactions.
- [x] Double-booking prevented with `select_for_update` row-level database locks.
- [x] Role-based and object-level permissions enforced across all endpoints.
