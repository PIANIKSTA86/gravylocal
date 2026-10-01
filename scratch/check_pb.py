import sqlite3

conn = sqlite3.connect('pb_data/data.db')
c = conn.cursor()

c.execute("SELECT key, value FROM settings WHERE key='inventory_settings_v1'")
print('Current inventory_settings_v1:', c.fetchall())

c.execute("""
SELECT m.date, m.mov_type, m.number, m.warehouse_id, m.dest_warehouse_id, l.qty, l.unit_cost, m.id, l.id
FROM inventory_movements m
JOIN inventory_movement_lines l ON l.movement_id = m.id
WHERE l.product_id = 'qv46yr2j9xkv7cp'
ORDER BY m.date, m.number
""")
for r in c.fetchall():
    print(r)
