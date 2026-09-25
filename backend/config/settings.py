import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------------------------------------------------------
# Core Security & Environment Settings
# -----------------------------------------------------------------------------
DEBUG = os.getenv('DJANGO_DEBUG', os.getenv('DEBUG', 'True')).lower() in ('true', '1', 't')

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY') or os.getenv('SECRET_KEY')
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = 'stayhive-development-fallback-secret-key-2026-unpredictable-luxury-token-7788'
    else:
        raise ValueError("DJANGO_SECRET_KEY environment variable must be set in production!")

ALLOWED_HOSTS_RAW = os.getenv('ALLOWED_HOSTS', '*' if DEBUG else 'stayhive.com,api.stayhive.com,localhost,127.0.0.1')
ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS_RAW.split(',') if h.strip()] if ALLOWED_HOSTS_RAW != '*' else ['*']

# Production Security Headers & SSL (only enforced when not DEBUG or when explicitly toggled)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'False').lower() in ('true', '1', 't')
    SESSION_COOKIE_SECURE = os.getenv('SESSION_COOKIE_SECURE', 'False').lower() in ('true', '1', 't')
    CSRF_COOKIE_SECURE = os.getenv('CSRF_COOKIE_SECURE', 'False').lower() in ('true', '1', 't')
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    hsts_seconds = int(os.getenv('SECURE_HSTS_SECONDS', '0'))
    if hsts_seconds > 0:
        SECURE_HSTS_SECONDS = hsts_seconds
        SECURE_HSTS_INCLUDE_SUBDOMAINS = True
        SECURE_HSTS_PRELOAD = True

# -----------------------------------------------------------------------------
# Installed Applications
# -----------------------------------------------------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # StayHive modular apps
    'apps.core',
    'apps.accounts',
    'apps.hotels',
    'apps.rooms',
    'apps.bookings',
    'apps.customers',
    'apps.staff',
    'apps.restaurant',
    'apps.services',
    'apps.housekeeping',
    'apps.billing',
    'apps.offers',
    'apps.cancellations',
    'apps.feedback',
    'apps.complaints',
    'apps.inquiries',
    'apps.notifications',
    'apps.analytics',
    'apps.reception',
    'apps.reports',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

AUTH_USER_MODEL = 'core.User'

# -----------------------------------------------------------------------------
# MySQL Database Configuration
# -----------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME') or os.getenv('DATABASE_NAME') or 'stayhive',
        'USER': os.getenv('DB_USER') or os.getenv('DATABASE_USER') or 'root',
        'PASSWORD': os.getenv('DB_PASSWORD') if os.getenv('DB_PASSWORD') is not None else os.getenv('DATABASE_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST') or os.getenv('DATABASE_HOST') or '127.0.0.1',
        'PORT': os.getenv('DB_PORT') or os.getenv('DATABASE_PORT') or '3306',
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        }
    }
}

# -----------------------------------------------------------------------------
# Django REST Framework Configuration
# -----------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': None,
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': os.getenv('THROTTLE_ANON', '100/min'),
        'user': os.getenv('THROTTLE_USER', '1000/min'),
        'auth': os.getenv('THROTTLE_AUTH', '20/min'),
        'burst': os.getenv('THROTTLE_BURST', '60/min'),
    }
}

# -----------------------------------------------------------------------------
# Simple JWT Settings
# -----------------------------------------------------------------------------
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(os.getenv('JWT_ACCESS_EXPIRATION_MINUTES', 120))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(os.getenv('JWT_REFRESH_EXPIRATION_DAYS', 7))),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# -----------------------------------------------------------------------------
# CORS & CSRF Configuration
# -----------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True

default_cors = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_cors = os.getenv('CORS_ALLOWED_ORIGINS')
if env_cors:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in env_cors.split(',') if o.strip()]
else:
    CORS_ALLOWED_ORIGINS = default_cors

default_csrf = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
env_csrf = os.getenv('CSRF_TRUSTED_ORIGINS')
if env_csrf:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in env_csrf.split(',') if o.strip()]
else:
    CSRF_TRUSTED_ORIGINS = default_csrf

# -----------------------------------------------------------------------------
# Internationalization & Static / Media Files
# -----------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -----------------------------------------------------------------------------
# Structured Production Logging
# -----------------------------------------------------------------------------
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOGS_DIR, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} [{name}:{lineno}] {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOGS_DIR, 'stayhive.log'),
            'maxBytes': 1024 * 1024 * 15,  # 15 MB
            'backupCount': 5,
            'formatter': 'verbose',
            'encoding': 'utf-8',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'django.security': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
