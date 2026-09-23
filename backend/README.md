# StayHive Backend — Django REST Framework & MySQL 8.x / MariaDB

The StayHive backend powers a high-performance hotel management and booking engine built with **Python 3.12**, **Django 5.2**, **Django REST Framework (DRF)**, and **PyMySQL**.

---

## 🏛️ Application Architecture

```
backend/
├── manage.py
├── requirements.txt
├── config/
│   ├── settings.py           # Database, CORS, JWT, and App configs
│   ├── urls.py               # Master API routing table
│   ├── wsgi.py
│   └── __init__.py           # PyMySQL driver initialization & MariaDB patches
├── database/
│   ├── schema.sql            # 33-table InnoDB relational schema
│   └── seed_data.sql         # Luxury properties, rooms, users & menu seed data
└── apps/
    ├── core/                 # 33 Django Models & common response utilities
    ├── accounts/             # JWT Auth, login, me endpoints
    ├── hotels/               # Multi-property & facilities management
    ├── rooms/                # Room inventory, types, amenities & status
    ├── bookings/             # Booking engine, check-in, check-out
    ├── customers/            # Guest profiles & loyalty tiers
    ├── staff/                # Staff directory, shifts & departments
    ├── restaurant/           # Dining menus, food orders & KOT
    ├── services/             # Spa, airport transfer & service requests
    ├── housekeeping/         # Turnover sanitation tasks & status
    ├── billing/              # GST Invoices, payments & methods
    ├── offers/               # Promotional vouchers & packages
    ├── cancellations/        # Cancellation requests & refunds
    ├── feedback/             # Guest reviews & manager replies
    ├── complaints/           # Guest complaints & resolutions
    ├── inquiries/            # Customer inquiries & helpdesk
    ├── notifications/        # User notification alerts
    └── analytics/            # Revenue, occupancy, RevPAR & ADR metrics
```

---

## ⚙️ MariaDB / MySQL Configuration

In `config/__init__.py`, PyMySQL is registered and compatibility patches are enabled for XAMPP MariaDB 10.4:

```python
import pymysql

pymysql.version_info = (2, 2, 1, "final", 0)
pymysql.install_as_MySQLdb()

# MariaDB 10.4 compatibility patches
from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

from django.db.backends.mysql.features import DatabaseFeatures
DatabaseFeatures.can_return_columns_from_insert = False
DatabaseFeatures.can_return_rows_from_bulk_insert = False
```

---

## 🔑 Authentication & Role Permissions

StayHive utilizes **JSON Web Tokens (SimpleJWT)**:
- **Header**: `Authorization: Bearer <access_token>`
- **Access Token Lifetime**: 1 Day
- **Refresh Token Lifetime**: 7 Days

---

## 🧪 Running Unit Tests & Verification

Verify that all models and API endpoints are functional:

```bash
# Activate virtual environment
venv\Scripts\activate

# Run system check
python manage.py check

# Run dev server
python manage.py runserver 127.0.0.1:8000
```
