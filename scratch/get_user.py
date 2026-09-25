import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

cursor.execute("SELECT id, email, role FROM users LIMIT 5")
users = cursor.fetchall()
print("=== USERS ===")
for u in users:
    print(u)

conn.close()
