import sqlite3

con = sqlite3.connect('pb_data/data.db')
cur = con.cursor()

print("--- INVENTORY_MOVEMENT_LINES COLS ---")
cur.execute("PRAGMA table_info(inventory_movement_lines)")
for c in cur.fetchall():
    print(c)

print("\n--- INVENTORY_MOVEMENTS COLS ---")
cur.execute("PRAGMA table_info(inventory_movements)")
for c in cur.fetchall():
    print(c)
