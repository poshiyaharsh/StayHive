import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

def run_migration():
    with connection.cursor() as cursor:
        # Check columns for inquiry
        cursor.execute("DESCRIBE inquiry")
        inq_cols = [c[0] for c in cursor.fetchall()]
        print("Existing inquiry cols:", inq_cols)
        
        if 'customer_id' not in inq_cols:
            print("Adding customer_id to inquiry...")
            cursor.execute("ALTER TABLE inquiry ADD COLUMN customer_id INT(11) NULL DEFAULT NULL AFTER id")
            try:
                cursor.execute("ALTER TABLE inquiry ADD CONSTRAINT fk_inquiry_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE SET NULL")
            except Exception as e:
                print("Note on foreign key:", e)
        
        if 'responded_at' not in inq_cols:
            print("Adding responded_at to inquiry...")
            cursor.execute("ALTER TABLE inquiry ADD COLUMN responded_at DATETIME NULL DEFAULT NULL AFTER response")

        # Check columns for complaint
        cursor.execute("DESCRIBE complaint")
        comp_cols = [c[0] for c in cursor.fetchall()]
        print("Existing complaint cols:", comp_cols)
        
        if 'description' not in comp_cols:
            print("Adding description to complaint...")
            cursor.execute("ALTER TABLE complaint ADD COLUMN description TEXT NULL DEFAULT NULL AFTER subject")
            
        print("Updating complaint status enum...")
        cursor.execute("ALTER TABLE complaint MODIFY COLUMN status ENUM('Pending','Open','In Progress','Resolved','Closed','Rejected') DEFAULT 'Pending'")
        
        print("Migration CP9 executed successfully!")

if __name__ == '__main__':
    run_migration()
