import sqlite3
import json

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get branches
cursor.execute("SELECT id, name, code, active FROM branches")
print("Branches in system:")
for b in cursor.fetchall():
    print(f"  ID: {b[0]} | Name: {b[1]} | Code: {b[2]} | Active: {b[3]}")

# Get users and default_branch_id
cursor.execute("SELECT id, email, role, default_branch_id, allowed_branches FROM users")
print("\nUsers in system:")
for u in cursor.fetchall():
    print(f"  ID: {u[0]} | Email: {u[1]} | Role: {u[2]} | Default Branch: {u[3]} | Allowed Branches: {u[4]}")

conn.close()
