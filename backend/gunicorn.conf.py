"""
StayHive Hospitality Platform — Gunicorn Production Configuration
Run with: gunicorn -c gunicorn.conf.py config.wsgi:application
"""
import multiprocessing
import os

# Server socket
bind = os.getenv("GUNICORN_BIND", "127.0.0.1:8000")
backlog = 2048

# Worker processes: recommended 2-4 per CPU core for I/O bound workloads
workers = int(os.getenv("GUNICORN_WORKERS", min(multiprocessing.cpu_count() * 2 + 1, 8)))
worker_class = "gthread"
threads = int(os.getenv("GUNICORN_THREADS", 2))
worker_connections = 1000
timeout = 60
keepalive = 5

# Process naming
proc_name = "stayhive_backend"

# Logging
accesslog = os.getenv("GUNICORN_ACCESS_LOG", "-")  # stdout for container/systemd, or filename
errorlog = os.getenv("GUNICORN_ERROR_LOG", "-")
loglevel = os.getenv("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sµs'

# Security & limits
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190

# Graceful restarts
graceful_timeout = 30
max_requests = 1000
max_requests_jitter = 50
