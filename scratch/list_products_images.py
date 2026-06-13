import sqlite3

db_path = r'c:\Users\JULIAN\Desktop\GravyLocal2.0\pb_data\data.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT id, name, image, base_price, active FROM products WHERE active=1 LIMIT 10")
rows = cursor.fetchall()

print("Products in DB with images:")
for r in rows:
    print(f"ID: {r[0]} | Name: {r[1]} | Image: {r[2]} | Price: {r[3]} | Active: {r[4]}")

conn.close()
