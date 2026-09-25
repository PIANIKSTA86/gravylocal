import sqlite3

conn = sqlite3.connect('pb_data/data.db')
cursor = conn.cursor()

try:
    cursor.execute("SELECT id, email FROM _superusers")
    print("Superusers:", cursor.fetchall())
except Exception as e:
    print("Error querying _superusers:", e)

try:
    cursor.execute("SELECT id, email FROM _admins")
    print("Admins:", cursor.fetchall())
except Exception as e:
    print("Error querying _admins:", e)

conn.close()
