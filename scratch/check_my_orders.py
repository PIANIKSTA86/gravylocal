import sqlite3
import json

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get columns of sales_orders
cursor.execute("PRAGMA table_info(sales_orders)")
cols = [col[1] for col in cursor.fetchall()]
print(f"sales_orders columns: {cols}")

# Get all sales orders
cursor.execute("SELECT * FROM sales_orders ORDER BY created DESC")
rows = cursor.fetchall()
print(f"\nTotal sales orders: {len(rows)}")
for r in rows[:10]:
    order = dict(zip(cols, r))
    print(f"  Number: {order.get('number')} | Date: {order.get('date')} | Branch ID: {order.get('branch_id')} | User ID: {order.get('user_id')} | Total: {order.get('total')} | ID: {order.get('id')}")

conn.close()
