import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def run_migration():
    with connection.cursor() as cursor:
        print("Checking and adding safe indexes for CP10...")
        
        indexes_to_create = [
            ("notification", "idx_notif_user_read", "CREATE INDEX idx_notif_user_read ON notification(user_id, is_read)"),
            ("notification", "idx_notif_user_created", "CREATE INDEX idx_notif_user_created ON notification(user_id, created_at)"),
            ("booking", "idx_booking_status_dates", "CREATE INDEX idx_booking_status_dates ON booking(status, check_in_date, check_out_date)"),
            ("payment", "idx_payment_status_date", "CREATE INDEX idx_payment_status_date ON payment(status, payment_date)"),
            ("complaint", "idx_complaint_status_created", "CREATE INDEX idx_complaint_status_created ON complaint(status, created_at)"),
            ("inquiry", "idx_inquiry_status_created", "CREATE INDEX idx_inquiry_status_created ON inquiry(status, created_at)"),
        ]
        
        for table, idx_name, sql in indexes_to_create:
            cursor.execute(f"SHOW INDEX FROM {table} WHERE Key_name = %s", [idx_name])
            if cursor.fetchone():
                print(f"Index {idx_name} on {table} already exists.")
            else:
                try:
                    cursor.execute(sql)
                    print(f"Created index {idx_name} on {table}.")
                except Exception as e:
                    print(f"Note on {idx_name}: {e}")

        print("CP10 index optimizations completed successfully!")

if __name__ == '__main__':
    run_migration()
