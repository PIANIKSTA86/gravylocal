import sqlite3

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name FROM _collections")
names = [row[0] for row in cursor.fetchall()]
print("Collection names:")
print(names)

conn.close()
