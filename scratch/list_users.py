import sqlite3

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(users)")
cols = cursor.fetchall()
print("Columns of users table:")
for col in cols:
    print(col)

cursor.execute("SELECT id, email, role, active FROM users")
rows = cursor.fetchall()
print("\nUsers in DB:")
for r in rows:
    print(r)

conn.close()
