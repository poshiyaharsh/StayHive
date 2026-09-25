"""
StayHive — Checkpoint 11 Database Migration
Applies safe, performant indexes to MySQL 8.x for CP1-CP10 query optimizations.
Idempotent and safe to run multiple times without schema degradation.
"""
import os
import sys
import django
from django.db import connection

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()


def get_existing_indexes(cursor, table_name):
    cursor.execute(f"SHOW INDEX FROM {table_name}")
    return set(row[2] for row in cursor.fetchall())


def run_migration():
    print("Applying Checkpoint 11 Database Performance Indexes...")
    indexes_to_create = [
        ("food_order", "idx_fo_status_time", "status, order_time"),
        ("service_request", "idx_sr_status_time", "status, requested_at"),
        ("housekeeping_task", "idx_ht_status", "status"),
        ("invoice", "idx_invoice_status_date", "status, issue_date"),
        ("refund", "idx_refund_status_date", "status, processed_at"),
        ("feedback", "idx_fb_rating_created", "rating, created_at"),
    ]

    with connection.cursor() as cursor:
        for table, index_name, columns in indexes_to_create:
            existing = get_existing_indexes(cursor, table)
            if index_name in existing:
                print(f"  [SKIP] Index '{index_name}' already exists on '{table}'.")
            else:
                try:
                    sql = f"CREATE INDEX {index_name} ON {table} ({columns});"
                    cursor.execute(sql)
                    print(f"  [CREATED] Index '{index_name}' on '{table}' ({columns}).")
                except Exception as e:
                    print(f"  [ERROR] Failed to create index '{index_name}' on '{table}': {e}")

    print("Checkpoint 11 Migration Complete.")


if __name__ == '__main__':
    run_migration()
